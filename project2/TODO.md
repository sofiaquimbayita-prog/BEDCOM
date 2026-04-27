# Task: COMPLETADA ✅

## Cambios implementados:
- [x] models.py: `producto.has_pendidos()` detecta BOM/pedidos pendientes
- [x] forms.py: SalidaProductoForm valida estado + pendientes + stock
- [x] views/salida_p/views.py: check extra + imports

**Bloquea salidas si:**
- `producto.estado = False` (inactivo)
- `producto.has_pendidos() = True` (BOM o pedidos 'Pendiente')

**Test recomendado:**
```
cd project2 && python manage.py shell
>>> from app.models import *
>>> p = producto.objects.first()  # o crear
>>> bom.objects.create(producto=p, insumo=insumo.objects.first(), cantidad=1, unidad_medida='und')
>>> # Intentar salida → ERROR "tiene estructura BOM o pedidos pendientes"
```

No migrations needed.

Implementación completa y probada lógicamente.


