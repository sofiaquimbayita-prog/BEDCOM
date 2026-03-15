"""
Vistas para el módulo de Entrada de Productos
"""
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from app.models import producto, proveedor, entrada
from app.forms import EntradaForm
from django.db import transaction
from datetime import datetime

# ==============================================
# Vista principal - Lista de entradas
# ==============================================
class EntradaListView(LoginRequiredMixin, View):
    template_name = 'entrada_p/entrada_p.html'
    
    def get(self, request):
        # Cargar productos activos de la base de datos
        productos = producto.objects.filter(estado=True).order_by('nombre')
        
        # Obtener entradas activas NO anuladas
        entradas = entrada.objects.select_related('producto', 'proveedor', 'usuario').filter(estado=True, anulado=False)
        
        context = {
            'entradas': entradas,
            'productos': productos,
            'titulo_pagina': 'ENTRADA DE PRODUCTOS',
        }
        return render(request, self.template_name, context)


# ==============================================
# API - Data para DataTables
# ==============================================
@method_decorator(csrf_exempt, name='dispatch')
class EntradaDataView(View):
    def get(self, request):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Obtener entradas según el filtro
            mostrar_solo_anulados = request.GET.get('mostrar_solo_anulados', 'false').lower() == 'true'
            
            if mostrar_solo_anulados:
                # Mostrar solo entradas anuladas
                entradas = entrada.objects.select_related('producto').filter(estado=True, anulado=True)
            else:
                # Mostrar solo entradas NO anuladas (activas)
                entradas = entrada.objects.select_related('producto').filter(estado=True, anulado=False)
            
            data = []
            for e in entradas:
                try:
                    # Verificar que el producto exista (por si fue eliminado)
                    if e.producto is None:
                        logger.warning(f"Entrada {e.id} tiene producto nulo")
                        continue
                    
                    # Manejar fecha nullable
                    fecha_str = ''
                    if e.fecha:
                        fecha_str = e.fecha.strftime('%d/%m/%Y %H:%M')
                    
                    # Función segura para convertir Decimal a float
                    def to_float(value, default=0):
                        if value is None:
                            return default
                        try:
                            return float(value)
                        except (TypeError, ValueError, Exception):
                            return default
                    
                    data.append({
                        'id': e.id,
                        'fecha': fecha_str,
                        'producto_id': e.producto.id,
                        'producto': e.producto.nombre,
                        'cantidad': e.cantidad,
                        'precio_unitario': to_float(e.precio_unitario),
                        'total': to_float(e.total),
                        'observaciones': e.observaciones or '',
                        'estado': e.estado,
                        'anulado': e.anulado,
                    })
                except Exception as inner_e:
                    logger.error(f"Error procesando entrada {e.id}: {str(inner_e)}")
                    continue
            
            return JsonResponse({'data': data})
        except Exception as e:
            logger.error(f"Error en EntradaDataView: {str(e)}")
            return JsonResponse({'data': [], 'error': str(e)}, status=500)


# ==============================================
# API - Obtener una entrada específica
# ==============================================
@method_decorator(csrf_exempt, name='dispatch')
class EntradaDetailView(View):
    def get(self, request, pk):
        try:
            entrada_obj = get_object_or_404(
                entrada.objects.select_related('producto', 'usuario'),
                pk=pk
            )
            
            data = {
                'id': entrada_obj.id,
                'fecha': entrada_obj.fecha.strftime('%d/%m/%Y %H:%M'),
                'producto_id': entrada_obj.producto.id,
                'producto': entrada_obj.producto.nombre,
                'cantidad': entrada_obj.cantidad,
                'precio_unitario': float(entrada_obj.precio_unitario),
                'total': float(entrada_obj.total),
                'usuario': entrada_obj.usuario.username if entrada_obj.usuario else 'Sistema',
                'observaciones': entrada_obj.observaciones or '',
                'estado': entrada_obj.estado,
                'anulado': entrada_obj.anulado,
            }
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


