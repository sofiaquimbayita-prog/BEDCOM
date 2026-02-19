from .auth import (
    MenuPrincipalView,
    crear_cuenta_view,
    cambiar_contrasena_view,
    recuperar_contrasena_view,
    menu_view
)
from .productos import (
    productos_view,
    crear_producto_view,
    eliminar_producto_view
)
from .insumos import (
    insumos_view,
    insumos_data_view,
    obtener_insumo_view,
    crear_insumo_view,
    editar_insumo_view,
    eliminar_insumo_view
)
from .calendario import (
    eventos_data_view,
    obtener_evento_view,
    calendario_view,
    crear_evento_view,
    editar_evento_view,
    eliminar_evento_view,
    cambiar_estado_evento_view
)
from .proveedores import (
    ProveedorListView, 
    ProveedorCreateView, 
    ProveedorUpdateView, 
    ProveedorDeleteView, 
    ProveedorActivateView
)