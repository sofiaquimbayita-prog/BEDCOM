from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.http import JsonResponse, HttpResponse
from django.urls import reverse
from django.shortcuts import render
from webpush import send_user_notification

from app.models import (historial_acciones, producto, insumo, entrada, salida_producto, calendario,Notificacion, bom, pedido, despacho)

from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, F

@method_decorator(login_required, name='dispatch')
class MonitoreoView(TemplateView):
    template_name = 'monitoreo/monitoreo.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # 2. CARGAR KPIs (Indicadores)
        # Total stock units (todos productos activos)
        from django.db.models import Sum
        total_stock = producto.objects.filter(estado=True).aggregate(total_stock=Sum('stock'))['total_stock']
        context['stock_total'] = total_stock or 0
        
        # Insumos bajos (ejemplo: menos de 10 unidades)
        context['insumos_bajos'] = insumo.objects.filter(cantidad__lte=10).count()
        
        today = timezone.now().date()
        # Producción hoy: count entradas de hoy
        context['produccion_hoy'] = entrada.objects.filter(fecha__date=today, estado=True, anulado=False).count()
        # Salidas hoy
        context['salidas_hoy'] = salida_producto.objects.filter(fecha=today, estado=True).count()

        # 3. URLs para redirección desde las tarjetas
        # Usamos try/except por si alguna URL no está definida aún en urls.py
        try: context['productos_url'] = reverse('productos')
        except: context['productos_url'] = '#'
            
        try: context['insumos_url'] = reverse('insumos')
        except: context['insumos_url'] = '#'
            
        try: context['entrada_p_url'] = reverse('entrada_p')
        except: context['entrada_p_url'] = '#'
        
        try: context['salida_p_url'] = reverse('salida_producto')
        except: context['salida_p_url'] = '#'

        # NOTIFS COUNT for monitoreo page
        context['unread_count'] = Notificacion.objects.filter(user=self.request.user, leida=False).count()
        return context








@login_required
def api_kpis(request):
    """API endpoint para obtener KPIs en tiempo real"""
    if request.method == 'GET':
        from app.models import entrada, salida_producto
        from django.utils import timezone
        today = timezone.now().date()
        data = {
            'produccion_hoy': entrada.objects.filter(fecha__date=today, estado=True, anulado=False).count(),
            'salidas_hoy': salida_producto.objects.filter(fecha=today, estado=True).count(),
            'total_eventos': 150,
            'eventos_activos': 45,
            'tasa_exito': 87.5,
            'tiempo_promedio': 12.3,
        }
        return JsonResponse(data)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@login_required
def test_notificacion(request):
    payload = {
        "title": "¡Prueba BEDCOM!",
        "body": "Notificaciones Web Push funcionando correctamente.",
        "url": "/vistas/menu/"
    }
    try:
        send_user_notification(user=request.user, payload=payload, ttl=1000)
        return HttpResponse("Notificación enviada a " + request.user.username + ". Revisa tu navegador.")
    except Exception as e:
        return HttpResponse(" Error: " + str(e))


# =====================================================
# NUEVAS APIs NOTIFICACIONES - PASO 2
# =====================================================
@login_required
def api_notificaciones(request):
    """
    API: Lista notificaciones NO LEÍDAS del usuario + badge count
    DataTable expects 'data' key for notifications array
    """
    count = Notificacion.objects.filter(user=request.user, leida=False).count()
    notifs = Notificacion.objects.filter(user=request.user, leida=False).select_related('user').order_by('-fecha_notif')[:10].values(
        'id', 'titulo', 'mensaje', 'fecha_notif', 'tipo', 'target_id', 'leida'
    )
    
    return JsonResponse({
        'success': True, 
        'count': count,
        'data': list(notifs),  # DataTable expects 'data' key
        'badge': count if count > 0 else ''
    })


@login_required
def api_mark_read(request, pk):
    """
    API: Marcar notificación como LEÍDA
    """
    try:
        notif = Notificacion.objects.get(id=pk, user=request.user)
        notif.leida = True
        notif.save()
        # Opcional: webpush confirm
        return JsonResponse({'success': True, 'message': 'Leída'})
    except Notificacion.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'No encontrada'}, status=404)


