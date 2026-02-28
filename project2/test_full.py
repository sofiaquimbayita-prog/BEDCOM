import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.utils import timezone
from app.models import pedido, compra
from django.db.models import Sum, F, FloatField
from django.db.models.functions import TruncMonth

print(f"Mes actual: {timezone.now().month}")

# Ventas mes actual
ventas_mes = pedido.objects.filter(
    fecha__month=timezone.now().month,
    fecha__year=timezone.now().year
).aggregate(Sum('total'))['total__sum'] or 0

print(f"Ventas del mes: ${ventas_mes}")

# Evolución de ventas
evol_ventas = pedido.objects.annotate(
    mes=TruncMonth('fecha')
).values('mes').annotate(monto=Sum('total')).order_by('mes')

print("\nEvolución de ventas:")
for v in evol_ventas:
    print(f"  {v['mes']}: ${v['monto']}")

# Evolución de gastos
evol_gastos = compra.objects.annotate(
    mes=TruncMonth('fecha_suministro')
).values('mes').annotate(
    total_gasto=Sum(F('cantidad') * F('precio_unidad'), output_field=FloatField())
).order_by('mes')

print("\nEvolución de gastos:")
for g in evol_gastos:
    print(f"  {g['mes']}: ${g['total_gasto']}")
