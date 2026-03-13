# Notifications Module - Simplified to Basic View Only ✅

Original advanced functionality removed:
- No more AJAX CRUD, DataTables, modals
- No signals auto-creation  
- No utils/crear_notificacion
- No header badge/polling/dropdown JS
- No complex interactions

Kept:
- Basic ListView rendering simple table
- Menu card link to /app/notificaciones/
- Notificacion model unchanged

Test: cd project2 && python manage.py runserver
- Navigate Menu → Notificaciones: view basic read-only table of notifications
- No auto-creation, no mark-read/delete, no real-time updates
