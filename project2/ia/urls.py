from django.urls import path
from . import views

urlpatterns = [
    # Esta es la URL a la que apunta el fetch de tu JavaScript
    path('api-consultar/', views.api_consultar_ia, name='api_consultar_ia'),
]