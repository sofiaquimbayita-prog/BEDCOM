$(document).ready(function () {

    // ========== ELEMENTOS DEL MODAL CREAR/EDITAR ==========
    const modal         = $('#modal-evento');
    const form          = document.getElementById('form-evento');
    const tituloModal   = document.getElementById('modal-titulo-evento');
    const eventoIdInput = document.getElementById('evento-id');

    // ========== ELEMENTOS DEL MODAL DETALLE ==========
    const modalDetalle  = $('#modal-detalle-evento');
    let   eventoDetalleId = null;   // ID del evento que está abierto en el detalle

    // ========== CONFIG SWEETALERT2 ==========
    const swalConfig = {
        background: '#1b2537',
        color: '#e9eef7',
        confirmButtonColor: '#5cc8ff',
        cancelButtonColor: '#4ea3a5'
    };

    // ========== HELPERS DE ESTADO ==========
    const estadoConfig = {
        pendiente:  { label: 'Pendiente',  color: '#f1c40f', icon: 'fa-regular fa-clock'       },
        completado: { label: 'Completado', color: '#2ecc71', icon: 'fa-solid fa-circle-check'  },
        cancelado:  { label: 'Cancelado',  color: '#e74c3c', icon: 'fa-solid fa-ban'            },
    };

    function renderEstadoBadge(estado) {
        const cfg = estadoConfig[estado] || estadoConfig.pendiente;
        const $badge = $('#detalle-estado-badge');
        $badge.html(`<i class="${cfg.icon}"></i> ${cfg.label}`);
        $badge.css({
            'background': `rgba(0,0,0,0.25)`,
            'border':     `1px solid ${cfg.color}55`,
            'color':      cfg.color,
        });
    }

    function marcarBotonActivo(estadoActual) {
        // Resalta el botón del estado activo con mayor opacidad
        $('.btn-estado-opcion').each(function () {
            const es = $(this).data('estado');
            if (es === estadoActual) {
                $(this).css('opacity', '1').css('box-shadow', `0 0 0 2px ${estadoConfig[es].color}88`);
            } else {
                $(this).css('opacity', '0.45').css('box-shadow', 'none');
            }
        });
    }

    // ========== DATATABLE ==========
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
                    // Badge de estado con color según valor
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
                            color:${est.color};
                            background:${est.color}18;
                            border:1px solid ${est.color}44;
                            margin-right:6px;">
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

    // ========== CLASES DE CATEGORÍA EN FILAS ==========
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

            if      (categoriaText.includes('pedido'))                                       $row.addClass('cat-pedido-row');
            else if (categoriaText.includes('compra'))                                       $row.addClass('cat-compra-row');
            else if (categoriaText.includes('pago'))                                         $row.addClass('cat-pago-row');
            else if (categoriaText.includes('mantenimiento'))                                $row.addClass('cat-mantenimiento-row');
            else if (categoriaText.includes('reunion') || categoriaText.includes('reunión')) $row.addClass('cat-reunion-row');
            else if (categoriaText.includes('entrega'))                                      $row.addClass('cat-entrega-row');
            else if (categoriaText.includes('capacitacion') || categoriaText.includes('capacitación')) $row.addClass('cat-capacitacion-row');

            // Opacidad según estado: completado/cancelado se ven "terminados"
            const badgeTexto = $row.find('.acciones-tabla span').text().trim().toLowerCase();
            if      (badgeTexto.includes('completado')) $row.addClass('evento-completado');
            else if (badgeTexto.includes('cancelado'))  $row.addClass('evento-cancelado');
        });
    }

    tabla.on('draw', aplicarClasesCategoria);
    aplicarClasesCategoria();

    // ========== ABRIR MODAL CREAR ==========
    $('#btn-nueva-actividad').click(function () {
        form.reset();
        if (eventoIdInput) eventoIdInput.value = '';
        tituloModal.innerText = 'Agregar Nueva Actividad';
        form.action = CREAR_EVENTO_URL;
        modal.addClass('mostrar');
    });

    // ========== VER EVENTO (NUEVO) ==========
    window.verEvento = function (id) {
        const url = OBTENER_EVENTO_BASE + id + '/';
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener evento');
                return res.json();
            })
            .then(data => {
                eventoDetalleId = data.id;

                // Rellenar campos de solo lectura
                $('#detalle-titulo').text(data.titulo);
                $('#detalle-fecha').text(data.fecha_display);
                $('#detalle-hora').text(data.hora);
                $('#detalle-descripcion').text(data.descripcion || '—');

                // Badge de categoría con color dinámico
                $('#detalle-badge-cat')
                    .text(data.categoria_nombre)
                    .css({
                        'color':         data.categoria_color,
                        'border-color':  data.categoria_color + '55',
                    });

                // Estado
                renderEstadoBadge(data.estado);
                marcarBotonActivo(data.estado);

                modalDetalle.addClass('mostrar');
            })
            .catch(() => {
                Swal.fire({
                    ...swalConfig,
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar la información del evento.'
                });
            });
    };

    // ========== CSRF desde cookie (no depende de ningún form en el DOM) ==========
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

    // ========== CAMBIAR ESTADO ==========
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
            headers: {
                'X-CSRFToken': csrftoken,
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al cambiar estado');
            return res.json();
        })
        .then(data => {
            renderEstadoBadge(data.estado);
            marcarBotonActivo(data.estado);
            tabla.ajax.reload(null, false);
        })
        .catch(() => {
            Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cambiar el estado del evento.'
            });
        });
    });


    // ========== EDITAR EVENTO ==========
    window.editarEvento = function (id) {
        const url = OBTENER_EVENTO_BASE + id + '/';
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener evento');
                return res.json();
            })
            .then(data => {
                form.titulo.value       = data.titulo;
                form.fecha.value        = data.fecha;
                form.hora.value         = data.hora;
                form.categoria.value    = data.categoria;
                form.descripcion.value  = data.descripcion || '';
                if (eventoIdInput) eventoIdInput.value = data.id;

                tituloModal.innerText = 'Editar Actividad';
                form.action = EDITAR_EVENTO_BASE + id + '/';
                modal.addClass('mostrar');
            })
            .catch(() => {
                Swal.fire({
                    ...swalConfig,
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar la información del evento.'
                });
            });
    };

    // ========== ENVÍO DEL FORMULARIO CREAR/EDITAR ==========
    form.onsubmit = function (e) {
        e.preventDefault();
        const formData     = new FormData(form);
        const esEdicion    = form.action.includes('editar');
        const tituloEvento = formData.get('titulo');
        const actionUrl    = form.action.endsWith('/') ? form.action : form.action + '/';

        fetch(actionUrl, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(() => {
            modal.removeClass('mostrar');
            form.reset();
            tabla.ajax.reload(null, false);
            Swal.fire({
                ...swalConfig,
                icon: 'success',
                title: esEdicion ? '¡Actualizado!' : '¡Guardado!',
                text: `La actividad "${tituloEvento}" ha sido ${esEdicion ? 'actualizada' : 'creada'} con éxito.`,
                timer: 2000,
                showConfirmButton: false
            });
        })
        .catch((err) => {
            console.error('Error al guardar evento:', err);
            Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron guardar los cambios. Intente de nuevo.'
            });
        });
    };

    // ========== ELIMINAR EVENTO ==========
    window.eliminarEvento = function (id) {
        const obtenerUrl = OBTENER_EVENTO_BASE + id + '/';
        fetch(obtenerUrl)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener evento');
                return res.json();
            })
            .then(data => {
                Swal.fire({
                    background: '#1b2537',
                    color: '#e9eef7',
                    title: `¿Eliminar la actividad "${data.titulo}"?`,
                    text: 'Esta acción no se puede deshacer.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#4ea3a5',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const csrftoken  = getCookie('csrftoken');
                        const eliminarUrl = ELIMINAR_EVENTO_BASE + id + '/';
                        fetch(eliminarUrl, {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken,
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        })
                        .then(response => {
                            if (response.ok) {
                                Swal.fire({
                                    ...swalConfig,
                                    icon: 'success',
                                    title: '¡Eliminado!',
                                    text: `La actividad "${data.titulo}" ha sido borrada.`,
                                    timer: 2000,
                                    showConfirmButton: false
                                });
                                tabla.ajax.reload();
                            } else {
                                throw new Error('Error al eliminar');
                            }
                        })
                        .catch(() => {
                            Swal.fire({
                                ...swalConfig,
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar la actividad.'
                            });
                        });
                    }
                });
            })
            .catch(() => {
                Swal.fire({
                    ...swalConfig,
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo obtener la información del evento.'
                });
            });
    };

    // ========== CERRAR MODALES ==========
    $('#btn-cerrar-modal-evento, #btn-cancelar-evento').click(function () {
        modal.removeClass('mostrar');
    });

    $('#btn-cerrar-detalle, #btn-cancelar-detalle').click(function () {
        modalDetalle.removeClass('mostrar');
        eventoDetalleId = null;
    });

    $(window).click(function (e) {
        if ($(e.target).is(modal))        modal.removeClass('mostrar');
        if ($(e.target).is(modalDetalle)) { modalDetalle.removeClass('mostrar'); eventoDetalleId = null; }
    });

});