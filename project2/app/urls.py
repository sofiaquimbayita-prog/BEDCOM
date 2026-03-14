from django.urls import path
from django.contrib.auth import views as auth_views
from .views import calendario, insumos, menu, proveedores, productos,reportes, categorias,entrada_p, salida_p, bom


urlpatterns = [
      # --- ENTRADA DE PRODUCTOS ---
      path('entrada_p/', entrada_p.EntradaListView.as_view(), name='entrada_p'),
      path('entrada_p/data/', entrada_p.EntradaDataView.as_view(), name='entrada_p_data'),
      path('entrada_p/obtener/<int:pk>/', entrada_p.EntradaDetailView.as_view(), name='entrada_p_obtener'),
      path('entrada_p/crear/', entrada_p.EntradaCreateView.as_view(), name='entrada_p_crear'),
      path('entrada_p/editar/<int:pk>/', entrada_p.EntradaUpdateView.as_view(), name='entrada_p_editar'),
      path('entrada_p/eliminar/<int:pk>/', entrada_p.EntradaDeleteView.as_view(), name='entrada_p_eliminar'),
      path('entrada_p/reactivar/<int:pk>/', entrada_p.EntradaReactivarView.as_view(), name='entrada_p_reactivar'),

      # --- MENÚ / DASHBOARD ---
      path('menu/', menu.MenuView.as_view(), name='menu'),
      path('menu/perfil/', menu.get_perfil, name='get_perfil'),
      path('menu/perfil/actualizar/', menu.update_perfil, name='update_perfil'),

      # --- PRODUCTOS ---
      path('productos/', productos.producto_list_view.as_view(), name='productos'),
      path('productos/crear/', productos.producto_create_view.as_view(), name='crear_producto'),
      path('productos/editar/<int:pk>/', productos.producto_update_view.as_view(), name='editar_producto'),
      path('productos/eliminar/<int:pk>/', productos.producto_delete_view.as_view(), name='eliminar_producto'),
      path('productos/activar/<int:pk>/', productos.producto_activate_view.as_view(), name='activar_producto'),
      
      # --- CATEGORÍAS ---
      path('categorias/', categorias.categoria_list_view.as_view(), name='categorias'),
      path('categorias/crear/', categorias.categoria_create_view.as_view(), name='crear_categoria'),
      path('categorias/editar/<int:pk>/', categorias.categoria_update_view.as_view(), name='editar_categoria'),
      path('categorias/eliminar/<int:pk>/', categorias.categoria_delete_view.as_view(), name='eliminar_categoria'),
      path('categorias/activar/<int:pk>/', categorias.categoria_activate_view.as_view(), name='activar_categoria'),
      
      # --- REPORTES ---  
      path('reportes/', reportes.ReporteVentasView.as_view(), name='reportes'),  
      path('reportes/estadisticas/pdf/',   reportes.ExportarEstadisticasPDF.as_view(),   name='estadisticas_pdf'),
      path('reportes/estadisticas/excel/', reportes.ExportarEstadisticasExcel.as_view(), name='estadisticas_excel'),
      path('reportes/categorias/pdf/', reportes.ExportarCategoriasPDF.as_view(), name='categorias_pdf'),
      path('reportes/categorias/excel/', reportes.ExportarCategoriasExcel.as_view(), name='categorias_excel'),
      path('reportes/insumos/pdf/', reportes.ExportarInsumosPDF.as_view(), name='insumos_pdf'),
      path('reportes/insumos/excel/', reportes.ExportarInsumosExcel.as_view(), name='insumos_excel'),
      path('reportes/productos/pdf/', reportes.ExportarProductosPDF.as_view(), name='productos_pdf'),
      path('reportes/productos/excel/', reportes.ExportarProductosExcel.as_view(), name='productos_excel'),
      path('reportes/proveedores/pdf/', reportes.ExportarProveedoresPDF.as_view(), name='proveedores_pdf'),
      path('reportes/proveedores/excel/', reportes.ExportarProveedoresExcel.as_view(), name='proveedores_excel'),

   # --- INSUMOS ---
      path('insumos/', insumos.InsumoListView.as_view(), name='insumos'),
      path('insumos/data/', insumos.InsumoDataView.as_view(), name='insumos_data'),
      path('insumos/obtener/<int:pk>/', insumos.InsumoDetailView.as_view(), name='obtener_insumo'),
      path('insumos/crear/', insumos.InsumoCreateView.as_view(), name='crear_insumo'),
      path('insumos/editar/<int:pk>/', insumos.InsumoUpdateView.as_view(), name='editar_insumo'),
      path('insumos/inactivar/<int:pk>/', insumos.InsumoInactivarView.as_view(), name='inactivar_insumo'),
      path('insumos/activar/<int:pk>/', insumos.InsumoActivarView.as_view(), name='activar_insumo'),
      path('insumos/crear_categoria/', insumos.CategoriaCreateView.as_view(), name='insumo_crear_categoria'),
      path('insumos/crear_proveedor/', insumos.ProveedorCreateView.as_view(), name='insumo_crear_proveedor'),

      # --- CALENDARIO ---
      path('calendario/', calendario.CalendarioView.as_view(), name='calendario'),
      path('calendario/data/', calendario.EventoDataView.as_view(), name='eventos_data'),
      path('calendario/por-fecha/', calendario.EventosPorFechaView.as_view(), name='eventos_por_fecha'),
      path('calendario/categorias-stats/', calendario.EventoCategoriaStatsView.as_view(), name='categorias_stats'),
      path('calendario/obtener/<int:pk>/', calendario.EventoDetailView.as_view(), name='obtener_evento'),
      path('calendario/crear/', calendario.EventoCreateView.as_view(), name='crear_evento'),
      path('calendario/editar/<int:pk>/', calendario.EventoUpdateView.as_view(), name='editar_evento'),
      path('calendario/completar/<int:pk>/', calendario.EventoCompletarView.as_view(), name='completar_evento'),
      path('calendario/eliminar/<int:pk>/', calendario.EventoEliminarView.as_view(), name='eliminar_evento'),

# --- PROVEEDORES ---
      path('proveedores/', proveedores.ProveedorListView.as_view(), name='proveedores_list'),
      path('proveedores/data/', proveedores.ProveedorDataView.as_view(), name='proveedores_data'),
      path('proveedores/crear/', proveedores.ProveedorCreateView.as_view(), name='proveedores_create'),
      path('proveedores/editar/<int:pk>/', proveedores.ProveedorUpdateView.as_view(), name='proveedores_update'),
      path('proveedores/eliminar/<int:pk>/', proveedores.ProveedorDeleteView.as_view(), name='proveedores_delete'),
      path('proveedores/activar/<int:pk>/', proveedores.ProveedorActivateView.as_view(), name='proveedores_activate'),


      

      

      
   # --- SALIDA DE PRODUCTOS ---
      path('salida/', salida_p.SalidaProductoView.as_view(), name='salida_producto'),
      path('salida/crear/', salida_p.SalidaProductoCreateView.as_view(), name='salida_producto_create'),
      path('salida/detalle/<int:pk>/', salida_p.SalidaProductoDetalleView.as_view(), name='salida_producto_detalle'),
      path('salida/anular/<int:pk>/', salida_p.SalidaProductoAnularView.as_view(), name='salida_producto_anular'),
      
      # --- BOM (ESTRUCTURA DE PRODUCTOS) ---
      path('bom/', bom.BomListView.as_view(), name='bom_list'),
      path('bom/crear-receta/', bom.bom_crear_receta, name='bom_crear_receta'),
      path('bom/editar-receta/', bom.bom_editar_receta, name='bom_editar_receta'),
      path('bom/eliminar/<int:pk>/', bom.BomDeleteView.as_view(), name='bom_eliminar'),
      path('bom/por-producto/', bom.bom_por_producto, name='bom_por_producto'),
      path('bom/data/', bom.bom_data, name='bom_data'),
]
