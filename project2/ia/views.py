import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .services import consultar_bd_con_ia
from .models import HistorialChat

@login_required 
def api_consultar_ia(request):
    if request.method == "POST":
        try:
            # 1. LEER LA PREGUNTA
            data = json.loads(request.body)
            pregunta = data.get("pregunta", "").strip()

            if not pregunta:
                return JsonResponse({"error": "La pregunta no puede estar vacía"}, status=400)

            # 2. RECUPERAR MEMORIA (De la Base de Datos)
            # CORRECCIÓN: Se usa request.user (estándar de Django)
            pasado_db = HistorialChat.objects.filter(usuario=request.user).order_by('-fecha')[:10]
            
            # Formateamos el historial
            historial_para_ia = []
            for chat in reversed(list(pasado_db)): # Convertimos a lista para invertirlo bien
                historial_para_ia.append({'role': 'user', 'content': chat.mensaje_usuario})
                historial_para_ia.append({'role': 'assistant', 'content': chat.respuesta_ia})

            # 3. GENERAR RESPUESTA
            respuesta = consultar_bd_con_ia(pregunta, historial_para_ia)

            # 4. GUARDAR EL NUEVO RECUERDO
            # Usamos request.user aquí también
            HistorialChat.objects.create(
                usuario=request.user,
                mensaje_usuario=pregunta,
                respuesta_ia=respuesta
            )

            return JsonResponse({
                "respuesta": respuesta,
                "status": "success"
            })

        except Exception as e:
            # Esto te ayudará a ver errores diferentes si aparecen
            print(f"Error detectado: {e}") 
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)