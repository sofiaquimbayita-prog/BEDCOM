from django import forms
import re
from datetime import date, datetime
from .models import calendario, insumo, proveedor, entrada, producto, salida_producto

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




# --- FORMULARIOS DE ENTRADA DE PRODUCTOS ---
class EntradaForm(forms.ModelForm):
    class Meta:
        model = entrada
        fields = ['producto', 'cantidad', 'precio_unitario', 'observaciones']
        widgets = {
            'producto': forms.Select(attrs={
                'class': 'form-control',
                'id': 'id_producto'
            }),
            'cantidad': forms.NumberInput(attrs={
                'class': 'form-control',
                'id': 'id_cantidad',
                'min': '1'
            }),
            'precio_unitario': forms.NumberInput(attrs={
                'class': 'form-control',
                'id': 'id_precio_unitario',
                'min': '0',
                'step': '0.01'
            }),
            'observaciones': forms.Textarea(attrs={
                'class': 'form-control',
                'id': 'id_observaciones',
                'rows': 3
            }),
        }

    def clean_producto(self):
        producto = self.cleaned_data.get('producto')
        if not producto:
            raise forms.ValidationError('Debe seleccionar un producto.')
        if not producto.estado:
            raise forms.ValidationError('El producto seleccionado está inactivo.')
        return producto

    def clean_cantidad(self):
        cantidad = self.cleaned_data.get('cantidad')
        if cantidad is None:
            raise forms.ValidationError('La cantidad es obligatoria.')
        if not isinstance(cantidad, int):
            raise forms.ValidationError('La cantidad debe ser un número entero.')
        if cantidad <= 0:
            raise forms.ValidationError('La cantidad debe ser mayor a 0.')
        if cantidad > 10000:
            raise forms.ValidationError('La cantidad no puede superar 10,000 unidades.')
        return cantidad

    def clean_precio_unitario(self):
        precio = self.cleaned_data.get('precio_unitario')
        if precio is None:
            raise forms.ValidationError('El precio unitario es obligatorio.')
        if precio < 0:
            raise forms.ValidationError('El precio no puede ser negativo.')
        if precio == 0:
            raise forms.ValidationError('El precio debe ser mayor a 0.')
        if precio > 10000000:
            raise forms.ValidationError('El precio no puede superar 10,000,000.')
        
        # Validar máximo 2 decimales
        precio_str = str(precio)
        if '.' in precio_str:
            partes_decimales = precio_str.split('.')[1]
            if len(partes_decimales) > 2:
                raise forms.ValidationError('El precio solo puede tener hasta 2 decimales.')
        
        return precio

    def clean_observaciones(self):
        observaciones = self.cleaned_data.get('observaciones') or ''
        if len(observaciones) > 500:
            raise forms.ValidationError('Las observaciones no pueden superar los 500 caracteres.')
        
        # Validar que no contenga caracteres especiales peligrosos
        import re
        # Bloquear caracteres especiales: ++}}++"#$%&/()=***°°° y otros perigosos
        if re.search(r'[+\$\#\%\&\/\)\=\*\°\°\°\<\>\[\]\{\}\"\']', observaciones):
            raise forms.ValidationError('Las observaciones no pueden contener caracteres especiales.')
        
        return observaciones

    def clean(self):
        cleaned_data = super().clean()
        producto = cleaned_data.get('producto')
        cantidad = cleaned_data.get('cantidad')
        precio_unitario = cleaned_data.get('precio_unitario')

        # Calcular y validar el total
        if producto and cantidad and precio_unitario:
            total_calculado = cantidad * precio_unitario
            if total_calculado <= 0:
                self.add_error('cantidad', 'El total debe ser mayor a 0.')
            if total_calculado > 999999999.99:
                self.add_error('cantidad', 'El total supera el límite permitido.')

        return cleaned_data


# --- FORMULARIOS DE SALIDA DE PRODUCTOS ---
class SalidaProductoForm(forms.ModelForm):
    class Meta:
        model = salida_producto
        fields = ['id_producto', 'cantidad', 'fecha', 'motivo', 'responsable']
        widgets = {
            'id_producto': forms.Select(attrs={
                'class': 'form-control',
                'id': 'id_producto'
            }),
            'cantidad': forms.NumberInput(attrs={
                'class': 'form-control',
                'id': 'id_cantidad',
                'min': '1'
            }),
            'fecha': forms.DateInput(attrs={
                'class': 'form-control',
                'id': 'id_fecha',
                'type': 'date'
            }),
            'motivo': forms.Textarea(attrs={
                'class': 'form-control',
                'id': 'id_motivo',
                'rows': 3,
                'placeholder': 'Motivo de la salida (mínimo 5 caracteres)'
            }),
            'responsable': forms.TextInput(attrs={
                'class': 'form-control',
                'id': 'id_responsable',
                'placeholder': 'Nombre del responsable'
            }),
        }

    def clean_id_producto(self):
        producto = self.cleaned_data.get('id_producto')
        if not producto:
            raise forms.ValidationError('Debe seleccionar un producto.')
        if not producto.estado:
            raise forms.ValidationError('El producto seleccionado está inactivo.')
        return producto

    def clean_cantidad(self):
        cantidad = self.cleaned_data.get('cantidad')
        if cantidad is None:
            raise forms.ValidationError('La cantidad es obligatoria.')
        if not isinstance(cantidad, int):
            raise forms.ValidationError('La cantidad debe ser un número entero.')
        if cantidad <= 0:
            raise forms.ValidationError('La cantidad debe ser mayor a 0.')
        if cantidad > 10000:
            raise forms.ValidationError('La cantidad no puede superar 10,000 unidades.')
        return cantidad

    def clean_fecha(self):
        fecha = self.cleaned_data.get('fecha')
        if not fecha:
            raise forms.ValidationError('La fecha es obligatoria.')
        return fecha

    def clean_motivo(self):
        motivo = self.cleaned_data.get('motivo')
        if not motivo:
            raise forms.ValidationError('El motivo es obligatorio.')
        motivo = motivo.strip()
        if len(motivo) < 5:
            raise forms.ValidationError('El motivo debe tener al menos 5 caracteres.')
        if len(motivo) > 500:
            raise forms.ValidationError('El motivo no puede superar los 500 caracteres.')
        return motivo

    def clean_responsable(self):
        responsable = self.cleaned_data.get('responsable')
        if not responsable:
            raise forms.ValidationError('El nombre del responsable es obligatorio.')
        responsable = responsable.strip()
        if len(responsable) < 3:
            raise forms.ValidationError('El nombre del responsable debe tener al menos 3 caracteres.')
        if len(responsable) > 100:
            raise forms.ValidationError('El nombre del responsable no puede superar los 100 caracteres.')
        return responsable

    def clean(self):
        cleaned_data = super().clean()
        producto = cleaned_data.get('id_producto')
        cantidad = cleaned_data.get('cantidad')

        # Validar stock si hay producto y cantidad
        if producto and cantidad:
            if cantidad > producto.stock:
                self.add_error('cantidad', f'No hay suficiente stock. Stock disponible: {producto.stock}')

        return cleaned_data



