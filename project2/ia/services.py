import ollama
import subprocess
import os
import uuid
import json
import glob
import asyncio
from django.conf import settings
from app.models import (
    categoria, proveedor, respaldo, cliente, usuario, reporte, producto, entrada,
    mantenimiento, mantenimiento, insumo, bom, compra, pedido, detalle_pedido, pago,
    supervision, despacho, calendario, salida_producto,
    historial_acciones, Notificacion
)

EDGE_TTS_AVAILABLE = False
_edge_tts_module = None

def _try_import_edge_tts():
    """Intenta importar edge_tts de forma segura."""
    global EDGE_TTS_AVAILABLE, _edge_tts_module
    try:
        import edge_tts
        _edge_tts_module = edge_tts
        EDGE_TTS_AVAILABLE = True
        print("✓ edge-tts cargado correctamente")
        return True
    except ImportError:
        print("edge-tts no instalado. Ejecuta: pip install edge-tts")
        EDGE_TTS_AVAILABLE = False
        return False

# Intentar importar edge_tts al cargar el módulo
_try_import_edge_tts()

# =====================================================
# LIMPIEZA DE AUDIOS VIEJOS
# =====================================================
def limpiar_audios_viejos():
    """Borra los archivos de audio anteriores para ahorrar espacio."""
    ruta_carpeta = os.path.join(settings.MEDIA_ROOT, 'voces_ia')
    if os.path.exists(ruta_carpeta):
        archivos = glob.glob(os.path.join(ruta_carpeta, "*.wav"))
        for f in archivos:
            try:
                os.remove(f)
            except:
                pass

# =====================================================
# GENERAR AUDIO CON EDGE TTS
# =====================================================
async def _generar_audio_edge_tts_async(texto, archivo_salida):
    """
    Genera audio usando Edge TTS con la voz de Daniela (es-CO).
    """
    edge_tts = _edge_tts_module
    if not edge_tts:
        raise Exception("edge-tts no disponible")
    
    # Voz colombiana Daniela (más similar a Piper)
    voz = "es-CO-DanielaNeural"
    
    try:
        communicate = edge_tts.Communicate(texto, voz)
        await communicate.save(archivo_salida)
    except Exception as e:
        # Si falla Daniela, intentar con otra voz哥伦比亚
        print(f"Voz {voz} no disponible, intentando alternativa: {e}")
        communicate = edge_tts.Communicate(texto, "es-CO-GonzaloNeural")
        await communicate.save(archivo_salida)

def generar_audio_edge_tts(texto, archivo_salida):
    """
    Wrapper sincrónico para generar audio con Edge TTS.
    """
    try:
        asyncio.run(_generar_audio_edge_tts_async(texto, archivo_salida))
        return True
    except Exception as e:
        print(f"Error generando audio con Edge TTS: {e}")
        return False

