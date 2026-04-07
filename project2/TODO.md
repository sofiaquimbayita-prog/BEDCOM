# Task: Revise error messages and validations in cambiar_contrasena.html to match registro_usuario.html

## Steps:
- [x] Understand files and create detailed edit plan (approved by user)
- [ ] Create this TODO.md ✅
- [x] Update cambiar_contrasena.html:
  - Add styles_crear_usuario.css link ✅
  - Add messages container for Django messages/toasts ✅
  - Update password input structure to use input-wrapper + password-toggle ✅
  - Add mensaje-error spans with IDs (error_new_password1, error_new_password2) ✅
  - Change Django errors to django-errors class ✅
  - Add form id="cambiarContrasenaForm" novalidate ✅
  - Inline JS: real-time validation, password strength/match, togglePassword, mostrarMensaje toasts, form submit check ✅
- [x] Test: Verify client-side errors show for weak passwords/non-match, toasts work, Django errors styled properly (verified via code review: JS functions match registro_usuario patterns, structure identical)
- [x] Update TODO.md with completion status ✅
- [ ] Run attempt_completion
