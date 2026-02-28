from django.shortcuts import get_object_or_404, redirect
from django.views.generic import ListView, View
from django.urls import reverse_lazy
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from ...models import proveedor
from ...forms import ProveedorForm


class ProveedorListView(ListView):
    model = proveedor
    template_name = 'proveedores/proveedores.html'
    context_object_name = 'proveedores'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = "Gestión de Proveedores"
        context['icono_modulo'] = "fas fa-user-tie"
        return context


@method_decorator(csrf_exempt, name='dispatch')
class ProveedorCreateView(View):
    def post(self, request):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.error("REQUEST POST: " + str(request.POST))
            
            form = ProveedorForm(request.POST, request.FILES)
            
            if form.is_valid():
                logger.error("FORM IS VALID, saving...")
                proveedor_obj = form.save(commit=False)
                proveedor_obj.estado = True
                proveedor_obj.save()
                logger.error("PROVEEDOR SAVED WITH ID: " + str(proveedor_obj.id))
                
                return JsonResponse({
                    'success': True,
                    'message': 'Proveedor creado exitosamente',
                    'proveedor': {
                        'id': proveedor_obj.id,
                        'nombre': proveedor_obj.nombre,
                        'telefono': proveedor_obj.telefono,
                        'direccion': proveedor_obj.direccion,
                        'imagen': proveedor_obj.imagen.url if proveedor_obj.imagen else None,
                        'estado': proveedor_obj.estado
                    }
                })
            else:
                logger.error("FORM ERRORS: " + str(form.errors))
                errores = {}
                for field, errors in form.errors.items():
                    errores[field] = [str(e) for e in errors]
                return JsonResponse({
                    'success': False,
                    'message': 'Error al crear proveedor',
                    'errors': errores
                }, status=400)
        except Exception as e:
            import traceback
            logger.error("EXCEPTION: " + str(e))
            logger.error(traceback.format_exc())
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ProveedorUpdateView(View):
    def post(self, request, pk):
        try:
            proveedor_obj = get_object_or_404(proveedor, pk=pk)
            form = ProveedorForm(request.POST, request.FILES, instance=proveedor_obj)
            
            if form.is_valid():
                proveedor_obj = form.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Proveedor actualizado exitosamente',
                    'proveedor': {
                        'id': proveedor_obj.id,
                        'nombre': proveedor_obj.nombre,
                        'telefono': proveedor_obj.telefono,
                        'direccion': proveedor_obj.direccion,
                        'imagen': proveedor_obj.imagen.url if proveedor_obj.imagen else None,
                        'estado': proveedor_obj.estado
                    }
                })
            else:
                errores = {}
                for field, errors in form.errors.items():
                    errores[field] = [str(e) for e in errors]
                return JsonResponse({
                    'success': False,
                    'message': 'Error al actualizar proveedor',
                    'errors': errores
                }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


class ProveedorDeleteView(View):
    def post(self, request, pk):
        try:
            proveedor_obj = get_object_or_404(proveedor, pk=pk)
            proveedor_obj.estado = False
            proveedor_obj.save()
            messages.success(request, 'Proveedor desactivado correctamente')
            return JsonResponse({'success': True, 'message': 'Proveedor desactivado correctamente'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)


class ProveedorActivateView(View):
    def post(self, request, pk):
        try:
            proveedor_obj = get_object_or_404(proveedor, pk=pk)
            proveedor_obj.estado = True
            proveedor_obj.save()
            messages.success(request, 'Proveedor activado correctamente')
            return JsonResponse({'success': True, 'message': 'Proveedor activado correctamente'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)


class ProveedorDataView(View):
    def get(self, request):
        try:
            solo_inactivos = request.GET.get('solo_inactivos', 'false').lower() == 'true'
            incluir_todos = request.GET.get('incluir_todos', 'false').lower() == 'true'
            
            if incluir_todos:
                proveedores = proveedor.objects.all()
            elif solo_inactivos:
                proveedores = proveedor.objects.filter(estado=False)
            else:
                proveedores = proveedor.objects.filter(estado=True)
            
            proveedores_data = []
            for p in proveedores:
                proveedores_data.append({
                    'id': p.id,
                    'nombre': p.nombre,
                    'telefono': p.telefono,
                    'direccion': p.direccion,
                    'imagen': p.imagen.url if p.imagen else None,
                    'estado': p.estado
                })
            
            return JsonResponse({
                'success': True,
                'proveedores': proveedores_data,
                'total': proveedor.objects.count(),
                'activos': proveedor.objects.filter(estado=True).count(),
                'inactivos': proveedor.objects.filter(estado=False).count()
            })
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
