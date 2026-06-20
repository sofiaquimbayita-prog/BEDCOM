from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

class categoria(models.Model):
    TIPO_PRODUCTO = 'producto'
    TIPO_INSUMO = 'insumo'
    TIPO_CHOICES = [
        (TIPO_PRODUCTO, 'Producto'),
        (TIPO_INSUMO, 'Insumo'),
    ]

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField()
    tipo = models.CharField(
        max_length=20, choices=TIPO_CHOICES, default=TIPO_PRODUCTO)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        db_table = "categorias"

# rama sofia


class proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    # Aumentado por si incluyen indicativos
    telefono = models.CharField(max_length=15)

    direccion = models.CharField(max_length=200)
    descripcion = models.CharField(max_length=255, blank=True)
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
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    direccion = models.CharField(max_length=200)
    email = models.EmailField(max_length=150, blank=True, null=True)
    es_especial = models.BooleanField(default=False, verbose_name="Cliente Especial (Plazo extendido)")
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        db_table = "clientes"


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
    foto_usua = models.ImageField(upload_to='usuarios/fotos/', null=True, blank=True)
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

    def tiene_receta(self):
        """Verifica si el producto tiene receta BOM (cached)"""
        from django.core.cache import cache
        cache_key = f"producto_receta_{self.pk}"
        result = cache.get(cache_key)
        if result is None:
            result = bom.objects.filter(producto_id=self.pk).exists()
            cache.set(cache_key, result, 300)  # 5 min cache para testing rápido
        return result
        

    def has_pendidos(self):
        """True si tiene BOM O pedidos pendientes"""
        from app.models import detalle_pedido
        return (self.tiene_receta() or 
                detalle_pedido.objects.filter(producto=self, pedido__estado='Pendiente').exists())

    def limpiar_cache_receta(self):
        """Limpia cache específico del producto"""
        from django.core.cache import cache
        cache_key = f"producto_receta_{self.pk}"
        cache.delete(cache_key)



    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        db_table = "productos"



# --- MODELO DE ENTRADA DE PRODUCTOS ---
class entrada(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    producto = models.ForeignKey(
        producto, on_delete=models.CASCADE, related_name='entradas')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    proveedor = models.ForeignKey(
        proveedor, on_delete=models.CASCADE, related_name='entradas', null=True, blank=True)
    usuario = models.ForeignKey(
        usuario, on_delete=models.CASCADE, related_name='entradas', null=True, blank=True)
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


class mantenimiento(models.Model):
    ESTADO_CHOICES = [
        ('recibida', 'Recibida'),
        ('en_reparacion', 'En Reparación'),
        ('reparada', 'Reparada'),
        ('entregada', 'Entregada al cliente'),
    ]
    from django.utils.timezone import now
    fecha = models.DateField(default=now)
    pedido = models.ForeignKey('pedido', on_delete=models.CASCADE, null=True, blank=True)
    producto = models.ForeignKey('producto', on_delete=models.CASCADE, null=True, blank=True)
    descripcion_falla = models.TextField(blank=True, null=True)
    estado_reparacion = models.CharField(
        max_length=20, choices=ESTADO_CHOICES, default='recibida')
    estado = models.BooleanField(default=True)

    def __str__(self):
        nombre = self.producto.nombre if self.producto else 'Sin producto'
        return f"Mantenimiento #{self.id} - {nombre}"

    class Meta:
        verbose_name = "Mantenimiento"
        verbose_name_plural = "Mantenimientos"
        db_table = "mantenimientos"
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


@receiver([post_save, post_delete], sender=bom)
def clear_producto_receta_cache(sender, instance, **kwargs):
    try:
        if instance.producto_id:
            instance.producto.limpiar_cache_receta()
    except Exception:
        pass

# --- MODELOS DE COMPRAS Y VENTAS ---


class compra(models.Model):
    fecha_suministro = models.DateField()
    cantidad = models.IntegerField()
    precio_unidad = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)  # CAMBIO AQUÍ
    proveedor = models.ForeignKey(proveedor, on_delete=models.CASCADE)
    insumo = models.ForeignKey(insumo, on_delete=models.CASCADE)

    def __str__(self):
        return f"Compra {self.insumo.nombre} - {self.fecha_suministro}"

    class Meta:
        db_table = "proveedor_insumo"
        unique_together = ('proveedor', 'insumo')


class pedido(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    fecha_entrega = models.DateField(null=True, blank=True, verbose_name="Fecha de entrega") 
    fecha_limite_pago = models.DateField(null=True, blank=True, verbose_name="Fecha límite de pago")
    estado = models.CharField(max_length=20, default="Pendiente")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    abono = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)  # NUEVO CAMPO
    cliente = models.ForeignKey(cliente, on_delete=models.CASCADE)

    def __str__(self):
        return f"pedido #{self.id} - {self.cliente.nombre}"
    
    @property
    def saldo_pendiente(self):
        return self.total - (self.abono or 0)

    @property
    def total_formateado(self):
        return f"{self.total:,.0f}".replace(",", ".")

    @property
    def abono_formateado(self):
        return f"{self.abono or 0:,.0f}".replace(",", ".")

    @property
    def saldo_pendiente_formateado(self):
        return f"{self.saldo_pendiente:,.0f}".replace(",", ".")

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        db_table = "pedido"


