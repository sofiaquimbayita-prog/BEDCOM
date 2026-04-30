import json
import threading
from decimal import Decimal
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.generic import ListView, View
from django.utils import timezone
from datetime import datetime
from django.core.mail import send_mail
from django.conf import settings

def safe_date_str(value):
    if value is None:
        return None
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value).strftime('%Y-%m-%d')
        except:
            return None
    if hasattr(value, 'strftime'):
        return value.strftime('%Y-%m-%d')
    return str(value)

from ...models import pedido, detalle_pedido, producto, cliente, pago, Notificacion, usuario, historial_acciones


# ─────────────────────────────────────────────
# HELPER: resolver cliente desde los datos enviados
# ─────────────────────────────────────────────
def _resolver_cliente(data):
    cli_id = data.get('cliente_id')
    if cli_id:
        return get_object_or_404(cliente, pk=cli_id)

    nombre   = data.get('cliente_nombre', '').strip()
    telefono = data.get('cliente_telefono', '').strip() or '—'
    obj, creado = cliente.objects.get_or_create(
        nombre=nombre,
        defaults={'telefono': telefono, 'direccion': '—', 'estado': True}
    )
    if not creado:
        actualizado = False
        if telefono != '—' and obj.telefono != telefono:
            obj.telefono = telefono
            actualizado = True
        if actualizado:
            obj.save()
    return obj


# ─────────────────────────────────────────────
# HELPER: serializar pedido completo a dict
# ─────────────────────────────────────────────
def _pedido_to_dict(obj):
    return {
        'id': obj.id,
        'fecha': obj.fecha.strftime('%d/%m/%Y %H:%M'),
        'estado': obj.estado,
        'total': str(obj.total),
        'fecha_entrega': safe_date_str(obj.fecha_entrega),
        'abono': str(obj.abono or 0),
        'cliente_id': obj.cliente.id,
        'cliente_nombre': obj.cliente.nombre,
        'cliente_telefono': obj.cliente.telefono,
        'detalles': [
            {
                'producto_id': d.producto.id if d.producto else None,
                'producto_nombre': d.producto.nombre if d.producto else 'Producto Personalizado',
                'cantidad': d.cantidad,
                'precio_unitario': str(d.precio_unitario),
                'sub_total': str(d.sub_total),
                'observaciones': d.observaciones or '',
                'es_personalizado': d.es_personalizado,
                'especificaciones': d.especificaciones or '',
            }
            for d in obj.detalles.select_related('producto').all()
        ],
        'pagos': [
            {
                'fecha': p.fecha_pago.strftime('%d/%m/%Y'),
                'monto': str(p.monto),
            }
            for p in obj.pago_set.all().order_by('-fecha_pago')
        ]
    }


# ─────────────────────────────────────────────
# LISTA PRINCIPAL (renderiza la página)
# ─────────────────────────────────────────────
class PedidoListView(ListView):
    model = pedido
    template_name = 'pedido/pedido_list.html'
    context_object_name = 'pedidos'
    ordering = ['-fecha']

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        
        # Serialize clients to JSON
        clientes_qs = cliente.objects.filter(estado=True).order_by('nombre')
        ctx['clientes'] = clientes_qs
        clientes_list = [{'id': c.id, 'nombre': c.nombre, 'telefono': c.telefono, 'direccion': c.direccion} for c in clientes_qs]
        ctx['clientes_json'] = clientes_list
        
        # Serialize products to JSON
        productos_qs = list(producto.objects.filter(estado=True).order_by('nombre').values('id', 'nombre', 'precio', 'stock'))
        # Convert Decimals to float for JSON
        for p in productos_qs:
            if isinstance(p['precio'], Decimal):
                p['precio'] = float(p['precio'])
        ctx['productos'] = productos_qs
        ctx['productos_json'] = productos_qs
        
        ctx['today'] = timezone.now().date().isoformat()
        return ctx


# ─────────────────────────────────────────────
# API: obtener detalle de un pedido (modal ver/editar)
# ─────────────────────────────────────────────
class PedidoDetailView(View):
    def get(self, request, pk, *args, **kwargs):
        obj = get_object_or_404(pedido, pk=pk)
        return JsonResponse({'ok': True, 'pedido': _pedido_to_dict(obj)})


