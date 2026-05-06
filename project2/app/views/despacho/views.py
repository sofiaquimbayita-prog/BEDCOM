import json
import re
import threading
from decimal import Decimal, InvalidOperation
from django.db import transaction
from django.db.models import Sum, Q, F
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.generic import ListView, View
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import datetime
from collections import defaultdict
from ...models import despacho, pedido, cliente, detalle_pedido, producto, Notificacion, usuario

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

def safe_datetime_str(value):
    if value is None:
        return None
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value).strftime('%Y-%m-%dT%H:%M:%S')
        except:
            return None
    if hasattr(value, 'strftime'):
        return value.strftime('%Y-%m-%dT%H:%M:%S')
    return str(value)


def parse_cop_amount(value):
    text = str(value or '').strip()
    if text == '':
        return Decimal('0')
    text = re.sub(r'[^0-9.,]', '', text)
    comma_count = text.count(',')
    dot_count = text.count('.')

    if comma_count > 0 and dot_count > 0:
        if text.rfind(',') > text.rfind('.'):
            text = text.replace('.', '').replace(',', '.')
        else:
            text = text.replace(',', '')
    elif comma_count > 0:
        text = text.replace(',', '.')
    elif dot_count > 1:
        text = text.replace('.', '')

    parts = text.split('.')
    if len(parts) > 2:
        text = parts[0] + '.' + ''.join(parts[1:])

    return Decimal(text)


# ─────────────────────────────────────────────
# HELPER: serializar despacho completo
# ─────────────────────────────────────────────
def _despacho_to_dict(obj):
    return {
        'id': obj.id,
        'pedido_id': obj.pedido.id,
        'cliente_nombre': obj.pedido.cliente.nombre,
        'direccion_entrega': obj.direccion_entrega,
        'telefono_contacto': obj.telefono_contacto,
        'estado': obj.estado,
'fecha_despacho': safe_datetime_str(obj.fecha_despacho),
'fecha_entrega_real': safe_datetime_str(obj.fecha_entrega_real),
'observaciones': obj.observaciones or '',
        'responsable': obj.responsable or '',
'fecha_entrega': safe_date_str(obj.pedido.fecha_entrega),
        'productos': [
            {
                'nombre': d.producto.nombre if d.producto else 'Producto Personalizado',
                'cantidad': d.cantidad,
                'precio_unitario': str(d.precio_unitario),
                'sub_total': str(d.sub_total),
            }
            for d in obj.pedido.detalles.select_related('producto').all()
        ],
        'empresa_transporte': obj.empresa_transporte or '',
        'numero_guia': obj.numero_guia or '',
        'costo_envio': str(obj.costo_envio)
    }


# ─────────────────────────────────────────────
# LISTA PRINCIPAL (DataTable)
# ─────────────────────────────────────────────
class DespachoListView(ListView):
    model = despacho
    template_name = 'despacho/despacho_list.html'
    context_object_name = 'despachos'

    def get_queryset(self):
        return (
            despacho.objects
            .select_related('pedido__cliente')
            .order_by('-fecha_despacho')
        )

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ped_disp = pedido.objects.filter(
            estado__in=['Pendiente', 'En Fabricación', 'Listo para Despacho'], despacho__isnull=True
        ).select_related('cliente')
        ctx['pedidos_pendientes'] = ped_disp.count()
        ctx['pedidos_disponibles'] = ped_disp

        # Counts para tarjetas KPI
        ctx['total_despachos'] = despacho.objects.count()
        ctx['pendientes']      = despacho.objects.filter(estado='pendiente').count()
        ctx['en_ruta']         = despacho.objects.filter(estado='en_ruta').count()
        ctx['fallidos']        = despacho.objects.filter(estado='fallido').count()
        return ctx


