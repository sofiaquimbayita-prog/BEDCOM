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

<<<<<<< HEAD
// ===================== INIT =====================
=======
function inicializarSelect2Bom(selector, modalSelector, options = {}) {
    if (!window.jQuery) return;

    $(selector).each(function() {
        const $select = $(this);

        if ($.fn.select2 && $select.hasClass('select2-hidden-accessible')) {
            $select.select2('destroy');
        }

        $select.removeClass('select2-hidden-accessible select2-offscreen')
               .next('.select2-container').remove();

        if ($.fn.select2) {
            $select.select2({
                language: 'es',
                width: '100%',
                dropdownParent: $(modalSelector),
                ...options
            });
        }
    });
}

function asegurarSelect2Bom() {
    if (!window.jQuery || $.fn.select2) return;

    $.fn.select2 = function(action, value) {
        if (action === 'val' && arguments.length > 1) {
            return this.val(value);
        }

        return this;
    };
}

asegurarSelect2Bom();

document.addEventListener('click', function(e) {
    const button = e.target.closest('[data-modal-target]');
    if (!button) return;

    e.preventDefault();
    abrirModal(button.dataset.modalTarget);
});

>>>>>>> mejoras-estilos
$(document).ready(function() {

<<<<<<< HEAD
    // 🔥 GLOBAL MODAL CLOSE FUNCTION (BOM modals use .modal + display:none)
    window.cerrarModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
=======
    // Select2 para receta, solo si la libreria esta disponible.
    inicializarSelect2Bom('#recetaInsumo, #recetaProducto', '#modalReceta', { allowClear: true });

    // Select2 para edicion de receta, solo si la libreria esta disponible.
    inicializarSelect2Bom('#editRecetaInsumo, #editRecetaProducto', '#modalEditBom', { allowClear: true });

    // Manejar cambio de producto en el modal de crear receta
    $('#recetaProducto').on('change', function() {
        const productoId = $(this).val();
        
        if (productoId && productosConReceta.includes(parseInt(productoId))) {
            // El producto ya tiene una receta
            mostrarMensaje('warning', 'Este producto ya tiene una receta asociada. Use el botón de editarla.');
            $(this).val('').trigger('change');
            return;
>>>>>>> mejoras-estilos
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
<<<<<<< HEAD
=======

function crearProductoBOM() {
    const form = document.getElementById('formNuevoProducto');
    const formDataObj = Object.fromEntries(new FormData(form));
    
    // Enviar a BOM API con producto_data
    const data = {
        producto_data: formDataObj,
        insumos: recetaInsumos
    };
    
    fetch('/vistas/bom/crear-receta/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cerrarModalNuevoProducto();
            mostrarMensaje('success', data.message);
            
            // Limpiar y recargar
            recetaInsumos = [];
            setTimeout(() => location.reload(), 1500);
        } else {
            mostrarMensaje('error', data.error || data.message || 'Error al crear');
        }
    })
    .catch(err => {
        mostrarMensaje('error', 'Error de conexión');
        console.error(err);
    });
}

// Función para abrir modal
function abrirModal(modalId) {
    asegurarSelect2Bom();

    // Limpiar receta al abrir
    if (modalId === 'modalReceta') {
        recetaInsumos = [];
        $('#recetaProducto').val('').trigger('change');
        $('#recetaInsumo').val('').trigger('change');
        $('#recetaCantidad').val(1);
        $('#recetaInsumosBody').html('<tr id="recetaVacio"><td colspan="4" style="padding: 20px; text-align: center; color: #999; border: 1px solid #ddd;">No hay insumos agregados. Use el formulario de arriba para agregar.</td></tr>');
        
        // Destruir Select2 existentes antes de reinicializar
        if ($('#recetaProducto').hasClass('select2-hidden-accessible')) {
            $('#recetaProducto').select2('destroy');
        }
        if ($('#recetaInsumo').hasClass('select2-hidden-accessible')) {
            $('#recetaInsumo').select2('destroy');
        }
        if ($('#recetaUnidad').hasClass('select2-hidden-accessible')) {
            $('#recetaUnidad').select2('destroy');
        }
        
        // Inicializar Select2 para receta (necesario porque el modal estaba oculto)
        $('#recetaProducto, #recetaInsumo').select2({
            language: 'es',
            allowClear: true,
            width: '100%',
            dropdownParent: $('#modalReceta')
        });
        
        // Select2 para unidad de medida en modal crear receta
        $('#recetaUnidad').select2({
            language: 'es',
            width: '100%',
            minimumResultsForSearch: Infinity,
            dropdownParent: $('#modalReceta')
        });
        
        // Establecer valor por defecto para unidad después de inicializar Select2
        $('#recetaUnidad').select2('val', 'und');
    }
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

// Función para cerrar modal
function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Función para mostrar mensajes toast
function mostrarMensaje(tipo, mensaje) {
    const container = document.getElementById('toast-container');
    if (!container) {
        // Crear contenedor si no existe
        const newContainer = document.createElement('div');
        newContainer.className = 'messages';
        newContainer.id = 'toast-container';
        document.body.appendChild(newContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `message ${tipo}`;
    
    let icon = '';
    if (tipo === 'success') icon = '<i class="fas fa-check-circle"></i>';
    else if (tipo === 'error') icon = '<i class="fas fa-times-circle"></i>';
    else if (tipo === 'warning') icon = '<i class="fas fa-exclamation-triangle"></i>';
    else icon = '<i class="fas fa-info-circle"></i>';
    
    toast.innerHTML = `
        <div class="message-content">
            ${icon}
            <span class="text">${mensaje}</span>
        </div>
        <button type="button" class="close-toast" onclick="cerrarToast(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const toastContainer = document.getElementById('toast-container');
    toastContainer.appendChild(toast);
    
    // Auto cerrar después de 5 segundos
    setTimeout(() => {
        cerrarToast(toast.querySelector('.close-toast'));
    }, 5000);
}

// Función para cerrar toast individual
function cerrarToast(btn) {
    const toast = btn.closest('.message');
    if (toast) {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

// Función para cerrar todos los toasts
function cerrarTodosLosToasts() {
    const toasts = document.querySelectorAll('.message');
    toasts.forEach(toast => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
}

// Función para editar un registro BOM - abrir modal de edición de receta
function editarBom(productoId) {
    asegurarSelect2Bom();

    // Limpiar datos anteriores
    editRecetaInsumos = [];
    
    // Obtener los insumos del producto
    $.ajax({
        url: '/vistas/bom/por-producto/',
        type: 'GET',
        data: { producto_id: productoId },
        success: function(response) {
            if (response.success) {
                // Llenar los insumos existentes
                editRecetaInsumos = response.data.map(item => ({
                    insumo_id: item.insumo_id,
                    cantidad: item.cantidad,
                    unidad_medida: item.unidad_medida
                }));
                
                // Establecer el producto
                $('#editProductoId').val(productoId);
                $('#editRecetaProducto').val(productoId).trigger('change');
                
                // Renderizar la tabla
                renderEditRecetaTable();
                
                // Destruir Select2 existentes antes de reinicializar
                if ($('#editRecetaProducto').hasClass('select2-hidden-accessible')) {
                    $('#editRecetaProducto').select2('destroy');
                }
                if ($('#editRecetaInsumo').hasClass('select2-hidden-accessible')) {
                    $('#editRecetaInsumo').select2('destroy');
                }
                if ($('#editRecetaUnidad').hasClass('select2-hidden-accessible')) {
                    $('#editRecetaUnidad').select2('destroy');
                }
                
                // Inicializar Select2 para edición (necesario porque el modal estaba oculto)
                // Se usa dropdownParent para que el dropdown aparezca sobre el modal
                $('#editRecetaProducto, #editRecetaInsumo').select2({
                    language: 'es',
                    allowClear: true,
                    width: '100%',
                    dropdownParent: $('#modalEditBom')
                });
                
                // Select2 para unidad de medida en modal editar receta
                $('#editRecetaUnidad').select2({
                    language: 'es',
                    width: '100%',
                    minimumResultsForSearch: Infinity,
                    dropdownParent: $('#modalEditBom')
                });
                
                // Mostrar modal
                abrirModal('modalEditBom');
            } else {
                mostrarMensaje('error', response.error || 'Error al obtener los insumos');
            }
        },
        error: function() {
            mostrarMensaje('error', 'Error al obtener los datos del producto');
        }
    });
}

// Función para eliminar una receta completa (todos los insumos de un producto)
function eliminarRecetaCompleta(productoId, productoNombre) {
    $('#deleteId').val(productoId);
    $('#deleteProducto').text(productoNombre);
    $('#deleteInsumo').text('Todos los insumos de esta receta');
    abrirModal('modalDeleteBom');
}

// Función para ver los detalles de una receta
function verDetalleReceta(productoId, productoNombre) {
    // Establecer información del producto
    $('#verProductoId').text(productoId);
    $('#verProductoNombre').text(productoNombre);
    
    // Mostrar modal
    abrirModal('modalVerReceta');
    
    // Obtener los insumos del producto
    $.ajax({
        url: '/vistas/bom/por-producto/',
        type: 'GET',
        data: { producto_id: productoId },
        success: function(response) {
            if (response.success) {
                const tbody = document.getElementById('verRecetaInsumosBody');
                
                if (response.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" style="padding: 20px; text-align: center; color: #999;">No hay insumos en esta receta</td></tr>';
                    $('#verTotalInsumos').text('0');
                    return;
                }
                
                let html = '';
                response.data.forEach(function(item) {
                    html += `
                        <tr style="border-bottom: 1px solid #334155;">
                            <td style="padding: 10px; color: #e2e8f0;">${item.insumo_nombre}</td>
                            <td style="padding: 10px; text-align: center; color: #e2e8f0;">${item.cantidad}</td>
                            <td style="padding: 10px; text-align: center; color: #e2e8f0;">${item.unidad_medida}</td>
                        </tr>
                    `;
                });
                
                tbody.innerHTML = html;
                $('#verTotalInsumos').text(response.data.length);
            } else {
                mostrarMensaje('error', response.error || 'Error al obtener los insumos');
            }
        },
        error: function() {
            mostrarMensaje('error', 'Error al obtener los datos del producto');
        }
    });
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        cerrarModal(modalId);
    }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            cerrarModal(modal.id);
        });
    }
});

// Animación para cerrar toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

>>>>>>> mejoras-estilos
