/* ==================================================
   script_usuarios.js - Gestión de Usuarios BedCom
   ================================================== */

let validationErrorsAdd = {};
let validationErrorsEdit = {}; 

// VALIDACIÓN CLIENT-SIDE
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const numeric10Regex = /^\d{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?\":{}|<>])[A-Za-z\d!@#$%^&*(),.?\":{}|<>]{8,}$/;

// FUNCIONES DE VALIDACIÓN
function validateField(value, validator, message, isRequired = true) {
    value = value.trim();
    if (!value && isRequired) return {valid: false, msg: 'Campo requerido'};
    if (!value) return {valid: true};
    if (!validator.test(value)) return {valid: false, msg: message};
    return {valid: true};
}

function getFieldValueAdd(fieldName) {
    return $(`#formAddUsuario [name="${fieldName}"]`).val().trim();
}

function getFieldValueEdit(fieldName) {
    return $(`#formEditarUsuario [name="${fieldName}"]`).val().trim();
}

function validateFormAdd() {
    // Check all required
    const required = ['username', 'password', 'first_name', 'last_name'];
    for (let field of required) {
        if (!getFieldValueAdd(field)) return false;
    }
    
    return true; // Live validation ya maneja detalles
}

function validateFormEdit() {
    // Check required (except password optional)
    const required = ['username', 'first_name', 'last_name'];
    for (let field of required) {
        if (!getFieldValueEdit(field)) return false;
    }
    
    return true; // Live ya valida
}

// MOSTRAR/LIMPIAR ERRORES
function showErrorsAdd() {
    // Toast con errores específicos
    const errorsList = Object.keys(validationErrorsAdd).map(field => {
        return validationErrorsAdd[field] + ' (' + field.replace('_', ' ').toUpperCase() + ')';
    }).join(', ');
    mostrarNotificacion('Errores de validación', errorsList, 'error');
    
    // Errores locales también
    $('#formAddUsuario .error-message').remove();
    $('#formAddUsuario .form-control').removeClass('input-error');
    
    Object.keys(validationErrorsAdd).forEach(field => {
        const input = $(`#formAddUsuario [name="${field}"]`);
        input.addClass('input-error');
        input.after(`<div id="error${field.charAt(0).toUpperCase() + field.slice(1)}" class="error-message">${validationErrorsAdd[field]}</div>`);
    });
}

function showErrorsEdit() {
    // Toast con errores específicos
    const errorsList = Object.keys(validationErrorsEdit).map(field => {
        return validationErrorsEdit[field] + ' (' + field.replace('_', ' ').toUpperCase() + ')';
    }).join(', ');
    mostrarNotificacion('Errores de validación', errorsList, 'error');
    
    $('#error-container-edit').show();
    $('#error-list-edit').empty();
    
    Object.keys(validationErrorsEdit).forEach(field => {
        $(`#formEditarUsuario [name="${field}"]`).addClass('input-error');
        $('#error-list-edit').append(`<li>${validationErrorsEdit[field]}: ${field.replace('_', ' ').toUpperCase()}</li>`);
    });
}

function clearErrorsAdd() {
    validationErrorsAdd = {};
    $('#formAddUsuario .error-message').remove();
    $('#formAddUsuario .form-control').removeClass('is-invalid');
}

function clearErrorsEdit() {
    validationErrorsEdit = {};
    $('#formEditarUsuario .is-invalid').removeClass('is-invalid');
    $('#error-container-edit').hide();
}

// VALIDACIÓN REAL-TIME
function validateFieldLive(input, validator, message, fieldName, isRequired = true) {
    const value = input.val().trim();
    const errorId = 'error' + fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.remove();
    input.removeClass('input-error');
    
    const result = validateField(value, validator, message, isRequired);
    if (!result.valid) {
        input.addClass('input-error');
        input.after(`<div id="${errorId}" class="error-message">${result.msg}</div>`);
        return false;
    }
    return true;
}

// Real-time para cada campo
$(document).on('input', '#formAddUsuario .form-control, #formEditarUsuario .form-control', function() {
    const name = $(this).attr('name');
    const modalId = $(this).closest('.modal').attr('id');
    const isAdd = modalId === 'modalAdd';
    
    if (isAdd) {
        switch(name) {
            case 'username':
                validateFieldLive($(this), /.+/, 'Requerido', 'username', true);
                break;
            case 'email':
                validateFieldLive($(this), emailRegex, 'Email inválido', 'email', false);
                break;
            case 'password':
                validateFieldLive($(this), passwordRegex, 'Mín 8: mayús, número, especial', 'password', true);
                break;
            case 'first_name':
                validateFieldLive($(this), nameRegex, 'Solo letras', 'first_name', true);
                break;
            case 'last_name':
                validateFieldLive($(this), nameRegex, 'Solo letras', 'last_name', true);
                break;
            case 'cedula':
            case 'telefono':
                validateFieldLive($(this), numeric10Regex, '10 dígitos', name, false);
                break;
        }
    } else {
        // Edit modal
        switch(name) {
            case 'username':
                validateFieldLive($(this), /.+/, 'Requerido', 'username', true);
                break;
            case 'email':
                validateFieldLive($(this), emailRegex, 'Email inválido', 'email', false);
                break;
            case 'password':
                validateFieldLive($(this), passwordRegex, 'Mín 8: mayús, número, especial', 'password', false);
                break;
            case 'first_name':
                validateFieldLive($(this), nameRegex, 'Solo letras', 'first_name', true);
                break;
            case 'last_name':
                validateFieldLive($(this), nameRegex, 'Solo letras', 'last_name', true);
                break;
            case 'cedula':
            case 'telefono':
                validateFieldLive($(this), numeric10Regex, '10 dígitos', name, false);
                break;
        }
    }
});

/**
 * 1. FILTRO POR ESTADO (Columna 6)
 * Switch OFF -> Muestra solo Activos
 * Switch ON  -> Muestra solo Inactivos
 */
$.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
    if (settings.nTable.id !== 'tablaUsuarios') return true;

    var mostrarInactivos = $('#toggleInactivos').is(':checked');
    
    // Obtenemos el texto de la columna 6 ("Activo" o "Inactivo")
    var valorEstado = data[6].trim(); 

    if (!mostrarInactivos) {
        // MODO NORMAL: Solo Activos
        return valorEstado === 'Activo' || valorEstado === '1' || valorEstado === 'True';
    } else {
        // MODO INACTIVOS: Solo Inactivos
        return valorEstado === 'Inactivo' || valorEstado === '0' || valorEstado === 'False';
    }
});

