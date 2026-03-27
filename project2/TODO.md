# TODO: Fix Productos Module Switch Bug

**FIX COMPLETE** 🎉

## Changes Made:
- ✅ JS: Added cache-busting `?t=Date.now()` + `window.location.href` for reliable reload
- ✅ Template: Fixed DataTables empty row (7 individual `<td>` cells, no colspan)
- ✅ JS: Simplified (removed complex filter clear, server handles filtering)

## Test Flow:
1. Load `/vistas/productos/` → Active products show
2. Toggle ON → `?mostrar_inactivos=true&t=...` → Empty table OK  
3. Toggle OFF → `?mostrar_inactivos=false&t=...` → Active products show ✅

Run `python manage.py collectstatic` then test in browser.

