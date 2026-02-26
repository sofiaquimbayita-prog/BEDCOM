/* ==================================================
   script_productos.js - Lógica de Inventario BedCom
   ================================================== */

// Función para validar que el nombre no contenga caracteres especiales
function validarNombre(nombre) {
    var errores = [];
    if (!nombre || nombre.trim() === '') {
        errores.push('El nombre es requerido');
    } else {
        var nombreTrimmed = nombre.trim();
        if (nombreTrimmed.length < 3) {
            errores.push('El nombre debe tener al menos 3 caracteres');
        }
        if (nombreTrimmed.length > 100) {
            errores.push('El nombre no puede exceder 100 caracteres');
        }
        if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/.test(nombreTrimmed)) {
            errores.push('El nombre solo puede contener letras, números, espacios, guiones (-) y guiones bajos (_)');
        }
    }
    return errores;
}

function validarTelefono(telefono) {
    var errores = [];
    if (!telefono || telefono.trim() === '') {
        errores.push('El teléfono es requerido');
    } else {
        var tel = telefono.trim();
        if (!/^\d+$/.test(tel)) {
            errores.push('El teléfono solo debe contener números');
        } else if (tel.length < 7 || tel.length > 15) {
            errores.push('El teléfono debe tener entre 7 y 15 dígitos');
        }
    }
    return errores;
}

function validarPrecio(precio) {
    var errores = [];
    if (precio === '' || precio === null || precio === undefined) {
        errores.push('El precio es requerido');
    } else {
        var precioValor = parseFloat(precio);
        if (isNaN(precioValor)) {
            errores.push('El precio debe ser un número válido');
        } else if (precioValor <= 0) {
            errores.push('El precio no puede ser negativo o cero');
        } else if (precioValor > 99999999) {
            errores.push('El precio no puede exceder 99,999,999');
        }
    }
    return errores;
}

function validarStock(stock) {
    var errores = [];
    if (stock === '' || stock === null || stock === undefined) {
        errores.push('El stock es requerido');
    } else {
        var stockValor = parseInt(stock);
        if (isNaN(stockValor)) {
            errores.push('El stock debe ser un número válido');
        } else if (stockValor < 0) {
            errores.push('El stock no puede ser negativo');
        }
    }
    return errores;
}

// Función para mostrar errores por elemento (solo muestra el mensaje, no toca el borde)
function mostrarErroresPorElemento(elemento, errores) {
    if (!elemento) return;
    
    var errorDiv = elemento.parentElement.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '5px';
        elemento.parentElement.appendChild(errorDiv);
    }
    
    if (errores.length > 0) {
        errorDiv.innerHTML = errores.join('<br>');
    } else {
        errorDiv.innerHTML = '';
    }
}

// Función para limpiar errores
function limpiarErrores(form) {
    var errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(function(el) {
        el.innerHTML = '';
    });
}

// Funciones globales para modales
window.abrirModal = function(idModal) {
    var modal = document.getElementById(idModal);
    if (modal) modal.style.display = 'flex';
};

