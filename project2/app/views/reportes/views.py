import json
from django.shortcuts import render
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
# Usamos importación absoluta basada en tu carpeta 'app'
from app.models import Pedido, DetallePedido, Despacho

def reporte_ventas(request):
    """
    Dashboard de Reportes corregido.
    Resuelve FieldError y TemplateDoesNotExist.
    """
    
    # 1. DATOS FINANCIEROS (Desde Pedido, NO Despacho)
    # Filtramos por mes 2 (Febrero) según la fecha del sistema
    total_ventas_mes = Pedido.objects.filter(fecha__month=2).aggregate(Sum('total'))['total__sum'] or 0
    
    # 2. PRODUCTO MÁS VENDIDO
    producto_top_query = DetallePedido.objects.values('producto__nombre').annotate(
        total_vendido=Sum('cantidad')
    ).order_by('-total_vendido').first()
    
    producto_top = producto_top_query['producto__nombre'] if producto_top_query else "N/A"

    # 3. DATOS PARA GRÁFICAS (JSON para evitar errores de JS)
    productos_data = DetallePedido.objects.values('producto__nombre').annotate(unidades=Sum('cantidad'))
    js_products = [item['producto__nombre'] for item in productos_data]
    js_units = [item['unidades'] for item in productos_data]

    evolucion_mensual = Pedido.objects.annotate(mes=TruncMonth('fecha'))\
        .values('mes').annotate(monto=Sum('total')).order_by('mes')
    
    js_months = [item['mes'].strftime('%b') for item in evolucion_mensual]
    js_sales_values = [float(item['monto']) for item in evolucion_mensual]

    # 4. FLUJO OPERATIVO (Validación de Supervisión)
    # Pedidos sin despacho = Pendientes de supervisión
    esperando_supervision = Pedido.objects.filter(despachos__isnull=True).count()
    
    # Despachos con supervisión asignada
    despachos_proceso = Despacho.objects.filter(
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
    
    # RENDER: Ruta corregida según tu estructura de carpetas
    return render(request, 'reportes/index_reportes.html', context)