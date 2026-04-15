import ollama
from app.models import producto, insumo, proveedor 

def consultar_bd_con_ia(pregunta_usuario, historial):
    try:
        pregunta_lower = pregunta_usuario.lower()
        
        # PRODUCTOS
        if 'producto' in pregunta_lower or 'stock' in pregunta_lower or 'inventario' in pregunta_lower:
            productos_db = producto.objects.all()[:15] 
            detalles_productos = ""
            for i, p in enumerate(productos_db, 1):
                detalles_productos += f"{i}. **{p.nombre}** | Stock: {p.stock} | Precio: ${p.precio}\n"
        else:
            detalles_productos = ""
            
        # INSUMOS - FIXED CORRECT FIELDS
        if 'insumo' in pregunta_lower:
            insumos_db = insumo.objects.all()[:15]
            detalles_insumos = ""
            for i, ins in enumerate(insumos_db, 1):
                detalles_insumos += f"{i}. **{ins.nombre}** | Cantidad: {ins.cantidad} {ins.unidad_medida} | Precio: ${ins.precio}\n"
        else:
            detalles_insumos = ""
            
        # PROVEEDORES
        if 'proveedor' in pregunta_lower:
            proveedores_db = proveedor.objects.all()[:15]
            detalles_proveedores = ""
            for i, prov in enumerate(proveedores_db, 1):
                detalles_proveedores += f"{i}. **{prov.nombre}** | {prov.telefono}\n"
        else:
            detalles_proveedores = ""

        datos_reales = f"PRODUCTOS:\n{detalles_productos}\nINSUMOS:\n{detalles_insumos}\nPROVEEDORES:\n{detalles_proveedores}".strip()

        if not datos_reales:
            datos_reales = "Base de datos vacía."

    except Exception as e:
        datos_reales = f"Error BD: {str(e)}"

    # PROMPT OPTIMIZADO POR TIPO
    contexto_sistema = f"""Eres Luna de BEDCOM.

DATOS:
{datos_reales}

FORMATO EXACTO lista numerada, UN SOLO ENTER entre líneas:
1. **Nombre** | Info importante
2. **Nombre** | Info importante

NO párrafos, NO espacios dobles, lista limpia."""

    mensajes_finales = [{'role': 'system', 'content': contexto_sistema}]
    mensajes_finales.extend(historial)
    mensajes_finales.append({'role': 'user', 'content': pregunta_usuario})

    try:
        response = ollama.chat(
            model='llama3',
            messages=mensajes_finales,
            options={'temperature': 0.05}
        )
        return response['message']['content']
    except Exception as e:
        return "Error en IA"
