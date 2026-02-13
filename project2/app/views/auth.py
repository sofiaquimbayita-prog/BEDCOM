from django.shortcuts import render
from django.http import HttpRequest

def MenuPrincipalView(request: HttpRequest):
    return render(request, 'login/login.html', {})

def crear_cuenta_view(request: HttpRequest):
    return render(request, 'login/index_crear_cuenta.html', {})

def cambiar_contrasena_view(request: HttpRequest):
    return render(request, 'login/index_cambiar_contraseña.html', {})

def recuperar_contrasena_view(request: HttpRequest):
    return render(request, 'login/index_recuperar_contra.html', {})

def menu_view(request: HttpRequest):
    return render(request, 'menu/menu.html', {})

