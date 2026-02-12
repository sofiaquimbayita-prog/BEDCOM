from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.MenuPrincipalView, name='MenuPrincipal'),
    path('crear-cuenta/', views.crear_cuenta_view, name='crear_cuenta'),
    path('cambiar-contrasena/', views.cambiar_contrasena_view, name='cambiar_contrasena'),
    path('recuperar-contrasena/', views.recuperar_contrasena_view, name='recuperar_contrasena'),
    path('menu/', views.menu_view, name='menu'),
    
    # PRODUCTOS
    path('productos/', views.productos_view, name='productos'),
    path('productos/crear/', views.crear_producto_view, name='crear_producto'),
    path('productos/eliminar/<int:id>/', views.eliminar_producto_view, name='eliminar_producto'),

    # INSUMOS 
    path('insumos/', views.insumos_view, name='insumos'),
    path('insumos/data/', views.insumos_data_view, name='insumos_data'),
    path('insumos/obtener/<int:id>/', views.obtener_insumo_view, name='obtener_insumo'),
    path('insumos/crear/', views.crear_insumo_view, name='crear_insumo'),
    path('insumos/editar/<int:id>/', views.editar_insumo_view, name='editar_insumo'),
    path('insumos/eliminar/<int:id>/', views.eliminar_insumo_view, name='eliminar_insumo'),


    # calendario / GESTIÓN DE ACTIVIDADES
    path('calendario/', views.calendario_view, name='calendario'),
    
    # Rutas de acción (API interna para los modales)
    path('calendario/crear/', views.crear_evento_view, name='calendario_crear'),
    path('calendario/editar/<int:id>/', views.editar_evento_view, name='calendario_editar'),
    path('calendario/eliminar/<int:id>/', views.eliminar_evento_view, name='calendario_eliminar'),
]

