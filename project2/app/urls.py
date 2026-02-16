from django.urls import path
# Importa desde el archivo específico, no desde el paquete raíz de la app
from .views import proveedores, respaldos
urlpatterns = [
    path('proveedores/', proveedores.ProveedorListView.as_view(), name='proveedores_list'),
    path('proveedores/crear/', proveedores.ProveedorCreateView.as_view(), name='proveedor_create'),
    path('proveedores/editar/<int:pk>/', proveedores.ProveedorUpdateView.as_view(), name='proveedor_edit'),
    path('proveedores/eliminar/<int:pk>/', proveedores.ProveedorDeleteView.as_view(), name='proveedor_delete'),
    path('proveedores/activar/<int:pk>/', proveedores.ProveedorActivateView.as_view(), name='proveedor_activar'),
    path('respaldos/', respaldos.RespaldoListView.as_view(), name='respaldos_list'),
    path('respaldos/crear/', respaldos.RespaldoCreateView.as_view(), name='generar_respaldo'),
    path('respaldos/eliminar/<int:pk>/', respaldos.RespaldoDeleteView.as_view(), name='eliminar_respaldo'),
    path('respaldos/restaurar/<int:pk>/', respaldos.RespaldoRestoreView.as_view(), name='restaurar_respaldo'),
    path('descargar/<int:id>/', respaldos.DescargarRespaldoView.as_view(), name='descargar_respaldo'),
]