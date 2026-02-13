import os
import django
import sys
from datetime import date

# 1. CONFIGURACIÓN DEL ENTORNO
ruta_actual = os.path.dirname(os.path.abspath(__file__))
sys.path.append(ruta_actual)

# Asegúrate de que 'project2.settings' sea el nombre de tu carpeta de configuración
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings') 
django.setup()

# 2. IMPORTACIÓN DE MODELOS
from app.models import (
    categoria, proveedor, cliente, usuario, reporte, producto,
    insumo, pedido, pago
)

def ejecutar_carga_muebles():
    print("🚀 Iniciando carga masiva: Sector Muebles y Descanso...")

    try:
        # --- 1. USUARIO ADMINISTRADOR ---
        user, _ = usuario.objects.get_or_create(
            cedula="1020", 
            defaults={'nombre_usuar': 'admin_ventas', 'rol': 'Administrador', 'estado': 'Activo'}
        )

        # --- 2. CATEGORÍAS ESPECÍFICAS ---
        cat_base, _ = categoria.objects.get_or_create(nombre="Bases Cama", defaults={'estado': True})
        cat_colchon, _ = categoria.objects.get_or_create(nombre="Colchones", defaults={'estado': True})
        cat_espaldar, _ = categoria.objects.get_or_create(nombre="Espaldares", defaults={'estado': True})

        # --- 3. REPORTE DE INVENTARIO ---
        rep, _ = reporte.objects.get_or_create(
            tipo="Carga Inicial Muebles", 
            id_usuario=user,
            defaults={'fecha': date.today()}
        )

        # --- 4. PRODUCTOS (CAMAS Y ACCESORIOS) ---
        lista_productos = [
            # Bases Cama
            {'nombre': 'Base Cama Queen Microfibra Gray', 'cat': cat_base, 'precio': 450000, 'stock': 15, 'tipo': 'Base'},
            {'nombre': 'Base Cama Doble Madera Reforzada', 'cat': cat_base, 'precio': 380000, 'stock': 20, 'tipo': 'Base'},
            
            # Espaldares
            {'nombre': 'Espaldar Capitoneado King Size', 'cat': cat_espaldar, 'precio': 250000, 'stock': 10, 'tipo': 'Espaldar'},
            {'nombre': 'Espaldar Moderno Tela Antifluido', 'cat': cat_espaldar, 'precio': 180000, 'stock': 12, 'tipo': 'Espaldar'},
            
            # Combos/Camas
            {'nombre': 'Cama Completa Ortopédica Sencilla', 'cat': cat_colchon, 'precio': 850000, 'stock': 8, 'tipo': 'Combo'}
        ]

        for p in lista_productos:
            obj, created = producto.objects.get_or_create(
                nombre=p['nombre'],
                id_cat=p['cat'],
                id_reporte=rep,
                defaults={
                    'tipo': p['tipo'],
                    'precio': p['precio'],
                    'stock': p['stock'],
                    'estado': True
                }
            )
            if created:
                print(f"   🛏️  Producto creado: {obj.nombre}")

        # --- 5. PROVEEDOR DE MATERIA PRIMA ---
        prov, _ = proveedor.objects.get_or_create(
            nombre="Telas y Espumas del Caribe", 
            defaults={'telefono': '6012345', 'direccion': 'Zona Industrial', 'estado': True}
        )

        print("\n🔥 ¡ÉXITO! Inventario de Camas y Espaldares cargado correctamente.")

    except Exception as e:
        print(f"\n❌ Error en la carga: {e}")

if __name__ == '__main__':
    ejecutar_carga_muebles()