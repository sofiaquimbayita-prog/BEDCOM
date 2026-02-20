/* ==================================================
   script_productos.js - Lógica de Inventario BedCom
   ================================================== */

// Función para validar que el nombre no contenga caracteres especiales
function validarNombreProducto(nombre) {
    // Permite: letras (incluyendo Ñ y acentos), números, espacios, guiones y guiones bajos
    var patron = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/;
    return patron.test(nombre);
}

// Función para mostrar error en el div correspondiente
function mostrarError(inputId, mensaje) {
    var errorDiv = document.getElementById('error' + inputId.replace('input', ''));
    var input = document.getElementById(inputId);
    
    if (errorDiv && input) {
        errorDiv.textContent = mensaje;
        errorDiv.classList.add('show');
        input.classList.add('input-error');
    }
}

// Función para limpiar error
function limpiarError(inputId) {
    var errorDiv = document.getElementById('error' + inputId.replace('input', ''));
    var input = document.getElementById(inputId);
    
    if (errorDiv && input) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
        input.classList.remove('input-error');
    }
}

// Función genérica de validación para productos
function validarProducto(formId) {
    var form = document.getElementById(formId);
    if (!form) return false;
    
    var esValido = true;
    
    // Validar Nombre
    var nombre = form.querySelector('[name="nombre"]');
    if (nombre) {
        var nombreValor = nombre.value.trim();
        if (!nombreValor) {
            mostrarError('inputNombre', 'El nombre es requerido');
            esValido = false;
        } else if (nombreValor.length < 3) {
            mostrarError('inputNombre', 'El nombre debe tener al menos 3 caracteres');
            esValido = false;
        } else if (nombreValor.length > 100) {
            mostrarError('inputNombre', 'El nombre no puede exceder 100 caracteres');
            esValido = false;
        } else if (!validarNombreProducto(nombreValor)) {
            mostrarError('inputNombre', 'El nombre solo puede contener letras, números, espacios, guiones (-) y guiones bajos (_)');
            esValido = false;
        } else {
            limpiarError('inputNombre');
        }
    }
    
    // Validar Tipo
    var tipo = form.querySelector('[name="tipo"]');
    if (tipo && !tipo.value) {
        mostrarError('inputTipo', 'El tipo de producto es requerido');
        esValido = false;
    } else if (tipo) {
        limpiarError('inputTipo');
    }
    
    // Validar Precio
    var precio = form.querySelector('[name="precio"]');
    if (precio) {
        var precioValor = parseFloat(precio.value);
        if (precio.value === '' || precio.value === null || precio.value === undefined) {
            mostrarError('inputPrecio', 'El precio es requerido');
            esValido = false;
        } else if (precioValor < 0) {
            mostrarError('inputPrecio', 'El precio no puede ser negativo');
            esValido = false;
        } else if (precioValor > 99999999) {
            mostrarError('inputPrecio', 'El precio no puede exceder 99,999,999');
            esValido = false;
        } else {
            limpiarError('inputPrecio');
        }
    }
    
    // Validar Stock
    var stock = form.querySelector('[name="stock"]');
    if (stock) {
        var stockValor = parseInt(stock.value);
        if (stock.value === '' || stock.value === null || stock.value === undefined) {
            mostrarError('inputStock', 'El stock es requerido');
            esValido = false;
        } else if (stockValor < 0) {
            mostrarError('inputStock', 'El stock no puede ser negativo');
            esValido = false;
        } else {
            limpiarError('inputStock');
        }
    }
    
    // Validar Categoría
    var categoria = form.querySelector('[name="categoria"]');
    if (categoria && !categoria.value) {
        mostrarError('inputCategoria', 'La categoría es requerida');
        esValido = false;
    } else if (categoria) {
        limpiarError('inputCategoria');
    }
    
    return esValido;
}

// Funciones globales para modales
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

// Filtrar por estado
$.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
    if (settings.nTable.id !== 'tablaProductos') return true;

    var mostrarInactivos = $('#toggleInactivos').is(':checked');
    var estadoRaw = data[5];
    var s = String(estadoRaw).toLowerCase().trim();

    if (!mostrarInactivos) {
        return s === 'activo' || s === '1' || s === 'true' || s === 'yes' || s === 'y' || s === 't' || estadoRaw === true || estadoRaw === 1;
    } else {
        return s === 'inactivo' || s === '0' || s === 'false' || s === 'no' || s === 'n' || s === 'f' || estadoRaw === false || estadoRaw === 0;
    }
});

