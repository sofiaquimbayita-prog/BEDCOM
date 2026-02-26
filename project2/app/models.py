from django.db import models #Librerias

# --- MODELOS BASE ---

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

class proveedor (models.Model): # Clase Proveedor
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=10)
    direccion = models.CharField(max_length=200)
    imagen = models.ImageField(upload_to='proveedores/', null=True, blank=True)
    estado = models.BooleanField(default=True)
    def __str__(self):
        return self.nombre
    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        db_table = "proveedor"


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
        
class usuario (models.Model): 
    cedula = models.CharField(max_length=20, unique=True)
    nombre_usuar = models.CharField(max_length=50)
    rol = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)
    def __str__(self):
        # Corregido: asumí que 'nombre_usuario' debería ser 'nombre_usuar'
        return self.nombre_usuar
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        db_table = "usuarios"# <-- CORREGIDO: Evita colisión con 'proveedor'

# --- MODELOS RELACIONADOS CON USUARIO/REPORTES ---

class reporte(models.Model):
    tipo = models.CharField(max_length=100)
    fecha = models.DateField()
    id_usuario = models.ForeignKey('usuario', on_delete=models.CASCADE)
    def __str__(self):
        return f"Reporte {self.tipo} del {self.fecha}"
    class Meta:
        verbose_name = "Reporte"
        verbose_name_plural = "Reportes"
        db_table = "reporte"

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

class garantia (models.Model):
    fecha = models.DateField()
    descripcion = models.TextField()
    estado = models.BooleanField(default=True)
    id_producto = models.ForeignKey('producto', on_delete=models.CASCADE)
    def __str__(self):
        # Corregido: El campo 'duracion_meses' no existe. Retorna info básica.
        return f"Garantia para producto {self.id_producto_id}"
    class Meta :
        verbose_name = "Garantia"
        verbose_name_plural = "Garantias"
        db_table = "garantias"

class mantenimiento(models.Model):
    fecha = models.DateField()
    descripcion = models.TextField()
    # Asumo que id_garantia debe apuntar a Garantia, no a Reporte.
    id_garantia = models.ForeignKey('garantia', on_delete=models.CASCADE) 
    def __str__(self):
        return f"Mantenimiento del {self.fecha}"
    class Meta:
        verbose_name = "Mantenimiento"
        verbose_name_plural = "Mantenimientos"
        db_table = "mantenimiento"

# --- MODELOS DE INSUMOS ---

