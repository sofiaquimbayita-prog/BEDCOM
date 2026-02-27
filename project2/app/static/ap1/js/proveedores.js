var csrfToken = '';

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

csrfToken = getCookie('csrftoken');

// Validar nombre 
function validarNombreProveedor(nombre) {
    var patron = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/;
    return patron.test(nombre);
}

// Validar teléfono
function validarTelefono(telefono) {
    var patron = /^\d{10}$/;
    return patron.test(telefono);
}

function mostrarError(inputId, mensaje) {
    var errorDiv = document.getElementById('error' + inputId);
    var input = document.getElementById(inputId);
    
    if (errorDiv && input) {
        errorDiv.textContent = mensaje;
        errorDiv.classList.add('show');
        input.classList.add('input-error');
    }
}

function limpiarError(inputId) {
    var errorDiv = document.getElementById('error' + inputId);
    var input = document.getElementById(inputId);
    
    if (errorDiv && input) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
        input.classList.remove('input-error');
    }
}

// agregar proveedor
function validarProveedor() {
    var esValido = true;
    
    // Validar nombre que sea obligatorio 
    var nombre = document.getElementById('inputNombre');
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
        } else if (!validarNombreProveedor(nombreValor)) {
            mostrarError('inputNombre', 'El nombre solo puede contener letras, números, espacios y guiones');
            esValido = false;
        } else {
            limpiarError('inputNombre');
        }
    }
    
    // teléfono que tenga 10 dijitos exactamente 
    var telefono = document.getElementById('inputTelefono');
    if (telefono) {
        var telefonoValor = telefono.value.trim();
        if (!telefonoValor) {
            mostrarError('inputTelefono', 'El teléfono es requerido');
            esValido = false;
        } else if (!/^\d+$/.test(telefonoValor)) {
            mostrarError('inputTelefono', 'El teléfono debe contener solo números');
            esValido = false;
        } else if (telefonoValor.length !== 10) {
            mostrarError('inputTelefono', 'El teléfono debe tener exactamente 10 dígitos');
            esValido = false;
        } else {
            limpiarError('inputTelefono');
        }
    }
    
    // dirección
    var direccion = document.getElementById('inputDireccion');
    if (direccion) {
        var direccionValor = direccion.value.trim();
        if (!direccionValor) {
            mostrarError('inputDireccion', 'La dirección es requerida');
            esValido = false;
        } else if (direccionValor.length < 10) {
            mostrarError('inputDireccion', 'La dirección debe tener al menos 10 caracteres');
            esValido = false;
        } else if (direccionValor.length > 200) {
            mostrarError('inputDireccion', 'La dirección no puede exceder 200 caracteres');
            esValido = false;
        } else {
            limpiarError('inputDireccion');
        }
    }
    
    return esValido;
}

// editar proveedor
function validarProveedorEditar() {
    var esValido = true;
    
    // Validar nombre de editar 
    var nombre = document.getElementById('editNombre');
    if (nombre) {
        var nombreValor = nombre.value.trim();
        if (!nombreValor) {
            mostrarError('editNombre', 'El nombre es requerido');
            esValido = false;
        } else if (nombreValor.length < 3) {
            mostrarError('editNombre', 'El nombre debe tener al menos 3 caracteres');
            esValido = false;
        } else if (nombreValor.length > 100) {
            mostrarError('editNombre', 'El nombre no puede exceder 100 caracteres');
            esValido = false;
        } else if (!validarNombreProveedor(nombreValor)) {
            mostrarError('editNombre', 'El nombre solo puede contener letras, números, espacios y guiones');
            esValido = false;
        } else {
            limpiarError('editNombre');
        }
    }
    
    // Validar teléfono de editar 
    var telefono = document.getElementById('editTelefono');
    if (telefono) {
        var telefonoValor = telefono.value.trim();
        if (!telefonoValor) {
            mostrarError('editTelefono', 'El teléfono es requerido');
            esValido = false;
        } else if (!/^\d+$/.test(telefonoValor)) {
            mostrarError('editTelefono', 'El teléfono debe contener solo números');
            esValido = false;
        } else if (telefonoValor.length !== 10) {
            mostrarError('editTelefono', 'El teléfono debe tener exactamente 10 dígitos');
            esValido = false;
        } else {
            limpiarError('editTelefono');
        }
    }
    
    // Validar dirección de editar 
    var direccion = document.getElementById('editDireccion');
    if (direccion) {
        var direccionValor = direccion.value.trim();
        if (!direccionValor) {
            mostrarError('editDireccion', 'La dirección es requerida');
            esValido = false;
        } else if (direccionValor.length < 10) {
            mostrarError('editDireccion', 'La dirección debe tener al menos 10 caracteres');
            esValido = false;
        } else if (direccionValor.length > 200) {
            mostrarError('editDireccion', 'La dirección no puede exceder 200 caracteres');
            esValido = false;
        } else {
            limpiarError('editDireccion');
        }
    }
    
    return esValido;
}

