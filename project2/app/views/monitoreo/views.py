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
# APIs NOTIFICACIONES - REFACTORIZADAS
# =====================================================

@login_required
def api_notificaciones(request):
    """
    API: Lista TODAS las notificaciones del usuario (leídas + no leídas).
    Las notificaciones ya NO desaparecen al marcarlas como leídas.
    Solo desaparecen cuando la auto-resolución las elimina.
    """
    # Contar no leídas para el badge
    unread_count = Notificacion.objects.filter(user=request.user, leida=False).count()
    
    # Devolver TODAS las notificaciones (leídas Y no leídas), no solo las no leídas
    notifs = Notificacion.objects.filter(
        user=request.user
    ).select_related('user').order_by('-fecha_notif')[:50].values(
        'id', 'titulo', 'mensaje', 'fecha_notif', 'tipo', 'target_id', 'leida'
    )
    
    return JsonResponse({
        'success': True, 
        'count': unread_count,  # Badge solo cuenta no leídas
        'total': Notificacion.objects.filter(user=request.user).count(),
        'data': list(notifs),
        'badge': unread_count if unread_count > 0 else ''
    })


@login_required
def api_notificaciones_agrupadas(request):
    """
    API: Notificaciones agrupadas por tipo para vista anti-spam.
    Cada tipo retorna un grupo con conteo y items individuales.
    """
    user = request.user
    
    # Mapa de títulos amigables por tipo
    TIPO_LABELS = {
        'bajo_stock_insumo': 'Bajo stock insumos',
        'bajo_stock_producto': 'Bajo stock productos',
        'calendario_hoy': 'Eventos de hoy',
        'calendario_manaña': 'Eventos de mañana',
        'pendido_despacho': 'Despachos pendientes',
        'sin_bom': ' Productos sin receta BOM',
        'reporte_generado': 'Reportes generados',
        'despacho_completado': 'Despachos completados',
        'pago_pendiente': 'Pagos pendientes',
        'mantenimiento_nueva': 'Mantenimientos nuevos',
    }
    
    # Mapa de iconos por tipo
    TIPO_ICONS = {
        'bajo_stock_insumo': 'fas fa-exclamation-triangle',
        'bajo_stock_producto': 'fas fa-box-open',
        'calendario_hoy': 'fas fa-calendar-day',
        'calendario_manaña': 'fas fa-calendar-alt',
        'pendido_despacho': 'fas fa-truck',
        'sin_bom': 'fas fa-cogs',
        'reporte_generado': 'fas fa-chart-bar',
        'despacho_completado': 'fas fa-check-circle',
        'pago_pendiente': 'fas fa-money-bill-wave',
        'mantenimiento_nueva': 'fas fa-wrench',
    }
    
    # Colores CSS por tipo
    TIPO_COLORS = {
        'bajo_stock_insumo': '#f59e0b',
        'bajo_stock_producto': '#ef4444',
        'calendario_hoy': '#3b82f6',
        'calendario_manaña': '#6366f1',
        'pendido_despacho': '#f97316',
        'sin_bom': '#8b5cf6',
        'reporte_generado': '#10b981',
        'despacho_completado': '#22c55e',
        'pago_pendiente': '#eab308',
        'mantenimiento_nueva': '#64748b',
    }
    
    all_notifs = Notificacion.objects.filter(user=user).order_by('tipo', '-fecha_notif')
    
    # Agrupar por tipo
    grupos = {}
    for n in all_notifs:
        if n.tipo not in grupos:
            grupos[n.tipo] = {
                'tipo': n.tipo,
                'titulo_grupo': TIPO_LABELS.get(n.tipo, n.tipo),
                'icon': TIPO_ICONS.get(n.tipo, 'fas fa-bell'),
                'color': TIPO_COLORS.get(n.tipo, '#94a3b8'),
                'cantidad': 0,
                'no_leidas': 0,
                'items': [],
            }
        grupos[n.tipo]['cantidad'] += 1
        if not n.leida:
            grupos[n.tipo]['no_leidas'] += 1
        grupos[n.tipo]['items'].append({
            'id': n.id,
            'titulo': n.titulo,
            'mensaje': n.mensaje,
            'leida': n.leida,
            'fecha_notif': n.fecha_notif.isoformat(),
            'target_id': n.target_id,
        })
    
    # Ordenar: primero los que tienen no leídas, luego por cantidad
    grupos_list = sorted(
        grupos.values(), 
        key=lambda g: (-g['no_leidas'], -g['cantidad'])
    )
    
    unread_count = Notificacion.objects.filter(user=user, leida=False).count()
    
    return JsonResponse({
        'success': True,
        'count': unread_count,
        'total': Notificacion.objects.filter(user=user).count(),
        'grupos': grupos_list,
    })


