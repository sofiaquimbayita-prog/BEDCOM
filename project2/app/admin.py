from django.contrib import admin
from .models import categoria, producto, usuario

@admin.register(usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('cedula', 'nombre_usuario', 'rol', 'estado')
    search_fields = ('cedula', 'nombre_usuario')
    list_filter = ('rol', 'estado')

admin.site.register(categoria)
admin.site.register(producto)
