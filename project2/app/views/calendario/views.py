from django.views import View
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from datetime import date
from ...forms import calendarioForm
from ...models import calendario, CategoriaEvento


class CalendarioView(TemplateView):
    template_name = 'calendario/calendario.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categorias'] = CategoriaEvento.objects.filter(estado=True)
        return context


class EventoDataView(View):
    def get(self, request):
        calendario.objects.filter(
            estado=calendario.ESTADO_PENDIENTE,
            fecha__lt=date.today(),
            activo=True
        ).update(estado=calendario.ESTADO_CANCELADO)

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
            'activo':           evento.activo,
        })


class EventoCreateView(View):
    def post(self, request):
        return self._guardar_evento(request)

    def _guardar_evento(self, request, instancia=None):
        form = calendarioForm(request.POST, instance=instancia)
        if form.is_valid():
            evento = form.save()
            return JsonResponse({
                'status':  'success',
                'message': 'Evento guardado correctamente.',
                'id':      evento.id
            })
        errores = {campo: lista[0] for campo, lista in form.errors.items()}
        return JsonResponse({'status': 'error', 'errores': errores}, status=400)


class EventoUpdateView(EventoCreateView):
    def post(self, request, pk):
        evento = get_object_or_404(calendario, id=pk)
        return self._guardar_evento(request, instancia=evento)


class EventoEstadoView(View):
    def post(self, request, pk):
        evento = get_object_or_404(calendario, id=pk)
        nuevo_estado = request.POST.get('estado', '').strip()
        estados_validos = [c[0] for c in calendario.ESTADO_CHOICES]

        if nuevo_estado not in estados_validos:
            return JsonResponse({'status': 'error', 'message': 'Estado no válido.'}, status=400)

        evento.estado = nuevo_estado
        evento.save(update_fields=['estado'])
        return JsonResponse({'status': 'success', 'estado': evento.estado})


class EventoInactivarView(View):
    def post(self, request, pk):
        evento = get_object_or_404(calendario, id=pk)
        evento.activo = False
        evento.save(update_fields=['activo'])
        return JsonResponse({'status': 'success', 'message': 'Actividad inactivada.'})


class EventoRestaurarView(View):
    def post(self, request, pk):
        evento = get_object_or_404(calendario, id=pk)
        evento.activo = True
        evento.save(update_fields=['activo'])
        return JsonResponse({'status': 'success', 'message': 'Actividad restaurada.'})


class EventoEliminarView(View):
    def post(self, request, pk):
        evento = get_object_or_404(calendario, id=pk)
        evento.delete()
        return JsonResponse({'status': 'success'})