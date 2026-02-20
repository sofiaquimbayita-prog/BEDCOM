from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpRequest
from ..models import insumo, categoria, proveedor
from ..forms import insumosForm


def insumos_view(request: HttpRequest):
    categorias  = categoria.objects.all()
    proveedores = proveedor.objects.all()
    return render(request, 'insumos/insumos.html', {
        'categorias': categorias,
        'proveedor':  proveedores,
    })


def insumos_data_view(request: HttpRequest):
    insumos = insumo.objects.select_related('id_categoria').all()
    data = [{
        'id':        i.id,
        'nombre':    i.nombre,
        'categoria': i.id_categoria.nombre if i.id_categoria else 'Sin categoría',
        'cantidad':  i.cantidad,
        'precio':    i.precio,
        'proveedor': i.id_proveedor.nombre if i.id_proveedor else 'Sin proveedor',
        'unidad':    i.unidad_medida,
        'estado':    i.estado,
    } for i in insumos]
    return JsonResponse({'data': data})


def obtener_insumo_view(request: HttpRequest, id):
    ins = get_object_or_404(insumo, id=id)
    return JsonResponse({
        'nombre':        ins.nombre,
        'cantidad':      ins.cantidad,
        'unidad_medida': ins.unidad_medida,
        'precio':        ins.precio,
        'id_proveedor':  ins.id_proveedor.id if ins.id_proveedor else '',
        'id_categoria':  ins.id_categoria.id if ins.id_categoria else '',
        'estado':        ins.estado,
        'descripcion':   ins.descripcion or '',
    })


def _guardar_insumo(request, instancia=None):
    form = insumosForm(request.POST, instance=instancia)

    if form.is_valid():
        ins = form.save(commit=False)

        # FK fuera del ModelForm
        cat_id  = request.POST.get('id_categoria')
        prov_id = request.POST.get('id_proveedor')
        ins.id_categoria = get_object_or_404(categoria, id=cat_id) if cat_id else None
        ins.id_proveedor = get_object_or_404(proveedor, id=prov_id) if prov_id else None
        ins.estado = request.POST.get('estado', 'Activo')

        # Validar duplicado nombre + proveedor
        qs = insumo.objects.filter(nombre__iexact=ins.nombre)
        qs = qs.filter(id_proveedor_id=prov_id) if prov_id else qs.filter(id_proveedor__isnull=True)
        if instancia and instancia.pk:
            qs = qs.exclude(pk=instancia.pk)

        if qs.exists():
            prov_nombre = ins.id_proveedor.nombre if ins.id_proveedor else 'sin proveedor'
            msg = f'Ya existe un insumo "{ins.nombre}" para {prov_nombre}.'
            return JsonResponse({
                'status': 'error', 'errores': {'__all__': msg}, 'message': msg,
            }, status=400)

        ins.save()
        return JsonResponse({'status': 'success', 'message': 'Insumo guardado correctamente.'})

    errores_por_campo = {campo: mensajes[0] for campo, mensajes in form.errors.items()}
    return JsonResponse({
        'status':  'error',
        'errores': errores_por_campo,
        'message': next(iter(errores_por_campo.values())),
    }, status=400)


def crear_insumo_view(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    return _guardar_insumo(request)


def editar_insumo_view(request, id):
    ins = get_object_or_404(insumo, id=id)
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    return _guardar_insumo(request, instancia=ins)


def eliminar_insumo_view(request: HttpRequest, id):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    ins = get_object_or_404(insumo, id=id)
    ins.delete()
    return JsonResponse({'status': 'success'})