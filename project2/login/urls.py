from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from . import views  # Importa tus clases LoginFormView y CustomLogoutView

app_name = 'login'

urlpatterns = [
# --- VISTAS DE LOGIN Y LOGOUT ---
# Usamos .as_view() porque tus vistas son Clases (LoginFormView)
path('login/', views.LoginFormView.as_view(), name='login'),
path('logout/', views.CustomLogoutView.as_view(), name='logout'),
path('crear-cuenta/', views.RegistroUsuarioView.as_view(), name='registro_usuario'),

# --- RUTAS DE RECUPERACIÓN  ---
path('recuperar-contrasena/', auth_views.PasswordResetView.as_view(
    template_name="registration/recuperar_contrasena_form.html",
    success_url=reverse_lazy('login:password_reset_done'),
    email_template_name="registration/password_reset_email.txt",
    html_email_template_name="registration/password_reset_email.html",
    subject_template_name="registration/password_reset_subject.txt"
), name="password_reset"),

path('email-enviado/',auth_views.PasswordResetDoneView.as_view(template_name="registration/email_enviado.html"), name="password_reset_done"),

path('cambiar-contrasena/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name="registration/cambiar_contrasena.html", success_url=reverse_lazy('login:password_reset_complete'), form_class=views.CambiarContrasenaForm), name="password_reset_confirm"),


path('contrasena-actualizada/', auth_views.PasswordResetCompleteView.as_view(template_name="registration/contrasena_actualizada.html"), name="password_reset_complete"),
]

