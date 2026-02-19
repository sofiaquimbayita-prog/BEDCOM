from django.shortcuts import redirect
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin
from django.http import HttpResponseRedirect

# Importación de tus modelos (ajusta la ruta según tu estructura)
from ...models import proveedor
from ...forms import ProveedorForm


# --- VISTA DE LISTADO ---
class ProveedorListView(ListView):
    model = proveedor
    template_name = 'proveedores/proveedores.html'
    context_object_name = 'proveedores'

    def get_queryset(self):
        # Devolvemos todos para que el switch de JS maneje activos e inactivos
        return proveedor.objects.all().order_by('-id')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = 'GESTIÓN DE PROVEEDORES - BEDCOM'
        return context


# --- VISTA DE CREACIÓN ---
class ProveedorCreateView(SuccessMessageMixin, CreateView):
    model = proveedor
    form_class = ProveedorForm  # Usar el formulario con validaciones
    success_url = reverse_lazy('proveedores_list')
    success_message = "¡El proveedor %(nombre)s se registró con éxito!"

    def form_valid(self, form):
        # Asignamos estado activo por defecto
        form.instance.estado = True
        return super().form_valid(form)

    def form_invalid(self, form):
        # Recopilar errores del formulario
        error_messages = []
        for field, errors in form.errors.items():
            for error in errors:
                error_messages.append(f"{error}")
        
        if error_messages:
            messages.error(self.request, f"Error al registrar: {' - '.join(error_messages)}")
        else:
            messages.error(self.request, "Error al registrar el proveedor. Verifica los datos.")
        
        return redirect('proveedores_list')


# --- VISTA DE EDICIÓN ---
class ProveedorUpdateView(SuccessMessageMixin, UpdateView):
    model = proveedor
    form_class = ProveedorForm  # Usar el formulario con validaciones
    template_name = 'proveedores/modal_editar.html'
    success_url = reverse_lazy('proveedores_list')
    success_message = "Proveedor actualizado correctamente."

    def form_invalid(self, form):
        # Recopilar errores del formulario para mostrarlos
        error_messages = []
        for field, errors in form.errors.items():
            for error in errors:
                error_messages.append(f"{error}")
        
        messages.error(self.request, f"Error al actualizar: {' - '.join(error_messages)}")
        return super().form_invalid(form)


# --- VISTA DE INACTIVACIÓN DE PROVEEDOR (SOFT DELETE) ---
class ProveedorDeleteView(DeleteView):
    model = proveedor
    success_url = reverse_lazy('proveedores_list')

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        success_url = self.get_success_url()

        # Lógica de Soft Delete
        self.object.estado = False
        self.object.save()

        messages.warning(request, f"El proveedor '{self.object.nombre}' fue inactivado.")
        return HttpResponseRedirect(success_url)


# --- VISTA DE ACTIVACIÓN DE PROVEEDOR ---
class ProveedorActivateView(SuccessMessageMixin, DeleteView):
    model = proveedor
    success_url = reverse_lazy('proveedores_list')

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        success_url = self.get_success_url()

        # Lógica de activación
        self.object.estado = True
        self.object.save()

        messages.success(request, f"El proveedor '{self.object.nombre}' fue activado correctamente.")
        return HttpResponseRedirect(success_url)
