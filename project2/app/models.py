from django.db import models

# --- MODELOS BASE ---

class categoria(models.Model):
    TIPO_PRODUCTO = 'producto'
    TIPO_INSUMO = 'insumo'
    TIPO_CHOICES = [
        (TIPO_PRODUCTO, 'Producto'),
        (TIPO_INSUMO, 'Insumo'),
    ]
    
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default=TIPO_PRODUCTO)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        db_table = "categorias"

#rama sofia
class proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15) # Aumentado por si incluyen indicativos
    direccion = models.CharField(max_length=200)
    imagen = models.ImageField(upload_to='proveedores/', null=True, blank=True)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        db_table = "proveedor"

class respaldo(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    usuario = models.CharField(max_length=100)
    tipo_respaldo = models.CharField(max_length=20)
    descripcion = models.TextField(blank=True, null=True)
    archivo = models.FileField(upload_to='respaldos_sql/') 
    estado = models.BooleanField(default=True)

    def __str__(self):
        return f"Respaldo {self.fecha}"

    class Meta:
        verbose_name = "Respaldo"
        verbose_name_plural = "Respaldos"
        db_table = "respaldos"
        ordering = ['-fecha']

class cliente(models.Model):
    cedula = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    direccion = models.CharField(max_length=200)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        db_table = "clientes"

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UsuarioManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', 'Administrador')
        extra_fields.setdefault('estado', 'Activo')
        
        if 'cedula' not in extra_fields:
            extra_fields.setdefault('cedula', '00000000')

        return self.create_user(email, username, password, **extra_fields)

class usuario(AbstractUser):
    # Campos personalizados
    cedula = models.CharField(max_length=20, unique=True)
    rol = models.CharField(max_length=20)
    estado = models.CharField(max_length=20, default='Activo')
    foto_perfil = models.ImageField(upload_to='usuarios/fotos/', null=True, blank=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(max_length=100, unique=True)

    objects = UsuarioManager()

    # Esto soluciona choques con los modelos internos de Django
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='usuario_set',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='usuario_permissions_set',
        blank=True,
    )

    REQUIRED_FIELDS = ['email', 'cedula', 'rol'] 

    class Meta:
        db_table = "usuarios"

    def __str__(self):
        return self.username

# --- MODELOS DE PRODUCTOS Y REPORTES ---

class reporte(models.Model):
    tipo = models.CharField(max_length=100)
    fecha = models.DateField(auto_now_add=True)
    usuario = models.ForeignKey(usuario, on_delete=models.CASCADE)

    def __str__(self):
        return f"reporte {self.tipo} - {self.fecha}"

    class Meta:
        verbose_name = "Reporte"
        verbose_name_plural = "Reportes"
        db_table = "reporte"

class producto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)
    estado = models.BooleanField(default=True)
    categoria = models.ForeignKey(categoria, on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        db_table = "productos"


# --- MODELO DE ENTRADA DE PRODUCTOS ---
class entrada(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    producto = models.ForeignKey(producto, on_delete=models.CASCADE, related_name='entradas')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    proveedor = models.ForeignKey(proveedor, on_delete=models.CASCADE, related_name='entradas', null=True, blank=True)
    usuario = models.ForeignKey(usuario, on_delete=models.CASCADE, related_name='entradas', null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)
    estado = models.BooleanField(default=True)
    anulado = models.BooleanField(default=False, verbose_name="Anulado")

    def __str__(self):
        return f"Entrada #{self.id} - {self.producto.nombre} - {self.fecha}"

    class Meta:
        verbose_name = "Entrada de Producto"
        verbose_name_plural = "Entradas de Productos"
        db_table = "entrada"
        ordering = ['-fecha']


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
# --- MODELOS DE INSUMOS Y PRODUCCIÓN (BOM) ---

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

class bom(models.Model):
    cantidad = models.IntegerField()
    unidad_medida = models.CharField(max_length=50)
    producto = models.ForeignKey(producto, on_delete=models.CASCADE)
    insumo = models.ForeignKey(insumo, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "bom (Estructura de Producto)"
        verbose_name_plural = "boms"
        db_table = "producto_insumo"
        unique_together = ('producto', 'insumo')

# --- MODELOS DE COMPRAS Y VENTAS ---

class compra(models.Model):
    fecha_suministro = models.DateField()
    cantidad = models.IntegerField()
    precio_unidad = models.DecimalField(max_digits=12, decimal_places=2, default=0) # CAMBIO AQUÍ
    proveedor = models.ForeignKey(proveedor, on_delete=models.CASCADE)
    insumo = models.ForeignKey(insumo, on_delete=models.CASCADE)

    def __str__(self):
        return f"Compra {self.insumo.nombre} - {self.fecha_suministro}"

    class Meta:
        db_table = "proveedor_insumo"
        unique_together = ('proveedor', 'insumo')

class pedido(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default="Pendiente")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cliente = models.ForeignKey(cliente, on_delete=models.CASCADE)

    def __str__(self):
        return f"pedido #{self.id} - {self.cliente.nombre}"

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        db_table = "pedido"

class detalle_pedido(models.Model):
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2)
    pedido = models.ForeignKey(pedido, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(producto, on_delete=models.CASCADE)

    class Meta:
        db_table = "detalle_pedido"

class pago(models.Model):
    pedido = models.ForeignKey(pedido, on_delete=models.CASCADE)
    fecha_pago = models.DateField(auto_now_add=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.BooleanField(default=True)

    class Meta:
        db_table = "pagos"

class supervision(models.Model): 
    fecha = models.DateField(auto_now_add=True)
    descripcion = models.TextField()
    usuario = models.ForeignKey(usuario, on_delete=models.CASCADE)

    def __str__(self):
        return f"supervisión del {self.fecha} por {self.usuario.username}"

    class Meta:
        verbose_name = "Supervisión"
        verbose_name_plural = "Supervisiones"
        db_table = "supervision"

class despacho(models.Model): 
    fecha = models.DateField()
    estado_entrega = models.CharField(max_length=50, default="En proceso")
    pedido = models.ForeignKey(pedido, on_delete=models.CASCADE, related_name='despachos')
    supervision = models.ForeignKey(supervision, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"despacho pedido #{self.pedido.id} - estado: {self.estado_entrega}"

    class Meta:
        verbose_name = "Despacho"
        verbose_name_plural = "Despachos"
        db_table = "despacho"
# --- MODELOS DE CALENDARIO ---

class CategoriaEvento(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#3498db')
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


# --- MODELO DE SALIDA DE PRODUCTOS ---
class salida_producto(models.Model):
    id_producto = models.ForeignKey(producto, on_delete=models.CASCADE, related_name='salidas')
    cantidad = models.IntegerField()
    fecha = models.DateField()
    motivo = models.TextField()
    responsable = models.CharField(max_length=100)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return f"Salida #{self.id} - {self.id_producto.nombre} - {self.fecha}"

    class Meta:
        verbose_name = "Salida de Producto"
        verbose_name_plural = "Salidas de Productos"
        db_table = "salida_producto"
        ordering = ['-fecha']
