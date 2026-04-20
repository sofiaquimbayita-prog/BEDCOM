import json
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.generic import ListView, View
from django.utils import timezone

from ...models import despacho, pedido, cliente, detalle_pedido, producto


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
        'fecha_despacho': obj.fecha_despacho.isoformat() if obj.fecha_despacho else None,
        'fecha_entrega_real': obj.fecha_entrega_real.isoformat() if obj.fecha_entrega_real else None,
        'observaciones': obj.observaciones or '',
        'responsable': obj.responsable or '',
        'productos': [
            {
                'nombre': d.producto.nombre,
                'cantidad': d.cantidad,
                'precio_unitario': str(d.precio_unitario),
                'sub_total': str(d.sub_total),
            }
            for d in obj.pedido.detalles.select_related('producto').all()
        ]
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
        ctx['pedidos_pendientes'] = pedido.objects.filter(
            estado='Pendiente', despacho__isnull=True
        ).count()

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
            pedido_id = data.get('pedido_id')

            if not pedido_id:
                return JsonResponse({'ok': False, 'error': 'ID de pedido requerido.'})

            pedido_obj = get_object_or_404(pedido, pk=pedido_id)

            if pedido_obj.estado != 'Pendiente':
                return JsonResponse({
                    'ok': False,
                    'error': 'Solo pedidos en estado Pendiente pueden despacharse.'
                })

            # FIX: usar .filter().exists() en lugar de hasattr + acceso directo,
            # que puede lanzar RelatedObjectDoesNotExist en relaciones OneToOne.
            if despacho.objects.filter(pedido=pedido_obj).exists():
                return JsonResponse({
                    'ok': False,
                    'error': 'Este pedido ya tiene un despacho activo.'
                })

            with transaction.atomic():
                despacho_obj = despacho.objects.create(pedido=pedido_obj)

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
                'fecha_despacho': d.fecha_despacho.isoformat()
            }
            for d in qs.order_by('-fecha_despacho')[:50]
        ]

        return JsonResponse({'ok': True, 'despachos': data})