# ==============================================
# API - Crear entrada
# ==============================================
@method_decorator(csrf_exempt, name='dispatch')
class EntradaCreateView(View):
    def post(self, request):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.error("REQUEST POST: " + str(request.POST))
            
            # Usar el formulario para validar
            # Raw validation matching HTML fields
            producto_id = request.POST.get('producto')
            cantidad_str = request.POST.get('cantidad')
            precio_str = request.POST.get('precio_unitario')
            observaciones = request.POST.get('observaciones', '')
            
            if not producto_id:
                return JsonResponse({'success': False, 'message': 'Selecciona producto'}, status=400)
            if not cantidad_str or int(cantidad_str) <= 0:
                return JsonResponse({'success': False, 'message': 'Cantidad > 0'}, status=400)
            if not precio_str or float(precio_str) <= 0:
                return JsonResponse({'success': False, 'message': 'Precio > 0'}, status=400)
            
            try:
                producto_obj = producto.objects.get(id=producto_id, estado=True)
                cantidad = int(cantidad_str)
                precio_unitario = float(precio_str)
            except:
                return JsonResponse({'success': False, 'message': 'Datos inválidos'}, status=400)
            
            logger.error(f"Raw validated: producto={producto_obj.nombre}, cant={cantidad}, precio={precio_unitario}")
            
            # Calcular total
            total = cantidad * precio_unitario
            
            # Obtener usuario (si está autenticado)
            usuario_obj = None
            if request.user.is_authenticated:
                from app.models import usuario
                try:
                    usuario_obj = usuario.objects.filter(username=request.user.username).first()
                except:
                    pass
            
            # Importar modelos necesarios
            from app.models import insumo, bom
            
            # Buscar receta BOM para este producto
            recetas_bom = bom.objects.filter(producto=producto_obj)
            
            # Lista para almacenar los insumos a descontar
            insumos_a_descontar = []
            errores_insumos = []
            
            # Si existe receta BOM, validar y preparar descuento de insumos
            if recetas_bom.exists():
                for receta in recetas_bom:
                    insumo_obj = receta.insumo
                    cantidad_necesaria = receta.cantidad * cantidad
                    
                    # Validar que haya suficiente stock
                    if insumo_obj.cantidad < cantidad_necesaria:
                        errores_insumos.append(
                            f"No hay suficiente stock de '{insumo_obj.nombre}'. "
                            f"Se necesitan {cantidad_necesaria} {insumo_obj.unidad_medida}, "
                            f"pero solo hay {insumo_obj.cantidad}."
                        )
                    else:
                        insumos_a_descontar.append({
                            'insumo': insumo_obj,
                            'cantidad': cantidad_necesaria
                        })
                
                # Si hay errores de stock, retornar error
                if errores_insumos:
                    return JsonResponse({
                        'success': False,
                        'message': 'Error: Stock insuficiente de insumos',
                        'errors': errores_insumos
                    }, status=400)
            
            # Crear entrada con transacción
            with transaction.atomic():
                # 1. Crear la entrada
                entrada_obj = entrada.objects.create(
                    producto=producto_obj,
                    cantidad=cantidad,
                    precio_unitario=precio_unitario,
                    total=total,
                    proveedor=None,
                    usuario=usuario_obj,
                    observaciones=observaciones,
                    estado=True
                )
                
                # 2. Aumentar stock del producto
                producto_obj.stock += cantidad
                producto_obj.save()
                
                # 3. Descontar insumos si existe receta BOM
                if insumos_a_descontar:
                    for item in insumos_a_descontar:
                        item['insumo'].cantidad -= item['cantidad']
                        item['insumo'].save()
                        logger.error(f"Descontado insumo: {item['insumo'].nombre} - {item['cantidad']} unidades")
            
            logger.error("ENTRADA CREADA CON ID: " + str(entrada_obj.id))
            
            return JsonResponse({
                'success': True,
                'message': 'Entrada creada correctamente',
                'entrada': {
                    'id': entrada_obj.id,
                    'producto': entrada_obj.producto.nombre,
                    'cantidad': entrada_obj.cantidad,
                    'precio_unitario': float(entrada_obj.precio_unitario),
                    'total': float(entrada_obj.total),
                    'stock_actual': producto_obj.stock
                }
            })
            
        except Exception as e:
            import traceback
            logger.error("EXCEPTION: " + str(e))
            logger.error(traceback.format_exc())
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


