
import os
import subprocess
from datetime import datetime
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.shortcuts import get_object_or_404, redirect
from django.views.generic import ListView, CreateView, View, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.contrib import messages
import shutil
from django.utils import timezone
from django.http import FileResponse, Http404
from ...models import respaldo
from ...forms import RespaldoForm   

class RespaldoListView(ListView):
    """Vista principal de la lista de respaldos"""
    model = respaldo
    template_name = 'respaldos/respaldos.html'
    context_object_name = 'respaldos'

    def get_queryset(self):
        # Cargar todos los respaldos (activos e inactivos)
        return respaldo.objects.all().order_by('-fecha')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = "Gestión de Respaldos"
        context['icono_modulo'] = "fas fa-database"
        return context
    
def obtener_credenciales_mysql():
    db_config = settings.DATABASES['default']
    return {
        'host': db_config.get('HOST', 'localhost'),
        'user': db_config.get('USER', 'root'),
        'password': db_config.get('PASSWORD', ''),
        'database': db_config.get('NAME', 'sena_db'),
        'port': db_config.get('PORT', 3306),
        'mysql_path': r'C:\Program Files\MySQL\MySQL Server 8.0\bin',
    }


def probar_conexion_mysql():
    creds = obtener_credenciales_mysql()
    try:
        cmd = [
            os.path.join(creds["mysql_path"], 'mysql.exe'),
            '-h', creds["host"],
            '-u', creds["user"],
            '-P', str(creds["port"]),
            '--password=' + creds["password"],
            '-e', 'SELECT 1;',
            creds["database"]
        ]

        resultado = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=10
        )

        return resultado.returncode == 0
    except:
        return False

# ========== VISTA PARA MOSTRAR OPCIONES DE RESPALDO ==========
@require_http_methods(["GET", "POST"])
def backup(request):
    if request.method == "POST":
        accion = request.POST.get('accion')

        try:
            if accion == 'backup_completo':
                if not probar_conexion_mysql():
                    return JsonResponse({
                        'error': 'No se puede conectar a MySQL.'
                    }, status=400)

                return realizar_respaldo_completo()

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    # GET
    mysql_ok = probar_conexion_mysql()

    context = {
        'titulo': 'Respaldo y Restauracion de Base de Datos',
        'mysql_conectado': mysql_ok,
    }

    return render(request, 'respaldos/menu.html', context)
import logging
import os
import subprocess
import tempfile
from datetime import datetime
from django.conf import settings

logger = logging.getLogger(__name__)

