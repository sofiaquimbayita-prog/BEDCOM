from django.views import View
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from app.models import producto, salida_producto, usuario, historial_acciones
from app.forms import SalidaProductoForm

@method_decorator(csrf_exempt, name='dispatch')
class SalidaProductoCreateView(View):
    
    def post(self, request):
        
        form = SalidaProductoForm(request.POST)

        if form.is_valid():
            salida = form.save(commit=False)
            producto_obj = salida.id_producto

            if salida.cantidad > producto_obj.stock:
                return JsonResponse({
                    'success': False,
                    'message': f'No hay suficiente stock. Stock disponible: {producto_obj.stock}'
                })

            if salida.cantidad <= 0:
                return JsonResponse({
                    'success': False,
                    'message': 'La cantidad debe ser mayor a 0'
                })

            if salida.fecha > timezone.now().date():
                return JsonResponse({
                    'success': False,
                    'message': 'La fecha no puede ser futura'
                })

            motivo = salida.motivo.strip() if salida.motivo else ''
            if len(motivo) < 5:
                return JsonResponse({
                    'success': False,
                    'message': 'El motivo debe tener al menos 5 caracteres'
                })

            if not salida.responsable:
                return JsonResponse({
                    'success': False,
                    'message': 'Debe seleccionar un responsable'
                })

            responsable_nombre = str(salida.responsable)
            salida.responsable = responsable_nombre

            producto_obj.stock -= salida.cantidad
            producto_obj.save()
            salida.save()

            # REGISTRO HISTORIAL - AGREGADO
            if request.user.is_authenticated:
                historial_acciones.objects.create(
                    modulo='salidas',
                    tipo_accion='crear',
                    descripcion=f'Registró salida de {salida.cantidad} un. de "{producto_obj.nombre}" (motivo: {motivo[:50]})',
                    usuario=request.user
                )

            return JsonResponse({
                'success': True,
                'message': 'Salida registrada correctamente'
            })

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
    def post(self, request, pk):
        try:
            salida = salida_producto.objects.get(pk=pk)

            if not salida.estado:
                return JsonResponse({
                    'success': False,
                    'message': 'Esta salida ya está anulada'
                })

            producto_obj = salida.id_producto
            producto_obj.stock += salida.cantidad
            producto_obj.save()

            salida.estado = False
            salida.save()

            # REGISTRO HISTORIAL - AGREGADO
            if request.user.is_authenticated:
                historial_acciones.objects.create(
                    modulo='salidas',
                    tipo_accion='eliminar',
                    descripcion=f'Anuló salida #{salida.id} de "{salida.id_producto.nombre}"',
                    usuario=request.user
                )

            return JsonResponse({
                'success': True,
                'message': 'Salida anulada correctamente. Stock reintegrado.'
            })

        except salida_producto.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Registro no encontrado'
            })

@method_decorator(csrf_exempt, name='dispatch')
class DetalleSalidaView(View):
    def get(self, request, pk):
        try:
            salida = get_object_or_404(salida_producto.objects.select_related('id_producto'), pk=pk)
            data = {
                'success': True,
                'salida': {
                    'id': salida.id,
                    'producto': salida.id_producto.nombre,
                    'cantidad': salida.cantidad,
                    'fecha': salida.fecha.strftime('%d/%m/%Y'),
                    'motivo': salida.motivo,
                    'responsable': salida.responsable,
                    'estado': salida.estado,
                }
            }
            return JsonResponse(data)
        except Exception:
            return JsonResponse({
                'success': False,
                'message': 'Error al obtener detalles'
            })

class SalidaProductoView(TemplateView):
    template_name = 'salida_p/Salida_p.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = "Salida de Productos - BEDCOM"
        context['productos'] = producto.objects.filter(estado=True)
        context['usuarios'] = usuario.objects.all()
        context['form'] = SalidaProductoForm()

        mostrar_anulados = self.request.GET.get('mostrar_anulados', 'false').lower() == 'true'

        if mostrar_anulados:
            context['salidas'] = salida_producto.objects.select_related('id_producto').order_by('-fecha')
        else:
            context['salidas'] = salida_producto.objects.select_related('id_producto').filter(estado=True).order_by('-fecha')

        context['mostrar_anulados'] = mostrar_anulados
        return context

