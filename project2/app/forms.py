from django import forms
from datetime import date
from .models import calendario, insumo
import re

class insumosForm(forms.ModelForm):
    class Meta:
        model = insumo
        fields = ['nombre', 'descripcion', 'cantidad', 'precio', 'unidad_medida']
        
    def clean_nombre(self):
        nombre = self.cleaned_data.get('nombre', '').strip()

        if not nombre:
            raise forms.ValidationError('El nombre es obligatorio.')
        if len(nombre) < 5:
            raise forms.ValidationError('El nombre debe tener al menos 5 caracteres.')
        if len(nombre) > 100:
            raise forms.ValidationError('El nombre no puede superar los 100 caracteres.')
        if re.search('[<>{}[\]\\!|¬*]', nombre):
            raise forms.ValidationError('El nombre contiene caracteres no permitidos.')

        return nombre
    
    def clean_descripcion(self):
        descripcion = self.cleaned_data.get('descripcion') or ''
        if len(descripcion) > 600:
            raise forms.ValidationError('La descripción no puede superar los 600 caracteres.')
        return descripcion
    
    def clean_cantidad(self):
        cantidad = self.cleaned_data.get('cantidad')

        if cantidad is None:
            raise forms.ValidationError('La cantidad es obligatoria.')
        if cantidad <= 0:
            raise forms.ValidationError('La cantidad debe ser un número positivo y mayor a cero.')

        return cantidad
    def clean_precio(self):
        precio = self.cleaned_data.get('precio')

        if precio is None:
            raise forms.ValidationError('El precio es obligatorio.')
        if precio <= 0:
            raise forms.ValidationError('El precio debe ser un número positivo y mayor a cero.')

        return precio
    def clean_unidad_medida(self):
        unidad_medida = self.cleaned_data.get('unidad_medida', '').strip()

        if not unidad_medida:
            raise forms.ValidationError('La unidad de medida es obligatoria.')
        
        if len(unidad_medida) < 1:
            raise forms.ValidationError('La unidad de medida debe tener al menos 1 caracter.')
        if len(unidad_medida) > 50:
            raise forms.ValidationError('La unidad de medida no puede superar los 50 caracteres.')
        if re.search(r'[<>{}[\]\\!@|¬°+*]', unidad_medida):
            raise forms.ValidationError('La unidad de medida contiene caracteres no permitidos.')

        return unidad_medida
    





class calendarioForm(forms.ModelForm):
    class Meta:
        model  = calendario
        fields = ['titulo', 'fecha', 'hora', 'categoria', 'descripcion']



    def clean_titulo(self):
        titulo = self.cleaned_data.get('titulo', '').strip()

        if not titulo:
            raise forms.ValidationError('El título es obligatorio.')
        if len(titulo) < 5:
            raise forms.ValidationError('El título debe tener al menos 5 caracteres.')
        if len(titulo) > 150:
            raise forms.ValidationError('El título no puede superar los 150 caracteres.')
        if re.search(r'[<>{}[\]\\!@|¬°+*]', titulo):
            raise forms.ValidationError('El título contiene caracteres no permitidos.')

        return titulo

    def clean_fecha(self):
        fecha = self.cleaned_data.get('fecha')

        if not fecha:
            raise forms.ValidationError('La fecha es obligatoria.')

        limite = date(date.today().year + 5, 12, 31)
        if fecha > limite:
            raise forms.ValidationError('La fecha no puede superar 5 años en el futuro.')

        return fecha

    def clean_descripcion(self):

        descripcion = self.cleaned_data.get('descripcion') or ''

        if len(descripcion) > 500:
            raise forms.ValidationError('La descripción no puede superar los 500 caracteres.')
        return descripcion

    def clean(self):
        cleaned = super().clean()
        titulo  = cleaned.get('titulo')
        fecha   = cleaned.get('fecha')
        hora    = cleaned.get('hora')

        if titulo and fecha and hora:
            qs = calendario.objects.filter(
                titulo__iexact=titulo,
                fecha=fecha,
                hora=hora
            )
            if self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise forms.ValidationError(
                    'Ya existe una actividad con el mismo título, fecha y hora.'
                )

        return cleaned