from django.shortcuts import redirect
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin
from datetime import date
from django.http import HttpResponseRedirect
from app.models import proveedor


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
    # Campos: nombre, telefono, direccion, imagen (logo)
    fields = ['nombre', 'telefono', 'direccion', 'imagen']
    success_url = reverse_lazy('proveedores_list')
    success_message = "¡El proveedor %(nombre)s se registró con éxito!"

    def form_valid(self, form):
        # Asignamos estado activo por defecto
        form.instance.estado = True
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "Error al registrar el proveedor. Verifica los datos e imagen.")
        return redirect('proveedores_list')


# --- VISTA DE EDICIÓN ---
class ProveedorUpdateView(SuccessMessageMixin, UpdateView):
    model = proveedor
    fields = ['nombre', 'telefono', 'direccion', 'imagen']
    template_name = 'proveedores/modal_editar.html'
    success_url = reverse_lazy('proveedores_list')
    success_message = "Proveedor actualizado correctamente."

    def form_invalid(self, form):
        messages.error(self.request, f"Error al actualizar: {form.errors}")
        return super().form_invalid(form)


# --- VISTA DE INACTIVACIÓN DE PROVEEDOR (SOFT DELETE) ---
class ProveedorDeleteView(DeleteView):
    model = proveedor  # Asegúrate de que coincida con tu modelo
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

