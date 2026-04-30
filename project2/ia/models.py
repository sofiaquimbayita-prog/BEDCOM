from django.db import models
from app.models import usuario 

class HistorialChat(models.Model):
    # Relacionamos el chat con un usuario o una sesión
    usuario = models.ForeignKey(usuario, on_delete=models.CASCADE, null=True, blank=True)
    mensaje_usuario = models.TextField()
    respuesta_ia = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat de {self.usuario} - {self.fecha}"