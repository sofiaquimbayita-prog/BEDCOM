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
        context['titulo_pagina'] = 'MENÚ PRINCIPAL - BEDCOM'
        return context

@login_required
def get_perfil(request):
    """API para obtener los datos del perfil del usuario"""
    try:
        usuario_obj = usuario.objects.get(username=request.user.username)
        return JsonResponse({
            'success': True,
            'data': {
                'cedula': usuario_obj.cedula,
                'username': usuario_obj.username,
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
def update_perfil(request):
    """API para actualizar los datos del perfil del usuario"""
    try:
        usuario_obj = usuario.objects.get(username=request.user.username)
        
        # Manejar FormData (multipart)
        cedula = request.POST.get('cedula')
        nombre_usuario = request.POST.get('nombre_usuario')
        email = request.POST.get('email')
        
        if cedula:
            # Check if cedula already exists for other user
            if usuario.objects.filter(cedula=cedula).exclude(username=request.user.username).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'Cédula ya existe para otro usuario'
                })
            usuario_obj.cedula = cedula
        
        if nombre_usuario:
            usuario_obj.username = nombre_usuario
            
        if email:
            usuario_obj.email = email
            
        # Foto perfil
        if 'foto_perfil' in request.FILES:
            usuario_obj.foto_perfil = request.FILES['foto_perfil']
            
        usuario_obj.save()
        
        return JsonResponse({
            'success': True,
            'data': {
                'cedula': usuario_obj.cedula,
                'username': usuario_obj.username,
                'email': usuario_obj.email,
                'rol': usuario_obj.rol,
                'estado': usuario_obj.estado,
                'foto_perfil': usuario_obj.foto_perfil.url if usuario_obj.foto_perfil else None
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
