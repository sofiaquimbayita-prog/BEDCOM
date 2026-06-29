from django.urls import path
from . import views

urlpatterns = [
    path('api-consultar/', views.api_consultar_ia, name='api_consultar_ia'),
    path('api-historial/', views.api_historial, name='api_historial'),
]