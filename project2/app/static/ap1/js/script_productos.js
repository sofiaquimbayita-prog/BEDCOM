/* ==================================================
   script_productos.js - Lógica de Inventario BedCom
   ================================================== */

// Función para mostrar notificaciones tipo toast
function mostrarNotificacion(titulo, mensaje, tipo) {
    var container = document.getElementById('toast-container-productos');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container-productos';
        container.className = 'messages-container';
        container.style.cssText = 'position: fixed; top: 85px; right: 25px; z-index: 10000; display: flex; flex-direction: column; gap: 12px;';
        document.body.appendChild(container);
    }
    
    // Estilos según el tipo de mensaje
    var tipoClase = 'info';
    var iconColor = '#38bdf8';
    if (tipo === 'success' || tipo === 'correcto') {
        tipoClase = 'success';
        iconColor = '#10b981';
    } else if (tipo === 'error') {
        tipoClase = 'error';
        iconColor = '#ef4444';
    } else if (tipo === 'warning') {
        tipoClase = 'warning';
        iconColor = '#f59e0b';
    }
    
    // Icono según el tipo
    var iconClass = 'fas fa-info-circle';
    if (tipoClase === 'success') iconClass = 'fas fa-check-circle';
    else if (tipoClase === 'error') iconClass = 'fas fa-exclamation-circle';
    else if (tipoClase === 'warning') iconClass = 'fas fa-exclamation-triangle';
    
    // Crear el elemento del mensaje
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + tipoClase;
    messageDiv.style.cssText = 'min-width: 320px; padding: 16px 20px; border-radius: 14px; background: #1e293b; color: white; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4); border-left: 5px solid ' + iconColor + '; animation: slideInToast 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);';
    
    messageDiv.innerHTML = 
        '<div class="message-content" style="display: flex; align-items: center; gap: 12px;">' +
            '<i class="' + iconClass + '" style="font-size: 20px; color: ' + iconColor + ';"></i>' +
            '<span class="text">' + mensaje + '</span>' +
        '</div>' +
        '<button type="button" class="close-toast" onclick="cerrarToast(this)" style="background: rgba(255, 255, 255, 0.1); border: none; color: rgba(255, 255, 255, 0.6); width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; margin-left: 15px;">' +
            '<i class="fas fa-times" style="font-size: 14px;"></i>' +
        '</button>';
    
    container.appendChild(messageDiv);
    
    // Cerrar después de 5 segundos
    setTimeout(function() {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideInToast 0.3s ease reverse';
            setTimeout(function() {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }
    }, 5000);
}

// Función para actualizar la tabla de productos
function actualizarTablaProductos() {
    window.location.reload();
}

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

