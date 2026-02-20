from django import forms
from django.core.exceptions import ValidationError
import re
from .models import proveedor, respaldo

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
        
        if len(tel) != 10:
            raise forms.ValidationError('El teléfono debe tener exactamente 10 dígitos (formato: 3001234567)')
        
        return tel

    def clean_nombre(self):
        nombre = self.cleaned_data.get('nombre', '').strip()
        if not nombre:
            raise forms.ValidationError('El nombre del proveedor es requerido')
        
        if len(nombre) < 3:
            raise forms.ValidationError('El nombre debe tener al menos 3 caracteres')
        
        if len(nombre) > 100:
            raise forms.ValidationError('El nombre no puede exceder 100 caracteres')
        
        if not re.match(r'^[a-zA-Z0-9\s]+$', nombre):
            raise forms.ValidationError('El nombre solo puede contener letras, números y espacios (sin caracteres especiales)')
        
        if proveedor.objects.filter(nombre__iexact=nombre).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError('Ya existe un proveedor con ese nombre')
        
        return nombre

    def clean_direccion(self):
        direccion = self.cleaned_data.get('direccion', '').strip()
        if not direccion:
            raise forms.ValidationError('La dirección es requerida')
        
        if len(direccion) < 10:
            raise forms.ValidationError('La dirección debe tener al menos 10 caracteres')
        
        if len(direccion) > 200:
            raise forms.ValidationError('La dirección no puede exceder 200 caracteres')
        
        return direccion

    def clean_imagen(self):
        imagen = self.cleaned_data.get('imagen')
        if imagen:
            if imagen.size > 2 * 1024 * 1024:
                raise forms.ValidationError('La imagen no puede exceder 2MB')
            
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if imagen.content_type not in allowed_types:
                raise forms.ValidationError('Tipo de imagen no permitido. Use: JPG, PNG, GIF o WebP')
        
        return imagen


class RespaldoForm(forms.ModelForm):
    class Meta:
        model = respaldo
        fields = ['tipo_respaldo', 'descripcion']
        widgets = {
            'tipo_respaldo': forms.Select(attrs={
                'class': 'form-control',
                'style': 'width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px;'
            }),
            'descripcion': forms.Textarea(attrs={
                'rows': 3,
                'maxlength': 200,
                'placeholder': 'Notas sobre este respaldo...',
                'class': 'form-control',
                'style': 'width: 100%; background: #1e293b; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; resize: none;'
            }),
        }

    def clean_tipo_respaldo(self):
        tipo = self.cleaned_data.get('tipo_respaldo')
        if not tipo:
            raise forms.ValidationError('El tipo de respaldo es requerido')
        
        # Validar que sea uno de los valores permitidos
        tipos_permitidos = ['completo', 'parcial']
        if tipo not in tipos_permitidos:
            raise forms.ValidationError('El tipo de respaldo debe ser "completo" o "parcial"')
        
        return tipo

    def clean_descripcion(self):
        descripcion = self.cleaned_data.get('descripcion', '').strip()
        
        # Si está vacía, es válida (es campo opcional)
        if not descripcion:
            return descripcion
        
        # Validar longitud máxima de 200 caracteres
        if len(descripcion) > 200:
            raise forms.ValidationError('La descripción no puede exceder 200 caracteres')
        
        # Validar que no tenga caracteres especiales peligrosos
        # Permite letras, números, espacios, y signos de puntuación básicos
        if not re.match(r'^[a-zA-Z0-9\s.,;:¡!¿?\-_()]+$', descripcion):
            raise forms.ValidationError('La descripción no puede contener caracteres especiales')
        
        return descripcion
