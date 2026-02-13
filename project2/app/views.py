from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, CreateView, TemplateView, UpdateView
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin
from .models import producto, categoria, reporte, usuario, proveedor, respaldo
from .forms import ProveedorForm
from datetime import date

# --- VISTAS BÁSICAS ---
def MenuPrincipalView(request):
    return render(request, 'login/login.html')

def menu_view(request):
    return render(request, 'menu/menu.html')

def crear_cuenta_view(request):
    return render(request, 'login/index_crear_cuenta.html')

def recuperar_contrasena_view(request):
    return render(request, 'login/index_recuperar_contra.html')

def cambiar_contrasena_view(request):
    return render(request, 'login/index_cambiar_contraseña.html')

def respaldos_view(request):
    return render(request, 'respaldos/respaldos.html')

class RespaldosListView(TemplateView):
    template_name = 'respaldos/respaldos.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['respaldos'] = respaldo.objects.filter(estado=True)
        return context

def generar_respaldo(request):
    if request.method == "POST":
        try:
            tipo = request.POST.get('tipo_respaldo')
            descripcion = request.POST.get('descripcion', '')
            usuario_actual = request.user.username if request.user.is_authenticated else 'sistema'
            
            respaldo.objects.create(
                tipo_respaldo=tipo,
                descripcion=descripcion,
                usuario=usuario_actual,
                estado=True
            )
            messages.success(request, "¡Respaldo generado correctamente!")
        except Exception as e:
            messages.error(request, f"Error al generar respaldo: {str(e)}")
    
    return redirect('respaldos')

def eliminar_respaldo(request, id):
    resp = get_object_or_404(respaldo, id=id)
    if request.method == 'POST':
        try:
            resp.estado = False
            resp.save()
            messages.success(request, "Respaldo eliminado correctamente.")
        except Exception as e:
            messages.error(request, "No se pudo eliminar el respaldo.")
    
    return redirect('respaldos')

# CREAR PROVEEDOR (envío tradicional)
def crear_proveedor(request):
    if request.method == "POST":
        form = ProveedorForm(request.POST)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, f"¡{form.cleaned_data.get('nombre')} guardado correctamente!")
            except Exception as e:
                messages.error(request, f"Error al guardar: {str(e)}")
        else:
            for field, errs in form.errors.items():
                for err in errs:
                    messages.error(request, f"{field}: {err}")

    return redirect('proveedores')

# EDITAR PROVEEDOR (envío tradicional)
def editar_proveedor(request, id):
    prov = get_object_or_404(proveedor, id=id)
    if request.method == 'POST':
        form = ProveedorForm(request.POST, instance=prov)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, f"¡{prov.nombre} actualizado correctamente!")
            except Exception as e:
                messages.error(request, f"Error al actualizar: {str(e)}")
        else:
            for field, errs in form.errors.items():
                for err in errs:
                    messages.error(request, f"{field}: {err}")

    return redirect('proveedores')

# ELIMINAR PROVEEDOR (borrado lógico mediante POST)
def eliminar_proveedor(request, id):
    prov = get_object_or_404(proveedor, id=id)
    if request.method == 'POST':
        try:
            prov.estado = False
            prov.save()
            messages.success(request, "Proveedor eliminado correctamente.")
        except Exception as e:
            messages.error(request, "No se pudo eliminar el proveedor.")

    return redirect('proveedores')

# Funciones antiguas para productos (sin tocar)
def eliminar_producto(request, id):
    prod = get_object_or_404(producto, id=id)
    try:
        prod.estado = False
        prod.save()
        messages.success(request, "Producto eliminado exitosamente.")
    except Exception as e:
        messages.error(request, "No se pudo eliminar el producto.")
    return redirect('productos')

# CLASES GENERICAS
class proveedores_view(TemplateView):
    template_name = 'proveedores/proveedores.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['proveedores'] = proveedor.objects.filter(estado=True)
        return context
    
class ProveedorCreateView(SuccessMessageMixin, CreateView):
    model = proveedor
    fields = ['nombre', 'telefono', 'direccion', 'estado'] 
    success_url = reverse_lazy('proveedores')
    success_message = "¡El proveedor %(nombre)s se guardó correctamente!"

    user_admin = usuario.objects.first()
    rep_obj, _ = reporte.objects.get_or_create(
        fecha=date.today(),
        tipo="Ingreso Manual",
        defaults={'id_usuario': user_admin}
    )

    def form_invalid(self, form):
        messages.error(self.request, "Hubo un error en el formulario. Revisa los datos.")
        return redirect('productos')
