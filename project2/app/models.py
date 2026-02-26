from django.db import models

# --- MODELOS BASE ---

class categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField()
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "categoría"
        verbose_name_plural = "categorías"
        db_table = "categorias"

class proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15) # Aumentado por si incluyen indicativos
    direccion = models.CharField(max_length=200)
    imagen = models.ImageField(upload_to='proveedores/', null=True, blank=True)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "proveedor"
        verbose_name_plural = "proveedores"
        db_table = "proveedor"

class cliente(models.Model):
    cedula = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    direccion = models.CharField(max_length=200)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "cliente"
        verbose_name_plural = "clientes"
        db_table = "clientes"

class usuario(models.Model): 
    cedula = models.CharField(max_length=20, unique=True)
    nombre_usuario = models.CharField(max_length=50)
    rol = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)
    foto_perfil = models.ImageField(upload_to='usuarios/fotos/', null=True, blank=True)

    def __str__(self):
        return self.nombre_usuario

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        db_table = "usuarios"

# --- MODELOS DE PRODUCTOS Y REPORTES ---

class reporte(models.Model):
    tipo = models.CharField(max_length=100)
    fecha = models.DateField(auto_now_add=True)
    usuario = models.ForeignKey(usuario, on_delete=models.CASCADE)

    def __str__(self):
        return f"reporte {self.tipo} - {self.fecha}"

    class Meta:
        verbose_name = "reporte"
        verbose_name_plural = "reportes"
        db_table = "reporte"

class producto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)
    estado = models.BooleanField(default=True)
    categoria = models.ForeignKey(categoria, on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "producto"
        verbose_name_plural = "productos"
        db_table = "productos"

# --- MODELOS DE INSUMOS Y PRODUCCIÓN (BOM) ---

class insumo(models.Model):
    nombre = models.CharField(max_length=100)
    cantidad = models.IntegerField()
    unidad_medida = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)
    categoria = models.ForeignKey(categoria, on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "insumo"
        verbose_name_plural = "insumos"
        db_table = "insumo"

class bom(models.Model):
    cantidad = models.IntegerField()
    unidad_medida = models.CharField(max_length=50)
    producto = models.ForeignKey(producto, on_delete=models.CASCADE)
    insumo = models.ForeignKey(insumo, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "bom (Estructura de Producto)"
        verbose_name_plural = "boms"
        db_table = "producto_insumo"
        unique_together = ('producto', 'insumo')

# --- MODELOS DE COMPRAS Y VENTAS ---

class compra(models.Model):
    fecha_suministro = models.DateField()
    cantidad = models.IntegerField()
    proveedor = models.ForeignKey(proveedor, on_delete=models.CASCADE)
    insumo = models.ForeignKey(insumo, on_delete=models.CASCADE)

    class Meta:
        db_table = "proveedor_insumo"
        unique_together = ('proveedor', 'insumo')

class pedido(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default="Pendiente")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cliente = models.ForeignKey(cliente, on_delete=models.CASCADE)

    def __str__(self):
        return f"pedido #{self.id} - {self.cliente.nombre}"

    class Meta:
        verbose_name = "pedido"
        verbose_name_plural = "pedidos"
        db_table = "pedido"

class detalle_pedido(models.Model):
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2)
    pedido = models.ForeignKey(pedido, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(producto, on_delete=models.CASCADE)

    class Meta:
        db_table = "detalle_pedido"

class pago(models.Model):
    pedido = models.ForeignKey(pedido, on_delete=models.CASCADE)
    fecha_pago = models.DateField(auto_now_add=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.BooleanField(default=True)

    class Meta:
        db_table = "pagos"

class supervision(models.Model): 
    fecha = models.DateField(auto_now_add=True)
    descripcion = models.TextField()
    usuario = models.ForeignKey(usuario, on_delete=models.CASCADE)

    def __str__(self):
        return f"supervisión del {self.fecha} por {self.usuario.nombre_usuario}"

    class Meta:
        verbose_name = "supervisión"
        verbose_name_plural = "supervisiones"
        db_table = "supervision"

class despacho(models.Model): 
    fecha = models.DateField()
    estado_entrega = models.CharField(max_length=50, default="En proceso")
    pedido = models.ForeignKey(pedido, on_delete=models.CASCADE, related_name='despachos')
    supervision = models.ForeignKey(supervision, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"despacho pedido #{self.pedido.id} - estado: {self.estado_entrega}"

    class Meta:
        verbose_name = "despacho"
        verbose_name_plural = "despachos"
        db_table = "despacho"
