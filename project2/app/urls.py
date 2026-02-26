from django.urls import path
from django.contrib.auth import views as auth_views
from django.urls import reverse_lazy
from .views import productos, menu, reportes

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
    path('reportes/', reportes.reporte_ventas, name='reportes')
    
]
