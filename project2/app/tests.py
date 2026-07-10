from django.test import TestCase

"""
Pruebas unitarias para los modelos de la app.

Ejecutar con:
    python manage.py test app
(ajusta "app" al nombre real de tu aplicación si es distinto)
"""

from decimal import Decimal
from datetime import date, timedelta

from django.core.cache import cache
from django.test import TestCase

from .models import (
    categoria,
    proveedor,
    respaldo,
    cliente,
    usuario,
    reporte,
    producto,
    entrada,
    mantenimiento,
    insumo,
    bom,
    compra,
    pedido,
    detalle_pedido,
    pago,
    supervision,
    despacho,
    calendario,
    salida_producto,
    Notificacion,
)


class CategoriaModelTest(TestCase):
    def setUp(self):
        self.categoria = categoria.objects.create(
            nombre="Panadería",
            descripcion="Productos de panadería",
            tipo=categoria.TIPO_PRODUCTO,
        )

    def test_str(self):
        self.assertEqual(str(self.categoria), "Panadería")

    def test_defaults(self):
        self.assertTrue(self.categoria.estado)
        self.assertEqual(self.categoria.tipo, categoria.TIPO_PRODUCTO)

    def test_nombre_unico(self):
        with self.assertRaises(Exception):
            categoria.objects.create(
                nombre="Panadería",
                descripcion="Duplicado",
            )


class ProveedorModelTest(TestCase):
    def setUp(self):
        self.proveedor = proveedor.objects.create(
            nombre="Distribuidora ABC",
            telefono="3001234567",
            direccion="Calle 123",
        )

    def test_str(self):
        self.assertEqual(str(self.proveedor), "Distribuidora ABC")

    def test_estado_default(self):
        self.assertTrue(self.proveedor.estado)


class ClienteModelTest(TestCase):
    def setUp(self):
        self.cliente = cliente.objects.create(
            nombre="Juan Pérez",
            telefono="3009876543",
            direccion="Carrera 45",
            email="juan@example.com",
        )

    def test_str(self):
        self.assertEqual(str(self.cliente), "Juan Pérez")

    def test_es_especial_default_false(self):
        self.assertFalse(self.cliente.es_especial)