window.cerrarModal = function(idModal) {
    var modal = document.getElementById(idModal);
    if (modal) modal.style.display = 'none';
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

    // Validar formulario agregar producto
    $(document).on('submit', '#formAddProducto', function(e) {
        limpiarErrores(this);
        
        var nombre = this.querySelector('input[name="nombre"]');
        var descripcion = this.querySelector('textarea[name="descripcion"]');
        var precio = this.querySelector('input[name="precio"]');
        var stock = this.querySelector('input[name="stock"]');
        var categoria = this.querySelector('select[name="categoria"]');
        
        var hasErrors = false;
        
        if (nombre) {
            var erroresNombre = validarNombre(nombre.value);
            if (erroresNombre.length > 0) {
                mostrarErroresPorElemento(nombre, erroresNombre);
                hasErrors = true;
            }
        }
        
        // Descripcion es opcional, no se valida como requerido
        
        if (precio) {
            var erroresPrecio = validarPrecio(precio.value);
            if (erroresPrecio.length > 0) {
                mostrarErroresPorElemento(precio, erroresPrecio);
                hasErrors = true;
            }
        }
        
        if (stock) {
            var erroresStock = validarStock(stock.value);
            if (erroresStock.length > 0) {
                mostrarErroresPorElemento(stock, erroresStock);
                hasErrors = true;
            }
        }
        
        if (categoria && !categoria.value) {
            var erroresCategoria = ['La categoría es requerida'];
            mostrarErroresPorElemento(categoria, erroresCategoria);
            hasErrors = true;
        }
        
        if (hasErrors) {
            e.preventDefault();
            return false;
        }
    });

    // Validación en tiempo real para el formulario de agregar (solo en blur)
    $(document).on('blur', '#formAddProducto input[name="nombre"]', function() {
        var errores = validarNombre(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    $(document).on('blur', '#formAddProducto input[name="precio"]', function() {
        var errores = validarPrecio(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    $(document).on('blur', '#formAddProducto input[name="stock"]', function() {
        var errores = validarStock(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    // Validación en tiempo real para select en formulario de agregar
    $(document).on('change', '#formAddProducto select[name="categoria"]', function() {
        var errores = [];
        if (!$(this).val()) {
            errores.push('La categoría es requerida');
        }
        mostrarErroresPorElemento(this, errores);
    });

    $(document).on('change', '#formAddProducto select[name="categoria"]', function() {
        var errores = [];
        if (!$(this).val()) {
            errores.push('La categoría es requerida');
        }
        mostrarErroresPorElemento(this, errores);
    });

    // Validar formulario editar producto (cargado dinámicamente)
    $(document).on('submit', '#formEditarProducto', function(e) {
        limpiarErrores(this);
        
        var nombre = this.querySelector('input[name="nombre"]');
        var descripcion = this.querySelector('textarea[name="descripcion"]');
        var precio = this.querySelector('input[name="precio"]');
        var stock = this.querySelector('input[name="stock"]');
        var categoria = this.querySelector('select[name="categoria"]');
        
        var hasErrors = false;
        
        if (nombre) {
            var erroresNombre = validarNombre(nombre.value);
            if (erroresNombre.length > 0) {
                mostrarErroresPorElemento(nombre, erroresNombre);
                hasErrors = true;
            }
        }
        
        // Descripcion es opcional, no se valida como requerido
        
        if (precio) {
            var erroresPrecio = validarPrecio(precio.value);
            if (erroresPrecio.length > 0) {
                mostrarErroresPorElemento(precio, erroresPrecio);
                hasErrors = true;
            }
        }
        
        if (stock) {
            var erroresStock = validarStock(stock.value);
            if (erroresStock.length > 0) {
                mostrarErroresPorElemento(stock, erroresStock);
                hasErrors = true;
            }
        }
        
        if (categoria && !categoria.value) {
            var erroresCategoria = ['La categoría es requerida'];
            mostrarErroresPorElemento(categoria, erroresCategoria);
            hasErrors = true;
        }
        
        if (hasErrors) {
            e.preventDefault();
            return false;
        }
    });

    // Validación en tiempo real para el formulario de editar (solo en blur)
    $(document).on('blur', '#formEditarProducto input[name="nombre"]', function() {
        var errores = validarNombre(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    $(document).on('blur', '#formEditarProducto input[name="precio"]', function() {
        var errores = validarPrecio(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    $(document).on('blur', '#formEditarProducto input[name="stock"]', function() {
        var errores = validarStock(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    // Validación en tiempo real para select en formulario de editar
    $(document).on('change', '#formEditarProducto select[name="categoria"]', function() {
        var errores = [];
        if (!$(this).val()) {
            errores.push('La categoría es requerida');
        }
        mostrarErroresPorElemento(this, errores);
    });

    $(document).on('change', '#formEditarProducto select[name="categoria"]', function() {
        var errores = [];
        if (!$(this).val()) {
            errores.push('La categoría es requerida');
        }
        mostrarErroresPorElemento(this, errores);
    });
});

/* ==================================================
   ABRIR MODAL PARA EDITAR (AJAX)
   ================================================== */
function abrirModalEditar(id) {
    var modal = document.getElementById('modalEdit');
    modal.style.display = 'flex';
    modal.innerHTML = '<div class="modal-content"><div style="color:white; padding:20px; text-align:center;"><i class="fas fa-spinner fa-spin"></i> Cargando datos del producto...</div></div>';

    var urlEditar = '/vistas/productos/editar/' + id + '/';

    fetch(urlEditar, {
        method: 'GET',
        headers: { 'Accept': 'text/html' }
    })
    .then(function(response) {
        return response.text().then(function(html) {
            return { ok: response.ok, html: html };
        });
    })
    .then(function(result) {
        modal.innerHTML = result.html;
        
        if (result.ok) {
            var form = modal.querySelector('#formEditarProducto');
            if (form) {
                form.action = urlEditar;
                
                // Agregar eventos de validación en tiempo real (solo blur)
                var nombreInput = form.querySelector('input[name="nombre"]');
                var precioInput = form.querySelector('input[name="precio"]');
                var stockInput = form.querySelector('input[name="stock"]');
                
                if (nombreInput) {
                    nombreInput.addEventListener('blur', function() {
                        var errores = validarNombre(this.value);
                        mostrarErroresPorElemento(this, errores);
                    });
                }
                
                if (precioInput) {
                    precioInput.addEventListener('blur', function() {
                        var errores = validarPrecio(this.value);
                        mostrarErroresPorElemento(this, errores);
                    });
                }
                
                if (stockInput) {
                    stockInput.addEventListener('blur', function() {
                        var errores = validarStock(this.value);
                        mostrarErroresPorElemento(this, errores);
                    });
                }
            }
        }
    })
    .catch(function(error) {
        modal.innerHTML = '<div class="modal-content"><div style="color:#ef4444; padding:20px;">Error al conectar con el servidor.</div></div>';
    });
}

/* ==================================================
   FUNCIÓN PARA ELIMINAR PRODUCTO
   ================================================== */
function abrirModalEliminar(id, nombre, urlImagen) {
    var modal = document.getElementById('modalDelete');
    var txtNombre = document.getElementById('nombreProductoEliminar');
    var imgModal = document.getElementById('imgEliminar');
    var form = document.getElementById('formEliminar');

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
        form.action = '/vistas/productos/eliminar/' + id + '/';
        form.method = 'POST';
    }

    modal.style.display = 'flex';
}

function abrirModalVer(nombre, descripcion, imagen, precio, stock, categoria) {
    var modal = document.getElementById('modalView');

    document.getElementById('viewNombre').textContent = nombre;
    document.getElementById('viewDescripcion').textContent = descripcion || 'Sin descripción';
    document.getElementById('viewCategoria').textContent = categoria;
    document.getElementById('viewPrecio').textContent = '$' + precio;
    document.getElementById('viewStock').textContent = stock + ' unidades';

    var imgElement = document.getElementById('viewImagen');
    imgElement.src = imagen ? imagen : '/static/ap1/img/cama.jpg';

    modal.style.display = 'flex';
}

/* ==================================================
   FUNCIÓN PARA ACTIVAR PRODUCTO
   ================================================== */
function abrirModalActivar(id, nombre, urlImagen) {
    var modal = document.getElementById('modalActivar');
    var txtNombre = document.getElementById('nombreProductoActivar');
    var imgModal = document.getElementById('imgActivar');
    var form = document.getElementById('formActivar');

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
        form.action = '/vistas/productos/activar/' + id + '/';
    }

    modal.style.display = 'flex';
}
