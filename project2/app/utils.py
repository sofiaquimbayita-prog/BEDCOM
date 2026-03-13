from .models import Notificacion, usuario, entrada
from django.core.mail import EmailMessage
from django.conf import settings

def crear_notificacion_entrada(titulo, mensaje):
    try:
        usuario_obj = usuario.objects.filter(estado='Activo').first()
        Notificacion.objects.create(
            titulo=titulo,
            mensaje=mensaje,
            tipo='entrada',
            usuario=usuario_obj
        )
    except:
        pass  # Silent fail if no user

def enviar_email_nueva_entrada(instance):
    """
    Envía email de notificación cuando se registra nueva entrada de producto
    """
    try:
        # Build message as unicode string explicitly
        message_lines = [
            u"Nueva entrada registrada en el sistema:",
            u"",
            u"Producto: {}".format(instance.producto.nombre.encode('utf-8').decode('utf-8')),
            u"Cantidad: {} unidades".format(str(instance.cantidad)),
            u"Precio Unitario: ${}".format("{:,.2f}".format(float(instance.precio_unitario))),
            u"Total: ${}".format("{:,.2f}".format(float(instance.total))),
            u"Fecha: {}".format(instance.fecha.strftime('%d/%m/%Y %H:%M')),
            u"Usuario: {}".format((instance.usuario.nombre_usuario.encode('utf-8').decode('utf-8') if instance.usuario else u'Sistema')),
            u"Observaciones: {}".format((instance.observaciones.encode('utf-8').decode('utf-8') if instance.observaciones else u'N/A')),
            u"",
            u"Esta notificación fue generada automáticamente."
        ]
        message = u'\n'.join(message_lines)
        
        subject = u"Nueva Entrada de Producto: {}".format(instance.producto.nombre.encode('utf-8').decode('utf-8'))
        
        email = EmailMessage()
        email.subject = subject
        email.body = message
        email.from_email = 'benitezsanabrijuan@gmail.com'
        email.to = ['benitezsanabriajuan82@gmail.com']
        email.content_subtype = 'plain'
        email.charset = 'utf-8'
        email.encoding = 'utf-8'
        email.send()
        
        print(u"✅ Email enviado a benitezsanabriajuan82@gmail.com para entrada #{}".format(instance.id))
    except Exception as e:
        print(u"⚠️ Error enviando email para entrada #{}: {}".format(instance.id, str(e)))
