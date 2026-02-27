import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from app.models import compra
from django.db.models import Sum, F, FloatField
from django.db.models.functions import TruncMonth

result = compra.objects.annotate(
    mes=TruncMonth('fecha_suministro')
).values('mes').annotate(
    total_gasto=Sum(F('cantidad') * F('precio_unidad'), output_field=FloatField())
).order_by('mes')

print('Gastos por mes:')
for r in result:
    print(f'  {r["mes"]}: ${r["total_gasto"]}')
