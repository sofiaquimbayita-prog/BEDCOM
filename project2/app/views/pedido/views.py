import json
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.generic import ListView, View
from django.utils import timezone

from ...models import pedido, detalle_pedido, producto, cliente, pago


# ─────────────────────────────────────────────
# HELPER: resolver cliente desde los datos enviados
# ─────────────────────────────────────────────
def _resolver_cliente(data):
    """
    Busca el cliente por el ID enviado desde el frontend.
    Si por alguna razón no viene el ID, intenta buscar por nombre
    y lo crea si no existe.
    """
    # BUG CORREGIDO: antes se usaba get_or_create() sin campo de búsqueda,
    # lo que causaba MultipleObjectsReturned con más de un cliente en BD.
    # Ahora se usa directamente el cliente_id que envía el frontend.
    cli_id = data.get('cliente_id')
    if cli_id:
        return get_object_or_404(cliente, pk=cli_id)

    # Fallback: crear/obtener por nombre (solo si no viene ID)
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
        # BUG CORREGIDO: clave 'fecha_entrega' estaba duplicada
        'fecha_entrega': obj.fecha_entrega.isoformat() if obj.fecha_entrega else None,
        'abono': str(obj.abono or 0),
        'cliente_id': obj.cliente.id,
        'cliente_nombre': obj.cliente.nombre,
        'cliente_telefono': obj.cliente.telefono,
        'detalles': [
            {
                'producto_id': d.producto.id,
                'producto_nombre': d.producto.nombre,
                'cantidad': d.cantidad,
                'precio_unitario': str(d.precio_unitario),
                'sub_total': str(d.sub_total),
                'observaciones': d.observaciones or '',
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
        ctx['clientes'] = cliente.objects.filter(estado=True).order_by('nombre')
        ctx['productos'] = producto.objects.filter(estado=True).order_by('nombre').values(
            'id', 'nombre', 'precio', 'stock'
        )
        # BUG CORREGIDO: el template usa min="{{ today }}" pero la vista no lo pasaba
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
                abono = float(data.get('abono', 0))
                nuevo_pedido = pedido.objects.create(
                    cliente=cli,
                    total=0,
                    abono=abono,
                    fecha_entrega=fecha_entrega if fecha_entrega else None
                )

                total = 0
                for item in items:
                    prod = get_object_or_404(producto, pk=item['producto_id'])
                    cantidad = int(item['cantidad'])
                    precio_unit = prod.precio

                    if prod.stock < cantidad:
                        raise Exception(
                            f"Stock insuficiente para «{prod.nombre}» (disponible: {prod.stock})"
                        )

                    sub = precio_unit * cantidad
                    total += sub

                    detalle_pedido.objects.create(
                        pedido=nuevo_pedido,
                        producto=prod,
                        cantidad=cantidad,
                        precio_unitario=precio_unit,
                        sub_total=sub,
                        observaciones=item.get('observaciones', '')
                    )

                    prod.stock -= cantidad
                    prod.save()

                nuevo_pedido.total = total
                nuevo_pedido.save()

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
                abono = float(data.get('abono', 0))
                obj_pedido.abono = abono
                if fecha_entrega:
                    obj_pedido.fecha_entrega = fecha_entrega

                # Restaurar stock de los detalles actuales
                for d in obj_pedido.detalles.select_related('producto').all():
                    d.producto.stock += d.cantidad
                    d.producto.save()

                obj_pedido.detalles.all().delete()

                cli = _resolver_cliente(data)
                obj_pedido.cliente = cli

                total = 0
                for item in items:
                    prod = get_object_or_404(producto, pk=item['producto_id'])
                    cantidad = int(item['cantidad'])
                    precio_unit = prod.precio

                    if prod.stock < cantidad:
                        raise Exception(
                            f"Stock insuficiente para «{prod.nombre}» (disponible: {prod.stock})"
                        )

                    sub = precio_unit * cantidad
                    total += sub

                    detalle_pedido.objects.create(
                        pedido=obj_pedido,
                        producto=prod,
                        cantidad=cantidad,
                        precio_unitario=precio_unit,
                        sub_total=sub,
                        observaciones=item.get('observaciones', '')
                    )

                    prod.stock -= cantidad
                    prod.save()

                obj_pedido.total = total
                obj_pedido.save()

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
                # BUG CORREGIDO: se usaba detalle_pedido_set que no existe.
                # El related_name correcto definido en el modelo es 'detalles'.
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

                else:
                    obj_pedido.estado = nuevo_estado
                    obj_pedido.save()

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
            monto = float(data.get('monto', 0))

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
                pago.objects.create(pedido=obj_pedido, monto=monto)
                obj_pedido.abono += monto
                obj_pedido.save()

            return JsonResponse({
                'ok': True,
                'message': f'Abono agregado. Nuevo saldo: ${obj_pedido.saldo_pendiente}',
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