from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from datetime import date
from ..models import calendario, CategoriaEvento

def _auto_cancelar_vencidos():
    """
    Marca como 'cancelado' todo evento pendiente cuya fecha ya pasó.
    Se ejecuta cada vez que se carga la tabla (eventos_data_view).
    Solo toca registros que realmente necesitan cambio.
    """
    hoy = date.today()
    calendario.objects.filter(
        estado=calendario.ESTADO_PENDIENTE,
        fecha__lt=hoy          # fecha estrictamente anterior a hoy
    ).update(estado=calendario.ESTADO_CANCELADO)

def calendario_view(request):
    categorias = CategoriaEvento.objects.filter(estado=True)
    return render(request, 'calendario/calendario.html', {'categorias': categorias})

def eventos_data_view(request):
    _auto_cancelar_vencidos()  # ← revisar y actualizar antes de servir los datos
    eventos = calendario.objects.select_related('categoria').all()
    data = [{
        "id": e.id,
        "titulo": e.titulo,
        "fecha": e.fecha.strftime('%Y-%m-%d'),
        "fecha_display": e.fecha.strftime('%d de %b %Y'),
        "hora": e.hora.strftime('%H:%M'),
        "categoria": e.categoria.nombre,
        "categoria_id": e.categoria.id,
        "categoria_color": e.categoria.color,
        "descripcion": e.descripcion or "",
        "estado": e.estado,                          # ← nuevo
    } for e in eventos]
    return JsonResponse({"data": data})

def obtener_evento_view(request, id):
    evento = get_object_or_404(calendario, id=id)
    return JsonResponse({
        "id": evento.id,
        "titulo": evento.titulo,
        "fecha": evento.fecha.strftime('%Y-%m-%d'),
        "fecha_display": evento.fecha.strftime('%d de %b %Y'),
        "hora": evento.hora.strftime('%H:%M'),
        "categoria": evento.categoria.id,
        "categoria_nombre": evento.categoria.nombre,
        "categoria_color": evento.categoria.color,
        "descripcion": evento.descripcion,
        "estado": evento.estado,                     # ← nuevo
    })

def cambiar_estado_evento_view(request, id):
    """Cambia el estado de un evento (pendiente / completado / cancelado)."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error'}, status=405)

    evento = get_object_or_404(calendario, id=id)
    nuevo_estado = request.POST.get('estado')

    estados_validos = [c[0] for c in calendario.ESTADO_CHOICES]
    if nuevo_estado not in estados_validos:
        return JsonResponse(
            {'status': 'error', 'message': 'Estado no válido'},
            status=400
        )

    evento.estado = nuevo_estado
    evento.save(update_fields=['estado'])
    return JsonResponse({'status': 'success', 'estado': evento.estado})

def guardar_evento(request, instancia=None):
    """Lógica común para crear/editar."""
    titulo       = request.POST.get('titulo')
    fecha        = request.POST.get('fecha')
    hora         = request.POST.get('hora')
    categoria_id = request.POST.get('categoria')
    descripcion  = request.POST.get('descripcion', '')

    if not titulo or not fecha or not hora or not categoria_id:
        return JsonResponse(
            {'status': 'error', 'message': 'Campos obligatorios faltantes'},
            status=400
        )

    categoria_obj = get_object_or_404(CategoriaEvento, id=categoria_id)

    if instancia is None:
        instancia = calendario()

    instancia.titulo      = titulo
    instancia.fecha       = fecha
    instancia.hora        = hora
    instancia.categoria   = categoria_obj
    instancia.descripcion = descripcion
    instancia.save()

    return JsonResponse({'status': 'success', 'message': 'Evento guardado correctamente'})

def crear_evento_view(request):
    if request.method == 'POST':
        return guardar_evento(request)
    return JsonResponse({'status': 'error'}, status=405)

def editar_evento_view(request, id):
    evento = get_object_or_404(calendario, id=id)
    if request.method == 'POST':
        return guardar_evento(request, instancia=evento)
    return JsonResponse({'status': 'error'}, status=405)

def eliminar_evento_view(request, id):
    if request.method == 'POST':
        evento = get_object_or_404(calendario, id=id)
        evento.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=405)