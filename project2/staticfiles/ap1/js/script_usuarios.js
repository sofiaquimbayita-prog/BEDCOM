/* ==================================================
   script_usuarios.js - Control de Usuarios BedCom
   ================================================== */

/**
 * Función para mostrar notificaciones tipo toast
 * Es una réplica exacta de la lógica de productos para mantener consistencia.
 *
 */
function mostrarNotificacion(titulo, mensaje, tipo) {
    // Busca el contenedor de mensajes definido en el bloque messages de listar.html
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'messages-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    // Mapeo de tipos para clases CSS
    const tipoClase = (tipo === 'correcto' || tipo === 'success') ? 'success' : tipo;
    toast.className = `message ${tipoClase}`;
    
    const icon = tipoClase === 'success' ? 'fa-check-circle' : 
                 tipoClase === 'error' ? 'fa-times-circle' : 'fa-info-circle';

    toast.innerHTML = `
        <div class="message-content">
            <i class="fas ${icon}"></i>
            <span class="text"><strong>${titulo}:</strong> ${mensaje}</span>
        </div>
        <button type="button" class="close-toast" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);

    // Auto-eliminar después de 4 segundos (igual que en productos)
    setTimeout(() => {
        if (toast && toast.parentElement) {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

$(document).ready(function() {
    
    // 1. INICIALIZACIÓN DE DATATABLE
    // Se asegura de destruir instancias previas para evitar el error de "re-initialization"
    if ($.fn.dataTable.isDataTable('#tablaUsuarios')) {
        $('#tablaUsuarios').DataTable().destroy();
    }

    // 2. LÓGICA DE FILTRADO (Columna 6: Estado)
    // Filtra en tiempo real según el switch de "Mostrar inactivos"
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        if (settings.nTable.id !== 'tablaUsuarios') return true;

        const mostrarInactivos = $('#toggleInactivos').is(':checked');
        const estadoRaw = data[6].toLowerCase().trim();

        if (!mostrarInactivos) {
            // Si el switch está apagado, solo muestra los que dicen "activo"
            return estadoRaw.includes('activo');
        }
        return true; // Si está encendido, muestra todos
    });

    // 3. CONFIGURACIÓN DE DATATABLES
    const table = $('#tablaUsuarios').DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 10,
        order: [[1, "asc"]], // Ordenar por nombre de usuario por defecto
        language: {
            url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
        },
        columnDefs: [
            { orderable: false, targets: [7] } // Deshabilitar orden en columna 'Acciones'
        ],
        dom: '<"top"f>rt<"bottom"lip><"clear">'
    });

    // Redibujar tabla al cambiar el switch
    $('#toggleInactivos').on('change', function() {
        table.draw();
    });

    // 4. CERRAR TOASTS EXISTENTES (Cargados desde Django Messages)
    window.cerrarToast = function(btn) {
        const toast = btn.parentElement;
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    };
});

/**
 * GESTIÓN DE MODALES
 * Controla la visualización y el scroll del body para evitar saltos visuales.
 *
 */
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Bloquea el scroll de la tabla al fondo
    }
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaura el scroll
    }
}

// Funciones dinámicas para los formularios de cambio de estado
function abrirModalEliminar(id, nombre) {
    const spanNombre = document.getElementById('nombreEliminar');
    const form = document.getElementById('formEliminar');
    
    if (spanNombre) spanNombre.textContent = nombre;
    if (form) form.action = `/usuarios/cambiar_estado/${id}/`;
    
    abrirModal('modalDelete');
}

function abrirModalActivar(id, nombre) {
    const spanNombre = document.getElementById('nombreActivar');
    const form = document.getElementById('formActivar');
    
    if (spanNombre) spanNombre.textContent = nombre;
    if (form) form.action = `/usuarios/cambiar_estado/${id}/`;
    
    abrirModal('modalActivar');
}

// CERRAR MODAL AL HACER CLIC FUERA DEL CONTENIDO
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};