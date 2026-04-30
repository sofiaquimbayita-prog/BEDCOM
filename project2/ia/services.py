import ollama
import os
import uuid
import glob
import asyncio
from django.conf import settings
from app.models import (
    categoria, proveedor, respaldo, cliente, usuario, reporte, producto, entrada,
    garantia, mantenimiento, insumo, bom, compra, pedido, detalle_pedido, pago,
    supervision, despacho, calendario, salida_producto,
    historial_acciones, Notificacion
)

# =====================================================
# INTENTOS DE MÓDULOS TTS
# =====================================================
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
    
# Voz colombiana Salome
    voz = "es-CO-SalomeNeural"
    
    try:
        communicate = edge_tts.Communicate(texto, voz)
        await communicate.save(archivo_salida)
    except Exception as e:
        # Si falla Salome, intentar con otra voz colombiana
        print(f"Voz {voz} no disponible, intentando alternativa: {e}")
        communicate = edge_tts.Communicate(texto, "es-CO-DanielaNeural")
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
No le des siempre la razón al usuario. 

DATOS ACTUALES:\n{datos_reales}
Responde de forma concisa:"""

        mensajes_finales = [{'role': 'system', 'content': contexto_sistema}]
        if historial:
            mensajes_finales.extend(historial)
        mensajes_finales.append({'role': 'user', 'content': pregunta_usuario})

        response = ollama.chat(model='llama3', messages=mensajes_finales, options={'temperature': 0.7})
        respuesta_texto = response['message']['content']

        limpiar_audios_viejos()
        nombre_audio = f"luna_{uuid.uuid4().hex[:6]}.wav"
        ruta_carpeta = os.path.join(settings.MEDIA_ROOT, 'voces_ia')
        os.makedirs(ruta_carpeta, exist_ok=True)
        ruta_salida = os.path.join(ruta_carpeta, nombre_audio)

        # Usar solo Edge TTS
        if EDGE_TTS_AVAILABLE:
            print("Generando audio con Edge TTS...")
            edge_exito = generar_audio_edge_tts(respuesta_texto, ruta_salida)
            if edge_exito and os.path.exists(ruta_salida):
                audio_url = f"{settings.MEDIA_URL}voces_ia/{nombre_audio}"
                print(f"✓ Audio generado con Edge TTS")
            else:
                print("Edge TTS falló")
        else:
            print("Edge TTS no disponible. Instala edge-tts con: pip install edge-tts")

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
