from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpRequest
from datetime import date
# Importamos todos los modelos necesarios
from .models import producto, categoria, reporte, usuario, insumo, calendario
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
    # Obtenemos los eventos directamente para renderizarlos en el HTML
    eventos = calendario.objects.order_by('fecha', 'hora')
    return render(request, 'calendario/calendario.html', {'eventos': eventos})

# --- VISTA PARA CREAR EVENTO ---
def crear_evento_view(request):
    if request.method == 'POST':
        try:
            # Creamos el objeto con los datos del formulario
            nuevo_evento = calendario.objects.create(
                titulo=request.POST.get('titulo'),
                fecha=request.POST.get('fecha'),
                hora=request.POST.get('hora'),
                categoria=request.POST.get('categoria'),
                descripcion=request.POST.get('descripcion')
            )
            return JsonResponse({'status': 'success', 'id': nuevo_evento.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return redirect('calendario')

# --- VISTA PARA EDITAR EVENTO ---
def editar_evento_view(request, id):
    evento = get_object_or_404(calendario, id=id)
    if request.method == 'POST':
        try:
            # Actualizamos los campos del objeto existente
            evento.titulo = request.POST.get('titulo')
            evento.fecha = request.POST.get('fecha')
            evento.hora = request.POST.get('hora')
            evento.categoria = request.POST.get('categoria')
            evento.descripcion = request.POST.get('descripcion')
            evento.save()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return redirect('calendario')

# --- VISTA PARA ELIMINAR EVENTO ---
def eliminar_evento_view(request, id):
    # Solo permitimos eliminar mediante POST por seguridad
    if request.method == 'POST':
        evento = get_object_or_404(calendario, id=id)
        evento.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)