from django.urls import path
from .views import calendario, insumos, menu, proveedores

urlpatterns = [

    # --- MENÚ ---
    path('menu/', menu.MenuView.as_view(), name='menu'),

    # --- INSUMOS ---
    path('insumos/', insumos.InsumoListView.as_view(), name='insumos'),
    path('insumos/data/', insumos.InsumoDataView.as_view(), name='insumos_data'),
    path('insumos/obtener/<int:pk>/', insumos.InsumoDetailView.as_view(), name='obtener_insumo'),
    path('insumos/crear/', insumos.InsumoCreateView.as_view(), name='crear_insumo'),
    path('insumos/editar/<int:pk>/', insumos.InsumoUpdateView.as_view(), name='editar_insumo'),
    path('insumos/inactivar/<int:pk>/', insumos.InsumoInactivarView.as_view(), name='inactivar_insumo'),
    path('insumos/activar/<int:pk>/', insumos.InsumoActivarView.as_view(), name='activar_insumo'),

    # --- CALENDARIO ---
    path('calendario/', calendario.CalendarioView.as_view(), name='calendario'),
    path('calendario/data/', calendario.EventoDataView.as_view(), name='eventos_data'),
    path('calendario/obtener/<int:pk>/', calendario.EventoDetailView.as_view(), name='obtener_evento'),
    path('calendario/crear/', calendario.EventoCreateView.as_view(), name='crear_evento'),
    path('calendario/editar/<int:pk>/', calendario.EventoUpdateView.as_view(), name='editar_evento'),
    path('calendario/estado/<int:pk>/', calendario.EventoEstadoView.as_view(), name='cambiar_estado_evento'),
    path('calendario/inactivar/<int:pk>/', calendario.EventoInactivarView.as_view(), name='inactivar_evento'),
    path('calendario/restaurar/<int:pk>/', calendario.EventoRestaurarView.as_view(), name='restaurar_evento'),

    # --- PROVEEDORES ---
    path('proveedores/', proveedores.ProveedorListView.as_view(), name='proveedores'),
    path('proveedores/crear/', proveedores.ProveedorCreateView.as_view(), name='proveedor_create'),
    path('proveedores/editar/<int:pk>/', proveedores.ProveedorUpdateView.as_view(), name='proveedor_edit'),
    path('proveedores/eliminar/<int:pk>/', proveedores.ProveedorDeleteView.as_view(), name='proveedor_delete'),
    path('proveedores/activar/<int:pk>/', proveedores.ProveedorActivateView.as_view(), name='proveedor_activar'),
]