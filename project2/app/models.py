from django.db import models















































#juan benitez
class usuario (models.Model): 
    cedula = models.CharField(max_length=20, unique=True)
    nombre_usuar = models.CharField(max_length=50)
    rol = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)
    def __str__(self):
        return self.nombre_usuario
    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        db_table = "usuario"
class supervision(models.Model): 
    fecha = models.DateField()
    observacion= models.TextField()
    aprobado = models.BooleanField()
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
