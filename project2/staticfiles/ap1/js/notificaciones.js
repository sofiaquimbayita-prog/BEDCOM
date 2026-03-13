// notificaciones.js - Optimizado sin reload page, UI updates
// DataTable, modals, AJAX smooth

let table; // global for access

$(document).ready(function() {
    // DataTable config
    table = $('#tablaNotificaciones').DataTable({
        responsive: true,
        pageLength: 25,
        order: [[0, 'desc']],
        language: { 
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        columnDefs: [
            { targets: 3, orderable: false }
        ],
        drawCallback: function() {
            // Rebind onclick after draw
            bindActionButtons();
        }
    });

    // Toggle leídas
    $('#toggleLeidas').change(function() {
        const searchTerm = $(this).is(':checked') ? 'Leída' : 'Nueva';
        table.column(2).search(searchTerm).draw();
    });

    // Close toast
    $(document).on('click', '.close-toast', function() {
        $(this).closest('.message').fadeOut();
    });
});

// Rebind buttons after table draw
function bindActionButtons() {
    $('.delete-btn').off('click').on('click', function() {
        const $tr = $(this).closest('tr');
        const id = $tr.data('id');
        eliminarNotificacion(id, $tr);
    });
}

// Modal functions
function abrirModalVerNotif(id, titulo, mensaje) {
    $('#modalTituloNotif').text(titulo);
    $('#modalMensajeNotif').text(mensaje);
    $('#modalVerNotif').fadeIn();
    
    // Mark read
    $.post(`/app/notificaciones/mark-read/${id}/`, {csrfmiddlewaretoken: getCsrfToken()})
        .done(function(data) {
            if (data.success) {
                $(`tr[data-id="${id}"] .badge`).removeClass('bg-warning').addClass('bg-success').text('Leída');
                $(`tr[data-id="${id}"]`).removeClass('bold').addClass('leida');
            }
        });
}

function cerrarModal(idModal) {
    $('#' + idModal).fadeOut();
}

function marcarTodasLeidas() {
    if (confirm('¿Marcar todas como leídas?')) {
        $.post('{% url "notificacion_mark_all_read" %}', {csrfmiddlewaretoken: getCsrfToken()})
            .done(function() {
                table.column(2).search('Leída').draw();
                $('.stat-badge.no-leidas').text('0 no leídas');
                showToast('Todas marcadas como leídas', 'success');
            })
            .fail(function() {
                showToast('Error al marcar', 'error');
            });
    }
}

function eliminarNotificacion(id, $tr) {
    if (confirm('¿Eliminar notificación?')) {
        $.post(`/app/notificaciones/delete/${id}/`, {csrfmiddlewaretoken: getCsrfToken()})
            .done(function(data) {
                if (data.success) {
                    table.row($tr).remove().draw();
                    showToast(data.message, 'success');
                } else {
                    showToast(data.message || 'Error', 'error');
                }
            })
            .fail(function() {
                showToast('Error al eliminar', 'error');
            });
}

// CSRF util
function getCsrfToken() {
    return $('[name=csrfmiddlewaretoken]').val() || getCookie('csrftoken');
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Toast
function showToast(message, type = 'info') {
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
    const toast = `
        <div class="message ${type}">
            <div class="message-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="close-toast">×</button>
        </div>`;
    $('#toast-container').append(toast);
    setTimeout(() => $('.message').last().fadeOut(() => $(this).remove()), 4000);
}

