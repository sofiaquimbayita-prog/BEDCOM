# Task: ✅ **100% COMPLETA** - Modal IA + endpoint funcionando

## Resumen cambios:
| Archivo | Cambio |
|---------|--------|
| **app/templates/includes/base.html** | ✅ HTML indicator + CSS pulse/spinner/dots + jQuery JS (global modal) |
| **ia/templates/base.html** | ✅ Backup (app-specific) |
| **config/urls.py** | ✅ `path('ia/', include('ia.urls'))` → /ia/api-consultar/ ahora 200 OK |

**Flujo completo**:
1. Botón robot (global)
2. Query → **Luna: pensando ⭕...** (spinner + pulse + dots)
3. IA Ollama + BEDCOM BD query (services.py)
4. Respuesta texto + audio (Edge-TTS)

**Test**: `python manage.py runserver` → refresh → robot → "stock productos" → ver loader → respuesta.

¡Perfecto! No 404 más.
