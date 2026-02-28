import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from app.models import pedido
from django.db.models import Sum
from django.db.models.functions import TruncMonth

result = pedido.objects.annotate(
    mes=TruncMonth('fecha')
).values('mes').annotate(
    total_ventas=Sum('total')
).order_by('mes')

print('Ventas por mes:')
for r in result:
    print(f'  {r["mes"]}: ${r["total_ventas"]}')
