from django.shortcuts import render
from django.http import HttpRequest
# Create your views here.
def MenuPrincipalView(request: HttpRequest):
    """
    Esta función maneja la solicitud HTTP y renderiza el template index.html.
    """
    # El primer argumento es la solicitud (request)
    # El segundo argumento es la ruta del template, relativa a la carpeta 'templates'
    return render(request, 'login.html', {}) # El tercer argumento es un diccionario de contexto (datos)


def crear_cuenta_view(request: HttpRequest):
    """Renderiza la página de crear cuenta."""
    return render(request, 'index_crear_cuenta.html', {})


def cambiar_contrasena_view(request: HttpRequest):
    """Renderiza la página para cambiar/recuperar la contraseña."""
    return render(request, 'index_cambiar_contraseña.html', {})


def recuperar_contrasena_view(request: HttpRequest):
    """Renderiza la página para iniciar el flujo de recuperación (ingresar email y validar código)."""
    return render(request, 'index_recuperar_contra.html', {})


def menu_view(request: HttpRequest):
    """Renderiza la página del menú principal después de iniciar sesión."""
    return render(request, 'menu/menu.html', {})