# ─────────────────────────────────────────────
# API: Crear despacho
# ─────────────────────────────────────────────
class DespachoCreateView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            
            # Server-side validation
            pedido_id = data.get('pedido_id')
            if not pedido_id:
                return JsonResponse({'ok': False, 'field': 'pedido', 'error': 'ID de pedido requerido.'})
            
            empresa = data.get('empresa_transporte', '').strip()
            if not empresa or len(empresa) < 2:
                return JsonResponse({'ok': False, 'field': 'empresa', 'error': 'Nombre del acarreista requerido (mín. 2 caracteres).'})
            if not re.match(r'^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]{2,80}$', empresa):
                return JsonResponse({'ok': False, 'field': 'empresa', 'error': 'Nombre del acarreista: solo letras, números y espacios.'})
            
            telefono = re.sub(r'\D', '', str(data.get('telefono', '') or ''))
            if not re.match(r'^\d{10}$', telefono):
                return JsonResponse({'ok': False, 'field': 'telefono', 'error': 'Teléfono debe tener exactamente 10 dígitos numéricos.'})
            
            numero_guia = data.get('numero_guia', '').strip()
            if not numero_guia or not re.match(r'^[A-Z0-9]{6}$', numero_guia, re.I):
                return JsonResponse({'ok': False, 'field': 'guia', 'error': 'La placa debe tener exactamente 6 letras o números.'})
            
            try:
                costo_envio = parse_cop_amount(data.get('costo_envio', 0))
                if costo_envio < 0:
                    return JsonResponse({'ok': False, 'field': 'costo', 'error': 'Costo de envío no puede ser negativo.'})
                if costo_envio > Decimal('9999999999'):
                    return JsonResponse({'ok': False, 'field': 'costo', 'error': 'Costo de envío no puede exceder 9.999.999.999 COP.'})
            except (InvalidOperation, ValueError):
                return JsonResponse({'ok': False, 'field': 'costo', 'error': 'Costo de envío inválido.'})

            pedido_obj = get_object_or_404(pedido, pk=pedido_id)

            if pedido_obj.estado not in ['Pendiente', 'En Fabricación', 'Listo para Despacho']:
                return JsonResponse({
                    'ok': False,
                    'error': 'El pedido no está en un estado válido para despacharse.'
                })
            
            # Validación de Pagos
            if not pedido_obj.cliente.es_especial:
                if pedido_obj.saldo_pendiente > 0:
                    return JsonResponse({
                        'ok': False,
                        'error': f'El pedido de un cliente NORMAL requiere pago del 100% para despachar (Faltan ${pedido_obj.saldo_pendiente}).'
                    })
            else:
                if pedido_obj.abono < (pedido_obj.total * Decimal('0.5')):
                    return JsonResponse({
                        'ok': False,
                        'error': 'El pedido de un cliente ESPECIAL requiere al menos 50% de abono para despachar.'
                    })

            # FIX: usar .filter().exists() en lugar de hasattr + acceso directo,
            # que puede lanzar RelatedObjectDoesNotExist en relaciones OneToOne.
            if despacho.objects.filter(pedido=pedido_obj).exists():
                return JsonResponse({
                    'ok': False,
                    'error': 'Este pedido ya tiene un despacho activo.'
                })

            with transaction.atomic():
                despacho_obj = despacho.objects.create(
                    pedido=pedido_obj,
                    empresa_transporte=empresa,
                    numero_guia=numero_guia,
                    telefono_contacto=telefono,
                    costo_envio=costo_envio,
                    responsable=request.user.get_full_name() if request.user.is_authenticated else 'Sistema'
                )

                
                if pedido_obj.cliente.es_especial and pedido_obj.saldo_pendiente > 0:
                    import datetime
                    pedido_obj.fecha_limite_pago = timezone.now().date() + datetime.timedelta(days=90)
                
                pedido_obj.estado = 'Despachado'
                pedido_obj.save()

                # Generar Log Historial
                if request.user.is_authenticated:
                    historial_acciones.objects.create(
                        modulo='despachos',
                        tipo_accion='crear',
                        descripcion=f'Creó despacho #{despacho_obj.id} para Pedido #{pedido_obj.id}',
                        usuario=request.user
                    )

                # Correo al Cliente (Asíncrono)
                if getattr(pedido_obj.cliente, 'email', None):
                    def send_despacho_email(desp_id, ped_id, c_nombre, c_email, transportadora, guia, fecha):
                        try:
                            mensaje = (
                                f"Hola {c_nombre},\n\n"
                                f"¡Tenemos buenas noticias! Tu pedido #{ped_id} ha sido despachado y está en camino.\n\n"
                                f"Detalles del Despacho:\n"
                                f"- Despacho #{desp_id}\n"
                                f"- Transportadora: {transportadora or 'Entrega Directa'}\n"
                                f"- Número de Guía: {guia or 'N/A'}\n"
                                f"- Fecha de Despacho: {fecha.strftime('%d/%m/%Y %H:%M')}\n\n"
                                f"¡Esperamos que disfrutes tus productos!\n\n"
                                f"Atentamente,\nEl equipo de BEDCOM"
                            )
                            send_mail(
                                subject=f'Tu pedido #{ped_id} ha sido despachado - BEDCOM',
                                message=mensaje,
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                recipient_list=[c_email],
                                fail_silently=True
                            )
                        except Exception as e:
                            print("Error enviando correo de despacho:", e)
                    
                    threading.Thread(
                        target=send_despacho_email,
                        args=(
                            despacho_obj.id,
                            pedido_obj.id,
                            pedido_obj.cliente.nombre,
                            pedido_obj.cliente.email,
                            despacho_obj.empresa_transporte,
                            despacho_obj.numero_guia,
                            despacho_obj.fecha_despacho
                        ),
                        daemon=True
                    ).start()  

            return JsonResponse({
                'ok': True,
                'message': f'Despacho #{despacho_obj.id} creado para pedido #{pedido_obj.id}.',
                'despacho': _despacho_to_dict(despacho_obj)
            })

        except json.JSONDecodeError:
            return JsonResponse({'ok': False, 'error': 'Cuerpo de la solicitud inválido.'})
        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# API: Cambiar estado + lógica de negocio
