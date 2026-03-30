import re
import json
from django.shortcuts import redirect
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseRedirect
from django.utils.decorators import method_decorator

# Importación de tus modelos
from ...models import categoria


NOMBRE_PATTERN = re.compile(r'^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$')

# --- VISTA DE LISTADO ---
@method_decorator(login_required, name='dispatch')
class categoria_list_view(ListView):
    model = categoria
    template_name = 'categorias/index_categorias.html'
    context_object_name = 'categorias'

    def get_queryset(self):
        queryset = categoria.objects.order_by('-id')
        if not self.request.GET.get('inactivos'):
            queryset = queryset.filter(estado=True)
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = 'GESTIÓN DE CATEGORÍAS - BEDCOM'
        return context


# --- VISTA DE CREACIÓN (AGREGAR) ---
@method_decorator(login_required, name='dispatch')
class categoria_create_view(SuccessMessageMixin, CreateView):
    model = categoria
    fields = ['nombre', 'descripcion', 'tipo']
    success_url = reverse_lazy('categorias')
    success_message = "¡La categoría %(nombre)s se guardó correctamente!"

    def form_valid(self, form):
        # Validación: El nombre no debe contener caracteres especiales
        nombre = form.cleaned_data['nombre']
        if not nombre or nombre.strip() == '':
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'nombre': ['El nombre es requerido.']}})
            messages.error(self.request, "El nombre es requerido.")
            return redirect('categorias')
        
        if len(nombre.strip()) < 3:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'nombre': ['El nombre debe tener al menos 3 caracteres.']}})
            messages.error(self.request, "El nombre debe tener al menos 3 caracteres.")
            return redirect('categorias')
        
        if not NOMBRE_PATTERN.match(nombre):
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'nombre': ['El nombre de la categoría no puede contener caracteres especiales (solo se permiten letras, números, espacios, guiones y guiones bajos).']}})
            messages.error(self.request, "El nombre de la categoría no puede contener caracteres especiales (solo se permiten letras, números, espacios, guiones y guiones bajos).")
            return redirect('categorias')

        # Validación de descripción requerida
        descripcion = form.cleaned_data.get('descripcion', '').strip()
        if not descripcion:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'descripcion': ['La descripción es requerida.']}})
            messages.error(self.request, "La descripción es requerida.")
            return redirect('categorias')
        
        if len(descripcion) < 10:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'descripcion': ['La descripción debe tener al menos 10 caracteres.']}})
            messages.error(self.request, "La descripción debe tener al menos 10 caracteres.")
            return redirect('categorias')

        form.instance.estado = True

        # Guardar la categoría
        self.object = form.save()
        
        # Responder según el tipo de request
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True, 
                'message': 'Categoría creada correctamente',
                'categoria_id': self.object.id,
                'categoria_nombre': self.object.nombre
            })
        
        messages.success(self.request, f"¡La categoría {self.object.nombre} se guardó correctamente!")
        return HttpResponseRedirect(self.get_success_url())

    def form_invalid(self, form):
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            errors = {}
            for field, error_list in form.errors.items():
                errors[field] = [str(e) for e in error_list]
            return JsonResponse({'success': False, 'errors': errors})
        
        messages.error(self.request, "Error al agregar categoría. Verifica los datos.")
        return redirect('categorias')


# --- VISTA DE EDICIÓN (MODIFICAR) ---
@method_decorator(login_required, name='dispatch')
class categoria_update_view(SuccessMessageMixin, UpdateView):
    model = categoria
    fields = ['nombre', 'descripcion', 'tipo']
    template_name = 'categorias/modal_edit.html'
    success_url = reverse_lazy('categorias')
    success_message = "Categoría actualizada correctamente"

    def form_valid(self, form):
        # Validación: El nombre no debe contener caracteres especiales
        nombre = form.cleaned_data['nombre']
        if not nombre or nombre.strip() == '':
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'nombre': ['El nombre es requerido.']}})
            messages.error(self.request, "El nombre es requerido.")
            return super().form_invalid(form)
        
        if len(nombre.strip()) < 3:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'nombre': ['El nombre debe tener al menos 3 caracteres.']}})
            messages.error(self.request, "El nombre debe tener al menos 3 caracteres.")
            return super().form_invalid(form)
        
        if not NOMBRE_PATTERN.match(nombre):
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'nombre': ['El nombre de la categoría no puede contener caracteres especiales (solo se permiten letras, números, espacios, guiones y guiones bajos).']}})
            messages.error(self.request, "El nombre de la categoría no puede contener caracteres especiales.")
            return super().form_invalid(form)

        # Validación de descripción requerida
        descripcion = form.cleaned_data.get('descripcion', '').strip()
        if not descripcion:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'descripcion': ['La descripción es requerida.']}})
            messages.error(self.request, "La descripción es requerida.")
            return super().form_invalid(form)
        
        if len(descripcion) < 10:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'descripcion': ['La descripción debe tener al menos 10 caracteres.']}})
            messages.error(self.request, "La descripción debe tener al menos 10 caracteres.")
            return super().form_invalid(form)

        # Guardar
        self.object = form.save()
        
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': True, 'message': 'Categoría actualizada correctamente'})
        
        messages.success(self.request, "Categoría actualizada correctamente")
        return HttpResponseRedirect(self.get_success_url())

    def form_invalid(self, form):
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            errors = {}
            for field, error_list in form.errors.items():
                errors[field] = [str(e) for e in error_list]
            return JsonResponse({'success': False, 'errors': errors})
        
        messages.error(self.request, f"Error de validación: {form.errors}")
        return super().form_invalid(form)


# --- VISTA DE ELIMINACIÓN (BORRADO LÓGICO) ---
@method_decorator(login_required, name='dispatch')
class categoria_delete_view(DeleteView):
    model = categoria
    success_url = reverse_lazy('categorias')

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        success_url = self.get_success_url()

        # Lógica de Soft Delete
        self.object.estado = False
        self.object.save()

        messages.success(request, f"La categoría '{self.object.nombre}' fue inactivada correctamente.")
        return HttpResponseRedirect(success_url)


# --- VISTA DE ACTIVACIÓN ---
@method_decorator(login_required, name='dispatch')
class categoria_activate_view(SuccessMessageMixin, DeleteView):
    model = categoria
    success_url = reverse_lazy('categorias')

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        success_url = self.get_success_url()

        # Lógica de activación
        self.object.estado = True
        self.object.save()

        messages.success(request, f"La categoría '{self.object.nombre}' fue activada correctamente.")
        return HttpResponseRedirect(success_url)

