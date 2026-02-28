from .models import usuario

def usuario_context(request):
    """
    Context processor para pasar información del usuario personalizado a las plantillas.
    """
    context = {}
    if request.user.is_authenticated:
        try:
            # Buscar el usuario en nuestro modelo personalizado
            usuario_obj = usuario.objects.get(nombre_usuario=request.user.username)
            context['usuario_perfil'] = usuario_obj
        except usuario.DoesNotExist:
            context['usuario_perfil'] = None
    return context