# ─────────────────────────────────────────────
# API: crear pedido vía AJAX (POST JSON)
# ─────────────────────────────────────────────
class PedidoCreateView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            items = data.get('items', [])

            if not items:
                return JsonResponse({'ok': False, 'error': 'Agrega al menos un producto.'})

            with transaction.atomic():
                cli = _resolver_cliente(data)

                if pedido.objects.filter(cliente=cli, estado="Pendiente").exists():
                    return JsonResponse({
                        'ok': False,
                        'error': 'El cliente ya tiene un pedido pendiente.'
                    })

                fecha_entrega = data.get('fecha_entrega')
                abono = Decimal(str(data.get('abono', 0)))

                nuevo_pedido = pedido.objects.create(
                    cliente=cli,
                    total=0,
                    abono=abono,
                    fecha_entrega=fecha_entrega if fecha_entrega else None
                )

                total = Decimal('0')
                for item in items:
                    prod_id = item.get('producto_id')
                    cantidad = int(item['cantidad'])
                    es_personalizado = item.get('es_personalizado') in [True, 'true', '1']
                    especificaciones = item.get('especificaciones', '')
                    
                    if prod_id:
                        prod = get_object_or_404(producto, pk=prod_id)
                        precio_unit = prod.precio
                        if not es_personalizado:
                            if prod.stock < cantidad:
                                raise Exception(f"Stock insuficiente para «{prod.nombre}»")
                            prod.stock -= cantidad
                            prod.save()
                    else:
                        if not es_personalizado:
                            raise Exception("Debe especificar un producto del catálogo o marcarlo como personalizado.")
                        prod = None
                        precio_unit = Decimal(str(item.get('precio_unitario', 0)))

                    sub = precio_unit * cantidad
                    total += sub

                    detalle_pedido.objects.create(
                        pedido=nuevo_pedido,
                        producto=prod,
                        cantidad=cantidad,
                        precio_unitario=precio_unit,
                        sub_total=sub,
                        observaciones=item.get('observaciones', ''),
                        es_personalizado=es_personalizado,
                        especificaciones=especificaciones
                    )

                nuevo_pedido.total = total
                
                # Estado logic based on abono
                if nuevo_pedido.abono >= total:
                    nuevo_pedido.estado = 'Listo para Despacho'
                elif nuevo_pedido.abono >= (total * Decimal('0.5')):
                    nuevo_pedido.estado = 'En Fabricación'

                nuevo_pedido.save()

                # Registrar el abono inicial como registro pago
                # para que aparezca en el historial de pagos del cliente
                if abono > 0:
                    pago.objects.create(pedido=nuevo_pedido, monto=abono)

            # --- HISTORIAL Y CORREOS ---
            if request.user.is_authenticated:
                historial_acciones.objects.create(
                    modulo='pedidos',
                    tipo_accion='crear',
                    descripcion=f'Creó el pedido #{nuevo_pedido.id} para {cli.nombre}',
                    usuario=request.user
                )

            # 2. Correo al Cliente (Asíncrono)
            if cli.email:
                def send_pedido_email(pedido_id, c_nombre, c_email, p_total, p_abono, p_saldo):
                    try:
                        mensaje = (
                            f"Hola {c_nombre},\n\n"
                            f"¡Gracias por elegir BEDCOM!\n"
                            f"Tu pedido #{pedido_id} ha sido registrado exitosamente en nuestro sistema.\n\n"
                            f"Detalles del Pedido:\n"
                            f"- Total: ${p_total:,.0f} COP\n"
                            f"- Abono Inicial: ${p_abono:,.0f} COP\n"
                            f"- Saldo Pendiente: ${p_saldo:,.0f} COP\n\n"
                            f"Te notificaremos cuando tu pedido esté listo para despacho.\n\n"
                            f"Atentamente,\nEl equipo de BEDCOM"
                        )
                        send_mail(
                            subject=f'Confirmación de Pedido #{pedido_id} - BEDCOM',
                            message=mensaje,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[c_email],
                            fail_silently=True
                        )
                    except Exception as e:
                        print("Error enviando correo de pedido:", e)
                
                threading.Thread(
                        target=send_pedido_email,
                        args=(
                            nuevo_pedido.id,
                            cli.nombre,
                            cli.email,
                            nuevo_pedido.total,
                            nuevo_pedido.abono,
                            nuevo_pedido.saldo_pendiente
                        ),
                        daemon=True  
                    ).start()

            return JsonResponse({
                'ok': True,
                'message': f'Pedido #{nuevo_pedido.id} creado con éxito.',
                'pedido': _pedido_to_dict(nuevo_pedido)
            })

        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# API: editar pedido vía AJAX (POST JSON)
