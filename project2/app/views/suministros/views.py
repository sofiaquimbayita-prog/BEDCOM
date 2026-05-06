from django.views.generic import ListView
from ...models import producto
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


@method_decorator(csrf_exempt, name='dispatch')
class SuministrosListView(ListView):
    model = producto
    template_name = 'suministros/suministros.html'
    context_object_name = 'productos'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = 'SUMINISTROS'
        context['icono_modulo'] = 'fas fa-shopping-cart'
        return context
