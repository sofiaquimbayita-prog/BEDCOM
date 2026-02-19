$(document).ready(function () {

    const modal         = $('#modal-evento');
    const form          = document.getElementById('form-evento');
    const tituloModal   = document.getElementById('modal-titulo-evento');
    const eventoIdInput = document.getElementById('evento-id');

    const modalDetalle  = $('#modal-detalle-evento');
    let   eventoDetalleId = null;

    const swalConfig = {
        background: '#1b2537',
        color: '#e9eef7',
        confirmButtonColor: '#5cc8ff',
        cancelButtonColor: '#4ea3a5'
    };

    const estadoConfig = {
        pendiente:  { label: 'Pendiente',  color: '#f1c40f', icon: 'fa-regular fa-clock'       },
        completado: { label: 'Completado', color: '#2ecc71', icon: 'fa-solid fa-circle-check'  },
        cancelado:  { label: 'Cancelado',  color: '#e74c3c', icon: 'fa-solid fa-ban'            },
    };






    /**
     * Muestra un mensaje de error debajo de un campo y le añade clase de error.
     * @param {string} fieldId  – id del input/select/textarea
     * @param {string} mensaje  – texto a mostrar
     */
    function mostrarError(fieldId, mensaje) {
        const $field = $('#' + fieldId);
        $field.addClass('input-error');

        const $grupo = $field.closest('.form-grupo');
        $grupo.find('.msg-error').remove();
        $grupo.append('<span class="msg-error">' + mensaje + '</span>');
    }

    function limpiarError(fieldId) {
        const $field = $('#' + fieldId);
        $field.removeClass('input-error');
        $field.closest('.form-grupo').find('.msg-error').remove();
    }

    function limpiarTodosLosErrores() {
        ['in_titulo', 'in_fecha', 'in_hora', 'in_categoria', 'in_descripcion'].forEach(limpiarError);
    }


    function validarFormulario() {
        let valido = true;
        limpiarTodosLosErrores();

        const titulo      = $('#in_titulo').val().trim();
        const fecha       = $('#in_fecha').val().trim();
        const hora        = $('#in_hora').val().trim();
        const categoria   = $('#in_categoria').val();
        const descripcion = $('#in_descripcion').val().trim();
        const esEdicion   = form.action.includes('editar');

        if (!titulo) {
            mostrarError('in_titulo', 'El título es obligatorio.');
            valido = false;
        } else if (titulo.length < 3) {
            mostrarError('in_titulo', 'El título debe tener al menos 3 caracteres.');
            valido = false;
        } else if (titulo.length > 150) {
            mostrarError('in_titulo', 'El título no puede superar los 150 caracteres.');
            valido = false;
        } else if (/[<>{}\[\]\\]/.test(titulo)) {
            mostrarError('in_titulo', 'El título contiene caracteres no permitidos.');
            valido = false;
        }

        if (!fecha) {
            mostrarError('in_fecha', 'La fecha es obligatoria.');
            valido = false;
        } else {
            const hoy = new Date();
            hoy.setSeconds(0, 0);
            const fechaHoraEvento = new Date(fecha + 'T' + (hora || '00:00'));
            const limiteAnios     = new Date();
            limiteAnios.setFullYear(limiteAnios.getFullYear() + 5);

            if (fechaHoraEvento > limiteAnios) {
                mostrarError('in_fecha', 'La fecha no puede ser superior a 5 años en el futuro.');
                valido = false;
            }
        }

        if (!hora) {
            mostrarError('in_hora', 'La hora es obligatoria.');
            valido = false;
        }

        if (!categoria) {
            mostrarError('in_categoria', 'Debes seleccionar una categoría.');
            valido = false;
        }

        if (descripcion.length > 1000) {
            mostrarError('in_descripcion', 'Los detalles no pueden superar los 1000 caracteres (' + descripcion.length + '/1000).');
            valido = false;
        }

        return valido;
    }

    $('#in_titulo').on('input', function () {
        limpiarError('in_titulo');
        const len = $(this).val().trim().length;
        let $contador = $('#contador-titulo');
        if (!$contador.length) {
            $contador = $('<span id="contador-titulo" style="font-size:0.75rem;opacity:0.6;float:right;"></span>');
            $(this).parent().append($contador);
        }
        $contador.text(len + '/150').css('color', len > 140 ? '#e74c3c' : '');
    });

    $('#in_fecha, #in_hora').on('change', function () {
        limpiarError('in_fecha');
        limpiarError('in_hora');
    });

    $('#in_categoria').on('change', function () { limpiarError('in_categoria'); });

    $('#in_descripcion').on('input', function () {
        limpiarError('in_descripcion');
        const len = $(this).val().trim().length;
        let $contador = $('#contador-descripcion');
        if (!$contador.length) {
            $contador = $('<span id="contador-descripcion" style="font-size:0.75rem;opacity:0.6;float:right;"></span>');
            $(this).parent().append($contador);
        }
        $contador.text(len + '/1000').css('color', len > 950 ? '#e74c3c' : '');
    });



    function renderEstadoBadge(estado) {
        const cfg = estadoConfig[estado] || estadoConfig.pendiente;
        const $badge = $('#detalle-estado-badge');
        $badge.html(`<i class="${cfg.icon}"></i> ${cfg.label}`);
        $badge.css({
            'background': 'rgba(0,0,0,0.25)',
            'border':     `1px solid ${cfg.color}55`,
            'color':      cfg.color,
        });
    }

    function marcarBotonActivo(estadoActual) {
        $('.btn-estado-opcion').each(function () {
            const es = $(this).data('estado');
            if (es === estadoActual) {
                $(this).css('opacity', '1').css('box-shadow', `0 0 0 2px ${estadoConfig[es].color}88`);
            } else {
                $(this).css('opacity', '0.45').css('box-shadow', 'none');
            }
        });
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            document.cookie.split(';').forEach(function (cookie) {
                const c = cookie.trim();
                if (c.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(c.slice(name.length + 1));
                }
            });
        }
        return cookieValue;
    }

    const tabla = $('#tablaEventos').DataTable({
        ajax: EVENTOS_DATA_URL,
        columns: [
            { data: "titulo" },
            {
                data: "categoria",
                render: function (data, type, row) {
                    return `<span style="color:${row.categoria_color};">&#11044;</span> ${data}`;
                }
            },
            { data: "fecha_display" },
            { data: "hora" },
            {
                data: "descripcion",
                render: function (data) {
                    return data && data.length > 50 ? data.substr(0, 50) + '…' : (data || '');
                }
            },
            {
                data: "id",
                render: function (data, type, row) {
                    const estadoMap = {
                        pendiente:  { color: '#f1c40f', icon: 'fa-regular fa-clock',      label: 'Pendiente'  },
                        completado: { color: '#2ecc71', icon: 'fa-solid fa-circle-check', label: 'Completado' },
                        cancelado:  { color: '#e74c3c', icon: 'fa-solid fa-ban',          label: 'Cancelado'  },
                    };
                    const est = estadoMap[row.estado] || estadoMap.pendiente;
                    const badgeEstado = `
                        <span style="
                            display:inline-flex;align-items:center;gap:5px;
                            font-size:0.7rem;font-weight:700;text-transform:uppercase;
                            letter-spacing:0.04em;padding:3px 10px;border-radius:20px;
                            color:${est.color};background:${est.color}18;
                            border:1px solid ${est.color}44;margin-right:6px;">
                            <i class="${est.icon}" style="font-size:0.65rem;"></i> ${est.label}
                        </span>`;
                    return `
                        <div class="acciones-tabla">
                            ${badgeEstado}
                            <button class="btn-accion btn-ver" title="Ver detalles" onclick="verEvento(${data})">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button class="btn-accion btn-editar" title="Editar" onclick="editarEvento(${data})">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-accion btn-eliminar" title="Eliminar" onclick="eliminarEvento(${data})">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>`;
                }
            }
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json"
        },
        order: [[2, 'desc']]
    });
function moverBuscador() {
    var searchInput = $('.dataTables_filter input');
    if (searchInput.length) {
        if (searchInput.parents('.search-datatable-container').length === 0) {
            searchInput.detach().appendTo('.search-datatable-container');
            searchInput.addClass('filtro-control'); 
        }
    }
}
    moverBuscador();
    $('.dataTables_filter').hide();

    function aplicarClasesCategoria() {
        $('#tablaEventos tbody tr').each(function () {
            const $row = $(this);
            let categoriaText = $row.find('td:nth-child(2)')
                .clone().find('span').remove().end()
                .text().trim().toLowerCase();

            $row.removeClass(
                'cat-pedido-row cat-compra-row cat-pago-row ' +
                'cat-mantenimiento-row cat-reunion-row cat-entrega-row cat-capacitacion-row ' +
                'evento-completado evento-cancelado'
            );

            if      (categoriaText.includes('pedido'))                                              $row.addClass('cat-pedido-row');
            else if (categoriaText.includes('compra'))                                              $row.addClass('cat-compra-row');
            else if (categoriaText.includes('pago'))                                                $row.addClass('cat-pago-row');
            else if (categoriaText.includes('mantenimiento'))                                       $row.addClass('cat-mantenimiento-row');
            else if (categoriaText.includes('reunion') || categoriaText.includes('reunión'))        $row.addClass('cat-reunion-row');
            else if (categoriaText.includes('entrega'))                                             $row.addClass('cat-entrega-row');
            else if (categoriaText.includes('capacitacion') || categoriaText.includes('capacitación')) $row.addClass('cat-capacitacion-row');

            const badgeTexto = $row.find('.acciones-tabla span').text().trim().toLowerCase();
            if      (badgeTexto.includes('completado')) $row.addClass('evento-completado');
            else if (badgeTexto.includes('cancelado'))  $row.addClass('evento-cancelado');
        });
    }

    tabla.on('draw', function() {
        moverBuscador();
        aplicarClasesCategoria();
        actualizarContador();
        
    });
    aplicarClasesCategoria();


    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        const estadoFiltro = $('#filtro-estado').val();
        if (!estadoFiltro) return true;
        const rowData = tabla.row(dataIndex).data();
        return rowData.estado === estadoFiltro;
    });

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        const catFiltro = $('#filtro-categoria').val().toLowerCase();
        if (!catFiltro) return true;
        const rowData = tabla.row(dataIndex).data();
        return rowData.categoria.toLowerCase() === catFiltro;
    });

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        const desde = $('#filtro-fecha-desde').val();
        const hasta = $('#filtro-fecha-hasta').val();
        if (!desde && !hasta) return true;
        const rowData   = tabla.row(dataIndex).data();
        const fechaFila = rowData.fecha;
        if (desde && fechaFila < desde) return false;
        if (hasta && fechaFila > hasta) return false;
        return true;
    });

    $('#filtro-estado, #filtro-categoria, #filtro-fecha-desde, #filtro-fecha-hasta').on('change', function () {
        tabla.draw();
        actualizarEstiloFiltros();
    });

    $('#filtro-orden').on('change', function () {
        tabla.order([2, $(this).val()]).draw();
        actualizarEstiloFiltros();
    });



    $('#btn-limpiar-filtros').on('click', function () {
    $('#filtro-estado').val('');
    $('#filtro-categoria').val('');
    $('#filtro-fecha-desde').val('');
    $('#filtro-fecha-hasta').val('');
    $('#filtro-orden').val('desc');
    
    // Limpiar buscador
    $('.dataTables_filter input').val('').trigger('keyup');

    tabla.order([2, 'desc']).draw();
    actualizarEstiloFiltros();
});

    function actualizarContador() {
        const info     = tabla.page.info();
        const total    = info.recordsTotal;
        const filtrado = info.recordsDisplay;
        const $cont    = $('#filtros-resultado');
        if (filtrado === total) {
            $cont.text('Mostrando ' + total + ' actividad' + (total !== 1 ? 'es' : ''));
        } else {
            $cont.html('Mostrando <strong>' + filtrado + '</strong> de ' + total + ' actividad' + (total !== 1 ? 'es' : ''));
        }
    }

    function actualizarEstiloFiltros() {
        ['#filtro-estado', '#filtro-categoria', '#filtro-fecha-desde', '#filtro-fecha-hasta', '#filtro-orden'].forEach(function(id) {
            const $el = $(id);
            const esDefault = (id === '#filtro-orden') ? $el.val() === 'desc' : $el.val() === '';
            $el.toggleClass('filtro-activo', !esDefault);
        });
    }

    $('#btn-nueva-actividad').click(function () {
        form.reset();
        limpiarTodosLosErrores();
        $('#contador-titulo, #contador-descripcion').remove();
        if (eventoIdInput) eventoIdInput.value = '';
        tituloModal.innerText = 'Agregar Nueva Actividad';
        form.action = CREAR_EVENTO_URL;

        const hoy = new Date().toISOString().slice(0, 10);
        $('#in_fecha').attr('min', hoy);

        modal.addClass('mostrar');
    });

    window.verEvento = function (id) {
        const url = OBTENER_EVENTO_BASE + id + '/';
        fetch(url)
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
                    .css({ 'color': data.categoria_color, 'border-color': data.categoria_color + '55' });

                renderEstadoBadge(data.estado);
                marcarBotonActivo(data.estado);

                modalDetalle.addClass('mostrar');
            })
            .catch(() => {
                Swal.fire({ ...swalConfig, icon: 'error', title: 'Error', text: 'No se pudo cargar la información del evento.' });
            });
    };

    $(document).on('click', '.btn-estado-opcion', function () {
        if (!eventoDetalleId) return;

        const nuevoEstado = $(this).data('estado');
        const csrftoken   = getCookie('csrftoken');
        const url         = CAMBIAR_ESTADO_BASE + eventoDetalleId + '/';

        const formData = new FormData();
        formData.append('estado', nuevoEstado);

        fetch(url, {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRFToken': csrftoken, 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'error') {
                Swal.fire({ ...swalConfig, icon: 'warning', title: 'No permitido', text: data.message });
                return;
            }
            renderEstadoBadge(data.estado);
            marcarBotonActivo(data.estado);
            tabla.ajax.reload(null, false);
        })
        .catch(() => {
            Swal.fire({ ...swalConfig, icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado del evento.' });
        });
    });

    window.editarEvento = function (id) {
        const url = OBTENER_EVENTO_BASE + id + '/';
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener evento');
                return res.json();
            })
            .then(data => {
                $('#in_fecha').removeAttr('min');

                form.titulo.value      = data.titulo;
                form.fecha.value       = data.fecha;
                form.hora.value        = data.hora;
                form.categoria.value   = data.categoria;
                form.descripcion.value = data.descripcion || '';
                if (eventoIdInput) eventoIdInput.value = data.id;

                limpiarTodosLosErrores();
                tituloModal.innerText = 'Editar Actividad';
                form.action = EDITAR_EVENTO_BASE + id + '/';
                modal.addClass('mostrar');
            })
            .catch(() => {
                Swal.fire({ ...swalConfig, icon: 'error', title: 'Error', text: 'No se pudo cargar la información del evento.' });
            });
    };

    form.onsubmit = function (e) {
        e.preventDefault();

        if (!validarFormulario()) return;
        const formData     = new FormData(form);
        const esEdicion    = form.action.includes('editar');
        const tituloEvento = formData.get('titulo').trim();
        const actionUrl    = form.action.endsWith('/') ? form.action : form.action + '/';

        fetch(actionUrl, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                Swal.fire({ ...swalConfig, icon: 'warning', title: 'No se pudo guardar', text: data.message });
                return;
            }
            modal.removeClass('mostrar');
            form.reset();
            limpiarTodosLosErrores();
            tabla.ajax.reload(null, false);
            Swal.fire({
                ...swalConfig,
                icon: 'success',
                title: esEdicion ? '¡Actualizado!' : '¡Guardado!',
                text: `La actividad "${tituloEvento}" fue ${esEdicion ? 'actualizada' : 'creada'} con éxito.`,
                timer: 2000,
                showConfirmButton: false
            });
        })
        .catch((err) => {
            console.error('Error al guardar evento:', err);
            Swal.fire({ ...swalConfig, icon: 'error', title: 'Error', text: 'No se pudieron guardar los cambios. Intente de nuevo.' });
        });
    };


    window.eliminarEvento = function (id) {
        const obtenerUrl = OBTENER_EVENTO_BASE + id + '/';
        fetch(obtenerUrl)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener evento');
                return res.json();
            })
            .then(data => {
                const advertenciaExtra = 'Esta acción no se puede deshacer.';

                Swal.fire({
                    background: '#1b2537',
                    color: '#e9eef7',
                    title: `¿Eliminar "${data.titulo}"?`,
                    text: advertenciaExtra,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#4ea3a5',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const csrftoken   = getCookie('csrftoken');
                        const eliminarUrl = ELIMINAR_EVENTO_BASE + id + '/';
                        fetch(eliminarUrl, {
                            method: 'POST',
                            headers: { 'X-CSRFToken': csrftoken, 'X-Requested-With': 'XMLHttpRequest' }
                        })
                        .then(res => res.json())
                        .then(resp => {
                            if (resp.status === 'error') {
                                Swal.fire({ ...swalConfig, icon: 'error', title: 'No permitido', text: resp.message });
                                return;
                            }
                            Swal.fire({
                                ...swalConfig,
                                icon: 'success',
                                title: '¡Eliminado!',
                                text: `La actividad "${data.titulo}" fue borrada.`,
                                timer: 2000,
                                showConfirmButton: false
                            });
                            tabla.ajax.reload();
                        })
                        .catch(() => {
                            Swal.fire({ ...swalConfig, icon: 'error', title: 'Error', text: 'No se pudo eliminar la actividad.' });
                        });
                    }
                });
            })
            .catch(() => {
                Swal.fire({ ...swalConfig, icon: 'error', title: 'Error', text: 'No se pudo obtener la información del evento.' });
            });
    };


    $('#btn-cerrar-modal-evento, #btn-cancelar-evento').click(function () {
        modal.removeClass('mostrar');
        limpiarTodosLosErrores();
    });

    $('#btn-cerrar-detalle, #btn-cancelar-detalle').click(function () {
        modalDetalle.removeClass('mostrar');
        eventoDetalleId = null;
    });

    $(window).click(function (e) {
        if ($(e.target).is(modal)) {
            modal.removeClass('mostrar');
            limpiarTodosLosErrores();
        }
        if ($(e.target).is(modalDetalle)) {
            modalDetalle.removeClass('mostrar');
            eventoDetalleId = null;
        }
    });

});
