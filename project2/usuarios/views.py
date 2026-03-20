import logging
from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, View
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.http import JsonResponse
from .models import PerfilUsuario  
from .forms import UserForm, UserEditForm

# Obtenemos el modelo de la 'app' que definiste como AbstractUser
User = get_user_model()
logger = logging.getLogger(__name__)

# ==================================================
#  1. LISTAR USUARIOS
# ==================================================
class ListarUsuariosView(ListView):
    model = User
    template_name = 'usuarios/listar_final.html'
    context_object_name = 'usuarios'

    def get_queryset(self):
        # Traemos todos los usuarios (excepto superusers) 
        # y unimos el perfil para obtener el teléfono sin errores
        logger.debug(f"[{timezone.now()}] Query get_queryset ejecutada - excluyendo superusers (sin perfil JOIN por migration issue)")
        return User.objects.filter(is_superuser=False).order_by('-id')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user_form'] = UserForm()
        logger.info(f"[{timezone.now()}] Cargando {self.object_list.count()} usuarios - context keys: {list(context.keys())}")
        return context

# ==================================================
#  2. OBTENER DETALLE (AJAX para el Modal de Edición)
# ==================================================
def obtener_detalle_usuario(request, pk):
    usuario = get_object_or_404(User, pk=pk)
    
    data = {
        'username': usuario.username,
        'email': usuario.email,
        'first_name': usuario.first_name,
        'last_name': usuario.last_name,
        'cedula': usuario.cedula,
        'telefono': usuario.telefono or '',
        'rol': usuario.rol,
        'estado': usuario.estado,  
    }
    return JsonResponse(data)

# ==================================================
#  3. CREAR USUARIO
# ==================================================
class CrearUsuarioView(View):
    def post(self, request):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            user_form = UserForm(request.POST)

            if user_form.is_valid():
                # Guardamos el usuario (incluye teléfono)
                user = user_form.save(commit=False)
                user.set_password(user_form.cleaned_data['password'])
                user.is_active = True
                user.estado = 'Activo'
                user.save()
                
                return JsonResponse({'success': True, 'message': 'Usuario creado correctamente'})

            return JsonResponse({'success': False, 'errors': user_form.errors}, status=400)
        
        return redirect('usuarios:listar')

# ==================================================
#  4. EDITAR USUARIO
# ==================================================
class EditarUsuarioView(View):
    def post(self, request, pk):
        usuario = get_object_or_404(User, pk=pk)
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            user_form = UserEditForm(request.POST, instance=usuario)

            if user_form.is_valid():
                user = user_form.save(commit=False)
                nueva_pass = user_form.cleaned_data.get('password')
                if nueva_pass:
                    user.set_password(nueva_pass)
                user.save()
                return JsonResponse({'success': True, 'message': 'Usuario actualizado'})

            return JsonResponse({'success': False, 'errors': user_form.errors}, status=400)
        
        return redirect('usuarios:listar')

# ==================================================
#  5. CAMBIAR ESTADO (Activar/Desactivar)
# ==================================================
class CambiarEstadoUsuarioView(View):
    def post(self, request, pk):
        usuario = get_object_or_404(User, pk=pk)
        
        if usuario.is_active:
            usuario.is_active = False
            usuario.estado = 'Inactivo'
            msg = f"Usuario {usuario.username} desactivado."
        else:
            usuario.is_active = True
            usuario.estado = 'Activo'
            msg = f"Usuario {usuario.username} activado."
            
        usuario.save()
        messages.success(request, msg)
        return redirect('usuarios:listar')