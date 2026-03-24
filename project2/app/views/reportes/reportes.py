from django.shortcuts import render
from django.views import View as DjangoView
from django.conf import settings
from app.models import categoria, insumo, producto, proveedor, pedido, detalle_pedido, despacho, compra, historial_acciones 
from app.utils import exportar_pdf, exportar_excel, exportar_pdf_estadisticas
from django.db.models import Sum, F, FloatField
from django.db.models.functions import ExtractMonth, Cast
from datetime import datetime

# ====== VISTAS PARA EXPORTAR REPORTES ======

class ExportarCategoriasPDF(DjangoView):
    def get(self, request):
        # 1. Obtener datos
        categorias = categoria.objects.all()
        columnas = ['ID', 'Nombre', 'Descripción']
        datos = [(cat.id, cat.nombre, cat.descripcion) for cat in categorias]
        
        # 2. Preparar el ICONO (Ruta absoluta para WeasyPrint)
        # Esto construye: http://127.0.0.1:8000/static/ap1/img/icono.png
        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')
        
        nombre_archivo = f'Reporte_Categorias_{datetime.now().strftime("%d_%m_%Y")}'
        
        # REGISTRO HISTORIAL
        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de Categorías',
                usuario=request.user
            )

        # 3. Llamar a la utilidad con el contexto extra
        return exportar_pdf(
            titulo='REPORTE DE CATEGORÍAS - BEDCOM',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )

class ExportarCategoriasExcel(DjangoView):
    def get(self, request):
        categorias = categoria.objects.all()
        columnas = ['ID', 'Nombre', 'Descripción']
        datos = [(cat.id, cat.nombre, cat.descripcion) for cat in categorias]
        
        nombre_archivo = f'Reporte_Categorias_{datetime.now().strftime("%d_%m_%Y")}'
        
        # REGISTRO HISTORIAL
        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de Categorías',
                usuario=request.user
            )

        return exportar_excel(
            titulo='REPORTE DE CATEGORÍAS',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo
        )
        
class ExportarInsumosPDF(DjangoView):
    """Vista adicional para tu reporte de inventario"""
    def get(self, request):
        insumos = insumo.objects.all()
        columnas = ['Nombre', 'Stock', 'Precio Unitario']
        datos = [(i.nombre, i.cantidad, f"${i.precio}") for i in insumos]
        
        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')
        nombre_archivo = f'Reporte_Insumos_{datetime.now().strftime("%d_%m_%Y")}'
        
        # REGISTRO HISTORIAL
        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de Insumos',
                usuario=request.user
            )

        return exportar_pdf(
            titulo='INVENTARIO DE INSUMOS CRÍTICOS',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )
class ExportarInsumosExcel(DjangoView):
    """Vista adicional para tu reporte de inventario"""
    def get(self, request):
        insumos = insumo.objects.all()
        columnas = ['Nombre', 'Stock', 'Precio Unitario']
        datos = [(i.nombre, i.cantidad, f"${i.precio}") for i in insumos]
        
        nombre_archivo = f'Reporte_Insumos_{datetime.now().strftime("%d_%m_%Y")}'
        
        # REGISTRO HISTORIAL
        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de Insumos',
                usuario=request.user
            )

        return exportar_excel(
            titulo='INVENTARIO DE INSUMOS CRÍTICOS',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo
        )


# ====== VISTAS PARA EXPORTAR PRODUCTOS ======
class ExportarProductosPDF(DjangoView):
    def get(self, request):
        productos = producto.objects.select_related('categoria').all()
        columnas = ['ID', 'Nombre', 'Descripción', 'Precio', 'Stock', 'Categoría', 'Estado']
        datos = [(p.id, p.nombre, p.descripcion, f"${p.precio}", p.stock, p.categoria.nombre, 'Activo' if p.estado else 'Inactivo') for p in productos]
        
        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')
        nombre_archivo = f'Reporte_Productos_{datetime.now().strftime("%d_%m_%Y")}'
        
        # REGISTRO HISTORIAL
        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de Productos',
                usuario=request.user
            )

        return exportar_pdf(
            titulo='REPORTE DE PRODUCTOS - BEDCOM',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )


