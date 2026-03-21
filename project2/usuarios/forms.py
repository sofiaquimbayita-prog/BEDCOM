from django import forms
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import re

User = get_user_model()

class UserForm(forms.ModelForm):
    # --- VALIDADORES REUTILIZABLES ---
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

    # --- CAMPOS PERSONALIZADOS ---
    cedula = forms.CharField(
        validators=[numeric10_validator],
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ej: 1057...'}),
        label='Cédula'
    )
    
    telefono = forms.CharField(
        validators=[numeric10_validator],
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ej: 310...'}),
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

    # --- LÓGICA DE VALIDACIÓN (CLEAN) ---

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
        # CORRECCIÓN: Obtenemos el valor, validamos y RE-DEVOLVEMOS el valor
        first_name = self.cleaned_data.get('first_name')
        if first_name:
            self.name_validator(first_name)
        return first_name

    def clean_last_name(self):
        # CORRECCIÓN: Obtenemos el valor, validamos y RE-DEVOLVEMOS el valor
        last_name = self.cleaned_data.get('last_name')
        if last_name:
            self.name_validator(last_name)
        return last_name

    class Meta:
        model = User
        # Definimos el orden exacto de los campos
        fields = ['username', 'first_name', 'last_name', 'email', 'cedula', 'rol', 'telefono', 'password']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'correo@ejemplo.com'}),
        }
        labels = {
            'username': 'Nombre de Usuario',
            'first_name': 'Nombres',
            'last_name': 'Apellidos',
            'email': 'Correo Electrónico',
        }

class UserEditForm(UserForm):
    # En edición, la contraseña no es obligatoria
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