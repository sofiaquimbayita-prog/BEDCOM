import re
from django.shortcuts import redirect
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin
from datetime import date
from django.http import HttpResponseRedirect

# Importación de tus modelos
from ...models import Producto,Categoria, Reporte, Usuario

# Expresión regular para validar nombre: solo letras, números, espacios y caracteres seguros
# No permite: @ # $ % ^ & * ( ) + = [ ] { } | \ / < > , . ; : " ' ` ~
NOMBRE_PATTERN = re.compile(r'^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$')

# --- VISTA DE LISTADO ---
class ProductoListView(ListView):
    model = Producto
    template_name = 'productos/index_productos.html'
    context_object_name = 'productos'

    def get_queryset(self):
        # Filtra solo activos y optimiza la carga de categorías e imágenes
        # Devolver todos los productos (activos e inactivos). El filtrado por
        # estado se hará en el cliente mediante el switch/ DataTable.
        return Producto.objects.select_related('categoria').order_by('-id')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categorias'] = Categoria.objects.all()
        context['titulo_pagina'] = 'GESTIÓN DE PRODUCTOS - BEDCOM'
        return context


# --- VISTA DE CREACIÓN (AGREGAR) ---
class ProductoCreateView(SuccessMessageMixin, CreateView):
    model = Producto
    # Se agrega 'imagen' para capturar fotos de espaldares o basecamas
    fields = ['nombre', 'tipo', 'precio', 'stock', 'categoria', 'imagen']
    success_url = reverse_lazy('productos')
    success_message = "¡El producto %(nombre)s se guardó correctamente!"

    def form_valid(self, form):
        # Validación de negocio: Precio y Stock no negativos
        if form.cleaned_data['stock'] < 0:
            messages.error(self.request, "El stock inicial no puede ser negativo.")
            return redirect('productos')
        if form.cleaned_data['precio'] < 0:
            messages.error(self.request, "El precio inicial no puede ser negativo.")
            return redirect('productos')

        # Validación: El nombre no debe contener caracteres especiales
        nombre = form.cleaned_data['nombre']
        if not NOMBRE_PATTERN.match(nombre):
            messages.error(self.request, "El nombre del producto no puede contener caracteres especiales (solo se permiten letras, números, espacios, guiones y guiones bajos).")
            return redirect('productos')

        form.instance.estado = True

        # El método save() de la vista de clase manejará request.FILES automáticamente
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "Error al agregar producto. Verifica que la imagen sea válida.")
        return redirect('productos')


# --- VISTA DE EDICIÓN (MODIFICAR) ---
class ProductoUpdateView(SuccessMessageMixin, UpdateView):
    model = Producto
    # Se agrega 'imagen' para permitir actualizar fotos del catálogo
    fields = ['nombre', 'tipo', 'precio', 'stock', 'categoria', 'imagen']
    template_name = 'productos/modal_edit.html'
    success_url = reverse_lazy('productos')
    success_message = "Producto actualizado correctamente"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categorias'] = Categoria.objects.all()
        return context

    def form_valid(self, form):
        # Validación de negocio: Precio y Stock no negativos
        if form.cleaned_data['stock'] < 0:
            messages.error(self.request, "El stock no puede ser negativo.")
            return super().form_invalid(form)
        if form.cleaned_data['precio'] < 0:
            messages.error(self.request, "El precio no puede ser negativo.")
            return super().form_invalid(form)

        # Validación: El nombre no debe contener caracteres especiales
        nombre = form.cleaned_data['nombre']
        if not NOMBRE_PATTERN.match(nombre):
            messages.error(self.request, "El nombre del producto no puede contener caracteres especiales (solo se permiten letras, números, espacios, guiones y guiones bajos).")
            return super().form_invalid(form)

        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, f"Error de validación: {form.errors}")
        return super().form_invalid(form)


# --- VISTA DE ELIMINACIÓN (BORRADO LÓGICO) ---
class ProductoDeleteView(DeleteView):
    model = Producto  # Asegúrate de que la clase empiece con Mayúscula 'Producto'
    success_url = reverse_lazy('productos')

    def post(self, request, *args, **kwargs):
        """
        En Django, DeleteView usa el método POST para confirmar la eliminación.
        Sobrescribimos aquí para evitar que se ejecute el .delete() físico.
        """
        self.object = self.get_object()
        success_url = self.get_success_url()

        # Lógica de Soft Delete
        self.object.estado = False
        self.object.save()

        messages.success(request, f"El producto '{self.object.nombre}' fue inactivado correctamente.")
        return HttpResponseRedirect(success_url)


# --- VISTA DE ACTIVACIÓN ---
class ProductoActivateView(SuccessMessageMixin, DeleteView):
    model = Producto
    success_url = reverse_lazy('productos')

    def post(self, request, *args, **kwargs):
        """
        Vista para activar un producto inactivo.
        """
        self.object = self.get_object()
        success_url = self.get_success_url()

        # Lógica de activación
        self.object.estado = True
        self.object.save()

        messages.success(request, f"El producto '{self.object.nombre}' fue activado correctamente.")
        return HttpResponseRedirect(success_url)
