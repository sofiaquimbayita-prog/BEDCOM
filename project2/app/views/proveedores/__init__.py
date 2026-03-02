from .views import (
    ProveedorListView,
    ProveedorCreateView,
    ProveedorUpdateView,
    ProveedorDeleteView,
    ProveedorActivateView,
    ProveedorDataView
)

# Alias para compatibilidad
proveedores = type('proveedores', (), {
    'ProveedorListView': ProveedorListView,
    'ProveedorCreateView': ProveedorCreateView,
    'ProveedorUpdateView': ProveedorUpdateView,
    'ProveedorDeleteView': ProveedorDeleteView,
    'ProveedorActivateView': ProveedorActivateView,
    'ProveedorDataView': ProveedorDataView
})
