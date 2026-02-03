from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from datetime import date
from .models import producto, categoria, reporte, usuario
# --- ESTA ES LA FUNCIÓN QUE FALTA O TIENE ERROR DE NOMBRE ---
def MenuPrincipalView(request):
    """Renderiza la pantalla de login inicial"""
    return render(request, 'login/login.html')

def menu_view(request):
    """Renderiza el menú principal o dashboard"""
    return render(request, 'menu/menu.html')

def crear_cuenta_view(request):
    return render(request, 'login/index_crear_cuenta.html')

def recuperar_contrasena_view(request):
    return render(request, 'login/index_recuperar_contra.html')

def cambiar_contrasena_view(request):
    return render(request, 'login/index_cambiar_contraseña.html')
# 1. LISTAR PRODUCTOS
def productos_view(request):
    """Carga la página principal de productos con los datos de la DB"""
    # Traemos solo los activos para el borrado lógico
    productos_db = producto.objects.filter(estado=True).select_related('id_cat')
    categorias_db = categoria.objects.all()
    
    return render(request, 'productos/index_productos.html', {
        'productos': productos_db,
        'categorias': categorias_db
    })

# 2. CREAR PRODUCTO (Procesa el Modal)
def crear_producto(request):
    if request.method == "POST":
        try:
            # Extraer datos usando los 'name' del HTML
            nom = request.POST.get('nombre')
            tip = request.POST.get('tipo')
            pre = request.POST.get('precio')
            sto = request.POST.get('stock')
            cat_id = request.POST.get('id_cat')

            # Validar que la categoría existe
            cat_obj = get_object_or_404(categoria, id=cat_id)

            # --- MANEJO DE INTEGRIDAD (id_reporte) ---
            # Tu modelo exige un reporte. Buscamos uno o creamos uno de sistema.
            # Nota: Asegúrate de tener al menos un usuario en la tabla 'usuarios'
            user_admin = usuario.objects.first() 
            rep_obj, created = reporte.objects.get_or_create(
                tipo="Ingreso Manual",
                defaults={'fecha': date.today(), 'id_usuario': user_admin}
            )

            # Crear el registro en la base de datos
            producto.objects.create(
                nombre=nom,
                tipo=tip,
                precio=pre,
                stock=sto,
                id_cat=cat_obj,
                id_reporte=rep_obj,
                estado=True # Aseguramos que sea visible
            )
            
            messages.success(request, f"¡{nom} guardado correctamente!")
            
        except Exception as e:
            messages.error(request, f"Error al guardar: {str(e)}")

    # Redirige al name definido en urls.py
    return redirect('productos')

# 3. ELIMINAR PRODUCTO (Borrado Lógico)
def eliminar_producto(request, id):
    prod = get_object_or_404(producto, id=id)
    try:
        prod.estado = False  # No lo borramos de la DB, solo lo ocultamos
        prod.save()
        messages.success(request, "Producto eliminado exitosamente.")
    except Exception as e:
        messages.error(request, "No se pudo eliminar el producto.")
        
    return redirect('productos')