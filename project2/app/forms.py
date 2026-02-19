from django import forms
from django.core.exceptions import ValidationError
import re
from .models import proveedor

class ProveedorForm(forms.ModelForm):
    class Meta:
        model = proveedor
        fields = ['nombre', 'telefono', 'direccion', 'imagen']
        widgets = {
            'nombre': forms.TextInput(attrs={
                'maxlength': 100,
                'placeholder': 'Ej: BedCom S.A.',
                'class': 'form-control'
            }),
            'telefono': forms.TextInput(attrs={
                'maxlength': 10,
                'placeholder': 'Ej: 3001234567',
                'class': 'form-control'
            }),
            'direccion': forms.Textarea(attrs={
                'rows': 3,
                'maxlength': 200,
                'placeholder': 'Dirección completa del proveedor',
                'class': 'form-control'
            }),
            'imagen': forms.FileInput(attrs={
                'accept': 'image/*',
                'class': 'form-control'
            }),
        }

    def clean_telefono(self):
        tel = self.cleaned_data.get('telefono', '')
        if not tel:
            raise forms.ValidationError('El teléfono es requerido')
        
        # Eliminar espacios en blanco
        tel = tel.strip()
        
        # Validar que solo contenga dígitos
        if not tel.isdigit():
            raise forms.ValidationError('El teléfono solo debe contener números (0-9)')
        
        # Validar que tenga exactamente 10 dígitos (formato colombiano)
        if len(tel) != 10:
            raise forms.ValidationError('El teléfono debe tener exactamente 10 dígitos (formato: 3001234567)')
        
        return tel

    def clean_nombre(self):
        nombre = self.cleaned_data.get('nombre', '').strip()
        if not nombre:
            raise forms.ValidationError('El nombre del proveedor es requerido')
        
        # Validar longitud mínima
        if len(nombre) < 3:
            raise forms.ValidationError('El nombre debe tener al menos 3 caracteres')
        
        # Validar longitud máxima
        if len(nombre) > 100:
            raise forms.ValidationError('El nombre no puede exceder 100 caracteres')
        
        # Validar que solo contenga letras, números y espacios
        if not re.match(r'^[a-zA-Z0-9\s]+$', nombre):
            raise forms.ValidationError('El nombre solo puede contener letras, números y espacios (sin caracteres especiales)')
        
        # Verificar duplicados (excluyendo el registro actual en caso de edición)
        if proveedor.objects.filter(nombre__iexact=nombre).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError('Ya existe un proveedor con ese nombre')
        
        return nombre

    def clean_direccion(self):
        direccion = self.cleaned_data.get('direccion', '').strip()
        if not direccion:
            raise forms.ValidationError('La dirección es requerida')
        
        # Validar longitud mínima
        if len(direccion) < 10:
            raise forms.ValidationError('La dirección debe tener al menos 10 caracteres')
        
        # Validar longitud máxima
        if len(direccion) > 200:
            raise forms.ValidationError('La dirección no puede exceder 200 caracteres')
        
        return direccion

    def clean_imagen(self):
        imagen = self.cleaned_data.get('imagen')
        if imagen:
            # Validar tamaño máximo (2MB)
            if imagen.size > 2 * 1024 * 1024:
                raise forms.ValidationError('La imagen no puede exceder 2MB')
            
            # Validar tipos de archivo permitidos
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if imagen.content_type not in allowed_types:
                raise forms.ValidationError('Tipo de imagen no permitido. Use: JPG, PNG, GIF o WebP')
        
        return imagen
