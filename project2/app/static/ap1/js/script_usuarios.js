/* ==================================================
   script_usuarios.js - Gestión de Usuarios BedCom
   ================================================== */

// 1. CONFIGURACIÓN DE REGEX (Validaciones)
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const numeric10Regex = /^\d{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?\":{}|<>])[A-Za-z\d!@#$%^&*(),.?\":{}|<>]{8,}$/;

// 2. SISTEMA DE NOTIFICACIONES (TOAST)
function mostrarNotificacion(titulo, mensaje, tipo = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed; top:25px; right:25px; z-index:999999; display:flex; flex-direction:column; gap:12px; pointer-events:none;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    const colorBorde = tipo === 'error' ? '#ef4444' : '#10b981';
    const icono = tipo === 'error' ? 'fa-times-circle' : 'fa-check-circle';

    toast.style.cssText = `
        background: #1a202c; color: white; min-width: 320px; max-width: 400px;
        border-left: 6px solid ${colorBorde}; padding: 18px; border-radius: 6px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.7); display: flex; flex-direction: column;
        pointer-events: auto; opacity: 0; transform: translateX(50px);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    
    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
            <i class="fas ${icono}" style="color:${colorBorde}; font-size:1.3rem;"></i>
            <strong style="font-size:0.95rem; text-transform:uppercase;">${titulo}</strong>
        </div>
        <div style="font-size:0.88rem; color:#d1d5db; padding-left:32px;">${mensaje}</div>
    `;
    
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 600);
    }, 5500);
}

// 3. VALIDACIÓN EN TIEMPO REAL
function validateFieldLive(input, validator, message, isRequired = true) {
    const value = input.val().trim();
    const inputId = input.attr('id');
    const errorEl = $(`#error_${inputId}`);
    input.removeClass('input-error');
    if(errorEl.length) errorEl.removeClass('show').text('');
    
    if (!value && isRequired) {
        input.addClass('input-error');
        if(errorEl.length) errorEl.text('Campo requerido').addClass('show');
        return false;
    }
    if (value && validator && !validator.test(value)) {
        input.addClass('input-error');
        if(errorEl.length) errorEl.text(message).addClass('show');
        return false;
    }
    return true;
}

$(document).on('input', '.form-control', function() {
    const name = $(this).attr('name');
    const formId = $(this).closest('form').attr('id');
    const isAdd = formId === 'formAddUsuario';

    switch(name) {
        case 'username': validateFieldLive($(this), /.{3,}/, 'Mínimo 3 caracteres'); break;
        case 'email': validateFieldLive($(this), emailRegex, 'Email inválido', false); break;
        case 'password': validateFieldLive($(this), passwordRegex, 'Mín 8: Mayús, Núm, Especial', isAdd); break;
        case 'first_name': case 'last_name': validateFieldLive($(this), nameRegex, 'Solo letras'); break;
        case 'cedula': case 'telefono': 
            $(this).val($(this).val().replace(/\D/g, ''));
            validateFieldLive($(this), numeric10Regex, 'Deben ser 10 dígitos', false); 
            break;
    }
});

// 4. LÓGICA DE DATATABLES Y FORMULARIOS
$(document).ready(function() {
    const table = $('#tablaUsuarios').DataTable({
        responsive: true,
        autoWidth: false,
        language: { "sSearch": "Buscar:", "sZeroRecords": "No se encontraron resultados" },
        order: [[1, "asc"]],
        columnDefs: [{ orderable: false, targets: [7] }]
    });

    // FILTRO BLINDADO (Columna 6: Estado)
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        const showAll = $('#toggleInactivos').is(':checked');
        if (showAll) return true;

        // Limpiamos el texto que hay en la celda de la columna 6
        const textoEstado = (data[6] || "").trim().toLowerCase();

        // Si la celda dice "activo", "1" o "true", se muestra. Si no, se oculta.
        return textoEstado === "activo" || textoEstado === "1" || textoEstado === "true";
    });

    $('#toggleInactivos').on('change', function() { table.draw(); });

    // Submit AJAX para Crear/Editar
    $(document).on('submit', '#formAddUsuario, #formEditarUsuario', function(e) {
        e.preventDefault();
        let errores = [];
        const form = $(this);
        form.find('.form-control').removeClass('input-error');

        form.find('input[required]').each(function() {
            if (!$(this).val().trim()) {
                errores.push($(this).closest('.form-group').find('label').text().replace('*','').trim());
                $(this).addClass('input-error');
            }
        });

        if (errores.length > 0) {
            mostrarNotificacion('Atención', 'Faltan campos: ' + errores.join(', '), 'error');
            return;
        }

        fetch(this.action, {
            method: 'POST',
            body: new FormData(this),
            headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRFToken': $('[name=csrfmiddlewaretoken]').val() }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Éxito', 'Guardado correctamente', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                throw data;
            }
        })
        .catch(err => {
            let msg = err.errors ? Object.values(err.errors).flat().join(' | ') : "Error al procesar";
            mostrarNotificacion('Error', msg, 'error');
        });
    });
});

// 5. FUNCIONES DE MODALES
window.abrirModal = function(id) {
    const m = document.getElementById(id);
    if(m) { 
        m.style.display = 'flex'; 
        document.body.style.overflow = 'hidden';
    }
};

window.cerrarModal = function(id) {
    const m = document.getElementById(id);
    if(m) { m.style.display = 'none'; document.body.style.overflow = 'auto'; }
};

window.abrirModalEditar = function(id) {
    fetch(`/usuarios/detalle_json/${id}/`)
        .then(r => r.json())
        .then(data => {
            const f = document.getElementById('formEditarUsuario');
            f.action = `/usuarios/editar/${id}/`;
            // Sincronizado con los campos de tu DB
            $('[name="username"]', f).val(data.username);
            $('[name="email"]', f).val(data.email);
            $('[name="first_name"]', f).val(data.first_name);
            $('[name="last_name"]', f).val(data.last_name);
            $('[name="cedula"]', f).val(data.cedula);
            $('[name="telefono"]', f).val(data.telefono);
            $('[name="rol"]', f).val(data.rol);
            abrirModal('modalEditar');
        })
        .catch(() => mostrarNotificacion('Error', 'No se pudo cargar el usuario', 'error'));
};

window.abrirModalEliminar = function(id, nombre) {
    const modal = document.getElementById('modalDelete');
    if (modal) {
        modal.querySelector('form').action = `/usuarios/cambiar_estado/${id}/`;
        const txt = document.getElementById('nombreUsuarioEliminar');
        if (txt) txt.textContent = nombre;
        abrirModal('modalDelete');
    }
};

window.abrirModalActivar = function(id, nombre) {
    const modal = document.getElementById('modalActivar');
    if (modal) {
        modal.querySelector('form').action = `/usuarios/cambiar_estado/${id}/`;
        const txt = document.getElementById('nombreUsuarioActivar');
        if (txt) txt.textContent = nombre;
        abrirModal('modalActivar');
    }
};