class ExportarProductosExcel(DjangoView):
    def get(self, request):
        productos = producto.objects.select_related('categoria').all()
        columnas = ['ID', 'Nombre', 'Descripción', 'Precio', 'Stock', 'Categoría', 'Estado']
        datos = [(p.id, p.nombre, p.descripcion, f"${p.precio}", p.stock, p.categoria.nombre, 'Activo' if p.estado else 'Inactivo') for p in productos]
        
        nombre_archivo = f'Reporte_Productos_{datetime.now().strftime("%d_%m_%Y")}'
        
        # REGISTRO HISTORIAL
        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de Productos',
                usuario=request.user
            )

        return exportar_excel(
            titulo='REPORTE DE PRODUCTOS',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo
        )


# ====== VISTAS PARA EXPORTAR PROVEEDORES ======
class ExportarProveedoresPDF(DjangoView):
    def get(self, request):
        proveedores = proveedor.objects.all()
        columnas = ['ID', 'Nombre', 'Teléfono', 'Dirección', 'Estado']
        datos = [(p.id, p.nombre, p.telefono, p.direccion, 'Activo' if p.estado else 'Inactivo') for p in proveedores]
        
        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')
        nombre_archivo = f'Reporte_Proveedores_{datetime.now().strftime("%d_%m_%Y")}'
        
        # REGISTRO HISTORIAL
        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de Proveedores',
                usuario=request.user
            )

        return exportar_pdf(
            titulo='REPORTE DE PROVEEDORES - BEDCOM',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )


class ExportarProveedoresExcel(DjangoView):
    def get(self, request):
        proveedores = proveedor.objects.all()
        columnas = ['ID', 'Nombre', 'Teléfono', 'Dirección', 'Estado']
        datos = [(p.id, p.nombre, p.telefono, p.direccion, 'Activo' if p.estado else 'Inactivo') for p in proveedores]
        
        nombre_archivo = f'Reporte_Proveedores_{datetime.now().strftime("%d_%m_%Y")}'
        
        # REGISTRO HISTORIAL
        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de Proveedores',
                usuario=request.user
            )

        return exportar_excel(
            titulo='REPORTE DE PROVEEDORES',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo
        )


# ====== VISTA GENERAL DE ESTADÍSTICAS ======
class ExportarEstadisticasPDF(DjangoView):
    """Vista para exportar reporte general de estadísticas con gráficos"""
    def get(self, request):
        # Obtener todas las estadísticas
        from app.models import pedido, detalle_pedido, despacho, compra, insumo, producto, categoria, proveedor
        
        # 1. Total Ventas
        total_ventas = pedido.objects.aggregate(Sum('total'))['total__sum'] or 0
        
        # 2. Producto más vendido
        producto_top_query = detalle_pedido.objects.values('producto__nombre').annotate(
            total_vendido=Sum('cantidad')
        ).order_by('-total_vendido').first()
        producto_top = producto_top_query['producto__nombre'] if producto_top_query else "N/A"
        
        # 3. Total de productos
        total_productos = producto.objects.count()
        productos_activos = producto.objects.filter(estado=True).count()
        
        # 4. Total de categorías
        total_categorias = categoria.objects.count()
        
        # 5. Total de proveedores
        total_proveedores = proveedor.objects.count()
        proveedores_activos = proveedor.objects.filter(estado=True).count()
        
        # 6. Insumos críticos (menos de 5 unidades)
        insumos_criticos = insumo.objects.filter(cantidad__lt=5).count()
        total_insumos = insumo.objects.count()
        
        # 7. Gastos totales (compras)
        evolucion_gastos = compra.objects.annotate(mes_num=ExtractMonth('fecha_suministro')).values('mes_num').annotate(
            total_gasto=Sum(Cast(F('cantidad'), FloatField()) * Cast(F('precio_unidad'), FloatField()), output_field=FloatField())
        )
        total_gastos = sum(float(g['total_gasto']) for g in evolucion_gastos)
        
        # 8. Utilidad neta
        utilidad_neta = float(total_ventas) - total_gastos
        margen = (utilidad_neta / float(total_ventas) * 100) if total_ventas > 0 else 0
        
        # 9. Pedidos pendientes
        pedidos_pendientes = pedido.objects.filter(estado='Pendiente').count()
        
        # 10. Despachos en proceso
        despachos_proceso = despacho.objects.filter(estado_entrega='En proceso').count()
        
        # Preparar datos para el PDF
        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')
        nombre_archivo = f'Reporte_Estadisticas_{datetime.now().strftime("%d_%m_%Y")}'
        
        # Crear estadísticas como lista de tuplas
        estadisticas = [
            ('Total de Ventas', f'${total_ventas:,.2f}'),
            ('Total de Gastos', f'${total_gastos:,.2f}'),
            ('Utilidad Neta', f'${utilidad_neta:,.2f}'),
            ('Margen de Ganancia', f'{margen:.1f}%'),
            ('Producto Más Vendido', producto_top),
            ('Total de Productos', str(total_productos)),
            ('Productos Activos', str(productos_activos)),
            ('Total de Categorías', str(total_categorias)),
            ('Total de Proveedores', str(total_proveedores)),
            ('Proveedores Activos', str(proveedores_activos)),
            ('Total de Insumos', str(total_insumos)),
            ('Insumos Críticos (Stock < 5)', str(insumos_criticos)),
            ('Pedidos Pendientes', str(pedidos_pendientes)),
            ('Despachos en Proceso', str(despachos_proceso)),
        ]
        
        # REGISTRO HISTORIAL
        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de Estadísticas Generales',
                usuario=request.user
            )

        return exportar_pdf_estadisticas(
            titulo='REPORTE GENERAL DE ESTADÍSTICAS - BEDCOM',
            estadisticas=estadisticas,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )


