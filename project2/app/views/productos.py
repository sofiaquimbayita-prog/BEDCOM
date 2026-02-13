from django.shortcuts import render, redirect, get_object_or_404
from datetime import date
from django.http import HttpRequest
from ..models import producto, categoria, reporte, usuario


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

