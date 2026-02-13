from django import forms
from .models import proveedor

class ProveedorForm(forms.ModelForm):
    class Meta:
        model = proveedor
        fields = ['nombre', 'telefono', 'direccion', 'estado']
        widgets = {
            'nombre': forms.TextInput(attrs={'maxlength':100}),
            'telefono': forms.TextInput(attrs={'maxlength':10}),
            'direccion': forms.Textarea(attrs={'rows':3, 'maxlength':200}),
        }

    def clean_telefono(self):
        tel = self.cleaned_data.get('telefono', '')
        if not tel.isdigit():
            raise forms.ValidationError('El teléfono solo debe contener números')
        if not (7 <= len(tel) <= 10):
            raise forms.ValidationError('El teléfono debe tener entre 7 y 10 dígitos')
        return tel.strip()

    def clean_nombre(self):
        nombre = self.cleaned_data.get('nombre', '').strip()
        if not nombre:
            raise forms.ValidationError('El nombre es requerido')
        # opcional: prevenir duplicados exactos
        if proveedor.objects.filter(nombre__iexact=nombre).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError('Ya existe un proveedor con ese nombre')
        return nombre