class UsuarioModelTest(TestCase):
    def test_create_user(self):
        user = usuario.objects.create_user(
            email="user@example.com",
            username="user1",
            password="clave12345",
            cedula="123456789",
            rol="Vendedor",
        )
        self.assertEqual(user.email, "user@example.com")
        self.assertTrue(user.check_password("clave12345"))
        self.assertEqual(user.estado, "Activo")

    def test_create_user_sin_email(self):
        with self.assertRaises(ValueError):
            usuario.objects.create_user(
                email=None,
                username="user2",
                password="clave12345",
                cedula="987654321",
                rol="Vendedor",
            )

    def test_create_superuser(self):
        admin = usuario.objects.create_superuser(
            email="admin@example.com",
            username="admin",
            password="clave12345",
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertEqual(admin.rol, "Administrador")
        self.assertEqual(admin.cedula, "00000000")

    def test_str(self):
        user = usuario.objects.create_user(
            email="user3@example.com",
            username="user3",
            password="clave12345",
            cedula="111111111",
            rol="Vendedor",
        )
        self.assertEqual(str(user), "user3")


class ProductoModelTest(TestCase):
    def setUp(self):
        self.categoria = categoria.objects.create(
            nombre="Pasteles", descripcion="Categoría de pasteles"
        )
        self.insumo = insumo.objects.create(
            nombre="Harina",
            cantidad=100,
            unidad_medida="kg",
            precio=Decimal("2.50"),
            estado="Activo",
            id_categoria=categoria.objects.create(
                nombre="Insumos", descripcion="Insumos varios", tipo=categoria.TIPO_INSUMO
            ),
            id_proveedor=proveedor.objects.create(
                nombre="Proveedor Insumos", telefono="3001112233", direccion="Zona Industrial"
            ),
        )
        self.producto = producto.objects.create(
            nombre="Torta de chocolate",
            descripcion="Deliciosa torta",
            precio=Decimal("25000"),
            stock=10,
            categoria=self.categoria,
        )

    def tearDown(self):
        cache.clear()

    def test_str(self):
        self.assertEqual(str(self.producto), "Torta de chocolate")

    def test_tiene_receta_sin_bom(self):
        self.assertFalse(self.producto.tiene_receta())

    def test_tiene_receta_con_bom(self):
        bom.objects.create(
            cantidad=2,
            unidad_medida="kg",
            producto=self.producto,
            insumo=self.insumo,
        )
        # Se limpia el caché por la señal post_save
        self.assertTrue(self.producto.tiene_receta())

    def test_cache_se_invalida_al_eliminar_bom(self):
        receta = bom.objects.create(
            cantidad=1,
            unidad_medida="kg",
            producto=self.producto,
            insumo=self.insumo,
        )
        self.assertTrue(self.producto.tiene_receta())
        receta.delete()
        self.assertFalse(self.producto.tiene_receta())

    def test_limpiar_cache_receta(self):
        cache_key = f"producto_receta_{self.producto.pk}"
        cache.set(cache_key, True, 300)
        self.producto.limpiar_cache_receta()
        self.assertIsNone(cache.get(cache_key))


class EntradaModelTest(TestCase):
    def setUp(self):
        self.categoria = categoria.objects.create(nombre="Bebidas", descripcion="Bebidas varias")
        self.producto = producto.objects.create(
            nombre="Jugo natural",
            precio=Decimal("5000"),
            stock=20,
            categoria=self.categoria,
        )
        self.proveedor = proveedor.objects.create(
            nombre="Frutas del Valle", telefono="3005556677", direccion="Vereda El Rosal"
        )

    def test_str(self):
        entrada_obj = entrada.objects.create(
            producto=self.producto,
            cantidad=15,
            precio_unitario=Decimal("3000"),
            total=Decimal("45000"),
            proveedor=self.proveedor,
        )
        self.assertIn("Entrada #", str(entrada_obj))
        self.assertIn(self.producto.nombre, str(entrada_obj))

    def test_anulado_default_false(self):
        entrada_obj = entrada.objects.create(
            producto=self.producto,
            cantidad=5,
            precio_unitario=Decimal("1000"),
            total=Decimal("5000"),
        )
        self.assertFalse(entrada_obj.anulado)


class MantenimientoModelTest(TestCase):
    def setUp(self):
        self.categoria = categoria.objects.create(nombre="Equipos", descripcion="Equipos varios")
        self.producto = producto.objects.create(
            nombre="Batidora",
            precio=Decimal("150000"),
            stock=3,
            categoria=self.categoria,
        )

    def test_str_con_producto(self):
        m = mantenimiento.objects.create(
            producto=self.producto,
            descripcion_falla="No enciende",
        )
        self.assertIn(self.producto.nombre, str(m))

    def test_str_sin_producto(self):
        m = mantenimiento.objects.create(descripcion_falla="Falla desconocida")
        self.assertIn("Sin producto", str(m))

    def test_estado_reparacion_default(self):
        m = mantenimiento.objects.create(producto=self.producto)
        self.assertEqual(m.estado_reparacion, "recibida")


class InsumoModelTest(TestCase):
    def setUp(self):
        self.categoria = categoria.objects.create(
            nombre="Materias primas", descripcion="Insumos base", tipo=categoria.TIPO_INSUMO
        )
        self.proveedor = proveedor.objects.create(
            nombre="Insumos SA", telefono="3007778899", direccion="Parque Industrial"
        )

    def test_str(self):
        i = insumo.objects.create(
            nombre="Azúcar",
            cantidad=50,
            unidad_medida="kg",
            precio=Decimal("1.80"),
            estado="Activo",
            id_categoria=self.categoria,
            id_proveedor=self.proveedor,
        )
        self.assertEqual(str(i), "Azúcar")


class BomModelTest(TestCase):
    def setUp(self):
        self.categoria_prod = categoria.objects.create(nombre="Panes", descripcion="Panes varios")
        self.categoria_ins = categoria.objects.create(
            nombre="Ingredientes", descripcion="Ingredientes base", tipo=categoria.TIPO_INSUMO
        )
        self.proveedor = proveedor.objects.create(
            nombre="Molinos XYZ", telefono="3001239876", direccion="Km 5 vía principal"
        )
        self.producto = producto.objects.create(
            nombre="Pan francés",
            precio=Decimal("2000"),
            stock=30,
            categoria=self.categoria_prod,
        )
        self.insumo = insumo.objects.create(
            nombre="Harina de trigo",
            cantidad=200,
            unidad_medida="kg",
            precio=Decimal("2.20"),
            estado="Activo",
            id_categoria=self.categoria_ins,
            id_proveedor=self.proveedor,
        )

    def test_unique_together(self):
        bom.objects.create(
            cantidad=1, unidad_medida="kg", producto=self.producto, insumo=self.insumo
        )
        with self.assertRaises(Exception):
            bom.objects.create(
                cantidad=2, unidad_medida="kg", producto=self.producto, insumo=self.insumo
            )


class CompraModelTest(TestCase):
    def setUp(self):
        self.categoria = categoria.objects.create(
            nombre="Suministros", descripcion="Suministros varios", tipo=categoria.TIPO_INSUMO
        )
        self.proveedor = proveedor.objects.create(
            nombre="Proveedor Central", telefono="3002223344", direccion="Av. Principal"
        )
        self.insumo = insumo.objects.create(
            nombre="Levadura",
            cantidad=30,
            unidad_medida="kg",
            precio=Decimal("5.00"),
            estado="Activo",
            id_categoria=self.categoria,
            id_proveedor=self.proveedor,
        )

    def test_str(self):
        c = compra.objects.create(
            fecha_suministro=date.today(),
            cantidad=10,
            precio_unidad=Decimal("5.00"),
            proveedor=self.proveedor,
            insumo=self.insumo,
        )
        self.assertIn("Compra", str(c))
        self.assertIn(self.insumo.nombre, str(c))


class PedidoModelTest(TestCase):
    def setUp(self):
        self.cliente = cliente.objects.create(
            nombre="María López", telefono="3011122233", direccion="Calle 10"
        )
        self.pedido = pedido.objects.create(
            cliente=self.cliente,
            total=Decimal("100000"),
            abono=Decimal("40000"),
        )

    def test_str(self):
        self.assertIn(f"#{self.pedido.id}", str(self.pedido))
        self.assertIn("María López", str(self.pedido))

    def test_saldo_pendiente(self):
        self.assertEqual(self.pedido.saldo_pendiente, Decimal("60000"))

    def test_total_formateado(self):
        self.assertEqual(self.pedido.total_formateado, "100.000")

    def test_abono_formateado(self):
        self.assertEqual(self.pedido.abono_formateado, "40.000")

    def test_saldo_pendiente_formateado(self):
        self.assertEqual(self.pedido.saldo_pendiente_formateado, "60.000")

    def test_estado_default(self):
        p = pedido.objects.create(cliente=self.cliente)
        self.assertEqual(p.estado, "Pendiente")


class DetallePedidoModelTest(TestCase):
    def setUp(self):
        self.categoria = categoria.objects.create(nombre="Postres", descripcion="Postres varios")
        self.cliente = cliente.objects.create(
            nombre="Carlos Ruiz", telefono="3022223344", direccion="Carrera 8"
        )
        self.producto = producto.objects.create(
            nombre="Cheesecake",
            precio=Decimal("30000"),
            stock=5,
            categoria=self.categoria,
        )
        self.pedido = pedido.objects.create(cliente=self.cliente, total=Decimal("30000"))

    def test_creacion_detalle(self):
        detalle = detalle_pedido.objects.create(
            cantidad=1,
            precio_unitario=Decimal("30000"),
            sub_total=Decimal("30000"),
            pedido=self.pedido,
            producto=self.producto,
        )
        self.assertEqual(detalle.pedido, self.pedido)
        self.assertFalse(detalle.es_personalizado)

    def test_detalle_personalizado_sin_producto(self):
        detalle = detalle_pedido.objects.create(
            cantidad=1,
            precio_unitario=Decimal("50000"),
            sub_total=Decimal("50000"),
            pedido=self.pedido,
            es_personalizado=True,
            especificaciones="Torta especial de cumpleaños",
        )
        self.assertIsNone(detalle.producto)
        self.assertTrue(detalle.es_personalizado)


class PagoModelTest(TestCase):
    def setUp(self):
        self.cliente = cliente.objects.create(
            nombre="Ana Gómez", telefono="3033334455", direccion="Diagonal 20"
        )
        self.pedido = pedido.objects.create(cliente=self.cliente, total=Decimal("80000"))

    def test_creacion_pago(self):
        p = pago.objects.create(pedido=self.pedido, monto=Decimal("80000"))
        self.assertTrue(p.estado)
        self.assertEqual(p.pedido, self.pedido)


class SupervisionModelTest(TestCase):
    def setUp(self):
        self.user = usuario.objects.create_user(
            email="supervisor@example.com",
            username="supervisor1",
            password="clave12345",
            cedula="222333444",
            rol="Supervisor",
        )

    def test_str(self):
        s = supervision.objects.create(
            descripcion="Revisión general de inventario", usuario=self.user
        )
        self.assertIn("supervisión del", str(s))
        self.assertIn(self.user.username, str(s))


class DespachoModelTest(TestCase):
    def setUp(self):
        self.cliente = cliente.objects.create(
            nombre="Pedro Sánchez",
            telefono="3044445566",
            direccion="Calle 50",
        )
        self.pedido = pedido.objects.create(
            cliente=self.cliente, total=Decimal("60000"), estado="Pendiente"
        )

    def test_copia_datos_cliente_al_crear(self):
        d = despacho.objects.create(pedido=self.pedido)
        self.assertEqual(d.direccion_entrega, self.cliente.direccion)
        self.assertEqual(d.telefono_contacto, self.cliente.telefono)

    def test_str(self):
        d = despacho.objects.create(pedido=self.pedido)
        self.assertIn(f"Despacho #{d.id}", str(d))
        self.assertIn(f"Pedido #{self.pedido.id}", str(d))

    def test_puede_transitar_a_siempre_true(self):
        d = despacho.objects.create(pedido=self.pedido)
        self.assertTrue(d.puede_transitar_a("entregado"))

    def test_estado_default(self):
        d = despacho.objects.create(pedido=self.pedido)
        self.assertEqual(d.estado, despacho.PENDIENTE)


class CalendarioModelTest(TestCase):
    def test_str(self):
        evento = calendario.objects.create(
            titulo="Entrega de pedido",
            fecha=date.today() + timedelta(days=1),
            hora="10:00",
        )
        self.assertEqual(str(evento), "Entrega de pedido")

    def test_defaults(self):
        evento = calendario.objects.create(
            titulo="Revisión de inventario",
            fecha=date.today(),
            hora="08:00",
        )
        self.assertEqual(evento.estado, calendario.ESTADO_PENDIENTE)
        self.assertEqual(evento.modo_completado, calendario.MODO_AUTOMATICO)
        self.assertEqual(evento.categoria, calendario.CategoriaCalendario.PRODUCCION)


class SalidaProductoModelTest(TestCase):
    def setUp(self):
        self.categoria = categoria.objects.create(nombre="Snacks", descripcion="Snacks varios")
        self.producto = producto.objects.create(
            nombre="Galletas",
            precio=Decimal("3000"),
            stock=40,
            categoria=self.categoria,
        )

    def test_str(self):
        salida = salida_producto.objects.create(
            id_producto=self.producto,
            cantidad=5,
            fecha=date.today(),
            motivo="Producto vencido",
            responsable="Bodega",
        )
        self.assertIn("Salida #", str(salida))
        self.assertIn(self.producto.nombre, str(salida))


class NotificacionModelTest(TestCase):
    def setUp(self):
        self.user = usuario.objects.create_user(
            email="notif@example.com",
            username="notifuser",
            password="clave12345",
            cedula="555666777",
            rol="Vendedor",
        )
        self.categoria = categoria.objects.create(nombre="Lácteos", descripcion="Lácteos varios")
        self.producto = producto.objects.create(
            nombre="Queso campesino",
            precio=Decimal("8000"),
            stock=2,
            categoria=self.categoria,
        )

    def test_str(self):
        n = Notificacion.objects.create(
            tipo="bajo_stock_producto",
            titulo="Stock bajo",
            mensaje="El producto está por agotarse",
            user=self.user,
            target_id=self.producto.id,
        )
        self.assertIn("Stock bajo", str(n))
        self.assertIn(self.user.username, str(n))

    def test_leida_default_false(self):
        n = Notificacion.objects.create(
            tipo="reporte_generado",
            titulo="Reporte listo",
            mensaje="Se generó el reporte mensual",
            user=self.user,
        )
        self.assertFalse(n.leida)

    def test_relacionada_bajo_stock_producto(self):
        n = Notificacion.objects.create(
            tipo="bajo_stock_producto",
            titulo="Stock bajo",
            mensaje="Queda poco stock",
            user=self.user,
            target_id=self.producto.id,
        )
        self.assertEqual(n.relacionada, self.producto)

    def test_relacionada_sin_target_id(self):
        n = Notificacion.objects.create(
            tipo="reporte_generado",
            titulo="Reporte listo",
            mensaje="Se generó el reporte mensual",
            user=self.user,
        )
        self.assertIsNone(n.relacionada)


class ReporteModelTest(TestCase):
    def setUp(self):
        self.user = usuario.objects.create_user(
            email="reporte@example.com",
            username="reporteuser",
            password="clave12345",
            cedula="888999000",
            rol="Administrador",
        )

    def test_str(self):
        r = reporte.objects.create(tipo="Ventas", usuario=self.user)
        self.assertIn("reporte Ventas", str(r))


class RespaldoModelTest(TestCase):
    def test_str(self):
        r = respaldo.objects.create(
            usuario="admin",
            tipo_respaldo="Completo",
            archivo="respaldos_sql/backup_test.sql",
        )
        self.assertIn("Respaldo", str(r))
        self.assertTrue(r.estado)
