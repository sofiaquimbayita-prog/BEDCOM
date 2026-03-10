import json
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.db import models

from app.models import bom, producto, insumo


@method_decorator(login_required, name='dispatch')
class BomListView(ListView):
    """Vista para listar todos los productos con su estructura BOM"""
    model = producto
    template_name = 'bom/index_bom.html'
    context_object_name = 'productos'

    def get_queryset(self):
        # Obtener todos los productos activos
        return producto.objects.filter(estado=True).select_related('categoria').order_by('nombre')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = 'ESTRUCTURA DE PRODUCTOS (BOM)'
        
        # Obtener todas las estructuras BOM agrupadas por producto
        # Esto permite mostrar una fila por receta (producto) con sus ingredientes
        boms = bom.objects.select_related('producto', 'insumo').order_by('producto__nombre', 'insumo__nombre')
        
        # Agrupar por producto
        recipes_dict = {}
        for b in boms:
            if b.producto.id not in recipes_dict:
                recipes_dict[b.producto.id] = {
                    'producto': b.producto,
                    'insumos': []
                }
            recipes_dict[b.producto.id]['insumos'].append({
                'insumo_nombre': b.insumo.nombre,
                'cantidad': b.cantidad,
                'unidad_medida': b.unidad_medida,
                'bom_id': b.id
            })
        
        context['recipes'] = list(recipes_dict.values())
        
        # Obtener todos los insumos para los selects (sin filtro de estado para mostrar todos)
        context['insumos'] = insumo.objects.all().order_by('nombre')
        
        # Obtener lista de productos que ya tienen receta (para validación JS)
        context['productos_con_receta'] = list(producto.objects.filter(
            id__in=bom.objects.values_list('producto_id', flat=True).distinct()
        ).values_list('id', flat=True))
        
        return context


@method_decorator(login_required, name='dispatch')
class BomCreateView(SuccessMessageMixin, CreateView):
    """Vista para crear una relación BOM (producto - insumo)"""
    model = bom
    fields = ['producto', 'insumo', 'cantidad', 'unidad_medida']
    success_url = reverse_lazy('bom_list')
    success_message = "Relación BOM creada correctamente"

    def form_valid(self, form):
        # Verificar si ya existe la relación
        producto = form.cleaned_data['producto']
        insumo_obj = form.cleaned_data['insumo']
        
        if bom.objects.filter(producto=producto, insumo=insumo_obj).exists():
            messages.error(self.request, "Ya existe una relación BOM para este producto e insumo.")
            return self.form_invalid(form)
        
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "Error al crear la relación BOM.")
        return super().form_invalid(form)


@login_required
@csrf_exempt
def bom_crear_receta(request):
    """API para crear una receta completa (múltiples insumos para un producto)"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        producto_id = data.get('producto_id')
        insumos = data.get('insumos', [])  # Lista de {insumo_id, cantidad, unidad_medida}
        
        if not producto_id:
            return JsonResponse({'success': False, 'error': 'Producto no especificado'})
        
        if not insumos:
            return JsonResponse({'success': False, 'error': 'Debe agregar al menos un insumo'})
        
        # Verificar que el producto existe
        try:
            producto_obj = producto.objects.get(id=producto_id)
        except producto.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Producto no encontrado'})
        
        # Crear las relaciones BOM
        created_count = 0
        errors = []
        
        for item in insumos:
            insumo_id = item.get('insumo_id')
            cantidad = item.get('cantidad')
            unidad_medida = item.get('unidad_medida')
            
            if not insumo_id or not cantidad or not unidad_medida:
                errors.append(f"Datos incompletos para un insumo")
                continue
            
            # Verificar si ya existe la relación (mismo producto e insumo)
            if bom.objects.filter(producto_id=producto_id, insumo_id=insumo_id).exists():
                errors.append(f"El insumo ya está registrado para este producto")
                continue
            
            # Crear la relación BOM
            bom.objects.create(
                producto=producto_obj,
                insumo_id=insumo_id,
                cantidad=cantidad,
                unidad_medida=unidad_medida
            )
            created_count += 1
        
        if created_count > 0:
            return JsonResponse({
                'success': True, 
                'message': f'Receta creada correctamente con {created_count} insumo(s)'
            })
        else:
            return JsonResponse({
                'success': False, 
                'error': 'No se pudo crear ninguna relación. ' + '; '.join(errors)
            })
            
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Datos JSON inválidos'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
@csrf_exempt
def bom_editar_receta(request):
    """API para editar una receta completa (múltiples insumos para un producto)"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        producto_id = data.get('producto_id')
        insumos = data.get('insumos', [])  # Lista de {insumo_id, cantidad, unidad_medida}
        
        if not producto_id:
            return JsonResponse({'success': False, 'error': 'Producto no especificado'})
        
        if not insumos:
            return JsonResponse({'success': False, 'error': 'Debe agregar al menos un insumo'})
        
        # Verificar que el producto existe
        try:
            producto_obj = producto.objects.get(id=producto_id)
        except producto.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Producto no encontrado'})
        
        # Eliminar todas las relaciones BOM existentes para este producto
        bom.objects.filter(producto_id=producto_id).delete()
        
        # Crear las nuevas relaciones BOM
        created_count = 0
        errors = []
        
        for item in insumos:
            insumo_id = item.get('insumo_id')
            cantidad = item.get('cantidad')
            unidad_medida = item.get('unidad_medida')
            
            if not insumo_id or not cantidad or not unidad_medida:
                errors.append(f"Datos incompletos para un insumo")
                continue
            
            # Crear la relación BOM
            bom.objects.create(
                producto=producto_obj,
                insumo_id=insumo_id,
                cantidad=cantidad,
                unidad_medida=unidad_medida
            )
            created_count += 1
        
        if created_count > 0:
            return JsonResponse({
                'success': True, 
                'message': f'Receta actualizada correctamente con {created_count} insumo(s)'
            })
        else:
            return JsonResponse({
                'success': False, 
                'error': 'No se pudo actualizar ninguna relación. ' + '; '.join(errors)
            })
            
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Datos JSON inválidos'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@method_decorator(login_required, name='dispatch')
class BomUpdateView(SuccessMessageMixin, UpdateView):
    """Vista para editar una relación BOM"""
    model = bom
    fields = ['producto', 'insumo', 'cantidad', 'unidad_medida']
    success_url = reverse_lazy('bom_list')
    success_message = "Relación BOM actualizada correctamente"

    def form_valid(self, form):
        producto = form.cleaned_data['producto']
        insumo_obj = form.cleaned_data['insumo']
        
        # Excluir el registro actual de la verificación
        if bom.objects.filter(producto=producto, insumo=insumo_obj).exclude(pk=self.object.pk).exists():
            messages.error(self.request, "Ya existe una relación BOM para este producto e insumo.")
            return self.form_invalid(form)
        
        return super().form_valid(form)


