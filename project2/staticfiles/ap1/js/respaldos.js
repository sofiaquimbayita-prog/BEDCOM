$(document).ready(function() {
   
    function filtrarTabla() {
        const busqueda = $('#searchInput').val().toLowerCase().trim();
        const mostrarInactivos = $('#toggleInactivos').is(':checked');
        
        $('.respaldo-row').each(function() {
            const $fila = $(this);
            const textoFila = $fila.text().toLowerCase();
            const esInactiva = $fila.hasClass('inactive-row');

      
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

   
    window.openViewModal = function(fecha, usuario, tipo, desc) {
        $('#viewFecha').text(fecha);
        $('#viewUsuario').text(usuario);
        $('#viewTipo').text(tipo.toUpperCase());
        $('#viewDescripcion').text(desc || 'Sin descripción');
        abrirModal('viewModal');
    };

    window.openDeleteModal = function(id, fecha) {
        const $modal = $('#deleteModal');
        $modal.find('.modal-header h3').html('<i class="fas fa-trash"></i> ¿inactivar Respaldo?');
        $modal.find('.delete-container p').first().html(`¿Estás seguro de que deseas inactivar el respaldo del <strong>${fecha}</strong>?`);
        
        $modal.find('.btn-delete')
              .text('Confirmar inactivacion')
              .css('background', 'linear-gradient(135deg, #f87171, #ef4444)');
        
        $modal.find('#deleteForm').attr('action', `/vistas/respaldos/eliminar/${id}/`);
        
        abrirModal('deleteModal');
    };

    window.openRestoreModal = function(id, fecha) {
        const $modal = $('#deleteModal');
        $modal.find('.modal-header h3').html('<i class="fas fa-undo"></i> ¿Restaurar Respaldo?');
        $modal.find('.delete-container p').first().html(`Vas a reactivar el respaldo del <strong>${fecha}</strong>.`);
        

        $modal.find('.btn-delete')
              .text('Restaurar Ahora')
              .css('background', 'linear-gradient(135deg, #64e73c, #10b981)');
        
        $modal.find('#deleteForm').attr('action', `/vistas/respaldos/restaurar/${id}/`);
        
        abrirModal('deleteModal');
    };

    window.abrirModal = function(id) {
        $(`#${id}`).css('display', 'flex').hide().fadeIn(200);
    };

    window.cerrarModal = function(id) {
        $(`#${id}`).fadeOut(200);
    };


    window.cerrarToast = function(btn) {
        const toast = $(btn).closest('.message');
        toast.fadeOut(300, function() { $(this).remove(); });
    };

    setTimeout(() => {
        $('.message').fadeOut(500, function() { $(this).remove(); });
    }, 5000);

    filtrarTabla();
});