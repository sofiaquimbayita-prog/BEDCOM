from django.views.generic import TemplateView
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Sum
from django.db.utils import OperationalError
from ...models import producto, insumo, entrada, historial_acciones


class MonitoreoView(TemplateView):
    template_name = 'monitoreo/monitoreo.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = 'MONITOREO - BEDCOM'
        context['icono_modulo'] = 'fas fa-desktop'
        
        # 1. Stock Total - Suma del stock de todos los productos activos
        stock_total = producto.objects.filter(estado=True).aggregate(Sum('stock'))['stock__sum'] or 0
        context['stock_total'] = stock_total
        context['productos_url'] = '/vistas/productos/'
        
        # 2. Insumos Bajos - Menor a 10 unidades
        insumos_bajos = insumo.objects.filter(
            cantidad__lt=10,
            estado__in=['activo', 'Activo']
        ).count()
        context['insumos_bajos'] = insumos_bajos
        context['insumos_bajos_lista'] = insumo.objects.filter(
            cantidad__lt=10,
            estado__in=['activo', 'Activo']
        )[:5]
        context['insumos_url'] = '/vistas/insumos/'
        
        # 3. Producción de Hoy - Entradas del día actual
        hoy = timezone.now().date()
        hoy_inicio = datetime.combine(hoy, datetime.min.time())
        hoy_fin = datetime.combine(hoy, datetime.max.time())
        
        entradas_hoy = entrada.objects.filter(
            fecha__range=(hoy_inicio, hoy_fin),
            estado=True,
            anulado=False
        )
        context['produccion_hoy'] = entradas_hoy.count()
        context['entradas_hoy_lista'] = entradas_hoy[:5]  # Top 5 para mostrar
        context['entrada_p_url'] = '/vistas/entrada_p/'
        
        # 4. Historial de Acciones - Últimas 10 acciones del sistema
        try:
            context['historial_acciones'] = list(historial_acciones.objects.select_related('usuario').order_by('-fecha')[:10])
        except OperationalError:
            context['historial_acciones'] = []
        
        return context
