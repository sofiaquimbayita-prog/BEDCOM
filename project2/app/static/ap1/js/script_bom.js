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
$(document).ready(function() {

    // 🔥 GLOBAL MODAL CLOSE FUNCTION (BOM modals use .modal + display:none)
    window.cerrarModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
        }
    };

    // 🔥 EVITA DUPLICAR EVENTOS
    $('#formReceta').off('submit').on('submit', function(e) {
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
            success: function(res) {
                if (res.success) {
                    cerrarModal('modalReceta');
                    mostrarMensaje('success', res.message);
                    setTimeout(() => location.reload(), 1000);
                }
            }
        });
    });

    $('#formEditBom').off('submit').on('submit', function(e) {
        e.preventDefault();

        const productoId = $('#editProductoId').val();

        $.ajax({
            url: '/vistas/bom/editar-receta/',
            type: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            data: JSON.stringify({
                producto_id: productoId,
                insumos: editRecetaInsumos
            }),
            success: function(res) {
                if (res.success) {
                    cerrarModal('modalEditBom');
                    mostrarMensaje('success', res.message);
                    setTimeout(() => location.reload(), 1000);
                }
            }
        });
    });

});

// ===================== MODAL =====================
function abrirModal(id) {

    if (id === 'modalReceta') {

        recetaInsumos = [];

        $('#recetaProducto').val('').trigger('change');
        $('#recetaInsumo').val('').trigger('change');

        $('#recetaCantidad').val(1);

        // 🔥 LIMPIAR TABLA
        $('#recetaInsumosBody').html(`
            <tr id="recetaVacio">
                <td colspan="4">No hay insumos</td>
            </tr>
        `);

        // 🔥 ROBUST SELECT2 RE-INIT (FIX DUPLICATES)
        $('#recetaProducto, #recetaInsumo').each(function() {
            const $select = $(this);
            if ($select.hasClass('select2-hidden-accessible')) {
                $select.select2('destroy');
            }
            // Force clean Select2 remnants
            $select.removeClass('select2-hidden-accessible select2-offscreen')
                   .next('.select2-container').remove()
                   .empty()
                   .select2({
                       width: '100%',
                       dropdownParent: $('#modalReceta'),
                       placeholder: 'Seleccione...'
                   });
        });
    }

    document.getElementById(id).style.display = 'flex';
}

// ===================== AGREGAR INSUMO =====================
function agregarInsumoReceta() {

    const insumoId = $('#recetaInsumo').val();
    const cantidad = parseInt($('#recetaCantidad').val());
    const unidad = $('#recetaUnidad').val();

    if (!insumoId || cantidad < 1) {
        mostrarMensaje('error', 'Datos inválidos');
        return;
    }

    // 🔥 EVITAR DUPLICADOS
    if (recetaInsumos.some(i => i.insumo_id == insumoId)) {
        mostrarMensaje('error', 'Ya existe');
        return;
    }

    recetaInsumos.push({
        insumo_id: insumoId,
        cantidad: cantidad,
        unidad_medida: unidad
    });

    renderRecetaTable();
}

// ===================== RENDER =====================
function renderRecetaTable() {

    const tbody = document.getElementById('recetaInsumosBody');

    if (recetaInsumos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">Vacío</td></tr>`;
        return;
    }

    const select = document.getElementById('recetaInsumo');
    let opciones = {};

    for (let o of select.options) {
        opciones[o.value] = o.text;
    }

    let html = '';

    recetaInsumos.forEach((item, i) => {
        html += `
        <tr>
            <td>${opciones[item.insumo_id]}</td>
            <td>${item.cantidad}</td>
            <td>${item.unidad_medida}</td>
            <td>
                <button onclick="eliminarInsumoReceta(${i})">X</button>
            </td>
        </tr>`;
    });

    // 🔥 REEMPLAZA TODO (NO APPEND)
    tbody.innerHTML = html;
}

// ===================== ELIMINAR =====================
function eliminarInsumoReceta(i) {
    recetaInsumos.splice(i, 1);
    renderRecetaTable();
}

// ===================== EDITAR =====================
function editarBom(productoId) {

    editRecetaInsumos = [];

    $.get('/vistas/bom/por-producto/', { producto_id: productoId }, function(res) {

        if (res.success) {

            // 🔥 LIMPIAR
            $('#editRecetaInsumosBody').html('');

            editRecetaInsumos = res.data;

            renderEditRecetaTable();

            $('#editProductoId').val(productoId);

            // 🔥 SELECT2 FOR EDIT MODAL
            $('#editRecetaProducto, #editRecetaInsumo').each(function() {
                const $select = $(this);
                if ($select.hasClass('select2-hidden-accessible')) {
                    $select.select2('destroy');
                }
                $select.removeClass('select2-hidden-accessible select2-offscreen')
                       .next('.select2-container').remove()
                       .empty()
                       .select2({
                           width: '100%',
                           dropdownParent: $('#modalEditBom'),
                           placeholder: 'Seleccione...'
                       });
            });

            abrirModal('modalEditBom');
        }
    });
}

function renderEditRecetaTable() {

    const tbody = document.getElementById('editRecetaInsumosBody');

    if (editRecetaInsumos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">Vacío</td></tr>`;
        return;
    }

    let html = '';

    editRecetaInsumos.forEach((item, i) => {
        html += `
        <tr>
            <td>${item.insumo_id}</td>
            <td>${item.cantidad}</td>
            <td>${item.unidad_medida}</td>
            <td>
                <button onclick="eliminarInsumoEditReceta(${i})">X</button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

function eliminarInsumoEditReceta(i) {
    editRecetaInsumos.splice(i, 1);
    renderEditRecetaTable();
}