@method_decorator(login_required, name='dispatch')
class BomDeleteView(DeleteView):
    """Vista para eliminar una relación BOM"""
    model = bom
    success_url = reverse_lazy('bom_list')

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        success_url = self.get_success_url()
        
        self.object.delete()
        messages.success(request, f"Relación BOM eliminada correctamente.")
        
        from django.http import HttpResponseRedirect
        return HttpResponseRedirect(success_url)


@login_required
def bom_por_producto(request):
    """API para obtener los insumos de un producto específico"""
    producto_id = request.GET.get('producto_id')
    
    if not producto_id:
        return JsonResponse({'success': False, 'error': 'Producto no especificado'})
    
    try:
        boms = bom.objects.filter(producto_id=producto_id).select_related('insumo')
        data = []
        
        for b in boms:
            data.append({
                'id': b.id,
                'insumo_id': b.insumo.id,
                'insumo_nombre': b.insumo.nombre,
                'cantidad': b.cantidad,
                'unidad_medida': b.unidad_medida,
                'insumo_stock': b.insumo.cantidad,
            })
        
        return JsonResponse({'success': True, 'data': data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
@csrf_exempt
def bom_eliminar_receta(request):
    """API para eliminar una receta completa (todos los insumos de un producto)"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        producto_id = request.POST.get('producto_id')
    except:
        producto_id = None
    
    if not producto_id:
        return JsonResponse({'success': False, 'error': 'Producto no especificado'})
    
    try:
        # Eliminar todas las relaciones BOM para este producto
        deleted_count = bom.objects.filter(producto_id=producto_id).delete()[0]
        
        if deleted_count > 0:
            return JsonResponse({
                'success': True, 
                'message': f'Receta eliminada correctamente ({deleted_count} insumo(s) eliminado(s))'
            })
        else:
            return JsonResponse({
                'success': False, 
                'error': 'No se encontró la receta para este producto'
            })
            
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
def bom_data(request):
    """API para obtener todos los datos BOM en formato DataTable"""
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    
    # Obtener datos
    boms = bom.objects.select_related('producto', 'insumo').order_by('producto__nombre', 'insumo__nombre')
    
    # Total registros
    total = boms.count()
    
    # Filtrar si hay búsqueda
    search = request.GET.get('search[value]', '')
    if search:
        boms = boms.filter(
            models.Q(producto__nombre__icontains=search) |
            models.Q(insumo__nombre__icontains=search)
        )
    
    # Paginar
    boms = boms[start:start + length]
    
    data = []
    for b in boms:
        data.append({
            'DT_RowId': f'row_{b.id}',
            'producto': b.producto.nombre,
            'insumo': b.insumo.nombre,
            'cantidad': b.cantidad,
            'unidad_medida': b.unidad_medida,
            'acciones': f'''
                <button class="btn-sm btn-primary" onclick="editarBom({b.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-sm btn-danger" onclick="eliminarBom({b.id}, '{b.producto.nombre}', '{b.insumo.nombre}')">
                    <i class="fas fa-trash"></i>
                </button>
            '''
        })
    
    return JsonResponse({
        'draw': draw,
        'recordsTotal': total,
        'recordsFiltered': total,
        'data': data
    })

