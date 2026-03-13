from django.contrib import admin
from .models import categoria, producto, usuario, proveedor

@admin.register(usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('cedula', 'username', 'rol', 'estado')
    search_fields = ('cedula', 'username')
    list_filter = ('rol', 'estado')

admin.site.register(categoria)
admin.site.register(producto)
admin.site.register(proveedor)
