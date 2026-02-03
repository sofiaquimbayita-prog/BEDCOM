from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.MenuPrincipalView, name='MenuPrincipal'),
    path('crear-cuenta/', views.crear_cuenta_view, name='crear_cuenta'),
    path('cambiar-contrasena/', views.cambiar_contrasena_view, name='cambiar_contrasena'),
    path('recuperar-contrasena/', views.recuperar_contrasena_view, name='recuperar_contrasena'),
    path('menu/', views.menu_view, name='menu'),
    
    # PRODUCTOS
    # 1. La que ya tienes (para ver la lista)
    path('productos/', views.productos_view, name='productos'),
    
    # 2. Ruta para procesar el formulario de "Agregar"
    path('productos/crear/', views.crear_producto_view, name='crear_producto'),
    
    # 3. Ruta para "Eliminar" (recibe el ID del producto)
    path('productos/eliminar/<int:id>/', views.eliminar_producto_view, name='eliminar_producto'),
]