def realizar_respaldo_completo(timeout_seconds=None):
    """
    Realiza un respaldo completo (estructura + datos)
    
    Args:
        timeout_seconds (int, optional): Timeout en segundos. 
                                        Por defecto usa settings o 300 segundos.
    
    Returns:
        dict: Resultado con la información del respaldo
    
    Raises:
        Exception: Si ocurre algún error durante el respaldo
    """
    # Configurar timeout desde settings si está disponible
    if timeout_seconds is None:
        timeout_seconds = getattr(settings, 'BACKUP_TIMEOUT', 300)
    
    creds = obtener_credenciales_mysql()
    
    # Validar que mysqldump existe
    mysqldump_path = os.path.join(creds["mysql_path"], 'mysqldump.exe')
    if not os.path.exists(mysqldump_path):
        raise Exception(f"No se encontró mysqldump en: {mysqldump_path}")
    
    try:
        # Usar archivo temporal para evitar problemas con caracteres especiales
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.sql', 
                                        encoding='utf-8', delete=False) as tmp_file:
            temp_path = tmp_file.name
        
        # Construir comando mysqldump con mejor manejo de contraseña
        cmd = [
            mysqldump_path,
            '-h', creds["host"],
            '-u', creds["user"],
            '-P', str(creds["port"]),
            f'--password={creds["password"]}',
            '--default-character-set=utf8mb4',
            '--single-transaction',  # Para evitar bloqueos en InnoDB
            '--routines',            # Incluir procedimientos almacenados
            '--triggers',            # Incluir triggers
            '--events',              # Incluir eventos
            creds["database"]
        ]
        
        logger.info(f"Iniciando respaldo completo de {creds['database']}")
        
        # Ejecutar mysqldump y guardar directamente en archivo
        with open(temp_path, 'w', encoding='utf-8') as f:
            resultado = subprocess.run(
                cmd,
                stdout=f,
                stderr=subprocess.PIPE,
                text=True,
                timeout=timeout_seconds,
                encoding='utf-8'
            )
        
        if resultado.returncode != 0:
            error_msg = resultado.stderr
            logger.error(f"Error en mysqldump: {error_msg}")
            raise Exception(f"Error mysqldump: {error_msg}")
        
        # Verificar que el archivo no esté vacío
        if os.path.getsize(temp_path) == 0:
            raise Exception("El respaldo está vacío")
        
        # Leer el contenido y agregar encabezado
        with open(temp_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Agregar comentario con fecha y metadatos
        header = (
            f"-- Respaldo Completo de {creds['database']}\n"
            f"-- Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"-- Tipo: Completo (Estructura + Datos)\n"
            f"-- Tamaño: {os.path.getsize(temp_path) / 1024:.2f} KB\n\n"
        )
        
        sql_content = header + sql_content
        
        # Generar archivo para descarga
        resultado_descarga = generar_archivo_descarga(sql_content, 'backup_completo')
        
        logger.info(f"Respaldo completo exitoso: {resultado_descarga.get('filename', 'desconocido')}")
        
        return resultado_descarga
        
    except subprocess.TimeoutExpired as e:
        logger.error(f"Timeout al ejecutar mysqldump después de {timeout_seconds} segundos")
        raise Exception(f"Timeout al ejecutar mysqldump: el respaldo tomó más de {timeout_seconds} segundos")
    
    except Exception as e:
        logger.error(f"Error en respaldo completo: {str(e)}")
        raise Exception(f"Error en respaldo completo: {str(e)}")
    
    finally:
        # Limpiar archivo temporal si existe
        if 'temp_path' in locals() and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
                logger.debug(f"Archivo temporal eliminado: {temp_path}")
            except Exception as e:
                logger.warning(f"No se pudo eliminar archivo temporal {temp_path}: {e}")
def generar_archivo_descarga(contenido_sql, nombre_archivo):
    """Genera un archivo SQL para descargar"""
    response = HttpResponse(contenido_sql.encode('utf-8'), content_type='application/sql')
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    response['Content-Disposition'] = f'attachment; filename="{nombre_archivo}_{timestamp}.sql"'

    return response

def restaurar_bd_desde_sql(contenido_sql):
    creds = obtener_credenciales_mysql()

    try:
        cmd = [
            os.path.join(creds["mysql_path"], 'mysql.exe'),
            '-h', creds["host"],
            '-u', creds["user"],
            '-P', str(creds["port"]),
            '--password=' + creds["password"],
            creds["database"]
        ]

        proceso = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        stdout, stderr = proceso.communicate(input=contenido_sql, timeout=120)

        if proceso.returncode != 0:
            raise Exception(f"Error MySQL: {stderr}")

        return True

    except subprocess.TimeoutExpired:
        raise Exception("Timeout al restaurar la base de datos")
    except Exception as e:
        raise Exception(f"Error al restaurar: {str(e)}")
class RespaldoDataView(View):
    """
    API para obtener los datos de los respaldos (para DataTables u otras funciones)
    
    Query Parameters:
        mostrar_solo_inactivos (bool): Si es True, muestra solo respaldos inactivos. 
                                       Default: False
    """
    
    def get(self, request, *args, **kwargs):
        try:
            mostrar_solo_inactivos = request.GET.get('mostrar_solo_inactivos', 'false').lower() == 'true'
            
            # Usar select_related si hay relaciones para optimizar consultas
            queryset = respaldo.objects.select_related('usuario') if hasattr(respaldo, 'usuario') else respaldo.objects
            
            if mostrar_solo_inactivos:
                respaldos = queryset.filter(estado=False).order_by('-fecha')
            else:
                respaldos = queryset.all().order_by('-fecha')
            
            # Considerar paginación si es necesario
            data = [
                {
                    'id': r.id,
                    'fecha': r.fecha.strftime('%d/%m/%Y %H:%M'),
                    'usuario': str(r.usuario),  # Asegurar que sea serializable
                    'tipo_respaldo': r.tipo_respaldo,
                    'descripcion': r.descripcion or '',
                    'estado': r.estado,
                }
                for r in respaldos
            ]
            
            return JsonResponse({'data': data})
            
        except Exception as e:
            # Loggear el error aquí
            return JsonResponse(
                {'error': 'Error al obtener los respaldos', 'details': str(e)}, 
                status=500
            )
class RespaldoListView(ListView):
    """Vista principal de la lista de respaldos"""
    model = respaldo
    template_name = 'respaldos/respaldos.html'
    context_object_name = 'respaldos'

    def get_queryset(self):
        # Cargar todos los respaldos (activos e inactivos)
        return respaldo.objects.all().order_by('-fecha')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = "Gestión de Respaldos - BEDCOM"
        context['icono_modulo'] = "fas fa-database"
        return context


class RespaldoCreateView(LoginRequiredMixin, CreateView):
    """Vista para crear un nuevo respaldo"""
    model = respaldo
    form_class = RespaldoForm
    template_name = 'respaldos/respaldos.html'
    success_url = reverse_lazy('respaldos_list')
    login_url = '/login/'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = "Gestión de Respaldos"
        context['icono_modulo'] = "fas fa-database"
        return context

    def form_invalid(self, form):
        messages.error(self.request, 'Por favor corrige los errores del formulario.')
        return self.render_to_response(self.get_context_data(form=form))

    def form_valid(self, form):
        # Generar nombre único para el archivo
        nombre_base = f"backup_{timezone.now().strftime('%Y%m%d_%H%M%S')}.sqlite3"
        ruta_relativa = os.path.join('respaldos_sql', nombre_base)
        ruta_destino = os.path.join(settings.MEDIA_ROOT, ruta_relativa)
        
        # Ruta de la base de datos original
        ruta_db_original = settings.DATABASES['default']['NAME']

        try:
            # Crear directorio si no existe
            os.makedirs(os.path.dirname(ruta_destino), exist_ok=True)
            
            # Copiar la base de datos
            shutil.copy2(ruta_db_original, ruta_destino)
            
            # Guardar el respaldo en la base de datos
            form.instance.archivo = ruta_relativa
            form.instance.usuario = self.request.user.username if self.request.user.is_authenticated else 'sistema'
            form.instance.estado = True
            
            # Mensaje de éxito
            messages.success(self.request, f"¡Respaldo SQLite creado exitosamente: {nombre_base}!")
            
            return super().form_valid(form)

        except Exception as e:
            messages.error(self.request, f"Error al crear el respaldo: {str(e)}")
            return redirect('respaldos_list')


class RespaldoDeleteView(LoginRequiredMixin, View):
    """Vista para inactivar (eliminar lógicamente) un respaldo"""
    login_url = '/login/'
    
    def post(self, request, pk):
        resp = get_object_or_404(respaldo, id=pk)
        try:
            resp.estado = False
            resp.save()
            messages.success(request, "Respaldo inactivado correctamente.")
        except Exception:
            messages.error(request, "No se pudo inactivar el respaldo.")
        
        return redirect('respaldos_list')


class RespaldoRestoreView(LoginRequiredMixin, View):
    """Vista para restaurar (reactivar) un respaldo"""
    login_url = '/login/'
    
    def post(self, request, pk):
        resp = get_object_or_404(respaldo, id=pk)
        try:
            resp.estado = True
            resp.save()
            messages.success(request, "¡Respaldo reactivado exitosamente!")
        except Exception as e:
            messages.error(request, f"Error al reactivar: {e}")
        
        return redirect('respaldos_list')


class DescargarRespaldoView(LoginRequiredMixin, View):
    """Vista para descargar un archivo de respaldo"""
    login_url = '/login/'
    
    def get(self, request, id):
        obj_respaldo = get_object_or_404(respaldo, pk=id)
        
        # Verificar que el archivo exista
        if not obj_respaldo.archivo:
            raise Http404("No hay archivo asociado a este respaldo.")
        
        try:
            # Intentar obtener la ruta física del archivo
            if hasattr(obj_respaldo.archivo, 'path'):
                ruta_fisica = obj_respaldo.archivo.path
            else:
                # Si es solo una cadena, construir la ruta
                ruta_fisica = os.path.join(settings.MEDIA_ROOT, str(obj_respaldo.archivo))
            
            if os.path.exists(ruta_fisica):
                return FileResponse(
                    open(ruta_fisica, 'rb'), 
                    as_attachment=True,
                    filename=os.path.basename(ruta_fisica)
                )
            else:
                raise Http404("El archivo no existe en el servidor.")
                
        except ValueError:
            # El archivo podría no estar disponible
            raise Http404("No se puede acceder al archivo.")

# VISTA PARA RESTAURAR DATOS  
class RestaurarDatosView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        if 'archivo' not in request.FILES:
            messages.error(request, "No se proporcionó archivo.")
            return redirect('respaldos_list')

        archivo = request.FILES['archivo']

        try:
            # Validar extensión
            if not archivo.name.endswith('.sql'):
                messages.error(request, "El archivo debe ser .sql")
                return redirect('respaldos_list')

            # Leer contenido
            contenido_sql = archivo.read().decode('utf-8')

            # Restaurar BD
            restaurar_bd_desde_sql(contenido_sql)

            return JsonResponse({
                'exito': True,
                'mensaje': 'Base de datos restaurada correctamente'
            })

        except Exception as e:
            messages.error(request, f"Error al restaurar: {str(e)}")
            return redirect('respaldos_list')