# ─────────────────────────────────────────────
class PedidoUpdateView(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            data = json.loads(request.body)
            items = data.get('items', [])

            if not items:
                return JsonResponse({'ok': False, 'error': 'Agrega al menos un producto.'})

            with transaction.atomic():
                obj_pedido = get_object_or_404(pedido, pk=pk)
                fecha_entrega = data.get('fecha_entrega')
                abono_nuevo = Decimal(str(data.get('abono', 0)))
                abono_anterior = obj_pedido.abono or Decimal('0')

                obj_pedido.abono = abono_nuevo
                if fecha_entrega:
                    obj_pedido.fecha_entrega = fecha_entrega

                # ✅ BUG CORREGIDO: si el abono cambió, actualizar también el
                # primer registro en la tabla pago para mantener el historial sincronizado.
                if abono_nuevo != abono_anterior:
                    primer_pago = obj_pedido.pago_set.order_by('fecha_pago').first()
                    if primer_pago:
                        primer_pago.monto = abono_nuevo
                        primer_pago.save()
                    elif abono_nuevo > 0:
                        pago.objects.create(pedido=obj_pedido, monto=abono_nuevo)

                # Restaurar stock de los detalles actuales (solo si no eran personalizados)
                for d in obj_pedido.detalles.select_related('producto').all():
                    if d.producto and not d.es_personalizado:
                        d.producto.stock += d.cantidad
                        d.producto.save()

                obj_pedido.detalles.all().delete()

                cli = _resolver_cliente(data)
                obj_pedido.cliente = cli

                total = Decimal('0')
                for item in items:
                    prod_id = item.get('producto_id')
                    cantidad = int(item['cantidad'])
                    es_personalizado = item.get('es_personalizado') in [True, 'true', '1']
                    especificaciones = item.get('especificaciones', '')
                    
                    if prod_id:
                        prod = get_object_or_404(producto, pk=prod_id)
                        precio_unit = prod.precio
                        if not es_personalizado:
                            if prod.stock < cantidad:
                                raise Exception(f"Stock insuficiente para «{prod.nombre}»")
                            prod.stock -= cantidad
                            prod.save()
                    else:
                        if not es_personalizado:
                            raise Exception("Debe especificar un producto del catálogo o marcarlo como personalizado.")
                        prod = None
                        precio_unit = Decimal(str(item.get('precio_unitario', 0)))

                    sub = precio_unit * cantidad
                    total += sub

                    detalle_pedido.objects.create(
                        pedido=obj_pedido,
                        producto=prod,
                        cantidad=cantidad,
                        precio_unitario=precio_unit,
                        sub_total=sub,
                        observaciones=item.get('observaciones', ''),
                        es_personalizado=es_personalizado,
                        especificaciones=especificaciones
                    )

                obj_pedido.total = total
                
                # Update status if pending
                if obj_pedido.estado in ['Pendiente', 'En Fabricación']:
                    if obj_pedido.abono >= total:
                        obj_pedido.estado = 'Listo para Despacho'
                    elif obj_pedido.abono >= (total * Decimal('0.5')):
                        obj_pedido.estado = 'En Fabricación'
                    elif obj_pedido.abono < (total * Decimal('0.5')):
                        obj_pedido.estado = 'Pendiente'
                        
                obj_pedido.save()

                if request.user.is_authenticated:
                    historial_acciones.objects.create(
                        modulo='pedidos',
                        tipo_accion='editar',
                        descripcion=f'Editó el pedido #{obj_pedido.id}',
                        usuario=request.user
                    )

            return JsonResponse({
                'ok': True,
                'message': f'Pedido #{obj_pedido.id} actualizado correctamente.',
                'pedido': _pedido_to_dict(obj_pedido)
            })

        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# API: cambiar estado del pedido
# ─────────────────────────────────────────────
class PedidoStateChangeView(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            obj_pedido = get_object_or_404(pedido, pk=pk)
            nuevo_estado = request.POST.get('nuevo_estado')

            if not nuevo_estado:
                return JsonResponse({'ok': False, 'error': 'Debe enviar el nuevo estado.'})

            with transaction.atomic():
                if nuevo_estado == 'Anulado' and obj_pedido.estado != 'Anulado':
                    obj_pedido.estado = 'Anulado'
                    obj_pedido.save()
                    for item in obj_pedido.detalles.select_related('producto').all():
                        item.producto.stock += item.cantidad
                        item.producto.save()

                elif obj_pedido.estado == 'Anulado' and nuevo_estado != 'Anulado':
                    for item in obj_pedido.detalles.select_related('producto').all():
                        if item.producto.stock < item.cantidad:
                            raise Exception(
                                f"No hay stock suficiente para «{item.producto.nombre}»"
                            )
                    obj_pedido.estado = nuevo_estado
                    obj_pedido.save()
                    for item in obj_pedido.detalles.select_related('producto').all():
                        item.producto.stock -= item.cantidad
                        item.producto.save()

                    obj_pedido.estado = nuevo_estado
                    obj_pedido.save()

                if request.user.is_authenticated:
                    historial_acciones.objects.create(
                        modulo='pedidos',
                        tipo_accion='editar',
                        descripcion=f'Cambió estado del pedido #{obj_pedido.id} a {nuevo_estado}',
                        usuario=request.user
                    )

            return JsonResponse({
                'ok': True,
                'message': f'Estado del pedido #{pk} actualizado a {nuevo_estado}.',
                'nuevo_estado': nuevo_estado
            })

        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# API: registrar abono adicional en un pedido
# ─────────────────────────────────────────────
class PagoUpdateView(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            data = json.loads(request.body)
            monto = Decimal(str(data.get('monto', 0)))

            if monto <= 0:
                return JsonResponse({'ok': False, 'error': 'El monto debe ser mayor a 0.'})

            obj_pedido = get_object_or_404(pedido, pk=pk)
            saldo_pendiente = obj_pedido.saldo_pendiente

            if monto > saldo_pendiente:
                return JsonResponse({
                    'ok': False,
                    'error': f'El abono no puede exceder el saldo pendiente (${saldo_pendiente}).'
                })

            with transaction.atomic():
                # Crear registro en tabla pago (para historial)
                pago.objects.create(pedido=obj_pedido, monto=monto)

                # Actualizar abono en pedido
                obj_pedido.abono = (obj_pedido.abono or Decimal('0')) + monto
                obj_pedido.save()

                # ✅ BUG CORREGIDO: recalcular saldo_pendiente DESPUÉS de guardar
                obj_pedido.refresh_from_db()
                if obj_pedido.saldo_pendiente <= 0:
                    if obj_pedido.estado in ['Pendiente', 'En Fabricación']:
                        obj_pedido.estado = 'Listo para Despacho'
                elif obj_pedido.abono >= (obj_pedido.total * Decimal('0.5')):
                    if obj_pedido.estado == 'Pendiente':
                        obj_pedido.estado = 'En Fabricación'
                obj_pedido.save()

                if request.user.is_authenticated:
                    historial_acciones.objects.create(
                        modulo='pedidos',
                        tipo_accion='editar',
                        descripcion=f'Registró abono de ${monto} al pedido #{obj_pedido.id}',
                        usuario=request.user
                    )

            return JsonResponse({
                'ok': True,
                'message': f'Pago de ${monto} registrado. Nuevo saldo: ${obj_pedido.saldo_pendiente}',
                'pedido': _pedido_to_dict(obj_pedido)
            })

        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# Utilidad: validar un pedido antes de crearlo
# ─────────────────────────────────────────────
def validar_pedido(items, abono, total):
    MAX_PRODUCTOS_POR_PEDIDO = 150
    errores = []

    if not items:
        errores.append("El pedido debe tener al menos un producto")

    if len(items) > MAX_PRODUCTOS_POR_PEDIDO:
        errores.append(f"Máximo {MAX_PRODUCTOS_POR_PEDIDO} productos por pedido")

    if abono < (total * 0.5):
        errores.append("El abono debe ser al menos el 50% del total")

    if abono > total:
        errores.append("El abono no puede ser mayor al total")

    productos_ids = [item['producto_id'] for item in items]
    if len(productos_ids) != len(set(productos_ids)):
        errores.append("No se puede repetir productos")

    return errores