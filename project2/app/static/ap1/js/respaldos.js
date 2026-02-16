$(document).ready(function() {
    
    // ==========================================
    // 1. FILTRADO MAESTRO (Buscador + Switch)
    // ==========================================
    function filtrarTabla() {
        // Buscador de abajo (el de la card)
        const busqueda = $('#searchInput').val().toLowerCase().trim();
        // Estado del switch
        const mostrarInactivos = $('#toggleInactivos').is(':checked');
        
        $('.respaldo-row').each(function() {
            const $fila = $(this);
            const textoFila = $fila.text().toLowerCase();
            const esInactiva = $fila.hasClass('inactive-row');

            // Lógica: 
            // Si el switch está ON, buscamos en filas inactivas.
            // Si el switch está OFF, buscamos en filas activas.
            const coincideEstado = mostrarInactivos ? esInactiva : !esInactiva;
            const coincideBusqueda = textoFila.includes(busqueda);

            if (coincideEstado && coincideBusqueda) {
                $fila.show();
            } else {
                $fila.hide();
            }
        });
    }

    $('#searchInput').on('keyup', filtrarTabla);
    $('#toggleInactivos').on('change', filtrarTabla);

    // ==========================================
    // 2. GESTIÓN DE MODALES
    // ==========================================

    // Abrir Modal de Ver Detalles
    window.openViewModal = function(fecha, usuario, tipo, desc) {
        $('#viewFecha').text(fecha);
        $('#viewUsuario').text(usuario);
        $('#viewTipo').text(tipo.toUpperCase());
        $('#viewDescripcion').text(desc || 'Sin descripción');
        abrirModal('viewModal');
    };

    // Abrir Modal de Eliminar (Inactivar)
    window.openDeleteModal = function(id, fecha) {
        const $modal = $('#deleteModal');
        // Cambiamos el texto para que sea de eliminación
        $modal.find('.modal-header h3').html('<i class="fas fa-trash"></i> ¿Eliminar Respaldo?');
        $modal.find('.delete-container p').first().html(`¿Estás seguro de que deseas eliminar el respaldo del <strong>${fecha}</strong>?`);
        
        // Cambiamos el botón a color Rojo (Danger)
        $modal.find('.btn-delete')
              .text('Confirmar Eliminación')
              .css('background', 'linear-gradient(135deg, #f87171, #ef4444)');
        
        // Ajustamos la URL de acción a eliminar
        $modal.find('#deleteForm').attr('action', `/vistas/respaldos/eliminar/${id}/`);
        
        abrirModal('deleteModal');
    };

    // Abrir Modal de Restaurar (Reactivar)
    window.openRestoreModal = function(id, fecha) {
        const $modal = $('#deleteModal');
        // Cambiamos el texto para que sea de restauración
        $modal.find('.modal-header h3').html('<i class="fas fa-undo"></i> ¿Restaurar Respaldo?');
        $modal.find('.delete-container p').first().html(`Vas a reactivar el respaldo del <strong>${fecha}</strong>.`);
        

        $modal.find('.btn-delete')
              .text('Restaurar Ahora')
              .css('background', 'linear-gradient(135deg, #64e73c, #10b981)');
        
        // Ajustamos la URL de acción a restaurar (Esto arregla tu error 404)
        $modal.find('#deleteForm').attr('action', `/vistas/respaldos/restaurar/${id}/`);
        
        abrirModal('deleteModal');
    };

    // Funciones básicas de control
    window.abrirModal = function(id) {
        $(`#${id}`).css('display', 'flex').hide().fadeIn(200);
    };

    window.cerrarModal = function(id) {
        $(`#${id}`).fadeOut(200);
    };

    // Cerrar modales al hacer clic fuera
    $(window).on('click', function(event) {
        if ($(event.target).hasClass('modal')) {
            $('.modal').fadeOut(200);
        }
    });

    // ==========================================
    // 3. MENSAJES (TOASTS)
    // ==========================================
    window.cerrarToast = function(btn) {
        const toast = $(btn).closest('.message');
        toast.fadeOut(300, function() { $(this).remove(); });
    };

    // Auto-cerrar mensajes después de 5 segundos
    setTimeout(() => {
        $('.message').fadeOut(500, function() { $(this).remove(); });
    }, 5000);

    // Ejecutar filtro inicial al cargar la página
    filtrarTabla();
});