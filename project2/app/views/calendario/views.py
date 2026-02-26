from django.views import View
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from datetime import date, datetime
from ...models import calendario, CategoriaEvento


class CalendarioView(TemplateView):
    template_name = 'calendario/calendario.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categorias'] = CategoriaEvento.objects.filter(estado=True)
        return context


class EventoDataView(View):
    def get(self, request):
        # Auto-completar eventos automáticos vencidos
        hoy = date.today()
        ahora = datetime.now()
        
        calendario.objects.filter(
            modo_completado=calendario.MODO_AUTOMATICO,
            estado=calendario.ESTADO_PENDIENTE,
            fecha__lt=hoy,
        ).update(estado=calendario.ESTADO_COMPLETADO)

        # También verificar los de hoy que ya pasaron de hora
        from django.db.models import Q
        eventos_hoy_auto = calendario.objects.filter(
            modo_completado=calendario.MODO_AUTOMATICO,
            estado=calendario.ESTADO_PENDIENTE,
            fecha=hoy,
        )
        for ev in eventos_hoy_auto:
            ev_dt = datetime.combine(ev.fecha, ev.hora)
            if ev_dt < ahora:
                ev.estado = calendario.ESTADO_COMPLETADO
                ev.save(update_fields=['estado'])

        # Solo retornar eventos NO eliminados
        eventos = (
            calendario.objects
            .select_related('categoria')
            .exclude(estado=calendario.ESTADO_ELIMINADO)
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
            'modo_completado': e.modo_completado,
        } for e in eventos]
        return JsonResponse({'data': data})


class EventosPorFechaView(View):
    """Retorna eventos de un día específico para el panel derecho."""
    def get(self, request):
        fecha_str = request.GET.get('fecha', '')
        try:
            fecha = date.fromisoformat(fecha_str)
        except ValueError:
            fecha = date.today()

        eventos = (
            calendario.objects
            .select_related('categoria')
            .filter(fecha=fecha)
            .exclude(estado=calendario.ESTADO_ELIMINADO)
            .order_by('hora')
        )
        data = [{
            'id':              e.id,
            'titulo':          e.titulo,
            'hora':            e.hora.strftime('%H:%M'),
            'categoria':       e.categoria.nombre,
            'categoria_color': e.categoria.color,
            'estado':          e.estado,
            'modo_completado': e.modo_completado,
        } for e in eventos]
        return JsonResponse({'data': data})


class EventoCategoriaStatsView(View):
    """Retorna conteo de eventos por categoría."""
    def get(self, request):
        from django.db.models import Count
        cats = (
            CategoriaEvento.objects
            .filter(estado=True)
            .annotate(total=Count(
                'calendario',
                filter=~__import__('django.db.models', fromlist=['Q']).Q(
                    calendario__estado=calendario.ESTADO_ELIMINADO
                )
            ))
            .values('id', 'nombre', 'color', 'total')
        )
        return JsonResponse({'data': list(cats)})


class EventoDetailView(View):
    def get(self, request, pk):
        evento = get_object_or_404(calendario, id=pk)
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
            'modo_completado':  evento.modo_completado,
        })


class EventoCreateView(View):
    def post(self, request):
        return self._guardar_evento(request)

    def _guardar_evento(self, request, instancia=None):
        data = request.POST
        titulo          = data.get('titulo', '').strip()
        fecha_str       = data.get('fecha', '').strip()
        hora_str        = data.get('hora', '').strip()
        categoria_id    = data.get('categoria', '').strip()
        descripcion     = data.get('descripcion', '').strip()
        modo_completado = data.get('modo_completado', calendario.MODO_AUTOMATICO).strip()

        errores = {}
        if not titulo:
            errores['titulo'] = 'El título es obligatorio.'
        if not fecha_str:
            errores['fecha'] = 'La fecha es obligatoria.'
        if not hora_str:
            errores['hora'] = 'La hora es obligatoria.'
        if not categoria_id:
            errores['categoria'] = 'La categoría es obligatoria.'
        if modo_completado not in [calendario.MODO_AUTOMATICO, calendario.MODO_MANUAL]:
            errores['modo_completado'] = 'Modo no válido.'

        if errores:
            return JsonResponse({'status': 'error', 'errores': errores}, status=400)

        try:
            cat = CategoriaEvento.objects.get(id=categoria_id)
        except CategoriaEvento.DoesNotExist:
            return JsonResponse({'status': 'error', 'errores': {'categoria': 'Categoría no existe.'}}, status=400)

        if instancia is None:
            instancia = calendario()

        instancia.titulo          = titulo
        instancia.fecha           = fecha_str
        instancia.hora            = hora_str
        instancia.categoria       = cat
        instancia.descripcion     = descripcion
        instancia.modo_completado = modo_completado
        instancia.save()

        return JsonResponse({
            'status':  'success',
            'message': 'Evento guardado correctamente.',
            'id':      instancia.id
        })


class EventoUpdateView(EventoCreateView):
    def post(self, request, pk):
        evento = get_object_or_404(calendario, id=pk)
        return self._guardar_evento(request, instancia=evento)


class EventoCompletarView(View):
    def post(self, request, pk):
        evento = get_object_or_404(calendario, id=pk)

        estado = request.POST.get('estado')

        if estado not in [
            calendario.ESTADO_COMPLETADO,
            calendario.ESTADO_PENDIENTE
        ]:
            return JsonResponse({'status': 'error', 'message': 'Estado inválido'}, status=400)

        # Validar modo automático
        if evento.modo_completado != calendario.MODO_MANUAL:
            return JsonResponse({
                'status': 'error',
                'message': 'Este evento es de completado automático.'
            }, status=400)

        evento.estado = estado
        evento.save(update_fields=['estado'])

        return JsonResponse({
            'status': 'success',
            'estado': evento.estado
        })

class EventoEliminarView(View):
    """Cambia estado a eliminado (soft delete)."""
    def post(self, request, pk):
        evento = get_object_or_404(calendario, id=pk)
        evento.estado = calendario.ESTADO_ELIMINADO
        evento.save(update_fields=['estado'])
        return JsonResponse({'status': 'success', 'message': 'Actividad eliminada.'})