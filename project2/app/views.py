from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpRequest
from datetime import date
# Importamos todos los modelos necesarios
from .models import producto, categoria, reporte, usuario, insumo
from django.http import JsonResponse


# --- VISTAS DE NAVEGACIÓN ---

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


#----insumos views----
def insumos_view(request: HttpRequest):
    categorias = categoria.objects.all()
    return render(request, 'insumos/insumos.html', {
        'categorias': categorias
    })
def insumos_data_view(request: HttpRequest):
    insumos = insumo.objects.select_related('id_categoria').all()

    data = []
    for i in insumos:
        data.append({
            "id": i.id,
            "nombre": i.nombre,
            "categoria": i.id_categoria.nombre,
            "cantidad": i.cantidad,
            "unidad": i.unidad_medida,
            "estado": i.estado,
        })

    return JsonResponse({"data": data})

def crear_insumo_view(request: HttpRequest):
    if request.method == 'POST':
        cat_id = request.POST.get('id_categoria')

        if not cat_id:
            cat_instancia, _ = categoria.objects.get_or_create(
                nombre="General",
                defaults={'descripcion': 'Categoría por defecto', 'estado': True}
            )
        else:
            cat_instancia = get_object_or_404(categoria, id=cat_id)

        insumo.objects.create(
            nombre=request.POST.get('nombre'),
            cantidad=request.POST.get('cantidad'),
            unidad_medida=request.POST.get('unidad_medida'),
            estado=request.POST.get('estado', 'Activo'),
            id_categoria=cat_instancia
        )

    return redirect('insumos')

def eliminar_insumo_view(request: HttpRequest, id):
    ins = get_object_or_404(insumo, id=id)
    ins.delete()
    return redirect('insumos')



# --- VISTAS DE PRODUCTOS (CRUD) ---

def productos_view(request: HttpRequest):
    """Lista productos y carga categorías para el modal."""
    productos = producto.objects.select_related('id_cat').all()
    categorias = categoria.objects.all()
    return render(request, 'productos/index_productos.html', {
        'productos': productos, 
        'categorias': categorias
    })

def crear_producto_view(request: HttpRequest):
    """Crea producto manejando automáticamente las dependencias (Usuario/Reporte/Categoría)."""
    if request.method == 'POST':
        # 1. Asegurar la existencia de un Usuario (Requerido por Reporte)
        user_instancia, _ = usuario.objects.get_or_create(
            cedula="000", 
            defaults={
                'nombre_usuar': 'Admin Sistema', 
                'rol': 'Administrador', 
                'estado': 'Activo'
            }
        )

        # 2. Asegurar la existencia de un Reporte (Requerido por Producto)
        rep_instancia, _ = reporte.objects.get_or_create(
            tipo="Registro de Inventario",
            id_usuario=user_instancia, 
            defaults={'fecha': date.today()}
        )

        # 3. Asegurar la existencia de una Categoría
        cat_id = request.POST.get('id_cat')
        if not cat_id:
            cat_instancia, _ = categoria.objects.get_or_create(
                nombre="General",
                defaults={'descripcion': 'Categoría por defecto', 'estado': True}
            )
        else:
            cat_instancia = get_object_or_404(categoria, id=cat_id)

        # 4. Crear el Producto
        producto.objects.create(
            nombre=request.POST.get('nombre'),
            tipo=request.POST.get('tipo', 'Estándar'),
            precio=request.POST.get('precio'),
            stock=request.POST.get('stock'),
            id_cat=cat_instancia,
            id_reporte=rep_instancia,
            estado=True
        )
        return redirect('productos')
    
    return redirect('productos')

def eliminar_producto_view(request: HttpRequest, id):
    """Elimina el producto seleccionado."""
    prod = get_object_or_404(producto, id=id)
    prod.delete()
    return redirect('productos')
# ---- VISTAS DE INSUMOS ----
def insumos_view(request: HttpRequest):
    categorias = categoria.objects.all()
    return render(request, 'insumos/insumos.html', {'categorias': categorias})

def insumos_data_view(request: HttpRequest):
    insumos = insumo.objects.select_related('id_categoria').all()
    data = [{
        "id": i.id,
        "nombre": i.nombre,
        "categoria": i.id_categoria.nombre if i.id_categoria else "Sin categoría",
        "cantidad": i.cantidad,
        "unidad": i.unidad_medida,
        "estado": i.estado,
    } for i in insumos]
    return JsonResponse({"data": data})

def obtener_insumo_view(request: HttpRequest, id):
    ins = get_object_or_404(insumo, id=id)
    return JsonResponse({
        "nombre": ins.nombre,
        "cantidad": ins.cantidad,
        "unidad_medida": ins.unidad_medida,
        "id_categoria": ins.id_categoria.id if ins.id_categoria else "",
        "estado": ins.estado
    })

def crear_insumo_view(request: HttpRequest):
    if request.method == 'POST':
        cat_id = request.POST.get('id_categoria')
        cat_instancia = get_object_or_404(categoria, id=cat_id) if cat_id else None
        
        insumo.objects.create(
            nombre=request.POST.get('nombre'),
            cantidad=request.POST.get('cantidad'),
            unidad_medida=request.POST.get('unidad_medida'),
            estado=request.POST.get('estado', 'Activo'),
            id_categoria=cat_instancia
        )
        
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'status': 'success','message': 'Insumo creado correctamente'})
    return redirect('insumos')

def editar_insumo_view(request: HttpRequest, id):
    ins = get_object_or_404(insumo, id=id)
    if request.method == 'POST':
        cat_id = request.POST.get('id_categoria')
        ins.nombre = request.POST.get('nombre')
        ins.cantidad = request.POST.get('cantidad')
        ins.unidad_medida = request.POST.get('unidad_medida')
        ins.estado = request.POST.get('estado')
        if cat_id:
            ins.id_categoria = get_object_or_404(categoria, id=cat_id)
        ins.save()
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'status': 'success','message': 'Insumo actualizado correctamente'})
    return redirect('insumos')

def eliminar_insumo_view(request: HttpRequest, id):
    if request.method == 'POST': # Por seguridad con AJAX
        ins = get_object_or_404(insumo, id=id)
        ins.delete()
        return JsonResponse({"status": "deleted"})
    return redirect('insumos')


#--- calendaario views ---
def calendario_view(request: HttpRequest):
    return render(request, 'calendario/calendario.html', {})