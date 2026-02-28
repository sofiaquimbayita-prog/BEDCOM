import json
from django.shortcuts import render
from django.db.models import Sum, F, FloatField, Count
from django.db.models.functions import ExtractMonth, Cast
from django.contrib.auth.decorators import login_required
from django.utils import timezone

# IMPORTACIÓN CORREGIDA: Apuntamos a la raíz de la app para encontrar los modelos
from app.models import pedido, detalle_pedido, despacho, compra, insumo

@login_required
def reporte_ventas(request):
    # 1. TOTAL VENTAS MES ACTUAL
    ahora = timezone.now()
    total_ventas_mes = pedido.objects.filter(
        fecha__month=ahora.month,
        fecha__year=ahora.year
    ).aggregate(Sum('total'))['total__sum'] or 0
    
    # 2. PRODUCTO TOP (Basado en cantidad histórica)
    producto_top_query = detalle_pedido.objects.values('producto__nombre').annotate(
        total_vendido=Sum('cantidad')
    ).order_by('-total_vendido').first()
    producto_top = producto_top_query['producto__nombre'] if producto_top_query else "N/A"

    # 3. DATOS GRÁFICA DONA (Distribución por productos)
    productos_data = detalle_pedido.objects.values('producto__nombre').annotate(unidades=Sum('cantidad'))
    js_products = [item['producto__nombre'] for item in productos_data]
    js_units = [item['unidades'] for item in productos_data]

    # 4. EVOLUCIÓN MENSUAL (Ventas vs Gastos - Versión compatible con SQLite)
    # Extraemos el número del mes para evitar errores de TruncMonth en SQLite
    evolucion_ventas = pedido.objects.annotate(mes_num=ExtractMonth('fecha'))\
        .values('mes_num').annotate(monto=Sum('total')).order_by('mes_num')
    
    evolucion_gastos = compra.objects.annotate(mes_num=ExtractMonth('fecha_suministro'))\
        .values('mes_num').annotate(
            total_gasto=Sum(Cast(F('cantidad'), FloatField()) * Cast(F('precio_unidad'), FloatField()), output_field=FloatField())
        ).order_by('mes_num')

    nombres_meses = {1:'Ene', 2:'Feb', 3:'Mar', 4:'Abr', 5:'May', 6:'Jun',7:'Jul', 8:'Ago', 9:'Sep', 10:'Oct', 11:'Nov', 12:'Dic'}

    data_final = {}
    # Llenar datos de ventas
    for v in evolucion_ventas:
        mes_nombre = nombres_meses.get(v['mes_num'], 'S/N')
        data_final[mes_nombre] = {'ventas': float(v['monto']), 'gastos': 0.0}
    
    # Llenar datos de gastos y calcular acumulado
    total_gastos_acumulados = 0
    for g in evolucion_gastos:
        mes_nombre = nombres_meses.get(g['mes_num'], 'S/N')
        gasto_valor = float(g['total_gasto'])
        total_gastos_acumulados += gasto_valor
        if mes_nombre in data_final:
            data_final[mes_nombre]['gastos'] = gasto_valor
        else:
            data_final[mes_nombre] = {'ventas': 0.0, 'gastos': gasto_valor}

    # 5. CÁLCULO DE UTILIDAD Y MARGEN
    utilidad_neta = float(total_ventas_mes) - total_gastos_acumulados
    margen = (utilidad_neta / float(total_ventas_mes) * 100) if total_ventas_mes > 0 else 0

    # 6. ALERTAS Y LOGÍSTICA
    # Insumos con cantidad menor a 5
    insumos_criticos = insumo.objects.filter(cantidad__lt=5).count()
    # Despachos que NO están terminados (incluye los que tengan "0" o "En proceso")
    # Para que sea más exacto, contamos lo que diga "En proceso"
    pendientes = despacho.objects.filter(estado_entrega="En proceso").count()

    context = {
        'titulo_pagina': 'GESTIÓN DE REPORTES - BEDCOM',
        'total_ventas': total_ventas_mes,
        'utilidad_neta': utilidad_neta,
        'margen': round(margen, 1),
        'producto_top': producto_top,
        'insumos_criticos': insumos_criticos,
        'pendientes': pendientes,
        'js_products': json.dumps(js_products),
        'js_units': json.dumps(js_units),
        'js_months': json.dumps(list(data_final.keys())),
        'js_sales_values': json.dumps([d['ventas'] for d in data_final.values()]),
        'js_expenses_values': json.dumps([d['gastos'] for d in data_final.values()]),
    }
    return render(request, 'reportes/index_reportes.html', context)