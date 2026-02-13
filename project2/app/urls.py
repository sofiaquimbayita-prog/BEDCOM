from django.urls import path
from . import views

urlpatterns = [
    # --- RUTA DE INICIO / LOGIN ---
    # Esta es la primera pantalla que verá el usuario
    path('login/', views.MenuPrincipalView, name='login'),
    
    # --- RUTAS DE NAVEGACIÓN ---
    path('menu/', views.menu_view, name='menu_principal'),
    path('crear-cuenta/', views.crear_cuenta_view, name='crear_cuenta'),
    path('recuperar-contrasena/', views.recuperar_contrasena_view, name='recuperar_contrasena'),
    path('cambiar-contrasena/', views.cambiar_contrasena_view, name='cambiar_contrasena'),
    path('respaldos/', views.RespaldosListView.as_view(), name='respaldos'),
    path('respaldos/generar/', views.generar_respaldo, name='generar_respaldo'),
    path('respaldos/eliminar/<int:id>/', views.eliminar_respaldo, name='eliminar_respaldo'),

    path('proveedores/', views.proveedores_view.as_view(), name='proveedores'),
    path('proveedores/crear/', views.crear_proveedor, name='crear_proveedor'),
    path('proveedores/editar/<int:id>/', views.editar_proveedor, name='editar_proveedor'),
    path('proveedores/eliminar/<int:id>/', views.eliminar_proveedor, name='eliminar_proveedor'),
]