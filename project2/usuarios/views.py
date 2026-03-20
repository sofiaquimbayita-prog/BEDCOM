import logging
from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, View
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.http import JsonResponse
from .models import PerfilUsuario  
from .forms import UserForm, UserEditForm

# Obtenemos el modelo de usuario personalizado
User = get_object_or_404(get_user_model()) if False else get_user_model()
logger = logging.getLogger(__name__)

# ==================================================
#  1. LISTAR USUARIOS
# ==================================================
class ListarUsuariosView(ListView):
    model = User
    template_name = 'usuarios/listar_final.html'
    context_object_name = 'usuarios'

    def get_queryset(self):
        # Excluimos superusuarios para la gestión administrativa común
        return User.objects.filter(is_superuser=False).order_by('-id')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user_form'] = UserForm()
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
#  3. CREAR USUARIO (ELIMINA EL INTEGRITY ERROR)
# ==================================================
class CrearUsuarioView(View):
    def post(self, request):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            form = UserForm(request.POST)
            
            if form.is_valid():
                try:
                    # 1. Creamos el objeto pero no lo guardamos en DB todavía
                    user = form.save(commit=False)
                    
                    # 2. SEGURO ANTI-NULOS: Forzamos strings vacíos si vienen None
                    # Esto evita el "IntegrityError: NOT NULL constraint failed"
                    user.first_name = form.cleaned_data.get('first_name') or ""
                    user.last_name = form.cleaned_data.get('last_name') or ""
                    user.email = form.cleaned_data.get('email') or ""
                    user.telefono = form.cleaned_data.get('telefono') or ""
                    
                    # 3. Encriptar contraseña
                    password = form.cleaned_data.get('password')
                    if password:
                        user.set_password(password)
                    
                    # 4. Campos de estado por defecto
                    user.is_active = True
                    user.estado = 'Activo'
                    
                    # 5. Guardado final
                    user.save()
                    
                    logger.info(f"Usuario creado con éxito: {user.username}")
                    return JsonResponse({'success': True, 'message': 'Usuario creado correctamente'})
                
                except Exception as e:
                    logger.error(f"Error inesperado al guardar: {str(e)}")
                    return JsonResponse({'success': False, 'errors': {'database': [str(e)]}}, status=500)

            # Si el formulario no es válido (ej. Rol no válido)
            logger.warning(f"Errores de validación: {form.errors}")
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
        
        return redirect('usuarios:listar')

# ==================================================
#  4. EDITAR USUARIO
# ==================================================
class EditarUsuarioView(View):
    def post(self, request, pk):
        usuario = get_object_or_404(User, pk=pk)
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            form = UserEditForm(request.POST, instance=usuario)

            if form.is_valid():
                user = form.save(commit=False)
                
                # Solo actualizamos contraseña si se escribió algo nuevo
                nueva_pass = form.cleaned_data.get('password')
                if nueva_pass:
                    user.set_password(nueva_pass)
                
                user.save()
                return JsonResponse({'success': True, 'message': 'Usuario actualizado correctamente'})

            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
        
        return redirect('usuarios:listar')

# ==================================================
#  5. CAMBIAR ESTADO
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