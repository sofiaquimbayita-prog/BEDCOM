from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from datetime import date
from ..models import calendario, CategoriaEvento


def _auto_cancelar_vencidos():
    """Marca como cancelados los eventos pendientes con fecha pasada."""
    calendario.objects.filter(
        estado=calendario.ESTADO_PENDIENTE,
        fecha__lt=date.today()
    ).update(estado=calendario.ESTADO_CANCELADO)


def calendario_view(request):
    categorias = CategoriaEvento.objects.filter(estado=True)
    return render(request, 'calendario/calendario.html', {'categorias': categorias})


def eventos_data_view(request):
    _auto_cancelar_vencidos()
    eventos = calendario.objects.select_related('categoria').all()
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
    titulo       = request.POST.get('titulo', '').strip()
    fecha        = request.POST.get('fecha', '').strip()
    hora         = request.POST.get('hora', '').strip()
    categoria_id = request.POST.get('categoria', '').strip()
    descripcion  = request.POST.get('descripcion', '').strip()

    categoria_obj = get_object_or_404(CategoriaEvento, id=categoria_id, estado=True)

    if instancia is None:
        instancia = calendario()

    instancia.titulo      = titulo
    instancia.fecha       = fecha
    instancia.hora        = hora
    instancia.categoria   = categoria_obj
    instancia.descripcion = descripcion
    instancia.save()

    return JsonResponse({'status': 'success', 'message': 'Evento guardado correctamente.'})


def crear_evento_view(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    return _guardar_evento(request)


def editar_evento_view(request, id):
    evento = get_object_or_404(calendario, id=id)
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    return _guardar_evento(request, instancia=evento)


def eliminar_evento_view(request, id):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    evento = get_object_or_404(calendario, id=id)
    evento.delete()
    return JsonResponse({'status': 'success'})