class insumo(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    cantidad = models.IntegerField()
    unidad_medida = models.CharField(max_length=20)
    precio = models.DecimalField(max_digits=10, decimal_places=2) 
    estado = models.CharField(max_length=20)
    id_categoria = models.ForeignKey('categoria', on_delete=models.CASCADE)
    id_proveedor = models.ForeignKey('proveedor', on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre
    class Meta:
        verbose_name = "Insumo"
        verbose_name_plural = "Insumos" 
        db_table = "insumo" 
        
class compra(models.Model): #Clase Compra (Primera definición, CORRECTA)
    fecha_suministro = models.DateField()
    cantidad = models.IntegerField()
    id_proveedor_id = models.ForeignKey('proveedor', on_delete=models.CASCADE)
    id_insumo = models.ForeignKey('insumo', on_delete=models.CASCADE)
    def __str__(self):
        return f"Compra de {self.cantidad} unidades"
    class Meta:
        verbose_name = "Proveedor Insumo (Compra)"
        verbose_name_plural = "Proveedores Insumos (Compras)"
        db_table = "proveedor_insumo"
        unique_together = ('id_proveedor_id', 'id_insumo')
        
class supervision(models.Model): 
    fecha = models.DateField()
    descripcion = models.TextField() # Campo agregado para dar sentido a la supervisión
    id_usuario = models.ForeignKey('usuario', on_delete=models.CASCADE) # Quién supervisa
    def __str__(self):
        return f"Supervisión del {self.fecha}"
    class Meta:
        verbose_name = "Supervision"
        verbose_name_plural = "Supervisiones"
        db_table = "supervision"

class BOM(models.Model): #Clase Bills of materials
    cantidad = models.IntegerField()
    unidad_medida = models.CharField(max_length=50)
    id_producto = models.ForeignKey('producto', on_delete=models.CASCADE)
    id_insumo = models.ForeignKey('insumo', on_delete=models.CASCADE)
    def __str__(self):
        return f"BOM - Producto: {self.id_producto_id}, Insumo: {self.id_insumo_id}"
    class Meta:
        verbose_name = "Producto Insumo (BOM)"
        verbose_name_plural = "Productos Insumos (BOM)"
        db_table = "producto_insumo"
        unique_together = ('id_producto', 'id_insumo')

# --- MODELOS DE PEDIDO Y DESPACHO ---

class pedido (models.Model):
    nombre = models.CharField(max_length=100)
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    id_cliente = models.ForeignKey('cliente', on_delete=models.CASCADE)
    # Eliminada la FK 'id_pedido' a detalle_pedido (Relación 1:N no se define así)
    # CORREGIDO: id_reportes apuntaba a 'reportes', ahora a 'reporte'
    id_reporte = models.ForeignKey('reporte', on_delete=models.CASCADE) 
    def __str__(self):
        return f"Pedido #{self.id} - {self.fecha.strftime('%Y-%m-%d')}"
    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        db_table = "pedido" # Agregado para consistencia

class detalle_pedido(models.Model):
    cantidad = models.IntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2)
    id_pedido = models.ForeignKey('pedido', on_delete=models.CASCADE)
    # CORREGIDO: Cambiado de 'Insumo' a 'producto' (basado en el nombre id_producto)
    id_producto = models.ForeignKey('producto', on_delete=models.CASCADE) 
    def __str__(self):
        # Corregido: Usar id_producto_id en lugar de self.insumo.nombre
        return f"{self.cantidad} de Producto {self.id_producto_id}"
    class Meta:
        verbose_name = "Detalle de Pedido"
        verbose_name_plural = "Detalles de Pedidos"
        db_table = "detalle_pedido" # Agregado para consistencia

class despacho(models.Model): #clase Despacho
    fecha = models.DateField()
    estado_entrega = models.CharField(max_length=50)
    id_pedido = models.ForeignKey('pedido', on_delete=models.CASCADE)
    id_supervision = models.ForeignKey('supervision', on_delete=models.CASCADE)
    def __str__(self):
        return f"Despacho del pedido {self.id_pedido_id}"
    class Meta:
        verbose_name = "Despacho"
        verbose_name_plural = "Despachos"
        db_table = "despacho"

class pago (models.Model):
    id_pedido = models.ForeignKey('pedido', on_delete=models.CASCADE)
    fecha_pago = models.DateField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.BooleanField(default=True)
    id_reporte = models.ForeignKey('reporte', on_delete=models.CASCADE)
    def __str__(self):
        return f"Pago de {self.monto} el {self.fecha_pago}"
    class Meta :
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"
        db_table = "pagos"

# --- MODELOS DE CALENDARIO ---
# Fragmento para reemplazar el modelo calendario en models.py

class CategoriaEvento(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#3498db')  # código hex
    descripcion = models.TextField(blank=True)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Categoría de Evento"
        verbose_name_plural = "Categorías de Eventos"
        db_table = "categoria_evento"


class calendario(models.Model):

    ESTADO_PENDIENTE   = 'pendiente'
    ESTADO_COMPLETADO  = 'completado'
    ESTADO_ELIMINADO   = 'eliminado'

    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE,  'Pendiente'),
        (ESTADO_COMPLETADO, 'Completado'),
        (ESTADO_ELIMINADO,  'Eliminado'),
    ]

    MODO_AUTOMATICO = 'automatico'
    MODO_MANUAL     = 'manual'

    MODO_CHOICES = [
        (MODO_AUTOMATICO, 'Automático'),
        (MODO_MANUAL,     'Manual'),
    ]

    titulo             = models.CharField(max_length=100)
    fecha              = models.DateField()
    hora               = models.TimeField()
    categoria          = models.ForeignKey(CategoriaEvento, on_delete=models.PROTECT)
    descripcion        = models.TextField(blank=True, null=True)
    modo_completado    = models.CharField(
        max_length=15,
        choices=MODO_CHOICES,
        default=MODO_AUTOMATICO,
    )
    estado             = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default=ESTADO_PENDIENTE,
    )

    def __str__(self):
        return self.titulo

    class Meta:
        verbose_name = "Evento"
        verbose_name_plural = "Eventos"
        db_table = "calendario"