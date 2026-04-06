from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.urls import reverse
from django.shortcuts import render

# Importamos los modelos necesarios
# Asegúrate de que 'app' sea el nombre correcto de tu aplicación donde están los modelos
from app.models import historial_acciones, producto, insumo, entrada, salida_producto, calendario, Notificacion
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum

@method_decorator(login_required, name='dispatch')
class MonitoreoView(TemplateView):
    template_name = 'monitoreo/monitoreo.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # 1. CARGAR HISTORIAL (Renderizado inicial)
        # Obtenemos las últimas 50 acciones, ordenadas de la más reciente a la más antigua
        context['historial_acciones'] = historial_acciones.objects.select_related('usuario').order_by('-fecha')[:50]

        # 2. CARGAR KPIs (Indicadores)
        # Total stock units (todos productos activos)
        from django.db.models import Sum
        total_stock = producto.objects.filter(estado=True).aggregate(total_stock=Sum('stock'))['total_stock']
        context['stock_total'] = total_stock or 0
        
        # Insumos bajos (ejemplo: menos de 10 unidades)
        context['insumos_bajos'] = insumo.objects.filter(cantidad__lte=10).count()
        
        today = timezone.now().date()
        # Producción hoy: count entradas de hoy
        context['produccion_hoy'] = entrada.objects.filter(fecha__date=today, estado=True, anulado=False).count()
        # Salidas hoy
        context['salidas_hoy'] = salida_producto.objects.filter(fecha=today, estado=True).count()

        # 3. URLs para redirección desde las tarjetas
        # Usamos try/except por si alguna URL no está definida aún en urls.py
        try: context['productos_url'] = reverse('productos')
        except: context['productos_url'] = '#'
            
        try: context['insumos_url'] = reverse('insumos')
        except: context['insumos_url'] = '#'
            
        try: context['entrada_p_url'] = reverse('entrada_p')
        except: context['entrada_p_url'] = '#'
        
        try: context['salida_p_url'] = reverse('salida_producto')
        except: context['salida_p_url'] = '#'

        # Generar notificaciones del sistema si no existen para hoy
        self.generar_notificaciones()

        context['alertas_count'] = Notificacion.objects.filter(leida=False).count()
        context['notificaciones'] = Notificacion.objects.filter(leida=False).order_by('-fecha_notificacion')[:10]

        return context

    def generar_notificaciones(self):
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)

        # Productos bajo stock (<=10)
        qs = producto.objects.filter(estado=True, stock__lte=10)[:10]
        for p in qs:
            if Notificacion.objects.filter(
                relacionada_tipo='producto',
                relacionada_id=p.id,
                fecha_notificacion__date=today
            ).exists():
                continue
            Notificacion.objects.create(
                tipo=Notificacion.TIPO_PRODUCTO_BAJO,
                titulo=p.nombre,
                mensaje=f'{p.stock} unidades restantes',
                relacionada_id=p.id,
                relacionada_tipo='producto'
            )

        # Eventos hoy
        qs = calendario.objects.filter(
            fecha=today,
            estado=calendario.ESTADO_PENDIENTE
        )[:10]
        for e in qs:
            if Notificacion.objects.filter(
                relacionada_tipo='calendario',
                relacionada_id=e.id,
                fecha_notificacion__date=today
            ).exists():
                continue
            Notificacion.objects.create(
                tipo=Notificacion.TIPO_EVENTO_HOY,
                titulo=e.titulo,
                mensaje='Hoy',
                relacionada_id=e.id,
                relacionada_tipo='calendario'
            )

        # Eventos mañana
        qs = calendario.objects.filter(
            fecha=tomorrow,
            estado=calendario.ESTADO_PENDIENTE
        )[:10]
        for e in qs:
            if Notificacion.objects.filter(
                relacionada_tipo='calendario',
                relacionada_id=e.id,
                fecha_notificacion__date=today
            ).exists():
                continue
            Notificacion.objects.create(
                tipo=Notificacion.TIPO_EVENTO_MANANA,
                titulo=e.titulo,
                mensaje='Mañana',
                relacionada_id=e.id,
                relacionada_tipo='calendario'
            )

        # Eventos vencidos
        qs = calendario.objects.filter(
            fecha__lt=today,
            estado=calendario.ESTADO_PENDIENTE
        )[:10]
        for e in qs:
            if Notificacion.objects.filter(
                relacionada_tipo='calendario',
                relacionada_id=e.id,
                fecha_notificacion__date=today
            ).exists():
                continue
            Notificacion.objects.create(
                tipo=Notificacion.TIPO_EVENTO_VENCIDO,
                titulo=e.titulo,
                mensaje='Fecha pasada sin completar',
                relacionada_id=e.id,
                relacionada_tipo='calendario'
            )

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



@login_required
def api_kpis(request):
    """API endpoint para obtener KPIs en tiempo real"""
    if request.method == 'GET':
        data = {
            'total_eventos': 150,
            'eventos_activos': 45,
            'tasa_exito': 87.5,
            'tiempo_promedio': 12.3,
        }
        return JsonResponse(data)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@login_required
def api_notificaciones(request):
    """API endpoint para obtener notificaciones"""
    if request.method == 'GET':
        notifs = Notificacion.objects.filter(leida=False).order_by('-fecha_notificacion')[:10]
        data_list = []
        for n in notifs:
            data_list.append({
                'id': n.id,
                'titulo': getattr(n, 'titulo', n.mensaje or 'Notificación'),
                'mensaje': n.mensaje,
                'fecha': n.fecha_notificacion.strftime('%d/%m %H:%M') if hasattr(n, 'fecha_notificacion') else '',
                'tipo': getattr(n, 'tipo', 'info')
            })
        return JsonResponse({
            'data': data_list,
            'total': len(data_list)
        })
    return JsonResponse({'error': 'Método no permitido'}, status=405)