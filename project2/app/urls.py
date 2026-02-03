from django.urls import path
from . import views

urlpatterns = [
    # --- RUTA DE INICIO / LOGIN ---
    # Esta es la primera pantalla que verá el usuario
    path('', views.MenuPrincipalView, name='login'),
    
    # --- RUTAS DE NAVEGACIÓN ---
    path('menu/', views.menu_view, name='menu_principal'),
    path('crear-cuenta/', views.crear_cuenta_view, name='crear_cuenta'),
    path('recuperar-contrasena/', views.recuperar_contrasena_view, name='recuperar_contrasena'),
    path('cambiar-contrasena/', views.cambiar_contrasena_view, name='cambiar_contrasena'),

    # --- RUTAS DE PRODUCTOS (CRUD) ---
    # Esta ruta es la que lista los productos (index_productos.html)
    path('productos/', views.productos_view, name='productos'),
    
    # Esta ruta procesa el formulario del modal
    path('productos/crear/', views.crear_producto, name='crear_producto'),
    
    # Esta ruta sirve para eliminar (puedes pasarle el ID del producto)
    path('productos/eliminar/<int:id>/', views.eliminar_producto, name='eliminar_producto'),
]