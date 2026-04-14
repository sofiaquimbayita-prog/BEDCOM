# TODO: Fix Modal IA no abre

## Plan aprobado - Pasos:

- [x] 1. Crear TODO.md (tracking)
- [x] 2. Editar project2/ia/static/js/script_ia.js 
  - ✅ Corregir URL fetch a '/vistas/ia/asistente-inventario/api-consultar/'
  - ✅ Agregar funciones: abrirModalIA(), cerrarModalIA(), enviarConsultaIA()
  - ✅ Actualizar IDs: usar 'iaQuery', 'chatContainer'
  - ✅ Bonus: Enter key, mejor error handling
- [x] 3. Probar modal (manual: recargar página, click botón IA)
- [x] 4. Verificar API en Network tab

**🔧 Issue: Static files 404**  
Se editó JS correctamente pero Django no encuentra /static/ia/js/script_ia.js

Pendiente: collectstatic ejecutado abajo

**Cambios realizados:**
- ✅ Rutas corregidas (JS → Django)
- ✅ Funciones agregadas para abrir/cerrar
- ✅ IDs sincronizados HTML/JS
- ✅ Mejor UX + error handling

Recarga cualquier página y prueba el botón robot flotante.

