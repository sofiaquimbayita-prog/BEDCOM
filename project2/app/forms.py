from django import forms
import re
from .models import proveedor, respaldo

class ProveedorForm(forms.ModelForm):
    class Meta:
        model = proveedor
        fields = ['nombre', 'telefono', 'direccion', 'imagen']
        widgets = {
            'nombre': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre del proveedor',
                'oninput': 'validarNombreProveedor(this)'
            }),
            'telefono': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese 10 dígitos',
                'oninput': 'validarTelefonoProveedor(this)'
            }),
            'direccion': forms.Textarea(attrs={
                'rows': 2,
                'class': 'form-control',
                'placeholder': 'Dirección (mínimo 10 caracteres)'
            }),
            'imagen': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
        }

    def clean(self):
        cleaned_data = super().clean()
        nombre = cleaned_data.get('nombre', '').strip()
        telefono = cleaned_data.get('telefono', '').strip()
        direccion = cleaned_data.get('direccion', '').strip()

        # --- VALIDACIÓN DE NOMBRE DUPLICADO ---
        if nombre:
            # Filtramos por nombre exacto (ignorando mayúsculas/minúsculas)
            # El .exclude(pk=self.instance.pk) permite que si estás editando, 
            # no te dé error por tu propio nombre actual.
            query_duplicado = proveedor.objects.filter(nombre__iexact=nombre)
            
            if self.instance.pk:
                query_duplicado = query_duplicado.exclude(pk=self.instance.pk)

            if query_duplicado.exists():
                self.add_error('nombre', f'Ya existe un proveedor registrado con el nombre "{nombre}".')

        # --- VALIDACIONES DE FORMATO Y LONGITUD ---
        if len(nombre) < 3:
            self.add_error('nombre', 'El nombre debe tener al menos 3 caracteres.')
        
        if not re.match(r'^[a-zA-Z0-9\s]+$', nombre):
            self.add_error('nombre', 'El nombre solo puede contener letras, números y espacios.')

        if not telefono.isdigit() or len(telefono) != 10:
            self.add_error('telefono', 'El teléfono debe tener exactamente 10 dígitos numéricos.')

        if len(direccion) < 10:
            self.add_error('direccion', 'La dirección debe tener al menos 10 caracteres.')

        return cleaned_data

class RespaldoForm(forms.ModelForm):
    class Meta:
        model = respaldo
        fields = ['tipo_respaldo', 'descripcion']
        widgets = {
            'tipo_respaldo': forms.Select(attrs={'class': 'form-control'}),
            'descripcion': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
        }