from django.shortcuts import render, get_object_or_404
from django.http import HttpRequest, JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt # ¡CRUCIAL para POST/PUT/DELETE!
from .models import * # Asegúrate que este modelo existe
import json 


# ----------------------------------------------
# TUS VISTAS ACTUALES (RENDERIZAN HTML)
# ----------------------------------------------
# ... (Mantén todas tus funciones de vista originales: menu_view, productos_view, etc.) ...
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
def productos_view(request: HttpRequest):
    """Renderiza la página de productos."""
    return render(request, 'productos/index_productos.html', {})

# ----------------------------------------------
# VISTAS API (DEVUELVEN JSON - Django Nativo)
# ----------------------------------------------

# Decorador necesario para permitir POST/PUT/DELETE
@csrf_exempt 
def producto_list_create(request):
    """
    Maneja GET (Leer todos) y POST (Crear)
    URL: /api/productos
    """
    if request.method == 'GET':
        # 1. Serializar manualmente la QuerySet a lista de diccionarios
        productos = producto.objects.all()
        data = list(productos.values('id', 'nombre', 'precio', 'stock', 'categoria', 'descripcion', 'estado', 'imagen'))
        
        # 2. Devolver la respuesta JSON (safe=False es necesario para listas)
        return JsonResponse(data, safe=False) 

    elif request.method == 'POST':
        # ... (La lógica POST para crear un producto va aquí) ...
        try:
            data = json.loads(request.body.decode('utf-8'))
            producto = producto.objects.create(
                nombre=data.get('nombre'),
                precio=data.get('precio'),
                stock=data.get('stock'),
                categoria=data.get('categoria'),
                descripcion=data.get('descripcion'),
                estado=data.get('estado'),
                imagen=data.get('imagen')
            )
            response_data = {'id': producto.id, 'nombre': producto.nombre, 'precio': producto.precio}
            return JsonResponse(response_data, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def producto_detail(request, pk):
    """
    Maneja GET (Leer uno), PUT (Actualizar) y DELETE (Eliminar)
    URL: /api/productos/<int:pk>
    """
    # ... (La lógica de GET, PUT y DELETE va aquí, usando get_object_or_404) ...
    producto = get_object_or_404(producto, pk=pk)

    if request.method == 'GET':
        data = {
            'id': producto.id, 'nombre': producto.nombre, 'precio': producto.precio,
            'stock': producto.stock, 'categoria': producto.categoria, 
            'descripcion': producto.descripcion, 'estado': producto.estado, 'imagen': producto.imagen,
        }
        return JsonResponse(data)

    elif request.method == 'PUT':
        try:
            data = json.loads(request.body.decode('utf-8'))
            producto.nombre = data.get('nombre', producto.nombre)
            # ... (Actualizar el resto de campos) ...
            producto.save()
            return JsonResponse({'message': 'Actualizado con éxito'}, status=200)
        except Exception:
            return JsonResponse({'error': 'Error de actualización'}, status=400)

    elif request.method == 'DELETE':
        producto.delete()
        return HttpResponse(status=204)