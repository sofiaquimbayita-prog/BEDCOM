from django.db import models #Librerias
class proveedor (models.Model): #Clase Proveedor
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=10)
    direccion = models.CharField(max_length=200)
    estado = models.BooleanField(default=True)
    def __str__(self):
        return self.nombre
    class Meta:
        verbose_name = "proveedor"
        verbose_name_plural = "proveedores"
        db_table = "proveedor"
class compra(models.Model): #Clase Compra
    fecha_suministro = models.DateField()
    cantidad = models.IntegerField()
    id_proveedor = models.ForeignKey('proveedor', on_delete=models.CASCADE)
    id_insumo = models.ForeignKey('insumo', on_delete=models.CASCADE)
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "proveedor_insumo"
        verbose_name_plural = "proveedores_insumos"
        db_table = "proveedor_insumo"
        unique_together = ('id_proveedor', 'id_insumo')
class BOM(models.Model): #Clase Bills of materials
    cantidad = models.IntegerField()
    unidad_medida = models.CharField(max_length=50)
    id_producto = models.ForeignKey('producto', on_delete=models.CASCADE)
    id_insumo = models.ForeignKey('insumo', on_delete=models.CASCADE)
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "producto_insumo"
        verbose_name_plural = "productos_insumos"
        db_table = "producto_insumo"
        unique_together = ('id_producto', 'id_insumo')
class despacho(models.Model): #clase Despacho
    fecha = models.DateField()
    estado_entrega = models.CharField(max_length=50)
    id_pedido = models.ForeignKey('pedido', on_delete=models.CASCADE)
    id_supervision = models.ForeignKey('supervision', on_delete=models.CASCADE)
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "despacho"
        verbose_name_plural = "despachos"
        db_table = "despacho"
#Juan benitez
class usuario (models.Model): 
    cedula = models.CharField(max_length=20, unique=True)
    nombre_usuar = models.CharField(max_length=50)
    rol = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)
    def __str__(self):
        return self.nombre_usuario
    class Meta:
        verbose_name = "proveedor"
        verbose_name_plural = "proveedores"
        db_table = "proveedor"
class compra(models.Model): #Clase Compra
    fecha_suministro = models.DateField()
    cantidad = models.IntegerField()
    id_proveedor = models.ForeignKey('proveedor', on_delete=models.CASCADE)
    id_insumo = models.ForeignKey('insumo', on_delete=models.CASCADE)
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "supervision"
        verbose_name_plural = "supervisiones"
        db_table = "supervision"
class reporte(models.Model):
    tipo = models.CharField(max_length=100)
    fecha = models.DateField()
    id_usuario = models.ForeignKey('usuario', on_delete=models.CASCADE)
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "reporte"
        verbose_name_plural = "reportes"
        db_table = "reporte"
class mantenimiento(models.Model):
    fecha = models.DateField()
    descripcion = models.TextField()
    id_garantia = models.ForeignKey('reporte', on_delete=models.CASCADE)
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "mantenimiento"
        verbose_name_plural = "mantenimientos"
        db_table = "mantenimiento"
   
  
 
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

        
        
        
        
        
        
        
class Insumo(models.Model):
    nombre = models.CharField(max_length=100)
    cantidad = models.IntegerField()
    unidad_medida = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)
    id_categoria = models.ForeignKey('categoria', on_delete=models.CASCADE)
    def __str__(self):
        return self.nombre
    class Meta:
        verbose_name = "Insumo"
        verbose_name_plural = "Insumos" 
        
class detalle_pedido(models.Model):
    cantidad = models.IntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2)
    id_pedido = models.ForeignKey('pedido', on_delete=models.CASCADE)
    id_producto = models.ForeignKey('Insumo', on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.cantidad} de {self.insumo.nombre}"
    class Meta:
        verbose_name = "Detalle de Pedido"
        verbose_name_plural = "Detalles de Pedidos"
        
class pedido (models.Model):
    nombre = models.CharField(max_length=100)
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    id_cliente = models.ForeignKey('cliente', on_delete=models.CASCADE)
    id_pedido = models.ForeignKey('detalle_pedido', on_delete=models.CASCADE)
    id_reportes = models.ForeignKey('reportes', on_delete=models.CASCADE)
    def __str__(self):
        return f"Pedido #{self.id} - {self.fecha.strftime('%Y-%m-%d')}"
    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        
        
        
        
        
        
        
        
        