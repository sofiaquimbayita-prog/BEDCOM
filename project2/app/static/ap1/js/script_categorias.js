/* ==================================================
   script_categorias.js - Lógica de Gestión de Categorías
   ================================================== */

// Toast → usa window.showToast() global (base.html)


// Función para actualizar la tabla de categorías
function actualizarTablaCategorias() {
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

// Función para mostrar errores por elemento
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
function mostrarAdvertenciaModal(mensaje, modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    
    var msgContainer = modal.querySelector('.modal-messages');
    if (!msgContainer) {
        msgContainer = document.createElement('div');
        msgContainer.className = 'modal-messages';
        msgContainer.style.padding = '10px';
        msgContainer.style.marginBottom = '10px';
        
        var form = modal.querySelector('form');
        if (form) {
            form.insertBefore(msgContainer, form.firstChild);
        }
    }
    
    msgContainer.innerHTML = '<div style="background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; border: 1px solid #ffeeba;">' + mensaje + '</div>';
    
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
    
    var modalMessages = form.parentElement.querySelector('.modal-messages');
    if (modalMessages) {
        modalMessages.innerHTML = '';
    }
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

// Server-side filtering enabled - client-side DataTable row filter disabled for categorias

$(document).ready(function() {
    
    if ($.fn.dataTable.isDataTable('#tablaCategorias')) {
        $('#tablaCategorias').DataTable().destroy();
    }

    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        var toggle = document.getElementById('toggleInactivos');
        if (!toggle) return true;
        var mostrarInactivos = toggle.checked;
        var estado = (data[2] || "").trim();
        return mostrarInactivos ? estado === "Inactivo" : estado === "Activo";
    });

    var table = $('#tablaCategorias').DataTable({
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
        "order": [[0, "asc"]]
    });

    $('#toggleInactivos').on('change', function() {
        $(this).siblings('.slider').css('background-color', this.checked ? '#22c55e' : '#64748b');
        table.draw();
    });

    // Validar formulario agregar categoría
    $(document).on('submit', '#formAddCategoria', function(e) {
        e.preventDefault();
        
        limpiarErrores(this);
        
        var nombre = this.querySelector('input[name="nombre"]');
        var descripcion = this.querySelector('textarea[name="descripcion"]');
        
        var hasErrors = false;
        
        if (nombre) {
            var erroresNombre = validarNombre(nombre.value);
            if (erroresNombre.length > 0) {
                mostrarErroresPorElemento(nombre, erroresNombre);
                hasErrors = true;
            }
        }
        
        if (descripcion) {
            var erroresDescripcion = validarDescripcion(descripcion.value);
            if (erroresDescripcion.length > 0) {
                mostrarErroresPorElemento(descripcion, erroresDescripcion);
                hasErrors = true;
            }
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
                cerrarModal('modalAdd');
                window.showToast(data.message || 'Categoría creada correctamente', 'success');
                document.getElementById('formAddCategoria').reset();
                actualizarTablaCategorias();
            } else {
                if (data.errors) {
                    Object.keys(data.errors).forEach(function(field) {
                        var input = document.querySelector('#formAddCategoria [name="' + field + '"]');
                        if (input) {
                            var mensajes = Array.isArray(data.errors[field]) ? data.errors[field] : [data.errors[field]];
                            mostrarErroresPorElemento(input, mensajes);
                        }
                    });
                }
                
                if (data.message) {
                    mostrarAdvertenciaModal(data.message, 'modalAdd');
                }
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            mostrarAdvertenciaModal('Error al conectar con el servidor. Por favor intenta de nuevo.', 'modalAdd');
        });
        
        return false;
    });

    // Validación en tiempo real para el formulario de agregar
    $(document).on('blur', '#formAddCategoria input[name="nombre"]', function() {
        var errores = validarNombre(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    $(document).on('blur', '#formAddCategoria textarea[name="descripcion"]', function() {
        var errores = validarDescripcion(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    // Validar formulario editar categoría
    $(document).on('submit', '#formEditarCategoria', function(e) {
        e.preventDefault();
        
        limpiarErrores(this);
        
        var nombre = this.querySelector('input[name="nombre"]');
        var descripcion = this.querySelector('textarea[name="descripcion"]');
        
        var hasErrors = false;
        
        if (nombre) {
            var erroresNombre = validarNombre(nombre.value);
            if (erroresNombre.length > 0) {
                mostrarErroresPorElemento(nombre, erroresNombre);
                hasErrors = true;
            }
        }
        
        if (descripcion) {
            var erroresDescripcion = validarDescripcion(descripcion.value);
            if (erroresDescripcion.length > 0) {
                mostrarErroresPorElemento(descripcion, erroresDescripcion);
                hasErrors = true;
            }
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
                window.showToast(data.message || 'Categoría actualizada correctamente', 'success');
                actualizarTablaCategorias();
            } else {
                if (data.errors) {
                    Object.keys(data.errors).forEach(function(field) {
                        var input = document.querySelector('#formEditarCategoria [name="' + field + '"]');
                        if (input) {
                            var mensajes = Array.isArray(data.errors[field]) ? data.errors[field] : [data.errors[field]];
                            mostrarErroresPorElemento(input, mensajes);
                        }
                    });
                }
                
                if (data.message) {
                    window.showToast(data.message, 'error');
                }
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            window.showToast('Error al conectar con el servidor.', 'error');
        });
        
        return false;
    });

    // Validación en tiempo real para el formulario de editar
    $(document).on('blur', '#formEditarCategoria input[name="nombre"]', function() {
        var errores = validarNombre(this.value);
        mostrarErroresPorElemento(this, errores);
    });

    $(document).on('blur', '#formEditarCategoria textarea[name="descripcion"]', function() {
        var errores = validarDescripcion(this.value);
        mostrarErroresPorElemento(this, errores);
    });
});

/* ==================================================
   ABRIR MODAL PARA EDITAR (AJAX)
   ================================================== */
function abrirModalEditar(id) {
    var modal = document.getElementById('modalEdit');
    modal.style.display = 'flex';
    modal.innerHTML = '<div class="modal-content"><div style="color:white; padding:20px; text-align:center;"><i class="fas fa-spinner fa-spin"></i> Cargando datos de la categoría...</div></div>';

    var urlEditar = '/vistas/categorias/editar/' + id + '/';

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
            var form = modal.querySelector('#formEditarCategoria');
            if (form) {
                form.action = urlEditar;
                
                var nombreInput = form.querySelector('input[name="nombre"]');
                var descripcionInput = form.querySelector('textarea[name="descripcion"]');
                
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
            }
        }
    })
    .catch(function(error) {
        modal.innerHTML = '<div class="modal-content"><div style="color:#ef4444; padding:20px;">Error al conectar con el servidor.</div></div>';
    });
}

/* ==================================================
   FUNCIÓN PARA ELIMINAR (INACTIVAR) CATEGORÍA
   ================================================== */
function abrirModalEliminar(id, nombre) {
    var modal = document.getElementById('modalDelete');
    var txtNombre = document.getElementById('nombreCategoriaEliminar');
    var form = document.getElementById('formEliminar');

    if (txtNombre) {
        txtNombre.textContent = nombre;
    }

    if (form) {
        form.action = '/vistas/categorias/eliminar/' + id + '/';
        form.method = 'POST';
    }

    modal.style.display = 'flex';
}

/* ==================================================
   FUNCIÓN PARA ACTIVAR CATEGORÍA
   ================================================== */
function abrirModalActivar(id, nombre) {
    var modal = document.getElementById('modalActivar');
    var txtNombre = document.getElementById('nombreCategoriaActivar');
    var form = document.getElementById('formActivar');

    if (txtNombre) {
        txtNombre.textContent = nombre;
    }

    if (form) {
        form.action = '/vistas/categorias/activar/' + id + '/';
    }

    modal.style.display = 'flex';
}

// Función para filtrar caracteres especiales en tiempo real
function filtrarCaracteresEspecialesCategorias(id) {
    var campo = document.getElementById(id);
    if (campo) {
        campo.value = campo.value.replace(/[^a-zA-Z0-9\sÁÉÍÓÚáéíóúÑñ.,-]/g, '');
    }
}

// Agregar evento de filtrado en tiempo real para el campo de descripción
$(document).ready(function() {
    $('#inputDescripcion').on('input', function() {
        filtrarCaracteresEspecialesCategorias('inputDescripcion');
    });
});

