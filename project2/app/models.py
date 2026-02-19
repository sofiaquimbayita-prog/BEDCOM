from django.db import models

# --- MODELOS BASE ---

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField()
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        db_table = "categorias"

class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15) # Aumentado por si incluyen indicativos
    direccion = models.CharField(max_length=200)
    imagen = models.ImageField(upload_to='proveedores/', null=True, blank=True)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        db_table = "proveedor"

class Cliente(models.Model):
    cedula = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    direccion = models.CharField(max_length=200)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        db_table = "clientes"

class Usuario(models.Model): 
    cedula = models.CharField(max_length=20, unique=True)
    nombre_usuario = models.CharField(max_length=50)
    rol = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)

    def __str__(self):
        return self.nombre_usuario

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        db_table = "usuarios"

# --- MODELOS DE PRODUCTOS Y REPORTES ---

class Reporte(models.Model):
    tipo = models.CharField(max_length=100)
    fecha = models.DateField(auto_now_add=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)

    def __str__(self):
        return f"Reporte {self.tipo} - {self.fecha}"

    class Meta:
        verbose_name = "Reporte"
        verbose_name_plural = "Reportes"
        db_table = "reporte"

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)
    estado = models.BooleanField(default=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    # Se eliminó id_reporte de aquí: el reporte consulta productos, el producto no nace de un reporte.

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        db_table = "productos"

# --- MODELOS DE INSUMOS Y PRODUCCIÓN (BOM) ---

class Insumo(models.Model):
    nombre = models.CharField(max_length=100)
    cantidad = models.IntegerField()
    unidad_medida = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Insumo"
        verbose_name_plural = "Insumos"
        db_table = "insumo"

class BOM(models.Model):
    cantidad = models.IntegerField()
    unidad_medida = models.CharField(max_length=50)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    insumo = models.ForeignKey(Insumo, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "BOM (Estructura de Producto)"
        verbose_name_plural = "BOMs"
        db_table = "producto_insumo"
        unique_together = ('producto', 'insumo')

# --- MODELOS DE COMPRAS Y VENTAS ---

class Compra(models.Model):
    fecha_suministro = models.DateField()
    cantidad = models.IntegerField()
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE)
    insumo = models.ForeignKey(Insumo, on_delete=models.CASCADE)

    class Meta:
        db_table = "proveedor_insumo"
        unique_together = ('proveedor', 'insumo')

class Pedido(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default="Pendiente")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)

    def __str__(self):
        return f"Pedido #{self.id} - {self.cliente.nombre}"

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        db_table = "pedido"

class DetallePedido(models.Model):
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2)
    pedido = models.ForeignKey(Pedido, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)

    class Meta:
        db_table = "detalle_pedido"

class Pago(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    fecha_pago = models.DateField(auto_now_add=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.BooleanField(default=True)

    class Meta:
        db_table = "pagos"
class Supervision(models.Model): 
    fecha = models.DateField(auto_now_add=True)
    descripcion = models.TextField()
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)

    def __str__(self):
        return f"Supervisión del {self.fecha} por {self.usuario.nombre_usuario}"

    class Meta:
        verbose_name = "Supervisión"
        verbose_name_plural = "Supervisiones"
        db_table = "supervision"

class Despacho(models.Model): 
    fecha = models.DateField()
    estado_entrega = models.CharField(max_length=50, default="En proceso")
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='despachos')
    supervision = models.ForeignKey(Supervision, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Despacho Pedido #{self.pedido.id} - Estado: {self.estado_entrega}"

    class Meta:
        verbose_name = "Despacho"
        verbose_name_plural = "Despachos"
        db_table = "despacho"