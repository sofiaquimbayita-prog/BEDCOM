









































#juan benitez
class usuario (models.Model): 
    nombre_usuario = models.CharField(max_length=50)
    rol = models.CharField(max_length=20)
    
    def __str__(self):
        return self.nombre_usuario
    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        db_table = "usuario"
class supervision(models.Model): 
    id_empleado = models.ForeignKey('empleado', on_delete=models.CASCADE)
    fecha = models.DateField()
    descripcion = models.TextField()
    
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "supervision"
        verbose_name_plural = "supervisiones"
        db_table = "supervision"
class reporte(models.Model):
    id_supervision = models.ForeignKey('supervision', on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha = models.DateField()
    
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "reporte"
        verbose_name_plural = "reportes"
        db_table = "reporte"
    
class mantenimiento(models.Model):

    fecha = models.DateField()
    tipo = models.CharField(max_length=50)
    descripcion = models.TextField()
    
    def __str__(self):
        return super().__str__()
    class Meta:
        verbose_name = "mantenimiento"
        verbose_name_plural = "mantenimientos"
        db_table = "mantenimiento"

































































