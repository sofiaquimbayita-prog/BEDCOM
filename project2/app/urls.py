from django.urls import path
from .views import respaldos

urlpatterns = [
    path('respaldos/', respaldos.RespaldoListView.as_view(), name='respaldos_list'),
    path('respaldos/crear/', respaldos.RespaldoCreateView.as_view(), name='generar_respaldo'),
    path('respaldos/eliminar/<int:pk>/', respaldos.RespaldoDeleteView.as_view(), name='eliminar_respaldo'),
    path('respaldos/restaurar/<int:pk>/', respaldos.RespaldoRestoreView.as_view(), name='restaurar_respaldo'),
    path('descargar/<int:id>/', respaldos.DescargarRespaldoView.as_view(), name='descargar_respaldo'),
]
