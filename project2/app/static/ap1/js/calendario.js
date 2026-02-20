$(document).ready(function () {

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

    const REGLAS = {

        titulo(valor) {
            const v = (valor || '').trim();
            if (!v)          return 'El título es obligatorio.';
            if (v.length < 3)  return 'El título debe tener al menos 3 caracteres.';
            if (v.length > 150) return 'El título no puede superar los 150 caracteres.';
            if (/[<>!='¡@||¬°+*{}\[\]\\]/.test(v)) 
                return 'El nombre contiene caracteres no permitidos ( < > { } [ ] \\ ! = ¡ @ || ¬ ° + * ).';
            return null;
        },

        fecha(valor, hora, esEdicion) {
            if (!valor) return 'La fecha es obligatoria.';

            const fechaEvento = new Date(valor + 'T' + (hora || '00:00'));
            if (isNaN(fechaEvento.getTime())) return 'El formato de la fecha no es válido.';

            // Solo para creación: no permitir fechas pasadas
            if (!esEdicion) {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                if (fechaEvento < hoy) return 'No puedes crear una actividad en el pasado.';
            }

            // Límite +5 años (igual que backend)
            const limite = new Date();
            limite.setFullYear(limite.getFullYear() + 5);
            if (fechaEvento > limite) return 'La fecha no puede ser superior a 5 años en el futuro.';

            return null;
        },

        hora(valor) {
            if (!valor) return 'La hora es obligatoria.';
            if (!/^\d{2}:\d{2}$/.test(valor)) return 'El formato de la hora no es válido (HH:MM).';
            return null;
        },

        categoria(valor) {
            if (!valor) return 'Debes seleccionar una categoría.';
            return null;
        },

        descripcion(valor) {
            const v = (valor || '').trim();
            if (v.length > 1000)
                return `Los detalles no pueden superar los 1000 caracteres (${v.length}/1000).`;
            return null;
        },
    };



    function mostrarError(fieldId, mensaje) {
        const $field = $('#' + fieldId);
        $field.addClass('input-error').attr('aria-invalid', 'true');

        const $grupo = $field.closest('.form-grupo');
        $grupo.find('.msg-error').remove();

        const $msg = $(`
            <span class="msg-error" role="alert" aria-live="assertive">
                <i class="fa-solid fa-triangle-exclamation"></i> ${mensaje}
            </span>`);
        $grupo.append($msg);
    }

    function mostrarExito(fieldId) {
        const $field = $('#' + fieldId);
        $field.removeClass('input-error').addClass('input-ok').attr('aria-invalid', 'false');
        $field.closest('.form-grupo').find('.msg-error').remove();
    }

    function limpiarEstado(fieldId) {
        const $field = $('#' + fieldId);
        $field.removeClass('input-error input-ok').removeAttr('aria-invalid');
        $field.closest('.form-grupo').find('.msg-error').remove();
    }

    function limpiarTodosLosErrores() {
        ['in_titulo', 'in_fecha', 'in_hora', 'in_categoria', 'in_descripcion']
            .forEach(limpiarEstado);
    }


    function validarFormulario() {
        let valido = true;

        const titulo      = $('#in_titulo').val();
        const fecha       = $('#in_fecha').val();
        const hora        = $('#in_hora').val();
        const categoria   = $('#in_categoria').val();
        const descripcion = $('#in_descripcion').val();
        const esEdicion   = form.action.includes('editar');

        // Mapa campo → resultado de regla
        const resultados = {
            in_titulo:      REGLAS.titulo(titulo),
            in_fecha:       REGLAS.fecha(fecha, hora, esEdicion),
            in_hora:        REGLAS.hora(hora),
            in_categoria:   REGLAS.categoria(categoria),
            in_descripcion: REGLAS.descripcion(descripcion),
        };

        Object.entries(resultados).forEach(([id, error]) => {
            if (error) {
                mostrarError(id, error);
                valido = false;
            } else {
                // Solo marcar verde si el campo tiene contenido
                const val = $('#' + id).val();
                if (val && val.trim() !== '') mostrarExito(id);
                else limpiarEstado(id);
            }
        });

        // Enfocar el primer campo con error
        if (!valido) {
            const $primerError = $('.form-input.input-error, .form-select.input-error').first();
            if ($primerError.length) $primerError.focus();
        }

        return valido;
    }



    // Título: al escribir
    $('#in_titulo').on('input', function () {
        const error = REGLAS.titulo($(this).val());
        if (error) mostrarError('in_titulo', error);
        else       mostrarExito('in_titulo');

        // Contador de caracteres
        const len    = $(this).val().trim().length;
        let $contador = $('#contador-titulo');
        if (!$contador.length) {
            $contador = $('<span id="contador-titulo" class="campo-contador"></span>');
            $(this).parent().append($contador);
        }
        $contador
            .text(len + '/150')
            .toggleClass('contador-alerta', len > 140);
    });

    // Fecha: al cambiar
    $('#in_fecha').on('change', function () {
        const esEdicion = form.action.includes('editar');
        const error     = REGLAS.fecha($(this).val(), $('#in_hora').val(), esEdicion);
        if (error) mostrarError('in_fecha', error);
        else       mostrarExito('in_fecha');
    });

    // Hora: al cambiar
    $('#in_hora').on('change', function () {
        const error = REGLAS.hora($(this).val());
        if (error) mostrarError('in_hora', error);
        else       mostrarExito('in_hora');

        // Revalidar fecha porque depende de la hora (no puede ser pasado)
        const esEdicion = form.action.includes('editar');
        const errorFecha = REGLAS.fecha($('#in_fecha').val(), $(this).val(), esEdicion);
        if (errorFecha) mostrarError('in_fecha', errorFecha);
        else if ($('#in_fecha').val()) mostrarExito('in_fecha');
    });

    // Categoría: al cambiar
    $('#in_categoria').on('change', function () {
        const error = REGLAS.categoria($(this).val());
        if (error) mostrarError('in_categoria', error);
        else       mostrarExito('in_categoria');
    });

    // Descripción: al escribir
    $('#in_descripcion').on('input', function () {
        const error = REGLAS.descripcion($(this).val());
        if (error) mostrarError('in_descripcion', error);
        else       limpiarEstado('in_descripcion');   // descripción es opcional → sin verde

        // Contador de caracteres
        const len    = ($(this).val() || '').trim().length;
        let $contador = $('#contador-descripcion');
        if (!$contador.length) {
            $contador = $('<span id="contador-descripcion" class="campo-contador"></span>');
            $(this).parent().append($contador);
        }
        $contador
            .text(len + '/1000')
            .toggleClass('contador-alerta', len > 950);
    });


    function renderEstadoBadge(estado) {
        const cfg = estadoConfig[estado] || estadoConfig.pendiente;
        $('#detalle-estado-badge')
            .html(`<i class="${cfg.icon}"></i> ${cfg.label}`)
            .css({
                background: 'rgba(0,0,0,0.25)',
                border:     `1px solid ${cfg.color}55`,
                color:      cfg.color,
            });
    }

    function marcarBotonActivo(estadoActual) {
        $('.btn-estado-opcion').each(function () {
            const es = $(this).data('estado');
            $(this).css({
                opacity:    es === estadoActual ? '1' : '0.45',
                boxShadow:  es === estadoActual ? `0 0 0 2px ${estadoConfig[es].color}88` : 'none',
            });
        });
    }


    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie) {
            document.cookie.split(';').forEach(cookie => {
                const c = cookie.trim();
                if (c.startsWith(name + '='))
                    cookieValue = decodeURIComponent(c.slice(name.length + 1));
            });
        }
        return cookieValue;
    }


    const tabla = $('#tablaEventos').DataTable({
        ajax: EVENTOS_DATA_URL,
        columns: [
            { data: 'titulo' },
            {
                data: 'categoria',
                render: (data, type, row) =>
                    `<span style="color:${row.categoria_color};">&#11044;</span> ${data}`
            },
            { data: 'fecha_display' },
            { data: 'hora' },
            {
                data: 'descripcion',
                render: data => data && data.length > 50 ? data.substr(0, 50) + '…' : (data || '')
            },
            {
                data: 'id',
                render: (data, type, row) => {
                    const est    = estadoConfig[row.estado] || estadoConfig.pendiente;
                    const badge  = `
                        <span style="display:inline-flex;align-items:center;gap:5px;
                            font-size:0.7rem;font-weight:700;text-transform:uppercase;
                            letter-spacing:0.04em;padding:3px 10px;border-radius:20px;
                            color:${est.color};background:${est.color}18;
                            border:1px solid ${est.color}44;margin-right:6px;">
                            <i class="${est.icon}" style="font-size:0.65rem;"></i> ${est.label}
                        </span>`;
                    return `
                        <div class="acciones-tabla">
                            ${badge}
                            <button class="btn-accion btn-ver"     title="Ver detalles" onclick="verEvento(${data})">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button class="btn-accion btn-editar"  title="Editar"       onclick="editarEvento(${data})">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-accion btn-eliminar" title="Eliminar"    onclick="eliminarEvento(${data})">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>`;
                }
            }
        ],
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json' },
        order: [[2, 'desc']]
    });

    /* Mover el buscador de DataTables al contenedor personalizado */
    function moverBuscador() {
        const $searchInput = $('.dataTables_filter input');
        if ($searchInput.length && !$searchInput.parents('.search-datatable-container').length) {
            $searchInput.detach().appendTo('.search-datatable-container').addClass('filtro-control');
        }
    }
    moverBuscador();
    $('.dataTables_filter').hide();

    /* Clases de fila por categoría y estado */
    function aplicarClasesCategoria() {
        $('#tablaEventos tbody tr').each(function () {
            const $row     = $(this);
            const catText  = $row.find('td:nth-child(2)')
                .clone().find('span').remove().end().text().trim().toLowerCase();
            const badges   = {
                'pedido': 'cat-pedido-row', 'compra': 'cat-compra-row',
                'pago': 'cat-pago-row', 'mantenimiento': 'cat-mantenimiento-row',
                'reuni': 'cat-reunion-row', 'entrega': 'cat-entrega-row',
                'capacitaci': 'cat-capacitacion-row'
            };

            $row.removeClass(Object.values(badges).join(' ') + ' evento-completado evento-cancelado');
            for (const [clave, clase] of Object.entries(badges)) {
                if (catText.includes(clave)) { $row.addClass(clase); break; }
            }

            const badgeTexto = $row.find('.acciones-tabla span').text().trim().toLowerCase();
            if      (badgeTexto.includes('completado')) $row.addClass('evento-completado');
            else if (badgeTexto.includes('cancelado'))  $row.addClass('evento-cancelado');
        });
    }

    tabla.on('draw', function () {
        moverBuscador();
        aplicarClasesCategoria();
        actualizarContador();
    });
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
        const desde = $('#filtro-fecha-desde').val();
        const hasta = $('#filtro-fecha-hasta').val();
        if (!desde && !hasta) return true;
        const fecha = tabla.row(dataIndex).data().fecha;
        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;
        return true;
    });

    /* Validar que "desde" no sea mayor que "hasta" */
    $('#filtro-fecha-desde, #filtro-fecha-hasta').on('change', function () {
        const desde = $('#filtro-fecha-desde').val();
        const hasta = $('#filtro-fecha-hasta').val();
        if (desde && hasta && desde > hasta) {
            Alerta.rangoFechaInvalido();
            $(this).val('');
            return;
        }
        tabla.draw();
        actualizarEstiloFiltros();
    });

    $('#filtro-estado, #filtro-categoria').on('change', function () {
        tabla.draw();
        actualizarEstiloFiltros();
    });

    $('#filtro-orden').on('change', function () {
        tabla.order([2, $(this).val()]).draw();
        actualizarEstiloFiltros();
    });

    $('#btn-limpiar-filtros').on('click', function () {
        $('#filtro-estado, #filtro-categoria, #filtro-fecha-desde, #filtro-fecha-hasta').val('');
        $('#filtro-orden').val('desc');
        $('.dataTables_filter input').val('').trigger('keyup');
        tabla.order([2, 'desc']).draw();
        actualizarEstiloFiltros();
    });

    function actualizarContador() {
        const info     = tabla.page.info();
        const total    = info.recordsTotal;
        const filtrado = info.recordsDisplay;
        const $cont    = $('#filtros-resultado');
        $cont.html(
            filtrado === total
                ? `Mostrando ${total} actividad${total !== 1 ? 'es' : ''}`
                : `Mostrando <strong>${filtrado}</strong> de ${total} actividad${total !== 1 ? 'es' : ''}`
        );
    }

    function actualizarEstiloFiltros() {
        ['#filtro-estado', '#filtro-categoria', '#filtro-fecha-desde', '#filtro-fecha-hasta', '#filtro-orden']
            .forEach(id => {
                const $el     = $(id);
                const default_ = id === '#filtro-orden' ? $el.val() === 'desc' : $el.val() === '';
                $el.toggleClass('filtro-activo', !default_);
            });
    }


    $('#btn-nueva-actividad').on('click', function () {
        form.reset();
        limpiarTodosLosErrores();
        $('#contador-titulo, #contador-descripcion').remove();
        if (eventoIdInput) eventoIdInput.value = '';
        tituloModal.innerText = 'Agregar Nueva Actividad';
        form.action = CREAR_EVENTO_URL;

        // Solo en creación: bloquear fechas pasadas
        $('#in_fecha').attr('min', new Date().toISOString().slice(0, 10));

        modal.addClass('mostrar');
        setTimeout(() => $('#in_titulo').focus(), 150);
    });


    form.onsubmit = function (e) {
        e.preventDefault();

        if (!validarFormulario()) return;

        const $btnGuardar  = $(form).find('.btn-guardar');
        const formData     = new FormData(form);
        const esEdicion    = form.action.includes('editar');
        const tituloEvento = formData.get('titulo').trim();
        const actionUrl    = form.action.endsWith('/') ? form.action : form.action + '/';

        // Estado de carga en el botón
        $btnGuardar.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Guardando…');

        fetch(actionUrl, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(res => {
            if (!res.ok) return res.json().then(d => Promise.reject(d));
            return res.json();
        })
        .then(data => {
            if (data.status === 'error') {
                // El backend rechazó (duplicado, categoría inactiva, etc.)
                Alerta.advertencia('No se pudo guardar', data.message);
                return;
            }
            modal.removeClass('mostrar');
            form.reset();
            limpiarTodosLosErrores();
            $('#contador-titulo, #contador-descripcion').remove();
            tabla.ajax.reload(null, false);
            Alerta.exito(esEdicion ? '¡Actualizado!' : '¡Guardado!', `La actividad "${tituloEvento}" fue ${esEdicion ? 'actualizada' : 'creada'} con éxito.`);
        })
        .catch(err => {
            console.error('Error al guardar evento:', err);
            const msg = err && err.message ? err.message : 'No se pudieron guardar los cambios. Intente de nuevo.';
            Alerta.error('Error del servidor', msg);
        })
        .finally(() => {
            $btnGuardar.prop('disabled', false).html('<i class="fa-solid fa-floppy-disk"></i> Guardar');
        });
    };


    window.verEvento = function (id) {
        fetch(OBTENER_EVENTO_BASE + id + '/')
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener evento');
                return res.json();
            })
            .then(data => {
                eventoDetalleId = data.id;
                $('#detalle-titulo').text(data.titulo);
                $('#detalle-fecha').text(data.fecha_display);
                $('#detalle-hora').text(data.hora);
                $('#detalle-descripcion').text(data.descripcion || '—');
                $('#detalle-badge-cat')
                    .text(data.categoria_nombre)
                    .css({ color: data.categoria_color, borderColor: data.categoria_color + '55' });

                renderEstadoBadge(data.estado);
                marcarBotonActivo(data.estado);
                modalDetalle.addClass('mostrar');
            })
            .catch(() => {
                Alerta.error('Error de conexión', 'No se pudo cargar la información del evento.');
            });
    };

    $(document).on('click', '.btn-estado-opcion', function () {
        if (!eventoDetalleId) return;

        const nuevoEstado = $(this).data('estado');
        const $btn        = $(this);

        $btn.prop('disabled', true);

        const fd = new FormData();
        fd.append('estado', nuevoEstado);

        fetch(CAMBIAR_ESTADO_BASE + eventoDetalleId + '/', {
            method: 'POST',
            body: fd,
            headers: { 'X-CSRFToken': getCookie('csrftoken'), 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'error') {
                Alerta.advertencia('No permitido', data.message);
                return;
            }
            renderEstadoBadge(data.estado);
            marcarBotonActivo(data.estado);
            tabla.ajax.reload(null, false);
        })
        .catch(() => {
            Alerta.error('Error de conexión', 'No se pudo cambiar el estado del evento.');
        })
        .finally(() => $btn.prop('disabled', false));
    });


    window.editarEvento = function (id) {
        fetch(OBTENER_EVENTO_BASE + id + '/')
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener evento');
                return res.json();
            })
            .then(data => {
                // En edición: quitar min para no bloquear fechas pasadas existentes
                $('#in_fecha').removeAttr('min');

                form.titulo.value      = data.titulo;
                form.fecha.value       = data.fecha;
                form.hora.value        = data.hora;
                form.categoria.value   = data.categoria;
                form.descripcion.value = data.descripcion || '';
                if (eventoIdInput) eventoIdInput.value = data.id;

                // Forzar contadores
                $('#in_titulo').trigger('input');
                if (data.descripcion) $('#in_descripcion').trigger('input');

                limpiarTodosLosErrores();
                tituloModal.innerText = 'Editar Actividad';
                form.action = EDITAR_EVENTO_BASE + id + '/';
                modal.addClass('mostrar');
                setTimeout(() => $('#in_titulo').focus(), 150);
            })
            .catch(() => {
                Alerta.error('Error de conexión', 'No se pudo cargar la información del evento.');
            });
    };


    window.eliminarEvento = function (id) {
        fetch(OBTENER_EVENTO_BASE + id + '/')
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener evento');
                return res.json();
            })
            .then(data => {
                Alerta.confirmarEliminar(data.titulo).then(result => {
                    if (!result.isConfirmed) return;

                    fetch(ELIMINAR_EVENTO_BASE + id + '/', {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'),
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    })
                    .then(res => res.json())
                    .then(resp => {
                        if (resp.status === 'error') {
                            Alerta.error('No permitido', resp.message);
                            return;
                        }
                        Alerta.exito('¡Eliminado!', `La actividad "${data.titulo}" fue borrada.`);
                        tabla.ajax.reload();
                    })
                    .catch(() => {
                        Alerta.error('Error de conexión', 'No se pudo eliminar la actividad.');
                    });
                });
            })
            .catch(() => {
                Alerta.error('Error de conexión', 'No se pudo obtener la información del evento.');
            });
    };


    $('#btn-cerrar-modal-evento, #btn-cancelar-evento').on('click', function () {
        modal.removeClass('mostrar');
        limpiarTodosLosErrores();
        $('#contador-titulo, #contador-descripcion').remove();
    });

    $('#btn-cerrar-detalle, #btn-cancelar-detalle').on('click', function () {
        modalDetalle.removeClass('mostrar');
        eventoDetalleId = null;
    });

    // Cerrar al hacer clic en el fondo oscuro
    $(window).on('click', function (e) {
        if ($(e.target).is(modal)) {
            modal.removeClass('mostrar');
            limpiarTodosLosErrores();
            $('#contador-titulo, #contador-descripcion').remove();
        }
        if ($(e.target).is(modalDetalle)) {
            modalDetalle.removeClass('mostrar');
            eventoDetalleId = null;
        }
    });

    // Cerrar con tecla ESC
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            if (modal.hasClass('mostrar')) {
                modal.removeClass('mostrar');
                limpiarTodosLosErrores();
                $('#contador-titulo, #contador-descripcion').remove();
            }
            if (modalDetalle.hasClass('mostrar')) {
                modalDetalle.removeClass('mostrar');
                eventoDetalleId = null;
            }
        }
    });

});