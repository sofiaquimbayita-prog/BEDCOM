# TODO - Fix Bug: Creating recipe with multiple ingredients creates duplicate recipes

## Problem:
When creating a recipe with 2 ingredients, 2 recipes were created in the table (one for each ingredient), instead of 1 recipe with 2 ingredients.

## Root Cause:
The template variable `productos_con_receta` was not being passed from the view to the template, causing the JavaScript validation to not work properly.

## Solution Applied:
1. [x] Added `productos_con_receta` variable to the `BomListView` context in views.py
2. [x] The variable contains a list of product IDs that already have recipes
3. [x] JavaScript validation now works correctly to prevent duplicate recipes

## Changes Made:
- **File:** `project2/app/views/bom/views.py`
- **Method:** `BomListView.get_context_data()`
- **Added:** 
```python
# Obtener lista de productos que ya tienen receta (para validación JS)
context['productos_con_receta'] = list(producto.objects.filter(
    id__in=bom.objects.values_list('producto_id', flat=True).distinct()
).values_list('id', flat=True))
```

## Notes:
- The `bom` model already supports multiple ingredients per product (using `unique_together` constraint)
- The validation in JavaScript now properly checks if a product already has a recipe before allowing creation

