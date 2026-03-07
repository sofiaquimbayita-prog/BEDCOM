"""
UTILIDADES PARA EXPORTACIÓN DE REPORTES
Módulo con funciones para exportar datos a PDF y Excel
"""

from weasyprint import HTML
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from django.http import HttpResponse
from django.template.loader import render_to_string
from datetime import datetime
import io
import base64

# ====== EXPORTACIÓN A PDF ======
def exportar_pdf(titulo, columnas, datos, nombre_archivo, contexto_extra=None):
    """
    FUNCIÓN PARA EXPORTAR DATOS A PDF USANDO WEASYPRINT
    """
    # Crear contexto base para el template
    # Formatemos la fecha directamente como string para evitar problemas con filtros de Django
    fecha_actual = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    
    contexto = {
        'titulo': titulo,
        'columnas': columnas,
        'datos': datos,
        'now': fecha_actual,
    }
    
    # Si se pasan datos adicionales (como la URL del icono), se agregan al contexto
    if contexto_extra:
        contexto.update(contexto_extra)
    
    # Generar HTML desde el template
    html_string = render_to_string('reportes/reporte_pdf.html', contexto)
    
    # Crear documento PDF (base_url='.' ayuda a resolver rutas en algunos entornos)
    html_object = HTML(string=html_string, base_url='.')
    
    # Generar PDF en memoria
    pdf_bytes = html_object.write_pdf()
    
    # Crear respuesta HTTP con el PDF
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{nombre_archivo}.pdf"'
    
    return response


# ====== EXPORTACIÓN A EXCEL ======
def exportar_excel(titulo, columnas, datos, nombre_archivo):
    """
    FUNCIÓN PARA EXPORTAR DATOS A EXCEL USANDO OPENPYXL
    """
    wb = Workbook()
    ws = wb.active
    ws.title = "Reporte"

    # Estilos para el encabezado
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    alignment = Alignment(horizontal="center", vertical="center")

    # Escribir título del reporte
    ws.merge_cells(start_row=1, start_column=1, end_row=2, end_column=len(columnas))
    title_cell = ws.cell(row=1, column=1, value=titulo)
    title_cell.font = Font(size=14, bold=True)
    title_cell.alignment = alignment

    # Escribir encabezados de columna
    for col_num, column_title in enumerate(columnas, 1):
        cell = ws.cell(row=3, column=col_num, value=column_title)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = alignment

    # Escribir datos
    for row_num, fila in enumerate(datos, 4):
        for col_num, valor in enumerate(fila, 1):
            cell = ws.cell(row=row_num, column=col_num, value=valor)
            cell.alignment = Alignment(horizontal="left")

    # Guardar en memoria y retornar respuesta
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{nombre_archivo}.xlsx"'
    return response


# ====== EXPORTACIÓN DE ESTADÍSTICAS A PDF ======
def exportar_pdf_estadisticas(titulo, estadisticas, nombre_archivo, contexto_extra=None):
    """
    FUNCIÓN PARA EXPORTAR ESTADÍSTICAS GENERALES A PDF USANDO WEASYPRINT
    Muestra métricas clave del sistema en formato de tarjetas
    """
    fecha_actual = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    
    contexto = {
        'titulo': titulo,
        'estadisticas': estadisticas,
        'now': fecha_actual,
    }
    
    if contexto_extra:
        contexto.update(contexto_extra)
    
    # Generar HTML desde el template especializado para estadísticas
    html_string = render_to_string('reportes/reporte_estadisticas.html', contexto)
    
    # Crear documento PDF
    html_object = HTML(string=html_string, base_url='.')
    
    # Generar PDF en memoria
    pdf_bytes = html_object.write_pdf()
    
    # Crear respuesta HTTP con el PDF
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{nombre_archivo}.pdf"'
    
    return response
