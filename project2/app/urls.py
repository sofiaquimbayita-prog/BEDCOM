from django.urls import path
from django.contrib.auth import views as auth_views
from django.urls import reverse_lazy
from .views import productos, menu, reportes

urlpatterns = [
    # --- AUTENTICACIÓN Y LOGIN (usar vistas de Django auth) ---
    path('login/', auth_views.LoginView.as_view(template_name='login/login.html', redirect_authenticated_user=True), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page=reverse_lazy('login')), name='logout'),
    # path('crear-cuenta/', views.CrearCuentaView.as_view(), name='crear_cuenta'),

    # Recuperar contraseña (Password Reset)
    path('recuperar-contrasena/', auth_views.PasswordResetView.as_view(
        template_name='login/index_recuperar_contra.html',
        email_template_name='login/password_reset_email.html',
        success_url=reverse_lazy('password_reset_done')
    ), name='password_reset'),
    path('recuperar-contrasena/done/', auth_views.PasswordResetDoneView.as_view(
        template_name='login/password_reset_done.html'
    ), name='password_reset_done'),
    path('recuperar-contrasena/confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='login/index_cambiar_contraseña.html',
        success_url=reverse_lazy('password_reset_complete')
    ), name='password_reset_confirm'),
    path('recuperar-contrasena/complete/', auth_views.PasswordResetCompleteView.as_view(
        template_name='login/password_reset_complete.html'
    ), name='password_reset_complete'),

    # --- MENÚ / DASHBOARD ---
    path('menu/', menu.MenuView.as_view(), name='menu'),

    # --- PRODUCTOS ---
    path('productos/', productos.ProductoListView.as_view(), name='productos'),
    path('productos/crear/', productos.ProductoCreateView.as_view(), name='crear_producto'),
    path('productos/editar/<int:pk>/', productos.ProductoUpdateView.as_view(), name='editar_producto'),
    path('productos/eliminar/<int:pk>/', productos.ProductoDeleteView.as_view(), name='eliminar_producto'),
    path('productos/activar/<int:pk>/', productos.ProductoActivateView.as_view(), name='activar_producto'),
    # --- REPORTES ---
    path('reportes/', reportes.reporte_ventas, name='reportes')
    
]