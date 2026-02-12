from django.views.generic import TemplateView


# --- VISTAS DE SESIÓN / AUTENTICACIÓN ---
class MenuPrincipalView(TemplateView):
    template_name = 'login/login.html'





class CrearCuentaView(TemplateView):
    template_name = 'login/index_crear_cuenta.html'


class RecuperarContrasenaView(TemplateView):
    template_name = 'login/index_recuperar_contra.html'


class CambiarContrasenaView(TemplateView):
    template_name = 'login/index_cambiar_contraseña.html'
