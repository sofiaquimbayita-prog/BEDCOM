import os
import django
import sys
from datetime import date

# 1. CONFIGURACIÓN DEL ENTORNO
ruta_actual = os.path.dirname(os.path.abspath(__file__))
sys.path.append(ruta_actual)

# Asegúrate de que coincida con tu carpeta de configuración (test o config)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings') 
django.setup()

# 2. IMPORTACIÓN DE MODELOS
from app.models import (
    categoria, proveedor, usuario, reporte, producto
)

def ejecutar_carga_bedcom():
    print("🚀 Iniciando carga masiva: Catálogo BedCom 2026...")

    try:
        # --- 1. USUARIO ADMINISTRADOR ---
        user, _ = usuario.objects.get_or_create(
            cedula="1020", 
            defaults={'nombre_usuar': 'admin_bedcom', 'rol': 'Administrador', 'estado': 'Activo'}
        )

        # --- 2. CATEGORÍAS DEL CATÁLOGO ---
        # Basado en las secciones del PDF
        cat_espaldar, _ = categoria.objects.get_or_create(nombre="Espaldares", defaults={'descripcion': 'Espaldares de alta calidad', 'estado': True})
        cat_base, _ = categoria.objects.get_or_create(nombre="Basecamas", defaults={'descripcion': 'Bases en diseño y baúles', 'estado': True})
        cat_premium, _ = categoria.objects.get_or_create(nombre="Gama Premium", defaults={'descripcion': 'Línea de lujo BedCom', 'estado': True})

        # --- 3. REPORTE DE INVENTARIO ---
        rep, _ = reporte.objects.get_or_create(
            tipo="Carga Inicial Catálogo 2026", 
            id_usuario=user,
            defaults={'fecha': date.today()}
        )

        # --- 4. PRODUCTOS REALES DEL CATÁLOGO ---
        lista_productos = [
            # Espaldares (Pág. 2-3)
            {'nombre': 'Capitoneado Plano (Botón Mismo/Diamante)', 'cat': cat_espaldar, 'precio': 210000, 'stock': 10, 'tipo': 'Espaldar'},
            {'nombre': 'Capitoneado Semicurvo Colmena', 'cat': cat_espaldar, 'precio': 230000, 'stock': 8, 'tipo': 'Espaldar'},
            {'nombre': 'Lineal Banana', 'cat': cat_espaldar, 'precio': 190000, 'stock': 15, 'tipo': 'Espaldar'},
            {'nombre': 'Lineal Tipo V', 'cat': cat_espaldar, 'precio': 190000, 'stock': 12, 'tipo': 'Espaldar'},
            {'nombre': 'Chocolatina Punta Magica', 'cat': cat_espaldar, 'precio': 250000, 'stock': 7, 'tipo': 'Espaldar'},
            
            # Basecamas (Pág. 14)
            {'nombre': 'Base Baúl Tapa Acolchada', 'cat': cat_base, 'precio': 550000, 'stock': 5, 'tipo': 'Basecama'},
            {'nombre': 'Base Cama con Piecero en Diseño', 'cat': cat_base, 'precio': 480000, 'stock': 6, 'tipo': 'Basecama'},
            {'nombre': 'Base Nido (Lisa/Acolchada)', 'cat': cat_base, 'precio': 620000, 'stock': 4, 'tipo': 'Basecama'},
            {'nombre': 'Puff Zapatero', 'cat': cat_base, 'precio': 150000, 'stock': 20, 'tipo': 'Accesorio'},
            
            # Gama Premium (Pág. 16)
            {'nombre': 'Espaldar 3D Marco Espejo Premium', 'cat': cat_premium, 'precio': 750000, 'stock': 3, 'tipo': 'Premium'},
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
                print(f"    🛏️  Producto creado: {obj.nombre}")

        # --- 5. PROVEEDOR (BEDCOM) ---
        prov, _ = proveedor.objects.get_or_create(
            nombre="BedCom Premium", 
            defaults={'telefono': '3007415996', 'direccion': 'Sogamoso, Boyacá', 'estado': True}
        )

        print("\n🔥 ¡ÉXITO! Catálogo BedCom 2026 cargado en la base de datos.")

    except Exception as e:
        print(f"\n❌ Error en la carga: {e}")

if __name__ == '__main__':
    ejecutar_carga_bedcom()