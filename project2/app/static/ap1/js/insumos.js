function obtenerContenedor() {
    let $c = $('#toast-container');
    if (!$c.length) {
        $c = $('<div class="messages" id="toast-container"></div>');
        $('body').append($c);
    }
    return $c;
}

function mostrarToast(tipo, texto, duracion = 4500) {
    const iconos = {
        success: 'fa-circle-check',
        warning: 'fa-triangle-exclamation',
        error:   'fa-circle-xmark',
    };
    const $toast = $(`
        <div class="message ${tipo}">
            <div class="message-content">
                <i class="fas ${iconos[tipo] || 'fa-circle-info'}"></i>
                <span class="text">${texto}</span>
            </div>
            <button type="button" class="close-toast" aria-label="Cerrar">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `);
    $toast.find('.close-toast').on('click', () => cerrarToastElement($toast));
    obtenerContenedor().append($toast);
    $toast[0].offsetHeight;
    $toast.addClass('toast-visible');
    if (duracion > 0) setTimeout(() => cerrarToastElement($toast), duracion);
    return $toast;
}

function cerrarToastElement($toast) {
    $toast.addClass('fade-out');
    setTimeout(() => $toast.remove(), 400);
}

window.cerrarToast = function (btn) {
    cerrarToastElement($(btn).closest('.message'));
};

const Alerta = {
    exito(titulo, texto) {
        mostrarToast('success', `<strong>${titulo}</strong> ${texto}`);
        return Promise.resolve();
    },
    advertencia(titulo, texto) {
        mostrarToast('warning', `<strong>${titulo}:</strong> ${texto}`, 0);
        return Promise.resolve();
    },
    error(titulo, texto) {
        mostrarToast('error', `<strong>${titulo}:</strong> ${texto}`, 0);
        return Promise.resolve();
    },
};


