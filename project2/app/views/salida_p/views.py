from django.views import View
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from app.models import producto, salida_producto
from app.forms import SalidaProductoForm


class SalidaProductoDetalleView(View):
    """Vista para obtener los detalles de una salida de producto"""
    
    def get(self, request, pk):
        try:
            salida = salida_producto.objects.select_related('id_producto').get(pk=pk)
            
            return JsonResponse({
                'success': True,
                'data': {
                    'producto': salida.id_producto.nombre,
                    'cantidad': salida.cantidad,
                    'fecha': salida.fecha.strftime('%d/%m/%Y'),
                    'motivo': salida.motivo,
                    'responsable': salida.responsable,
                    'estado': 'Activa' if salida.estado else 'Anulada'
                }
            })
            
        except salida_producto.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Registro no encontrado'
            })

@method_decorator(csrf_exempt, name='dispatch')
class SalidaProductoCreateView(View):
        
    def post(self, request):
        form = SalidaProductoForm(request.POST)

        if form.is_valid():
            salida = form.save(commit=False)
            producto_obj = salida.id_producto

            # Validar stock en el servidor
            if salida.cantidad > producto_obj.stock:
                return JsonResponse({
                    'success': False,
                    'message': f'No hay suficiente stock. Stock disponible: {producto_obj.stock}'
                })

            # Validar que la cantidad sea mayor a 0
            if salida.cantidad <= 0:
                return JsonResponse({
                    'success': False,
                    'message': 'La cantidad debe ser mayor a 0'
                })

            # Validar que la fecha no sea futura
            if salida.fecha > timezone.now().date():
                return JsonResponse({
                    'success': False,
                    'message': 'La fecha no puede ser futura'
                })

            # Validar motivo
            motivo = salida.motivo.strip() if salida.motivo else ''
            if len(motivo) < 5:
                return JsonResponse({
                    'success': False,
                    'message': 'El motivo debe tener al menos 5 caracteres'
                })

            # Validar responsable
            responsable = salida.responsable.strip() if salida.responsable else ''
            if len(responsable) < 3:
                return JsonResponse({
                    'success': False,
                    'message': 'El nombre del responsable debe tener al menos 3 caracteres'
                })

            # Actualizar stock y guardar
            producto_obj.stock -= salida.cantidad
            producto_obj.save()
            salida.save()

            return JsonResponse({
                'success': True,
                'message': 'Salida registrada correctamente'
            })

        # Si el formulario no es válido, devolver los errores
        errores = {}
        for field, errors in form.errors.items():
            errores[field] = [str(e) for e in errors]
        
        return JsonResponse({
            'success': False,
            'message': 'Error en el formulario',
            'errors': errores
        })


@method_decorator(csrf_exempt, name='dispatch')
class SalidaProductoAnularView(View):
    """Vista para anular una salida de producto (reintegrar stock)"""
    
    def post(self, request, pk):
        try:
            salida = salida_producto.objects.get(pk=pk)
            
            # Verificar si ya está anulado
            if not salida.estado:
                return JsonResponse({
                    'success': False,
                    'message': 'Esta salida ya está anulada'
                })
            
            # Reintegrar el stock al producto
            producto_obj = salida.id_producto
            producto_obj.stock += salida.cantidad
            producto_obj.save()
            
            # Cambiar estado a anulado
            salida.estado = False
            salida.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Salida anulada correctamente. Stock reintegrado.'
            })
            
        except salida_producto.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Registro no encontrado'
            })


class SalidaProductoView(TemplateView):
    template_name = 'salida_p/Salida_p.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['productos'] = producto.objects.filter(estado=True)
        
        # Obtener parámetro para mostrar anulados
        mostrar_anulados = self.request.GET.get('mostrar_anulados', 'false').lower() == 'true'
        
        # Filtrar salidas según el switch
        if mostrar_anulados:
            # Mostrar todos los registros (activos y anulados)
            context['salidas'] = salida_producto.objects.select_related('id_producto').order_by('-fecha')
        else:
            # Mostrar solo los activos (por defecto)
            context['salidas'] = salida_producto.objects.select_related('id_producto').filter(estado=True).order_by('-fecha')
        
        context['mostrar_anulados'] = mostrar_anulados
        return context
