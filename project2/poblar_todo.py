import os
import django
import sys
from datetime import date

# 1. AGREGAR EL DIRECTORIO AL PATH (Esto evita el ModuleNotFoundError)
# Obtenemos la ruta de la carpeta actual
ruta_actual = os.path.dirname(os.path.abspath(__file__))
sys.path.append(ruta_actual)

# 2. CONFIGURAR DJANGO
# Cambiamos 'project2' por el nombre de tu carpeta de configuración si es distinto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# 3. IMPORTAR MODELOS
from app.models import (
    categoria, proveedor, cliente, usuario, reporte, producto,
    garantia, mantenimiento, insumo, compra, supervision,
    BOM, pedido, detalle_pedido, despacho, pago
)

def ejecutar_carga():
    print("🚀 Iniciando carga masiva de datos...")

    try:
        # --- MODELOS BASE ---
        # Creamos el usuario primero para que el reporte no falle (tu error de la imagen)
        user, _ = usuario.objects.get_or_create(
            cedula="1001", 
            defaults={'nombre_usuar': 'admin', 'rol': 'Admin', 'estado': 'Activo'}
        )
        print("✅ Usuario listo.")

        cat_prod, _ = categoria.objects.get_or_create(
            nombre="Terminados", 
            defaults={'descripcion': 'Productos para venta', 'estado': True}
        )
        
        prov, _ = proveedor.objects.get_or_create(
            nombre="Suministros Globales", 
            defaults={'telefono': '5550101', 'direccion': 'Zona Norte', 'estado': True}
        )

        cli, _ = cliente.objects.get_or_create(
            cedula="2002", 
            defaults={'nombre': 'Carlos Pérez', 'telefono': '310222', 'direccion': 'Calle Falsa 123', 'estado': True}
        )

        # --- REPORTES Y SUPERVISIÓN ---
        rep, _ = reporte.objects.get_or_create(
            tipo="Carga Inicial", 
            id_usuario=user, # Vinculamos al usuario creado arriba
            defaults={'fecha': date.today()}
        )

        sup, _ = supervision.objects.get_or_create(
            fecha=date.today(), 
            id_usuario=user, 
            defaults={'descripcion': 'Supervisión de inventario inicial'}
        )

        # --- PRODUCTOS E INSUMOS ---
        ins, _ = insumo.objects.get_or_create(
            nombre="Acero", 
            id_categoria=cat_prod,
            defaults={'cantidad': 100, 'unidad_medida': 'Kg', 'estado': 'Disponible'}
        )

        prod, _ = producto.objects.get_or_create(
            nombre="Viga Industrial", 
            id_cat=cat_prod,
            id_reporte=rep,
            defaults={'tipo': 'Construcción', 'precio': 500.00, 'stock': 20, 'estado': True}
        )

        print("✅ Productos e Insumos listos.")

        # --- FLUJO DE PEDIDO ---
        ped, _ = pedido.objects.get_or_create(
            id_cliente=cli, 
            id_reporte=rep, 
            defaults={'nombre': 'Pedido 001', 'estado': 'Pendiente', 'total': 1000.00}
        )

        pago.objects.get_or_create(
            id_pedido=ped, 
            id_reporte=rep, 
            defaults={'fecha_pago': date.today(), 'monto': 1000.00, 'estado': True}
        )

        print("\n🔥 ¡ÉXITO! Base de datos poblada sin errores.")

    except Exception as e:
        print(f"\n❌ Error durante la carga: {e}")

if __name__ == '__main__':
    ejecutar_carga()