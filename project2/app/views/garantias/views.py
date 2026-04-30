import json
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.generic import ListView, View
from django.utils import timezone

from ...models import garantia, pedido, producto, Notificacion, usuario

def _garantia_to_dict(obj):
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

class GarantiaListView(ListView):
    model = garantia
    template_name = 'garantias/garantias_list.html'
    context_object_name = 'garantias'

    def get_queryset(self):
        return garantia.objects.select_related('pedido__cliente', 'producto').order_by('-fecha_solicitud')

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['pedidos'] = pedido.objects.filter(estado__in=['Despachado', 'Completado']).select_related('cliente').order_by('-id')
        ctx['productos'] = producto.objects.filter(estado=True)
        
        ctx['total_garantias'] = garantia.objects.count()
        ctx['recibidas'] = garantia.objects.filter(estado_reparacion='recibida').count()
        ctx['en_reparacion'] = garantia.objects.filter(estado_reparacion='en_reparacion').count()
        ctx['entregadas'] = garantia.objects.filter(estado_reparacion='entregada').count()
        return ctx

class GarantiaCreateView(View):
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

            gar = garantia.objects.create(
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
                    tipo='garantia_nueva', # We can use a freeform string or add to TIPO_CHOICES. The model uses max_length 30. We'll use 'garantia_nueva'.
                    titulo='Nueva Garantía Registrada',
                    mensaje=f'Garantía #{gar.id} registrada para el producto {prod.nombre}.',
                    target_id=gar.id
                )

            return JsonResponse({
                'ok': True,
                'message': f'Garantía #{gar.id} registrada correctamente.',
                'garantia': _garantia_to_dict(gar)
            })
        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})

class GarantiaUpdateEstadoView(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            gar = get_object_or_404(garantia, pk=pk)
            data = json.loads(request.body)
            nuevo_estado = data.get('estado_reparacion')

            if nuevo_estado not in dict(garantia.ESTADO_CHOICES).keys():
                return JsonResponse({'ok': False, 'error': 'Estado inválido.'})

            gar.estado_reparacion = nuevo_estado
            gar.save()

            return JsonResponse({
                'ok': True,
                'message': f'Garantía #{gar.id} actualizada a {gar.get_estado_reparacion_display()}.',
                'garantia': _garantia_to_dict(gar)
            })
        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})

class GarantiaDetailView(View):
    def get(self, request, pk, *args, **kwargs):
        gar = get_object_or_404(garantia.objects.select_related('pedido__cliente', 'producto'), pk=pk)
        return JsonResponse({'ok': True, 'garantia': _garantia_to_dict(gar)})
