from django.views.generic import ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from ...models import Notificacion

class NotificacionesListView(LoginRequiredMixin, ListView):
    template_name = 'notificaciones/index_notificaciones.html'
    context_object_name = 'notificaciones'
    
    def get_queryset(self):
        return Notificacion.objects.filter(estado=True).order_by('-fecha')
