
import ollama
import os
import uuid
import glob
import asyncio
import re
from django.conf import settings
from app.models import (
    categoria, proveedor, respaldo, cliente, usuario, reporte, producto, entrada,
    mantenimiento, insumo, bom, compra, pedido, detalle_pedido, pago,
    supervision, despacho, calendario, salida_producto,
    Notificacion
)

def limpiar_texto_para_tts(texto):
    """
    Limpia markdown **bold** para TTS.
    """
    return re.sub(r'\*\*([^*]+)\*\*', r'\1', texto)

def normalize_numbers_for_tts(text):
    """
    Normaliza números para TTS natural en español.
    """
    # $50,000 → "pesos 50000"
    text = re.sub(r'\$(\d{1,3}(?:,\d{3})*)', lambda m: f"pesos {m.group(1).replace(',', '')}", text)
    # % → por ciento
    text = re.sub(r'\s*%', ' por ciento', text)
    # . → punto
    text = re.sub(r'(\d+)\.(\d+)', r'\1 punto \2', text)
    return text


EDGE_TTS_AVAILABLE = False
_edge_tts_module = None

def _try_import_edge_tts():
    """Intenta importar edge_tts de forma segura."""
    global EDGE_TTS_AVAILABLE, _edge_tts_module
    try:
        import edge_tts
        _edge_tts_module = edge_tts
        EDGE_TTS_AVAILABLE = True
        print("[OK] edge-tts cargado correctamente")
        return True
    except ImportError:
        print("edge-tts no instalado. Ejecuta: pip install edge-tts")
        EDGE_TTS_AVAILABLE = False
        return False


_try_import_edge_tts()

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


async def _generar_audio_edge_tts_async(texto, archivo_salida):
    """
    Genera audio usando Edge TTS con la voz de Daniela (es-CO).
    """
    edge_tts = _edge_tts_module
    if not edge_tts:
        raise Exception("edge-tts no disponible")
    

    voz = "es-CO-SalomeNeural"
    
    try:
        communicate = edge_tts.Communicate(texto, voz)
        await communicate.save(archivo_salida)
    except Exception as e:
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


import time

