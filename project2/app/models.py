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
class compra(models.Model): #Clase compra
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
class BOM(models.Model): #Clase bills of materials
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