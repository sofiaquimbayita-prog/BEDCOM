from django.shortcuts import get_object_or_404, redirect
from django.views.generic import ListView, CreateView, View, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.contrib import messages
import os
import shutil
from django.utils import timezone
import subprocess
from django.http import FileResponse, Http404
from ...models import respaldo  # Tu modelo en minúsculas
from django.conf import settings

# 1. LISTAR RESPALDOS
class RespaldoListView(ListView):
    model = respaldo
    template_name = 'respaldos/respaldos.html'
    context_object_name = 'respaldos'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Aquí defines el título que quieres que aparezca
        context['titulo_pagina'] = "Gestión de Respaldos"
        context['icono_modulo'] = "fas fa-database"
        return context

# 2. GENERAR (CREAR) RESPALDO
class RespaldoCreateView(CreateView):
    model = respaldo
    fields = ['tipo_respaldo', 'descripcion']
    success_url = reverse_lazy('respaldos_list')

    def form_valid(self, form):
        # 1. Nombre del nuevo respaldo
        nombre_base = f"backup_{timezone.now().strftime('%Y%m%d_%H%M%S')}.sqlite3"
        ruta_relativa = os.path.join('respaldos_sql', nombre_base)
        ruta_destino = os.path.join(settings.MEDIA_ROOT, ruta_relativa)

        # 2. Ruta de tu base de datos actual (SQLite)
        # Django la tiene en settings.DATABASES['default']['NAME']
        ruta_db_original = settings.DATABASES['default']['NAME']

        try:
            # 3. Asegurar que la carpeta de destino exista
            os.makedirs(os.path.dirname(ruta_destino), exist_ok=True)

            # 4. Copiar el archivo de la DB
            shutil.copy2(ruta_db_original, ruta_destino)

            # 5. Guardar datos en el modelo
            form.instance.archivo = ruta_relativa
            form.instance.usuario = self.request.user.username if self.request.user.is_authenticated else 'sistema'
            form.instance.estado = True
            
            messages.success(self.request, f"¡Respaldo SQLite creado: {nombre_base}!")
            return super().form_valid(form)

        except Exception as e:
            messages.error(self.request, f"Error al copiar la base de datos: {str(e)}")
            return redirect('respaldos_list')

# 3. ELIMINAR (DESACTIVAR) RESPALDO
class RespaldoDeleteView(View):
    def post(self, request, pk):
        resp = get_object_or_404(respaldo, id=pk)
        try:
            resp.estado = False
            resp.save()
            messages.success(request, "Respaldo eliminado del historial correctamente.")
        except Exception:
            messages.error(request, "No se pudo eliminar el registro.")
        
        return redirect('respaldos_list')
# 4. RESTAURAR (REACTIVAR) RESPALDO
class RespaldoRestoreView(View):
    def post(self, request, pk):
        # Buscamos el respaldo sin importar si está activo o no
        resp = get_object_or_404(respaldo, id=pk)
        try:
            resp.estado = True  # Lo activamos de nuevo
            resp.save()
            messages.success(request, "¡Respaldo restaurado con éxito!")
        except Exception as e:
            messages.error(request, f"Error al restaurar: {e}")
        
        return redirect('respaldos_list')

class DescargarRespaldoView(View):
    def get(self, request, id):
        # Usamos un nombre de variable distinto para no confundir
        obj_respaldo = get_object_or_404(respaldo, pk=id)
        
        if obj_respaldo.archivo:
            try:
                ruta_fisica = obj_respaldo.archivo.path
                if os.path.exists(ruta_fisica):
                    return FileResponse(
                        open(ruta_fisica, 'rb'), 
                        as_attachment=True,
                        filename=os.path.basename(ruta_fisica)
                    )
            except ValueError:
                # Esto pasa si el campo existe pero no tiene archivo físico asociado
                pass
                
        raise Http404("El archivo no existe en el servidor.")