def consultar_bd_con_ia(pregunta_usuario, historial):
    """
    Procesa la pregunta del usuario consultando los modelos de BEDCOM,
    genera una respuesta con Ollama y crea el audio con TTS.
    """
    audio_url = None
    try:
        pregunta_lower = pregunta_usuario.lower().strip()

        MODEL_MAP = {
            'producto': (producto, ['categoria'], lambda i, p: f"{i}. {p.nombre} — tiene {p.stock} unidades en stock, precio {p.precio} pesos, categoría {getattr(p.categoria,'nombre','sin categoría')}"),
            'insumo': (insumo, ['id_categoria', 'id_proveedor'], lambda i, ins: f"{i}. {ins.nombre} — cantidad disponible {ins.cantidad}, precio {ins.precio} pesos, categoría {getattr(ins.id_categoria,'nombre','sin categoría')}, proveedor {getattr(ins.id_proveedor,'nombre','sin proveedor')}"),
            'proveedor': (proveedor, [], lambda i, prov: f"{i}. {prov.nombre} — teléfono {prov.telefono}, dirección {prov.direccion[:40] or 'no registrada'}"),
            'cliente': (cliente, [], lambda i, c: f"{i}. {c.nombre} — teléfono {c.telefono}, dirección {c.direccion[:40] or 'no registrada'}, correo {c.email or 'sin correo'}, {'cliente especial' if c.es_especial else 'cliente normal'}"),
            'categoria': (categoria, [], lambda i, cat: f"{i}. {cat.nombre} — {cat.descripcion[:40] or 'sin descripción'}, tipo {cat.tipo}"),
            'pedido': (pedido, ['cliente'], lambda i, p: f"{i}. Pedido número {p.id} — estado {p.estado}, valor total {p.total} pesos, abonado {p.abono or 0} pesos, cliente {p.cliente.nombre}, fecha de entrega {getattr(p,'fecha_entrega','pendiente')}"),
            'entrada': (entrada, ['producto','proveedor'], lambda i, e: f"{i}. Entrada número {e.id} — producto {e.producto.nombre}, cantidad {e.cantidad}, precio por unidad {e.precio_unitario} pesos, total {e.total} pesos, proveedor {getattr(e.proveedor,'nombre','sin proveedor')}, fecha {e.fecha.date()}"),
            'salida': (salida_producto, ['id_producto'], lambda i, s: f"{i}. Salida número {s.id} — producto {s.id_producto.nombre}, cantidad {s.cantidad}, motivo {s.motivo[:40]}, responsable {s.responsable}, fecha {s.fecha}"),
            'calendario': (calendario, [], lambda i, cal: f"{i}. {cal.titulo} — fecha {cal.fecha} a las {cal.hora}, categoría {cal.categoria}, estado {cal.estado}"),
            'usuario': (usuario, [], lambda i, u: f"{i}. {u.username} — correo {u.email}, rol {u.rol}, teléfono {u.telefono or 'no registrado'}, cédula {u.cedula or 'no registrada'}"),
            'respaldo': (respaldo, [], lambda i, r: f"{i}. Respaldo tipo {r.tipo_respaldo} — generado por {r.usuario}, fecha {r.fecha.strftime('%d/%m %H:%M')}, descripción {r.descripcion[:40] or 'sin descripción'}"),
            'reporte': (reporte, ['usuario'], lambda i, r: f"{i}. Reporte {r.tipo} — generado por {r.usuario.username}, fecha {r.fecha}"),
            'bom': (bom, ['producto','insumo'], lambda i, b: f"{i}. Para fabricar {b.producto.nombre} se necesita {b.insumo.nombre}, cantidad {b.cantidad} {b.unidad_medida}"),
            'compra': (compra, ['proveedor','insumo'], lambda i, c: f"{i}. Compra de {c.insumo.nombre} a {c.proveedor.nombre} — cantidad {c.cantidad}, precio por unidad {c.precio_unidad} pesos, fecha {c.fecha_suministro}"),
            'pago': (pago, ['pedido'], lambda i, pa: f"{i}. Pago de {pa.monto} pesos al pedido número {pa.pedido_id}, fecha {pa.fecha_pago}"),
            'supervision': (supervision, ['usuario'], lambda i, s: f"{i}. {s.descripcion[:50]} — fecha {s.fecha.date()}, supervisado por {s.usuario.username}"),
            'despacho': (despacho, ['pedido'], lambda i, d: f"{i}. Despacho número {d.id} — pedido número {d.pedido_id}, estado {d.estado}, fecha {d.fecha_despacho.date()}, guía {d.numero_guia or 'sin guía'}"),
            'mantenimiento': (mantenimiento, [], lambda i, m: f"{i}. {m.descripcion[:50]} — fecha {m.fecha}, garantía {getattr(m.id_garantia,'id', 'sin garantía')}"),
            'notificacion': (Notificacion, ['user'], lambda i, n: f"{i}. {n.titulo[:25]} — tipo {n.tipo}, {'leída' if n.leida else 'no leída'}, usuario {n.user.username}, fecha {n.fecha_notif.strftime('%H:%M')}"),
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
            for model_cls in [producto, cliente, pedido, calendario, despacho, bom, respaldo, Notificacion, proveedor, entrada]:
                try:
                    count = model_cls.objects.count()
                    model_counts[model_cls._meta.verbose_name_plural or model_cls.__name__] = str(count)
                except: pass
            if model_counts:
                summaries['Conteo'] = '\n'.join([f"{n}: {c}" for n, c in model_counts.items()])

        datos_reales = '\n\n'.join([f"{k}:\n{v}" for k, v in summaries.items()]).strip() or "Sin datos específicos."


        contexto_sistema = f"""
REGLA ABSOLUTA: Solo respondes a preguntas sobre BEDCOM. CUALQUIER OTRO TEMA responde EXACTAMENTE: "No puedo responder a eso, solo soy un asistente de la base de datos de BEDCOM. ¿En qué puedo ayudarte con el inventario o los módulos del sistema?"

Eres Luna, asistente virtual de BEDCOM. Responde SIEMPRE en texto natural, bien redactado y organizado. Usa párrafos cortos y claros.
Cuando enumeres varios elementos usa viñetas con texto completo y descriptivo.
NUNCA uses formato de "campo: valor". En su lugar escribe oraciones completas como "tiene 5 unidades en stock", "su precio es 5000 pesos", "el teléfono es 300 123 45 67".
NUNCA muestres "True" o "False" — escribe "sí" o "no", "especial" o "normal".
Si preguntan solo por una cantidad responde únicamente el número.
DATOS ACTUALES:\n{datos_reales}
Responde de forma concisa pero natural:"""

        mensajes_finales = [{'role': 'system', 'content': contexto_sistema}]
        if historial:
            mensajes_finales.extend(historial)
        mensajes_finales.append({'role': 'user', 'content': pregunta_usuario})

        response = ollama.chat(model='llama3', messages=mensajes_finales, options={'temperature': 0.3})
        respuesta_texto = response['message']['content']
        texto_para_audio = normalize_numbers_for_tts(limpiar_texto_para_tts(respuesta_texto))

        limpiar_audios_viejos()
        nombre_audio = f"luna_{uuid.uuid4().hex[:6]}.wav"
        ruta_carpeta = os.path.join(settings.MEDIA_ROOT, 'voces_ia')
        os.makedirs(ruta_carpeta, exist_ok=True)
        ruta_salida = os.path.join(ruta_carpeta, nombre_audio)

        if EDGE_TTS_AVAILABLE:
            print("Generando audio con Edge TTS...")
            edge_exito = generar_audio_edge_tts(texto_para_audio, ruta_salida)
            if edge_exito and os.path.exists(ruta_salida):
                audio_url = f"{settings.MEDIA_URL}voces_ia/{nombre_audio}"
                print(f"[OK] Audio generado con Edge TTS")
            else:
                print("Edge TTS falló")
        else:
            print("Edge TTS no disponible. Instala edge-tts con: pip install edge-tts")

        time.sleep(2)  # 2s delay for visible thinking indicator
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