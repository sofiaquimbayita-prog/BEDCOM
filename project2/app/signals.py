from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import usuario, entrada, Notificacion
from .utils import crear_notificacion_entrada, enviar_email_nueva_entrada

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

@receiver(post_save, sender=entrada)
def notificacion_nueva_entrada(sender, instance, created, **kwargs):
    if created and instance.estado:
        crear_notificacion_entrada(
            f"Nueva entrada: {instance.producto.nombre}",
            f"Se recibieron {instance.cantidad} unidades"
        )
        enviar_email_nueva_entrada(instance)
