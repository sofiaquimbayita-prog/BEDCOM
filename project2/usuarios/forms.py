from django import forms
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator, MinLengthValidator
import re
from .models import PerfilUsuario

# Esto obtiene automáticamente tu modelo 'usuario' de BedCom
User = get_user_model()

class UserForm(forms.ModelForm):
    # Nombres y apellidos: solo letras, espacios, acentos
    name_validator = RegexValidator(
        r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$',
        'Solo se permiten letras y espacios (acentos permitidos).',
        'invalid_name'
    )
    
    # Teléfono: 10 dígitos (compatible con validator existente)
    numeric10_validator = RegexValidator(
        r'^\\d{10}$',
        'Debe ser exactamente 10 dígitos numéricos.',
        'invalid_numeric'
    )

    telefono = forms.CharField(
        validators=[numeric10_validator],
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '310...'}),
        label='Teléfono'
    )
    
    password = forms.CharField(
        min_length=8,
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Mínimo 8 chars: 1 mayús, 1 número, 1 especial',
            'class': 'form-control',
            'id': 'id_password_add'
        }),
        label="Contraseña"
    )

    def clean_password(self):
        password = self.cleaned_data.get('password')
        if password:
            if not re.search(r'[A-Z]', password):
                raise ValidationError('Debe contener al menos una letra mayúscula.')
            if not re.search(r'\d', password):
                raise ValidationError('Debe contener al menos un número.')
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                raise ValidationError('Debe contener al menos un carácter especial (!@#$%^&*()).')
        return password

    def clean_first_name(self):
        return self.name_validator(self.cleaned_data['first_name'])

    def clean_last_name(self):
        return self.name_validator(self.cleaned_data['last_name'])

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'telefono', 'password']
        # cedula y rol vienen de PerfilForm
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control'}),
            'cedula': forms.TextInput(attrs={'class': 'form-control'}),
            'rol': forms.TextInput(attrs={'class': 'form-control'}), # O Select si prefieres
        }
        labels = {
            'username': 'Nombre de Usuario',
            'first_name': 'Nombres',
            'last_name': 'Apellidos',
            'email': 'Correo Electrónico',
            'telefono': 'Teléfono',
        }

class PerfilForm(forms.ModelForm):
    # Cédula y teléfono: exactamente 10 dígitos
    numeric10_validator = RegexValidator(
        r'^\d{10}$',
        'Debe ser exactamente 10 dígitos numéricos.',
        'invalid_numeric'
    )

    cedula = forms.CharField(
        validators=[numeric10_validator],
        widget=forms.TextInput(attrs={'class': 'form-control', 'id': 'id_cedula'}),
    )
    telefono = forms.CharField(
        validators=[numeric10_validator],
        widget=forms.TextInput(attrs={'class': 'form-control', 'id': 'id_telefono'}),
    )

    class Meta:
        model = PerfilUsuario
        fields = ['rol', 'cedula', 'telefono']
        widgets = {
            'rol': forms.Select(attrs={'class': 'form-control'}),
            'cedula': forms.TextInput(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control'}),
        }

class UserEditForm(UserForm):  # Hereda name_validator y password logic
    # Override password to optional
    password = forms.CharField(
        min_length=8,
        required=False,
        empty_value='',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Dejar vacío para no cambiar',
            'class': 'form-control',
            'id': 'id_password_edit'
        }),
        label="Nueva Contraseña (opcional)"
    )

    class Meta(UserForm.Meta):
        fields = ['username', 'first_name', 'last_name', 'email', 'telefono', 'password']

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