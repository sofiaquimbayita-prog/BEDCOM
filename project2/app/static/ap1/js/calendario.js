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
            return Swal.fire({ ...BASE, icon: 'warning', title: '¿Eliminar actividad?',
                html: `Se eliminará <strong>"${nombre}"</strong>.<br>Esta acción no se puede deshacer.`,
                showCancelButton: true, confirmButtonColor: '#e74c3c', cancelButtonColor: '#4ea3a5',
                confirmButtonText: '<i class="fa-solid fa-trash-can"></i> Sí, eliminar',
                cancelButtonText: 'Cancelar', reverseButtons: true });
        },
        rangoFechaInvalido() {
            return Swal.fire({ ...BASE, icon: 'warning', title: 'Rango de fechas inválido',
                text: 'La fecha "Desde" no puede ser posterior a la fecha "Hasta".',
                timer: 3000, timerProgressBar: true, showConfirmButton: false });
        },
    };

    const modal         = $('#modal-evento');
    const form          = document.getElementById('form-evento');
    const tituloModal   = document.getElementById('modal-titulo-evento');
    const eventoIdInput = document.getElementById('evento-id');
    const modalDetalle  = $('#modal-detalle-evento');
    let   eventoDetalleId = null;

    const estadoConfig = {
        pendiente:  { label: 'Pendiente',  color: '#f1c40f', icon: 'fa-regular fa-clock'      },
        completado: { label: 'Completado', color: '#2ecc71', icon: 'fa-solid fa-circle-check' },
        cancelado:  { label: 'Cancelado',  color: '#e74c3c', icon: 'fa-solid fa-ban'           },
    };

 
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
        ['in_titulo', 'in_fecha', 'in_hora', 'in_categoria',].forEach(limpiarEstado);
    }


    const CAMPO_A_INPUT = {
        titulo:      'in_titulo',
        fecha:       'in_fecha',
        hora:        'in_hora',
        categoria:   'in_categoria',
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

    $('#in_titulo').on('input', function () {
        limpiarEstado('in_titulo');
        const len = $(this).val().trim().length;
        let $c = $('#contador-titulo');
        if (!$c.length) {
            $c = $('<span id="contador-titulo" class="campo-contador"></span>');
            $(this).parent().append($c);
        }
        $c.text(len + '/100').toggleClass('contador-alerta', len > 90);
    });

    $('#in_fecha').on('change',     function () { limpiarEstado('in_fecha'); });
    $('#in_hora').on('change',      function () { limpiarEstado('in_hora'); });
    $('#in_categoria').on('change', function () { limpiarEstado('in_categoria'); });

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

    function renderEstadoBadge(estado) {
        const cfg = estadoConfig[estado] || estadoConfig.pendiente;
        $('#detalle-estado-badge').html(`<i class="${cfg.icon}"></i> ${cfg.label}`)
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
        let cookieValue = null;
        if (document.cookie) {
            document.cookie.split(';').forEach(cookie => {
                const c = cookie.trim();
                if (c.startsWith(name + '=')) cookieValue = decodeURIComponent(c.slice(name.length + 1));
            });
        }
        return cookieValue;
    }

    // --- Inicializar DataTable ---
    const tabla = $('#tablaEventos').DataTable({
        ajax: EVENTOS_DATA_URL,
        columns: [
            { data: 'titulo' },
            { data: 'categoria', render: (data, type, row) =>
                `<span style="color:${row.categoria_color};">&#11044;</span> ${data}` },
            { data: 'fecha_display' },
            { data: 'hora' },
            { data: 'descripcion', render: data =>
                data && data.length > 50 ? data.substr(0, 50) + '…' : (data || '') },
            { data: 'id', render: (data, type, row) => {
                const est = estadoConfig[row.estado] || estadoConfig.pendiente;
                const badge = `<span style="display:inline-flex;align-items:center;gap:5px;
                    font-size:0.7rem;font-weight:700;text-transform:uppercase;
                    letter-spacing:0.04em;padding:3px 10px;border-radius:20px;
                    color:${est.color};background:${est.color}18;
                    border:1px solid ${est.color}44;margin-right:6px;">
                    <i class="${est.icon}" style="font-size:0.65rem;"></i> ${est.label}</span>`;
                return `<div class="acciones-tabla">${badge}
                    <button class="btn-accion btn-ver"      title="Ver detalles" onclick="verEvento(${data})"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-accion btn-editar"   title="Editar"       onclick="editarEvento(${data})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-accion btn-eliminar" title="Eliminar"     onclick="eliminarEvento(${data})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>`;
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
            const $row = $(this);
            const catText = $row.find('td:nth-child(2)').clone().find('span').remove().end().text().trim().toLowerCase();
            const badges = { 'pedido':'cat-pedido-row','compra':'cat-compra-row','pago':'cat-pago-row',
                'mantenimiento':'cat-mantenimiento-row','reuni':'cat-reunion-row',
                'entrega':'cat-entrega-row','capacitaci':'cat-capacitacion-row' };
            $row.removeClass(Object.values(badges).join(' ') + ' evento-completado evento-cancelado');
            for (const [clave, clase] of Object.entries(badges)) {
                if (catText.includes(clave)) { $row.addClass(clase); break; }
            }
            const badgeTexto = $row.find('.acciones-tabla span').text().trim().toLowerCase();
            if      (badgeTexto.includes('completado')) $row.addClass('evento-completado');
            else if (badgeTexto.includes('cancelado'))  $row.addClass('evento-cancelado');
        });
    }

    tabla.on('draw', function () { moverBuscador(); aplicarClasesCategoria(); actualizarContador(); });
    aplicarClasesCategoria();


    $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
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
    $('#filtro-estado, #filtro-categoria').on('change', function () { tabla.draw(); actualizarEstiloFiltros(); });
    $('#filtro-orden').on('change', function () { tabla.order([2, $(this).val()]).draw(); actualizarEstiloFiltros(); });
    $('#btn-limpiar-filtros').on('click', function () {
        $('#filtro-estado, #filtro-categoria, #filtro-fecha-desde, #filtro-fecha-hasta').val('');
        $('#filtro-orden').val('desc');
        $('.dataTables_filter input').val('').trigger('keyup');
        tabla.order([2, 'desc']).draw(); actualizarEstiloFiltros();
    });

    function actualizarContador() {
        const info = tabla.page.info(), total = info.recordsTotal, filtrado = info.recordsDisplay;
        $('#filtros-resultado').html(filtrado === total
            ? `Mostrando ${total} actividad${total !== 1 ? 'es' : ''}`
            : `Mostrando <strong>${filtrado}</strong> de ${total} actividad${total !== 1 ? 'es' : ''}`);
    }

    function actualizarEstiloFiltros() {
        ['#filtro-estado','#filtro-categoria','#filtro-fecha-desde','#filtro-fecha-hasta','#filtro-orden']
            .forEach(id => {
                const $el = $(id), default_ = id === '#filtro-orden' ? $el.val() === 'desc' : $el.val() === '';
                $el.toggleClass('filtro-activo', !default_);
            });
    }


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

        const $btnGuardar  = $(form).find('.btn-guardar');
        const formData     = new FormData(form);
        const esEdicion    = form.action.includes('editar');
        const tituloEvento = formData.get('titulo').trim();
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
            modal.removeClass('mostrar'); form.reset(); limpiarTodosLosErrores();
            $('#contador-titulo, #contador-descripcion').remove();
            tabla.ajax.reload(null, false);
            Alerta.exito(
                esEdicion ? '¡Actualizado!' : '¡Guardado!',
                `La actividad "${tituloEvento}" fue ${esEdicion ? 'actualizada' : 'creada'} con éxito.`
            );
        })
        .catch(err => { console.error(err); Alerta.error('Error del servidor', 'No se pudieron guardar los cambios. Intente de nuevo.'); })
        .finally(() => $btnGuardar.prop('disabled', false).html('<i class="fa-solid fa-floppy-disk"></i> Guardar'));
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
        .then(res => res.json())
        .then(data => {
            if (data.status === 'error') { Alerta.advertencia('No permitido', data.message); return; }
            renderEstadoBadge(data.estado); marcarBotonActivo(data.estado); tabla.ajax.reload(null, false);
        })
        .catch(() => Alerta.error('Error de conexión', 'No se pudo cambiar el estado del evento.'))
        .finally(() => $btn.prop('disabled', false));
    });


    window.verEvento = function (id) {
        fetch(OBTENER_EVENTO_BASE + id + '/')
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
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

    window.editarEvento = function (id) {
        fetch(OBTENER_EVENTO_BASE + id + '/')
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
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

    window.eliminarEvento = function (id) {
        fetch(OBTENER_EVENTO_BASE + id + '/')
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => {
            Alerta.confirmarEliminar(data.titulo).then(result => {
                if (!result.isConfirmed) return;
                fetch(ELIMINAR_EVENTO_BASE + id + '/', {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCookie('csrftoken'), 'X-Requested-With': 'XMLHttpRequest' }
                })
                .then(res => res.json())
                .then(resp => {
                    if (resp.status === 'error') { Alerta.error('No permitido', resp.message); return; }
                    Alerta.exito('¡Eliminado!', `La actividad "${data.titulo}" fue borrada.`);
                    tabla.ajax.reload();
                })
                .catch(() => Alerta.error('Error de conexión', 'No se pudo eliminar la actividad.'));
            });
        })
        .catch(() => Alerta.error('Error de conexión', 'No se pudo obtener la información del evento.'));
    };


    $('#btn-cerrar-modal-evento, #btn-cancelar-evento').on('click', function () {
        modal.removeClass('mostrar'); limpiarTodosLosErrores();
        $('#contador-titulo, #contador-descripcion').remove();
    });
    $('#btn-cerrar-detalle, #btn-cancelar-detalle').on('click', function () {
        modalDetalle.removeClass('mostrar'); eventoDetalleId = null;
    });
    $(window).on('click', function (e) {
        if ($(e.target).is(modal)) { modal.removeClass('mostrar'); limpiarTodosLosErrores(); $('#contador-titulo, #contador-descripcion').remove(); }
        if ($(e.target).is(modalDetalle)) { modalDetalle.removeClass('mostrar'); eventoDetalleId = null; }
    });
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            if (modal.hasClass('mostrar')) { modal.removeClass('mostrar'); limpiarTodosLosErrores(); $('#contador-titulo, #contador-descripcion').remove(); }
            if (modalDetalle.hasClass('mostrar')) { modalDetalle.removeClass('mostrar'); eventoDetalleId = null; }
        }
    });

});