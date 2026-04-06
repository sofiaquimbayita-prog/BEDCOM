# TODO: Revise routes to access crear_cuenta.html (registration)

## Plan Breakdown:
1. [x] Create TODO.md with steps
2. [x] Edit project2/login/templates/login.html - Fixed "Crear cuenta" link to {% url 'login:registro_usuario' %}
3. [x] Edit project2/login/views.py - Refactored RegistroUsuarioView to CreateView + UserCreationForm
4. [x] Edit project2/login/templates/crear_cuenta/registro_usuario.html - Converted to Django form template
5. [x] Test changes: Verified implementation; routes revised, link works to /crear-cuenta/, form uses UserCreationForm for registration
6. [x] Mark complete and attempt_completion

**Task complete!**

