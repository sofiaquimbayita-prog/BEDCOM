// Script para la gestión de BOM (Bill of Materials)

// ===================== CSRF =====================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ===================== VARIABLES =====================
let recetaInsumos = [];
let editRecetaInsumos = [];

// ===================== INIT =====================
$(document).ready(function () {

    //  GLOBAL MODAL CLOSE FUNCTION (BOM modals use .modal + display:none)
    window.cerrarModal = function (id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
        }
    };

    //  EVITA DUPLICAR EVENTOS
    $('#formReceta').off('submit').on('submit', function (e) {
        e.preventDefault();

        const productoId = $('#recetaProducto').val();

        if (!productoId) {
            mostrarMensaje('error', 'Debe seleccionar un producto');
            return;
        }

        if (recetaInsumos.length === 0) {
            mostrarMensaje('error', 'Debe agregar al menos un insumo');
            return;
        }

        $.ajax({
            url: '/vistas/bom/crear-receta/',
            type: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            data: JSON.stringify({
                producto_id: productoId,
                insumos: recetaInsumos
            }),
            success: function (res) {
                if (res.success) {
                    cerrarModal('modalReceta');
                    mostrarMensaje('success', res.message);
                    setTimeout(() => location.reload(), 2500);
                } else {
                    mostrarMensaje('error', res.error || 'Error al guardar el ensamblaje');
                }
            },
            error: function () {
                mostrarMensaje('error', 'Error de conexión al guardar el ensamblaje');
            }
        });
    });

    $('#formEditBom').off('submit').on('submit', function (e) {
        e.preventDefault();

        const productoId = $('#editProductoId').val();

        if (editRecetaInsumos.length === 0) {
            mostrarMensaje('error', 'Debe agregar al menos un insumo');
            return;
        }

        $.ajax({
            url: '/vistas/bom/editar-receta/',
            type: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            data: JSON.stringify({
                producto_id: productoId,
                insumos: editRecetaInsumos
            }),
            success: function (res) {
                if (res.success) {
                    cerrarModal('modalEditBom');
                    mostrarMensaje('success', res.message);
                    setTimeout(() => location.reload(), 2500);
                } else {
                    mostrarMensaje('error', res.error || 'Error al actualizar el ensamblaje');
                }
            },
            error: function () {
                mostrarMensaje('error', 'Error de conexión al actualizar el ensamblaje');
            }
        });
    });

    // ===================== DATATABLE =====================
    var bomTable = $('#tablaBom').DataTable({
        data: [],
        responsive: true,
        language: {
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "Ningún dato disponible en esta tabla",
            "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            }
        },
        "pageLength": 10,
        "order": [[0, "asc"]],
        columns: [
            { title: "Producto" },
            { title: "Insumos" },
            { title: "Acciones", orderable: false }
        ]
    });

    cargarTablaBom();

});

// ===================== DATATABLE LOAD =====================
function cargarTablaBom() {
    var table = $('#tablaBom').DataTable();
    table.clear();

    $.ajax({
        url: '/vistas/bom/data-json/',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (!response.success) {
                mostrarMensaje('error', 'Error al cargar los datos');
                table.draw();
                return;
            }
            response.ensamblajes.forEach(function (item) {
                var insumosSummary = '';
                if (item.insumos.length === 0) {
                    insumosSummary = '<span style="color: var(--color-texto-muted)">Sin insumos</span>';
                } else if (item.insumos.length === 1) {
                    var i = item.insumos[0];
                    insumosSummary = '<span class="insumo-badge"><i class="fas fa-tools"></i> ' +
                        i.insumo_nombre + ' (' + i.cantidad + ' ' + i.unidad_medida + ')</span>';
                } else {
                    var first = item.insumos[0];
                    insumosSummary = '<span class="insumo-badge"><i class="fas fa-tools"></i> ' +
                        first.insumo_nombre + ' (+' + (item.insumos.length - 1) + ' m&aacute;s)</span>';
                }

                var fila = [
                    '<span class="producto-badge"><i class="fas fa-box"></i> ' + item.producto_nombre + '</span>',
                    insumosSummary,
                    generarBotonesBom(item)
                ];
                table.row.add(fila);
            });
            table.draw();
        },
        error: function () {
            mostrarMensaje('error', 'Error de conexión al cargar los datos');
            table.draw();
        }
    });
}

