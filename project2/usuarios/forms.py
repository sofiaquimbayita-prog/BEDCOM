from django import forms
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator, MinLengthValidator
import re
from django.contrib.auth import get_user_model
User = get_user_model()

class UserForm(forms.ModelForm):
    name_validator = RegexValidator(
        r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$',
        'Solo se permiten letras y espacios (acentos permitidos).',
        'invalid_name'
    )
    
    numeric10_validator = RegexValidator(
        r'^\d{10}$',
        'Debe ser exactamente 10 dígitos numéricos.',
        'invalid_numeric'
    )

    cedula = forms.CharField(
        validators=[numeric10_validator],
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
        label='Cédula'
    )
    
    telefono = forms.CharField(
        validators=[numeric10_validator],
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '310...'}),
        label='Teléfono'
    )

    rol = forms.ChoiceField(
        choices=[
            ('', 'Seleccione un rol...'),
            ('administrador', 'Administrador'),
            ('empleado', 'Empleado'),
            ('vendedor', 'Vendedor'),
        ],
        required=True,
        widget=forms.Select(attrs={'class': 'form-control'}),
        label='Rol del Sistema'
    )
    
    password = forms.CharField(
        min_length=8,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': '••••••••'
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
                raise ValidationError('Debe contener al menos un carácter especial.')
        return password

    def clean_first_name(self):
        return self.name_validator(self.cleaned_data['first_name'])

    def clean_last_name(self):
        return self.name_validator(self.cleaned_data['last_name'])

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'cedula', 'rol', 'telefono', 'password']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
        }
        labels = {
            'username': 'Nombre de Usuario',
            'first_name': 'Nombres',
            'last_name': 'Apellidos',
            'email': 'Correo Electrónico',
            'cedula': 'Cédula',
            'rol': 'Rol del Sistema',
            'telefono': 'Teléfono',
        }

class UserEditForm(UserForm):
    password = forms.CharField(
        min_length=8,
        required=False,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Dejar vacío para no cambiar'
        }),
        label="Nueva Contraseña (opcional)"
    )

    class Meta(UserForm.Meta):
        fields = UserForm.Meta.fields
