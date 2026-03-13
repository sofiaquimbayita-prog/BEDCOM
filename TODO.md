# 🔍 DEBUG ACTIVADO - Prueba ahora!

**Agregué logs detallados:**

**JS (F12 Console):**
```
=== FORM RECETA SUBMIT TRIGGERED ===
Producto ID: X
Receta insumos: [...]
AJAX data: {...}
CSRF token: abc123
AJAX FAILED - Status: 403  (or 500, etc)
```

**Django console (runserver):**
```
=== BOM CREAR RECETA HIT ===
Producto ID: X
N° insumos: 1
Data: {...}
Producto encontrado: "Nombre"
Processing insumo: 5, cant: 2, um: kg
BOM created ID: 42
```

**Pasos:**
1. **Reinicia server:** `cd project2 && python manage.py runserver`
2. Ve BOM, **Crear Receta** → agrega producto/insumos → **Guardar**
3. **Copia TODO de ambas consolas** (incluso si "no hay errores")

¡Con esto sabremos exactamente dónde falla!