function generarBotonesBom(item) {
    var nombre = item.producto_nombre.replace(/'/g, "\\'");
    return '<div class="acciones">' +
        '<button class="view-btn" title="Ver Detalles" onclick="verDetalleReceta(' + item.id + ', \'' + nombre + '\')">' +
            '<i class="fas fa-eye"></i>' +
        '</button>' +
        '<button class="edit-btn" title="Editar" onclick="editarBom(' + item.id + ')">' +
            '<i class="fas fa-edit"></i>' +
        '</button>' +
        '<button class="delete-btn" title="Eliminar" onclick="eliminarRecetaCompleta(' + item.id + ', \'' + nombre + '\')">' +
            '<i class="fas fa-trash"></i>' +
        '</button>' +
    '</div>';
}

// ===================== MODAL =====================
function abrirModal(id) {

    if (id === 'modalReceta') {

        recetaInsumos = [];

        $('#recetaCantidad').val(1);

        //  LIMPIAR TABLA
        $('#recetaInsumosBody').html(`
            <tr id="recetaVacio">
                <td colspan="4">No hay insumos</td>
            </tr>
        `);

        //  FIX: Romper la cadena jQuery para que Select2 se inicialice sobre $select, no sobre el container eliminado
        //  GUARD: Solo usar Select2 si la librería está cargada
        $('#recetaProducto, #recetaInsumo').each(function () {
            const $select = $(this);
            if ($.fn.select2) {
                if ($select.hasClass('select2-hidden-accessible')) {
                    $select.select2('destroy');
                }
                $select.removeClass('select2-hidden-accessible select2-offscreen');
                $select.next('.select2-container').remove();
                $select.val('').select2({
                    width: '100%',
                    dropdownParent: $('#modalReceta'),
                    placeholder: 'Seleccione...'
                });
            } else {
                $select.val('');
            }
        });
    }

    document.getElementById(id).style.display = 'flex';
}

// ===================== AGREGAR INSUMO (CREAR) =====================
function agregarInsumoReceta() {

    const insumoId = $('#recetaInsumo').val();
    const cantidad = parseInt($('#recetaCantidad').val());
    const unidad = $('#recetaUnidad').val();
    const insumoNombre = $('#recetaInsumo option:selected').text();

    if (!insumoId || cantidad < 1) {
        mostrarMensaje('error', 'Datos inválidos');
        return;
    }

    //  EVITAR DUPLICADOS
    if (recetaInsumos.some(i => i.insumo_id == insumoId)) {
        mostrarMensaje('error', 'Este insumo ya fue agregado');
        return;
    }

    recetaInsumos.push({
        insumo_id: insumoId,
        insumo_nombre: insumoNombre,
        cantidad: cantidad,
        unidad_medida: unidad
    });

    renderRecetaTable();
}

// ===================== AGREGAR INSUMO (EDITAR) =====================
//  FIX: Función que faltaba completamente
function agregarInsumoEditReceta() {

    const insumoId = $('#editRecetaInsumo').val();
    const cantidad = parseInt($('#editRecetaCantidad').val());
    const unidad = $('#editRecetaUnidad').val();
    const insumoNombre = $('#editRecetaInsumo option:selected').text();

    if (!insumoId || cantidad < 1) {
        mostrarMensaje('error', 'Datos inválidos');
        return;
    }

    //  EVITAR DUPLICADOS
    if (editRecetaInsumos.some(i => i.insumo_id == insumoId)) {
        mostrarMensaje('error', 'Este insumo ya fue agregado');
        return;
    }

    editRecetaInsumos.push({
        insumo_id: insumoId,
        insumo_nombre: insumoNombre,
        cantidad: cantidad,
        unidad_medida: unidad
    });

    renderEditRecetaTable();
}

// ===================== RENDER TABLA CREAR =====================
function renderRecetaTable() {

    const tbody = document.getElementById('recetaInsumosBody');

    if (recetaInsumos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">Vacío</td></tr>`;
        return;
    }

    let html = '';

    recetaInsumos.forEach((item, i) => {
        html += `
        <tr>
            <td>${item.insumo_nombre}</td>
            <td>${item.cantidad}</td>
            <td>${item.unidad_medida}</td>
            <td>
                <button type="button" onclick="eliminarInsumoReceta(${i})">X</button>
            </td>
        </tr>`;
    });

    //  REEMPLAZA TODO (NO APPEND)
    tbody.innerHTML = html;
}

// ===================== RENDER TABLA EDITAR =====================
function renderEditRecetaTable() {

    const tbody = document.getElementById('editRecetaInsumosBody');

    if (editRecetaInsumos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">Vacío</td></tr>`;
        return;
    }

    let html = '';

    //  FIX: Usar insumo_nombre en lugar de insumo_id
    editRecetaInsumos.forEach((item, i) => {
        html += `
        <tr>
            <td>${item.insumo_nombre}</td>
            <td>${item.cantidad}</td>
            <td>${item.unidad_medida}</td>
            <td>
                <button type="button" onclick="eliminarInsumoEditReceta(${i})">X</button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

// ===================== ELIMINAR INSUMO (CREAR) =====================
function eliminarInsumoReceta(i) {
    recetaInsumos.splice(i, 1);
    renderRecetaTable();
}

// ===================== ELIMINAR INSUMO (EDITAR) =====================
function eliminarInsumoEditReceta(i) {
    editRecetaInsumos.splice(i, 1);
    renderEditRecetaTable();
}

// ===================== EDITAR BOM =====================
function editarBom(productoId) {

    editRecetaInsumos = [];

    $.get('/vistas/bom/por-producto/', { producto_id: productoId }, function (res) {

        if (res.success) {

            $('#editRecetaInsumosBody').html('');

            //  Los datos del backend ya incluyen insumo_nombre
            editRecetaInsumos = res.data;

            renderEditRecetaTable();

            $('#editProductoId').val(productoId);

            // Seleccionar el producto correcto en el select deshabilitado
            $('#editRecetaProducto').val(productoId);

            //  FIX: Romper la cadena jQuery — mismo patrón corregido que en abrirModal
            //  GUARD: Solo usar Select2 si la librería está cargada
            $('#editRecetaInsumo').each(function () {
                const $select = $(this);
                if ($.fn.select2) {
                    if ($select.hasClass('select2-hidden-accessible')) {
                        $select.select2('destroy');
                    }
                    $select.removeClass('select2-hidden-accessible select2-offscreen');
                    $select.next('.select2-container').remove();
                    $select.val('').select2({
                        width: '100%',
                        dropdownParent: $('#modalEditBom'),
                        placeholder: 'Seleccione...'
                    });
                } else {
                    $select.val('');
                }
            });

            document.getElementById('modalEditBom').style.display = 'flex';

        } else {
            mostrarMensaje('error', res.error || 'Error al cargar el ensamblaje');
        }
    }).fail(function () {
        mostrarMensaje('error', 'Error de conexión al cargar el ensamblaje');
    });
}

// ===================== VER DETALLE RECETA =====================
//  FIX: Función que faltaba completamente
function verDetalleReceta(productoId, productoNombre) {

    $('#verProductoNombre').text(productoNombre);
    $('#verProductoId').text(productoId);
    $('#verRecetaInsumosBody').html('<tr><td colspan="3" style="padding: 20px; text-align: center; color: #999;">Cargando...</td></tr>');
    $('#verTotalInsumos').text('0');

    document.getElementById('modalVerReceta').style.display = 'flex';

    $.get('/vistas/bom/por-producto/', { producto_id: productoId }, function (res) {

        if (res.success && res.data.length > 0) {

            let html = '';
            res.data.forEach(function (item) {
                html += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #334155;">${item.insumo_nombre}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #334155;">${item.cantidad}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #334155;">${item.unidad_medida}</td>
                </tr>`;
            });

            $('#verRecetaInsumosBody').html(html);
            $('#verTotalInsumos').text(res.data.length);

        } else {
            $('#verRecetaInsumosBody').html('<tr><td colspan="3" style="padding: 20px; text-align: center; color: #999;">No hay insumos registrados</td></tr>');
        }
    }).fail(function () {
        $('#verRecetaInsumosBody').html('<tr><td colspan="3" style="padding: 20px; text-align: center; color: #ef4444;">Error al cargar los datos</td></tr>');
    });
}

// ===================== ELIMINAR RECETA COMPLETA =====================
//  FIX: Función que faltaba completamente
function eliminarRecetaCompleta(productoId, productoNombre) {

    $('#deleteProducto').text(productoNombre);
    $('#deleteId').val(productoId);

    // Limpiar insumo previo si el modal lo usaba para otra cosa
    $('#deleteInsumo').text('(todos los insumos del ensamblaje)');

    // Sobreescribir el submit del form para usar AJAX (elimina receta completa)
    $('#formDeleteBom').off('submit').on('submit', function (e) {
        e.preventDefault();

        $.ajax({
            url: '/vistas/bom/eliminar-receta/',
            type: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            data: { id: productoId },
            success: function (res) {
                if (res.success) {
                    cerrarModal('modalDeleteBom');
                    mostrarMensaje('success', res.message);
                    setTimeout(() => location.reload(), 2500);
                } else {
                    mostrarMensaje('error', res.error || 'Error al eliminar el ensamblaje');
                }
            },
            error: function () {
                mostrarMensaje('error', 'Error de conexión al eliminar el ensamblaje');
            }
        });
    });

    document.getElementById('modalDeleteBom').style.display = 'flex';
}
