from django.views.generic import ListView
from ...models import producto, insumo

class GestionListView(ListView):
    model = producto
    template_name = 'gestion/gestion.html'
    context_object_name = 'productos'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Título para el header
        context['titulo_pagina'] = 'GESTIÓN DE DATOS - BEDCOM'
        context['icono_modulo'] = 'fas fa-database'

        return context
