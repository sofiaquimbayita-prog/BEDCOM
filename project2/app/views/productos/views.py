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
from django.views.decorators.csrf import csrf_exempt
from django.utils.safestring import mark_safe

# Importación de tus modelos
from ...models import producto, categoria, bom, reporte, usuario


NOMBRE_PATTERN = re.compile(r'^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$')
DESCRIPCION_PATTERN = re.compile(r'^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,-]+$')
# --- VISTA DE LISTADO ---
@method_decorator(login_required, name='dispatch')
class producto_list_view(ListView):
    model = producto
    template_name = 'productos/index_productos.html'
    context_object_name = 'productos'

    def get_queryset(self):
        """
        Filtrar productos activos por defecto. Soporte para ?mostrar_inactivos=true
        Switch ON: only inactive (estado=False)
        Switch OFF: only active (estado=True)
        """
        mostrar_inactivos = self.request.GET.get('mostrar_inactivos', 'false').lower() == 'true'
        
        queryset = producto.objects.select_related('categoria').prefetch_related('bom_set')
        
        if mostrar_inactivos:
            queryset = queryset.filter(estado=False)
        else:
            queryset = queryset.filter(estado=True)
        return queryset.order_by('-id')


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Filtrar solo categorías de tipo producto
        context['categorias'] = categoria.objects.filter(tipo='producto', estado=True)
        context['titulo_pagina'] = 'Gestión de Productos'
        
        return context
    
# --- VISTA DE CREACIÓN (AGREGAR) ---
@method_decorator(login_required, name='dispatch')
class producto_create_view(SuccessMessageMixin, CreateView):
    model = producto
    # Se agrega 'imagen' para capturar fotos de espaldares o basecamas
    fields = ['nombre', 'descripcion', 'precio', 'stock', 'categoria', 'imagen']
    success_url = reverse_lazy('productos')
    success_message = "¡El producto %(nombre)s se guardó correctamente!"

    def form_valid(self, form):
        # Validación de descripción requerida
        descripcion = form.cleaned_data.get('descripcion', '').strip()
        if not descripcion:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'descripcion': ['La descripción es requerida.']}})
            messages.error(self.request, "La descripción es requerida.")
            return redirect('productos')
        
        if len(descripcion) < 10:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'descripcion': ['La descripción debe tener al menos 10 caracteres.']}})
            messages.error(self.request, "La descripción debe tener al menos 10 caracteres.")
            return redirect('productos')
        if not DESCRIPCION_PATTERN.match(descripcion):
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'descripcion': ['La descripción no puede contener caracteres especiales.']}})
            messages.error(self.request, "La descripción no puede contener caracteres especiales.")
            return redirect('productos')
        
        # Validación de negocio: Precio no negativo
        if form.cleaned_data['precio'] <= 0:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'precio': ['El precio inicial no puede ser negativo o cero.']}})
            messages.error(self.request, "El precio inicial no puede ser negativo.")
            return redirect('productos')
        if form.cleaned_data['precio'] > 99999999:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'precio': ['El precio no puede exceder 99,999,999.']}})
            messages.error(self.request, "El precio no puede exceder 99,999,999.")
            return redirect('productos')
        
        # Validación de stock: Si es 0, mostrar advertencia pero permitir crear
        warning_message_stock = None
        if form.cleaned_data['stock'] == 0:
            warning_message_stock = "El stock inicial es 0. Considera agregar stock vía Entradas."
        elif form.cleaned_data['stock'] < 0:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'stock': ['El stock inicial no puede ser negativo.']}})
            messages.error(self.request, "El stock inicial no puede ser negativo.")
            return redirect('productos')

        # Validación: El nombre no debe contener caracteres especiales
        nombre = form.cleaned_data['nombre']
        if not NOMBRE_PATTERN.match(nombre):
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'nombre': ['El nombre del producto no puede contener caracteres especiales (solo se permiten letras, números, espacios, guiones y guiones bajos).']}})
            messages.error(self.request, "El nombre del producto no puede contener caracteres especiales (solo se permiten letras, números, espacios, guiones y guiones bajos).")
            return redirect('productos')

        form.instance.estado = True

        # Guardar el producto
        self.object = form.save()

        # NUEVA VALIDACIÓN: Verificar si tiene receta BOM
        has_receta = bom.objects.filter(producto=self.object).exists()
        warning_message = None
        if not has_receta:
            warning_message = mark_safe(f'Producto "<strong>{self.object.nombre}</strong>" creado exitosamente. <a href="/vistas/bom/" class="alert-link" target="_blank">Crear Receta (BOM) ahora</a> para poder usarlo en entradas/salidas.')



        # Responder según el tipo de request
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            response = {'success': True, 'message': 'Producto creado correctamente'}
            if warning_message:
                response['warning'] = str(warning_message)  # Convert to string for JSON
            return JsonResponse(response)
        
        # Mensaje para request normal
        if warning_message:
            messages.warning(self.request, warning_message)
        messages.success(self.request, f"¡El producto {self.object.nombre} se guardó correctamente!")
        return HttpResponseRedirect(self.get_success_url())

    def form_invalid(self, form):
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            errors = {}
            for field, error_list in form.errors.items():
                errors[field] = [str(e) for e in error_list]
            return JsonResponse({'success': False, 'errors': errors})
        
        messages.error(self.request, "Error al agregar producto. Verifica que la imagen sea válida.")
        return redirect('productos')


