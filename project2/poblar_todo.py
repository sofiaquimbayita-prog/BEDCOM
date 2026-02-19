import os
import django
import random
from datetime import datetime, timedelta

# Configuración del entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings') # Ajusta 'project2' al nombre de tu carpeta de configuración
django.setup()

from app.models import Categoria, Producto, Cliente, Usuario, Pedido, DetallePedido, Despacho, Insumo

def poblar_datos():
    print("Iniciando la carga de datos...")

    # 1. Crear Categorías
    cat_muebles, _ = Categoria.objects.get_or_create(nombre="Muebles", defaults={'descripcion': 'Muebles para el hogar'})
    cat_herrajes, _ = Categoria.objects.get_or_create(nombre="Herrajes", defaults={'descripcion': 'Tornillos y piezas'})

    # 2. Crear Usuarios
    admin, _ = Usuario.objects.get_or_create(
        cedula="12345", 
        defaults={'nombre_usuario': 'Admin_Edgar', 'rol': 'Administrador', 'estado': 'Activo'}
    )

    # 3. Crear Clientes
    cliente_test, _ = Cliente.objects.get_or_create(
        cedula="99999", 
        defaults={'nombre': 'Juan Perez', 'telefono': '3001234567', 'direccion': 'Calle 123'}
    )

    # 4. Crear Productos
    productos_base = [
        {'nombre': 'Base Cama Standard', 'tipo': 'Madera', 'precio': 500000, 'stock': 20, 'categoria': cat_muebles},
        {'nombre': 'Espaldar King', 'tipo': 'Cuero', 'precio': 800000, 'stock': 15, 'categoria': cat_muebles},
        {'nombre': 'Silla Oficina', 'tipo': 'Plástico', 'precio': 150000, 'stock': 50, 'categoria': cat_muebles},
        {'nombre': 'Tornillo 5mm', 'tipo': 'Metal', 'precio': 200, 'stock': 1000, 'categoria': cat_herrajes},
    ]

    productos_creados = []
    for p in productos_base:
        obj, _ = Producto.objects.get_or_create(nombre=p['nombre'], defaults=p)
        productos_creados.append(obj)

    # 5. Crear Pedidos y Detalles (Ventas) de los últimos 6 meses
    print("Generando ventas y pedidos...")
    for i in range(1, 7): # De enero a junio (aprox)
        fecha_pedido = datetime(2026, i, 10)
        
        # Crear 3 pedidos por mes
        for j in range(3):
            nuevo_pedido = Pedido.objects.create(
                cliente=cliente_test,
                fecha=fecha_pedido,
                estado="Entregado",
                total=0 # Se calculará abajo
            )

            # Agregar 2 productos a cada pedido
            total_acumulado = 0
            for _ in range(2):
                prod = random.choice(productos_creados)
                cantidad = random.randint(1, 5)
                subtotal = prod.precio * cantidad
                
                DetallePedido.objects.create(
                    pedido=nuevo_pedido,
                    producto=prod,
                    cantidad=cantidad,
                    precio_unitario=prod.precio,
                    sub_total=subtotal
                )
                total_acumulado += subtotal
            
            # Actualizar el total del pedido
            nuevo_pedido.total = total_acumulado
            nuevo_pedido.save()

            # 6. Crear Despacho para el pedido
            Despacho.objects.create(
                pedido=nuevo_pedido,
                fecha=fecha_pedido + timedelta(days=2),
                estado_entrega="Entregado" if i < 2 else "En proceso"
            )

    print("¡Datos cargados exitosamente!")

if __name__ == '__main__':
    poblar_datos()