from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.urls import reverse
from django.shortcuts import render

# Importamos los modelos necesarios
# Asegúrate de que 'app' sea el nombre correcto de tu aplicación donde están los modelos
from app.models import historial_acciones, producto, insumo

@method_decorator(login_required, name='dispatch')
class MonitoreoView(TemplateView):
    template_name = 'monitoreo/monitoreo.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # 1. CARGAR HISTORIAL (Renderizado inicial)
        # Obtenemos las últimas 50 acciones, ordenadas de la más reciente a la más antigua
        context['historial_acciones'] = historial_acciones.objects.select_related('usuario').order_by('-fecha')[:50]

        # 2. CARGAR KPIs (Indicadores)
        # Stock total (suma de productos activos)
        context['stock_total'] = producto.objects.filter(estado=True).count()
        
        # Insumos bajos (ejemplo: menos de 10 unidades)
        context['insumos_bajos'] = insumo.objects.filter(cantidad__lte=10).count()
        
        # Producción hoy (puedes ajustar esta lógica según tu modelo de producción)
        context['produccion_hoy'] = 0

        # 3. URLs para redirección desde las tarjetas
        # Usamos try/except por si alguna URL no está definida aún en urls.py
        try: context['productos_url'] = reverse('productos')
        except: context['productos_url'] = '#'
            
        try: context['insumos_url'] = reverse('insumos')
        except: context['insumos_url'] = '#'
            
        try: context['entrada_p_url'] = reverse('entrada_p')
        except: context['entrada_p_url'] = '#'

        return context

@login_required
def api_historial_tiempo_real(request):
    """
    Endpoint API que devuelve el historial en JSON para el script JS de monitoreo.html
    """
    try:
        # Obtenemos las últimas 20 acciones para la actualización AJAX
        acciones = historial_acciones.objects.select_related('usuario').order_by('-fecha')[:20]
        
        data = []
        for accion in acciones:
            data.append({
                'modulo': accion.get_modulo_display(),
                'descripcion': accion.descripcion,
                'fecha': accion.fecha.strftime('%d/%m/%Y %H:%M'),
                'usuario': accion.usuario.username if accion.usuario else 'Sistema'
            })
        
        return JsonResponse({'success': True, 'data': data})
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})