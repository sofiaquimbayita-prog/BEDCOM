import json
import os
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .services import consultar_bd_con_ia
from .models import HistorialChat

@login_required 
def api_consultar_ia(request):
    """
    Endpoint para procesar preguntas del usuario, consultar la base de datos de BEDCOM
    y retornar tanto la respuesta de texto como el audio generado por Piper.
    """
    if request.method == "POST":
        try:
            # 1. LEER LA PREGUNTA DESDE EL FRONTEND (Enviada por Vosk o teclado)
            data = json.loads(request.body)
            pregunta = data.get("pregunta", "").strip()

            if not pregunta:
                return JsonResponse({"error": "La pregunta no puede estar vacía"}, status=400)

            # 2. RECUPERAR HISTORIAL (Memoria de los últimos 10 mensajes del usuario actual)
            # Esto permite que Luna tenga contexto de lo que se habló antes
            pasado_db = HistorialChat.objects.filter(usuario=request.user).order_by('-fecha')[:10]
            
            historial_para_ia = []
            for chat in reversed(list(pasado_db)):
                historial_para_ia.append({'role': 'user', 'content': chat.mensaje_usuario})
                historial_para_ia.append({'role': 'assistant', 'content': chat.respuesta_ia})

            # 3. GENERAR RESPUESTA (Llama a Ollama y Piper en services.py)
            # Retorna un dict: {"respuesta": "texto...", "audio_url": "url/al/audio.wav"}
            resultado = consultar_bd_con_ia(pregunta, historial_para_ia)

            # 4. GUARDAR EL NUEVO REGISTRO EN EL HISTORIAL DE LA BD
            # Guardamos solo el texto para mantener la base de datos limpia
            HistorialChat.objects.create(
                usuario=request.user,
                mensaje_usuario=pregunta,
                respuesta_ia=resultado.get('respuesta', 'Sin respuesta')
            )

            # 5. ENVIAR RESPUESTA COMPLETA AL FRONTEND
            # El JS recibirá el texto para el chat y la URL para reproducir el audio
            return JsonResponse({
                "respuesta": resultado.get('respuesta'),
                "audio_url": resultado.get('audio_url'),
                "status": "success"
            })

        except Exception as e:
            # Log de error para depuración en la consola de Django
            print(f"Error detectado en api_consultar_ia: {e}") 
            return JsonResponse({
                "error": "Hubo un problema al procesar la solicitud con la IA.",
                "detalle": str(e)
            }, status=500)

    # Si intentan acceder por GET o cualquier otro método
    return JsonResponse({"error": "Método no permitido"}, status=405)


@login_required
def api_historial(request):
    """
    Retorna el historial de chat del usuario autenticado (últimos 20 mensajes).
    """
    historial = HistorialChat.objects.filter(usuario=request.user).order_by('-fecha')[:20]


    mensajes = []
    for h in reversed(list(historial)):
        mensajes.append({'rol': 'usuario', 'texto': h.mensaje_usuario})
        mensajes.append({'rol': 'luna', 'texto': h.respuesta_ia})
    return JsonResponse({'ok': True, 'mensajes': mensajes})