class detalle_pedido(models.Model):
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2)
    pedido = models.ForeignKey(
        pedido, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(producto, on_delete=models.CASCADE, null=True, blank=True)
    es_personalizado = models.BooleanField(default=False, verbose_name="Es personalizado")
    especificaciones = models.TextField(blank=True, null=True, verbose_name="Especificaciones del cliente")
    observaciones = models.TextField(blank=True, null=True)

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
    PENDIENTE = 'pendiente'
    EN_RUTA = 'en_ruta'
    ENTREGADO = 'entregado'
    FALLIDO = 'fallido'
    
    ESTADO_CHOICES = [
        (PENDIENTE, 'Pendiente'),
        (EN_RUTA, 'En Ruta'),
        (ENTREGADO, 'Entregado'),
        (FALLIDO, 'Fallido'),
    ]
    
    pedido = models.OneToOneField(
        pedido, on_delete=models.CASCADE, related_name='despacho',
        limit_choices_to={'estado': 'Pendiente'})
    
    estado = models.CharField(
        max_length=20, choices=ESTADO_CHOICES, default=PENDIENTE)
    
    fecha_despacho = models.DateTimeField(auto_now_add=True)
    fecha_entrega_real = models.DateTimeField(null=True, blank=True)
    
    direccion_entrega = models.CharField(max_length=200)
    telefono_contacto = models.CharField(max_length=15)
    observaciones = models.TextField(blank=True, null=True)
    
    responsable = models.CharField(max_length=100, blank=True, null=True)
    empresa_transporte = models.CharField(max_length=100, blank=True, null=True, verbose_name="Transportadora")
    numero_guia = models.CharField(max_length=100, blank=True, null=True, verbose_name="Número de Guía")
    costo_envio = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    supervision = models.ForeignKey(
        supervision, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        verbose_name = "Despacho"
        verbose_name_plural = "Despachos"
        db_table = "despacho"
        ordering = ['-fecha_despacho']

    def __str__(self):
        return f"Despacho #{self.id} - Pedido #{self.pedido.id} ({self.get_estado_display()})"

    def save(self, *args, **kwargs):
        # Copiar datos del cliente al crear
        if not self.pk and not self.direccion_entrega:
            self.direccion_entrega = self.pedido.cliente.direccion
            self.telefono_contacto = self.pedido.cliente.telefono
        super().save(*args, **kwargs)

    def puede_transitar_a(self, nuevo_estado):
        # Modificado: permite cambiar a cualquier estado en cualquier momento
        return True
    
    
# --- MODELOS DEALENDARIO ---

class calendario(models.Model):

    ESTADO_PENDIENTE = 'pendiente'
    ESTADO_COMPLETADO = 'completado'
    ESTADO_ELIMINADO = 'eliminado'

    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE,  'Pendiente'),
        (ESTADO_COMPLETADO, 'Completado'),
        (ESTADO_ELIMINADO,  'Eliminado'),
    ]

    MODO_AUTOMATICO = 'automatico'
    MODO_MANUAL = 'manual'

    MODO_CHOICES = [
        (MODO_AUTOMATICO, 'Automático'),
        (MODO_MANUAL,     'Manual'),
    ]

    titulo = models.CharField(max_length=100)
    fecha = models.DateField()
    hora = models.TimeField()
    class CategoriaCalendario(models.TextChoices):
        PRODUCCION = 'produccion', 'Producción'
        LOGISTICA = 'logistica', 'Logística'
        INVENTARIO = 'inventario', 'Inventario'
        ADMIN = 'admin', 'Gestión / Administración'

    categoria = models.CharField(
        max_length=20,
        choices=CategoriaCalendario.choices,
        default=CategoriaCalendario.PRODUCCION
    )
    descripcion = models.TextField(blank=True, null=True)
    modo_completado = models.CharField(
        max_length=15,
        choices=MODO_CHOICES,
        default=MODO_AUTOMATICO,
    )
    estado = models.CharField(
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
    id_producto = models.ForeignKey(
        producto, on_delete=models.CASCADE, related_name='salidas')
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



# =====================================================
# NUEVO MODELO: NOTIFICACIONES COMPLETAS
# =====================================================
class Notificacion(models.Model):
    # Tipos específicos del requerimiento
    TIPO_CHOICES = [
        ('bajo_stock_insumo', 'Bajo stock insumo'),
        ('bajo_stock_producto', 'Bajo stock producto'),
        ('calendario_hoy', 'Evento Calendario HOY'),
        ('calendario_manaña', 'Evento Calendario MAÑANA'),
        ('pendido_despacho', 'Despacho pendiente'),
        ('sin_bom', 'Producto sin receta BOM'),
        ('reporte_generado', 'Reporte generado'),
        ('despacho_completado', 'Despacho completado'),
        ('pago_pendiente', 'Pedido pago pendiente'),
        ('mantenimiento_nueva', 'Nuevo Mantenimiento Registrado'),
    ]
    
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    fecha_notif = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey('usuario', on_delete=models.CASCADE, related_name='notificaciones')
    target_id = models.PositiveIntegerField(null=True, blank=True, help_text="ID del modelo relacionado")
    data_json = models.JSONField(default=dict, blank=True, help_text="Datos extra: {producto_id:1, stock:3}")
    
    class Meta:
        verbose_name = "Notificación"
        verbose_name_plural = "Notificaciones"
        db_table = "notificaciones"
        ordering = ['-fecha_notif']
        indexes = [models.Index(fields=['leida', 'fecha_notif'])]
    
    def __str__(self):
        return f"{self.titulo} ({self.user.username}) - {self.fecha_notif.strftime('%d/%m %H:%M')}"
    
    @property
    def relacionada(self):
        """Retorna objeto relacionado basado en tipo"""
        from django.apps import apps
        if not self.target_id:
            return None
        tipo_map = {
            'bajo_stock_producto': 'app.producto',
            'bajo_stock_insumo': 'app.insumo',
            'pendido_despacho': 'app.despacho',
            'pago_pendiente': 'app.pedido',
            'sin_bom': 'app.producto',
        }
        model_name = tipo_map.get(self.tipo, 'app.producto')
        model = apps.get_model(*model_name.split('.'))
        return model.objects.filter(id=self.target_id).first()