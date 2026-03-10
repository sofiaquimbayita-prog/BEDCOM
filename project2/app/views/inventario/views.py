from django.views.generic import ListView
from ...models import producto, insumo

class InventarioListView(ListView):
    model = producto
    template_name = 'inventario/Inventario.html'
    context_object_name = 'productos'

    def get_queryset(self):
        # Usar select_related para obtener la categoría en una sola consulta
        return producto.objects.filter(estado=True).select_related('categoria')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Productos activos
        productos = producto.objects.filter(estado=True)
        context['productos'] = productos.select_related('categoria')
        context['total_productos'] = productos.count()
        context['total_stock'] = sum(p.stock for p in productos)
        
        # Insumos activos
        insumos = insumo.objects.filter(estado='Activo')
        context['insumos'] = insumos.select_related('id_categoria')
        context['total_insumos'] = insumos.count()
        context['total_stock_insumos'] = sum(i.cantidad for i in insumos)
        
        # Título para el header
        context['titulo_pagina'] = 'GESTIÓN DE INVENTARIO - BEDCOM'
        context['icono_modulo'] = 'fas fa-boxes'

        return context