$(document).ready(function() {
    /**
     * 2. CONFIGURACIÓN DE DATATABLES
     */
    const lenguajeEspanol = {
        "sProcessing": "Procesando...",
        "sLengthMenu": "Mostrar _MENU_ registros",
        "sZeroRecords": "No se encontraron resultados",
        "sEmptyTable": "Ningún dato disponible en esta tabla",
        "sInfo": "Mostrando _START_ a _END_ de _TOTAL_ usuarios",
        "sSearch": "Buscar:",
        "oPaginate": {
            "sFirst": "Primero", "sLast": "Último", "sNext": "Siguiente", "sPrevious": "Anterior"
        }
    };

    // Inicializamos la tabla
    const table = $('#tablaUsuarios').DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 10,
        language: lenguajeEspanol,
        order: [[1, "asc"]],
        columnDefs: [{ orderable: false, targets: [7] }]
    });

    // Evento para que el switch refresque la tabla
    $('#toggleInactivos').on('change', function() {
        table.draw();
    });

    /**
     * 3. LÓGICA DE CREACIÓN (AJAX)
     */
$(document).on('submit', '#formAddUsuario', function(e) {
        e.preventDefault();
        
        // VALIDAR ANTES DE ENVÍO
        if (!validateFormAdd()) {
            showErrorsAdd();
            return;
        }
        
        var form = $(this);
        var formData = new FormData(this);
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        fetch(form.attr('action'), {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrftoken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cerrarModal('modalAdd');
                window.location.reload();
            } else {
                alert("Error servidor: " + (data.message || "Datos inválidos"));
            }
        })
        .catch(error => console.error('Error:', error));
    });

// AGREGAR HANDLER PARA EDIT MODAL
$(document).on('submit', '#formEditarUsuario', function(e) {
    e.preventDefault();
    
    if (!validateFormEdit()) {
        showErrorsEdit();
        return;
    }
    
    const formData = new FormData(this);
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cerrarModal('modalEditar');
            window.location.reload();
        } else {
            alert("Error servidor: " + (data.message || "Datos inválidos"));
        }
    })
    .catch(error => console.error('Error:', error));
});
});

/**
 * 4. FUNCIONES GLOBALES (MODALES)
 */
window.abrirModal = function(id) {
    const m = document.getElementById(id);
    if(m) { 
        m.style.display = 'flex'; 
        document.body.style.overflow = 'hidden';
        
        // LIMPIAR ERRORES AL ABRIR
        if (id === 'modalAdd') {
            clearErrorsAdd();
        } else if (id === 'modalEditar') {
            clearErrorsEdit();
        }
    }
};

function mostrarNotificacion(titulo, mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const tipoClase = tipo === 'success' ? 'success' : tipo === 'error' ? 'error' : 'info';
    const iconClass = tipo === 'success' ? 'fas fa-check-circle' : tipo === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';
    
    const toast = document.createElement('div');
    toast.className = `message ${tipoClase}`;
    toast.innerHTML = `
        <div class="message-content">
            <i class="${iconClass}"></i>
            <span>${mensaje}</span>
        </div>
        <button class="close-toast" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;';
    document.body.appendChild(container);
    return container;
}

window.cerrarModal = function(id) {
    const m = document.getElementById(id);
    if(m) { m.style.display = 'none'; document.body.style.overflow = 'auto'; }
};

/**
 * 5. ACCIONES DE FILA
 */
function abrirModalEditar(id) {
    fetch(`/usuarios/detalle_json/${id}/`)
        .then(response => response.json())
        .then(data => {
            const form = document.getElementById('formEditarUsuario');
            form.action = `/usuarios/editar/${id}/`;
            form.querySelector('[name="username"]').value = data.username;
            form.querySelector('[name="email"]').value = data.email;
            form.querySelector('[name="first_name"]').value = data.first_name;
            form.querySelector('[name="last_name"]').value = data.last_name;
            form.querySelector('[name="cedula"]').value = data.cedula;
            form.querySelector('[name="rol"]').value = data.rol;
            abrirModal('modalEditar');
        });
}

function abrirModalEliminar(id, nombre) {
    const form = document.getElementById('formEliminar');
    if(document.getElementById('nombreEliminar')) document.getElementById('nombreEliminar').textContent = nombre;
    form.action = `/usuarios/cambiar_estado/${id}/`;
    abrirModal('modalDelete');
}

function abrirModalActivar(id, nombre) {
    const form = document.getElementById('formActivar');
    if(document.getElementById('nombreActivar')) document.getElementById('nombreActivar').textContent = nombre;
    form.action = `/usuarios/cambiar_estado/${id}/`;
    abrirModal('modalActivar');
}