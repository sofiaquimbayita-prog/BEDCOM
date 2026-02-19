from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from datetime import date, datetime
from ..models import calendario, CategoriaEvento
import re

# Validaciones
def _validar_titulo(titulo):
    """
    Valida el título de la actividad.
    Retorna (True, None) si es válido o (False, mensaje) si no lo es.
    """
    if not titulo or not titulo.strip():
        return False, 'El título es obligatorio.'
    titulo = titulo.strip()
    if len(titulo) < 3:
        return False, 'El título debe tener al menos 3 caracteres.'
    if len(titulo) > 150:
        return False, 'El título no puede superar los 150 caracteres.'
    if re.search(r'[<>{}\[\]\\]', titulo):
        return False, 'El título contiene caracteres no permitidos.'
    return True, None


def _validar_fecha_hora(fecha_str, hora_str, es_edicion=False):
    """
    Valida que la fecha y hora sean correctas.
    """
    if not fecha_str:
        return False, 'La fecha es obligatoria.'
    if not hora_str:
        return False, 'La hora es obligatoria.'

    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
    except ValueError:
        return False, 'El formato de la fecha no es válido (AAAA-MM-DD).'

    try:
        hora = datetime.strptime(hora_str, '%H:%M').time()
    except ValueError:
        return False, 'El formato de la hora no es válido (HH:MM).'

    limite_futuro = date(date.today().year + 5, 12, 31)
    if fecha > limite_futuro:
        return False, 'La fecha no puede ser superior a 5 años en el futuro.'

    return True, None


def _validar_categoria(categoria_id):
    """Valida que la categoría exista y esté activa."""
    if not categoria_id:
        return False, 'La categoría es obligatoria.', None
    try:
        cat = CategoriaEvento.objects.get(id=categoria_id, estado=True)
        return True, None, cat
    except CategoriaEvento.DoesNotExist:
        return False, 'La categoría seleccionada no existe o está inactiva.', None


def _validar_descripcion(descripcion):
    """Valida el campo de descripción (opcional pero con límite de caracteres)."""
    if descripcion and len(descripcion) > 1000:
        return False, 'Los detalles no pueden superar los 1000 caracteres.'
    return True, None



def _auto_cancelar_vencidos():
    hoy = date.today()
    calendario.objects.filter(
        estado=calendario.ESTADO_PENDIENTE,
        fecha__lt=hoy
    ).update(estado=calendario.ESTADO_CANCELADO)




def calendario_view(request):
    categorias = CategoriaEvento.objects.filter(estado=True)
    return render(request, 'calendario/calendario.html', {'categorias': categorias})


def eventos_data_view(request):
    _auto_cancelar_vencidos()
    eventos = calendario.objects.select_related('categoria').all()
    data = [{
        "id":              e.id,
        "titulo":          e.titulo,
        "fecha":           e.fecha.strftime('%Y-%m-%d'),
        "fecha_display":   e.fecha.strftime('%d de %b %Y'),
        "hora":            e.hora.strftime('%H:%M'),
        "categoria":       e.categoria.nombre,
        "categoria_id":    e.categoria.id,
        "categoria_color": e.categoria.color,
        "descripcion":     e.descripcion or "",
        "estado":          e.estado,
    } for e in eventos]
    return JsonResponse({"data": data})


def obtener_evento_view(request, id):
    evento = get_object_or_404(calendario, id=id)
    return JsonResponse({
        "id":               evento.id,
        "titulo":           evento.titulo,
        "fecha":            evento.fecha.strftime('%Y-%m-%d'),
        "fecha_display":    evento.fecha.strftime('%d de %b %Y'),
        "hora":             evento.hora.strftime('%H:%M'),
        "categoria":        evento.categoria.id,
        "categoria_nombre": evento.categoria.nombre,
        "categoria_color":  evento.categoria.color,
        "descripcion":      evento.descripcion,
        "estado":           evento.estado,
    })


def cambiar_estado_evento_view(request, id):
    """Cambia el estado de un evento (pendiente / completado / cancelado)."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

    evento = get_object_or_404(calendario, id=id)
    nuevo_estado = request.POST.get('estado', '').strip()

    estados_validos = [c[0] for c in calendario.ESTADO_CHOICES]
    if not nuevo_estado or nuevo_estado not in estados_validos:
        return JsonResponse({'status': 'error', 'message': 'Estado no válido.'}, status=400)

    evento.estado = nuevo_estado
    evento.save(update_fields=['estado'])
    return JsonResponse({'status': 'success', 'estado': evento.estado})


def guardar_evento(request, instancia=None):
    """Lógica común para crear/editar con validaciones completas."""
    titulo       = request.POST.get('titulo', '').strip()
    fecha        = request.POST.get('fecha', '').strip()
    hora         = request.POST.get('hora', '').strip()
    categoria_id = request.POST.get('categoria', '').strip()
    descripcion  = request.POST.get('descripcion', '').strip()

    es_edicion = instancia is not None

    # Validar título 
    ok, msg = _validar_titulo(titulo)
    if not ok:
        return JsonResponse({'status': 'error', 'message': msg}, status=400)

    # Validar fecha y hora 
    ok, msg = _validar_fecha_hora(fecha, hora, es_edicion=es_edicion)
    if not ok:
        return JsonResponse({'status': 'error', 'message': msg}, status=400)

    # Validar categoría 
    ok, msg, categoria_obj = _validar_categoria(categoria_id)
    if not ok:
        return JsonResponse({'status': 'error', 'message': msg}, status=400)

    # Validar descripción 
    ok, msg = _validar_descripcion(descripcion)
    if not ok:
        return JsonResponse({'status': 'error', 'message': msg}, status=400)

    #  no duplicados título + fecha + hora
    qs = calendario.objects.filter(titulo__iexact=titulo, fecha=fecha, hora=hora)
    if es_edicion:
        qs = qs.exclude(id=instancia.id)
    if qs.exists():
        return JsonResponse({
            'status': 'error',
            'message': 'Ya existe una actividad con el mismo título, fecha y hora.'
        }, status=400)

    # ── Guardar ──
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
    if request.method == 'POST':
        return guardar_evento(request)
    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)


def editar_evento_view(request, id):
    evento = get_object_or_404(calendario, id=id)
    if request.method == 'POST':
        return guardar_evento(request, instancia=evento)
    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)


def eliminar_evento_view(request, id):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

    evento = get_object_or_404(calendario, id=id)

    evento.delete()
    return JsonResponse({'status': 'success'})