import logging
from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, View
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.http import JsonResponse
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
        # Excluimos superusuarios de la lista de gestión
        return User.objects.filter(is_superuser=False).order_by('-id')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user_form'] = UserForm()
        return context

# ==================================================
#  2. OBTENER DETALLE (AJAX)
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
#  3. CREAR USUARIO (CON VALIDACIÓN DE UNICIDAD)
# ==================================================
class CrearUsuarioView(View):
    def post(self, request):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            form = UserForm(request.POST)
            
            if form.is_valid():
                # Extraemos datos limpios del formulario
                cedula = form.cleaned_data.get('cedula')
                email = form.cleaned_data.get('email')
                telefono = form.cleaned_data.get('telefono')

                errores_unicidad = {}

                # --- VALIDACIÓN DE TELÉFONO ÚNICO ---
                if telefono and User.objects.filter(telefono=telefono).exists():
                    errores_unicidad['telefono'] = ['Este número de teléfono ya está registrado por otro usuario.']

                # --- VALIDACIÓN DE CÉDULA ÚNICA ---
                if User.objects.filter(cedula=cedula).exists():
                    errores_unicidad['cedula'] = ['Esta cédula ya existe en el sistema.']

                # --- VALIDACIÓN DE EMAIL ÚNICO ---
                if email and User.objects.filter(email=email).exists():
                    errores_unicidad['email'] = ['Este correo electrónico ya está en uso.']

                # Si hay errores de duplicados, los enviamos de vuelta al modal
                if errores_unicidad:
                    return JsonResponse({'success': False, 'errors': errores_unicidad}, status=400)

                try:
                    user = form.save(commit=False)
                    
                    # Prevenimos el error 'NOT NULL constraint failed' en SQLite
                    user.first_name = form.cleaned_data.get('first_name') or ""
                    user.last_name = form.cleaned_data.get('last_name') or ""
                    user.email = email or ""
                    user.telefono = telefono or ""
                    
                    # Encriptación de contraseña obligatoria al crear
                    password = form.cleaned_data.get('password')
                    if password:
                        user.set_password(password)
                    
                    user.is_active = True
                    user.estado = 'Activo'
                    user.save()
                    
                    return JsonResponse({'success': True, 'message': 'Usuario creado con éxito'})
                
                except Exception as e:
                    logger.error(f"Error al guardar en DB: {str(e)}")
                    return JsonResponse({'success': False, 'errors': {'db': [str(e)]}}, status=500)

            # Si el formulario falla por otros motivos (ej: rol inválido)
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
                
                # Validar que el nuevo teléfono no lo tenga OTRO usuario (excluyendo al actual)
                if telefono and User.objects.filter(telefono=telefono).exclude(pk=pk).exists():
                    return JsonResponse({
                        'success': False, 
                        'errors': {'telefono': ['Este teléfono ya pertenece a otra persona.']}
                    }, status=400)

                user = form.save(commit=False)
                
                # Actualizar contraseña solo si se ingresó una nueva
                nueva_pass = form.cleaned_data.get('password')
                if nueva_pass:
                    user.set_password(nueva_pass)
                
                user.save()
                return JsonResponse({'success': True, 'message': 'Información actualizada'})

            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
        
        return redirect('usuarios:listar')

# ==================================================
#  5. CAMBIAR ESTADO (ACTIVAR/DESACTIVAR)
# ==================================================
class CambiarEstadoUsuarioView(View):
    def post(self, request, pk):
        usuario = get_object_or_404(User, pk=pk)
        
        if usuario.is_active:
            usuario.is_active = False
            usuario.estado = 'Inactivo'
        else:
            usuario.is_active = True
            usuario.estado = 'Activo'
            
        usuario.save()
        messages.success(request, f"El estado de {usuario.username} ha sido actualizado.")
        return redirect('usuarios:listar')