// Funciones para modales
function abrirModal(idModal) {
    var modal = document.getElementById(idModal);
    if (modal) modal.style.display = 'flex';
}

function cerrarModal(idModal) {
    var modal = document.getElementById(idModal);
    if (modal) modal.style.display = 'none';
}

function mostrarNotificacion(titulo, mensaje, tipo) {
    var container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'messages-container';
        container.style.cssText = 'position: fixed; top: 85px; right: 25px; z-index: 10000; display: flex; flex-direction: column; gap: 12px;';
        document.body.appendChild(container);
    }
    
    // esstilos de los tipos de mensajes 
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
    
    //icono según el tipo
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
    
    // cerrar despues de 5 seg
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
function cerrarToast(btn) {
    var toast = btn.closest('.message');
    if (toast) {
        toast.style.animation = 'slideInToast 0.3s ease reverse';
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// el modal se cierra si se hace click en la pantalla 
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// botones de acción
function generarBotonesAccion(proveedor) {
    var botones = '<button class="view-btn" onclick="verProveedor(' + proveedor.id + ')"><i class="fas fa-eye"></i></button> ';
    botones += '<button class="edit-btn" onclick="editarProveedor(' + proveedor.id + ')"><i class="fas fa-pen-to-square"></i></button> ';
    
    if (proveedor.estado) {
        botones += '<button class="delete-btn" onclick="eliminarProveedor(' + proveedor.id + ', \'' + proveedor.nombre.replace(/'/g, "\\'") + '\')"><i class="fas fa-trash-can"></i></button>';
    } else {
        botones += '<button class="activate-btn" onclick="activarProveedor(' + proveedor.id + ', \'' + proveedor.nombre.replace(/'/g, "\\'") + '\')"><i class="fas fa-power-off"></i></button>';
    }
    
    return botones;
}

//actualizar la tabla
function actualizarTabla() {
    var toggleInactivos = document.getElementById('toggleInactivos');
    var mostrarSoloInactivos = toggleInactivos ? toggleInactivos.checked : false;
    
    var table = $('#tablaProveedores').DataTable();
    table.clear();
    
    $.ajax({
        url: '/vistas/proveedores/data/',
        type: 'GET',
        data: { solo_inactivos: mostrarSoloInactivos },
        dataType: 'json',
        success: function(response) {
            var proveedores = response.proveedores;
            
            proveedores.forEach(function(proveedor) {
                var imagenSrc = proveedor.imagen ? proveedor.imagen : "/static/ap1/imagenes/foto_usuario.png";
                var estadoTexto = proveedor.estado ? 'Activo' : 'Inactivo';
                var fila = [
                    "<img src='" + imagenSrc + "' style='width:50px;height:50px;border-radius:8px;object-fit:cover;'>",
                    proveedor.nombre,
                    proveedor.telefono,
                    proveedor.direccion,
                    estadoTexto,
                    generarBotonesAccion(proveedor)
                ];
                table.row.add(fila);
            });
            
            table.draw();
        },
        error: function(xhr, status, error) {
            console.error('Error al obtener proveedores:', error);
            mostrarNotificacion('Error', 'No se pudieron cargar los proveedores', 'error');
        }
    });
}

// ver proveedor
function verProveedor(id) {
    $.ajax({
        url: '/vistas/proveedores/data/',
        type: 'GET',
        data: { incluir_inactivos: true },
        dataType: 'json',
        success: function(response) {
            var proveedor = response.proveedores.find(function(p) { return p.id === id; });
            if (proveedor) {
                document.getElementById('viewNombre').textContent = proveedor.nombre;
                document.getElementById('viewTelefono').textContent = proveedor.telefono;
                document.getElementById('viewDireccion').textContent = proveedor.direccion;
                
                var imagenSrc = proveedor.imagen ? proveedor.imagen : '/static/ap1/imagenes/foto_usuario.png';
                document.getElementById('viewImagen').src = imagenSrc;
                
                abrirModal('modalView');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al obtener proveedor:', error);
            mostrarNotificacion('Error', 'No se pudo cargar el proveedor', 'error');
        }
    });
}

// editar proveedor
function editarProveedor(id) {
    $.ajax({
        url: '/vistas/proveedores/data/',
        type: 'GET',
        data: { incluir_inactivos: true },
        dataType: 'json',
        success: function(response) {
            var proveedor = response.proveedores.find(function(p) { return p.id === id; });
            if (proveedor) {
                document.getElementById('editId').value = proveedor.id;
                document.getElementById('editNombre').value = proveedor.nombre;
                document.getElementById('editTelefono').value = proveedor.telefono;
                document.getElementById('editDireccion').value = proveedor.direccion;
                limpiarError('editNombre');
                limpiarError('editTelefono');
                limpiarError('editDireccion');
                
                abrirModal('modalEdit');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al obtener proveedor:', error);
            mostrarNotificacion('Error', 'No se pudo cargar el proveedor', 'error');
        }
    });
}

//eliminar proveedor
function eliminarProveedor(id, nombre) {
    document.getElementById('deleteProveedorId').value = id;
    document.getElementById('deleteProveedorNombre').textContent = nombre;
    abrirModal('modalDelete');
}

function confirmarEliminar() {
    var id = document.getElementById('deleteProveedorId').value;
    
    $.ajax({
        url: '/vistas/proveedores/eliminar/' + id + '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        success: function(response) {
            if (response.success) {
                mostrarNotificacion('Éxito', 'Proveedor desactivado correctamente', 'success');
            } else {
                mostrarNotificacion('Error', response.message || 'No se pudo desactivar el proveedor', 'error');
            }
            cerrarModal('modalDelete');
            actualizarTabla();
        },
        error: function(xhr, status, error) {
            console.error('Error al desactivar proveedor:', error);
            mostrarNotificacion('Error', 'No se pudo desactivar el proveedor', 'error');
        }
    });
}

//activar proveedor
function activarProveedor(id, nombre) {
    document.getElementById('activarProveedorId').value = id;
    document.getElementById('activarProveedorNombre').textContent = nombre;
    abrirModal('modalActivar');
}

function confirmarActivar() {
    var id = document.getElementById('activarProveedorId').value;
    
    $.ajax({
        url: '/vistas/proveedores/activar/' + id + '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        success: function(response) {
            if (response.success) {
                mostrarNotificacion('Éxito', 'Proveedor activado correctamente', 'success');
            } else {
                mostrarNotificacion('Error', response.message || 'No se pudo activar el proveedor', 'error');
            }
            cerrarModal('modalActivar');
            actualizarTabla();
        },
        error: function(xhr, status, error) {
            console.error('Error al activar proveedor:', error);
            mostrarNotificacion('Error', 'No se pudo activar el proveedor', 'error');
        }
    });
}

// base de datos 
$(document).ready(function() {
    if ($.fn.dataTable.isDataTable('#tablaProveedores')) {
        $('#tablaProveedores').DataTable().destroy();
    }

    var table = $('#tablaProveedores').DataTable({
        data: [],
        responsive: true,
        language: {
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

    // para cargar los datos 
    actualizarTabla();
    $('#toggleInactivos').on('change', function() {
        actualizarTabla();
    });

    // ------------- VALIDACIONES ------------------------
    $('#inputNombre').on('input', function() {
        var valor = $(this).val().trim();
        if (!valor) {
            mostrarError('inputNombre', 'El nombre es requerido');
        } else if (valor.length < 3) {
            mostrarError('inputNombre', 'El nombre debe tener al menos 3 caracteres');
        } else if (valor.length > 100) {
            mostrarError('inputNombre', 'El nombre no puede exceder 100 caracteres');
        } else if (!validarNombreProveedor(valor)) {
            mostrarError('inputNombre', 'El nombre solo puede contener letras, números, espacios y guiones');
        } else {
            limpiarError('inputNombre');
        }
    });

    // Teléfono
    $('#inputTelefono').on('input', function() {
        var valor = $(this).val();
        valor = valor.replace(/\D/g, '');
        if (valor.length > 10) {
            valor = valor.substring(0, 10);
        }
        $(this).val(valor);
        
        if (!valor) {
            mostrarError('inputTelefono', 'El teléfono es requerido');
        } else if (!/^\d+$/.test(valor)) {
            mostrarError('inputTelefono', 'El teléfono debe contener solo números');
        } else if (valor.length !== 10) {
            mostrarError('inputTelefono', 'El teléfono debe tener exactamente 10 dígitos');
        } else {
            limpiarError('inputTelefono');
        }
    });

    // Dirección
    $('#inputDireccion').on('input', function() {
        var valor = $(this).val().trim();
        if (!valor) {
            mostrarError('inputDireccion', 'La dirección es requerida');
        } else if (valor.length < 10) {
            mostrarError('inputDireccion', 'La dirección debe tener al menos 10 caracteres');
        } else if (valor.length > 200) {
            mostrarError('inputDireccion', 'La dirección no puede exceder 200 caracteres');
        } else {
            limpiarError('inputDireccion');
        }
    });
    // Nombre editar
    $('#editNombre').on('input', function() {
        var valor = $(this).val().trim();
        if (!valor) {
            mostrarError('editNombre', 'El nombre es requerido');
        } else if (valor.length < 3) {
            mostrarError('editNombre', 'El nombre debe tener al menos 3 caracteres');
        } else if (valor.length > 100) {
            mostrarError('editNombre', 'El nombre no puede exceder 100 caracteres');
        } else if (!validarNombreProveedor(valor)) {
            mostrarError('editNombre', 'El nombre solo puede contener letras, números, espacios y guiones');
        } else {
            limpiarError('editNombre');
        }
    });

    // Teléfono editar 
    $('#editTelefono').on('input', function() {
        var valor = $(this).val();
        valor = valor.replace(/\D/g, '');
        if (valor.length > 10) {
            valor = valor.substring(0, 10);
        }
        $(this).val(valor);
        
        if (!valor) {
            mostrarError('editTelefono', 'El teléfono es requerido');
        } else if (!/^\d+$/.test(valor)) {
            mostrarError('editTelefono', 'El teléfono debe contener solo números');
        } else if (valor.length !== 10) {
            mostrarError('editTelefono', 'El teléfono debe tener exactamente 10 dígitos');
        } else {
            limpiarError('editTelefono');
        }
    });

    // Dirección editar
    $('#editDireccion').on('input', function() {
        var valor = $(this).val().trim();
        if (!valor) {
            mostrarError('editDireccion', 'La dirección es requerida');
        } else if (valor.length < 10) {
            mostrarError('editDireccion', 'La dirección debe tener al menos 10 caracteres');
        } else if (valor.length > 200) {
            mostrarError('editDireccion', 'La dirección no puede exceder 200 caracteres');
        } else {
            limpiarError('editDireccion');
        }
    });

    
    // Formulario agregar proveedor
    $('#formAgregarProveedor').on('submit', function(e) {
        e.preventDefault();
        
        // Validar formulario antes de enviar
        if (!validarProveedor()) {
            return false;
        }
        
        var formData = new FormData();
        formData.append('nombre', document.getElementById('inputNombre').value.trim());
        formData.append('telefono', document.getElementById('inputTelefono').value.trim());
        formData.append('direccion', document.getElementById('inputDireccion').value.trim());
        
        var inputImagen = document.getElementById('inputImagen');
        if (inputImagen && inputImagen.files && inputImagen.files[0]) {
            formData.append('imagen', inputImagen.files[0]);
        }
        
        $.ajax({
            url: '/vistas/proveedores/crear/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(response) {
                if (response.success) {
                    mostrarNotificacion('Éxito', response.message, 'success');
                    document.getElementById('formAgregarProveedor').reset();
                    cerrarModal('modalAdd');
                    actualizarTabla();
                } else {
                    if (response.errors) {
                        for (var field in response.errors) {
                            var errorMessages = response.errors[field];
                            if (errorMessages.length > 0) {
                                mostrarError('input' + field.charAt(0).toUpperCase() + field.slice(1), errorMessages[0]);
                            }
                        }
                    }
                    if (response.message) {
                        mostrarNotificacion('Error', response.message, 'error');
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Error al guardar proveedor:', error);
                mostrarNotificacion('Error', 'No se pudo guardar el proveedor', 'error');
            }
        });
        
        return false;
    });

    // Formulario editar proveedor
    $('#formEditarProveedor').on('submit', function(e) {
        e.preventDefault();
        
        // formulario antes de enviar
        if (!validarProveedorEditar()) {
            return false;
        }
        
        var id = document.getElementById('editId').value;
        
        var formData = new FormData();
        formData.append('nombre', document.getElementById('editNombre').value.trim());
        formData.append('telefono', document.getElementById('editTelefono').value.trim());
        formData.append('direccion', document.getElementById('editDireccion').value.trim());
        
        var editImagen = document.getElementById('editImagen');
        if (editImagen && editImagen.files && editImagen.files[0]) {
            formData.append('imagen', editImagen.files[0]);
        }
        
        $.ajax({
            url: '/vistas/proveedores/editar/' + id + '/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(response) {
                if (response.success) {
                    mostrarNotificacion('Éxito', response.message, 'success');
                    cerrarModal('modalEdit');
                    actualizarTabla();
                } else {
                    if (response.errors) {
                        for (var field in response.errors) {
                            var errorMessages = response.errors[field];
                            if (errorMessages.length > 0) {
                                mostrarError('edit' + field.charAt(0).toUpperCase() + field.slice(1), errorMessages[0]);
                            }
                        }
                    }
                    if (response.message) {
                        mostrarNotificacion('Error', response.message, 'error');
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Error al actualizar proveedor:', error);
                mostrarNotificacion('Error', 'No se pudo actualizar el proveedor', 'error');
            }
        });
        
        return false;
    });
});
