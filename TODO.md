# TODO: Implementar Alertas de Sistema en Monitoreo

## Plan Aprobado y Revisado
- ✅ Usuario confirmó plan (sin nuevas tarjetas KPI, solo lista notificaciones)
- ✅ Umbral stock bajo: <= 10
- ✅ Modelo notificaciones creado en models.py

## Pasos completados:
### 1. **Modelo Notificacion** ✅
   - ✅ Agregado a `project2/app/models.py`
   - ✅ Migrations completadas (0003_notificacion OK)

### 2. **Backend monitoreo/views.py** ✅
   - ✅ generar_notificaciones()
   - ✅ API /api/notificaciones/
   - ✅ Context alertas_count/notificaciones

### 3. **Template + URLs + JS** ✅
   - ✅ urls.py path api_notificaciones
   - ✅ Badge dinámico
   - ✅ Lista notificaciones loop
   - ✅ JS actualizarAlertas polling

### 2. **Actualizar monitoreo/views.py** ⏳
   - Lógica generar notificaciones
   - API `/api/notificaciones/`

### 3. **Template monitoreo.html** ⏳
   - Lista en alertas panel
   - Badge count
   - JS fetch

### 4. **monitoreo.js** ⏳
   - actualizarNotificaciones()
   - Polling

### 5. **Testing** ⏳
   - Sample data
   - Verificar /monitoreo/

### 6. **Migrations** ⏳
   - makemigrations ejecutándose
   - migrate

**Progreso: 1/6 (modelo listo, migrations pending)**


