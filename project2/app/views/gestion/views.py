from django.views.generic import ListView
from django.urls import reverse_lazy
from ...models import producto, insumo
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
@method_decorator(login_required, name='dispatch')
class GestionListView(ListView):
    model = producto
    template_name = 'gestion/gestion.html'
    context_object_name = 'productos'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Título para el header
        context['titulo_pagina'] = 'GESTION DE DATOS'
        context['icono_modulo'] = 'fas fa-database'
        context['breadcrumbs'] = [
            {'name': 'Inicio', 'url': reverse_lazy('menu')},
            {'name': 'Gestión de Datos', 'url': None},
        ]

        return context
