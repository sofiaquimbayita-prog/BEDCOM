from django.views import View
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from ...models import insumo, categoria, proveedor
from ...forms import insumosForm

ESTADOS_PERMITIDOS = {'Activo', 'Inactivo'}


# ─────────────────────────────────────────────
#  INSUMOS
# ─────────────────────────────────────────────

class InsumoListView(TemplateView):
    template_name = 'insumos/insumos.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categorias'] = categoria.objects.filter(estado=True, tipo=categoria.TIPO_INSUMO)
        context['proveedor']  = proveedor.objects.filter(estado=True)
        return context


class InsumoDataView(View):
    def get(self, request):
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


class InsumoDetailView(View):
    def get(self, request, pk):
        ins = get_object_or_404(
            insumo.objects.select_related('id_categoria', 'id_proveedor'), id=pk
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


class InsumoCreateView(View):
    def post(self, request):
        return self._guardar_insumo(request)

    def _guardar_insumo(self, request, instancia=None):
        form = insumosForm(request.POST, instance=instancia)
        if form.is_valid():
            ins = form.save(commit=False)

            cat_id = request.POST.get('id_categoria', '').strip()
            if not cat_id:
                return JsonResponse({'status': 'error', 'message': 'Debes seleccionar una categoría.'}, status=400)

            prov_id = request.POST.get('id_proveedor', '').strip()
            if not prov_id:
                return JsonResponse({'status': 'error', 'message': 'Debes seleccionar un proveedor.'}, status=400)

            ins.id_categoria = get_object_or_404(categoria, id=cat_id)
            ins.id_proveedor = get_object_or_404(proveedor, id=prov_id)

            estado = request.POST.get('estado', 'Activo').strip()
            if estado not in ESTADOS_PERMITIDOS:
                return JsonResponse({'status': 'error', 'message': 'Estado inválido.'}, status=400)
            ins.estado = estado
            
            qs = insumo.objects.filter(nombre__iexact=ins.nombre, id_proveedor_id=prov_id)
            if instancia and instancia.pk:
                qs = qs.exclude(pk=instancia.pk)
            if qs.exists():
                msg = f'Ya existe un insumo "{ins.nombre}" para el proveedor "{ins.id_proveedor.nombre}".'
                return JsonResponse({'status': 'error', 'message': msg}, status=400)
            ins.save()
            return JsonResponse({'status': 'success', 'message': 'Insumo guardado correctamente.'})
        errores = {campo: mensajes[0] for campo, mensajes in form.errors.items()}
        
        return JsonResponse({
            'status':  'error',
            'errores': errores,
            'message': next(iter(errores.values())),
        }, status=400)


class InsumoUpdateView(InsumoCreateView):
    def post(self, request, pk):
        ins = get_object_or_404(insumo, id=pk)
        return self._guardar_insumo(request, instancia=ins)


class InsumoInactivarView(View):
    def post(self, request, pk):
        ins = get_object_or_404(insumo, id=pk)
        if ins.estado == 'Inactivo':
            return JsonResponse({'status': 'error', 'message': 'El insumo ya está inactivo.'}, status=400)
        ins.estado = 'Inactivo'
        ins.save(update_fields=['estado'])
        return JsonResponse({'status': 'success', 'message': f'El insumo "{ins.nombre}" fue inactivado.'})


class InsumoActivarView(View):
    def post(self, request, pk):
        ins = get_object_or_404(insumo, id=pk)
        if ins.estado == 'Activo':
            return JsonResponse({'status': 'error', 'message': 'El insumo ya está activo.'}, status=400)
        ins.estado = 'Activo'
        ins.save(update_fields=['estado'])
        return JsonResponse({'status': 'success', 'message': f'El insumo "{ins.nombre}" fue reactivado.'})



class CategoriaCreateView(View):
    def post(self, request):
        nombre     = request.POST.get('nombre', '').strip()
        descripcion = request.POST.get('descripcion', '').strip()

        # ── Validaciones ──────────────────────────────
        if not nombre:
            return JsonResponse(
                {'status': 'error', 'message': 'El nombre de la categoría es obligatorio.'},
                status=400
            )
        if len(nombre) > 100:
            return JsonResponse(
                {'status': 'error', 'message': 'El nombre no puede superar los 100 caracteres.'},
                status=400
            )
        if not descripcion:
            return JsonResponse(
                {'status': 'error', 'message': 'La descripción es obligatoria.'},
                status=400
            )

        # ── Unicidad (nombre único en el modelo) ──────
        if categoria.objects.filter(nombre__iexact=nombre).exists():
            return JsonResponse(
                {'status': 'error', 'message': f'Ya existe una categoría llamada "{nombre}".'},
                status=400
            )

        # ── Crear ──────────────────────────────────────
        nueva = categoria.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            tipo=categoria.TIPO_INSUMO,   # siempre 'insumo' desde este modal
            estado=True,
        )
        return JsonResponse({
            'status': 'ok',
            'id':     nueva.id,
            'nombre': nueva.nombre,
        })


class ProveedorCreateView(View):
    def post(self, request):
        nombre    = request.POST.get('nombre', '').strip()
        telefono  = request.POST.get('telefono', '').strip()
        direccion = request.POST.get('direccion', '').strip()

        # ── Validaciones ──────────────────────────────
        if not nombre:
            return JsonResponse(
                {'status': 'error', 'message': 'El nombre del proveedor es obligatorio.'},
                status=400
            )
        if len(nombre) > 100:
            return JsonResponse(
                {'status': 'error', 'message': 'El nombre no puede superar los 100 caracteres.'},
                status=400
            )
        if not telefono:
            return JsonResponse(
                {'status': 'error', 'message': 'El teléfono es obligatorio.'},
                status=400
            )
        if len(telefono) > 15:
            return JsonResponse(
                {'status': 'error', 'message': 'El teléfono no puede superar los 15 caracteres.'},
                status=400
            )
        if not direccion:
            return JsonResponse(
                {'status': 'error', 'message': 'La dirección es obligatoria.'},
                status=400
            )
        if len(direccion) > 200:
            return JsonResponse(
                {'status': 'error', 'message': 'La dirección no puede superar los 200 caracteres.'},
                status=400
            )

        # ── Crear ──────────────────────────────────────
        nuevo = proveedor.objects.create(
            nombre=nombre,
            telefono=telefono,
            direccion=direccion,
            estado=True,
        )
        return JsonResponse({
            'status': 'ok',
            'id':     nuevo.id,
            'nombre': nuevo.nombre,
        })