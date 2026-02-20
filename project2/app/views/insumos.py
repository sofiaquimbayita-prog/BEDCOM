from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpRequest
from ..models import insumo, categoria,proveedor


def guardar_insumo(request, instancia=None):
    """
    Si instancia es None → crea.
    Si instancia tiene objeto → edita.
    """

    nombre = request.POST.get('nombre')
    cantidad = request.POST.get('cantidad')
    unidad = request.POST.get('unidad_medida')
    precio = request.POST.get('precio', 0)
    estado = request.POST.get('estado', 'Activo')
    cat_id = request.POST.get('id_categoria')
    prov_id = request.POST.get('id_proveedor')

    if not nombre or not cantidad or not unidad:
        return JsonResponse({
            'status': 'error',
            'message': 'Todos los campos obligatorios deben estar completos.'
        }, status=400)

    categoria_obj = get_object_or_404(categoria, id=cat_id) if cat_id else None
    proveedor = get_object_or_404(proveedor, id=prov_id) if prov_id else None
    if instancia is None:
        instancia = insumo()

    instancia.nombre = nombre
    instancia.cantidad = cantidad
    instancia.unidad_medida = unidad
    instancia.precio = precio 
    instancia.estado = estado
    instancia.id_categoria = categoria_obj
    instancia.id_proveedor = proveedor
    instancia.save()

    return JsonResponse({
        'status': 'success',
        'message': 'Guardado correctamente'
    })


def insumos_view(request: HttpRequest):
    categorias = categoria.objects.all()
    proveedores = proveedor.objects.all()   
    return render(request, 'insumos/insumos.html', {
        'categorias': categorias,
        'proveedor': proveedores,          
    })

def insumos_data_view(request: HttpRequest):
    insumos = insumo.objects.select_related('id_categoria').all()
    data = [{
        "id": i.id,
        "nombre": i.nombre,
        "categoria": i.id_categoria.nombre if i.id_categoria else "Sin categoría",
        "cantidad": i.cantidad,
        "precio": i.precio,
        "proveedor": i.id_proveedor.nombre if i.id_proveedor else "Sin proveedor",
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
        "precio": ins.precio,
        "id_proveedor": ins.id_proveedor.id if ins.id_proveedor else "",
        "id_categoria": ins.id_categoria.id if ins.id_categoria else "",
        "estado": ins.estado
    })

def crear_insumo_view(request):
    if request.method == 'POST':
        return guardar_insumo(request)
    return JsonResponse({'status': 'error'}, status=405)

def editar_insumo_view(request, id):
    ins = get_object_or_404(insumo, id=id)

    if request.method == 'POST':
        return guardar_insumo(request, instancia=ins)

    return JsonResponse({'status': 'error'}, status=405)


def eliminar_insumo_view(request: HttpRequest, id):
    if request.method == 'POST': # Por seguridad con AJAX
        ins = get_object_or_404(insumo, id=id)
        ins.delete()
        return JsonResponse({"status": "deleted"})
    return redirect('insumos')