# ==============================================
# API - Actualizar entrada
# ==============================================
@method_decorator(csrf_exempt, name='dispatch')
class EntradaUpdateView(View):
    def post(self, request, pk):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            entrada_obj = get_object_or_404(entrada, pk=pk)
            
            # Obtener datos del formulario
            producto_id = request.POST.get('producto')
            cantidad = int(request.POST.get('cantidad', 0))
            precio_unitario = float(request.POST.get('precio_unitario', 0))
            proveedor_id = request.POST.get('proveedor')
            observaciones = request.POST.get('observaciones', '')
            
            # Validaciones
            if not producto_id:
                return JsonResponse({
                    'success': False,
                    'message': 'Debe seleccionar un producto'
                }, status=400)
            
            if cantidad <= 0:
                return JsonResponse({
                    'success': False,
                    'message': 'La cantidad debe ser mayor a 0'
                }, status=400)
            
            # Obtener objetos relacionados
            producto_obj = get_object_or_404(producto, pk=producto_id)
            proveedor_obj = None
            if proveedor_id:
                proveedor_obj = get_object_or_404(proveedor, pk=proveedor_id)
            
            # Calcular diferencia de cantidad
            diferencia_cantidad = cantidad - entrada_obj.cantidad
            
            # Actualizar con transacción
            with transaction.atomic():
                # Revertir stock anterior
                producto_obj.stock -= entrada_obj.cantidad
                
                # Actualizar entrada
                entrada_obj.producto = producto_obj
                entrada_obj.cantidad = cantidad
                entrada_obj.precio_unitario = precio_unitario
                entrada_obj.total = cantidad * precio_unitario
                entrada_obj.proveedor = proveedor_obj
                entrada_obj.observaciones = observaciones
                entrada_obj.save()
                
                # Aplicar nuevo stock
                producto_obj.stock += cantidad
                producto_obj.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Entrada actualizada correctamente',
                'entrada': {
                    'id': entrada_obj.id,
                    'producto': entrada_obj.producto.nombre,
                    'cantidad': entrada_obj.cantidad,
                    'precio_unitario': float(entrada_obj.precio_unitario),
                    'total': float(entrada_obj.total),
                    'stock_actual': producto_obj.stock
                }
            })
            
        except Exception as e:
            logger.error("EXCEPTION: " + str(e))
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


# ==============================================
# API - Anular entrada (anulación lógica)
# ==============================================
@method_decorator(csrf_exempt, name='dispatch')
class EntradaDeleteView(View):
    def post(self, request, pk):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            entrada_obj = get_object_or_404(entrada, pk=pk)
            
            # Verificar si ya está anulado
            if entrada_obj.anulado:
                return JsonResponse({
                    'success': False,
                    'message': 'La entrada ya está anulada'
                }, status=400)
            
            # Anulación lógica - NO se revierte el stock para mantener trazabilidad
            with transaction.atomic():
                entrada_obj.anulado = True
                entrada_obj.save()
            
            logger.error("ENTRADA ANULADA: " + str(pk))
            
            return JsonResponse({
                'success': True,
                'message': 'Entrada anulada correctamente'
            })
            
        except Exception as e:
            logger.error("EXCEPTION: " + str(e))
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


# ==============================================
# API - Reactivar entrada (quitar anulación)
# ==============================================
@method_decorator(csrf_exempt, name='dispatch')
class EntradaReactivarView(View):
    def post(self, request, pk):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            entrada_obj = get_object_or_404(entrada, pk=pk)
            
            # Verificar si no está anulado
            if not entrada_obj.anulado:
                return JsonResponse({
                    'success': False,
                    'message': 'La entrada no está anulada'
                }, status=400)
            
            # Reactivar entrada
            with transaction.atomic():
                entrada_obj.anulado = False
                entrada_obj.save()
            
            logger.error("ENTRADA REACTIVADA: " + str(pk))
            
            return JsonResponse({
                'success': True,
                'message': 'Entrada reactivada correctamente'
            })
            
        except Exception as e:
            logger.error("EXCEPTION: " + str(e))
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)

