from django.views.generic import TemplateView
from django.urls import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from django.shortcuts import get_object_or_404
from app.models import usuario, producto, insumo, categoria, proveedor, cliente, pedido
from django.db.models import Count
import json

@method_decorator(login_required, name='dispatch')
class MenuView(TemplateView):
    template_name = 'menu/menu.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = 'MENÚ PRINCIPAL'
        context['breadcrumbs'] = [
            {'name': 'Inicio', 'url': None},
        ]

        # Stats for charts
        context['total_productos'] = producto.objects.filter(estado=True).count()
        context['total_insumos'] = insumo.objects.filter(estado='Activo').count()
        context['total_categorias'] = categoria.objects.count()
        context['total_proveedores'] = proveedor.objects.filter(estado=True).count()
        context['total_clientes'] = cliente.objects.filter(estado=True).count()
        context['total_pedidos'] = pedido.objects.count()

        # Productos per category (for doughnut chart)
        cats = categoria.objects.annotate(num_productos=Count('producto')).values('nombre', 'num_productos')
        context['cat_labels'] = [c['nombre'] for c in cats if c['num_productos'] > 0]
        context['cat_data'] = [c['num_productos'] for c in cats if c['num_productos'] > 0]

        return context

@login_required
def get_perfil(request):
    """API para obtener los datos del perfil del usuario"""
    try:
        usuario_obj = usuario.objects.get(username=request.user.username)
        return JsonResponse({
            'success': True,
            'data': {
                'cedula': usuario_obj.cedula or '',
                'username': usuario_obj.username,
                'first_name': usuario_obj.first_name or '',
                'last_name': usuario_obj.last_name or '',
                'email': usuario_obj.email or '',
                'telefono': usuario_obj.telefono or '',
                'rol': usuario_obj.rol,
                'estado': usuario_obj.estado,
                'foto_perfil': usuario_obj.foto_usua.url if usuario_obj.foto_usua else None
            }
        })
    except usuario.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Usuario no encontrado'
        }, status=404)

@login_required
@csrf_exempt
def update_perfil(request):
    """API para actualizar los datos del perfil del usuario"""
    try:
        usuario_obj = usuario.objects.get(username=request.user.username)
        
        # Manejar FormData (multipart)
        cedula = request.POST.get('cedula')
        nombre_usuario = request.POST.get('nombre_usuario')
        username = request.POST.get('username')
        telefono = request.POST.get('telefono')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        
        # Username update (primary key, careful)
        if username:
            if usuario.objects.filter(username=username).exclude(username=request.user.username).exists():
                return JsonResponse({'success': False, 'error': 'Nombre de usuario ya existe.'})
            usuario_obj.username = username
        
        if nombre_usuario:
            usuario_obj.username = nombre_usuario  # Legacy fallback
        
        if first_name:
            usuario_obj.first_name = first_name
        if last_name:
            usuario_obj.last_name = last_name
        if telefono:
            if usuario.objects.filter(telefono=telefono).exclude(username=request.user.username).exists():
                return JsonResponse({'success': False, 'error': 'Teléfono ya registrado por otro usuario.'})
            usuario_obj.telefono = telefono
        if email:
            usuario_obj.email = email
        
        # Password
        if password:
            if password != confirm_password:
                return JsonResponse({'success': False, 'error': 'Contraseñas no coinciden.'})
            usuario_obj.set_password(password)
        
        # Foto perfil
        if 'foto_perfil' in request.FILES:
            usuario_obj.foto_usua = request.FILES['foto_perfil']
        
        usuario_obj.save()
        
        return JsonResponse({
            'success': True,
            'data': {
                'cedula': usuario_obj.cedula,
                'username': usuario_obj.username,
                'first_name': usuario_obj.first_name,
                'last_name': usuario_obj.last_name,
                'email': usuario_obj.email,
                'telefono': usuario_obj.telefono,
                'rol': usuario_obj.rol,
                'estado': usuario_obj.estado,
                'foto_perfil': usuario_obj.foto_usua.url if usuario_obj.foto_usua else None
            },
            'message': 'Perfil actualizado correctamente'
        })
    except usuario.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
