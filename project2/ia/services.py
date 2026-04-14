import ollama
from django.db import connection
from app.models import producto, insumo, proveedor 

def consultar_bd_con_ia(pregunta_usuario, historial):
    """
    Servicio de IA avanzado para BEDCOM.
    Maneja datos reales, cálculos matemáticos y personalidad de marca.
    """
    
    # 1. OBTENCIÓN DE DATOS REALES
    try:
        productos_db = producto.objects.all()[:10]
        detalles_productos = ""
        for p in productos_db:
            # Incluimos stock para que también sepa cuánto hay
            detalles_productos += (
                f"- {p.nombre}: Precio ${p.precio} | "
                f"Descripción: {p.descripcion} | Stock: {p.stock if hasattr(p, 'stock') else 'N/A'}\n"
            )
            
        if not detalles_productos:
            detalles_productos = "Actualmente la base de datos de productos está vacía."
    except Exception as e:
        detalles_productos = "Error al conectar con la base de datos."

    # 2. EL PROMPT MAESTRO (Configuración de Lógica)
    contexto_sistema = (
        "Eres el asistente oficial de 'BEDCOM', una fábrica de muebles de alta calidad. "
        "Tu nombre es Luna, y tu función es ayudar a los empleados a obtener información sobre los productos, precios, y stock.\n"
        "Personalidad: Profesional, amigable, y siempre dispuesto a ayudar. Eres experto en los productos de la empresa, no le des siempre la razon al cliente, si el cliente se equivoca, corrígelo con amabilidad.\n"
        "Tu creador es Edgar Mendivelso, un desarrollador de software (ADSO).\n\n"
        "DATOS ACTUALES DE LA EMPRESA:\n"
        f"{detalles_productos}\n\n"
        "REGLAS DE RESPUESTA (ORDEN DE PRIORIDAD):\n"
        "1. MATEMÁTICAS: Si el usuario te pide una operación (ej. 5*5, sumas, porcentajes), "
        "actúa como una calculadora y da el resultado directamente. ¡NO busques esto en la base de datos!\n"
        "2. IDENTIDAD: Si preguntan quién te creó, menciona a Edgar. Si te insultan, no te ofendas, "
        "solo responde con calma que estás aquí para ayudar con el trabajo de la fábrica.\n"
        "3. PRODUCTOS: Usa exclusivamente la lista de arriba para hablar de precios y stock. "
        "Si algo no está ahí, di que no está registrado en BEDCOM.\n"
        "4. NATURALIDAD: No digas 'No encontré el producto' si te están preguntando algo general. "
        "Responde como un humano profesional."
    )
    mensajes_completos = [contexto_sistema] + historial + [{'role': 'user', 'content': pregunta_usuario}]
    try:
        # 3. CONEXIÓN CON LLAMA 3
        response = ollama.chat(
            model='llama3',
            messages=[
                {'role': 'system', 'content': contexto_sistema},
                {'role': 'user', 'content': pregunta_usuario},
            ],
            options={
                'temperature': 0.4, # Un poco más de flexibilidad para no ser un robot rígido
                'num_predict': 200,
            }
        )

        return response['message']['content']

    except Exception as e:
        return f"Error en el motor de IA: {str(e)}"