@login_required
def api_check_triggers(request):
    """
    API: VERIFICAR TRIGGERS y crear notificaciones nuevas
    """
    from django.utils import timezone
    from datetime import date, timedelta
    today = date.today()
    tomorrow = today + timedelta(days=1)
    user = request.user
    created = []
    
    # 1. BAJO STOCK INSUMOS <10
    low_insumos = insumo.objects.filter(cantidad__lt=10, estado='Activo')
    for ins in low_insumos:
        if not Notificacion.objects.filter(
            user=user, tipo='bajo_stock_insumo', target_id=ins.id
        ).exists():
            Notificacion.objects.create(
                user=user, tipo='bajo_stock_insumo',
                titulo=f" Bajo stock: {ins.nombre}",
                mensaje=f"Insumo {ins.nombre} solo {ins.cantidad} unidades (min:10)",
                target_id=ins.id,
                data_json={'cantidad': ins.cantidad}
            )
            created.append(f'Low insumo {ins.nombre}')
    
    # 2. BAJO STOCK PRODUCTOS <5
    low_productos = producto.objects.filter(stock__lt=5, estado=True)
    for prod in low_productos:
        if not Notificacion.objects.filter(
            user=user, tipo='bajo_stock_producto', target_id=prod.id
        ).exists():
            Notificacion.objects.create(
                user=user, tipo='bajo_stock_producto',
                titulo=f"Bajo stock: {prod.nombre}",
                mensaje=f"Producto {prod.nombre} solo {prod.stock} unidades",
                target_id=prod.id,
                data_json={'stock': prod.stock}
            )
            created.append(f'Bajo stock prod {prod.nombre}')
    
    # 3. CALENDARIO HOY/MAÑANA pendiente
    eventos_hoy = calendario.objects.filter(
        fecha=today, estado='pendiente'
    )
    for ev in eventos_hoy:
        Notificacion.objects.get_or_create(
            user=user, tipo='calendario_hoy', target_id=ev.id,
            defaults={
                'titulo': f"Evento HOY: {ev.titulo}",
                'mensaje': f"{ev.descripcion[:100]}... Hora: {ev.hora}",
            }
        )
        created.append(f'Calendario hoy {ev.titulo}')
    
    eventos_manana = calendario.objects.filter(
        fecha=tomorrow, estado='pendiente'
    )
    for ev in eventos_manana:
        Notificacion.objects.get_or_create(
            user=user, tipo='calendario_manaña', target_id=ev.id,
            defaults={
                'titulo': f"Evento MAÑANA: {ev.titulo}",
                'mensaje': f"Preparar: {ev.titulo} - {ev.hora}",
            }
        )
        created.append(f'Calendario mañana {ev.titulo}')
    
    # 4. DESPACHOS PENDIENTES
    despachos_pend = despacho.objects.filter(estado='pendiente')
    for desp in despachos_pend:
        Notificacion.objects.get_or_create(
            user=user, tipo='pendido_despacho', target_id=desp.id,
            defaults={
                'titulo': f"Despacho pendiente #{desp.id}",
                'mensaje': f"Pedido {desp.pedido.id} de {desp.pedido.cliente.nombre}",
            }
        )
        created.append(f'Despacho pend {desp.id}')
    
    # 5. PRODUCTOS SIN BOM (sin receta)
    productos_sin_bom = producto.objects.filter(
        estado=True
    ).exclude(id__in=bom.objects.values('producto_id').distinct())
    for prod in productos_sin_bom:
        if not Notificacion.objects.filter(
            user=user, tipo='sin_bom', target_id=prod.id
        ).exists():
            Notificacion.objects.create(
                user=user, tipo='sin_bom',
                titulo=f" Producto sin BOM: {prod.nombre}",
                mensaje=f"{prod.nombre} no tiene receta de materiales asignada",
                target_id=prod.id
            )
            created.append(f'Sin BOM {prod.nombre}')
    
    # 6. PEDIDOS PAGO PENDIENTE
    pagos_pend = pedido.objects.filter(
        abono__lt=F('total')
    )
    for ped in pagos_pend:
        Notificacion.objects.get_or_create(
            user=user, tipo='pago_pendiente', target_id=ped.id,
            defaults={
                'titulo': f"Pago pendiente pedido #{ped.id}",
                'mensaje': f"Cliente {ped.cliente.nombre}: ${ped.saldo_pendiente:.2f}",
            }
        )
        created.append(f'Pago pend {ped.id}')
    
    return JsonResponse({
        'success': True, 
        'nuevas': len(created),
        'detalles': created[:5],  # Primeros 5
        'total_count': Notificacion.objects.filter(user=user, leida=False).count()
    })

