from django import forms
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.contrib.auth import get_user_model
import re

User = get_user_model()

class RegistroUsuarioForm(forms.ModelForm):
    # Validadores
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

    password1 = forms.CharField(
        label='Contraseña',
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        help_text='Mínimo 8 caracteres, mayúscula, número y especial.'
    )
    
    password2 = forms.CharField(
        label='Confirma contraseña',
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        help_text='Repite la contraseña.'
    )

    first_name = forms.CharField(
        validators=[name_validator],
        required=True,
        label='Nombres'
    )
    
    last_name = forms.CharField(
        validators=[name_validator],
        required=True,
        label='Apellidos'
    )
    
    cedula = forms.CharField(
        validators=[numeric10_validator],
        required=True,
        label='Cédula'
    )
    
    telefono = forms.CharField(
        validators=[numeric10_validator],
        required=True,
        label='Teléfono'
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'cedula', 'telefono', 'foto_perfil', 'password1', 'password2']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
        }
        labels = {
            'username': 'Nombre de Usuario',
            'email': 'Correo Electrónico',
        }

    def clean_cedula(self):
        cedula = self.cleaned_data.get('cedula')
        print(f"DEBUG cedula: '{cedula}' exists: {User.objects.filter(cedula=cedula).exists()}")
        if User.objects.filter(cedula=cedula).exists():
            raise ValidationError('Esta cédula ya está registrada.')
        return cedula

    def clean_telefono(self):
        telefono = self.cleaned_data.get('telefono')
        print(f"DEBUG telefono: '{telefono}' exists: {User.objects.filter(telefono=telefono).exists()}")
        if User.objects.filter(telefono=telefono).exists():
            raise ValidationError('Este teléfono ya está registrado.')
        return telefono

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError('Este email ya está registrado.')
        return email

    def clean_password1(self):
        password1 = self.cleaned_data.get('password1')
        print(f"DEBUG password1: '{password1}' len: {len(password1) if password1 else 0}")
        if password1:
            if len(password1) < 8:
                print("ERROR: len < 8")
                raise ValidationError('La contraseña debe tener al menos 8 caracteres.')
            if not re.search(r'[A-Z]', password1):
                print("ERROR: no upper")
                raise ValidationError('Debe contener al menos una letra mayúscula.')
            if not re.search(r'\d', password1):
                print("ERROR: no digit")
                raise ValidationError('Debe contener al menos un número.')
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password1):
                print("ERROR: no special")
                raise ValidationError('Debe contener al menos un carácter especial.')
        print("DEBUG password1 OK")
        return password1

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise ValidationError("Las contraseñas no coinciden.")
        return password2

