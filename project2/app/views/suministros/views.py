from django.views.generic import ListView
from ...models import producto

class SuministrosListView(ListView):
    model = producto
    template_name = 'suministros/suministros.html'
    context_object_name = 'productos'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = 'SUMINISTROS - BEDCOM'
        context['icono_modulo'] = 'fas fa-shopping-cart'
        return context
