import json
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.generic import ListView, View

from ...models import cliente, pedido, pago, historial_acciones


# ─────────────────────────────────────────────
# HELPER: serializar cliente a dict
# ─────────────────────────────────────────────
def _cliente_to_dict(obj):
    return {
        'id':        obj.id,
        'nombre':    obj.nombre,
        'telefono':  obj.telefono,
        'direccion': obj.direccion,
        'email':     obj.email or '',
        'es_especial': obj.es_especial,
        'estado':    obj.estado,
    }


# ─────────────────────────────────────────────
# HELPER: calcular deuda de un cliente
#
# FIX: Antes usaba registros de la tabla `pago`, pero el abono inicial
# del pedido se guarda en pedido.abono y NO crea un registro pago
# (hasta que PedidoCreateView lo crea explícitamente).
# Ahora se usa pedido.abono directamente, que es la misma fuente
# que usa saldo_pendiente en el modelo → coherencia total.
# ─────────────────────────────────────────────
def _calcular_deuda(cli):
    result = pedido.objects.filter(
        cliente=cli,
        estado__in=['Pendiente', 'Completado']
    ).aggregate(
        total_pedidos=Sum('total'),
        total_abonado=Sum('abono')
    )
    total    = result['total_pedidos']  or Decimal('0')
    abonado  = result['total_abonado']  or Decimal('0')
    return max(total - abonado, Decimal('0'))


# ─────────────────────────────────────────────
# LISTA PRINCIPAL
# ─────────────────────────────────────────────
class ClienteListView(ListView):
    model = cliente
    template_name = 'clientes/cliente_list.html'
    context_object_name = 'clientes'
    ordering = ['nombre']

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['total_clientes']  = cliente.objects.count()
        ctx['activos']         = cliente.objects.filter(estado=True).count()
        ctx['inactivos']= cliente.objects.filter(estado=False).count()
        ctx['con_deuda']= sum(1 for c in cliente.objects.filter(estado=True) if _calcular_deuda(c) > 0)
        return ctx


# ─────────────────────────────────────────────
# API: obtener detalle de un cliente (modal ver / editar)
# ─────────────────────────────────────────────
class ClienteDetailView(View):
    def get(self, request, pk, *args, **kwargs):
        obj = get_object_or_404(cliente, pk=pk)
        data = _cliente_to_dict(obj)
        data['deuda'] = str(_calcular_deuda(obj))
        return JsonResponse({'ok': True, 'cliente': data})


# ─────────────────────────────────────────────
# API: crear cliente
# ─────────────────────────────────────────────
class ClienteCreateView(View):
    def post(self, request, *args, **kwargs):
        try:
            data      = json.loads(request.body)
            nombre    = data.get('nombre', '').strip()
            telefono  = data.get('telefono', '').strip()
            direccion = data.get('direccion', '').strip()
            email     = data.get('email', '').strip() or None
            es_especial = bool(data.get('es_especial', False))

            if not nombre:
                return JsonResponse({'ok': False, 'error': 'El nombre es obligatorio.'})

            with transaction.atomic():
                obj = cliente.objects.create(
                    nombre=nombre,
                    telefono=telefono or '—',
                    direccion=direccion or '—',
                    email=email,
                    es_especial=es_especial,
                    estado=True
                )

            if request.user.is_authenticated:
                historial_acciones.objects.create(
                    modulo='clientes',
                    tipo_accion='crear',
                    descripcion=f'Creó el cliente "{obj.nombre}"',
                    usuario=request.user
                )

            return JsonResponse({
                'ok': True,
                'message': f'Cliente "{obj.nombre}" creado exitosamente.',
                'cliente': _cliente_to_dict(obj)
            })

        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# API: editar cliente
