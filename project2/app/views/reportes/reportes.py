import re
from django.shortcuts import render
from django.views import View as DjangoView
from django.conf import settings
from app.models import bom, categoria, cliente, entrada, insumo, pedido, producto, proveedor, salida_producto, historial_acciones
from app.utils import exportar_pdf, exportar_excel, exportar_pdf_estadisticas
from django.db.models import Sum, F, FloatField
from django.db.models.functions import ExtractMonth, Cast
from datetime import datetime


def clean_text(value):
    if value is None:
        return ""
    text = str(value).replace('\r', ' ').replace('\n', ' ').replace('\t', ' ')
    text = re.sub(r'\s{2,}', ' ', text).strip()
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)
    return text


def format_currency_co(value):
    try:
        amount = float(value)
    except (TypeError, ValueError):
        return clean_text(value)
    formatted = f"{amount:,.2f}"
    formatted = formatted.replace(',', 'X').replace('.', ',').replace('X', '.')
    return f"${formatted}"


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


# ====== VISTAS PARA EXPORTAR BOM / RECETAS ======
class ExportarBOMPDF(DjangoView):
    def get(self, request):
        recetas = bom.objects.select_related('producto', 'insumo').all()
        columnas = ['ID', 'Producto', 'Insumo', 'Cantidad', 'Unidad de medida']
        datos = [
            (
                r.id,
                r.producto.nombre,
                r.insumo.nombre,
                r.cantidad,
                r.unidad_medida
            )
            for r in recetas
        ]

        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')
        nombre_archivo = f'Reporte_BOM_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de BOM/Recetas',
                usuario=request.user
            )

        return exportar_pdf(
            titulo='REPORTE BOM / RECETAS - BEDCOM',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )


class ExportarBOMExcel(DjangoView):
    def get(self, request):
        recetas = bom.objects.select_related('producto', 'insumo').all()
        columnas = ['ID', 'Producto', 'Insumo', 'Cantidad', 'Unidad de medida']
        datos = [
            (
                r.id,
                r.producto.nombre,
                r.insumo.nombre,
                r.cantidad,
                r.unidad_medida
            )
            for r in recetas
        ]

        nombre_archivo = f'Reporte_BOM_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de BOM/Recetas',
                usuario=request.user
            )

        return exportar_excel(
            titulo='REPORTE BOM / RECETAS',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo
        )


# ====== VISTAS PARA EXPORTAR INVENTARIO ======
class ExportarInventarioPDF(DjangoView):
    def get(self, request):
        inventario = []
        productos = producto.objects.select_related('categoria').all()
        insumos = insumo.objects.select_related('id_categoria', 'id_proveedor').all()

        inventario.extend([
            (p.id, 'Producto', p.nombre, p.categoria.nombre, p.stock, f'${p.precio}')
            for p in productos
        ])
        inventario.extend([
            (i.id, 'Insumo', i.nombre, i.id_categoria.nombre, i.cantidad, f'${i.precio}')
            for i in insumos
        ])

        columnas = ['ID', 'Tipo', 'Nombre', 'Categoría', 'Stock', 'Precio']
        nombre_archivo = f'Reporte_Inventario_{datetime.now().strftime("%d_%m_%Y")}'
        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de Inventario',
                usuario=request.user
            )

        return exportar_pdf(
            titulo='REPORTE DE INVENTARIO - BEDCOM',
            columnas=columnas,
            datos=inventario,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )


class ExportarInventarioExcel(DjangoView):
    def get(self, request):
        inventario = []
        productos = producto.objects.select_related('categoria').all()
        insumos = insumo.objects.select_related('id_categoria', 'id_proveedor').all()

        inventario.extend([
            (p.id, 'Producto', p.nombre, p.categoria.nombre, p.stock, f'${p.precio}')
            for p in productos
        ])
        inventario.extend([
            (i.id, 'Insumo', i.nombre, i.id_categoria.nombre, i.cantidad, f'${i.precio}')
            for i in insumos
        ])

        columnas = ['ID', 'Tipo', 'Nombre', 'Categoría', 'Stock', 'Precio']
        nombre_archivo = f'Reporte_Inventario_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de Inventario',
                usuario=request.user
            )

        return exportar_excel(
            titulo='REPORTE DE INVENTARIO',
            columnas=columnas,
            datos=inventario,
            nombre_archivo=nombre_archivo
        )


