
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

def realizar_respaldo_completo():
    """Realiza un respaldo completo (estructura + datos)"""
    creds = obtener_credenciales_mysql()

    try:
        # Construir comando mysqldump
        cmd = [
            os.path.join(creds["mysql_path"], 'mysqldump.exe'),
            '-h', creds["host"],
            '-u', creds["user"],
            '-P', str(creds["port"]),
            '--password=' + creds["password"],
            creds["database"]
        ]


        # Ejecutar mysqldump y capturar output
        resultado = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60  
        )


        if resultado.returncode != 0:
            raise Exception(f"Error mysqldump: {resultado.stderr}")

        sql_content = resultado.stdout

        if not sql_content.strip():
            raise Exception("El respaldo esta vacio")

        # Agregar comentario con fecha
        sql_content = f"-- Respaldo Completo de {creds['database']}\n" \
                      f"-- Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n" \
                      f"-- Tipo: Completo (Estructura + Datos)\n\n" + sql_content

        return generar_archivo_descarga(sql_content, 'backup_completo')

    except subprocess.TimeoutExpired:
        raise Exception("Timeout al ejecutar mysqldump")
    except Exception as e:
        print(f"Error en respaldo completo: {str(e)}")
        raise Exception(f"Error en respaldo completo: {str(e)}")

def generar_archivo_descarga(contenido_sql, nombre_archivo):
    """Genera un archivo SQL para descargar"""
    response = HttpResponse(contenido_sql.encode('utf-8'), content_type='application/sql')
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    response['Content-Disposition'] = f'attachment; filename="{nombre_archivo}_{timestamp}.sql"'

    return response

import tempfile  # ⬅️ agrégalo arriba con los imports

def restaurar_bd_desde_sql(archivo):
    creds = obtener_credenciales_mysql()

    try:
        # Guardar archivo temporal
        with tempfile.NamedTemporaryFile(delete=False, suffix=".sql") as temp:
            for chunk in archivo.chunks():
                temp.write(chunk)
            temp_path = temp.name

        cmd = [
            os.path.join(creds["mysql_path"], 'mysql.exe'),
            '-h', creds["host"],
            '-u', creds["user"],
            '-P', str(creds["port"]),
            f'--password={creds["password"]}',
            creds["database"]
        ]

        with open(temp_path, 'r', encoding='utf-8') as f:
            proceso = subprocess.run(
                cmd,
                stdin=f,
                capture_output=True,
                text=True
            )

        os.remove(temp_path)

        if proceso.returncode != 0:
            raise Exception(proceso.stderr)

        return True

    except Exception as e:
        raise Exception(f"Error al restaurar: {str(e)}")

class RespaldoDataView(View):
    """API para obtener los datos de los respaldos (para DataTables u otras funciones)"""
    def get(self, request, *args, **kwargs):
        mostrar_solo_inactivos = request.GET.get('mostrar_solo_inactivos', 'false').lower() == 'true'
        
        if mostrar_solo_inactivos:
            respaldos = respaldo.objects.filter(estado=False).order_by('-fecha')
        else:
            respaldos = respaldo.objects.all().order_by('-fecha')
        
        data = []
        for r in respaldos:
            data.append({
                'id': r.id,
                'fecha': r.fecha.strftime('%d/%m/%Y %H:%M'),
                'usuario': r.usuario,
                'tipo_respaldo': r.tipo_respaldo,
                'descripcion': r.descripcion or '',
                'estado': r.estado,
            })
        
        return JsonResponse({'data': data}, safe=False)




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
            return JsonResponse({
                'exito': False,
                'mensaje': 'No se proporcionó archivo'
            }, status=400)

        archivo = request.FILES['archivo']

        try:
            # Validar extensión
            if not archivo.name.endswith('.sql'):
                messages.error(request, "El archivo debe ser .sql")
                return redirect('respaldos_list')

            # Validar conexión primero
            if not probar_conexion_mysql():
                return JsonResponse({
                    'exito': False,
                    'mensaje': 'No hay conexión a MySQL'
                }, status=400)

            # Restaurar usando archivo
            restaurar_bd_desde_sql(archivo)

            return JsonResponse({
                'exito': True,
                'mensaje': 'Base de datos restaurada correctamente'
            })

            return JsonResponse({
                'exito': True,
                'mensaje': 'Base de datos restaurada correctamente'
            })

        except Exception as e:
            return JsonResponse({
                'exito': False,
                'mensaje': f'Error: {str(e)}'
            }, status=500)