# =====================================================
# GENERAR AUDIO CON PIPER (CORREGIDO)
# =====================================================
def generar_audio_piper(texto, archivo_salida, timeout=15):
    """
    Genera audio usando Piper TTS.
    Pasa el texto por stdin en lugar de usar --input_file.
    """
    piper_dir = os.path.join(settings.MEDIA_ROOT, 'piper')
    piper_exe = os.path.join(piper_dir, 'piper.exe')
    ruta_modelo = os.path.join(piper_dir, 'es_AR-daniela-high.onnx')
    
    # Verificar que piper.exe existe
    if not os.path.exists(piper_exe):
        print(f"Piper no encontrado en: {piper_exe}")
        return False
    
    # Convertir rutas a formato Windows
    ruta_modelo_win = ruta_modelo.replace('/', '\\')
    archivo_salida_win = archivo_salida.replace('/', '\\')
    
    try:
        # Ejecutar Piper pasando texto por stdin
        proceso = subprocess.Popen(
            [piper_exe, 
             '--model', ruta_modelo_win,
             '--output_file', archivo_salida_win,
             '--sentence_silence', '0.3'],
            cwd=piper_dir,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Enviar texto por stdin ( Piper lee de stdin)
        stdout, stderr = proceso.communicate(
            input=texto.encode('utf-8'),
            timeout=timeout
        )
        
        # Verificar si el archivo se generó
        if os.path.exists(archivo_salida):
            tamano = os.path.getsize(archivo_salida)
            print(f"✓ Piper generó audio: {tamano} bytes")
            return True
        else:
            # Mostrar errores para debugging
            err_msg = stderr.decode('utf-8', errors='ignore') if stderr else ""
            out_msg = stdout.decode('utf-8', errors='ignore') if stdout else ""
            if err_msg:
                print(f"Piper error: {err_msg}")
            if out_msg:
                print(f"Piper output: {out_msg}")
            return False
            
    except subprocess.TimeoutExpired:
        try:
            proceso.kill()
        except:
            pass
        print(f"⏱ Piper timeout ({timeout}s)")
        return False
    except FileNotFoundError:
        print(f"Piper.exe no encontrado")
        return False
    except Exception as e:
        print(f"Error Piper: {e}")
        return False

# =====================================================
# FUNCIÓN PRINCIPAL DE CONSULTA IA
# =====================================================
def consultar_bd_con_ia(pregunta_usuario, historial):
    """
    Procesa la pregunta del usuario consultando los modelos de BEDCOM,
    genera una respuesta con Ollama y crea el audio con TTS.
    """
    audio_url = None
    try:
        pregunta_lower = pregunta_usuario.lower().strip()

        # --- MAPEO DE MODELOS ---
        MODEL_MAP = {
            'producto': (producto, ['categoria'], lambda i, p: f"{i}. **{p.nombre}** | Stock: {p.stock} | Precio: ${p.precio}"),
            'insumo': (insumo, ['id_categoria', 'id_proveedor'], lambda i, ins: f"{i}. **{ins.nombre}** | Cantidad: {ins.cantidad} | Precio: ${ins.precio}"),
            'proveedor': (proveedor, [], lambda i, prov: f"{i}. **{prov.nombre}** | Tel: {getattr(prov, 'telefono', 'N/A')}"),
            'cliente': (cliente, [], lambda i, c: f"{i}. **{c.nombre}** | Cédula: {c.cedula}"),
            'categoria': (categoria, [], lambda i, cat: f"{i}. **{cat.nombre}**"),
            'pedido': (pedido, ['cliente'], lambda i, p: f"{i}. #{p.id} | Estado: {p.estado} | Total: ${p.total}"),
            'entrada': (entrada, ['producto'], lambda i, e: f"{i}. #{e.id} | {getattr(e.producto, 'nombre', 'N/A')}: x{e.cantidad}"),
            'salida': (salida_producto, ['id_producto'], lambda i, s: f"{i}. #{s.id} | {getattr(s.id_producto, 'nombre', 'N/A')}: x{s.cantidad}"),
            'calendario': (calendario, ['categoria'], lambda i, cal: f"{i}. **{cal.titulo}** | {cal.fecha}"),
            'usuario': (usuario, [], lambda i, u: f"{i}. **{u.username}** | Rol: {u.rol}"),
        }

        summaries = {}
        for keyword, (model_cls, fields, format_func) in MODEL_MAP.items():
            if keyword in pregunta_lower:
                qs = model_cls.objects.all()[:15]
                if fields:
                    qs = qs.select_related(*fields)
                lines = [format_func(i, obj) for i, obj in enumerate(qs, 1)]
                if lines:
                    summaries[model_cls._meta.verbose_name_plural or f"{model_cls.__name__}s"] = '\n'.join(lines)

        if not summaries or 'todos' in pregunta_lower:
            model_counts = {}
            for model_cls in [producto, cliente, pedido, calendario]:
                try:
                    count = model_cls.objects.count()
                    model_counts[model_cls._meta.verbose_name_plural or model_cls.__name__] = str(count)
                except: pass
            if model_counts:
                summaries['Conteo'] = '\n'.join([f"{n}: {c}" for n, c in model_counts.items()])

        datos_reales = '\n\n'.join([f"{k}:\n{v}" for k, v in summaries.items()]).strip() or "Sin datos específicos."

        # --- CONTEXTO Y PERSONALIDAD ---
        contexto_sistema = f"""
IDENTIDAD: Eres Luna, la asistente virtual de BEDCOM. SOLO USA DATOS REALES.
PERSONALIDAD: Sé inteligente, amigable y servicial, pero con un sentido del humor ácido. 
No le des siempre la razón al usuario. Usa modismos colombianos como 'parce' o 'qué más pues'.
ORIGEN: Desarrollada por Edgar Mendivelso. 
CALENDARIO: El calendario fue creado por Juan Benitez (JB o Rulitos69), es la joya del sistema.
DATOS ACTUALES:\n{datos_reales}
Responde de forma concisa:"""

        mensajes_finales = [{'role': 'system', 'content': contexto_sistema}]
        if historial:
            mensajes_finales.extend(historial)
        mensajes_finales.append({'role': 'user', 'content': pregunta_usuario})

        # --- LLAMADA A OLLAMA ---
        response = ollama.chat(model='llama3', messages=mensajes_finales, options={'temperature': 0.7})
        respuesta_texto = response['message']['content']

        # --- GENERACIÓN DE AUDIO ---
        limpiar_audios_viejos()
        nombre_audio = f"luna_{uuid.uuid4().hex[:6]}.wav"
        ruta_carpeta = os.path.join(settings.MEDIA_ROOT, 'voces_ia')
        os.makedirs(ruta_carpeta, exist_ok=True)
        ruta_salida = os.path.join(ruta_carpeta, nombre_audio)

        # Intentar primero con Piper
        print("Intentando generar audio con Piper...")
        piper_exito = generar_audio_piper(respuesta_texto, ruta_salida, timeout=15)
        
        # Si Piper falló, intenta con Edge TTS
        if not piper_exito:
            if EDGE_TTS_AVAILABLE:
                print("Piper falló, usando Edge TTS como respaldo...")
                edge_exito = generar_audio_edge_tts(respuesta_texto, ruta_salida)
                if edge_exito and os.path.exists(ruta_salida):
                    audio_url = f"{settings.MEDIA_URL}voces_ia/{nombre_audio}"
                    print(f"✓ Audio generado con Edge TTS")
                else:
                    print("Edge TTS también falló")
            else:
                print("Edge TTS no disponible. Instala edge-tts")
        else:
            # Piper funcionó
            audio_url = f"{settings.MEDIA_URL}voces_ia/{nombre_audio}"

        return {
            "respuesta": respuesta_texto,
            "audio_url": audio_url
        }

    except Exception as e:
        import traceback
        print(f"Error en consultar_bd_con_ia: {e}")
        print(traceback.format_exc())
        return {
            "respuesta": f"Error en el servicio: {str(e)}",
            "audio_url": None
        }
