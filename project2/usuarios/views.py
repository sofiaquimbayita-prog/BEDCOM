import logging
from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, View
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.http import JsonResponse
from django.db import IntegrityError
from .models import PerfilUsuario  
from .forms import UserForm, UserEditForm

# Obtenemos el modelo de usuario (Custom User o AbstractUser)
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
        # Excluimos superusuarios de la lista de gestión para BedCom
        return User.objects.filter(is_superuser=False).order_by('-id')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user_form'] = UserForm()
        return context

# ==================================================
#  2. OBTENER DETALLE (AJAX para Modal Editar)
# ==================================================
def obtener_detalle_usuario(request, pk):
    usuario = get_object_or_404(User, pk=pk)
    data = {
        'username': usuario.username,
        'email': usuario.email or '',
        'first_name': usuario.first_name or '',
        'last_name': usuario.last_name or '',
        'cedula': usuario.cedula,
        'telefono': usuario.telefono or '',
        'rol': usuario.rol,
        'estado': usuario.estado,  
    }
    return JsonResponse(data)

# ==================================================
#  3. CREAR USUARIO (COMPATIBLE CON MYSQL)
# ==================================================
class CrearUsuarioView(View):
    def post(self, request):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            form = UserForm(request.POST)
            
            if form.is_valid():
                # Limpieza de datos
                cedula = form.cleaned_data.get('cedula')
                email = form.cleaned_data.get('email')
                telefono = form.cleaned_data.get('telefono')
                username = form.cleaned_data.get('username')

                errores_unicidad = {}

                # Validaciones de unicidad manuales para evitar excepciones de base de datos
                if User.objects.filter(username=username).exists():
                    errores_unicidad['username'] = ['Este nombre de usuario ya está en uso.']

                if telefono and User.objects.filter(telefono=telefono).exists():
                    errores_unicidad['telefono'] = ['Este teléfono ya está registrado.']

                if User.objects.filter(cedula=cedula).exists():
                    errores_unicidad['cedula'] = ['Esta cédula ya existe en el sistema.']

                if email and User.objects.filter(email=email).exists():
                    errores_unicidad['email'] = ['Este correo ya está en uso.']

                if errores_unicidad:
                    return JsonResponse({'success': False, 'errors': errores_unicidad}, status=400)

                try:
                    user = form.save(commit=False)
                    
                    # Forzar strings vacíos en lugar de NULL para MySQL si el campo está vacío
                    user.first_name = form.cleaned_data.get('first_name') or ""
                    user.last_name = form.cleaned_data.get('last_name') or ""
                    user.email = email or ""
                    user.telefono = telefono or ""
                    
                    # Encriptación de contraseña
                    password = form.cleaned_data.get('password')
                    if password:
                        user.set_password(password)
                    
                    user.is_active = True
                    user.estado = 'Activo'
                    user.save()
                    
                    return JsonResponse({'success': True, 'message': 'Usuario creado exitosamente en MySQL.'})
                
                except IntegrityError as e:
                    logger.error(f"Error de Integridad MySQL: {str(e)}")
                    return JsonResponse({'success': False, 'message': 'Error de duplicidad en la base de datos.'}, status=400)
                except Exception as e:
                    logger.error(f"Error General: {str(e)}")
                    return JsonResponse({'success': False, 'message': 'Error interno del servidor.'}, status=500)

            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
        
        return redirect('usuarios:listar')

# ==================================================
#  4. EDITAR USUARIO (CON VALIDACIÓN EXCLUYENTE)
# ==================================================
class EditarUsuarioView(View):
    def post(self, request, pk):
        usuario = get_object_or_404(User, pk=pk)
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            form = UserEditForm(request.POST, instance=usuario)

            if form.is_valid():
                telefono = form.cleaned_data.get('telefono')
                
                # Validar que el nuevo teléfono no lo tenga OTRO usuario
                if telefono and User.objects.filter(telefono=telefono).exclude(pk=pk).exists():
                    return JsonResponse({
                        'success': False, 
                        'errors': {'telefono': ['Este teléfono ya pertenece a otra persona.']}
                    }, status=400)

                try:
                    user = form.save(commit=False)
                    
                    # Actualizar contraseña solo si se ingresó
                    nueva_pass = form.cleaned_data.get('password')
                    if nueva_pass:
                        user.set_password(nueva_pass)
                    
                    user.save()
                    return JsonResponse({'success': True, 'message': 'Información actualizada correctamente.'})
                except Exception as e:
                    return JsonResponse({'success': False, 'message': str(e)}, status=500)

            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
        
        return redirect('usuarios:listar')

# ==================================================
#  5. CAMBIAR ESTADO (ACTIVAR/DESACTIVAR)
# ==================================================
class CambiarEstadoUsuarioView(View):
    def post(self, request, pk):
        usuario = get_object_or_404(User, pk=pk)
        
        # Invertir estado
        usuario.is_active = not usuario.is_active
        usuario.estado = 'Activo' if usuario.is_active else 'Inactivo'
        usuario.save()
        
        # Respuesta compatible con AJAX y tradicional
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            accion = "activado" if usuario.is_active else "desactivado"
            return JsonResponse({
                'success': True, 
                'message': f"Usuario {usuario.username} {accion} con éxito."
            })

        messages.success(request, f"El estado de {usuario.username} ha sido actualizado.")
        return redirect('usuarios:listar')