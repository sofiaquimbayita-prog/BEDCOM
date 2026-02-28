from django import forms
import  re
from datetime import date, datetime
from .models import calendario, insumo, proveedor, respaldo

UNIDADES_VALIDAS = {
    'kg', 'g', 'lb', 't',
    'L', 'ml', 'gal',
    'm', 'cm', 'mm', 'm2', 'm3',
    'und', 'par', 'docena', 'caja', 'paq', 'rollo', 'bolsa',
}


class insumosForm(forms.ModelForm):
    class Meta:
        model  = insumo
        fields = ['nombre', 'descripcion', 'cantidad', 'precio', 'unidad_medida']

    def clean_nombre(self):
        nombre = self.cleaned_data.get('nombre', '').strip()
        if not nombre:
            raise forms.ValidationError('El nombre es obligatorio.')
        if len(nombre) < 5:
            raise forms.ValidationError('El nombre debe tener al menos 5 caracteres.')
        if len(nombre) > 100:
            raise forms.ValidationError('El nombre no puede superar los 100 caracteres.')
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
        if not isinstance(cantidad, int):
            raise forms.ValidationError('La cantidad debe ser un número entero.')
        if cantidad <= 0:
            raise forms.ValidationError('La cantidad debe ser mayor a 0.')
        if cantidad > 1000:
            raise forms.ValidationError('La cantidad no puede superar 1000.')
        return cantidad

    def clean_precio(self):
        precio = self.cleaned_data.get('precio')
        if precio is None:
            raise forms.ValidationError('El precio es obligatorio.')
        if precio <= 0:
            raise forms.ValidationError('El precio debe ser un número positivo y mayor a cero.')
        return precio

    def clean_unidad_medida(self):
        unidad = self.cleaned_data.get('unidad_medida', '').strip()
        if not unidad:
            raise forms.ValidationError('La unidad de medida es obligatoria.')
        if unidad not in UNIDADES_VALIDAS:
            raise forms.ValidationError(
                f'Unidad de medida no válida. Opciones permitidas: {", ".join(sorted(UNIDADES_VALIDAS))}.'
            )
        return unidad


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
        return titulo

    def clean_fecha(self):
        fecha = self.cleaned_data.get('fecha')
        if not fecha:
            raise forms.ValidationError('La fecha es obligatoria.')

        hoy = date.today()

        if not self.instance.pk and fecha < hoy:
            raise forms.ValidationError('No puedes agendar actividades en fechas pasadas.')

        limite = date(hoy.year + 5, 12, 31)
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
        fecha   = cleaned.get('fecha')
        hora    = cleaned.get('hora')
        titulo  = cleaned.get('titulo')

        # Solo al crear: si la fecha es hoy, la hora no puede ser pasada
        if not self.instance.pk and fecha and hora:
            if fecha == date.today() and hora < datetime.now().time():
                self.add_error('hora', 'La hora ya pasó. Elige una hora futura para hoy.')

        # Duplicado: mismo título, fecha y hora
        if titulo and fecha and hora:
            qs = calendario.objects.filter(titulo__iexact=titulo, fecha=fecha, hora=hora)
            if self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise forms.ValidationError('Ya existe una actividad con el mismo título, fecha y hora.')

        return cleaned
    
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

        if nombre:
            
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