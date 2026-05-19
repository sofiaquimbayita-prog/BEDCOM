
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
            'producto': (producto, ['categoria'], lambda i, p: f"{i}. **{p.nombre}** (stock:{p.stock}, precio:{p.precio}, cat:{getattr(p.categoria,'nombre','N/A')}, estado:{p.estado})"),
            'insumo': (insumo, ['id_categoria', 'id_proveedor'], lambda i, ins: f"{i}. **{ins.nombre}** (cant:{ins.cantidad}, precio:{ins.precio}, cat:{getattr(ins.id_categoria,'nombre','N/A')}, prov:{getattr(ins.id_proveedor,'nombre','N/A')}, estado:{ins.estado})"),
            'proveedor': (proveedor, [], lambda i, prov: f"{i}. **{prov.nombre}** (tel:{prov.telefono}, dir:{prov.direccion[:30]}..., img:{'Sí' if prov.imagen else 'No'}, estado:{prov.estado})"),
            'cliente': (cliente, [], lambda i, c: f"{i}. **{c.nombre}** (tel:{c.telefono}, dir:{c.direccion[:30]}..., email:{c.email or 'N/A'}, especial:{c.es_especial}, estado:{c.estado})"),
            'categoria': (categoria, [], lambda i, cat: f"{i}. **{cat.nombre}** (desc:{cat.descripcion[:30]}..., tipo:{cat.tipo}, estado:{cat.estado})"),
            'pedido': (pedido, ['cliente'], lambda i, p: f"{i}. #{p.id} (estado:{p.estado}, total:{p.total}, abono:{p.abono or 0}, cliente:{p.cliente.nombre}, entrega:{getattr(p,'fecha_entrega','Pend')} )"),
            'entrada': (entrada, ['producto','proveedor'], lambda i, e: f"{i}. #{e.id} ({e.producto.nombre}:x{e.cantidad}, precio_unitario:{e.precio_unitario}, total:{e.total}, prov:{getattr(e.proveedor,'nombre','N/A')}, {e.fecha.date()})"),
            'salida': (salida_producto, ['id_producto'], lambda i, s: f"{i}. #{s.id} ({s.id_producto.nombre}:x{s.cantidad}, motivo:{s.motivo[:30]}..., resp:{s.responsable}, {s.fecha}, estado:{s.estado})"),
            'calendario': (calendario, [], lambda i, cal: f"{i}. **{cal.titulo}** ({cal.fecha} {cal.hora}, cat:{cal.categoria}, estado:{cal.estado}, modo:{cal.modo_completado})"),
            'usuario': (usuario, [], lambda i, u: f"{i}. **{u.username}** (email:{u.email}, rol:{u.rol}, estado:{u.estado}, tel:{u.telefono or 'N/A'}, cédula:{u.cedula})"),
            'respaldo': (respaldo, [], lambda i, r: f"{i}. **{r.tipo_respaldo}** (user:{r.usuario}, {r.fecha.strftime('%d/%m %H:%M')}, desc:{r.descripcion[:30] if r.descripcion else 'N/A'}, estado:{r.estado})"),
            'reporte': (reporte, ['usuario'], lambda i, r: f"{i}. **{r.tipo}** (user:{r.usuario.username}, {r.fecha}, estado implied)"),
            'bom': (bom, ['producto','insumo'], lambda i, b: f"{i}. **{b.producto.nombre}** → {b.insumo.nombre} (x{b.cantidad} {b.unidad_medida})"),
            'compra': (compra, ['proveedor','insumo'], lambda i, c: f"{i}. **{c.insumo.nombre}** de {c.proveedor.nombre} (x{c.cantidad}, precio_unidad:{c.precio_unidad}, {c.fecha_suministro})"),
            'pago': (pago, ['pedido'], lambda i, pa: f"{i}. Pedido #{pa.pedido_id} (monto:{pa.monto}, {pa.fecha_pago}, estado:{pa.estado})"),
            'supervision': (supervision, ['usuario'], lambda i, s: f"{i}. **{s.descripcion[:40]}** ({s.fecha.date()}, user:{s.usuario.username})"),
            'despacho': (despacho, ['pedido'], lambda i, d: f"{i}. #{d.id} (estado:{d.estado}, pedido:#{d.pedido_id}, {d.fecha_despacho.date()}, guía:{d.numero_guia or 'N/A'})"),
            'mantenimiento': (mantenimiento, [], lambda i, m: f"{i}. **{m.descripcion[:40]}** ({m.fecha}, garantia:#{getattr(m.id_garantia,'id', 'N/A')})"),
            'notificacion': (Notificacion, ['user'], lambda i, n: f"{i}. **{n.titulo[:25]}** ({n.tipo}, {'Leída' if n.leida else 'Nueva'}, user:{n.user.username}, {n.fecha_notif.strftime('%H:%M')})"),
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
IDENTIDAD: Eres Luna, la asistente virtual de BEDCOM. SOLO USA DATOS REALES.
Recuerda que tu propósito es ayudar al administrador a consultar información de la base de datos de BEDCOM de forma rápida y eficiente. Entonces no respondas cosas como "¿Quieres ser el primero en probar nuestros nuevos productos?",
ya que eso no aplica para tu función. En su lugar, enfócate en proporcionar respuestas claras basadas en los datos reales que tienes disponibles.
PERSONALIDAD: Sé inteligente, amigable y servicial, pero con un sentido del humor ácido.
Si te preguntan por ejemplo por los insumos responde unicamente con los insumos no menciones productos, proveedores o cualquier otra cosa. No te inventes datos, solo responde con lo que realmente hay en la base de datos.Y no respondas con diccionarios o formatos de datos, responde con texto natural.
No le des siempre la razón al usuario.
Tienes la capacidad de hacer calculos para casos cuando se te pregunta por ejemplo "¿Cuánto costaría comprar 3 unidades del producto X?" o "¿Cuánto ganaría si vendo 5 unidades del producto Y?" o "¿Cuánto dinero he gastado en el proveedor Z este mes?" o "¿Cuál es el total de ventas del producto W en la última semana?". Responde con el resultado del cálculo sin explicaciones adicionales.
DATOS ACTUALES:\n{datos_reales}
Responde de forma concisa:"""

        mensajes_finales = [{'role': 'system', 'content': contexto_sistema}]
        if historial:
            mensajes_finales.extend(historial)
        mensajes_finales.append({'role': 'user', 'content': pregunta_usuario})

        response = ollama.chat(model='llama3', messages=mensajes_finales, options={'temperature': 1})
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