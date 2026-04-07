# TODO: Crear Producto DESDE BOM + Guardar en productos

Estado: Pendiente - Nueva feature

## Plan Nueva Feature:

**Objetivo**: En BOM modal, crear producto nuevo + receta BOM en 1 paso.

**1. [x] Agregar Form Producto en BOM**
- `forms.py`: `BomProductoForm` (nombre, categoria; stock=0, precio=0) ✓
- Context `categorias` en `BomListView` ✓

**2. Modificar `bom_crear_receta()` view**
- Si `producto_data` en POST → create producto → get ID → create BOM
- API `/vistas/bom/crear-receta/` maneja ambos

**3. Template/JS BOM**
- `index_bom.html`: Botón "Nuevo Producto" en modal → sub-modal/form
- `script_bom.js`: AJAX create product → refresh dropdown productos

**4. Archivos a editar/crear:**
```
[ ] forms.py - BomProductoForm
[ ] views/bom/views.py - bom_crear_receta() + context categorias  
[ ] templates/bom/index_bom.html - Nuevo producto form
[ ] static/ap1/js/script_bom.js - New product AJAX
```

**Pasos:**
1. [ ] Create BomProductoForm
2. [ ] Update BomListView context + view
3. [ ] Update template + JS
4. [ ] Test: BOM → Nuevo producto + insumos → Guardado

