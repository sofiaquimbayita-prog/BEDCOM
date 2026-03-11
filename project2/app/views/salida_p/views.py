from django.views import View
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from app.models import producto, salida_producto, usuario
from app.forms import SalidaProductoForm


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
#g
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

            # Validar responsable - ahora es un objeto usuario
            if not salida.responsable:
                return JsonResponse({
                    'success': False,
                    'message': 'Debe seleccionar un responsable'
                })
            
            # Convertir el objeto usuario a string para guardar en el campo CharField
            responsable_nombre = str(salida.responsable)
            salida.responsable = responsable_nombre

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
        # Agregar usuarios activos para el dropdown de responsable
        context['usuarios'] = usuario.objects.all()
        # Agregar el formulario al contexto
        context['form'] = SalidaProductoForm()
        
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
