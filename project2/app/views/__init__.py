"""Paquete de vistas del app. Reexporta vistas por módulo.

Permite usar `from app import views` o `from . import views` en `app/urls.py`.
"""

from .auth import (
    MenuPrincipalView,  CrearCuentaView, RecuperarContrasenaView, CambiarContrasenaView
)
from .menu.views import MenuView
from .productos.views import (
    ProductoListView, ProductoCreateView, ProductoUpdateView, ProductoDeleteView, ProductoActivateView
)

__all__ = [
    'MenuPrincipalView', 'MenuView', 'CrearCuentaView', 'RecuperarContrasenaView', 'CambiarContrasenaView',
    'ProductoListView', 'ProductoCreateView', 'ProductoUpdateView', 'ProductoDeleteView', 'ProductoActivateView'
]
