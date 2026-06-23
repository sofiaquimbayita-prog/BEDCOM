from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, LogoutView as DjangoLogoutView
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import logout as auth_logout
from django.http import HttpResponseRedirect
from django.views.generic.edit import CreateView
from django.contrib import messages
from django.contrib.auth.forms import SetPasswordForm
import re
from django.core.exceptions import ValidationError


class LoginFormView(LoginView):
    template_name = 'login.html'
    redirect_authenticated_user = True
    success_url = reverse_lazy('menu')

class CustomLogoutView(DjangoLogoutView):
    next_page = reverse_lazy('login:login')
    
    def dispatch(self, request, *args, **kwargs):
        # Handle GET requests by calling logout directly
        if request.method == 'GET':
            auth_logout(request)
            # Use the next_page attribute (resolve it if it's a lazy string)
            next_page = self.next_page
            if callable(next_page):
                next_page = next_page()
            return HttpResponseRedirect(next_page)
        
        return super(DjangoLogoutView, self).dispatch(request, *args, **kwargs)


class CambiarContrasenaForm(SetPasswordForm):
    """Usa las mismas reglas de password que RegistroUsuarioForm."""

    def clean_new_password1(self):
        password1 = self.cleaned_data.get('new_password1')
        if not password1:
            return password1

        # Mínimo 8
        if len(password1) < 8:
            raise ValidationError('La contraseña debe tener al menos 8 caracteres.')

        # Mayúscula
        if not re.search(r'[A-Z]', password1):
            raise ValidationError('Debe contener al menos una letra mayúscula.')

        # Número
        if not re.search(r'\d', password1):
            raise ValidationError('Debe contener al menos un número.')

        # Especial
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password1):
            raise ValidationError('Debe contener al menos un carácter especial.')

        return password1

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('new_password1')
        password2 = cleaned_data.get('new_password2')

        if password1 and password2 and password1 != password2:
            raise ValidationError("Las contraseñas no coinciden.")

        return cleaned_data


class RegistroUsuarioView(CreateView):
    form_class = None  # Se asigna dinámicamente
    
    def get_form_class(self):
        from .forms import RegistroUsuarioForm
        return RegistroUsuarioForm
    
    template_name = 'crear_cuenta/registro_usuario.html'
    success_url = reverse_lazy('login:login')
    
    def form_valid(self, form):
        user = form.save(commit=False)
        user.rol = 'administrador'
        user.estado = 'Activo'
        user.set_password(form.cleaned_data["password1"])
        user.save()
        messages.success(self.request, 'Cuenta creada exitosamente. Por favor inicia sesión.')
        return super().form_valid(form)

    def form_invalid(self, form):
        error_messages = []
        # Non-field errors
        for msg in form.non_field_errors():
            error_messages.append(msg)
        # Field errors
        for field, errors in form.errors.items():
            for error in errors:
                error_messages.append(f"{form.fields[field].label}: {error}")
        
        if error_messages:
            full_error = 'Errores de validación: ' + '; '.join(error_messages[:3])
            if len(error_messages) > 3:
                full_error += f' y {len(error_messages)-3} más. Corrige los campos marcados.'
            messages.error(self.request, full_error)
        return super().form_invalid(form)

