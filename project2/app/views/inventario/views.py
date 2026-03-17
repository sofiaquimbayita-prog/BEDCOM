from django.views.generic import ListView
from ...models import producto, insumo
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
@method_decorator(login_required, name='dispatch')
class InventarioListView(ListView):
    model = producto
    template_name = 'inventario/Inventario.html'
    context_object_name = 'productos'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Título para el header
        context['titulo_pagina'] = 'GESTIÓN DE INVENTARIO - BEDCOM'
        context['icono_modulo'] = 'fas fa-boxes'

        return context
