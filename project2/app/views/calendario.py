from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from datetime import date
from ..forms import calendarioForm
from ..models import calendario, CategoriaEvento


def _auto_cancelar_vencidos():
    calendario.objects.filter(
        estado=calendario.ESTADO_PENDIENTE,
        fecha__lt=date.today(),
        activo=True                       # solo cancela los activos
    ).update(estado=calendario.ESTADO_CANCELADO)


def calendario_view(request):
    categorias = CategoriaEvento.objects.filter(estado=True)
    return render(request, 'calendario/calendario.html', {'categorias': categorias})


def eventos_data_view(request):
    _auto_cancelar_vencidos()

    # ?inactivos=1  →  devuelve solo los inactivos
    # por defecto   →  devuelve solo los activos
    solo_inactivos = request.GET.get('inactivos') == '1'
    eventos = (
        calendario.objects
        .select_related('categoria')
        .filter(activo=not solo_inactivos)
    )

    data = [{
        'id':              e.id,
        'titulo':          e.titulo,
        'fecha':           e.fecha.strftime('%Y-%m-%d'),
        'fecha_display':   e.fecha.strftime('%d de %b %Y'),
        'hora':            e.hora.strftime('%H:%M'),
        'categoria':       e.categoria.nombre,
        'categoria_id':    e.categoria.id,
        'categoria_color': e.categoria.color,
        'descripcion':     e.descripcion or '',
        'estado':          e.estado,
        'activo':          e.activo,
    } for e in eventos]
    return JsonResponse({'data': data})


def obtener_evento_view(request, id):
    evento = get_object_or_404(calendario, id=id)
    return JsonResponse({
        'id':               evento.id,
        'titulo':           evento.titulo,
        'fecha':            evento.fecha.strftime('%Y-%m-%d'),
        'fecha_display':    evento.fecha.strftime('%d de %b %Y'),
        'hora':             evento.hora.strftime('%H:%M'),
        'categoria':        evento.categoria.id,
        'categoria_nombre': evento.categoria.nombre,
        'categoria_color':  evento.categoria.color,
        'descripcion':      evento.descripcion or '',
        'estado':           evento.estado,
        'activo':           evento.activo,
    })


def cambiar_estado_evento_view(request, id):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

    evento       = get_object_or_404(calendario, id=id)
    nuevo_estado = request.POST.get('estado', '').strip()
    estados_validos = [c[0] for c in calendario.ESTADO_CHOICES]

    if nuevo_estado not in estados_validos:
        return JsonResponse({'status': 'error', 'message': 'Estado no válido.'}, status=400)

    evento.estado = nuevo_estado
    evento.save(update_fields=['estado'])
    return JsonResponse({'status': 'success', 'estado': evento.estado})


def _guardar_evento(request, instancia=None):
    form = calendarioForm(request.POST, instance=instancia)

    if form.is_valid():
        evento = form.save()
        return JsonResponse({
            'status':  'success',
            'message': 'Evento guardado correctamente.',
            'id':      evento.id
        })

    errores = {}
    for campo, lista_errores in form.errors.items():
        errores[campo] = lista_errores[0]
    return JsonResponse({'status': 'error', 'errores': errores}, status=400)


def crear_evento_view(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    return _guardar_evento(request)


def editar_evento_view(request, id):
    evento = get_object_or_404(calendario, id=id)
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    return _guardar_evento(request, instancia=evento)


# ── Inactivar (reemplaza eliminar) ────────────────────────────────────────────
def inactivar_evento_view(request, id):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    evento = get_object_or_404(calendario, id=id)
    evento.activo = False
    evento.save(update_fields=['activo'])
    return JsonResponse({'status': 'success', 'message': 'Actividad inactivada.'})


# ── Restaurar ─────────────────────────────────────────────────────────────────
def restaurar_evento_view(request, id):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    evento = get_object_or_404(calendario, id=id)
    evento.activo = True
    evento.save(update_fields=['activo'])
    return JsonResponse({'status': 'success', 'message': 'Actividad restaurada.'})


# ── Eliminar definitivamente (ahora solo disponible desde vista de inactivos) ─
def eliminar_evento_view(request, id):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    evento = get_object_or_404(calendario, id=id)
    evento.delete()
    return JsonResponse({'status': 'success'})