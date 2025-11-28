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
