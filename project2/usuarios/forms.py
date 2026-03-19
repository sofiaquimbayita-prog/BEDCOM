from django import forms
from django.contrib.auth import get_user_model
from .models import PerfilUsuario

# Esto obtiene automáticamente tu modelo 'usuario' de BedCom
User = get_user_model()

class UserForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Ingrese contraseña',
            'class': 'form-control'
        }),
        label="Contraseña"
    )

    class Meta:
        model = User
        # He incluido 'cedula' y 'rol' porque ya existen en tu modelo 'usuario'
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'cedula', 'rol']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'cedula': forms.TextInput(attrs={'class': 'form-control'}),
            'rol': forms.TextInput(attrs={'class': 'form-control'}), # O Select si prefieres
        }
        labels = {
            'username': 'Nombre de Usuario',
            'first_name': 'Nombres',
            'last_name': 'Apellidos',
            'email': 'Correo Electrónico',
        }

class PerfilForm(forms.ModelForm):
    class Meta:
        model = PerfilUsuario
        # Aquí pedimos los datos adicionales que el instructor definió en el perfil
        fields = ['rol', 'cedula', 'telefono']
        widgets = {
            'rol': forms.Select(attrs={'class': 'form-control'}),
            'cedula': forms.TextInput(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control'}),
        }

class UserEditForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Dejar en blanco para mantener la actual',
            'class': 'form-control'
        }),
        label="Nueva Contraseña",
        required=False 
    )

    class Meta:
        model = User
        # Campos que permites editar de tu modelo 'usuario'
        fields = ['username', 'first_name', 'last_name', 'email', 'cedula', 'rol']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'cedula': forms.TextInput(attrs={'class': 'form-control'}),
            'rol': forms.TextInput(attrs={'class': 'form-control'}),
        }
        labels = {
            'username': 'Nombre de Usuario',
            'first_name': 'Nombres',
            'last_name': 'Apellidos',
            'email': 'Correo Electrónico',
        }