class ExportarEstadisticasExcel(DjangoView):
    """Vista para exportar reporte general de estadísticas a Excel"""
    def get(self, request):
        from app.models import pedido, detalle_pedido, despacho, compra, insumo, producto, categoria, proveedor
        
        # 1. Total Ventas
        total_ventas = pedido.objects.aggregate(Sum('total'))['total__sum'] or 0
        
        # 2. Producto más vendido
        producto_top_query = detalle_pedido.objects.values('producto__nombre').annotate(
            total_vendido=Sum('cantidad')
        ).order_by('-total_vendido').first()
        producto_top = producto_top_query['producto__nombre'] if producto_top_query else "N/A"
        
        # 3. Total de productos
        total_productos = producto.objects.count()
        productos_activos = producto.objects.filter(estado=True).count()
        
        # 4. Total de categorías
        total_categorias = categoria.objects.count()
        
        # 5. Total de proveedores
        total_proveedores = proveedor.objects.count()
        proveedores_activos = proveedor.objects.filter(estado=True).count()
        
        # 6. Insumos críticos
        insumos_criticos = insumo.objects.filter(cantidad__lt=5).count()
        total_insumos = insumo.objects.count()
        
        # 7. Gastos totales
        evolucion_gastos = compra.objects.annotate(mes_num=ExtractMonth('fecha_suministro')).values('mes_num').annotate(
            total_gasto=Sum(Cast(F('cantidad'), FloatField()) * Cast(F('precio_unidad'), FloatField()), output_field=FloatField())
        )
        total_gastos = sum(float(g['total_gasto']) for g in evolucion_gastos)
        
        # 8. Utilidad neta
        utilidad_neta = float(total_ventas) - total_gastos
        margen = (utilidad_neta / float(total_ventas) * 100) if total_ventas > 0 else 0
        
        # 9. Pedidos pendientes
        pedidos_pendientes = pedido.objects.filter(estado='Pendiente').count()
        
        # 10. Despachos en proceso
        despachos_proceso = despacho.objects.filter(estado_entrega='En proceso').count()
        
        nombre_archivo = f'Reporte_Estadisticas_{datetime.now().strftime("%d_%m_%Y")}'
        
        # Columnas para Excel
        columnas = ['Métrica', 'Valor']
        
        # Datos para Excel
        datos = [
            ('Total de Ventas', f'${total_ventas:,.2f}'),
            ('Total de Gastos', f'${total_gastos:,.2f}'),
            ('Utilidad Neta', f'${utilidad_neta:,.2f}'),
            ('Margen de Ganancia', f'{margen:.1f}%'),
            ('Producto Más Vendido', producto_top),
            ('Total de Productos', str(total_productos)),
            ('Productos Activos', str(productos_activos)),
            ('Total de Categorías', str(total_categorias)),
            ('Total de Proveedores', str(total_proveedores)),
            ('Proveedores Activos', str(proveedores_activos)),
            ('Total de Insumos', str(total_insumos)),
            ('Insumos Críticos (Stock < 5)', str(insumos_criticos)),
            ('Pedidos Pendientes', str(pedidos_pendientes)),
            ('Despachos en Proceso', str(despachos_proceso)),
        ]
        
        # REGISTRO HISTORIAL
        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de Estadísticas Generales',
                usuario=request.user
            )

        return exportar_excel(
            titulo='REPORTE GENERAL DE ESTADÍSTICAS',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo
        )