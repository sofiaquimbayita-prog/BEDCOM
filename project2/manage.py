

































































































































































class insumo = models.Model:
    nombre = models.CharField(max_length=100)
    cantidad = models.IntegerField()
    unidad_medida = models.CharField(max_length=50)
    estado = models.CharField(max_length=50)
    id_categoria = models.ForeignKey(categoria, on_delete=models.CASCADE)
    def __str__(self):
        return self.nombre_insumo
    class Meta:
        unique_together = ('nombre', 'id_categoria') from models import models
    
class detalle_pedido = models.Model:
    cantidad = models.IntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    id_pedido = models.ForeignKey(pedido, on_delete=models.CASCADE)
    id_producto = models.ForeignKey(producto, on_delete=models.CASCADE)
    def __str__(self):
        return f"Detalle Pedido {self.id_detalle_pedido} - Pedido {self.id_pedido.id_pedido} - Insumo {self.id_insumo.nombre}"
    class Meta:
        unique_together = ('id_pedido', 'id_producto')from django.db import models
    
class pedido = models.Model:
    nombre = models.CharField(max_length=100)
    fecha = models.DateField()
    estado = models.CharField(max_length=50)
    id_cliente = models.ForeignKey(cliente, on_delete=models.CASCADE)
    id_pedido = models.ForeignKey(proveedor, on_delete=models.CASCADE)
    id_reporte = models.ForeignKey(reportes, on_delete=models.CASCADE)
    def __str__(self):
        return f"Pedido {self.id_pedido} - Proveedor {self.id_proveedor.nombre}"
    class Meta :
        unique_together = ('id_proveedor', 'id_reporte') from django.db import models