# ====== VISTAS PARA EXPORTAR CLIENTES ======
class ExportarClientesPDF(DjangoView):
    def get(self, request):
        clientes = cliente.objects.all()
        columnas = ['ID', 'Nombre', 'Teléfono', 'Dirección', 'Estado']
        datos = [
            (c.id, c.nombre, c.telefono, c.direccion, 'Activo' if c.estado else 'Inactivo')
            for c in clientes
        ]

        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')
        nombre_archivo = f'Reporte_Clientes_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de Clientes',
                usuario=request.user
            )

        return exportar_pdf(
            titulo='REPORTE DE CLIENTES - BEDCOM',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )


class ExportarClientesExcel(DjangoView):
    def get(self, request):
        clientes = cliente.objects.all()
        columnas = ['ID', 'Nombre', 'Teléfono', 'Dirección', 'Estado']
        datos = [
            (c.id, c.nombre, c.telefono, c.direccion, 'Activo' if c.estado else 'Inactivo')
            for c in clientes
        ]

        nombre_archivo = f'Reporte_Clientes_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de Clientes',
                usuario=request.user
            )

        return exportar_excel(
            titulo='REPORTE DE CLIENTES',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo
        )


# ====== VISTAS PARA EXPORTAR PEDIDOS ======
class ExportarPedidosPDF(DjangoView):
    def get(self, request):
        pedidos = pedido.objects.select_related('cliente').all()
        columnas = ['ID', 'Cliente', 'Fecha', 'Fecha Entrega', 'Estado', 'Total', 'Abono', 'Saldo pendiente']
        datos = [
            (
                p.id,
                p.cliente.nombre,
                p.fecha.strftime('%d/%m/%Y %H:%M'),
                p.fecha_entrega.strftime('%d/%m/%Y') if p.fecha_entrega else 'N/A',
                p.estado,
                f'${p.total}',
                f'${p.abono or 0}',
                f'${p.saldo_pendiente}'
            )
            for p in pedidos
        ]

        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')
        nombre_archivo = f'Reporte_Pedidos_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de Pedidos',
                usuario=request.user
            )

        return exportar_pdf(
            titulo='REPORTE DE PEDIDOS - BEDCOM',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )


class ExportarPedidosExcel(DjangoView):
    def get(self, request):
        pedidos = pedido.objects.select_related('cliente').all()
        columnas = ['ID', 'Cliente', 'Fecha', 'Fecha Entrega', 'Estado', 'Total', 'Abono', 'Saldo pendiente']
        datos = [
            (
                p.id,
                p.cliente.nombre,
                p.fecha.strftime('%d/%m/%Y %H:%M'),
                p.fecha_entrega.strftime('%d/%m/%Y') if p.fecha_entrega else 'N/A',
                p.estado,
                f'${p.total}',
                f'${p.abono or 0}',
                f'${p.saldo_pendiente}'
            )
            for p in pedidos
        ]

        nombre_archivo = f'Reporte_Pedidos_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de Pedidos',
                usuario=request.user
            )

        return exportar_excel(
            titulo='REPORTE DE PEDIDOS',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo
        )


# ====== VISTAS PARA EXPORTAR ENTRADAS ======
class ExportarEntradasPDF(DjangoView):
    def get(self, request):
        entradas = entrada.objects.select_related('producto', 'proveedor').all()
        columnas = ['ID', 'Producto', 'Fecha', 'Cantidad', 'Precio Unitario', 'Total', 'Proveedor', 'Estado', 'Anulado']
        datos = [
            (
                e.id,
                e.producto.nombre,
                e.fecha.strftime('%d/%m/%Y %H:%M'),
                e.cantidad,
                f'${e.precio_unitario}',
                f'${e.total}',
                e.proveedor.nombre if e.proveedor else 'N/A',
                'Activo' if e.estado else 'Inactivo',
                'Sí' if e.anulado else 'No'
            )
            for e in entradas
        ]

        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')
        nombre_archivo = f'Reporte_Entradas_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de Entradas',
                usuario=request.user
            )

        return exportar_pdf(
            titulo='REPORTE DE ENTRADAS - BEDCOM',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )


class ExportarEntradasExcel(DjangoView):
    def get(self, request):
        entradas = entrada.objects.select_related('producto', 'proveedor').all()
        columnas = ['ID', 'Producto', 'Fecha', 'Cantidad', 'Precio Unitario', 'Total', 'Proveedor', 'Estado', 'Anulado']
        datos = [
            (
                e.id,
                e.producto.nombre,
                e.fecha.strftime('%d/%m/%Y %H:%M'),
                e.cantidad,
                f'${e.precio_unitario}',
                f'${e.total}',
                e.proveedor.nombre if e.proveedor else 'N/A',
                'Activo' if e.estado else 'Inactivo',
                'Sí' if e.anulado else 'No'
            )
            for e in entradas
        ]

        nombre_archivo = f'Reporte_Entradas_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de Entradas',
                usuario=request.user
            )

        return exportar_excel(
            titulo='REPORTE DE ENTRADAS',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo
        )


# ====== VISTAS PARA EXPORTAR SALIDAS ======
class ExportarSalidasPDF(DjangoView):
    def get(self, request):
        salidas = salida_producto.objects.select_related('id_producto').all()
        columnas = ['ID', 'Producto', 'Fecha', 'Cantidad', 'Motivo', 'Responsable', 'Estado']
        datos = [
            (
                s.id,
                s.id_producto.nombre,
                s.fecha.strftime('%d/%m/%Y'),
                s.cantidad,
                s.motivo,
                s.responsable,
                'Activo' if s.estado else 'Inactivo'
            )
            for s in salidas
        ]

        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'ap1/img/icono.png')
        nombre_archivo = f'Reporte_Salidas_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó PDF de Salidas',
                usuario=request.user
            )

        return exportar_pdf(
            titulo='REPORTE DE SALIDAS - BEDCOM',
            columnas=columnas,
            datos=datos,
            nombre_archivo=nombre_archivo,
            contexto_extra={'logo_url': logo_url}
        )


class ExportarSalidasExcel(DjangoView):
    def get(self, request):
        salidas = salida_producto.objects.select_related('id_producto').all()
        columnas = ['ID', 'Producto', 'Fecha', 'Cantidad', 'Motivo', 'Responsable', 'Estado']
        datos = [
            (
                s.id,
                s.id_producto.nombre,
                s.fecha.strftime('%d/%m/%Y'),
                s.cantidad,
                s.motivo,
                s.responsable,
                'Activo' if s.estado else 'Inactivo'
            )
            for s in salidas
        ]

        nombre_archivo = f'Reporte_Salidas_{datetime.now().strftime("%d_%m_%Y")}'

        if request.user.is_authenticated:
            historial_acciones.objects.create(
                modulo='reportes',
                tipo_accion='consultar',
                descripcion='Exportó Excel de Salidas',
                usuario=request.user
            )

        return exportar_excel(
            titulo='REPORTE DE SALIDAS',
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
            ('Total de Ventas', format_currency_co(total_ventas)),
            ('Total de Gastos', format_currency_co(total_gastos)),
            ('Utilidad Neta', format_currency_co(utilidad_neta)),
            ('Margen de Ganancia', f'{round(margen, 1)}%'),
            ('Producto Más Vendido', clean_text(producto_top)),
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
            ('Total de Ventas', format_currency_co(total_ventas)),
            ('Total de Gastos', format_currency_co(total_gastos)),
            ('Utilidad Neta', format_currency_co(utilidad_neta)),
            ('Margen de Ganancia', f'{round(margen, 1)}%'),
            ('Producto Más Vendido', clean_text(producto_top)),
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