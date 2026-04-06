from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, LogoutView as DjangoLogoutView
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import logout as auth_logout
from django.http import HttpResponseRedirect
from django.views.generic.edit import CreateView
from django.contrib import messages
from usuarios.models import PerfilUsuario

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

class RegistroUsuarioView(CreateView):
    form_class = None  # Se asigna dinámicamente
    
    def get_form_class(self):
        from .forms import RegistroUsuarioForm
        return RegistroUsuarioForm
    
    template_name = 'crear_cuenta/registro_usuario.html'
    success_url = reverse_lazy('login:login')
    
    def form_valid(self, form):
        user = form.save(commit=False)
        user.set_password(form.cleaned_data["password1"])
        user.save()
        
        # Crear perfil por defecto
        PerfilUsuario.objects.get_or_create(
            user=user,
            defaults={'rol': 'administrador', 'cedula': form.cleaned_data['cedula'], 'telefono': form.cleaned_data['telefono']}
        )
        
        messages.success(self.request, 'Cuenta creada exitosamente. Por favor inicia sesión.')
        return super().form_valid(form)
