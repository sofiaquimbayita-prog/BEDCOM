import json
from django.shortcuts import render
from django.db.models import Sum, F, FloatField
from django.db.models.functions import TruncMonth
from django.contrib.auth.decorators import login_required
from app.models import pedido, detalle_pedido, despacho, compra, insumo
from django.utils import timezone

@login_required
def reporte_ventas(request):
    # 1. TOTAL VENTAS MES ACTUAL
    total_ventas_mes = pedido.objects.filter(
        fecha__month=timezone.now().month,
        fecha__year=timezone.now().year
    ).aggregate(Sum('total'))['total__sum'] or 0
    
    # 2. PRODUCTO TOP (Historico real)
    producto_top_query = detalle_pedido.objects.values('producto__nombre').annotate(
        total_vendido=Sum('cantidad')
    ).order_by('-total_vendido').first()
    producto_top = producto_top_query['producto__nombre'] if producto_top_query else "N/A"

    # 3. DATOS GRAFICA DONA
    productos_data = detalle_pedido.objects.values('producto__nombre').annotate(unidades=Sum('cantidad'))
    js_products = [item['producto__nombre'] for item in productos_data]
    js_units = [item['unidades'] for item in productos_data]

    # 4. EVOLUCION MENSUAL (Ventas y Gastos Reales)
    evolucion_ventas = pedido.objects.annotate(mes=TruncMonth('fecha'))\
        .values('mes').annotate(monto=Sum('total')).order_by('mes')
    
    evolucion_gastos = compra.objects.annotate(mes=TruncMonth('fecha_suministro'))\
        .values('mes').annotate(
            total_gasto=Sum(F('cantidad') * F('precio_unidad'), output_field=FloatField())
        ).order_by('mes')

    # Combinar ventas y gastos en orden cronologico
    # Usar una lista de tuplas (fecha como string, ventas, gastos) directamente
    todos_meses = {}
    
    for v in evolucion_ventas:
        mes_date = v['mes']
        # Convertir a string ISO para usar como clave
        if mes_date:
            mes_key = mes_date.strftime('%Y-%m')
            mes_str = mes_date.strftime('%b')
            if mes_key not in todos_meses:
                todos_meses[mes_key] = {'label': mes_str, 'ventas': float(v['monto']), 'gastos': 0.0}
            else:
                todos_meses[mes_key]['ventas'] = float(v['monto'])
    
    for g in evolucion_gastos:
        mes_date = g['mes']
        if mes_date:
            mes_key = mes_date.strftime('%Y-%m')
            mes_str = mes_date.strftime('%b')
            if mes_key not in todos_meses:
                todos_meses[mes_key] = {'label': mes_str, 'ventas': 0.0, 'gastos': float(g['total_gasto'])}
            else:
                todos_meses[mes_key]['gastos'] = float(g['total_gasto'])
    
    # Ordenar por clave (que es YYYY-MM)
    sorted_keys = sorted(todos_meses.keys())
    meses_ordenados = [todos_meses[k]['label'] for k in sorted_keys]
    ventas_ordenadas = [todos_meses[k]['ventas'] for k in sorted_keys]
    gastos_ordenados = [todos_meses[k]['gastos'] for k in sorted_keys]

    # 5. CALCULO DE UTILIDAD Y MARGEN
    total_gastos = sum(gastos_ordenados)
    utilidad_neta = float(total_ventas_mes) - total_gastos
    margen = (utilidad_neta / float(total_ventas_mes) * 100) if total_ventas_mes > 0 else 0

    # 6. ALERTAS DE STOCK (Insumos con menos de 5 unidades)
    insumos_criticos = insumo.objects.filter(cantidad__lt=5).count()

    # 7. DESPACHOS EN PROCESO (incluye estado "En proceso" y "0")
    pendientes = despacho.objects.filter(estado_entrega__in=["En proceso", "0"]).count()

    context = {
        'titulo_pagina': 'GESTION DE REPORTES - BEDCOM',
        'total_ventas': total_ventas_mes,
        'utilidad_neta': utilidad_neta,
        'margen': round(margen, 1),
        'producto_top': producto_top,
        'insumos_criticos': insumos_criticos,
        'pendientes': pendientes,
        'js_products': json.dumps(js_products),
        'js_units': json.dumps(js_units),
        'js_months': json.dumps(meses_ordenados),
        'js_sales_values': json.dumps(ventas_ordenadas),
        'js_expenses_values': json.dumps(gastos_ordenados),
    }
    return render(request, 'reportes/index_reportes.html', context)
