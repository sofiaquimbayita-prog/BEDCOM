from django.urls import path
from .views import ListarUsuariosView, CrearUsuarioView, EditarUsuarioView, CambiarEstadoUsuarioView, obtener_detalle_usuario


app_name = 'usuarios'

urlpatterns = [
    path('listar/', ListarUsuariosView.as_view(), name='listar'),
    path('crear/', CrearUsuarioView.as_view(), name='crear'),
    path('editar/<int:pk>/', EditarUsuarioView.as_view(), name='editar'),
    path('cambiar_estado/<int:pk>/', CambiarEstadoUsuarioView.as_view(), name='cambiar_estado'),
    path('detalle_json/<int:pk>/', obtener_detalle_usuario, name='detalle_json'),
]