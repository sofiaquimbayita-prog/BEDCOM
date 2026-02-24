from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpRequest
from ..models import insumo, categoria, proveedor
from ..forms import insumosForm

ESTADOS_PERMITIDOS = {'Activo', 'Inactivo'}


def insumos_view(request: HttpRequest):
    categorias  = categoria.objects.filter(estado=True)
    proveedores = proveedor.objects.filter(estado=True)
    return render(request, 'insumos/insumos.html', {
        'categorias': categorias,
        'proveedor':  proveedores,
    })


def insumos_data_view(request: HttpRequest):
    """
    Devuelve TODOS los insumos (activos e inactivos).
    El filtrado activo/inactivo lo maneja el toggle en el frontend.
    """
    insumos = insumo.objects.select_related('id_categoria', 'id_proveedor').all()
    data = [{
        'id':        i.id,
        'nombre':    i.nombre,
        'categoria': i.id_categoria.nombre if i.id_categoria else 'Sin categoría',
        'cantidad':  i.cantidad,
        'precio':    str(i.precio),
        'proveedor': i.id_proveedor.nombre if i.id_proveedor else 'Sin proveedor',
        'unidad':    i.unidad_medida,
        'estado':    i.estado,
    } for i in insumos]
    return JsonResponse({'data': data})


def obtener_insumo_view(request: HttpRequest, id):
    ins = get_object_or_404(
        insumo.objects.select_related('id_categoria', 'id_proveedor'), id=id
    )
    return JsonResponse({
        'nombre':           ins.nombre,
        'cantidad':         ins.cantidad,
        'unidad_medida':    ins.unidad_medida,
        'precio':           str(ins.precio),
        'id_proveedor':     ins.id_proveedor.id     if ins.id_proveedor else '',
        'id_categoria':     ins.id_categoria.id     if ins.id_categoria else '',
        'proveedor_nombre': ins.id_proveedor.nombre if ins.id_proveedor else 'Sin proveedor',
        'categoria_nombre': ins.id_categoria.nombre if ins.id_categoria else 'Sin categoría',
        'estado':           ins.estado,
        'descripcion':      ins.descripcion or '',
    })


def _guardar_insumo(request, instancia=None):
    form = insumosForm(request.POST, instance=instancia)

    if form.is_valid():
        ins = form.save(commit=False)

        # Validar y asignar FK de categoría
        cat_id = request.POST.get('id_categoria', '').strip()
        if not cat_id:
            return JsonResponse({
                'status': 'error',
                'errores': {'__all__': 'Debes seleccionar una categoría.'},
                'message': 'Debes seleccionar una categoría.',
            }, status=400)

        # Validar y asignar FK de proveedor
        prov_id = request.POST.get('id_proveedor', '').strip()
        if not prov_id:
            return JsonResponse({
                'status': 'error',
                'errores': {'__all__': 'Debes seleccionar un proveedor.'},
                'message': 'Debes seleccionar un proveedor.',
            }, status=400)

        ins.id_categoria = get_object_or_404(categoria, id=cat_id)
        ins.id_proveedor = get_object_or_404(proveedor, id=prov_id)

        # Validar estado
        estado = request.POST.get('estado', 'Activo').strip()
        if estado not in ESTADOS_PERMITIDOS:
            return JsonResponse({
                'status': 'error',
                'errores': {'__all__': 'Estado inválido.'},
                'message': 'Estado inválido.',
            }, status=400)
        ins.estado = estado

        # Validar duplicado nombre + proveedor
        qs = insumo.objects.filter(
            nombre__iexact=ins.nombre,
            id_proveedor_id=prov_id,
        )
        if instancia and instancia.pk:
            qs = qs.exclude(pk=instancia.pk)

        if qs.exists():
            prov_nombre = ins.id_proveedor.nombre
            msg = f'Ya existe un insumo "{ins.nombre}" para el proveedor "{prov_nombre}".'
            return JsonResponse({
                'status': 'error',
                'errores': {'__all__': msg},
                'message': msg,
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


def inactivar_insumo_view(request: HttpRequest, id):
    """Soft-delete: cambia estado a Inactivo sin borrar el registro."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    ins = get_object_or_404(insumo, id=id)
    if ins.estado == 'Inactivo':
        return JsonResponse({'status': 'error', 'message': 'El insumo ya está inactivo.'}, status=400)
    ins.estado = 'Inactivo'
    ins.save(update_fields=['estado'])
    return JsonResponse({'status': 'success', 'message': f'El insumo "{ins.nombre}" fue inactivado.'})


def activar_insumo_view(request: HttpRequest, id):
    """Reactiva un insumo inactivo."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)
    ins = get_object_or_404(insumo, id=id)
    if ins.estado == 'Activo':
        return JsonResponse({'status': 'error', 'message': 'El insumo ya está activo.'}, status=400)
    ins.estado = 'Activo'
    ins.save(update_fields=['estado'])
    return JsonResponse({'status': 'success', 'message': f'El insumo "{ins.nombre}" fue reactivado.'})