# ─────────────────────────────────────────────
class DespachoUpdateEstadoView(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            obj = get_object_or_404(despacho, pk=pk)

            # Acepta tanto FormData (request.POST) como JSON body
            nuevo_estado = request.POST.get('nuevo_estado')
            if not nuevo_estado:
                try:
                    body = json.loads(request.body)
                    nuevo_estado = body.get('nuevo_estado')
                except (json.JSONDecodeError, ValueError):
                    pass

            if not nuevo_estado:
                return JsonResponse({'ok': False, 'error': 'El nuevo estado es requerido.'})

            with transaction.atomic():
                if nuevo_estado == despacho.ENTREGADO:
                    obj.fecha_entrega_real = timezone.now()
                    obj.pedido.estado = 'Completado'
                    obj.pedido.save()

                obj.estado = nuevo_estado
                obj.save()

            if request.user.is_authenticated:
                historial_acciones.objects.create(
                    modulo='despachos',
                    tipo_accion='editar',
                    descripcion=f'Actualizó estado del despacho #{obj.id} a {nuevo_estado}',
                    usuario=request.user
                )

            return JsonResponse({
                'ok': True,
                'message': f'Despacho #{obj.id} actualizado a "{obj.get_estado_display()}".',
                'despacho': _despacho_to_dict(obj)
            })

        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# API: Detalle JSON (para modales)
# ─────────────────────────────────────────────
class DespachoDetailView(View):
    def get(self, request, pk, *args, **kwargs):
        obj = get_object_or_404(
            despacho.objects.select_related('pedido__cliente'),
            pk=pk
        )
        return JsonResponse({'ok': True, 'despacho': _despacho_to_dict(obj)})


# ─────────────────────────────────────────────
# API: Despachos por fecha (rutas)
# ─────────────────────────────────────────────
class DespachosPorFechaView(View):
    def get(self, request, *args, **kwargs):
        fecha_inicio = request.GET.get('fecha_inicio')
        fecha_fin    = request.GET.get('fecha_fin')

        qs = despacho.objects.all()
        if fecha_inicio:
            qs = qs.filter(fecha_despacho__date__gte=fecha_inicio)
        if fecha_fin:
            qs = qs.filter(fecha_despacho__date__lte=fecha_fin)

        data = [
            {
                'id': d.id,
                'estado': d.estado,
'fecha_despacho': safe_datetime_str(d.fecha_despacho),
            }
            for d in qs.order_by('-fecha_despacho')[:50]
        ]

        return JsonResponse({'ok': True, 'despachos': data})
