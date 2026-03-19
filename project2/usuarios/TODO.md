# TODO: Update cambiar_estado to sync is_active + estado fields

✅ **Completed: 1/3 steps**

## Steps:
### ✅ 1. Update CambiarEstadoUsuarioView.post() in usuarios/views.py
   - Toggle usuario.is_active ✓
   - Sync usuario.estado: 'Inactivo' if not is_active else 'Activo' ✓
   - Update logs and messages to reference both fields ✓
   - Preserve all existing functionality ✓

### ☐ 2. Test the change
   - Use modals to deactivate/activate users
   - Verify DB: both is_active (bool) and estado (string) update correctly
   - Check list view filter and DataTable toggle still work

### ☐ 3. Cleanup
   - Mark TODO complete
   - No migrations needed ✓

**Note**: Minimal change - no template/JS updates needed since they use is_active.

**Next**: Test in browser (`cd project2 && python manage.py runserver`), then confirm completion.


