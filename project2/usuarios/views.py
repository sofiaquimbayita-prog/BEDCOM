import logging
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, View
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.http import JsonResponse
from .models import PerfilUsuario  # Seguimos usándolo para la cédula/teléfono
from .forms import UserForm, PerfilForm, UserEditForm

User = get_user_model()
logger = logging.getLogger(__name__)

# ==================================================
#  1. LISTAR USUARIOS (Envía todo a DataTables)
# ==================================================
class ListarUsuariosView(ListView):
    model = User
    template_name = 'usuarios/listar.html'
    context_object_name = 'usuarios'

    def get_queryset(self):
        # IMPORTANTE: Quitamos el filtro de is_active de Django.
        # Enviamos todos los usuarios para que el Switch de JS funcione 
        # sin tener que recargar la página desde el servidor.
        return User.objects.filter(is_superuser=False).select_related('perfil')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user_form'] = UserForm()
        context['perfil_form'] = PerfilForm()
        return context

# ==================================================
#  2. OBTENER DETALLE (Para el Modal de Edición)
# ==================================================
def obtener_detalle_usuario(request, pk):
    usuario = get_object_or_404(User, pk=pk)
    perfil = getattr(usuario, 'perfil', None)
    
    data = {
        'username': usuario.username,
        'email': usuario.email,
        'first_name': usuario.first_name,
        'last_name': usuario.last_name,
        'cedula': perfil.cedula if perfil else '',
        'telefono': perfil.telefono if perfil else '',
        'rol': perfil.rol if perfil else 'empleado',
        'estado': usuario.estado,  # Directo desde User
    }
    return JsonResponse(data)

# ==================================================
#  3. CREAR USUARIO
# ==================================================
class CrearUsuarioView(View):
    def post(self, request):
        # Check if AJAX
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            user_form = UserForm(request.POST)
            perfil_form = PerfilForm(request.POST)

            if user_form.is_valid() and perfil_form.is_valid():
                user = user_form.save(commit=False)
                user.set_password(user_form.cleaned_data['password'])
                user.is_active = True
                user.estado = 'Activo'
                user.save()

                perfil = perfil_form.save(commit=False)
                perfil.user = user
                perfil.save()
                return JsonResponse({'success': True, 'message': 'Usuario creado correctamente'})

            # Form errors
            errors = []
            if user_form.errors:
                errors.extend([str(e) for e in user_form.non_field_errors()])
            if perfil_form.errors:
                errors.extend([str(e) for e in perfil_form.non_field_errors()])
            return JsonResponse({'success': False, 'message': 'Errores en formulario: ' + '; '.join(errors) or 'Datos inválidos'}, status=400)
        
        # Fallback non-AJAX
        user_form = UserForm(request.POST)
        perfil_form = PerfilForm(request.POST)
        if user_form.is_valid() and perfil_form.is_valid():
            # ... same save logic ...
            messages.success(request, f'Usuario creado.')
            return redirect('usuarios:listar')
        
        usuarios = User.objects.filter(is_superuser=False).select_related('perfil')
        return render(request, 'usuarios/listar.html', {
            'usuarios': usuarios,
            'user_form': user_form,
            'perfil_form': perfil_form
        })

# ==================================================
#  4. EDITAR USUARIO
# ==================================================
class EditarUsuarioView(View):
    def post(self, request, pk):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            usuario = get_object_or_404(User, pk=pk)    
            perfil = get_object_or_404(PerfilUsuario, user=usuario)
            
            user_form = UserEditForm(request.POST, instance=usuario)
            perfil_form = PerfilForm(request.POST, instance=perfil)

            if user_form.is_valid() and perfil_form.is_valid():
                user = user_form.save(commit=False)
                nueva_pass = user_form.cleaned_data.get('password')
                if nueva_pass:
                    user.set_password(nueva_pass)
                user.save()
                perfil_form.save()
                return JsonResponse({'success': True, 'message': 'Usuario actualizado correctamente'})

            # Errors
            errors = []
            if user_form.errors:
                errors.extend([str(e) for e in user_form.non_field_errors()])
            if perfil_form.errors:
                errors.extend([str(e) for e in perfil_form.non_field_errors()])
            return JsonResponse({'success': False, 'message': 'Errores: ' + '; '.join(errors) or 'Datos inválidos'}, status=400)

        # Fallback non-AJAX
        usuario = get_object_or_404(User, pk=pk)
        perfil = get_object_or_404(PerfilUsuario, user=usuario)
        user_form = UserEditForm(request.POST, instance=usuario)
        perfil_form = PerfilForm(request.POST, instance=perfil)
        if user_form.is_valid() and perfil_form.is_valid():
            user = user_form.save(commit=False)
            nueva_pass = user_form.cleaned_data.get('password')
            if nueva_pass:
                user.set_password(nueva_pass)
            user.save()
            perfil_form.save()
            messages.success(request, 'Usuario actualizado.')
            return redirect('usuarios:listar')

        messages.error(request, 'Error al actualizar.')
        return redirect('usuarios:listar')

# ==================================================
#  5. CAMBIAR ESTADO (La clave del Switch)
# ==================================================
class CambiarEstadoUsuarioView(View):
    def post(self, request, pk):
        usuario = get_object_or_404(User, pk=pk)
        
        # Toggle: Si está activo lo apaga, si está apagado lo activa
        if usuario.is_active:
            usuario.is_active = False
            usuario.estado = 'Inactivo'
            accion = "desactivado"
        else:
            usuario.is_active = True
            usuario.estado = 'Activo'
            accion = "activado"
            
        usuario.save()
        
        logger.info(f'✅ [BEDCOM] Usuario {usuario.username} ahora está {usuario.estado}')
        messages.success(request, f'Usuario {usuario.username} {accion} correctamente.')
        return redirect('usuarios:listar')