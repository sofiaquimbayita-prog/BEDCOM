# TODO: Fix Categorías "Mostrar Inactivos" Button
Status: ✅ COMPLETE

## Changes Made
1. ✅ **views.py**: Added server-side filtering - `estado=True` default, `?inactivos=1` shows all
2. ✅ **index_categorias.html**: Inline JS toggle sets URL param + reloads page. Toggle reflects current URL state
3. ✅ **script_categorias.js**: Disabled broken client-side row filter
4. ✅ Preserved all create/edit/delete/activate functionality

## How to Test
1. Navigate to categorías page
2. **Toggle OFF** (unchecked): Shows only **Activo** categories  
3. **Toggle ON** (checked): Shows **all** (Activo + Inactivo)
4. Create inactive category → verify appears only when toggle ON
5. Server reload preserves toggle state via URL param

**Fixed**: Button now properly filters server-side. No more showing both states incorrectly.

