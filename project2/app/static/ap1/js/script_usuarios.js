/* ==================================================
   script_usuarios.js - Gestión de Usuarios BedCom
   ================================================== */

// 1. CONFIGURACIÓN DE REGEX (Validaciones)
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const numeric10Regex = /^\d{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?\":{}|<>])[A-Za-z\d!@#$%^&*(),.?\":{}|<>]{8,}$/;

// 2. SISTEMA DE NOTIFICACIONES — usa window.showToast() global (base.html)

// 3. VALIDACIÓN EN TIEMPO REAL
function validateFieldLive(input, validator, message, isRequired = true) {
    const value = input.val().trim();
    const inputId = input.attr('id'); 
    const errorEl = $(`#error_${inputId}`); 
    
    input.removeClass('input-error');
    if(errorEl.length) {
        errorEl.text('').hide(); 
    }
    
    if (!value && !isRequired) return true;

    if (!value && isRequired) {
        input.addClass('input-error');
        if(errorEl.length) errorEl.text('Este campo es obligatorio').show();
        return false;
    }
    
    if (value && validator && !validator.test(value)) {
        input.addClass('input-error');
        if(errorEl.length) errorEl.text(message).show();
        return false;
    }
    
    return true;
}

$(document).on('input', '.form-control', function() {
    const input = $(this);
    const name = input.attr('name');
    const inputId = input.attr('id') || "";
    const isEdit = inputId.includes('edit_');

    if (!inputId) return;

    switch(name) {
        case 'username': 
            validateFieldLive(input, /^[a-zA-Z0-9._]{3,20}$/, 'Mínimo 3 caracteres (letras, números o puntos)'); 
            break;
        case 'email': 
            validateFieldLive(input, emailRegex, 'Correo electrónico no válido', false); 
            break;
        case 'first_name': 
        case 'last_name': 
            validateFieldLive(input, nameRegex, 'Solo se permiten letras'); 
            break;
        case 'cedula': 
        case 'telefono': 
            input.val(input.val().replace(/\D/g, '')); 
            validateFieldLive(input, numeric10Regex, 'Deben ser 10 dígitos numéricos', (name === 'cedula')); 
            break;
        case 'password':
            const req = !isEdit; 
validateFieldLive(input, passwordRegex, 'Mín 8 chars: 1 Mayúscula, 1 Número, 1 Símbolo Especial (!@#$%^&*)', req);
            break;
    }
});

// 4. LÓGICA DE DATATABLES (CORREGIDA PARA 8 COLUMNAS)
$(document).ready(function() {
    const table = $('#tablaUsuarios').DataTable({
        responsive: true,
        autoWidth: false,
        language: { 
            "sSearch": "Buscar:", 
            "sZeroRecords": "No se encontraron resultados",
            "oPaginate": { "sNext": "Sig", "sPrevious": "Ant" }
        },
        order: [[0, "desc"]], // Ordenar por ID
        columnDefs: [{ orderable: false, targets: [7] }] // Acciones es la columna índice 7
    });

    // Filtro para el switch de inactivos
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        const mostrarSoloInactivos = $('#toggleInactivos').is(':checked');
        const textoEstado = (data[6] || "").trim(); // Columna Estado ahora es índice 6
        return mostrarSoloInactivos ? textoEstado === "Inactivo" : textoEstado === "Activo";
    });

    table.draw();
    $('#toggleInactivos').on('change', () => table.draw());

    // 5. ENVÍO DE FORMULARIOS POR AJAX
    $(document).on('submit', '#formAddUsuario, #formEditUsuario', function(e) {
        e.preventDefault();
        const form = $(this);
        let formValido = true;

        form.find('input[required], select[required]').each(function() {
            if (!$(this).val() || !$(this).val().trim()) {
                $(this).addClass('input-error');
                formValido = false;
            }
        });

        if (!formValido) {
            window.showToast('Por favor, revisa los campos obligatorios', 'error');
            return;
        }

        fetch(this.action, {
            method: 'POST',
            body: new FormData(this),
            headers: { 
                'X-Requested-With': 'XMLHttpRequest', 
                'X-CSRFToken': $('[name=csrfmiddlewaretoken]').val() 
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.showToast(data.message, 'success');
                setTimeout(() => window.location.reload(), 1200);
            } else {
                window.showToast(data.message || 'Error al procesar', 'error');
            }
        })
        .catch(() => window.showToast('Fallo de conexión con MySQL', 'error'));
    });
});

// 6. FUNCIONES DE MODALES
window.abrirModal = function(id) {
    const modal = $(`#${id}`);
    if (modal.length) {
        modal.css('display', 'flex').hide().fadeIn(250);
        document.body.style.overflow = 'hidden';
    }
};

window.cerrarModal = function(id) {
    const modal = $(`#${id}`);
    if (modal.length) {
        modal.fadeOut(200, function() {
            $(this).css('display', 'none');
            $(this).find('.error-message').hide().text('');
            $(this).find('.form-control').removeClass('input-error');
        });
        document.body.style.overflow = 'auto';
    }
};

window.abrirModalEditar = function(id) {
    if (!id) return;
    fetch(`/usuarios/detalle_json/${id}/`)
        .then(r => r.json())
        .then(data => {
            const f = $('#formEditUsuario');
            f.attr('action', `/usuarios/editar/${id}/`);
            $('#edit_username').val(data.username);
            $('#edit_email').val(data.email);
            $('#edit_first_name').val(data.first_name);
            $('#edit_last_name').val(data.last_name);
            $('#edit_cedula').val(data.cedula);
            $('#edit_telefono').val(data.telefono);
            $('#edit_rol').val(data.rol);
            $('#editUsuarioNombre').text(data.username);
            abrirModal('modalEdit');
        })
        .catch(() => window.showToast('Error al cargar datos desde MySQL', 'error'));
};

window.abrirModalEliminar = function(id, nombre) {
    $('#modalDelete').find('form').attr('action', `/usuarios/cambiar_estado/${id}/`);
    $('#nombreUsuarioEliminar').text(nombre);
    abrirModal('modalDelete');
};

window.abrirModalActivar = function(id, nombre) {
    $('#modalActivar').find('form').attr('action', `/usuarios/cambiar_estado/${id}/`);
    $('#nombreUsuarioActivar').text(nombre);
    abrirModal('modalActivar');
};