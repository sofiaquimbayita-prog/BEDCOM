$(document).ready(function () {

    /* ═══════════════════════════════════════════════════
       TOASTS — igual que el original
       ═══════════════════════════════════════════════════ */
    function obtenerContenedor() {
        let $c = $('#toast-container');
        if (!$c.length) { $c = $('<div class="messages" id="toast-container"></div>'); $('body').append($c); }
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
    }
    function cerrarToastElement($t) { $t.addClass('fade-out'); setTimeout(() => $t.remove(), 400); }
    window.cerrarToast = btn => cerrarToastElement($(btn).closest('.message'));

    const Alerta = {
        exito(titulo, texto)       { mostrarToast('success', `<strong>${titulo}</strong> ${texto}`); return Promise.resolve(); },
        advertencia(titulo, texto) { mostrarToast('warning', `<strong>${titulo}:</strong> ${texto}`, 0); return Promise.resolve(); },
        error(titulo, texto)       { mostrarToast('error',   `<strong>${titulo}:</strong> ${texto}`, 0); return Promise.resolve(); },
    };

    /* ═══════════════════════════════════════════════════
       REFERENCIAS — igual que el original
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
    let calendarInstance   = null;
    let filtroEstado       = '';
    let filtroCategoria    = '';

    const estadoConfig = {
        pendiente:  { label: 'Pendiente',  color: '#f1c40f', icon: 'fa-regular fa-clock'      },
        completado: { label: 'Completado', color: '#2ecc71', icon: 'fa-solid fa-circle-check' },
        cancelado:  { label: 'Cancelado',  color: '#e74c3c', icon: 'fa-solid fa-ban'           },
    };

    /* ═══════════════════════════════════════════════════
       HELPERS
       ═══════════════════════════════════════════════════ */
    function getCookie(name) {
        let v = null;
        if (document.cookie) document.cookie.split(';').forEach(c => {
            const t = c.trim();
            if (t.startsWith(name + '=')) v = decodeURIComponent(t.slice(name.length + 1));
        });
        return v;
    }
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

    /* ═══════════════════════════════════════════════════
       CARGA EVENTOS PARA FULLCALENDAR
       ═══════════════════════════════════════════════════ */
    async function cargarEventos() {
        const url = mostrandoInactivos ? EVENTOS_DATA_URL + '?inactivos=1' : EVENTOS_DATA_URL;
        try {
            const resp = await fetch(url);
            const json = await resp.json();
            let eventos = json.data || [];

            if (filtroEstado)    eventos = eventos.filter(e => e.estado === filtroEstado);
            if (filtroCategoria) eventos = eventos.filter(e => e.categoria.toLowerCase() === filtroCategoria.toLowerCase());

            return eventos.map(e => {
                const color   = e.categoria_color || '#3498db';
                const estCfg  = estadoConfig[e.estado] || estadoConfig.pendiente;
                const [h, m]  = (e.hora || '00:00').split(':').map(Number);
                const endHour = Math.min(h + 1, 21);
                const endStr  = `${String(endHour).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

                return {
                    id:              e.id,
                    title:           e.titulo,
                    start:           `${e.fecha}T${e.hora || '00:00'}`,
                    end:             `${e.fecha}T${endStr}`,
                    backgroundColor: color + '1a',
                    borderColor:     color,
                    textColor:       '#eef2f8',
                    extendedProps: {
                        categoria:       e.categoria,
                        categoria_color: color,
                        descripcion:     e.descripcion,
                        estado:          e.estado,
                        estado_color:    estCfg.color,
                        estado_label:    estCfg.label,
                        estado_icon:     estCfg.icon,
                        fecha_display:   e.fecha_display,
                        activo:          e.activo,
                        raw_hora:        e.hora,
                    }
                };
            });
        } catch (err) {
            console.error('Error cargando eventos:', err);
            return [];
        }
    }

    /* ═══════════════════════════════════════════════════
       FULLCALENDAR
       ═══════════════════════════════════════════════════ */
    calendarInstance = new FullCalendar.Calendar(document.getElementById('calendar'), {
        locale:          'es',
        initialView:     'timeGridWeek',
        headerToolbar: {
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth,timeGridWeek,timeGridDay',
        },
        buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' },
        height:            'auto',
        slotMinTime:       '06:00:00',
        slotMaxTime:       '22:00:00',
        slotDuration:      '00:30:00',
        slotLabelInterval: '01:00:00',
        allDaySlot:        false,
        nowIndicator:      true,
        dayHeaderFormat: { weekday: 'short', day: 'numeric', month: 'short', omitCommas: true },
        slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },

        eventContent: function (arg) {
            const ep    = arg.event.extendedProps;
            const color = ep.categoria_color || '#3498db';
            return {
                html: `
                <div class="fc-event-custom" style="border-left-color:${color};">
                    <div class="fce-header">
                        <span class="fce-dot" style="background:${color};"></span>
                        <span class="fce-title">${arg.event.title}</span>
                    </div>
                    <div class="fce-meta">
                        <span class="fce-hora"><i class="fa-regular fa-clock"></i> ${ep.raw_hora || ''}</span>
                        <span class="fce-cat" style="color:${color};">${ep.categoria}</span>
                    </div>
                    <span class="fce-estado" style="color:${ep.estado_color};border-color:${ep.estado_color}44;">
                        <i class="${ep.estado_icon}"></i> ${ep.estado_label}
                    </span>
                </div>`
            };
        },

        // Click en evento → modal detalle (igual que antes)
        eventClick: function (info) {
            verEvento(info.event.id);
        },

        // Click en celda vacía → modal crear con fecha/hora pre-rellenas
        dateClick: function (info) {
            const fecha = info.dateStr.slice(0, 10);
            const hora  = info.dateStr.length > 10 ? info.dateStr.slice(11, 16) : '';
            abrirModalCrear(fecha, hora);
        },

        events: async function (fetchInfo, successCallback, failureCallback) {
            try { successCallback(await cargarEventos()); }
            catch (e) { failureCallback(e); }
        },
    });

    calendarInstance.render();

    /* ═══════════════════════════════════════════════════
       SWITCH INACTIVOS — mismo comportamiento original
       ═══════════════════════════════════════════════════ */
    $('#switch-inactivos').on('change', function () {
        mostrandoInactivos = this.checked;
        $('#switch-inactivos-label').toggleClass('activo', mostrandoInactivos);
        $('#filtro-estado')
            .val('')
            .prop('disabled', mostrandoInactivos)
            .toggleClass('filtro-deshabilitado', mostrandoInactivos);
        if (mostrandoInactivos) filtroEstado = '';
        calendarInstance.refetchEvents();
    });

    /* ═══════════════════════════════════════════════════
       FILTROS
       ═══════════════════════════════════════════════════ */
    $('#filtro-estado').on('change', function () {
        filtroEstado = $(this).val();
        $(this).toggleClass('filtro-activo', filtroEstado !== '');
        calendarInstance.refetchEvents();
    });
    $('#filtro-categoria').on('change', function () {
        filtroCategoria = $(this).val();
        $(this).toggleClass('filtro-activo', filtroCategoria !== '');
        calendarInstance.refetchEvents();
    });
    $('#btn-limpiar-filtros').on('click', function () {
        filtroEstado = ''; filtroCategoria = '';
        $('#filtro-estado, #filtro-categoria').val('').removeClass('filtro-activo');
        calendarInstance.refetchEvents();
    });

    /* ═══════════════════════════════════════════════════
       VALIDACIÓN INLINE — igual que el original
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
       CRUD — misma lógica, solo recargar con refetchEvents
       ═══════════════════════════════════════════════════ */
    function abrirModalCrear(fecha = '', hora = '') {
        form.reset(); limpiarTodosLosErrores();
        $('#contador-titulo, #contador-descripcion').remove();
        if (eventoIdInput) eventoIdInput.value = '';
        tituloModal.innerText = 'Agregar Nueva Actividad';
        form.action = CREAR_EVENTO_URL;
        if (fecha) $('#in_fecha').val(fecha);
        else       $('#in_fecha').attr('min', new Date().toISOString().slice(0, 10));
        if (hora) $('#in_hora').val(hora);
        modal.addClass('mostrar');
        setTimeout(() => $('#in_titulo').focus(), 150);
    }

    $('#btn-nueva-actividad').on('click', () => abrirModalCrear());

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
                calendarInstance.refetchEvents();
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
                renderEstadoBadge(data.estado); marcarBotonActivo(data.estado);
                calendarInstance.refetchEvents();
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
       INACTIVAR / RESTAURAR
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
                calendarInstance.refetchEvents();
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo inactivar la actividad.'))
            .finally(() => {
                eventoInactivarId = null;
                $btn.prop('disabled', false).html('<i class="fa-solid fa-eye-slash"></i> Sí, inactivar');
            });
    });

    window.restaurarEvento = function (id) {
        fetch(RESTAURAR_EVENTO_BASE + id + '/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken'), 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(resp => {
                if (resp.status === 'error') { Alerta.error('No permitido', resp.message); return; }
                Alerta.exito('¡Restaurada!', 'La actividad vuelve a estar activa en la lista principal.');
                calendarInstance.refetchEvents();
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo restaurar la actividad.'));
    };

    /* ═══════════════════════════════════════════════════
       CERRAR MODALES — igual que el original
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