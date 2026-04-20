import json
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.generic import ListView, View

from ...models import cliente, pedido, pago


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
        'estado':    obj.estado,
        }


# ─────────────────────────────────────────────
# HELPER: calcular deuda de un cliente
# deuda = suma de pedidos Pendiente - pagos realizados
# ─────────────────────────────────────────────
def _calcular_deuda(cli):
    total_pedidos = pedido.objects.filter(
        cliente=cli,
        estado__in=['Pendiente', 'Completado']
    ).aggregate(t=Sum('total'))['t'] or Decimal('0')

    total_pagado = pago.objects.filter(
        pedido__cliente=cli,
        estado=True
    ).aggregate(t=Sum('monto'))['t'] or Decimal('0')

    return max(total_pedidos - total_pagado, Decimal('0'))


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
        # Estadísticas rápidas para las tarjetas del dashboard
        ctx['total_clientes']  = cliente.objects.count()
        ctx['activos']         = cliente.objects.filter(estado=True).count()
        ctx['inactivos']       = cliente.objects.filter(estado=False).count()
        ctx['con_deuda']       = sum(
            1 for c in cliente.objects.filter(estado=True) if _calcular_deuda(c) > 0
        )
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
            data    = json.loads(request.body)
            nombre  = data.get('nombre', '').strip()
            telefono = data.get('telefono', '').strip()
            direccion = data.get('direccion', '').strip()
            email    = data.get('email', '').strip() or None
            
            if not nombre:
                return JsonResponse({'ok': False, 'error': 'El nombre es obligatorio.'})
            with transaction.atomic():
                obj = cliente.objects.create(
                    nombre=nombre,
                    telefono=telefono or '—',
                    direccion=direccion or '—',
                    email=email,
                    estado=True
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
            data    = json.loads(request.body)
            obj     = get_object_or_404(cliente, pk=pk)
            nombre  = data.get('nombre', '').strip()
            telefono = data.get('telefono', '').strip()
            direccion = data.get('direccion', '').strip()
            email    = data.get('email', '').strip() or None
            
            if not nombre:
                return JsonResponse({'ok': False, 'error': 'El nombre es obligatorio.'})
            
            with transaction.atomic():
                obj.nombre    = nombre
                obj.telefono  = telefono or '—'
                obj.direccion = direccion or '—'
                obj.email     = email
                obj.save()

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
            return JsonResponse({
                'ok': True,
                'message': f'Cliente "{obj.nombre}" {accion} correctamente.',
                'estado': obj.estado
            })
        except Exception as e:
            return JsonResponse({'ok': False, 'error': str(e)})


# ─────────────────────────────────────────────
# API: historial de pedidos de un cliente
# ─────────────────────────────────────────────
class ClienteHistorialView(View):
    def get(self, request, pk, *args, **kwargs):
        obj = get_object_or_404(cliente, pk=pk)
        pedidos = pedido.objects.filter(cliente=obj).order_by('-fecha').select_related('cliente')

        pedidos_list = []
        for p in pedidos:
            pagos_pedido = pago.objects.filter(pedido=p, estado=True).aggregate(t=Sum('monto'))['t'] or Decimal('0')
            pendiente = max(p.total - pagos_pedido, Decimal('0'))
            pedidos_list.append({
                'id':        p.id,
                'fecha':     p.fecha.strftime('%d/%m/%Y %H:%M'),
                'estado':    p.estado,
                'total':     str(p.total),
                'pagado':    str(pagos_pedido),
                'pendiente': str(pendiente),
            })

        deuda_total = _calcular_deuda(obj)

        return JsonResponse({
            'ok':         True,
            'cliente':    _cliente_to_dict(obj),
            'pedidos':    pedidos_list,
            'deuda_total': str(deuda_total),
            'total_pedidos': len(pedidos_list),
        })


# ─────────────────────────────────────────────
# API: registrar un pago a un pedido del cliente
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

                # Calcular cuánto falta pagar en este pedido
                pagado_ya = pago.objects.filter(pedido=p, estado=True).aggregate(t=Sum('monto'))['t'] or Decimal('0')
                pendiente = p.total - pagado_ya

                if monto > pendiente:
                    return JsonResponse({
                        'ok': False,
                        'error': f'El monto ingresado (${monto}) supera el saldo pendiente (${pendiente:.2f}).'
                    })

                nuevo_pago = pago.objects.create(pedido=p, monto=monto)

                # Si el pedido queda saldado, marcarlo como Completado
                pagado_total = pagado_ya + monto
                if pagado_total >= p.total and p.estado == 'Pendiente':
                    p.estado = 'Completado'
                    p.save()

            deuda_nueva = _calcular_deuda(p.cliente)

            return JsonResponse({
                'ok':        True,
                'message':   f'Pago de ${monto:.2f} registrado en el pedido #{p.id}.',
                'deuda_nueva': str(deuda_nueva),
                'pago_id':   nuevo_pago.id,
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
            deuda = _calcular_deuda(c)
            total_pedidos = pedido.objects.filter(cliente=c).count()
            data.append({
                **_cliente_to_dict(c),
                'deuda':         str(deuda),
                'total_pedidos': total_pedidos,
                'email':         c.email or '',
            })
        return JsonResponse({'ok': True, 'clientes': data})