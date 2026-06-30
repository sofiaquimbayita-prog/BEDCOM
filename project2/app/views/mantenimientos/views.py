import json
import re
from datetime import date
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.generic import ListView, View
from django.utils import timezone

from ...models import mantenimiento, pedido, producto, Notificacion, usuario

# ── Caracteres permitidos en descripción ──────────────────────────────────────
_DESCRIPCION_RE = re.compile(r'^[a-zA-Z0-9\sÁÉÍÓÚáéíóúÑñ.,\-]+$')

ESTADOS_VALIDOS = {key for key, _ in mantenimiento.ESTADO_CHOICES}


def _mantenimiento_to_dict(obj):
    """Serializa un objeto mantenimiento a dict para JSON."""
    return {
        'id': obj.id,
        # Nombre unificado para el JS (evita KeyError en modalBody)
        'fecha_solicitud': obj.fecha.strftime('%Y-%m-%d'),
        'fecha_solicitud_display': obj.fecha.strftime('%d/%m/%Y'),
        'pedido_id': obj.pedido.id if obj.pedido else None,
        'cliente_nombre': (obj.pedido.cliente.nombre
                           if obj.pedido and obj.pedido.cliente else 'N/A'),
        'producto_nombre': obj.producto.nombre if obj.producto else 'N/A',
        'descripcion_falla': obj.descripcion_falla or '',
        'estado_reparacion': obj.estado_reparacion,
        'estado_display': obj.get_estado_reparacion_display(),
    }


# ── ListView ──────────────────────────────────────────────────────────────────
class MantenimientoListView(ListView):
    model = mantenimiento
    template_name = 'mantenimientos/mantenimientos_list.html'
    context_object_name = 'mantenimientos'

    def get_queryset(self):
        return (mantenimiento.objects
                .select_related('pedido__cliente', 'producto')
                .order_by('-fecha'))

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['titulo_pagina'] = 'MANTENIMIENTOS'
        # Pedidos disponibles para asociar a un mantenimiento
        ctx['pedidos'] = (pedido.objects
                          .filter(estado__in=['Despachado', 'Completado'])
                          .select_related('cliente')
                          .order_by('-id'))
        ctx['productos'] = producto.objects.filter(estado=True)

        # KPIs
        qs = mantenimiento.objects
        ctx['total_mantenimientos'] = qs.count()
        ctx['recibidas']            = qs.filter(estado_reparacion='recibida').count()
        ctx['en_reparacion']        = qs.filter(estado_reparacion='en_reparacion').count()
        ctx['entregadas']           = qs.filter(estado_reparacion='entregada').count()
        return ctx


# ── CreateView ────────────────────────────────────────────────────────────────
class MantenimientoCreateView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({'ok': False, 'error': 'JSON inválido en la solicitud.'})

        try:
            pedido_id   = data.get('pedido_id') or None
            producto_id = data.get('producto_id')
            descripcion = data.get('descripcion_falla', '').strip()
            fecha_raw   = data.get('fecha_solicitud', '').strip()

            # ── Validaciones ──────────────────────────────────────────────────
            errores = []
            if not producto_id:
                errores.append('Debe seleccionar un producto.')
            if not descripcion:
                errores.append('La descripción de la falla es obligatoria.')
            elif len(descripcion) < 5:
                errores.append('La descripción debe tener al menos 5 caracteres.')
            elif len(descripcion) > 500:
                errores.append('La descripción no puede superar los 500 caracteres.')
            elif not _DESCRIPCION_RE.match(descripcion):
                errores.append('La descripción contiene caracteres no permitidos.')

            if fecha_raw:
                try:
                    fecha_obj = date.fromisoformat(fecha_raw)
                    if fecha_obj > date.today():
                        errores.append('La fecha no puede ser futura.')
                except ValueError:
                    errores.append('Formato de fecha inválido (use AAAA-MM-DD).')
            else:
                fecha_obj = timezone.now().date()

            if errores:
                return JsonResponse({'ok': False, 'error': ' | '.join(errores)})

            # ── Obtener objetos relacionados ──────────────────────────────────
            prod = get_object_or_404(producto, pk=producto_id, estado=True)
            ped  = None
            if pedido_id:
                ped = get_object_or_404(
                    pedido, pk=pedido_id, estado__in=['Despachado', 'Completado'])

            # ── Crear registro ────────────────────────────────────────────────
            obj = mantenimiento.objects.create(
                pedido=ped,
                producto=prod,
                fecha=fecha_obj,
                descripcion_falla=descripcion,
                estado_reparacion='recibida',
            )

            # ── Notificación ──────────────────────────────────────────────────
            admin_user = usuario.objects.first()
            if admin_user:
                Notificacion.objects.create(
                    user=admin_user,
                    tipo='mantenimiento_nueva',
                    titulo='Nuevo Mantenimiento Registrado',
                    mensaje=(f'Mantenimiento #{obj.id} registrado '
                             f'para el producto {prod.nombre}.'),
                    target_id=obj.id,
                )



            return JsonResponse({
                'ok': True,
                'message': f'Mantenimiento #{obj.id} registrado correctamente.',
                'mantenimiento': _mantenimiento_to_dict(obj),
            })

        except Exception as e:
            return JsonResponse({'ok': False, 'error': f'Error interno: {str(e)}'})


# ── UpdateEstadoView ──────────────────────────────────────────────────────────
class MantenimientoUpdateEstadoView(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            obj = get_object_or_404(mantenimiento, pk=pk)

            # Acepta tanto JSON como FormData (compatibilidad con el JS)
            content_type = request.content_type or ''
            if 'application/json' in content_type:
                try:
                    body = json.loads(request.body)
                    nuevo_estado = body.get('estado_reparacion', '').strip()
                except (json.JSONDecodeError, ValueError):
                    return JsonResponse({'ok': False, 'error': 'JSON inválido.'})
            else:
                # FormData enviado por el select del JS
                nuevo_estado = request.POST.get('estado_reparacion', '').strip()

            if not nuevo_estado:
                return JsonResponse({'ok': False, 'error': 'No se recibió el estado.'})
            if nuevo_estado not in ESTADOS_VALIDOS:
                return JsonResponse({'ok': False,
                                     'error': f'Estado "{nuevo_estado}" no es válido.'})

            estado_anterior = obj.estado_reparacion
            if estado_anterior == nuevo_estado:
                return JsonResponse({'ok': False,
                                     'error': 'El estado ya es el mismo, no hay cambios.'})

            obj.estado_reparacion = nuevo_estado
            obj.save(update_fields=['estado_reparacion'])



            return JsonResponse({
                'ok': True,
                'message': (f'Mantenimiento #{obj.id} actualizado a '
                            f'{obj.get_estado_reparacion_display()}.'),
                'mantenimiento': _mantenimiento_to_dict(obj),
            })

        except Exception as e:
            return JsonResponse({'ok': False, 'error': f'Error interno: {str(e)}'})


# ── DetailView ────────────────────────────────────────────────────────────────
class MantenimientoDetailView(View):
    def get(self, request, pk, *args, **kwargs):
        try:
            obj = get_object_or_404(
                mantenimiento.objects.select_related('pedido__cliente', 'producto'),
                pk=pk)
            return JsonResponse({'ok': True, 'mantenimiento': _mantenimiento_to_dict(obj)})
        except Exception as e:
            return JsonResponse({'ok': False, 'error': f'Error interno: {str(e)}'})