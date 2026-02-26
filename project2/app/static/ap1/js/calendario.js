$(document).ready(function () {

    /* 
       TOAST SYSTEM
     */
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

    const Alerta = {
        exito(titulo, texto)       { mostrarToast('success', `<strong>${titulo}</strong> ${texto}`); },
        advertencia(titulo, texto) { mostrarToast('warning', `<strong>${titulo}:</strong> ${texto}`, 0); },
        error(titulo, texto)       { mostrarToast('error',   `<strong>${titulo}:</strong> ${texto}`, 0); },
    };


    /* 
       REFERENCIAS DOM
       — compatibles con el HTML nuevo —
     */
    const modal          = $('#modal-evento');
    const modalDetalle   = $('#modal-detalle-evento');
    const modalInactivar = $('#modal-inactivar');
    const form           = document.getElementById('form-evento');
    const tituloModal    = document.getElementById('modal-evento-titulo');
    const eventoIdInput  = document.getElementById('evento-id');

    let eventoDetalleId   = null;
    let eventoInactivarId = null;
    let textoBusqueda     = '';
    let calendarInstance  = null;
    let fechaSeleccionada = null;      // para el panel derecho
    let completadasLimit  = 5;         // cuántas completadas mostrar

    /* 
       UTILS
     */
    function getCsrf() {
        // Primero intenta la constante del HTML nuevo, luego la cookie
        if (typeof CSRF_TOKEN !== 'undefined') return CSRF_TOKEN;
        let v = null;
        document.cookie.split(';').forEach(c => {
            const t = c.trim();
            if (t.startsWith('csrftoken=')) v = decodeURIComponent(t.slice(10));
        });
        return v;
    }

    function actualizarToggleCompletado(completado) {
        $('#detalle-toggle-completado').prop('checked', completado);
        $('#completado-toggle-texto').text(completado ? 'Completado ✓' : 'Marcar como completado');
    }

    function normalizar(str) {
        return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // Resuelve la URL correcta sin importar si viene de URLS (nuevo) o constante suelta (viejo)
    function url(nombre) {
        if (typeof URLS !== 'undefined' && URLS[nombre]) return URLS[nombre];
        // fallback a variables sueltas por si acaso
        const mapa = {
            eventosData:   typeof EVENTOS_DATA_URL    !== 'undefined' ? EVENTOS_DATA_URL    : '',
            crearEvento:   typeof CREAR_EVENTO_URL    !== 'undefined' ? CREAR_EVENTO_URL    : '',
            editarBase:    typeof EDITAR_EVENTO_BASE  !== 'undefined' ? EDITAR_EVENTO_BASE  : '',
            obtenerBase:   typeof OBTENER_EVENTO_BASE !== 'undefined' ? OBTENER_EVENTO_BASE : '',
            cambiarEstado: typeof CAMBIAR_ESTADO_BASE !== 'undefined' ? CAMBIAR_ESTADO_BASE : '',
            inactivarBase: typeof INACTIVAR_EVENTO_BASE !== 'undefined' ? INACTIVAR_EVENTO_BASE : '',
            restaurarBase: typeof RESTAURAR_EVENTO_BASE !== 'undefined' ? RESTAURAR_EVENTO_BASE : '',
        };
        return mapa[nombre] || '';
    }


    /* 
       BÚSQUEDA
     */
    $('#input-busqueda').on('input', function () {
        textoBusqueda = $(this).val().trim();
        $('#busqueda-wrap').toggleClass('tiene-texto', textoBusqueda.length > 0);
        if (calendarInstance) calendarInstance.refetchEvents();
        renderProximas();
        renderCompletadas();
    });

    $('#busqueda-clear').on('click', function () {
        $('#input-busqueda').val('');
        textoBusqueda = '';
        $('#busqueda-wrap').removeClass('tiene-texto');
        if (calendarInstance) calendarInstance.refetchEvents();
        renderProximas();
        renderCompletadas();
    });


    /* 
       CARGA DE EVENTOS
     */
    async function cargarEventos() {
        try {
            const resp = await fetch(url('eventosData'));
            const json = await resp.json();
            let eventos = json.data || [];

            // Excluir eliminados siempre; excluir completados de la vista normal
            eventos = eventos.filter(e => e.estado !== 'eliminado' && e.estado !== 'completado');

            if (textoBusqueda) {
                const q = normalizar(textoBusqueda);
                eventos = eventos.filter(e =>
                    normalizar(e.titulo).includes(q) || normalizar(e.categoria).includes(q)
                );
            }

            // Actualizar sidebar con todos los eventos (sin filtro de búsqueda para el conteo)
            actualizarSidebar(json.data || []);

            return eventos.map(e => {
                const color = e.categoria_color || '#3498db';
                return {
                    id:              e.id,
                    title:           e.titulo,
                    start:           `${e.fecha}T${e.hora || '00:00'}`,
                    backgroundColor: color + '14',
                    borderColor:     color,
                    textColor:       '#e8edf8',
                    extendedProps: {
                        categoria:       e.categoria,
                        categoria_color: color,
                        descripcion:     e.descripcion,
                        estado:          e.estado,
                        fecha_display:   e.fecha_display,
                        activo:          e.activo,
                        raw_hora:        e.hora,
                        modo_completado: e.modo_completado,
                    }
                };
            });
        } catch (err) {
            console.error('Error cargando eventos:', err);
            return [];
        }
    }

    // Cache de todos los eventos para el sidebar
    let _todosEventos = [];

    async function cargarTodosParaSidebar() {
        try {
            const resp = await fetch(url('eventosData'));
            const json = await resp.json();
            _todosEventos = (json.data || []).filter(e => e.estado !== 'eliminado');
            actualizarSidebar(_todosEventos);
            if (fechaSeleccionada) actualizarPanelDerecho(fechaSeleccionada);
            renderProximas();
            renderCompletadas();
        } catch (e) { console.error(e); }
    }


    /* 
       SIDEBAR IZQUIERDO — Categorías + Próximas
     */
    function actualizarSidebar(eventos) {
        _todosEventos = eventos.filter(e => e.estado !== 'eliminado');
        renderCategorias(_todosEventos);
    }

    function renderCategorias(eventos) {
        const $list = $('#cat-list');
        if (!$list.length) return;

        const mapa = {};
        eventos.forEach(e => {
            if (!mapa[e.categoria_id]) {
                mapa[e.categoria_id] = { nombre: e.categoria, color: e.categoria_color, total: 0 };
            }
            mapa[e.categoria_id].total++;
        });

        const cats = Object.values(mapa);
        if (!cats.length) {
            $list.html('<div class="empty-state"><i class="fa-solid fa-tags"></i><p>Sin categorías</p></div>');
            return;
        }

        $list.html(cats.map(c => `
            <div class="cat-item">
                <span class="cat-dot" style="background:${c.color};color:${c.color};"></span>
                <span class="cat-nombre">${c.nombre}</span>
                <span class="cat-count">${c.total}</span>
            </div>
        `).join(''));
    }

    function renderProximas() {
        const $container = $('#proximas-list');
        if (!$container.length) return;

        const hoy     = new Date(); hoy.setHours(0,0,0,0);
        const manana  = new Date(hoy); manana.setDate(manana.getDate() + 1);
        const pasadoM = new Date(hoy); pasadoM.setDate(pasadoM.getDate() + 2);

        let lista = _todosEventos.filter(e => e.estado === 'pendiente');

        if (textoBusqueda) {
            const q = normalizar(textoBusqueda);
            lista = lista.filter(e => normalizar(e.titulo).includes(q));
        }

        const hoyEvs    = lista.filter(e => { const d = new Date(e.fecha+'T12:00:00'); return d >= hoy && d < manana; }).sort((a,b)=>a.hora.localeCompare(b.hora));
        const mananaEvs = lista.filter(e => { const d = new Date(e.fecha+'T12:00:00'); return d >= manana && d < pasadoM; }).sort((a,b)=>a.hora.localeCompare(b.hora));

        let html = '';
        if (!hoyEvs.length && !mananaEvs.length) {
            html = '<div class="empty-state"><i class="fa-regular fa-calendar-check"></i><p>Sin próximas actividades</p></div>';
        } else {
            if (hoyEvs.length)    { html += '<p class="proxima-grupo-label">Hoy</p>' + hoyEvs.map(proximaHTML).join(''); }
            if (mananaEvs.length) { html += '<p class="proxima-grupo-label">Mañana</p>' + mananaEvs.map(proximaHTML).join(''); }
        }
        $container.html(html);
    }

    function proximaHTML(e) {
        return `
            <div class="proxima-item" style="border-left-color:${e.categoria_color};"
                 onclick="verEvento(${e.id})">
                <span class="proxima-hora">${e.hora}</span>
                <span class="proxima-titulo">${e.titulo}</span>
                <span class="proxima-badge"
                      style="background:${e.categoria_color}22;color:${e.categoria_color};border:1px solid ${e.categoria_color}44;">
                    ${e.categoria}
                </span>
            </div>`;
    }


    /* 
       COMPLETADAS RECIENTES
     */
    function renderCompletadas() {
        const $container = $('#completadas-list');
        if (!$container.length) return;

        const completadas = _todosEventos
            .filter(e => e.estado === 'completado')
            .sort((a, b) => {
                // Ordenar por fecha+hora descendente (más reciente primero)
                const da = new Date(`${a.fecha}T${a.hora || '00:00'}`);
                const db = new Date(`${b.fecha}T${b.hora || '00:00'}`);
                return db - da;
            })
            .slice(0, completadasLimit);

        if (!completadas.length) {
            $container.html(`<div class="empty-state">
                <i class="fa-regular fa-circle-check"></i>
                <p>Sin actividades completadas</p>
            </div>`);
            return;
        }

        $container.html(completadas.map(e => `
            <div class="completada-item" data-id="${e.id}">
                <div class="completada-dot-col">
                    <span class="completada-dot" style="background:${e.categoria_color};box-shadow:0 0 5px ${e.categoria_color}66;"></span>
                </div>
                <div class="completada-body">
                    <span class="completada-titulo">${e.titulo}</span>
                    <span class="completada-meta">
                        <i class="fa-regular fa-calendar"></i> ${e.fecha_display || e.fecha}
                        &nbsp;·&nbsp;
                        <i class="fa-regular fa-clock"></i> ${e.hora}
                    </span>
                    <span class="completada-cat"
                          style="color:${e.categoria_color};background:${e.categoria_color}18;border:1px solid ${e.categoria_color}33;">
                        ${e.categoria}
                    </span>
                </div>
                <button type="button" class="completada-reactivar" data-id="${e.id}" title="Volver a pendiente">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
            </div>
        `).join(''));
    }

    // Toggle botones 5 / 10
    $(document).on('click', '.completadas-limit-btn', function () {
        completadasLimit = parseInt($(this).data('limit'));
        $('.completadas-limit-btn').removeClass('active');
        $(this).addClass('active');
        renderCompletadas();
    });

    // Reactivar: cambiar estado de completado → pendiente
    $(document).on('click', '.completada-reactivar', function (e) {
        e.stopPropagation();
        const id  = $(this).data('id');
        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i>');

        const urlEstado = (typeof URLS !== 'undefined' && URLS.completarBase)
            ? URLS.completarBase + id + '/'
            : '';

        const fd = new FormData();
        fd.append('estado', 'pendiente');

        fetch(urlEstado, {
            method: 'POST', body: fd,
            headers: { 'X-CSRFToken': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(data => {
                if (data.status === 'error') {
                    Alerta.advertencia('No permitido', data.message);
                    $btn.prop('disabled', false).html('<i class="fa-solid fa-rotate-left"></i>');
                    return;
                }
                calendarInstance.refetchEvents();
                cargarTodosParaSidebar();
                Alerta.exito('¡Reactivada!', 'La actividad volvió al calendario como pendiente.');
            })
            .catch(() => {
                Alerta.error('Error', 'No se pudo reactivar la actividad.');
                $btn.prop('disabled', false).html('<i class="fa-solid fa-rotate-left"></i>');
            });
    });
     
    function seleccionarFecha(fechaStr) {
        fechaSeleccionada = fechaStr;
        actualizarPanelDerecho(fechaStr);
    }

    function actualizarPanelDerecho(fechaStr) {
        const $num  = $('#right-fecha-numero');
        const $text = $('#right-fecha-texto');
        if (!$num.length) return;

        const d = new Date(fechaStr + 'T12:00:00');
        $num.text(d.getDate());
        $text.text(d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long' }));

        const evsDia = _todosEventos
            .filter(e => e.fecha === fechaStr && e.estado !== 'eliminado')
            .sort((a, b) => a.hora.localeCompare(b.hora));

        renderTareasDia(evsDia);
    }

    function renderTareasDia(eventos) {
        const $timeline = $('#tareas-timeline');
        if (!$timeline.length) return;

        if (!eventos.length) {
            $timeline.html(`<div class="empty-state">
                <i class="fa-regular fa-calendar-xmark"></i>
                <p>Sin actividades este día</p>
            </div>`);
            return;
        }

        $timeline.html(eventos.map((e, idx) => `
            <div class="tarea-item" onclick="verEvento(${e.id})">
                <div class="tarea-time-col">
                    <span class="tarea-hora">${e.hora}</span>
                    <div class="tarea-dot" style="background:${e.categoria_color};box-shadow:0 0 6px ${e.categoria_color}66;"></div>
                    ${idx < eventos.length - 1 ? '<div class="tarea-line"></div>' : ''}
                </div>
                <div class="tarea-content" style="border-left-color:${e.categoria_color};">
                    <div class="tarea-titulo-item">${e.titulo}</div>
                    <div class="tarea-cat-label">${e.categoria}</div>
                    <span class="tarea-estado ${e.estado}">${e.estado.charAt(0).toUpperCase() + e.estado.slice(1)}</span>
                </div>
            </div>
        `).join(''));
    }


    /* 
       FULLCALENDAR
     */
    calendarInstance = new FullCalendar.Calendar(document.getElementById('calendar'), {
        locale:      'es',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth,dayGridWeek',
        },
        buttonText: {
            today:       'Hoy',
            month:       'Mes',
            dayGridWeek: 'Semana',
        },
        views: {
            dayGridWeek: {
                dayHeaderFormat: { weekday: 'short', day: 'numeric', month: 'short' },
            },
        },
        height: 'auto',

        eventContent: function (arg) {
            const ep    = arg.event.extendedProps;
            const color = ep.categoria_color || '#3498db';
            const done  = ep.estado === 'completado';
            const catBorder = color + '55';
            const catBg     = color + '18';
            return {
                html: `
                <div class="fc-event-custom${done ? ' fce-completado' : ''}" style="--fce-color:${color};">
                    <div class="fce-row-title">
                        <span class="fce-dot" style="background:${color};box-shadow:0 0 4px ${color}88;"></span>
                        <span class="fce-title">${arg.event.title}</span>
                        ${done ? '<i class="fa-solid fa-circle-check fce-icon-done"></i>' : ''}
                    </div>
                    <div class="fce-row-meta">
                        <span class="fce-chip fce-chip-hora">
                            <i class="fa-regular fa-clock"></i>${ep.raw_hora || ''}
                        </span>
                        <span class="fce-chip fce-chip-cat"
                              style="color:${color};border-color:${catBorder};background:${catBg};">
                            ${ep.categoria}
                        </span>
                    </div>
                </div>`
            };
        },

        eventClick: function (info) { verEvento(info.event.id); },

        dateClick: function (info) {
            seleccionarFecha(info.dateStr.slice(0, 10));
        },

        events: async function (fetchInfo, successCallback, failureCallback) {
            try { successCallback(await cargarEventos()); }
            catch (e) { failureCallback(e); }
        },
    });

    calendarInstance.render();

    // Cargar sidebar al inicio
    cargarTodosParaSidebar();

    // Panel derecho con hoy por defecto
    const hoyStr = new Date().toISOString().slice(0, 10);
    seleccionarFecha(hoyStr);


    /* 
       VALIDACIÓN  FORMULARIO
     */
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
        Object.entries(errores).forEach(([campo, mensaje]) => {
            const id = CAMPO_A_INPUT[campo];
            if (id) mostrarError(id, mensaje);
            else if (campo === '__all__') Alerta.advertencia('No se pudo guardar', mensaje);
        });
        $('.form-input.input-error, .form-select.input-error').first().focus();
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


    /* 
       CREAR / EDITAR — formulario
     */
    function abrirModalCrear(fecha = '', hora = '') {
        if (!form) return;
        form.reset(); limpiarTodosLosErrores();
        $('#contador-titulo, #contador-descripcion').remove();
        if (eventoIdInput) eventoIdInput.value = '';
        if (tituloModal) tituloModal.innerText = 'Agregar Nueva Actividad';
        form.action = url('crearEvento');
        if (fecha) $('#in_fecha').val(fecha);
        else       $('#in_fecha').attr('min', new Date().toISOString().slice(0, 10));
        if (hora) $('#in_hora').val(hora);
        modal.addClass('mostrar');
        setTimeout(() => $('#in_titulo').focus(), 150);
    }

    // Toggle visual modo completado
    $(document).on('change', 'input[name="modo_completado"]', function () {
        $('.modo-option').removeClass('selected');
        $(this).closest('.modo-option').addClass('selected');
    });

    $('#btn-nueva-actividad').on('click', () => abrirModalCrear());

    if (form) {
        form.onsubmit = function (e) {
            e.preventDefault();
            const $btn      = $('#btn-guardar-evento');
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
                    cargarTodosParaSidebar();
                    Alerta.exito(
                        esEdicion ? '¡Actualizado!' : '¡Guardado!',
                        `La actividad "${titulo}" fue ${esEdicion ? 'actualizada' : 'creada'} con éxito.`
                    );
                })
                .catch(() => Alerta.error('Error del servidor', 'No se pudieron guardar los cambios.'))
                .finally(() => $btn.prop('disabled', false).html('<i class="fa-solid fa-floppy-disk"></i> Guardar'));
        };
    }


    /*  
       VER DETALLE
     */
    window.verEvento = function (id) {
        fetch(url('obtenerBase') + id + '/')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                eventoDetalleId = data.id;

                $('#detalle-titulo').text(data.titulo);
                $('#detalle-fecha').text(data.fecha_display);
                $('#detalle-hora').text(data.hora);
                $('#detalle-descripcion').text(data.descripcion || '—');
                $('#detalle-badge-cat')
                    .text(data.categoria_nombre)
                    .css({ color: data.categoria_color, borderColor: data.categoria_color + '55' });

                // Toggle completado: solo visible en modo manual
                const esModoManual = data.modo_completado === 'manual';
                const $toggleRow   = $('#toggle-completado-row');
                if (esModoManual) {
                    $toggleRow.show();
                    actualizarToggleCompletado(data.estado === 'completado');
                    $('#detalle-toggle-completado').prop('disabled', data.estado === 'completado');
                } else {
                    $toggleRow.hide();
                }

                // Botón inactivar: solo si está activo
                $('#btn-detalle-inactivar').toggle(data.activo !== false);

                modalDetalle.addClass('mostrar');
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo cargar la información del evento.'));
    };


    /* 
       TOGGLE COMPLETADO (modo manual)
     */
    $('#detalle-toggle-completado').on('change', function () {
        if (!eventoDetalleId) return;
        const nuevoEstado = this.checked ? 'completado' : 'pendiente';
        const $toggle = $(this);
        $toggle.prop('disabled', true);

        const fd = new FormData();
        fd.append('estado', nuevoEstado);

        // Intenta primero con URLS.completarBase (nuevo), si no con CAMBIAR_ESTADO_BASE (viejo)
        const urlEstado = (typeof URLS !== 'undefined' && URLS.completarBase)
            ? URLS.completarBase + eventoDetalleId + '/'
            : (typeof CAMBIAR_ESTADO_BASE !== 'undefined' ? CAMBIAR_ESTADO_BASE + eventoDetalleId + '/' : '');

        fetch(urlEstado, {
            method: 'POST', body: fd,
            headers: { 'X-CSRFToken': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(data => {
                if (data.status === 'error') {
                    actualizarToggleCompletado(nuevoEstado !== 'completado');
                    Alerta.advertencia('No permitido', data.message);
                    return;
                }
                actualizarToggleCompletado(data.estado === 'completado');
                cerrarModalDetalle();
                calendarInstance.refetchEvents();
                cargarTodosParaSidebar();
                Alerta.exito(
                    data.estado === 'completado' ? '¡Completado!' : 'Pendiente',
                    data.estado === 'completado'
                        ? 'La actividad fue marcada como completada.'
                        : 'La actividad volvió a estado pendiente.'
                );
            })
            .catch(() => {
                actualizarToggleCompletado(nuevoEstado !== 'completado');
                Alerta.error('Error de conexión', 'No se pudo cambiar el estado.');
            })
            .finally(() => $toggle.prop('disabled', false));
    });


    /* 
       BOTONES EDITAR / INACTIVAR EN DETALLE
     */
    $('#btn-detalle-editar').on('click', function () {
        if (!eventoDetalleId) return;
        const id = eventoDetalleId;
        cerrarModalDetalle();
        editarEvento(id);
    });

    $('#btn-detalle-inactivar').on('click', function () {
        if (!eventoDetalleId) return;
        const id = eventoDetalleId;
        cerrarModalDetalle();
        abrirModalInactivar(id);
    });


    /* 
       EDITAR EVENTO
     */
    window.editarEvento = function (id) {
        fetch(url('obtenerBase') + id + '/')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                if (!form) return;
                $('#in_fecha').removeAttr('min');
                form.titulo.value      = data.titulo;
                form.fecha.value       = data.fecha;
                form.hora.value        = data.hora;
                form.categoria.value   = data.categoria;
                form.descripcion.value = data.descripcion || '';
                if (eventoIdInput) eventoIdInput.value = data.id;
                $('#in_titulo').trigger('input');
                if (data.descripcion) $('#in_descripcion').trigger('input');
                limpiarTodosLosErrores();
                if (tituloModal) tituloModal.innerText = 'Editar Actividad';
                form.action = url('editarBase') + id + '/';
                modal.addClass('mostrar');
                setTimeout(() => $('#in_titulo').focus(), 150);
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo cargar la información del evento.'));
    };


    /*       INACTIVAR ACTIVIDAD    */
    window.abrirModalInactivar = function (id) {
        fetch(url('obtenerBase') + id + '/')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                eventoInactivarId = data.id;
                // Soporta ambos IDs de nombre del evento
                $('#inactivar-nombre-evento, #eliminar-nombre-evento').text(`"${data.titulo}"`);
                // Abre el modal que exista en el HTML
                if ($('#modal-eliminar').length)   $('#modal-eliminar').addClass('mostrar');
                else if (modalInactivar.length)    modalInactivar.addClass('mostrar');
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo obtener la información del evento.'));
    };

    // Confirmar inactivar (modal viejo)
    $('#btn-confirmar-inactivar').on('click', function () {
        if (!eventoInactivarId) return;
        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Procesando…');

        const inactivarUrl = (typeof URLS !== 'undefined' && URLS.eliminarBase)
            ? URLS.eliminarBase + eventoInactivarId + '/'
            : (typeof INACTIVAR_EVENTO_BASE !== 'undefined' ? INACTIVAR_EVENTO_BASE + eventoInactivarId + '/' : '');

        fetch(inactivarUrl, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(resp => {
                if (resp.status === 'error') { Alerta.error('No permitido', resp.message); return; }
                cerrarModalInactivar();
                calendarInstance.refetchEvents();
                cargarTodosParaSidebar();
                Alerta.exito('Eliminada', 'La actividad fue eliminada del calendario.');
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo eliminar la actividad.'))
            .finally(() => {
                eventoInactivarId = null;
                $btn.prop('disabled', false).html('<i class="fa-solid fa-eye-slash"></i> Sí, inactivar');
            });
    });

    // Confirmar eliminar (modal nuevo)
    $('#btn-confirmar-eliminar').on('click', function () {
        if (!eventoInactivarId) return;
        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Eliminando…');

        const eliminarUrl = (typeof URLS !== 'undefined' && URLS.eliminarBase)
            ? URLS.eliminarBase + eventoInactivarId + '/'
            : '';

        fetch(eliminarUrl, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(resp => {
                if (resp.status === 'error') { Alerta.error('No permitido', resp.message); return; }
                $('#modal-eliminar').removeClass('mostrar');
                calendarInstance.refetchEvents();
                cargarTodosParaSidebar();
                Alerta.exito('Eliminada', 'La actividad fue eliminada del calendario.');
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo eliminar la actividad.'))
            .finally(() => {
                eventoInactivarId = null;
                $btn.prop('disabled', false).html('<i class="fa-solid fa-trash"></i> Sí, eliminar');
            });
    });


    /*        RESTAURAR EVENTO */
    window.restaurarEvento = function (id) {
        const restaurarUrl = typeof RESTAURAR_EVENTO_BASE !== 'undefined' ? RESTAURAR_EVENTO_BASE + id + '/' : '';
        if (!restaurarUrl) return;
        fetch(restaurarUrl, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(resp => {
                if (resp.status === 'error') { Alerta.error('No permitido', resp.message); return; }
                calendarInstance.refetchEvents();
                cargarTodosParaSidebar();
                Alerta.exito('¡Restaurada!', 'La actividad vuelve a estar activa en el calendario.');
            })
            .catch(() => Alerta.error('Error de conexión', 'No se pudo restaurar la actividad.'));
    };


    /*        CERRAR MODALES     */
    function cerrarModalEvento() {
        modal.removeClass('mostrar');
        limpiarTodosLosErrores();
        $('#contador-titulo, #contador-descripcion').remove();
    }
    function cerrarModalDetalle() {
        modalDetalle.removeClass('mostrar');
        eventoDetalleId = null;
    }
    function cerrarModalInactivar() {
        modalInactivar.removeClass('mostrar');
        $('#modal-eliminar').removeClass('mostrar');
        eventoInactivarId = null;
    }

    $('#btn-cerrar-modal-evento, #btn-cancelar-evento').on('click',  cerrarModalEvento);
    $('#btn-cerrar-detalle, #btn-cancelar-detalle').on('click',       cerrarModalDetalle);
    $('#btn-cerrar-inactivar, #btn-cancelar-inactivar').on('click',   cerrarModalInactivar);
    $('#btn-cerrar-eliminar,  #btn-cancelar-eliminar').on('click',    cerrarModalInactivar);

});