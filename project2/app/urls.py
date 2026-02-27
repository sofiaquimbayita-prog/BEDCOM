from django.urls import path
from .views import respaldos
from .views.proveedores.views import (
    ProveedorListView,
    ProveedorCreateView,
    ProveedorUpdateView,
    ProveedorDeleteView,
    ProveedorActivateView,
    ProveedorDataView
)

urlpatterns = [
    # Rutas de Proveedores
    path('proveedores/', ProveedorListView.as_view(), name='proveedores_list'),
    path('proveedores/data/', ProveedorDataView.as_view(), name='proveedores_data'),
    path('proveedores/crear/', ProveedorCreateView.as_view(), name='proveedores_create'),
    path('proveedores/editar/<int:pk>/', ProveedorUpdateView.as_view(), name='proveedores_update'),
    path('proveedores/eliminar/<int:pk>/', ProveedorDeleteView.as_view(), name='proveedores_delete'),
    path('proveedores/activar/<int:pk>/', ProveedorActivateView.as_view(), name='proveedores_activate'),
    
    # Rutas de Respaldos
    path('respaldos/', respaldos.RespaldoListView.as_view(), name='respaldos_list'),
    path('respaldos/crear/', respaldos.RespaldoCreateView.as_view(), name='generar_respaldo'),
    path('respaldos/eliminar/<int:pk>/', respaldos.RespaldoDeleteView.as_view(), name='eliminar_respaldo'),
    path('respaldos/restaurar/<int:pk>/', respaldos.RespaldoRestoreView.as_view(), name='restaurar_respaldo'),
    path('descargar/<int:id>/', respaldos.DescargarRespaldoView.as_view(), name='descargar_respaldo'),
]