# ─────────────────────────────────────────────
class ClienteUpdateView(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            data      = json.loads(request.body)
            obj       = get_object_or_404(cliente, pk=pk)
            nombre    = data.get('nombre', '').strip()
            telefono  = data.get('telefono', '').strip()
            direccion = data.get('direccion', '').strip()
            email     = data.get('email', '').strip() or None
            es_especial = bool(data.get('es_especial', False))

            if not nombre:
                return JsonResponse({'ok': False, 'error': 'El nombre es obligatorio.'})

            with transaction.atomic():
                obj.nombre    = nombre
                obj.telefono  = telefono or '—'
                obj.direccion = direccion or '—'
                obj.email     = email
                obj.es_especial = es_especial
                obj.save()

            if request.user.is_authenticated:
                historial_acciones.objects.create(
                    modulo='clientes',
                    tipo_accion='editar',
                    descripcion=f'Actualizó el cliente "{obj.nombre}"',
                    usuario=request.user
                )

            return JsonResponse({
                'ok': True,
                'message': f'Cliente "{obj.nombre}" actualizado correctamente.',
                'cliente': _cliente_to_dict(obj)
            })

        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# API: activar / inactivar cliente
# ─────────────────────────────────────────────
class ClienteToggleEstadoView(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            obj = get_object_or_404(cliente, pk=pk)
            obj.estado = not obj.estado
            obj.save()
            accion = 'activado' if obj.estado else 'inactivado'
            
            if request.user.is_authenticated:
                historial_acciones.objects.create(
                    modulo='clientes',
                    tipo_accion='activar' if obj.estado else 'inactivar',
                    descripcion=f'Cambió estado de cliente "{obj.nombre}" a {accion}',
                    usuario=request.user
                )
            return JsonResponse({
                'ok': True,
                'message': f'Cliente "{obj.nombre}" {accion} correctamente.',
                'estado': obj.estado
            })
        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# API: historial de pagos de un cliente
#
# FIX: ahora muestra tanto el abono inicial (registrado como pago
# en PedidoCreateView) como los pagos adicionales.
# Los registros `pago` son la fuente única de verdad para el historial.
# ─────────────────────────────────────────────
class ClientePagosHistorialView(View):
    def get(self, request, pk, *args, **kwargs):
        obj = get_object_or_404(cliente, pk=pk)
        pagos_list = pago.objects.filter(
            pedido__cliente=obj,
            estado=True
        ).select_related('pedido').order_by('-fecha_pago')

        pagos_data   = []
        total_pagado = Decimal('0')
        for p_item in pagos_list:
            pagos_data.append({
                'id':           p_item.id,
                'fecha':        p_item.fecha_pago.strftime('%d/%m/%Y'),
                'monto':        str(p_item.monto),
                'pedido_id':    p_item.pedido.id,
                'pedido_total': str(p_item.pedido.total),
            })
            total_pagado += p_item.monto

        return JsonResponse({
            'ok':          True,
            'cliente':     _cliente_to_dict(obj),
            'pagos':       pagos_data,
            'total_pagado': str(total_pagado),
            'total_pagos':  len(pagos_data),
        })


# ─────────────────────────────────────────────
# API: historial de pedidos de un cliente
# ─────────────────────────────────────────────
class ClienteHistorialView(View):
    def get(self, request, pk, *args, **kwargs):
        obj     = get_object_or_404(cliente, pk=pk)
        pedidos = pedido.objects.filter(cliente=obj).order_by('-fecha').select_related('cliente').prefetch_related('detalles__producto')

        pedidos_list = []
        for p in pedidos:
            pendiente = p.saldo_pendiente
            
            # Detalles del pedido (productos)
            detalles_list = []
            for d in p.detalles.all():
                detalles_list.append({
                    'producto':      d.producto.nombre,
                    'cantidad':      d.cantidad,
                    'precio_unitario': str(d.precio_unitario),
                    'sub_total':     str(d.sub_total),
                    'observaciones': d.observaciones or '',
                })
            
            pedidos_list.append({
                'id':        p.id,
                'fecha':     p.fecha.strftime('%d/%m/%Y %H:%M'),
                'estado':    p.estado,
                'total':     str(p.total),
                'pagado':    str(p.abono or Decimal('0')),
                'pendiente': str(max(pendiente, Decimal('0'))),
                'detalles':  detalles_list,
                'cantidad_productos': len(detalles_list),
            })

        deuda_total = _calcular_deuda(obj)

        return JsonResponse({
            'ok':            True,
            'cliente':       _cliente_to_dict(obj),
            'pedidos':       pedidos_list,
            'deuda_total':   str(deuda_total),
            'total_pedidos': len(pedidos_list),
        })


# ─────────────────────────────────────────────
# API: registrar un pago a un pedido del cliente
# (endpoint legacy — los pagos ahora se hacen desde la vista de Pedidos)
# Se mantiene por compatibilidad pero delega la lógica correcta.
# ─────────────────────────────────────────────
class ClientePagoView(View):
    def post(self, request, *args, **kwargs):
        try:
            data      = json.loads(request.body)
            pedido_id = data.get('pedido_id')
            monto_raw = data.get('monto', 0)

            if not pedido_id:
                return JsonResponse({'ok': False, 'error': 'Se requiere el ID del pedido.'})

            monto = Decimal(str(monto_raw))
            if monto <= 0:
                return JsonResponse({'ok': False, 'error': 'El monto debe ser mayor a cero.'})

            with transaction.atomic():
                p = get_object_or_404(pedido, pk=pedido_id)
                saldo_pendiente = p.saldo_pendiente

                if monto > saldo_pendiente:
                    return JsonResponse({
                        'ok': False,
                        'error': f'El monto ingresado (${monto}) supera el saldo pendiente (${saldo_pendiente:.2f}).'
                    })

                # FIX: crear registro pago Y actualizar abono (coherencia)
                pago.objects.create(pedido=p, monto=monto)
                p.abono = (p.abono or Decimal('0')) + monto

                # Si el pedido queda saldado, marcarlo como Completado
                if p.saldo_pendiente <= 0 and p.estado == 'Pendiente':
                    p.estado = 'Completado'
                p.save()

            if request.user.is_authenticated:
                historial_acciones.objects.create(
                    modulo='clientes',
                    tipo_accion='editar',
                    descripcion=f'Registró pago de ${monto} al cliente "{p.cliente.nombre}" (Pedido #{p.id})',
                    usuario=request.user
                )

            deuda_nueva = _calcular_deuda(p.cliente)

            return JsonResponse({
                'ok':          True,
                'message':     f'Pago de ${monto:.2f} registrado en el pedido #{p.id}.',
                'deuda_nueva': str(deuda_nueva),
            })

        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# API: datos para la tabla principal (JSON)
# ─────────────────────────────────────────────
class ClienteDataView(View):
    def get(self, request, *args, **kwargs):
        clientes = cliente.objects.all().order_by('nombre')
        data = []
        for c in clientes:
            deuda         = _calcular_deuda(c)
            total_pedidos = pedido.objects.filter(cliente=c).count()
            data.append({
                **_cliente_to_dict(c),
                'deuda':         str(deuda),
                'total_pedidos': total_pedidos,
                'email':         c.email or '',
            })
        return JsonResponse({'ok': True, 'clientes': data})
