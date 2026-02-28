from django.urls import path
from django.contrib.auth import views as auth_views
from .views import calendario, insumos, menu, proveedores,productos,reportes
#==================================
#           RAMA SOFIA
from .views import respaldos
from .views.proveedores.views import (
    ProveedorListView,
    ProveedorCreateView,
    ProveedorUpdateView,
    ProveedorDeleteView,
    ProveedorActivateView,
    ProveedorDataView
)
#==================================

urlpatterns = [
    # --- MENÚ / DASHBOARD ---
    path('menu/', menu.MenuView.as_view(), name='menu'),

    # --- PRODUCTOS ---
    path('productos/', productos.producto_list_view.as_view(), name='productos'),
    path('productos/crear/', productos.producto_create_view.as_view(), name='crear_producto'),
    path('productos/editar/<int:pk>/', productos.producto_update_view.as_view(), name='editar_producto'),
    path('productos/eliminar/<int:pk>/', productos.producto_delete_view.as_view(), name='eliminar_producto'),
    path('productos/activar/<int:pk>/', productos.producto_activate_view.as_view(), name='activar_producto'),
    # --- REPORTES ---
    path('reportes/', reportes.reporte_ventas, name='reportes'),  
    
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
    path('calendario/por-fecha/', calendario.EventosPorFechaView.as_view(), name='eventos_por_fecha'),
    path('calendario/categorias-stats/', calendario.EventoCategoriaStatsView.as_view(), name='categorias_stats'),
    path('calendario/obtener/<int:pk>/', calendario.EventoDetailView.as_view(), name='obtener_evento'),
    path('calendario/crear/', calendario.EventoCreateView.as_view(), name='crear_evento'),
    path('calendario/editar/<int:pk>/', calendario.EventoUpdateView.as_view(), name='editar_evento'),
    path('calendario/completar/<int:pk>/', calendario.EventoCompletarView.as_view(), name='completar_evento'),
    path('calendario/eliminar/<int:pk>/', calendario.EventoEliminarView.as_view(), name='eliminar_evento'),

  # --- PROVEEDORES ---
    path('proveedores/', ProveedorListView.as_view(), name='proveedores_list'),
    path('proveedores/data/', ProveedorDataView.as_view(), name='proveedores_data'),
    path('proveedores/crear/', ProveedorCreateView.as_view(), name='proveedores_create'),
    path('proveedores/editar/<int:pk>/', ProveedorUpdateView.as_view(), name='proveedores_update'),
    path('proveedores/eliminar/<int:pk>/', ProveedorDeleteView.as_view(), name='proveedores_delete'),
    path('proveedores/activar/<int:pk>/', ProveedorActivateView.as_view(), name='proveedores_activate'),
    
    # --- RESPALDOS ---
    path('respaldos/', respaldos.RespaldoListView.as_view(), name='respaldos_list'),
    path('respaldos/crear/', respaldos.RespaldoCreateView.as_view(), name='generar_respaldo'),
    path('respaldos/eliminar/<int:pk>/', respaldos.RespaldoDeleteView.as_view(), name='eliminar_respaldo'),
    path('respaldos/restaurar/<int:pk>/', respaldos.RespaldoRestoreView.as_view(), name='restaurar_respaldo'),
    path('descargar/<int:id>/', respaldos.DescargarRespaldoView.as_view(), name='descargar_respaldo'),
]