function validarDescripcion(descripcion) {
    var errores = [];
    if (!descripcion || descripcion.trim() === '') {
        errores.push('La descripción es requerida');
    } else if (descripcion.trim().length < 10) {
        errores.push('La descripción debe tener al menos 10 caracteres');
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

// Función para mostrar mensaje de advertencia en el modal
function mostrarAdvertenciaModal(mensaje) {
    var modal = document.getElementById('modalAdd');
    if (!modal) return;
    
    // Buscar o crear contenedor de mensajes
    var msgContainer = modal.querySelector('.modal-messages');
    if (!msgContainer) {
        msgContainer = document.createElement('div');
        msgContainer.className = 'modal-messages';
        msgContainer.style.padding = '10px';
        msgContainer.style.marginBottom = '10px';
        msgContainer.style.borderRadius = '4px';
        
        // Insertar al inicio del contenido del formulario
        var form = modal.querySelector('form');
        if (form) {
            form.insertBefore(msgContainer, form.firstChild);
        }
    }
    
    msgContainer.innerHTML = '<div style="background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; border: 1px solid #ffeeba;">' + mensaje + '</div>';
    
    // Auto隐藏 después de 5 segundos
    setTimeout(function() {
        msgContainer.innerHTML = '';
    }, 5000);
}

// Función para limpiar errores
function limpiarErrores(form) {
    var errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(function(el) {
        el.innerHTML = '';
    });
    
    // Limpiar mensajes del modal
    var modalMessages = form.parentElement.querySelector('.modal-messages');
    if (modalMessages) {
        modalMessages.innerHTML = '';
    }
}

// Funciones globales para modales
window.abrirModal = function(idModal) {
    var modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'flex';
        
        // Inicializar Select2 cuando se abre el modal de agregar producto
        if (idModal === 'modalAdd') {
            setTimeout(function() {
                initSelect2EnModal('modalAdd');
            }, 100);
        }
    }
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

// Función para inicializar Select2 en el modal de agregar producto
function initSelect2EnModal(modalId) {
    // Inicializar Select2 para el modal de agregar
    if (modalId === 'modalAdd') {
        var selectCategoria = $('#inputCategoria');
        if (selectCategoria.length && !selectCategoria.hasClass('select2-hidden-accessible')) {
            selectCategoria.select2({
                dropdownParent: $('#modalAdd'),
                placeholder: 'Seleccione o busque una categoría',
                width: '100%',
                minimumResultsForSearch: 0,
                allowClear: true,
                language: 'es'
            });
        }
    }
    
    // Inicializar Select2 para el modal de editar
    if (modalId === 'modalEdit') {
        var selectEditCategoria = $('#inputEditCategoria');
        if (selectEditCategoria.length && !selectEditCategoria.hasClass('select2-hidden-accessible')) {
            selectEditCategoria.select2({
                dropdownParent: $('#modalEdit'),
                placeholder: 'Seleccione o busque una categoría',
                width: '100%',
                minimumResultsForSearch: 0,
                allowClear: true,
                language: 'es'
            });
        }
    }
}

// Función para inicializar Select2 en ambos modales
function initSelect2EnTodosLosModales() {
    initSelect2EnModal('modalAdd');
    initSelect2EnModal('modalEdit');
}

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

    // Validar formulario agregar producto - Prevenir submit normal y usar AJAX
    $(document).on('submit', '#formAddProducto', function(e) {
        e.preventDefault(); // Prevenir submit normal
        
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
        
        // Descripcion es requerida
        if (descripcion) {
            var erroresDescripcion = validarDescripcion(descripcion.value);
            if (erroresDescripcion.length > 0) {
                mostrarErroresPorElemento(descripcion, erroresDescripcion);
                hasErrors = true;
            }
        }
        
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
            return false;
        }
        
        // Si stock es 0, mostrar advertencia pero permitir guardar
        var stockValor = parseInt(stock.value);
        var mostrarAdvertenciaStock0 = (stockValor === 0);
        
        // Enviar formulario via AJAX
        var formData = new FormData(this);
        
        fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                // Producto guardado exitosamente
                cerrarModal('modalAdd');
                
                // Mostrar notificación de éxito
                mostrarNotificacion('Éxito', data.message || 'Producto creado correctamente', 'success');
                
                // Limpiar el formulario
                document.getElementById('formAddProducto').reset();
                
                // Actualizar la tabla sin recargar la página
                actualizarTablaProductos();
            } else {
                // Mostrar errores
                if (data.errors) {
                    Object.keys(data.errors).forEach(function(field) {
                        var input = document.querySelector('#formAddProducto [name="' + field + '"]');
                        if (input) {
                            var mensajes = Array.isArray(data.errors[field]) ? data.errors[field] : [data.errors[field]];
                            mostrarErroresPorElemento(input, mensajes);
                        }
                    });
                }
                
                // Verificar si hay mensaje de warning (stock 0)
                if (data.warning) {
                    mostrarAdvertenciaModal(data.warning);
                }
                
                if (data.message) {
                    mostrarAdvertenciaModal(data.message);
                }
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            mostrarAdvertenciaModal('Error al conectar con el servidor. Por favor intenta de nuevo.');
        });
        
        return false;
    });

    // Validación en Tiempo real para el formulario de agregar (solo en blur)
    $(document).on('blur', '#formAddProducto input[name="nombre"]', function() {
        var errores = validarNombre(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    $(document).on('blur', '#formAddProducto textarea[name="descripcion"]', function() {
        var errores = validarDescripcion(this.value);
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

    // Validar formulario editar producto (cargado dinámicamente)
    $(document).on('submit', '#formEditarProducto', function(e) {
        e.preventDefault();
        
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
        
        // Descripcion es requerida
        if (descripcion) {
            var erroresDescripcion = validarDescripcion(descripcion.value);
            if (erroresDescripcion.length > 0) {
                mostrarErroresPorElemento(descripcion, erroresDescripcion);
                hasErrors = true;
            }
        }
        
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
            return false;
        }
        
        // Enviar formulario via AJAX
        var formData = new FormData(this);
        
        fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                cerrarModal('modalEdit');
                mostrarNotificacion('Éxito', data.message || 'Producto actualizado correctamente', 'success');
                actualizarTablaProductos();
            } else {
                if (data.errors) {
                    Object.keys(data.errors).forEach(function(field) {
                        var input = document.querySelector('#formEditarProducto [name="' + field + '"]');
                        if (input) {
                            var mensajes = Array.isArray(data.errors[field]) ? data.errors[field] : [data.errors[field]];
                            mostrarErroresPorElemento(input, mensajes);
                        }
                    });
                }
                
                if (data.warning) {
                    var modal = document.getElementById('modalEdit');
                    var msgContainer = modal.querySelector('.modal-messages');
                    if (!msgContainer) {
                        msgContainer = document.createElement('div');
                        msgContainer.className = 'modal-messages';
                        msgContainer.style.padding = '10px';
                        msgContainer.style.marginBottom = '10px';
                        var form = modal.querySelector('form');
                        if (form) form.insertBefore(msgContainer, form.firstChild);
                    }
                    msgContainer.innerHTML = '<div style="background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 4px;">' + data.warning + '</div>';
                }
                
                if (data.message) {
                    mostrarNotificacion('Error', data.message, 'error');
                }
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            mostrarNotificacion('Error', 'Error al conectar con el servidor.', 'error');
        });
        
        return false;
    });

    // Validación en tiempo real para el formulario de editar (solo en blur)
    $(document).on('blur', '#formEditarProducto input[name="nombre"]', function() {
        var errores = validarNombre(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    $(document).on('blur', '#formEditarProducto textarea[name="descripcion"]', function() {
        var errores = validarDescripcion(this.value);
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
                var descripcionInput = form.querySelector('textarea[name="descripcion"]');
                var precioInput = form.querySelector('input[name="precio"]');
                var stockInput = form.querySelector('input[name="stock"]');
                
                if (nombreInput) {
                    nombreInput.addEventListener('blur', function() {
                        var errores = validarNombre(this.value);
                        mostrarErroresPorElemento(this, errores);
                    });
                }
                
                if (descripcionInput) {
                    descripcionInput.addEventListener('blur', function() {
                        var errores = validarDescripcion(this.value);
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
                
                // Inicializar Select2 en el modal de edición después de cargar el contenido
                setTimeout(function() {
                    initSelect2EnModal('modalEdit');
                }, 100);
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

/* ==================================================
    CATEGORY CREATION (FROM PRODUCTS)
   ================================================== */
var targetSelectId = null;

// Función para abrir el modal de creación rápida de categoría
window.abrirModalCategoria = function(selectId) {
    targetSelectId = selectId;
    var modal = document.getElementById('modalCategoria');
    modal.style.display = 'flex';
    
    // Limpiar el formulario
    var form = document.getElementById('formCategoria');
    if (form) {
        form.reset();
        // Limpiar errores
        var errorSpans = form.querySelectorAll('.error-msg');
        errorSpans.forEach(function(span) {
            span.textContent = '';
            span.style.display = 'none';
        });
    }
};

// Función para mostrar errores en el formulario de categoría rápida
function mostrarErroresCategoria(errors) {
    if (errors.nombre) {
        var inputNombre = document.getElementById('inputNombre');
        var errorSpan = document.getElementById('errorNombre');
        if (inputNombre && errorSpan) {
            errorSpan.textContent = errors.nombre.join(', ');
            errorSpan.style.display = 'block';
        }
    }
    if (errors.descripcion) {
        var inputDesc = document.getElementById('inputDescripcion');
        var errorSpan = document.getElementById('errorDescripcion');
        if (inputDesc && errorSpan) {
            errorSpan.textContent = errors.descripcion.join(', ');
            errorSpan.style.display = 'block';
        }
    }
}

// Evento para crear categoría rápida via AJAX
$(document).ready(function() {
    $(document).on('submit', '#formCategoria', function(e) {
        e.preventDefault();
        
        var form = this;
        var formData = new FormData(form);
        
        // Limpiar errores previos
        var errorSpans = form.querySelectorAll('.error-msg');
        errorSpans.forEach(function(span) {
            span.textContent = '';
            span.style.display = 'none';
        });
        
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                // Cerrar el modal de categoría
                cerrarModal('modalCategoria');
                
                // Mostrar notificación de éxito
                mostrarNotificacion('Éxito', data.message || 'Categoría creada correctamente', 'success');
                
                // Recargar las categorías en el select objetivo
                if (targetSelectId) {
                    var select = document.getElementById(targetSelectId);
                    if (select) {
                        // Verificar si es un Select2
                        if ($(select).hasClass('select2-hidden-accessible')) {
                            // Usar Select2 para agregar la opción
                            var newOption = new Option(data.categoria_nombre, data.categoria_id, true, true);
                            $(select).append(newOption).trigger('change');
                        } else {
                            // Usar método normal para select estándar
                            var newOption = document.createElement('option');
                            newOption.value = data.categoria_id;
                            newOption.textContent = data.categoria_nombre;
                            newOption.selected = true;
                            select.appendChild(newOption);
                        }
                    }
                }
            } else {
                // Mostrar errores
                if (data.errors) {
                    mostrarErroresCategoria(data.errors);
                }
                if (data.message) {
                    mostrarNotificacion('Error', data.message, 'error');
                }
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            mostrarNotificacion('Error', 'Error al conectar con el servidor.', 'error');
        });
        
        return false;
    });
});
