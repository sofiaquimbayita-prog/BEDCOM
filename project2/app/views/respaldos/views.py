from django.shortcuts import get_object_or_404, redirect, render
from django.views.generic import ListView, CreateView, View, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
import os
import shutil
from django.utils import timezone
import subprocess
from django.http import FileResponse, Http404
from ...models import respaldo
from ...forms import RespaldoForm
from django.conf import settings
from django.db import connections
from django.db.utils import OperationalError


# ================= VERIFICAR CONEXIÓN A BD =================
def verificar_db():
    try:
        with connections['default'].cursor() as cursor:
            cursor.execute("SELECT 1")
        return True
    except Exception:
        return False
    
from django.views.decorators.http import require_http_methods

# ================= RESTAURAR BD =================
@require_http_methods(["POST"])
def restaurar_datos(request):

    if 'archivo' not in request.FILES:
        return JsonResponse({'error': 'No se proporcionó archivo'}, status=400)

    archivo = request.FILES['archivo']

    if not archivo.name.endswith('.sql'):
        return JsonResponse({'error': 'El archivo debe ser .sql'}, status=400)

    try:
        db = settings.DATABASES['default']

        ruta_temp = os.path.join(settings.MEDIA_ROOT, 'temp_restore.sql')

        # Guardar archivo temporal
        with open(ruta_temp, 'wb+') as destino:
            for chunk in archivo.chunks():
                destino.write(chunk)

        comando = [
            r'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe',
            '-h', db['HOST'],
            '-u', db['USER'],
            '-P', str(db['PORT']),
            f"--password={db['PASSWORD']}",
            db['NAME']
        ]

        # Ejecutar SQL
        with open(ruta_temp, 'r', encoding='utf-8') as f:
            resultado = subprocess.run(comando, stdin=f)

        if resultado.returncode != 0:
            raise Exception("Error ejecutando el SQL")

        os.remove(ruta_temp)

        return JsonResponse({
            'mensaje': 'Base de datos restaurada correctamente'
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

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
        
        context['mysql_conectado'] = verificar_db()
        
        return context
    
    def post(self, request, *args, **kwargs):

        accion = request.POST.get('accion')

        if accion == 'backup_completo':
            try:
                from datetime import datetime

                db = settings.DATABASES['default']

                cmd = [
                    r'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe',
                    '-h', db['HOST'],
                    '-u', db['USER'],
                    '-P', str(db['PORT']),
                    f"--password={db['PASSWORD']}",
                    db['NAME']
                ]

                resultado = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=60
                )

                if resultado.returncode != 0:
                    raise Exception(resultado.stderr)

                sql_content = resultado.stdout

                if not sql_content.strip():
                    raise Exception("El respaldo está vacío")

                # ================= GUARDAR ARCHIVO =================
                nombre = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
                ruta_relativa = os.path.join('respaldos_sql', nombre)
                ruta_destino = os.path.join(settings.MEDIA_ROOT, ruta_relativa)

                os.makedirs(os.path.dirname(ruta_destino), exist_ok=True)

                with open(ruta_destino, 'w', encoding='utf-8') as f:
                    f.write(sql_content)

                # ================= GUARDAR EN BD =================
                respaldo.objects.create(
                    archivo=ruta_relativa,
                    usuario=request.user.username if request.user.is_authenticated else 'sistema',
                    tipo_respaldo='completo',
                    descripcion='Backup MySQL generado',
                    estado=True
                )

                # ================= DESCARGAR =================
                response = HttpResponse(sql_content, content_type='application/sql')
                response['Content-Disposition'] = f'attachment; filename="{nombre}"'

                return response

            except Exception as e:
                messages.error(request, f"Error: {str(e)}")

        return redirect('respaldos_list')


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

def modal_respaldos(request):
    return render(request, 'respaldos/modal_restauracion.html', {
        'mysql_conectado': verificar_db()
    })