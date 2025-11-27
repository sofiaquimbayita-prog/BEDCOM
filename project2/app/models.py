from django.db import models #Librerias
class proveedor (models.Model): #Clase Proveedor
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=10)
    def __str__(self):
        return self.nombre
    class Meta:
        verbose_name = "proveedor"
        verbose_name_plural = "proveedores"
        db_table = "proveedor"
class proveedor_insumo(models.Model): #Clase Proveedor_Insumo
    id_proveedor = models.ForeignKey('proveedor', on_delete=models.CASCADE)
    id_insumo = models.ForeignKey('insumo', on_delete=models.CASCADE)
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "proveedor_insumo"
        verbose_name_plural = "proveedores_insumos"
        db_table = "proveedor_insumo"
        unique_together = ('id_proveedor', 'id_insumo')
class producto_insumo(models.Model): #Clase Producto_Insumo
    id_producto = models.ForeignKey('producto', on_delete=models.CASCADE)
    id_insumo = models.ForeignKey('insumo', on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "producto_insumo"
        verbose_name_plural = "productos_insumos"
        db_table = "producto_insumo"
        unique_together = ('id_producto', 'id_insumo')
class despacho(models.Model): #clase Despacho
    id_pedido = models.ForeignKey('pedido', on_delete=models.CASCADE)
    fecha = models.DateField()
    direccion= models.CharField(max_length=200)
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "despacho"
        verbose_name_plural = "despachos"
        db_table = "despacho"