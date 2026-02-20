$(document).ready(function () {
    const BASE = { background: '#1b2537', color: '#e9eef7' };

    const Alerta = {
        exito(titulo, texto) {
            return Swal.fire({ ...BASE, icon: 'success', title: titulo, text: texto,
                timer: 2200, timerProgressBar: true, showConfirmButton: false });
        },
        advertencia(titulo, texto) {
            return Swal.fire({ ...BASE, icon: 'warning', title: titulo, text: texto,
                confirmButtonColor: '#f1c40f', confirmButtonText: 'Entendido' });
        },
        error(titulo, texto) {
            return Swal.fire({ ...BASE, icon: 'error', title: titulo, text: texto,
                confirmButtonColor: '#e74c3c', confirmButtonText: 'Cerrar' });
        },
        confirmarEliminar(nombre) {
            return Swal.fire({ ...BASE, icon: 'warning', title: '¿Eliminar insumo?',
                html: `Se eliminará <strong>"${nombre}"</strong>.<br>Esta acción no se puede deshacer.`,
                showCancelButton: true, confirmButtonColor: '#e74c3c', cancelButtonColor: '#4ea3a5',
                confirmButtonText: '<i class="fa-solid fa-trash-can"></i> Sí, eliminar',
                cancelButtonText: 'Cancelar', reverseButtons: true });
        },
    };

    const modal      = $('#modal-insumo');
    const form       = document.getElementById('form-insumo');
    const tituloModal = document.getElementById('modal-titulo');


    function mostrarError(fieldId, mensaje) {
        const $field = $('#' + fieldId);
        $field.addClass('input-error').attr('aria-invalid', 'true');
        const $grupo = $field.closest('.form-grupo');
        $grupo.find('.msg-error').remove();
        $grupo.append(`
            <span class="msg-error" role="alert" aria-live="assertive">
                <i class="fa-solid fa-triangle-exclamation"></i> ${mensaje}
            </span>`);
    }

    function limpiarEstado(fieldId) {
        const $field = $('#' + fieldId);
        $field.removeClass('input-error input-ok').removeAttr('aria-invalid');
        $field.closest('.form-grupo').find('.msg-error').remove();
    }

    function limpiarTodosLosErrores() {
        ['in_nombre', 'in_descripcion', 'in_cantidad', 'in_precio', 'in_unidad'].forEach(limpiarEstado);
    }


    const CAMPO_A_INPUT = {
        nombre:       'in_nombre',
        descripcion:  'in_descripcion',
        cantidad:     'in_cantidad',
        precio:       'in_precio',
        unidad_medida:'in_unidad',
    };

    function mostrarErroresBackend(errores) {
        let errorGeneral = null;
        Object.entries(errores).forEach(([campo, mensaje]) => {
            if (campo === '__all__') { errorGeneral = mensaje; return; }
            const inputId = CAMPO_A_INPUT[campo];
            if (inputId) mostrarError(inputId, mensaje);
        });
        const $primero = $('.form-input.input-error, .form-select.input-error').first();
        if ($primero.length) $primero.focus();
        if (errorGeneral) Alerta.advertencia('No se pudo guardar', errorGeneral);
    }


    $('#in_nombre').on('input', function () {
        limpiarEstado('in_nombre');
        const len = $(this).val().trim().length;
        let $c = $('#contador-nombre');
        if (!$c.length) {
            $c = $('<span id="contador-nombre" class="campo-contador"></span>');
            $(this).parent().append($c);
        }
        $c.text(len + '/100').toggleClass('contador-alerta', len > 90);
    });

    $('#in_descripcion').on('input', function () {
        limpiarEstado('in_descripcion');
        const len = ($(this).val() || '').trim().length;
        let $c = $('#contador-descripcion');
        if (!$c.length) {
            $c = $('<span id="contador-descripcion" class="campo-contador"></span>');
            $(this).parent().append($c);
        }
        $c.text(len + '/500').toggleClass('contador-alerta', len > 480);
    });

    $('#in_cantidad').on('input', function () { limpiarEstado('in_cantidad'); });
    $('#in_precio').on('input',   function () { limpiarEstado('in_precio'); });
    $('#in_unidad').on('input',   function () { limpiarEstado('in_unidad'); });

 
    const tabla = $('#tablaInsumos').DataTable({
        ajax: INSUMOS_DATA_URL,
        columns: [
            { data: 'nombre' },
            { data: 'categoria' },
            { data: 'cantidad' },
            { data: 'unidad' },
            { data: 'precio' },
            { data: 'proveedor' },
            { data: 'estado' },
            { data: 'id', render: (data) => `
                <div class="acciones-tabla">
                    <button class="btn-accion btn-editar"  title="Editar"   onclick="editarInsumo(${data})">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-accion btn-eliminar" title="Eliminar" onclick="eliminarInsumo(${data})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>`
            }
        ],
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json' }
    });


    $('#btn-agregar-insumo').on('click', function () {
        form.reset();
        limpiarTodosLosErrores();
        $('#contador-nombre, #contador-descripcion').remove();
        tituloModal.innerText = 'Agregar Nuevo Insumo';
        form.action = 'crear/';
        modal.addClass('mostrar');
        setTimeout(() => $('#in_nombre').focus(), 150);
    });

    form.onsubmit = function (e) {
        e.preventDefault();

        const $btnGuardar  = $(form).find('.btn-guardar');
        const formData     = new FormData(form);
        const esEdicion    = form.action.includes('editar');
        const nombreInsumo = formData.get('nombre').trim();
        const actionUrl    = form.action.endsWith('/') ? form.action : form.action + '/';

        $btnGuardar.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Guardando…');

        fetch(actionUrl, { method: 'POST', body: formData, headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'error') {
                if (data.errores) mostrarErroresBackend(data.errores);
                else Alerta.advertencia('No se pudo guardar', data.message);
                return;
            }
            modal.removeClass('mostrar');
            form.reset();
            limpiarTodosLosErrores();
            $('#contador-nombre, #contador-descripcion').remove();
            tabla.ajax.reload(null, false);
            Alerta.exito(
                esEdicion ? '¡Actualizado!' : '¡Guardado!',
                `El insumo "${nombreInsumo}" fue ${esEdicion ? 'actualizado' : 'creado'} con éxito.`
            );
        })
        .catch(err => { console.error(err); Alerta.error('Error del servidor', 'No se pudieron guardar los cambios. Intente de nuevo.'); })
        .finally(() => $btnGuardar.prop('disabled', false).html('<i class="fa-solid fa-floppy-disk"></i> Guardar'));
    };

    window.editarInsumo = function (id) {
        fetch(`obtener/${id}/`)
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => {
            form.nombre.value       = data.nombre;
            form.cantidad.value     = data.cantidad;
            form.unidad_medida.value = data.unidad_medida;
            form.precio.value       = data.precio;
            form.id_proveedor.value = data.id_proveedor;
            form.id_categoria.value = data.id_categoria;
            form.estado.value       = data.estado;
            if (form.descripcion) form.descripcion.value = data.descripcion || '';

            $('#in_nombre').trigger('input');
            if (data.descripcion) $('#in_descripcion').trigger('input');

            limpiarTodosLosErrores();
            tituloModal.innerText = 'Editar Insumo';
            form.action = `editar/${id}/`;
            modal.addClass('mostrar');
            setTimeout(() => $('#in_nombre').focus(), 150);
        })
        .catch(() => Alerta.error('Error de conexión', 'No se pudo cargar la información del insumo.'));
    };

  
    window.eliminarInsumo = function (id) {
        fetch(`obtener/${id}/`)
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => {
            Alerta.confirmarEliminar(data.nombre).then(result => {
                if (!result.isConfirmed) return;

                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                fetch(`eliminar/${id}/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': csrftoken, 'X-Requested-With': 'XMLHttpRequest' }
                })
                .then(res => res.json())
                .then(resp => {
                    if (resp.status === 'error') { Alerta.error('No permitido', resp.message); return; }
                    Alerta.exito('¡Eliminado!', `El insumo "${data.nombre}" fue borrado.`);
                    tabla.ajax.reload();
                })
                .catch(() => Alerta.error('Error de conexión', 'No se pudo eliminar el insumo.'));
            });
        })
        .catch(() => Alerta.error('Error de conexión', 'No se pudo obtener la información del insumo.'));
    };

 
     
    $('#btn-cerrar-modal, #btn-cancelar').on('click', function () {
        modal.removeClass('mostrar');
        limpiarTodosLosErrores();
        $('#contador-nombre, #contador-descripcion').remove();
    });

    $(window).on('click', function (e) {
        if ($(e.target).is(modal)) {
            modal.removeClass('mostrar');
            limpiarTodosLosErrores();
            $('#contador-nombre, #contador-descripcion').remove();
        }
    });

    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && modal.hasClass('mostrar')) {
            modal.removeClass('mostrar');
            limpiarTodosLosErrores();
            $('#contador-nombre, #contador-descripcion').remove();
        }
    });

});