$(document).ready(function() {
    
    // Configuración de DataTable
    if ($.fn.dataTable.isDataTable('#tablaProductos')) {
        $('#tablaProductos').DataTable().destroy();
    }

    $('#tablaProductos').DataTable({
        "responsive": true,
        "language": {
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "Ningún dato disponible en esta tabla",
            "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            }
        },
        "pageLength": 10,
        "order": [[1, "asc"]]
    });

    $('#toggleInactivos').on('change', function() {
        $('#tablaProductos').DataTable().draw();
    });

    // Validación en tiempo real para el formulario de agregar
    $(document).on('input', '#formAddProducto input[name="nombre"]', function() {
        var valor = $(this).val().trim();
        if (valor && valor.length >= 3 && valor.length <= 100 && validarNombreProducto(valor)) {
            limpiarError('inputNombre');
        }
    });

    $(document).on('input', '#formAddProducto input[name="precio"]', function() {
        var valor = parseFloat($(this).val());
        if (!isNaN(valor) && valor >= 0 && valor <= 99999999) {
            limpiarError('inputPrecio');
        }
    });

    $(document).on('input', '#formAddProducto input[name="stock"]', function() {
        var valor = parseInt($(this).val());
        if (!isNaN(valor) && valor >= 0) {
            limpiarError('inputStock');
        }
    });

    $(document).on('change', '#formAddProducto select[name="tipo"]', function() {
        if ($(this).val()) {
            limpiarError('inputTipo');
        }
    });

    $(document).on('change', '#formAddProducto select[name="categoria"]', function() {
        if ($(this).val()) {
            limpiarError('inputCategoria');
        }
    });

    // Validación en tiempo real para el formulario de editar
    $(document).on('input', '#formEditarProducto input[name="nombre"]', function() {
        var valor = $(this).val().trim();
        if (valor && valor.length >= 3 && valor.length <= 100 && validarNombreProducto(valor)) {
            limpiarError('inputNombre');
        }
    });

    $(document).on('input', '#formEditarProducto input[name="precio"]', function() {
        var valor = parseFloat($(this).val());
        if (!isNaN(valor) && valor >= 0 && valor <= 99999999) {
            limpiarError('inputPrecio');
        }
    });

    $(document).on('input', '#formEditarProducto input[name="stock"]', function() {
        var valor = parseInt($(this).val());
        if (!isNaN(valor) && valor >= 0) {
            limpiarError('inputStock');
        }
    });

    $(document).on('change', '#formEditarProducto select[name="tipo"]', function() {
        if ($(this).val()) {
            limpiarError('inputTipo');
        }
    });

    $(document).on('change', '#formEditarProducto select[name="categoria"]', function() {
        if ($(this).val()) {
            limpiarError('inputCategoria');
        }
    });

    // Validar antes de enviar el formulario de agregar
    $(document).on('submit', '#formAddProducto', function(e) {
        if (!validarProducto('formAddProducto')) {
            e.preventDefault();
            return false;
        }
    });

    // Validar antes de enviar el formulario de editar
    $(document).on('submit', '#formEditarProducto', function(e) {
        if (!validarProducto('formEditarProducto')) {
            e.preventDefault();
            return false;
        }
    });
});

/* ==================================================
   3. FUNCIÓN MAESTRA: ABRIR MODAL PARA EDITAR (AJAX)
   ================================================== */
function abrirModalEditar(id) {
    const modal = document.getElementById('modalEdit');
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div style="color:white; padding:20px; text-align:center;">
                <i class="fas fa-spinner fa-spin"></i> Cargando datos del producto...
            </div>
        </div>`;

    const urlEditar = `/vistas/productos/editar/${id}/`;

    fetch(urlEditar, {
        method: 'GET',
        headers: { 'Accept': 'text/html' }
    })
    .then(response => response.text().then(html => ({ ok: response.ok, html })))
    .then(({ok, html}) => {
        modal.innerHTML = html;

        if (ok) {
            const form = modal.querySelector('#formEditarProducto');
            if (form) {
                form.action = urlEditar;
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

    document.getElementById('viewNombre').textContent = nombre;
    document.getElementById('viewCategoria').textContent = categoria;
    document.getElementById('viewPrecio').textContent = '$' + precio;
    document.getElementById('viewStock').textContent = stock + ' unidades';

    const imgElement = document.getElementById('viewImagen');
    imgElement.src = imagen ? imagen : '/static/ap1/img/cama.jpg';

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
