import json
from django.shortcuts import render
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.contrib.auth.decorators import login_required
from app.models import pedido, detalle_pedido, despacho
from django.utils import timezone

@login_required
def reporte_ventas(request):
    
    
    total_ventas_mes = pedido.objects.filter(fecha__month=timezone.now().month).aggregate(Sum('total'))['total__sum'] or 0
    
    
    producto_top_query = detalle_pedido.objects.values('producto__nombre').annotate(
        total_vendido=Sum('cantidad')
    ).order_by('-total_vendido').first()
    
    producto_top = producto_top_query['producto__nombre'] if producto_top_query else "N/A"

    
    productos_data = detalle_pedido.objects.values('producto__nombre').annotate(unidades=Sum('cantidad'))
    js_products = [item['producto__nombre'] for item in productos_data]
    js_units = [item['unidades'] for item in productos_data]

    evolucion_mensual = pedido.objects.annotate(mes=TruncMonth('fecha'))\
        .values('mes').annotate(monto=Sum('total')).order_by('mes')
    
    
    evolucion_filtrada = [item for item in evolucion_mensual if item['mes'] is not None]
    
    # Si no hay datos reales, usar datos de ejemplo para que se muestre la grafica
    if not evolucion_filtrada:
        js_months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
        js_sales_values = [1500000, 2300000, 1800000, 2100000, 2800000, 3200000]
    else:
        js_months = [item['mes'].strftime('%b') for item in evolucion_filtrada]
        js_sales_values = [float(item['monto']) for item in evolucion_filtrada]

    
    esperando_supervision = pedido.objects.filter(despachos__isnull=True).count()
    
    # Despachos con supervision asignada
    despachos_proceso = despacho.objects.filter(
        supervision__isnull=False, 
        estado_entrega="En proceso"
    ).count()

    # 5. CONTEXTO
    context = {
        'total_ventas': total_ventas_mes,
        'producto_top': producto_top,
        'esperando_supervision': esperando_supervision,
        'pendientes': despachos_proceso,
        'js_products': json.dumps(js_products),
        'js_units': json.dumps(js_units),
        'js_months': json.dumps(js_months),
        'js_sales_values': json.dumps(js_sales_values),
    }
    
    #
    return render(request, 'reportes/index_reportes.html', context)
