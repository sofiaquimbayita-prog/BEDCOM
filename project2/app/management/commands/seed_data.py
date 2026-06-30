from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
import random

User = get_user_model()

from app.models import (
    categoria, proveedor, producto, insumo, bom, compra,
    cliente, pedido, detalle_pedido, pago, despacho,
    mantenimiento, entrada, salida_producto, calendario,
    respaldo, supervision, reporte, Notificacion
)


class Command(BaseCommand):
    help = 'Inserta datos de prueba en todos los módulos'

    def handle(self, *args, **options):
        # 1. Usuario de prueba
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@bedcom.com',
                'cedula': '12345678',
                'rol': 'Administrador',
                'estado': 'Activo',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            user.set_password('admin123')
            user.save()
            self.stdout.write(self.style.SUCCESS('  Usuario admin creado (admin / admin123)'))
        else:
            self.stdout.write('  Usuario admin ya existe')

        # 2. Categorias
        cats = {}
        for nombre, tipo in [
            ('Muebles', 'producto'), ('Tapicería', 'producto'), ('Melamina', 'producto'),
            ('Herrajes', 'insumo'), ('Telas', 'insumo'),
        ]:
            c, _ = categoria.objects.get_or_create(
                nombre=nombre,
                defaults={'descripcion': f'Categoría de {tipo}: {nombre}', 'tipo': tipo}
            )
            cats[nombre] = c
        self.stdout.write(self.style.SUCCESS(f'  {len(cats)} categorías listas'))

        # 3. Proveedores
        provs = {}
        for nombre, tel, direccion in [
            ('Distribuidora del Sur', '3005123456', 'Cra 50 #20-30, Medellín'),
            ('Suministros Industriales SAS', '3016987452', 'Av. Siempre Viva #123, Bogotá'),
            ('Maderas y Acabados LTDA', '3154789652', 'Calle 80 #45-12, Barranquilla'),
        ]:
            p, _ = proveedor.objects.get_or_create(
                nombre=nombre,
                defaults={'telefono': tel, 'direccion': direccion, 'descripcion': f'Proveedor {nombre}'}
            )
            provs[nombre] = p
        self.stdout.write(f'  {len(provs)} proveedores listos')

        # 4. Productos
        prods = {}
        for nombre, precio, stock, cat_nombre in [
            ('Silla Ejecutiva', 450000, 15, 'Muebles'),
            ('Mesa de Centro', 680000, 8, 'Muebles'),
            ('Sofá 3 Puestos', 1200000, 5, 'Tapicería'),
            ('Cojín Decorativo', 45000, 40, 'Tapicería'),
            ('Closet 2 Puertas', 950000, 6, 'Melamina'),
            ('Estante Modular', 320000, 12, 'Melamina'),
        ]:
            pr, _ = producto.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'descripcion': f'{nombre} de alta calidad',
                    'precio': Decimal(str(precio)),
                    'stock': stock,
                    'categoria': cats[cat_nombre],
                }
            )
            prods[nombre] = pr
        self.stdout.write(f'  {len(prods)} productos listos')

        # 5. Insumos
        insumos = {}
        for nombre, cant, udm, precio, cat_nombre, prov_nombre in [
            ('Tornillos 2"', 500, 'unidades', 2500, 'Herrajes', 'Suministros Industriales SAS'),
            ('Bisagras', 200, 'unidades', 3800, 'Herrajes', 'Suministros Industriales SAS'),
            ('Tela Microfibra', 100, 'metros', 15000, 'Telas', 'Distribuidora del Sur'),
            ('Espuma D-30', 50, 'láminas', 28000, 'Telas', 'Distribuidora del Sur'),
            ('Lámina Melamina', 80, 'láminas', 45000, 'Herrajes', 'Maderas y Acabados LTDA'),
        ]:
            ins, _ = insumo.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'cantidad': cant,
                    'unidad_medida': udm,
                    'precio': Decimal(str(precio)),
                    'estado': 'Activo',
                    'id_categoria': cats[cat_nombre],
                    'id_proveedor': provs[prov_nombre],
                }
            )
            insumos[nombre] = ins
        self.stdout.write(f'  {len(insumos)} insumos listos')

        # 6. BOM (recetas)
        boms_creados = 0
        for prod_nombre, ins_nombre, cant, udm in [
            ('Silla Ejecutiva', 'Tornillos 2"', 12, 'unidades'),
            ('Silla Ejecutiva', 'Tela Microfibra', 2, 'metros'),
            ('Silla Ejecutiva', 'Espuma D-30', 1, 'láminas'),
            ('Sofá 3 Puestos', 'Tela Microfibra', 8, 'metros'),
            ('Sofá 3 Puestos', 'Espuma D-30', 3, 'láminas'),
            ('Closet 2 Puertas', 'Lámina Melamina', 4, 'láminas'),
            ('Closet 2 Puertas', 'Bisagras', 6, 'unidades'),
            ('Closet 2 Puertas', 'Tornillos 2"', 24, 'unidades'),
        ]:
            _, created_bom = bom.objects.get_or_create(
                producto=prods[prod_nombre],
                insumo=insumos[ins_nombre],
                defaults={'cantidad': cant, 'unidad_medida': udm},
            )
            if created_bom:
                boms_creados += 1
        self.stdout.write(f'  {boms_creados} BOMs creados')

        # 7. Compras (insumos a proveedores)
        compras_creadas = 0
        for prov_nombre, ins_nombre, cant, pcio in [
            ('Suministros Industriales SAS', 'Tornillos 2"', 1000, 2200),
            ('Distribuidora del Sur', 'Tela Microfibra', 200, 14000),
            ('Maderas y Acabados LTDA', 'Lámina Melamina', 100, 42000),
        ]:
            _, created_c = compra.objects.get_or_create(
                proveedor=provs[prov_nombre],
                insumo=insumos[ins_nombre],
                defaults={
                    'fecha_suministro': date.today() - timedelta(days=random.randint(5, 60)),
                    'cantidad': cant,
                    'precio_unidad': Decimal(str(pcio)),
                },
            )
            if created_c:
                compras_creadas += 1
        self.stdout.write(f'  {compras_creadas} compras creadas')

        # 8. Clientes
        clientes_list = []
        for nombre, tel, direccion, especial in [
            ('Carlos Méndez', '3001112233', 'Calle 45 #22-11, Medellín', False),
            ('María García', '3105544332', 'Cra 72 #33-10, Bogotá', True),
            ('Pedro Ramírez', '3209876543', 'Av. Nutibara #12-34, Medellín', False),
            ('Laura Castillo', '3156789012', 'Calle 10 #5-67, Cali', True),
        ]:
            cl, _ = cliente.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'telefono': tel,
                    'direccion': direccion,
                    'email': f'{nombre.lower().replace(" ", ".")}@email.com',
                    'es_especial': especial,
                }
            )
            clientes_list.append(cl)
        self.stdout.write(f'  {len(clientes_list)} clientes listos')

        # 9. Pedidos con detalles
        pedidos_creados = 0
        dets_creados = 0
        pedido_objs = []
        for cl, estado, days_ago in [
            (clientes_list[0], 'Pendiente', 2),
            (clientes_list[1], 'En Proceso', 5),
            (clientes_list[2], 'Entregado', 15),
            (clientes_list[3], 'Pendiente', 1),
        ]:
            total = Decimal('0')
            ped, created_p = pedido.objects.get_or_create(
                cliente=cl,
                fecha=timezone.now() - timedelta(days=days_ago),
                estado=estado,
                defaults={
                    'total': Decimal('0'),
                    'abono': Decimal('50000') if estado != 'Pendiente' else None,
                    'fecha_entrega': date.today() + timedelta(days=7) if estado != 'Entregado' else date.today() - timedelta(days=10),
                }
            )
            if created_p:
                pedidos_creados += 1
                # Detalles del pedido
                for prod, cant in [
                    (prods['Silla Ejecutiva'], 2),
                    (prods['Cojín Decorativo'], 4),
                ]:
                    sub = Decimal(str(prod.precio * cant))
                    total += sub
                    detalle_pedido.objects.create(
                        pedido=ped,
                        producto=prod,
                        cantidad=cant,
                        precio_unitario=prod.precio,
                        sub_total=sub,
                    )
                    dets_creados += 1
                ped.total = total
                ped.save()
            pedido_objs.append(ped)
        self.stdout.write(f'  {pedidos_creados} pedidos con {dets_creados} detalles')

        # 10. Pagos
        pagos_creados = 0
        for ped in pedido_objs:
            if ped.estado == 'Entregado' and ped.total:
                _, created_pg = pago.objects.get_or_create(
                    pedido=ped,
                    monto=ped.total,
                    defaults={'fecha_pago': date.today() - timedelta(days=8)},
                )
                if created_pg:
                    pagos_creados += 1
            elif ped.abono:
                _, created_pg = pago.objects.get_or_create(
                    pedido=ped,
                    monto=ped.abono,
                    defaults={'fecha_pago': date.today() - timedelta(days=1)},
                )
                if created_pg:
                    pagos_creados += 1
        self.stdout.write(f'  {pagos_creados} pagos creados')

        # 11. Supervision
        sup, _ = supervision.objects.get_or_create(
            usuario=user,
            descripcion='Supervisión general de prueba',
            defaults={'fecha': date.today() - timedelta(days=3)},
        )
        if _:
            self.stdout.write('  1 supervisión creada')

        # 12. Despachos (necesita pedido Pendiente)
        for ped in pedido_objs:
            if ped.estado == 'Pendiente' and not despacho.objects.filter(pedido=ped).exists():
                despacho.objects.create(
                    pedido=ped,
                    estado=random.choice(['pendiente', 'en_ruta']),
                    direccion_entrega=ped.cliente.direccion,
                    telefono_contacto=ped.cliente.telefono,
                    responsable='Juan Despachador',
                    empresa_transporte=random.choice(['EnvíaYa', 'Coordinadora', 'Servientrega']),
                    numero_guia=f'GUI-{random.randint(10000,99999)}',
                    costo_envio=Decimal('15000'),
                    supervision=sup if sup.pk else None,
                )
                self.stdout.write(f'  Despacho creado para Pedido #{ped.id}')

        # 13. Mantenimientos
        mants_creados = 0
        for prod, falla, estado_rep in [
            (prods['Silla Ejecutiva'], 'Brazo derecho suelto', 'recibida'),
            (prods['Sofá 3 Puestos'], 'Resorte saltado en el asiento', 'en_reparacion'),
            (prods['Mesa de Centro'], 'Rayón profundo en la superficie', 'reparada'),
        ]:
            _, created_m = mantenimiento.objects.get_or_create(
                producto=prod,
                descripcion_falla=falla,
                defaults={
                    'fecha': date.today() - timedelta(days=random.randint(1, 20)),
                    'estado_reparacion': estado_rep,
                },
            )
            if created_m:
                mants_creados += 1
        self.stdout.write(f'  {mants_creados} mantenimientos creados')

        # 14. Entradas de producto
        ent_creadas = 0
        for prod, cant, pcio_unit, prov_nombre in [
            (prods['Silla Ejecutiva'], 20, 380000, 'Distribuidora del Sur'),
            (prods['Cojín Decorativo'], 50, 35000, 'Suministros Industriales SAS'),
            (prods['Estante Modular'], 25, 250000, 'Maderas y Acabados LTDA'),
        ]:
            _, created_e = entrada.objects.get_or_create(
                producto=prod,
                cantidad=cant,
                precio_unitario=Decimal(str(pcio_unit)),
                total=Decimal(str(cant * pcio_unit)),
                proveedor=provs.get(prov_nombre),
                usuario=user,
                observaciones=f'Entrada de prueba: {cant} {prod.nombre}',
            )
            if created_e:
                ent_creadas += 1
                # Actualizar stock
                prod.stock += cant
                prod.save()
        self.stdout.write(f'  {ent_creadas} entradas creadas')

        # 15. Salidas de producto
        sal_creadas = 0
        for prod, cant, motivo in [
            (prods['Silla Ejecutiva'], 2, 'Venta directa mostrador'),
            (prods['Cojín Decorativo'], 10, 'Pedido cliente corporativo'),
        ]:
            _, created_s = salida_producto.objects.get_or_create(
                id_producto=prod,
                cantidad=cant,
                fecha=date.today() - timedelta(days=random.randint(1, 10)),
                defaults={
                    'motivo': motivo,
                    'responsable': 'Almacén Pruebas',
                },
            )
            if created_s:
                sal_creadas += 1
        self.stdout.write(f'  {sal_creadas} salidas creadas')

        # 16. Calendario
        cal_creados = 0
        for titulo, cat, days_ahead in [
            ('Reunión producción semanal', 'produccion', 1),
            ('Inventario general bodega', 'inventario', 3),
            ('Entrega pedido cliente especial', 'logistica', 5),
            ('Revisión de nómina', 'admin', 2),
        ]:
            _, created_cal = calendario.objects.get_or_create(
                titulo=titulo,
                fecha=date.today() + timedelta(days=days_ahead),
                defaults={
                    'hora': '09:00:00',
                    'categoria': cat,
                    'descripcion': f'Evento de prueba: {titulo}',
                },
            )
            if created_cal:
                cal_creados += 1
        self.stdout.write(f'  {cal_creados} eventos de calendario creados')

        # 17. Respaldo
        if not respaldo.objects.exists():
            respaldo.objects.create(
                usuario='admin',
                tipo_respaldo='completo',
                descripcion='Respaldo de prueba generado por seed',
                archivo='respaldos_sql/seed_dummy.txt',
            )
            self.stdout.write('  1 respaldo creado')

        # 18. Reporte
        if not reporte.objects.exists():
            reporte.objects.create(tipo='inventario', usuario=user)
            self.stdout.write('  1 reporte creado')

        # 19. Notificaciones
        notifs_creadas = 0
        for tipo, titulo, mensaje in [
            ('bajo_stock_producto', 'Stock bajo', 'Quedan pocas unidades de Cojín Decorativo'),
            ('calendario_hoy', 'Evento hoy', 'Tienes reunión de producción programada'),
            ('mantenimiento_nueva', 'Nuevo mantenimiento', 'Se registró un mantenimiento pendiente'),
        ]:
            _, created_n = Notificacion.objects.get_or_create(
                tipo=tipo,
                titulo=titulo,
                user=user,
                defaults={'mensaje': mensaje},
            )
            if created_n:
                notifs_creadas += 1
        self.stdout.write(f'  {notifs_creadas} notificaciones creadas')

        self.stdout.write(self.style.SUCCESS('\nSeed completado exitosamente.'))