@login_required
def api_mark_read(request, pk):
    """
    API: Marcar notificación como LEÍDA.
    La notificación NO se elimina, solo cambia de estado visual.
    """
    try:
        notif = Notificacion.objects.get(id=pk, user=request.user)
        notif.leida = True
        notif.save()
        return JsonResponse({'success': True, 'message': 'Leída'})
    except Notificacion.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'No encontrada'}, status=404)


@login_required
def api_mark_group_read(request, tipo):
    """
    API: Marcar TODAS las notificaciones de un tipo como leídas.
    """
    count = Notificacion.objects.filter(
        user=request.user, tipo=tipo, leida=False
    ).update(leida=True)
    return JsonResponse({'success': True, 'marcadas': count})


@login_required
def api_check_triggers(request):
    """
    API: VERIFICAR TRIGGERS y crear notificaciones nuevas.
    INCLUYE AUTO-RESOLUCIÓN: elimina notificaciones cuya condición ya no existe.
    """
    from django.utils import timezone
    from datetime import date, timedelta
    today = date.today()
    tomorrow = today + timedelta(days=1)
    user = request.user
    created = []
    resolved = []
    
    # ═══════════════════════════════════════════════════
    # FASE 1: AUTO-RESOLUCIÓN (limpiar notifs obsoletas)
    # ═══════════════════════════════════════════════════
    
    # 1a. Resolver bajo_stock_producto: si stock ya >= 5, eliminar notif
    notifs_stock_prod = Notificacion.objects.filter(user=user, tipo='bajo_stock_producto')
    for notif in notifs_stock_prod:
        try:
            prod = producto.objects.get(id=notif.target_id)
            if prod.stock >= 5 or not prod.estado:
                resolved.append(f'Resuelto: stock {prod.nombre} = {prod.stock}')
                notif.delete()
        except producto.DoesNotExist:
            notif.delete()
            resolved.append(f'Resuelto: producto eliminado id={notif.target_id}')
    
    # 1b. Resolver bajo_stock_insumo: si cantidad ya >= 10
    notifs_stock_ins = Notificacion.objects.filter(user=user, tipo='bajo_stock_insumo')
    for notif in notifs_stock_ins:
        try:
            ins = insumo.objects.get(id=notif.target_id)
            if ins.cantidad >= 10:
                resolved.append(f'Resuelto: insumo {ins.nombre} = {ins.cantidad}')
                notif.delete()
        except insumo.DoesNotExist:
            notif.delete()
            resolved.append(f'Resuelto: insumo eliminado id={notif.target_id}')
    
    # 1c. Resolver despachos: si ya no está pendiente
    notifs_despacho = Notificacion.objects.filter(user=user, tipo='pendido_despacho')
    for notif in notifs_despacho:
        try:
            desp = despacho.objects.get(id=notif.target_id)
            if desp.estado != 'pendiente':
                resolved.append(f'Resuelto: despacho #{desp.id} estado={desp.estado}')
                notif.delete()
        except despacho.DoesNotExist:
            notif.delete()
            resolved.append(f'Resuelto: despacho eliminado id={notif.target_id}')
    
    # 1d. Resolver pagos: si abono >= total
    notifs_pago = Notificacion.objects.filter(user=user, tipo='pago_pendiente')
    for notif in notifs_pago:
        try:
            ped = pedido.objects.get(id=notif.target_id)
            if (ped.abono or 0) >= ped.total:
                resolved.append(f'Resuelto: pedido #{ped.id} pagado')
                notif.delete()
        except pedido.DoesNotExist:
            notif.delete()
            resolved.append(f'Resuelto: pedido eliminado id={notif.target_id}')
    
    # 1e. Resolver sin_bom: si el producto ya tiene BOM
    notifs_bom = Notificacion.objects.filter(user=user, tipo='sin_bom')
    for notif in notifs_bom:
        try:
            prod = producto.objects.get(id=notif.target_id)
            if bom.objects.filter(producto_id=prod.id).exists() or not prod.estado:
                resolved.append(f'Resuelto: BOM asignado a {prod.nombre}')
                notif.delete()
        except producto.DoesNotExist:
            notif.delete()
            resolved.append(f'Resuelto: producto eliminado id={notif.target_id}')
    
    # 1f. Resolver calendario: eventos pasados o completados
    notifs_cal = Notificacion.objects.filter(user=user, tipo__in=['calendario_hoy', 'calendario_manaña'])
    for notif in notifs_cal:
        try:
            ev = calendario.objects.get(id=notif.target_id)
            if ev.estado != 'pendiente' or ev.fecha < today:
                resolved.append(f'Resuelto: evento {ev.titulo}')
                notif.delete()
        except calendario.DoesNotExist:
            notif.delete()
            resolved.append(f'Resuelto: evento eliminado id={notif.target_id}')
    
    # ═══════════════════════════════════════════════════
    # FASE 2: CREAR NUEVAS NOTIFICACIONES
    # ═══════════════════════════════════════════════════
    
    # 2a. BAJO STOCK INSUMOS <10
    low_insumos = insumo.objects.filter(cantidad__lt=10, estado='Activo')
    for ins in low_insumos:
        if not Notificacion.objects.filter(
            user=user, tipo='bajo_stock_insumo', target_id=ins.id
        ).exists():
            Notificacion.objects.create(
                user=user, tipo='bajo_stock_insumo',
                titulo=f"Bajo stock: {ins.nombre}",
                mensaje=f"Insumo {ins.nombre} solo {ins.cantidad} unidades (min:10)",
                target_id=ins.id,
                data_json={'cantidad': ins.cantidad}
            )
            created.append(f'Low insumo {ins.nombre}')
    
    # 2b. BAJO STOCK PRODUCTOS <5
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
    
    # 2c. CALENDARIO HOY/MAÑANA pendiente
    eventos_hoy = calendario.objects.filter(
        fecha=today, estado='pendiente'
    )
    for ev in eventos_hoy:
        Notificacion.objects.get_or_create(
            user=user, tipo='calendario_hoy', target_id=ev.id,
            defaults={
                'titulo': f"Evento HOY: {ev.titulo}",
                'mensaje': f"{(ev.descripcion or '')[:100]}... Hora: {ev.hora}",
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
    
    # 2d. DESPACHOS PENDIENTES
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
    
    # 2e. PRODUCTOS SIN BOM (sin receta)
    productos_sin_bom = producto.objects.filter(
        estado=True
    ).exclude(id__in=bom.objects.values('producto_id').distinct())
    for prod in productos_sin_bom:
        if not Notificacion.objects.filter(
            user=user, tipo='sin_bom', target_id=prod.id
        ).exists():
            Notificacion.objects.create(
                user=user, tipo='sin_bom',
                titulo=f"Producto sin BOM: {prod.nombre}",
                mensaje=f"{prod.nombre} no tiene receta de materiales asignada",
                target_id=prod.id
            )
            created.append(f'Sin BOM {prod.nombre}')
    
    # 2f. PEDIDOS PAGO PENDIENTE
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
        'resueltas': len(resolved),
        'detalles_creadas': created[:5],
        'detalles_resueltas': resolved[:5],
        'total_count': Notificacion.objects.filter(user=user, leida=False).count()
    })
