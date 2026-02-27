import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

import json
from app.models import pedido, compra
from django.db.models import Sum, F, FloatField
from django.db.models.functions import TruncMonth

# Evolucion de ventas
evol_ventas = pedido.objects.annotate(mes=TruncMonth('fecha'))\
    .values('mes').annotate(monto=Sum('total')).order_by('mes')

# Evolucion de gastos
evol_gastos = compra.objects.annotate(mes=TruncMonth('fecha_suministro'))\
    .values('mes').annotate(
        total_gasto=Sum(F('cantidad') * F('precio_unidad'), output_field=FloatField())
    ).order_by('mes')

data_final = {}
for v in evol_ventas:
    mes_str = v['mes'].strftime('%b')
    data_final[mes_str] = {'ventas': float(v['monto']), 'gastos': 0.0}

total_gastos_acumulados = 0
for g in evol_gastos:
    mes_str = g['mes'].strftime('%b')
    gasto_valor = float(g['total_gasto'])
    total_gastos_acumulados += gasto_valor
    if mes_str in data_final:
        data_final[mes_str]['gastos'] = gasto_valor
    else:
        data_final[mes_str] = {'ventas': 0.0, 'gastos': gasto_valor}

print("data_final:", data_final)
print("js_months:", json.dumps(list(data_final.keys())))
print("js_sales_values:", json.dumps([d['ventas'] for d in data_final.values()]))
print("js_expenses_values:", json.dumps([d['gastos'] for d in data_final.values()]))
