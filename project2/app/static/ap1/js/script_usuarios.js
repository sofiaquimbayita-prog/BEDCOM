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

// 4. LÓGICA DE DATATABLES Y FILTRADO EXCLUYENTE
$(document).ready(function() {
    const table = $('#tablaUsuarios').DataTable({
        responsive: true,
        autoWidth: false,
        language: { 
            "sSearch": "Buscar:", 
            "sZeroRecords": "No se encontraron resultados",
            "oPaginate": { "sNext": "Sig", "sPrevious": "Ant" }
        },
        order: [[0, "desc"]], 
        columnDefs: [{ orderable: false, targets: [7] }]
    });

    // --- FILTRO LÓGICO (Columna 6: Estado) ---
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        const mostrarSoloInactivos = $('#toggleInactivos').is(':checked');
        const textoEstado = (data[6] || "").trim();

        if (mostrarSoloInactivos) {
            return textoEstado === "Inactivo"; 
        } else {
            return textoEstado === "Activo";   
        }
    });

    // CORRECCIÓN: Forzar el dibujo inicial para aplicar el filtro de "Solo Activos"
    table.draw();

    // Redibujar al cambiar el switch
    $('#toggleInactivos').on('change', function() {
        table.draw();
    });

    // 5. SUBMIT AJAX (Crear/Editar)
    $(document).on('submit', '#formAddUsuario, #formEditarUsuario', function(e) {
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
            mostrarNotificacion('Atención', 'Por favor completa los campos obligatorios (*)', 'error');
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
        .then(response => {
            if (!response.ok) return response.json().then(err => { throw err; });
            return response.json();
        })
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Éxito', data.message || 'Guardado correctamente', 'success');
                setTimeout(() => window.location.reload(), 1200);
            }
        })
        .catch(err => {
            console.error("Error en servidor:", err);
            let msgFinal = "Error al procesar la solicitud";
            
            if (err.errors) {
                msgFinal = Object.entries(err.errors)
                    .map(([campo, mensajes]) => `${campo.toUpperCase()}: ${mensajes.join(' ')}`)
                    .join('<br>');
            }
            mostrarNotificacion('Error', msgFinal, 'error');
        });
    });
});

// 6. FUNCIONES DE MODALES
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
            const f = $('#formEditarUsuario');
            f.attr('action', `/usuarios/editar/${id}/`);
            
            f.find('[name="username"]').val(data.username);
            f.find('[name="email"]').val(data.email);
            f.find('[name="first_name"]').val(data.first_name);
            f.find('[name="last_name"]').val(data.last_name);
            f.find('[name="cedula"]').val(data.cedula);
            f.find('[name="telefono"]').val(data.telefono);
            f.find('[name="rol"]').val(data.rol);
            
            abrirModal('modalEditar');
        })
        .catch(() => mostrarNotificacion('Error', 'No se pudo cargar la información', 'error'));
};

window.abrirModalEliminar = function(id, nombre) {
    const modal = document.getElementById('modalDelete');
    if (modal) {
        modal.querySelector('form').action = `/usuarios/cambiar_estado/${id}/`;
        $('#nombreUsuarioEliminar').text(nombre);
        abrirModal('modalDelete');
    }
};

window.abrirModalActivar = function(id, nombre) {
    const modal = document.getElementById('modalActivar');
    if (modal) {
        modal.querySelector('form').action = `/usuarios/cambiar_estado/${id}/`;
        $('#nombreUsuarioActivar').text(nombre);
        abrirModal('modalActivar');
    }
};