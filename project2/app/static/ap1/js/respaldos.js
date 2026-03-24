$(document).ready(function() {
    

    // ================= FILTROS =================
    function filtrarTabla() {
        const busqueda = $('#searchInput').val().toLowerCase().trim();
        const mostrarSoloInactivos = $('#toggleInactivos').is(':checked');
        
        $('.respaldo-row').each(function() {
            const $fila = $(this);
            const textoFila = $fila.text().toLowerCase();
            const esInactiva = $fila.hasClass('inactive-row');
            
            // Toggle OFF: mostrar solo activos (los que NO tienen inactive-row)
            // Toggle ON: mostrar solo inactivos (los que SÍ tienen inactive-row)
            const coincideEstado = mostrarSoloInactivos ? esInactiva : !esInactiva;
            const coincideBusqueda = textoFila.includes(busqueda);

            if (coincideEstado && coincideBusqueda) {
                $fila.show();
            } else {
                $fila.hide();
            }
        });
        
        // Ocultar fila vacía si hay resultados
        const visibleRows = $('.respaldo-row:visible').length;
        if (visibleRows === 0) {
            $('.empty-row').show();
        } else {
            $('.empty-row').hide();
        }
    }


    // Event listeners para filtros
    $('#searchInput').on('keyup', filtrarTabla);
    $('#toggleInactivos').on('change', filtrarTabla);

    // ================= MODALES =================
    
    // Abrir modal con animación
    window.abrirModal = function(id) {
        const $modal = $(`#${id}`);
        $modal.css('display', 'flex').hide().fadeIn(200);
        $('body').css('overflow', 'hidden'); // Evitar scroll
        
        // Limpiar validaciones al abrir modal de generar
        if (id === 'generarModal') {
            limpiarValidacionDescripcion();
            $('#add_descripcion').val('');
            $('#add_tipo').val('');
        }
    };

    // Cerrar modal
    window.cerrarModal = function(id) {
        const $modal = $(`#${id}`);
        $modal.fadeOut(200, function() {
            $('body').css('overflow', 'auto');
        });
    };

    // Cerrar modal al hacer click fuera (en el overlay)
    $('.modal').on('click', function(e) {
        if ($(e.target).hasClass('modal')) {
            const modalId = $(this).attr('id');
            cerrarModal(modalId);
        }
    });

    // Cerrar modal con tecla Escape
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('.modal:visible').each(function() {
                const modalId = $(this).attr('id');
                cerrarModal(modalId);
            });
        }
    });

    // ================= VALIDACIONES DEL FORMULARIO =================
    
    // Función para filtrar caracteres no válidos en tiempo real
    function filtrarCaracteresInvalidos(input) {
        // Regex que solo permite: letras (incluyendo acentos), números y espacios
        const regexFiltro = /[^a-zA-Z0-9\sÁÉÍÓÚáéíóúÑñ]/g;
        return input.replace(regexFiltro, '');
    }
    
    // Función para validar descripción en tiempo real
    function validarDescripcion() {
        const $input = $('#add_descripcion');
        const $errorDiv = $('#descripcion-error');
        let descripcion = $input.val();
        
        // Eliminar espacios al inicio y final para la validación
        const descripcionTrimmed = descripcion.trim();
        
        // Si no existe el div de error, crearlo
        if (!$errorDiv.length) {
            $input.after('<div id="descripcion-error" class="error-message" style="color: #ef4444; font-size: 0.85rem; margin-top: 5px;"></div>');
        }
        
        const $newErrorDiv = $('#descripcion-error');
        
        // Validación 1: Campo obligatorio
        if (!descripcionTrimmed) {
            $newErrorDiv.html('<i class="fas fa-exclamation-circle"></i> La descripción es obligatoria.');
            $input.css('border-color', '#ef4444');
            return false;
        }
        
        // Validación 2: No permitir solo espacios
        if (descripcionTrimmed.isspace()) {
            $newErrorDiv.html('<i class="fas fa-exclamation-circle"></i> La descripción no puede contener solo espacios.');
            $input.css('border-color', '#ef4444');
            return false;
        }
        
        // Validación 3: Longitud mínima (5 caracteres)
        if (descripcionTrimmed.length < 5) {
            $newErrorDiv.html('<i class="fas fa-exclamation-circle"></i> La descripción debe tener al menos 5 caracteres.');
            $input.css('border-color', '#ef4444');
            return false;
        }
        
        // Validación 4: Longitud máxima (255 caracteres)
        if (descripcionTrimmed.length > 255) {
            $newErrorDiv.html('<i class="fas fa-exclamation-circle"></i> La descripción no puede superar los 255 caracteres.');
            $input.css('border-color', '#ef4444');
            return false;
        }
        
        // Validación 5: Solo caracteres válidos (letras, números, espacios y acentos)
        const regexValida = /^[a-zA-Z0-9\sÁÉÍÓÚáéíóúÑñ]+$/;
        if (!regexValida.test(descripcionTrimmed)) {
            $newErrorDiv.html('<i class="fas fa-exclamation-circle"></i> La descripción solo puede contener letras, números y espacios. No se permiten caracteres especiales.');
            $input.css('border-color', '#ef4444');
            return false;
        }
        
        // Validación 6: Debe contener al menos una letra
        const regexLetra = /[a-zA-ZÁÉÍÓÚáéíóúÑñ]/;
        if (!regexLetra.test(descripcionTrimmed)) {
            $newErrorDiv.html('<i class="fas fa-exclamation-circle"></i> La descripción debe contener al menos una letra.');
            $input.css('border-color', '#ef4444');
            return false;
        }
        
        // Si pasa todas las validaciones
        $newErrorDiv.html('');
        $input.css('border-color', '#22c55e'); // Verde de éxito
        return true;
    }
    
    // Función para limpiar mensajes de validación
    function limpiarValidacionDescripcion() {
        $('#descripcion-error').remove();
        $('#add_descripcion').css('border-color', '#334155');
    }
    
    // Validar tipo de respaldo
    function validarTipoRespaldo() {
        const $select = $('#add_tipo');
        const valor = $select.val();
        
        if (!valor) {
            $select.css('border-color', '#ef4444');
            return false;
        }
        
        $select.css('border-color', '#22c55e');
        return true;
    }
    
    // Event listeners para validación en tiempo real
    $('#add_descripcion').on('input', function() {
        // FILTRAR activamente caracteres inválidos mientras escribe
        const cursorPosition = this.selectionStart;
        const originalValue = $(this).val();
        
        // Filtrar caracteres no válidos
        const filteredValue = filtrarCaracteresInvalidos(originalValue);
        
        // Trim automático
        const trimmedValue = filteredValue.trim();
        
        // Si hubo cambios (caracteres filtrados o espacios), actualizar el valor
        if (originalValue !== trimmedValue) {
            $(this).val(trimmedValue);
            // Mantener posición del cursor
            this.setSelectionRange(cursorPosition, cursorPosition);
        }
        
        validarDescripcion();
    });
    
    $('#add_descripcion').on('blur', function() {
        // Filtrar y hacer trim al perder el foco
        const valor = $(this).val();
        const filtrado = filtrarCaracteresInvalidos(valor).trim();
        $(this).val(filtrado);
        validarDescripcion();
    });
    
    $('#add_tipo').on('change', function() {
        validarTipoRespaldo();
    });
    
    // Validar todo el formulario antes de enviar
    $('#generarRespaldoForm').on('submit', function(e) {
        const descripcionValida = validarDescripcion();
        const tipoValido = validarTipoRespaldo();
        
        if (!descripcionValida || !tipoValido) {
            e.preventDefault();
            
            // Mostrar mensaje de error general si no hay errores específicos
            if (!$('#descripcion-error').text() && !$('#add_tipo').val()) {
                alert('Por favor, completa todos los campos requeridos.');
            }
        }
    });

    // ================= VER DETALLES =================
    window.openViewModal = function(fecha, usuario, tipo, desc) {
        $('#viewFecha').text(fecha);
        $('#viewUsuario').text(usuario);
        $('#viewTipo').text(tipo.toUpperCase()).attr('class', 'badge-movimiento badge-' + tipo.toLowerCase());
        $('#viewDescripcion').text(desc || 'Sin descripción');
        abrirModal('viewModal');
    };

    // ================= INACTIVAR =================
    window.openDeleteModal = function(id, fecha) {
        const $modal = $('#deleteModal');
        
        // Configurar contenido
        $modal.find('.modal-header h3').html('<i class="fas fa-trash"></i> ¿Inactivar Respaldo?');
        $modal.find('.delete-container p').first().html(
            `¿Estás seguro de que deseas inactivar el respaldo del <strong>${fecha}</strong>?`
        );
        
        // Configurar botón
        $modal.find('.btn-delete')
              .html('<i class="fas fa-trash-alt"></i> Confirmar Inactivación')
              .css('background', 'linear-gradient(135deg, #f87171, #ef4444)');
        
        // Configurar formulario
        $modal.find('#deleteForm').attr('action', `/vistas/respaldos/inactivar/${id}/`);
        
        abrirModal('deleteModal');
    };

    // ================= REACTIVAR =================
    window.openRestoreModal = function(id, fecha) {
        const $modal = $('#deleteModal');
        
        // Configurar contenido
        $modal.find('.modal-header h3').html('<i class="fas fa-undo"></i> ¿Reactivar Respaldo?');
        $modal.find('.delete-container p').first().html(
            `Vas a reactivar el respaldo del <strong>${fecha}</strong>. ¿Continuar?`
        );
        
        // Configurar botón
        $modal.find('.btn-delete')
              .html('<i class="fas fa-check"></i> Reactivar Ahora')
              .css('background', 'linear-gradient(135deg, #4ade80, #22c55e)');
        
        // Configurar formulario
        $modal.find('#deleteForm').attr('action', `/vistas/respaldos/reactivar/${id}/`);
        
        abrirModal('deleteModal');
    };

    // ================= TOAST NOTIFICATIONS =================
    window.cerrarToast = function(btn) {
        const toast = $(btn).closest('.message');
        toast.fadeOut(300, function() { $(this).remove(); });
    };

    // Auto cerrar toast después de 5 segundos
    setTimeout(() => {
        $('.message').fadeOut(500, function() { $(this).remove(); });
    }, 5000);

    // ================= TIPO DE RESPALDO =================

    $(document).on('change', '#add_tipo', function(){

        const tipo = $(this).val();

        if(tipo === "parcial"){
            $('#modulosContainer').slideDown(200);
        }else{
            $('#modulosContainer').slideUp(200);
        }

    });

    // ================= SELECCION DE MODULOS =================

    $(document).on('click', '.modulo-card', function(e){

        if(e.target.tagName !== "INPUT"){

            const checkbox = $(this).find('input');

            checkbox.prop('checked', !checkbox.prop('checked'));

        }

        $(this).toggleClass('active');

    });

    // ================= SELECCION TIPO RESPALDO =================

    $(document).on('click', '.tipo-card', function(){

        $('.tipo-card').removeClass('active');

        $(this).addClass('active');

        const valor = $(this).data('value');

        $('#add_tipo').val(valor).trigger('change');

    });

    // ================= INICIALIZACIÓN =================
    filtrarTabla();
    
    console.log('Respaldos JS loaded successfully');
});

