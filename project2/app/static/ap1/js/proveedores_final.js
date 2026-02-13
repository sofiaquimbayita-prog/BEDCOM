/* ==================================================
   script_productos.js - Lógica de Inventario BedCom
   ================================================== */

$(document).ready(function() {
    
    

    // Filtrar por estado (activo/inactivo) usando el switch #toggleInactivos
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        if (settings.nTable.id !== 'tablaProductos') return true; // solo para esta tabla

        var mostrarInactivos = $('#toggleInactivos').is(':checked');
        var estadoRaw = data[5]; // columna 5: Estado (Activo/Inactivo)

        var s = String(estadoRaw).toLowerCase().trim();

        if (!mostrarInactivos) {
            // Switch desactivado: mostrar solo activos (estado=1)
            return s === 'activo' || s === '1' || s === 'true' || s === 'yes' || s === 'y' || s === 't' || estadoRaw === true || estadoRaw === 1;
        } else {
            // Switch activado: mostrar solo inactivos (estado=0)
            return s === 'inactivo' || s === '0' || s === 'false' || s === 'no' || s === 'n' || s === 'f' || estadoRaw === false || estadoRaw === 0;
        }
    });

    // Redibuja la tabla cuando cambie el switch
    $('#toggleInactivos').on('change', function() {
        $('#tablaProductos').DataTable().draw();
    });

    // 2. CONTROL DE MODALES BÁSICOS
    window.abrirModal = function(idModal) {
        const modal = document.getElementById(idModal);
        if (modal) modal.style.display = 'flex';
    };

    window.cerrarModal = function(idModal) {
        const modal = document.getElementById(idModal);
        if (modal) modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
});

/* ==================================================
   3. FUNCIÓN MAESTRA: ABRIR MODAL PARA EDITAR (AJAX)
   ================================================== */
function abrirModalEditar(id) {
    const modal = document.getElementById('modalEdit');
    modal.style.display = 'flex';
    
    // Spinner de carga
    modal.innerHTML = `
        <div class="modal-content">
            <div style="color:white; padding:20px; text-align:center;">
                <i class="fas fa-spinner fa-spin"></i> Cargando datos del producto...
            </div>
        </div>`;

    // IMPORTANTE: Verifica que esta ruta coincida con tu urls.py
    // Si tu error decía 'vistas/productos/editar/', usa esa ruta:
    const urlEditar = `/vistas/productos/editar/${id}/`;

    fetch(urlEditar, {
        method: 'GET',
        headers: { 'Accept': 'text/html' }
    })
    .then(response => response.text().then(html => ({ ok: response.ok, html })))
    .then(({ok, html}) => {
        // Inyectamos el HTML que nos devuelve la vista (modal_edit.html)
        modal.innerHTML = html;

        if (ok) {
            // BUSCAMOS EL FORMULARIO RECIÉN INYECTADO Y LE PONEMOS EL ACTION
            const form = modal.querySelector('#formEditarProducto');
            if (form) {
                form.action = urlEditar; // Aquí se soluciona el NoReverseMatch
                console.log("Action inyectado:", form.action);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        modal.innerHTML = '<div class="modal-content"><div style="color:#ef4444; padding:20px;">Error al conectar con el servidor.</div></div>';
    });
}

/* ==================================================
   4. FUNCIÓN PARA ELIMINAR PRODUCTO
   ================================================== */
function abrirModalEliminar(id, nombre, urlImagen) {
    const modal = document.getElementById('modalDelete');
    const txtNombre = document.getElementById('nombreProductoEliminar');
    const imgModal = document.getElementById('imgEliminar');
    const form = document.getElementById('formEliminar');

    // Verificamos que el elemento exista antes de usarlo para evitar el error de null
    if (txtNombre) {
        txtNombre.textContent = nombre;
    }

    if (imgModal) {
        if (urlImagen && urlImagen !== 'None') {
            imgModal.src = urlImagen;
            imgModal.style.display = 'inline-block';
        } else {
            imgModal.style.display = 'none';
        }
    }

    if (form) {
        form.action = `/vistas/productos/eliminar/${id}/`;
        form.method = 'POST';
    }

    modal.style.display = 'flex';
}
function abrirModalVer(nombre, imagen, precio, stock, categoria) {
    const modal = document.getElementById('modalView');

    // Asignar valores
    document.getElementById('viewNombre').textContent = nombre;
    document.getElementById('viewCategoria').textContent = categoria;
    document.getElementById('viewPrecio').textContent = '$' + precio;
    document.getElementById('viewStock').textContent = stock + ' unidades';

    // Manejar imagen
    const imgElement = document.getElementById('viewImagen');
    imgElement.src = imagen ? imagen : '/static/ap1/imagenes/cama.jpg';

    modal.style.display = 'flex';
}

/* ==================================================
   5. FUNCIÓN PARA ACTIVAR PRODUCTO
   ================================================== */
function abrirModalActivar(id, nombre, urlImagen) {
    const modal = document.getElementById('modalDelete');
    const txtNombre = document.getElementById('nombreProductoEliminar');
    const imgModal = document.getElementById('imgEliminar');
    const form = document.getElementById('formEliminar');

    // Verificamos que el elemento exista antes de usarlo para evitar el error de null
    if (txtNombre) {
        txtNombre.textContent = nombre;
    }

    if (imgModal) {
        if (urlImagen && urlImagen !== 'None') {
            imgModal.src = urlImagen;
            imgModal.style.display = 'inline-block';
        } else {
            imgModal.style.display = 'none';
        }
    }

    if (form) {
        form.action = `/vistas/productos/activar/${id}/`;
    }

    modal.style.display = 'flex';
}
$('.dataTables_length select').select2({
    minimumResultsForSearch: Infinity, // Oculta la barra de búsqueda interna
    width: '70px'
});