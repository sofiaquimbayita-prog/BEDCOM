import json
from django.http import JsonResponse
from .services import consultar_bd_con_ia

def api_consultar_ia(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            pregunta = data.get("pregunta", "")

            # 1. Recuperamos el historial guardado en la sesión de este usuario
            # Si no existe, inicializamos una lista vacía
            historial = request.session.get('historial_luna', [])

            # 2. Llamamos al servicio pasando la pregunta Y el historial
            # Asegúrate de que tu services.py ahora acepte (pregunta, historial)
            respuesta = consultar_bd_con_ia(pregunta, historial)

            # 3. Actualizamos el historial con la nueva interacción
            historial.append({'role': 'user', 'content': pregunta})
            historial.append({'role': 'assistant', 'content': respuesta})

            # 4. Guardamos el historial actualizado en la sesión
            # Guardamos solo los últimos 8-10 mensajes para no saturar el contexto de Llama 3
            request.session['historial_luna'] = historial[-10:]
            
            # Forzamos a Django a guardar la sesión (opcional pero recomendado)
            request.session.modified = True

            return JsonResponse({"respuesta": respuesta})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)