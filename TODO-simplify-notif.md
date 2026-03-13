# Simplified Notifications Module - TODO

## Status: Plan approved, implementing...

**Steps to complete:**
1. [x] Replace views/notificaciones/views.py - ONLY ListView ✅
2. [x] Replace templates/notificaciones/index_notificaciones.html - basic HTML table no JS ✅
3. [x] Delete static/ap1/js/notificaciones.js and notifications-header.js ✅
4. [x] Edit urls.py - remove 5 AJAX urls, keep list url ✅
5. [x] Edit signals.py - remove all notif post_save receivers ✅
6. [x] Edit utils.py - remove crear_notificacion and count func ✅
7. [ ] Edit header.html - remove badge/dropdown
8. [ ] Edit menu/menu.html - keep card if present
9. [ ] Update TODO-notificaciones.md
10. [ ] Test: python manage.py runserver, visit /app/notificaciones/

**Progress:** 2/10 completed
