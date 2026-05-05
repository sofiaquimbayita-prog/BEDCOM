import json
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.generic import ListView, View
from django.utils import timezone

from ...models import mantenimiento, pedido, producto, Notificacion, usuario, historial_acciones

def _mantenimiento_to_dict(obj):
    return {
        'id': obj.id,
        'fecha_solicitud': obj.fecha_solicitud.strftime('%Y-%m-%d'),
        'pedido_id': obj.pedido.id if obj.pedido else None,
        'cliente_nombre': obj.pedido.cliente.nombre if obj.pedido else 'N/A',
        'producto_nombre': obj.producto.nombre if obj.producto else 'N/A',
        'descripcion_falla': obj.descripcion_falla,
        'estado_reparacion': obj.estado_reparacion,
        'estado_display': obj.get_estado_reparacion_display(),
    }

class MantenimientoListView(ListView):
    model = mantenimiento
    template_name = 'mantenimientos/mantenimientos_list.html'
    context_object_name = 'mantenimientos'

    def get_queryset(self):
        return mantenimiento.objects.select_related('pedido__cliente', 'producto').order_by('-fecha')

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['pedidos'] = pedido.objects.filter(estado__in=['Despachado', 'Completado']).select_related('cliente').order_by('-id')
        ctx['productos'] = producto.objects.filter(estado=True)
        
        ctx['total_mantenimientos'] = mantenimiento.objects.count()
        ctx['recibidas'] = mantenimiento.objects.filter(estado_reparacion='recibida').count()
        ctx['en_reparacion'] = mantenimiento.objects.filter(estado_reparacion='en_reparacion').count()
        ctx['entregadas'] = mantenimiento.objects.filter(estado_reparacion='entregada').count()
        return ctx

class MantenimientoCreateView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            pedido_id = data.get('pedido_id')
            producto_id = data.get('producto_id')
            descripcion = data.get('descripcion_falla', '').strip()

            if not producto_id or not descripcion:
                return JsonResponse({'ok': False, 'error': 'Producto y descripción son requeridos.'})

            ped = get_object_or_404(pedido, pk=pedido_id) if pedido_id else None
            prod = get_object_or_404(producto, pk=producto_id)

            gar = mantenimiento.objects.create(
                pedido=ped,
                producto=prod,
                descripcion_falla=descripcion,
                estado_reparacion='recibida'
            )

            # Generar Notificación
            admin_user = usuario.objects.first()
            if admin_user:
                Notificacion.objects.create(
                    user=admin_user,
                    tipo='mantenimiento_nueva', # We can use a freeform string or add to TIPO_CHOICES. The model uses max_length 30. We'll use 'mantenimiento_nueva'.
                    titulo='Nuevo mantenimiento Registrada',
                    mensaje=f'Mantenimiento #{gar.id} registrada para el producto {prod.nombre}.',
                    target_id=gar.id
                )

            if request.user.is_authenticated:
                historial_acciones.objects.create(
                    modulo='mantenimientos',
                    tipo_accion='crear',
                    descripcion=f'Registró mantenimiento #{gar.id} para {prod.nombre}',
                    usuario=request.user
                )

            return JsonResponse({
                'ok': True,
                'message': f'Mantenimiento #{gar.id} registrada correctamente.',
                'mantenimiento': _mantenimiento_to_dict(gar)
            })
        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})

class MantenimientoUpdateEstadoView(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            gar = get_object_or_404(mantenimiento, pk=pk)
            data = json.loads(request.body)
            nuevo_estado = data.get('estado_reparacion')

            if nuevo_estado not in dict(mantenimiento.ESTADO_CHOICES).keys():
                return JsonResponse({'ok': False, 'error': 'Estado inválido.'})

            gar.estado_reparacion = nuevo_estado
            gar.save()

            if request.user.is_authenticated:
                historial_acciones.objects.create(
                    modulo='mantenimientos',
                    tipo_accion='editar',
                    descripcion=f'Cambió estado de mantenimiento #{gar.id} a {gar.get_estado_reparacion_display()}',
                    usuario=request.user
                )

            return JsonResponse({
                'ok': True,
                'message': f'Mantenimiento #{gar.id} actualizada a {gar.get_estado_reparacion_display()}.',
                'mantenimiento': _mantenimiento_to_dict(gar)
            })
        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})

class MantenimientoDetailView(View):
    def get(self, request, pk, *args, **kwargs):
        gar = get_object_or_404(mantenimiento.objects.select_related('pedido__cliente', 'producto'), pk=pk)
        return JsonResponse({'ok': True, 'mantenimiento': _mantenimiento_to_dict(gar)})
