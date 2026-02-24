$(document).ready(function () {

    /* ═══════════════════════════════════════════════════
       SISTEMA DE TOASTS — diseño de proveedores
       ═══════════════════════════════════════════════════ */

    function obtenerContenedor() {
        let $c = $('#toast-container');
        if (!$c.length) {
            $c = $('<div class="messages" id="toast-container"></div>');
            $('body').append($c);
        }
        return $c;
    }

    function mostrarToast(tipo, texto, duracion = 4500) {
        const iconos = { success: 'fa-circle-check', warning: 'fa-triangle-exclamation', error: 'fa-circle-xmark' };
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

    function cerrarToastElement($t) {
        $t.addClass('fade-out');
        setTimeout(() => $t.remove(), 400);
    }

    window.cerrarToast = btn => cerrarToastElement($(btn).closest('.message'));

    const Alerta = {
        exito(titulo, texto)       { mostrarToast('success', `<strong>${titulo}</strong> ${texto}`); return Promise.resolve(); },
        advertencia(titulo, texto) { mostrarToast('warning', `<strong>${titulo}:</strong> ${texto}`, 0); return Promise.resolve(); },
        error(titulo, texto)       { mostrarToast('error',   `<strong>${titulo}:</strong> ${texto}`, 0); return Promise.resolve(); },
        rangoFechaInvalido()       { mostrarToast('warning', '<strong>Rango de fechas inválido:</strong> La fecha "Desde" no puede ser posterior a "Hasta".', 3500); return Promise.resolve(); },
    };


    /* ═══════════════════════════════════════════════════
       REFERENCIAS
       ═══════════════════════════════════════════════════ */

    const modal          = $('#modal-evento');
    const modalDetalle   = $('#modal-detalle-evento');
    const modalInactivar = $('#modal-inactivar');
    const form           = document.getElementById('form-evento');
    const tituloModal    = document.getElementById('modal-titulo-evento');
    const eventoIdInput  = document.getElementById('evento-id');

    let eventoDetalleId   = null;
    let eventoInactivarId = null;
    let mostrandoInactivos = false;

    const estadoConfig = {
        pendiente:  { label: 'Pendiente',  color: '#f1c40f', icon: 'fa-regular fa-clock'      },
        completado: { label: 'Completado', color: '#2ecc71', icon: 'fa-solid fa-circle-check' },
        cancelado:  { label: 'Cancelado',  color: '#e74c3c', icon: 'fa-solid fa-ban'           },
    };


    /* ═══════════════════════════════════════════════════
       VALIDACIÓN INLINE
       ═══════════════════════════════════════════════════ */

    function mostrarError(fieldId, mensaje) {
        const $f = $('#' + fieldId);
        $f.addClass('input-error').attr('aria-invalid', 'true');
        const $g = $f.closest('.form-grupo');
        $g.find('.msg-error').remove();
        $g.append(`<span class="msg-error" role="alert"><i class="fa-solid fa-triangle-exclamation"></i> ${mensaje}</span>`);
    }

    function limpiarEstado(fieldId) {
        $('#' + fieldId).removeClass('input-error input-ok').removeAttr('aria-invalid')
            .closest('.form-grupo').find('.msg-error').remove();
    }

    function limpiarTodosLosErrores() {
        ['in_titulo', 'in_fecha', 'in_hora', 'in_categoria'].forEach(limpiarEstado);
    }

    const CAMPO_A_INPUT = { titulo: 'in_titulo', fecha: 'in_fecha', hora: 'in_hora', categoria: 'in_categoria' };

    function mostrarErroresBackend(errores) {
        let errorGeneral = null;
        Object.entries(errores).forEach(([campo, mensaje]) => {
            if (campo === '__all__') { errorGeneral = mensaje; return; }
            const id = CAMPO_A_INPUT[campo];
            if (id) mostrarError(id, mensaje);
        });
        $('.form-input.input-error, .form-select.input-error').first().focus();
        if (errorGeneral) Alerta.advertencia('No se pudo guardar', errorGeneral);
    }

    /* ── Contadores ── */
    $('#in_titulo').on('input', function () {
        limpiarEstado('in_titulo');
        const len = $(this).val().trim().length;
        let $c = $('#contador-titulo');
        if (!$c.length) { $c = $('<span id="contador-titulo" class="campo-contador"></span>'); $(this).parent().append($c); }
        $c.text(len + '/100').toggleClass('contador-alerta', len > 90);
    });
    $('#in_descripcion').on('input', function () {
        const len = ($(this).val() || '').trim().length;
        let $c = $('#contador-descripcion');
        if (!$c.length) { $c = $('<span id="contador-descripcion" class="campo-contador"></span>'); $(this).parent().append($c); }
        $c.text(len + '/500').toggleClass('contador-alerta', len > 480);
    });
    $('#in_fecha').on('change',     () => limpiarEstado('in_fecha'));
    $('#in_hora').on('change',      () => limpiarEstado('in_hora'));
    $('#in_categoria').on('change', () => limpiarEstado('in_categoria'));


    /* ═══════════════════════════════════════════════════
       HELPERS
       ═══════════════════════════════════════════════════ */

    function renderEstadoBadge(estado) {
        const cfg = estadoConfig[estado] || estadoConfig.pendiente;
        $('#detalle-estado-badge')
            .html(`<i class="${cfg.icon}"></i> ${cfg.label}`)
            .css({ background: 'rgba(0,0,0,0.25)', border: `1px solid ${cfg.color}55`, color: cfg.color });
    }

    function marcarBotonActivo(estadoActual) {
        $('.btn-estado-opcion').each(function () {
            const es = $(this).data('estado');
            $(this).css({
                opacity:   es === estadoActual ? '1' : '0.45',
                boxShadow: es === estadoActual ? `0 0 0 2px ${estadoConfig[es].color}88` : 'none',
            });
        });
    }

    function getCookie(name) {
        let v = null;
        if (document.cookie) document.cookie.split(';').forEach(c => {
            const t = c.trim();
            if (t.startsWith(name + '=')) v = decodeURIComponent(t.slice(name.length + 1));
        });
        return v;
    }

    function urlActual() {
        return mostrandoInactivos ? EVENTOS_DATA_URL + '?inactivos=1' : EVENTOS_DATA_URL;
    }

    function recargarTabla() {
        tabla.ajax.url(urlActual()).load(null, false);
    }


    /* ═══════════════════════════════════════════════════
       DATATABLE
       ═══════════════════════════════════════════════════ */

    const tabla = $('#tablaEventos').DataTable({
        ajax: { url: urlActual(), dataSrc: 'data' },
        columns: [
            { data: 'titulo' },
            { data: 'categoria', render: (data, type, row) =>
                `<span style="color:${row.categoria_color};">&#11044;</span> ${data}` },
            { data: 'fecha_display' },
            { data: 'hora' },
            { data: 'descripcion', render: data =>
                data && data.length > 50 ? data.substr(0, 50) + '…' : (data || '') },
            { data: 'id', render: (data, type, row) => {
                const est   = estadoConfig[row.estado] || estadoConfig.pendiente;
                const badge = `<span style="display:inline-flex;align-items:center;gap:5px;
                    font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;
                    padding:3px 10px;border-radius:20px;color:${est.color};background:${est.color}18;
                    border:1px solid ${est.color}44;margin-right:6px;">
                    <i class="${est.icon}" style="font-size:0.65rem;"></i> ${est.label}</span>`;

                const acciones = row.activo
                    ? `<div class="acciones-tabla">
                           <button class="btn-accion btn-ver"       title="Ver detalles"  onclick="verEvento(${data})"><i class="fa-solid fa-eye"></i></button>
                           <button class="btn-accion btn-editar"    title="Editar"         onclick="editarEvento(${data})"><i class="fa-solid fa-pen-to-square"></i></button>
                           <button class="btn-accion btn-inactivar" title="Inactivar"      onclick="abrirModalInactivar(${data})"><i class="fa-solid fa-eye-slash"></i></button>
                       </div>`
                    : `<div class="acciones-tabla acciones-inactivo">
                           <span class="badge-inactivo-tabla"><i class="fa-solid fa-eye-slash"></i> Inactiva</span>
                           <button class="btn-accion btn-restaurar" title="Restaurar" onclick="restaurarEvento(${data})">
                               <i class="fa-solid fa-rotate-left"></i> Restaurar
                           </button>
                       </div>`;

                return `<div class="acciones-tabla-wrap">${badge}${acciones}</div>`;
            }}
        ],
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json' },
        order: [[2, 'desc']]
    });

    function moverBuscador() {
        const $s = $('.dataTables_filter input');
        if ($s.length && !$s.parents('.search-datatable-container').length)
            $s.detach().appendTo('.search-datatable-container').addClass('filtro-control');
    }
    moverBuscador();
    $('.dataTables_filter').hide();

    function aplicarClasesCategoria() {
        $('#tablaEventos tbody tr').each(function () {
            const $row   = $(this);
            const catTxt = $row.find('td:nth-child(2)').clone().find('span').remove().end().text().trim().toLowerCase();
            const map    = {
                'pedido':'cat-pedido-row','compra':'cat-compra-row','pago':'cat-pago-row',
                'mantenimiento':'cat-mantenimiento-row','reuni':'cat-reunion-row',
                'entrega':'cat-entrega-row','capacitaci':'cat-capacitacion-row',
            };
            $row.removeClass(Object.values(map).join(' ') + ' evento-completado evento-cancelado evento-inactivo-row');

            if (mostrandoInactivos) {
                $row.addClass('evento-inactivo-row');
            } else {
                for (const [k, cls] of Object.entries(map)) {
                    if (catTxt.includes(k)) { $row.addClass(cls); break; }
                }
                const badgeTxt = $row.find('.acciones-tabla-wrap > span').first().text().trim().toLowerCase();
                if      (badgeTxt.includes('completado')) $row.addClass('evento-completado');
                else if (badgeTxt.includes('cancelado'))  $row.addClass('evento-cancelado');
            }
        });
    }

    function actualizarBannerModo() {
        const $banner = $('#banner-modo-inactivos');
        if (mostrandoInactivos) {
            if (!$banner.length) {
                $('<div id="banner-modo-inactivos" class="banner-inactivos">' +
                  '<i class="fa-solid fa-eye-slash"></i> Viendo actividades <strong>inactivas</strong>. ' +
                  'Usa <em>Restaurar</em> para reactivarlas en la lista principal.</div>')
                    .insertBefore('#tablaEventos');
            }
        } else {
            $banner.remove();
        }
    }

    tabla.on('draw', () => { moverBuscador(); aplicarClasesCategoria(); actualizarContador(); actualizarBannerModo(); });
    aplicarClasesCategoria();


    /* ═══════════════════════════════════════════════════
       SWITCH INACTIVOS
       ═══════════════════════════════════════════════════ */

    $('#switch-inactivos').on('change', function () {
        mostrandoInactivos = this.checked;

        // estilo visual del label
        $('#switch-inactivos-label').toggleClass('activo', mostrandoInactivos);

        // deshabilitar filtro de estado en vista inactivos (no aplica)
        $('#filtro-estado')
            .val('')
            .prop('disabled', mostrandoInactivos)
            .toggleClass('filtro-deshabilitado', mostrandoInactivos);

        recargarTabla();
        actualizarEstiloFiltros();
    });


    /* ═══════════════════════════════════════════════════
       FILTROS
       ═══════════════════════════════════════════════════ */

    $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
        if (mostrandoInactivos) return true;
        const filtro = $('#filtro-estado').val();
        return !filtro || tabla.row(dataIndex).data().estado === filtro;
    });
    $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
        const filtro = $('#filtro-categoria').val().toLowerCase();
        return !filtro || tabla.row(dataIndex).data().categoria.toLowerCase() === filtro;
    });
    $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
        const desde = $('#filtro-fecha-desde').val(), hasta = $('#filtro-fecha-hasta').val();
        if (!desde && !hasta) return true;
        const fecha = tabla.row(dataIndex).data().fecha;
        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;
        return true;
    });

    $('#filtro-fecha-desde, #filtro-fecha-hasta').on('change', function () {
        const desde = $('#filtro-fecha-desde').val(), hasta = $('#filtro-fecha-hasta').val();
        if (desde && hasta && desde > hasta) { Alerta.rangoFechaInvalido(); $(this).val(''); return; }
        tabla.draw(); actualizarEstiloFiltros();
    });
    $('#filtro-estado, #filtro-categoria').on('change', () => { tabla.draw(); actualizarEstiloFiltros(); });
    $('#filtro-orden').on('change', function () { tabla.order([2, $(this).val()]).draw(); actualizarEstiloFiltros(); });
    $('#btn-limpiar-filtros').on('click', function () {
        $('#filtro-estado, #filtro-categoria, #filtro-fecha-desde, #filtro-fecha-hasta').val('');
        $('#filtro-orden').val('desc');
        $('.dataTables_filter input').val('').trigger('keyup');
        tabla.order([2, 'desc']).draw(); actualizarEstiloFiltros();
    });

    function actualizarContador() {
        const info = tabla.page.info(), total = info.recordsTotal, filtrado = info.recordsDisplay;
        const tipo = mostrandoInactivos ? 'inactiva' : 'actividad';
        $('#filtros-resultado').html(filtrado === total
            ? `Mostrando ${total} ${tipo}${total !== 1 ? 'es' : ''}`
            : `Mostrando <strong>${filtrado}</strong> de ${total} ${tipo}${total !== 1 ? 'es' : ''}`);
    }

    function actualizarEstiloFiltros() {
        ['#filtro-estado','#filtro-categoria','#filtro-fecha-desde','#filtro-fecha-hasta','#filtro-orden']
            .forEach(id => {
                const $el = $(id), isDefault = id === '#filtro-orden' ? $el.val() === 'desc' : $el.val() === '';
                $el.toggleClass('filtro-activo', !isDefault);
            });
    }


    /* ═══════════════════════════════════════════════════
       CRUD
       ═══════════════════════════════════════════════════ */

    $('#btn-nueva-actividad').on('click', function () {
        form.reset(); limpiarTodosLosErrores();
        $('#contador-titulo, #contador-descripcion').remove();
        if (eventoIdInput) eventoIdInput.value = '';
        tituloModal.innerText = 'Agregar Nueva Actividad';
        form.action = CREAR_EVENTO_URL;
        $('#in_fecha').attr('min', new Date().toISOString().slice(0, 10));
        modal.addClass('mostrar');
        setTimeout(() => $('#in_titulo').focus(), 150);
    });

    form.onsubmit = function (e) {
        e.preventDefault();
        const $btn      = $(form).find('.btn-guardar');
        const fd        = new FormData(form);
        const esEdicion = form.action.includes('editar');
        const titulo    = fd.get('titulo').trim();
        const actionUrl = form.action.endsWith('/') ? form.action : form.action + '/';

        $btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Guardando…');

        fetch(actionUrl, { method: 'POST', body: fd, headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.json())
            .then(data => {
                if (data.status === 'error') {
                    data.errores ? mostrarErroresBackend(data.errores) : Alerta.advertencia('No se pudo guardar', data.message);
                    return;
                }
                modal.removeClass('mostrar'); form.reset(); limpiarTodosLosErrores();
                $('#contador-titulo, #contador-descripcion').remove();
                recargarTabla();
                Alerta.exito(esEdicion ? '¡Actualizado!' : '¡Guardado!',
                    `La actividad "${titulo}" fue ${esEdicion ? 'actualizada' : 'creada'} con éxito.`);
            })
            .catch(() => Alerta.error('Error del servidor', 'No se pudieron guardar los cambios.'))
            .finally(() => $btn.prop('disabled', false).html('<i class="fa-solid fa-floppy-disk"></i> Guardar'));
    };

    window.verEvento = function (id) {
        fetch(OBTENER_EVENTO_BASE + id + '/')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                eventoDetalleId = data.id;
                $('#detalle-titulo').text(data.titulo);
                $('#detalle-fecha').text(data.fecha_display);
                $('#detalle-hora').text(data.hora);
                $('#detalle-descripcion').text(data.descripcion || '—');
                $('#detalle-badge-cat').text(data.categoria_nombre)
                    .css({ color: data.categoria_color, borderColor: data.categoria_color + '55' });
                renderEstadoBadge(data.estado); marcarBotonActivo(data.estado);
                modalDetalle.addClass('mostrar');
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo cargar la información del evento.'));
    };

    $(document).on('click', '.btn-estado-opcion', function () {
        if (!eventoDetalleId) return;
        const nuevoEstado = $(this).data('estado'), $btn = $(this);
        $btn.prop('disabled', true);
        const fd = new FormData(); fd.append('estado', nuevoEstado);
        fetch(CAMBIAR_ESTADO_BASE + eventoDetalleId + '/', {
            method: 'POST', body: fd,
            headers: { 'X-CSRFToken': getCookie('csrftoken'), 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(data => {
                if (data.status === 'error') { Alerta.advertencia('No permitido', data.message); return; }
                renderEstadoBadge(data.estado); marcarBotonActivo(data.estado); recargarTabla();
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo cambiar el estado.'))
            .finally(() => $btn.prop('disabled', false));
    });

    window.editarEvento = function (id) {
        fetch(OBTENER_EVENTO_BASE + id + '/')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                $('#in_fecha').removeAttr('min');
                form.titulo.value = data.titulo; form.fecha.value = data.fecha;
                form.hora.value = data.hora; form.categoria.value = data.categoria;
                form.descripcion.value = data.descripcion || '';
                if (eventoIdInput) eventoIdInput.value = data.id;
                $('#in_titulo').trigger('input');
                if (data.descripcion) $('#in_descripcion').trigger('input');
                limpiarTodosLosErrores();
                tituloModal.innerText = 'Editar Actividad';
                form.action = EDITAR_EVENTO_BASE + id + '/';
                modal.addClass('mostrar');
                setTimeout(() => $('#in_titulo').focus(), 150);
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo cargar la información del evento.'));
    };


    /* ═══════════════════════════════════════════════════
       INACTIVAR
       ═══════════════════════════════════════════════════ */

    window.abrirModalInactivar = function (id) {
        fetch(OBTENER_EVENTO_BASE + id + '/')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                eventoInactivarId = data.id;
                $('#inactivar-nombre-evento').text(`"${data.titulo}"`);
                modalInactivar.addClass('mostrar');
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo obtener la información del evento.'));
    };

    $('#btn-confirmar-inactivar').on('click', function () {
        if (!eventoInactivarId) return;
        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Procesando…');

        fetch(INACTIVAR_EVENTO_BASE + eventoInactivarId + '/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken'), 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(resp => {
                if (resp.status === 'error') { Alerta.error('No permitido', resp.message); return; }
                modalInactivar.removeClass('mostrar');
                Alerta.exito('Inactivada', 'La actividad ya no aparece en la lista principal.');
                recargarTabla();
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo inactivar la actividad.'))
            .finally(() => {
                eventoInactivarId = null;
                $btn.prop('disabled', false).html('<i class="fa-solid fa-eye-slash"></i> Sí, inactivar');
            });
    });


    /* ═══════════════════════════════════════════════════
       RESTAURAR
       ═══════════════════════════════════════════════════ */

    window.restaurarEvento = function (id) {
        fetch(RESTAURAR_EVENTO_BASE + id + '/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken'), 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(resp => {
                if (resp.status === 'error') { Alerta.error('No permitido', resp.message); return; }
                Alerta.exito('¡Restaurada!', 'La actividad vuelve a estar activa en la lista principal.');
                recargarTabla();
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo restaurar la actividad.'));
    };


    /* ═══════════════════════════════════════════════════
       CERRAR MODALES
       ═══════════════════════════════════════════════════ */

    function cerrarModalEvento()    { modal.removeClass('mostrar'); limpiarTodosLosErrores(); $('#contador-titulo, #contador-descripcion').remove(); }
    function cerrarModalDetalle()   { modalDetalle.removeClass('mostrar'); eventoDetalleId = null; }
    function cerrarModalInactivar() { modalInactivar.removeClass('mostrar'); eventoInactivarId = null; }

    $('#btn-cerrar-modal-evento, #btn-cancelar-evento').on('click',   cerrarModalEvento);
    $('#btn-cerrar-detalle, #btn-cancelar-detalle').on('click',       cerrarModalDetalle);
    $('#btn-cerrar-inactivar, #btn-cancelar-inactivar').on('click',   cerrarModalInactivar);

    $(window).on('click', e => {
        if ($(e.target).is(modal))          cerrarModalEvento();
        if ($(e.target).is(modalDetalle))   cerrarModalDetalle();
        if ($(e.target).is(modalInactivar)) cerrarModalInactivar();
    });

    $(document).on('keydown', e => {
        if (e.key !== 'Escape') return;
        if (modal.hasClass('mostrar'))          cerrarModalEvento();
        if (modalDetalle.hasClass('mostrar'))   cerrarModalDetalle();
        if (modalInactivar.hasClass('mostrar')) cerrarModalInactivar();
    });

});