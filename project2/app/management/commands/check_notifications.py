from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from app.views.monitoreo.views import api_check_triggers
from django.http import HttpRequest
from app.models import Notificacion
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Ejecuta check de triggers de notificaciones para todos los usuarios activos'

    def handle(self, *args, **options):
        User = get_user_model()
        users = User.objects.filter(is_active=True)
        total_notifs = 0
        
        self.stdout.write(f'🔍 Verificando triggers para {users.count()} usuarios activos...')

        for user in users:
            # Mock request para api_check_triggers
            class MockRequest:
                user = user
                method = 'POST'
            
            # Call logic de api_check_triggers (copiar de views)
            from django.utils import timezone
            from datetime import date
            from app.models import insumo, producto, calendario, despacho, bom, pedido
            today = date.today()
            tomorrow = today + timedelta(days=1)
            created = 0
            
            # Low stock insumos
            low_insumos = insumo.objects.filter(cantidad__lt=10)
            for i in low_insumos:
                if not Notificacion.objects.filter(
                    user=user, tipo='bajo_stock_insumo', target_id=i.id
                ).exists():
                    Notificacion.objects.create(
                        user=user, tipo='bajo_stock_insumo', target_id=i.id,
                        titulo=f"Bajo stock insumo {i.nombre}", 
                        mensaje=f"{i.nombre}: {i.cantidad} unidades"
                    )
                    created += 1
            
            # Low stock productos
            low_prods = producto.objects.filter(stock__lt=5, estado=True)
            for p in low_prods:
                if not Notificacion.objects.filter(
                    user=user, tipo='bajo_stock_producto', target_id=p.id
                ).exists():
                    Notificacion.objects.create(
                        user=user, tipo='bajo_stock_producto', target_id=p.id,
                        titulo=f"Bajo stock producto {p.nombre}", 
                        mensaje=f"{p.nombre}: {p.stock} unidades"
                    )
                    created += 1
            
            # Calendario
            cal_hoy = calendario.objects.filter(fecha=today, estado='pendiente')
            for c in cal_hoy:
                Notificacion.objects.get_or_create(user=user, tipo='calendario_hoy', target_id=c.id)
                created += 1
            
            # Despachos pendientes
            desp_pend = despacho.objects.filter(estado='pendiente')
            for d in desp_pend:
                Notificacion.objects.get_or_create(user=user, tipo='pendido_despacho', target_id=d.id)
                created += 1
            
            # Productos sin BOM
            prods_sin_bom = producto.objects.filter(estado=True).exclude(
                id__in=bom.objects.values('producto_id').distinct()
            )
            for p in prods_sin_bom:
                if not Notificacion.objects.filter(user=user, tipo='sin_bom', target_id=p.id).exists():
                    Notificacion.objects.create(user=user, tipo='sin_bom', target_id=p.id,
                        titulo=f"Producto sin BOM {p.nombre}")
                    created += 1
            
            # Pagos pendientes
            pedidos_pend = pedido.objects.filter(saldo_pendiente__gt=0)
            for ped in pedidos_pend:
                Notificacion.objects.get_or_create(user=user, tipo='pago_pendiente', target_id=ped.id)
                created += 1
            
            total_notifs += created
            logger.info(f'Usuario {user.username}: {created} notifs creadas')
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Completado: {total_notifs} notificaciones generadas para todos usuarios')
        )

