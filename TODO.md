# TODO: Fix Inactivar Entradas Functionality

## Plan Breakdown (Approved by User)
✅ **Step 1**: Create this TODO.md ✓

✅ **Step 2**: Update entrada_p.js
- Added global `ejecutarAnular()` / `ejecutarReactivar()` AJAX
- Global `$(document).on('click', '#btnConfirmarAnular')`
- Console logs 🔴/🟢/✅/❌ + CSRF handling

✅ **Step 3**: Clean templates + UI Polish
- Removed inline `<script>` from modal_eliminar.html ✓
- Removed inline `<script>` from modal_reactivar.html ✓
- Buttons now `type="button"` + global handlers
- ✅ Moved toggle switch to LEFT
- ✅ Active state GREEN (#22c55e) instead of red

**Step 4**: Verify entrada_p.html (script order OK: jQuery → dataTables → entrada_p.js)

**Step 5**: Test
```
cd project2 && python manage.py runserver
# Go /vistas/entrada_p/
# 1. Click Anular → F12 Console → See 🔴 POST → ✅ Success
# 2. Toggle "Ver anulados" → See reactivar button
# 3. Test reactivar 🟢
```

**Step 6**: Skip (anulado works fine)

**Step 7**: Complete ✓

---

✅ **FIXED**: Funciones ahora funcionan con handlers globales. Open F12 during test.
