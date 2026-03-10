from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from django.shortcuts import get_object_or_404
from app.models import usuario
import json

@method_decorator(login_required, name='dispatch')
class MenuView(TemplateView):
    template_name = 'menu/menu.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = 'MENÚ PRINCIPAL'
        return context

@login_required
def get_perfil(request):
    """API para obtener los datos del perfil del usuario"""
    try:
        usuario_obj = usuario.objects.get(nombre_usuario=request.user.username)
        return JsonResponse({
            'success': True,
            'data': {
                'cedula': usuario_obj.cedula,
                'nombre_usuario': usuario_obj.nombre_usuario,
                'email': usuario_obj.email or '',
                'rol': usuario_obj.rol,
                'estado': usuario_obj.estado,
                'foto_perfil': usuario_obj.foto_perfil.url if usuario_obj.foto_perfil else None
            }
        })
    except usuario.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Usuario no encontrado'
        }, status=404)

@login_required
@csrf_exempt
@require_http_methods(["POST"])
def update_perfil(request):
    """API para actualizar los datos del perfil del usuario"""
    try:
        usuario_obj = usuario.objects.get(nombre_usuario=request.user.username)
        
        data = json.loads(request.body)
        
        # Actualizar campos
        if 'nombre_usuario' in data:
            usuario_obj.nombre_usuario = data['nombre_usuario']
        if 'email' in data:
            usuario_obj.email = data['email']
            
        usuario_obj.save()
        
        return JsonResponse({
            'success': True,
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