# --- VISTA DE EDICIÓN (MODIFICAR) ---
@method_decorator(login_required, name='dispatch')
class producto_update_view(SuccessMessageMixin, UpdateView):
    model = producto
    
    def dispatch(self, *args, **kwargs):
        obj = self.get_object()
        if not obj.tiene_receta():
            messages.error(self.request, "Este producto no tiene receta. Por favor cree una para usar.")
            return redirect('productos')
        return super().dispatch(*args, **kwargs)
    # Se agrega 'imagen' para permitir actualizar fotos del catálogo
    fields = ['nombre', 'descripcion', 'precio', 'stock', 'categoria', 'imagen']
    template_name = 'productos/modal_edit.html'
    success_url = reverse_lazy('productos')
    success_message = "Producto actualizado correctamente"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Filtrar solo categorías de tipo producto
        context['categorias'] = categoria.objects.filter(tipo='producto', estado=True)
        return context

    def form_valid(self, form):
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
        if not DESCRIPCION_PATTERN.match(descripcion):
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'descripcion': ['La descripción no puede contener caracteres especiales.']}})
            messages.error(self.request, "La descripción no puede contener caracteres especiales.")
            return super().form_invalid(form)
        
        # Validación de negocio: Precio no negativo
        if form.cleaned_data['precio'] <= 0:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'precio': ['El precio no puede ser negativo o cero.']}})
            messages.error(self.request, "El precio no puede ser negativo o cero.")
            return super().form_invalid(form)
        if form.cleaned_data['precio'] > 99999999:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'precio': ['El precio no puede exceder 99,999,999.']}})
            messages.error(self.request, "El precio no puede exceder 99,999,999.")
            return super().form_invalid(form)
        
        # Validación de stock: Si es 0, mostrar advertencia pero permitir guardar
        warning_message = None
        if form.cleaned_data['stock'] == 0:
            warning_message = "El stock es 0. Considera agregar stock para tener disponibilidad."
        elif form.cleaned_data['stock'] < 0:
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'stock': ['El stock no puede ser negativo o cero.']}})
            messages.error(self.request, "El stock no puede ser negativo o cero.")
            return super().form_invalid(form)

        # Validación: El nombre no debe contener caracteres especiales
        nombre = form.cleaned_data['nombre']
        if not NOMBRE_PATTERN.match(nombre):
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': {'nombre': ['El nombre del producto no puede contener caracteres especiales (solo se permiten letras, números, espacios, guiones y guiones bajos).']}})
            messages.error(self.request, "El nombre del producto no puede contener caracteres especiales (solo se permiten letras, números, espacios, guiones y guiones bajos).")
            return super().form_invalid(form)

        # Guardar
        self.object = form.save()



        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            response = {'success': True, 'message': 'Producto actualizado correctamente'}
            if warning_message:
                response['warning'] = warning_message
            return JsonResponse(response)
        
        if warning_message:
            messages.warning(self.request, warning_message)
        messages.success(self.request, "Producto actualizado correctamente")
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
class producto_delete_view(DeleteView):
    model = producto
    
    def dispatch(self, *args, **kwargs):
        obj = self.get_object()
        if not obj.tiene_receta():
            messages.error(self.request, "Este producto no tiene receta. Por favor cree una para usar.")
            return redirect('productos')
        return super().dispatch(*args, **kwargs)
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
@method_decorator(login_required, name='dispatch')
class producto_activate_view(SuccessMessageMixin, DeleteView):
    model = producto
    
    def dispatch(self, *args, **kwargs):
        obj = self.get_object()
        if not obj.tiene_receta():
            messages.error(self.request, "Este producto no tiene receta. Por favor cree una para usar.")
            return redirect('productos')
        return super().dispatch(*args, **kwargs)
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
        return HttpResponseRedirect(self.get_success_url())

