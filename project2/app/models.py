




























































































class cliente (models.Model):
    cedula = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    direccion = models.CharField(max_length=200)
    estado = models.BooleanField(default=True)
    def __str__(self):
        return self.nombre
    class Meta :
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        db_table = "clientes"
class producto (models.Model):
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock= models.IntegerField()
    estado = models.BooleanField(default=True)
    id_cat = models.ForeignKey('categoria', on_delete=models.CASCADE)   
    id_reporte = models.ForeignKey('reporte', on_delete=models.CASCADE)
    def __str__(self):
        return self.nombre
    class Meta :
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        db_table = "productos"
class categoria (models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    estado = models.BooleanField(default=True)
    def __str__(self):
        return self.nombre
    class Meta :
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        db_table = "categorias"
class garantia (models.Model):
    fecha = models.DateField()
    descripcion = models.TextField()
    estado = models.BooleanField(default=True)
    id_producto = models.ForeignKey('producto', on_delete=models.CASCADE)
    def __str__(self):
        return f"Garantia de {self.duracion_meses} meses"
    class Meta :
        verbose_name = "Garantia"
        verbose_name_plural = "Garantias"
        db_table = "garantias"
class pago (models.Model):
    id_pedido = models.ForeignKey('pedido', on_delete=models.CASCADE)
    fecha_pago = models.DateField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.BooleanField(default=True)
    id_pedido = models.ForeignKey('pedido', on_delete=models.CASCADE)
    id_reporte = models.ForeignKey('reporte', on_delete=models.CASCADE)
    def __str__(self):
        return f"Pago de {self.monto} el {self.fecha_pago}"
    class Meta :
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"
        db_table = "pagos"