
































































































































































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
        
        