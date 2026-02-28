from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages

class LoginFormView(LoginView):
    template_name = 'login.html'
    redirect_authenticated_user = True
    success_url = reverse_lazy('menu')

class LogoutView(LogoutView):
    next_page = reverse_lazy('login:login')
    
    def dispatch(self, request, *args, **kwargs):
        # Add confirmation message before logging out
        messages.success(request, 'Sesión cerrada correctamente. ¡Hasta luego!')
        return super().dispatch(request, *args, **kwargs)
