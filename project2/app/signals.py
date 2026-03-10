from django.db.models.signals import post_save
from django.contrib.auth import get_user_model
from django.dispatch import receiver
from .models import usuario

User = get_user_model()

@receiver(post_save, sender=User)
def crear_usuario_desde_superuser(sender, instance, created, **kwargs):
    """
    Signal que crea automáticamente un registro en el modelo 'usuario'
    cuando se crea un superusuario en Django.
    """
    if created and instance.is_superuser:
        # Verificar si ya existe un usuario con esta cedula
        if not usuario.objects.filter(cedula=instance.username).exists():
            usuario.objects.create(
                cedula=instance.username,
                nombre_usuario=instance.username,
                email=instance.email if instance.email else None,
                rol='admin',
                estado='Activo'
            )
            print(f"Usuario '{instance.username}' creado automáticamente en el modelo 'usuario'")

