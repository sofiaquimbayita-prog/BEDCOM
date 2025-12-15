from django.urls import path
from . import views

urlpatterns = [
    # --- RUTAS DE VISTAS (PÁGINAS HTML) ---
    path('login/', views.MenuPrincipalView, name='login'),
    path('crear-cuenta/', views.crear_cuenta_view, name='crear_cuenta'),
    path('cambiar-contrasena/', views.cambiar_contrasena_view, name='cambiar_contrasena'),
    path('recuperar-contrasena/', views.recuperar_contrasena_view, name='recuperar_contrasena'),
    path('menu/', views.menu_view, name='menu'),
    path ('productos/', views.productos_view, name='productos'),
    path('api/productos', views.producto_list_create, name='api_producto_list_create'),
    path('api/productos/<int:pk>', views.producto_detail, name='api_producto_detail'),
]