$(document).ready(function () {

    /* ── Referencias modales / formularios ── */
    const modalAgregar   = $('#modal-agregar');
    const modalEditar    = $('#modal-editar');
    const modalVer       = $('#modal-ver');
    const modalInactivar = $('#modal-inactivar');

    const formAgregar = document.getElementById('form-agregar');
    const formEditar  = document.getElementById('form-editar');

    const CAMPOS_AGREGAR = {
        nombre: 'ag_nombre', descripcion: 'ag_descripcion',
        cantidad: 'ag_cantidad', precio: 'ag_precio', unidad: 'ag_unidad',
    };
    const CAMPOS_EDITAR = {
        nombre: 'ed_nombre', descripcion: 'ed_descripcion',
        cantidad: 'ed_cantidad', precio: 'ed_precio', unidad: 'ed_unidad',
    };

    /* ── Validación inline ── */
    function mostrarError(fieldId, mensaje) {
        const $f = $('#' + fieldId);
        $f.addClass('input-error').attr('aria-invalid', 'true');
        const $g = $f.closest('.form-grupo');
        $g.find('.msg-error').remove();
        $g.append(`<span class="msg-error" role="alert">
                       <i class="fa-solid fa-triangle-exclamation"></i> ${mensaje}
                   </span>`);
    }

    function limpiarEstado(fieldId) {
        const $f = $('#' + fieldId);
        $f.removeClass('input-error input-ok').removeAttr('aria-invalid');
        $f.closest('.form-grupo').find('.msg-error').remove();
    }

    function limpiarCampos(campos) { Object.values(campos).forEach(limpiarEstado); }

    function mostrarErroresBackend(errores, campos) {
        const MAP = {
            nombre: campos.nombre, descripcion: campos.descripcion,
            cantidad: campos.cantidad, precio: campos.precio,
            unidad_medida: campos.unidad,
        };
        let errorGeneral = null;
        Object.entries(errores).forEach(([campo, mensaje]) => {
            if (campo === '__all__') { errorGeneral = mensaje; return; }
            const id = MAP[campo];
            if (id) mostrarError(id, mensaje);
        });
        $('.form-input.input-error, .form-select.input-error').first().focus();
        if (errorGeneral) Alerta.advertencia('No se pudo guardar', errorGeneral);
    }

    /* ── Contadores ── */
    function initContador(inputId, contadorId, max, alertaEn) {
        $('#' + inputId).on('input', function () {
            limpiarEstado(inputId);
            const len = $(this).val().trim().length;
            let $c = $('#' + contadorId);
            if (!$c.length) {
                $c = $(`<span id="${contadorId}" class="campo-contador"></span>`);
                $(this).parent().append($c);
            }
            $c.text(`${len}/${max}`).toggleClass('contador-alerta', len > alertaEn);
        });
    }

    initContador('ag_nombre',      'cnt-ag-nombre',      100, 90);
    initContador('ag_descripcion', 'cnt-ag-descripcion', 600, 580);
    initContador('ed_nombre',      'cnt-ed-nombre',      100, 90);
    initContador('ed_descripcion', 'cnt-ed-descripcion', 600, 580);

    ['ag_cantidad','ag_precio','ag_unidad','ed_cantidad','ed_precio','ed_unidad'].forEach(id => {
        $('#' + id).on('change input', () => limpiarEstado(id));
    });

    /* ── DataTable con filtro de estado ── */

  
    let mostrarInactivos = false;

    $.fn.dataTable.ext.search.push(function (settings, data) {
        if (settings.nTable.id !== 'tablaInsumos') return true;
        const estado = data[6] || '';  // columna índice 6 = Estado
        if (mostrarInactivos) return estado === 'Inactivo';
        return estado === 'Activo';
    });

    const tabla = $('#tablaInsumos').DataTable({
        ajax: INSUMOS_DATA_URL,
        columns: [
            { data: 'nombre' },
            { data: 'categoria' },
            { data: 'cantidad' },
            { data: 'unidad' },
            {
                data: 'precio',
                render: v => `<span class="precio-celda">$${parseFloat(v).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>`,
            },
            { data: 'proveedor' },
            {
                data: 'estado',
                render: v => {
                    const ok = v === 'Activo';
                    return `<span class="badge-estado badge-estado--${ok ? 'activo' : 'inactivo'}">${v}</span>`;
                },
            },
            {
                data: null,
                orderable: false,
                render: (data) => {
                    const id = data.id;
                    const activo = data.estado === 'Activo';

                    const iconEstado = activo
                        ? `<i class="fas fa-ban        delete-btn" title="Inactivar"  onclick="abrirModalInactivar(${id})"></i>`
                        : `<i class="fas fa-rotate-left reactivar-btn" title="Reactivar" onclick="abrirModalActivar(${id})"></i>`;

                    return `
                    <div class="icons">
                        <i class="fas fa-eye          view-btn" title="Ver detalle" onclick="verInsumo(${id})"></i>
                        <i class="fas fa-pen          edit-btn" title="Editar"      onclick="editarInsumo(${id})"></i>
                        ${iconEstado}
                    </div>`;
                },
            },
        ],
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json' },
    });

    /* ── Toggle Activos / Inactivos ── */
    $('#toggleInactivos').on('change', function () {
        mostrarInactivos = $(this).is(':checked');
        tabla.draw();
    });

    /* ── Abrir modal Agregar ── */
    $('#btn-agregar-insumo').on('click', function () {
        formAgregar.reset();
        limpiarCampos(CAMPOS_AGREGAR);
        $('#cnt-ag-nombre, #cnt-ag-descripcion').remove();
        formAgregar.action = 'crear/';
        modalAgregar.addClass('mostrar');
        setTimeout(() => $('#ag_nombre').focus(), 150);
    });

    /* ── Submit compartido ── */
    function handleSubmit(e, $modal, campos) {
        e.preventDefault();
        const form = e.target;
        const $btn = $(form).find('.btn-guardar');
        const fd   = new FormData(form);
        const nombre    = (fd.get('nombre') || '').trim();
        const esEdicion = form.action.includes('editar');
        const url       = form.action.endsWith('/') ? form.action : form.action + '/';

        $btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Guardando…');

        fetch(url, { method: 'POST', body: fd, headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.json())
            .then(data => {
                if (data.status === 'error') {
                    if (data.errores) mostrarErroresBackend(data.errores, campos);
                    else Alerta.advertencia('No se pudo guardar', data.message);
                    return;
                }
                $modal.removeClass('mostrar');
                form.reset();
                limpiarCampos(campos);
                tabla.ajax.reload(null, false);
                Alerta.exito(
                    esEdicion ? '¡Actualizado!' : '¡Guardado!',
                    `El insumo "${nombre}" fue ${esEdicion ? 'actualizado' : 'creado'} con éxito.`
                );
            })
            .catch(() => Alerta.error('Error del servidor', 'No se pudieron guardar los cambios.'))
            .finally(() => {
                const icono = esEdicion ? 'fa-pen-to-square' : 'fa-floppy-disk';
                const label = esEdicion ? 'Actualizar' : 'Guardar';
                $btn.prop('disabled', false).html(`<i class="fa-solid ${icono}"></i> ${label}`);
            });
    }

    formAgregar.addEventListener('submit', e => handleSubmit(e, modalAgregar, CAMPOS_AGREGAR));
    formEditar.addEventListener('submit',  e => handleSubmit(e, modalEditar,  CAMPOS_EDITAR));

    /* ── Ver insumo ── */
    const UNIDADES_LABEL = {
        kg:'Kilogramo (kg)', g:'Gramo (g)', lb:'Libra (lb)', t:'Tonelada (t)',
        L:'Litro (L)', ml:'Mililitro (ml)', gal:'Galón (gal)',
        m:'Metro (m)', cm:'Centímetro (cm)', mm:'Milímetro (mm)',
        m2:'Metro cuadrado (m²)', m3:'Metro cúbico (m³)',
        und:'Unidad (und)', par:'Par', docena:'Docena',
        caja:'Caja', paq:'Paquete (paq)', rollo:'Rollo', bolsa:'Bolsa',
    };

    window.verInsumo = function (id) {
        fetch(`obtener/${id}/`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                $('#ver-nombre').text(data.nombre);
                const activo = data.estado === 'Activo';
                $('#ver-estado-badge')
                    .text(data.estado)
                    .attr('class', `ver-estado-badge badge-estado--${activo ? 'activo' : 'inactivo'}`);
                $('#ver-categoria').text(data.categoria_nombre || '—');
                $('#ver-proveedor').text(data.proveedor_nombre || '—');
                $('#ver-cantidad').text(data.cantidad);
                $('#ver-unidad').text(UNIDADES_LABEL[data.unidad_medida] || data.unidad_medida);
                $('#ver-precio').text(`$${parseFloat(data.precio).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`);
                const desc = (data.descripcion || '').trim();
                $('#ver-descripcion').text(desc || 'Sin descripción registrada.');
                $('#ver-descripcion-bloque').toggleClass('ver-sin-descripcion', !desc);
                $('#ver-btn-editar').off('click').on('click', () => {
                    modalVer.removeClass('mostrar');
                    setTimeout(() => editarInsumo(id), 200);
                });
                modalVer.addClass('mostrar');
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo cargar la información del insumo.'));
    };

    /* ── Editar insumo ── */
    window.editarInsumo = function (id) {
        fetch(`obtener/${id}/`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                formEditar.nombre.value        = data.nombre;
                formEditar.cantidad.value      = data.cantidad;
                formEditar.unidad_medida.value = data.unidad_medida;
                formEditar.precio.value        = data.precio;
                formEditar.id_proveedor.value  = data.id_proveedor;
                formEditar.id_categoria.value  = data.id_categoria;
                formEditar.estado.value        = data.estado;
                if (formEditar.descripcion) formEditar.descripcion.value = data.descripcion || '';
                $('#ed_nombre').trigger('input');
                if (data.descripcion) $('#ed_descripcion').trigger('input');
                limpiarCampos(CAMPOS_EDITAR);
                formEditar.action = `editar/${id}/`;
                modalEditar.addClass('mostrar');
                setTimeout(() => $('#ed_nombre').focus(), 150);
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo cargar la información del insumo.'));
    };

    /* ── Modal Inactivar ── */
    let _inactivarId = null;

    window.abrirModalInactivar = function (id) {
        fetch(`obtener/${id}/`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                _inactivarId = id;

                // Poblar el modal
                $('#inactivar-titulo-texto').text('Inactivar Insumo');
                $('#inactivar-icono').attr('class', 'fa-solid fa-ban');
                $('#inactivar-nombre').text(data.nombre);
                $('#inactivar-categoria').text(data.categoria_nombre || '—');
                $('#inactivar-badge-estado')
                    .text('Activo')
                    .attr('class', 'badge-estado badge-estado--activo');
                $('#inactivar-aviso').attr('class', 'inactivar-aviso inactivar-aviso--danger');
                $('#inactivar-aviso-texto').text(
                    'El insumo dejará de aparecer en la lista principal. Podrás reactivarlo cuando lo necesites.'
                );

                // Botón confirmar
                $('#btn-inactivar-icono').attr('class', 'fa-solid fa-ban');
                $('#btn-inactivar-texto').text('Inactivar');
                $('#btn-confirmar-inactivar')
                    .attr('class', 'btn-modal-inactivar')
                    .off('click')
                    .on('click', () => ejecutarCambioEstado('inactivar', id, data.nombre));

                // Acento del modal → rojo
                modalInactivar
                    .find('.modal-contenido')
                    .attr('class', 'modal-contenido modal-contenido--inactivar');
                modalInactivar
                    .find('.modal-header')
                    .attr('class', 'modal-header modal-header--inactivar');
                modalInactivar
                    .find('.modal-titulo')
                    .attr('class', 'modal-titulo modal-titulo--inactivar');

                modalInactivar.addClass('mostrar');
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo cargar el insumo.'));
    };

    /* ── Modal Activar ── */
    window.abrirModalActivar = function (id) {
        fetch(`obtener/${id}/`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                _inactivarId = id;

                $('#inactivar-titulo-texto').text('Reactivar Insumo');
                $('#inactivar-icono').attr('class', 'fa-solid fa-rotate-left');
                $('#inactivar-nombre').text(data.nombre);
                $('#inactivar-categoria').text(data.categoria_nombre || '—');
                $('#inactivar-badge-estado')
                    .text('Inactivo')
                    .attr('class', 'badge-estado badge-estado--inactivo');
                $('#inactivar-aviso').attr('class', 'inactivar-aviso inactivar-aviso--success');
                $('#inactivar-aviso-texto').text(
                    'El insumo volverá a aparecer en la lista principal como Activo.'
                );

                $('#btn-inactivar-icono').attr('class', 'fa-solid fa-rotate-left');
                $('#btn-inactivar-texto').text('Reactivar');
                $('#btn-confirmar-inactivar')
                    .attr('class', 'btn-activar-confirm')
                    .off('click')
                    .on('click', () => ejecutarCambioEstado('activar', id, data.nombre));

                // Acento del modal → verde
                modalInactivar
                    .find('.modal-contenido')
                    .attr('class', 'modal-contenido modal-contenido--activar');
                modalInactivar
                    .find('.modal-header')
                    .attr('class', 'modal-header modal-header--activar');
                modalInactivar
                    .find('.modal-titulo')
                    .attr('class', 'modal-titulo modal-titulo--activar');

                modalInactivar.addClass('mostrar');
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo cargar el insumo.'));
    };

    function ejecutarCambioEstado(accion, id, nombre) {
        const url  = accion === 'inactivar' ? `inactivar/${id}/` : `activar/${id}/`;
        const csrf = document.querySelector('[name=csrfmiddlewaretoken]').value;

        const $btn = $('#btn-confirmar-inactivar');
        $btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i>');

        fetch(url, {
            method: 'POST',
            headers: { 'X-CSRFToken': csrf, 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then(r => r.json())
            .then(resp => {
                if (resp.status === 'error') {
                    Alerta.error('No permitido', resp.message);
                    return;
                }
                modalInactivar.removeClass('mostrar');
                tabla.ajax.reload(null, false);

                if (accion === 'inactivar') {
                    Alerta.advertencia('Inactivado', `El insumo "${nombre}" fue inactivado.`);
                } else {
                    Alerta.exito('¡Reactivado!', `El insumo "${nombre}" está activo nuevamente.`);
                }
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo completar la operación.'))
            .finally(() => $btn.prop('disabled', false));
    }

    /* ── Cerrar modales ── */
    function cerrarModal($modal, form, campos) {
        $modal.removeClass('mostrar');
        if (form)   form.reset();
        if (campos) limpiarCampos(campos);
    }


    $(document).on('click', '[data-modal]', function () {
        const id = $(this).data('modal');
        $(`#${id}`).removeClass('mostrar');
        if (id === 'modal-agregar')   { formAgregar.reset(); limpiarCampos(CAMPOS_AGREGAR); }
        if (id === 'modal-editar')    { formEditar.reset();  limpiarCampos(CAMPOS_EDITAR); }
    });

    /* ── Auto-cerrar toasts del servidor si los hay ── */
    setTimeout(() => {
        $('#toast-container .message').each(function () { cerrarToastElement($(this)); });
    }, 4000);
});