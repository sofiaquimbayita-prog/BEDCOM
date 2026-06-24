# app/views/pedido/__init__.py
from .views import (
    PedidoListView,
    PedidoDetailView,
    PedidoCreateView,
    PedidoUpdateView,
    PedidoStateChangeView,
    PagoUpdateView,
    enviar_correo_pedido,
)