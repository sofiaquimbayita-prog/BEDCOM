




// Script para la gestión de BOM (Bill of Materials)

// Función para obtener CSRF token de cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Variable para almacenar los insumos de la receta
let recetaInsumos = [];
// Variable para almacenar los insumos de la edición
let editRecetaInsumos = [];
// La variable productosConReceta se define en el template HTML antes de cargar este script

$(document).ready(function() {
    // Inicializar DataTable solo si hay datos en la tabla
    const tablaBody = document.querySelector('#tablaBom tbody');
    const hasData = tablaBody && tablaBody.querySelectorAll('tr').length > 0 && !tablaBody.querySelector('td[colspan="6"]');
    
    if (hasData) {
        $('#tablaBom').DataTable({
            language: {
                decimal: '',
                thousands: '.',
                lengthMenu: "Mostrar _MENU_ registros por página",
                zeroRecords: "No se encontraron registros coincidentes",
                info: "Mostrando _PAGE_ de _PAGES_",
                infoEmpty: "No hay registros disponibles",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                search: "Buscar:",
                paginate: {
                    first: "Primero",
                    last: "Último",
                    next: "Siguiente",
                    previous: "Anterior"
                },
                loadingRecords: "Cargando...",
                processing: "Procesando...",
                emptyTable: "No hay datos disponibles en la tabla"
            },
            pageLength: 10,
            lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todos"]],
            responsive: true,
            order: [[0, 'asc']], // Ordenar por producto
            columnDefs: []
        });
    }

    // Select2 para receta
    $('#recetaInsumo, #recetaProducto').select2({
        language: 'es',
        placeholder: 'Seleccione una opción',
        allowClear: true,
        width: '100%'
    });

    // Select2 para unidad de medida en receta (crear)
    $('#recetaUnidad').select2({
        language: 'es',
        width: '100%',
        minimumResultsForSearch: Infinity // Ocultar búsqueda ya que son pocas opciones
    });

    // Select2 para edición de receta
    $('#editRecetaInsumo, #editRecetaProducto').select2({
        language: 'es',
        placeholder: 'Seleccione una opción',
        allowClear: true,
        width: '100%'
    });

    // Select2 para unidad de medida en receta (editar)
    $('#editRecetaUnidad').select2({
        language: 'es',
        width: '100%',
        minimumResultsForSearch: Infinity
    });

    // Manejar cambio de producto en el modal de crear receta
    $('#recetaProducto').on('change', function() {
        const productoId = $(this).val();
        
        if (productoId && productosConReceta.includes(parseInt(productoId))) {
            // El producto ya tiene una receta
            mostrarMensaje('warning', 'Este producto ya tiene una receta asociada. Use el botón de editarla.');
            $(this).val('').trigger('change');
            return;
        }
    });

    // Manejar formulario de RECETA (crear)
    $('#formReceta').on('submit', function(e) {
        e.preventDefault();
        console.log('=== FORM RECETA SUBMIT TRIGGERED ===');
        
        const productoId = $('#recetaProducto').val();
        console.log('Producto ID:', productoId);
        
        if (!productoId) {
            console.error('No producto selected');
            mostrarMensaje('error', 'Debe seleccionar un producto');
            return;
        }
        
        // Validar que el producto no tenga receta (doble verificación)
        if (productosConReceta.includes(parseInt(productoId)) ) {
            console.error('Producto already has recipe');
            mostrarMensaje('error', 'Este producto ya tiene una receta asociada. Use la función de edición para modificarla.');
            return;
        }
        
        console.log('Receta insumos:', recetaInsumos);
        if (recetaInsumos.length === 0) {
            console.error('No insumos');
            mostrarMensaje('error', 'Debe agregar al menos un insumo a la receta');
            return;
        }
        
        const data = {
            producto_id: productoId,
            insumos: recetaInsumos
        };
        console.log('AJAX data:', data);
        console.log('CSRF token:', getCookie('csrftoken'));
        
        $.ajax({
            url: '/vistas/bom/crear-receta/',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            data: JSON.stringify(data),
            success: function(response) {
                console.log('Crear receta success:', response);
                if (response.success) {
                    cerrarModal('modalReceta');
                    mostrarMensaje('success', response.message);
                    // Limpiar formulario
                    recetaInsumos = [];
                    $('#recetaProducto').val('').trigger('change');
                    $('#recetaInsumo').val('').trigger('change');
                    $('#recetaCantidad').val(1);
                    $('#recetaUnidad').val('und').trigger('change');
                    $('#recetaInsumosBody').html('<tr id="recetaVacio"><td colspan="4" style="padding: 20px; text-align: center; color: #999; border: 1px solid #ddd;">No hay insumos agregados. Use el formulario de arriba para agregar.</td></tr>');
                    
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    console.error('Backend error:', response);
                    mostrarMensaje('error', response.error || 'Error al crear la receta');
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX FAILED - Status:', xhr.status);
                console.error('Response:', xhr.responseText);
                console.error('Status:', status, 'Error:', error);
                const response = xhr.responseJSON;
                let errorMsg = 'Error al crear la receta: ' + (xhr.status || 'Unknown');
                if (response && response.error) {
                    errorMsg = response.error;
                }
                mostrarMensaje('error', errorMsg);
            }
        });
    });


    // Manejar formulario de edición de RECETA
    $('#formEditBom').on('submit', function(e) {
        e.preventDefault();
        console.log('=== FORM EDIT BOM SUBMIT TRIGGERED ===');
        
        const productoId = $('#editProductoId').val();
        console.log('Edit Producto ID:', productoId);
        
        if (!productoId) {
            console.error('No producto ID');
            mostrarMensaje('error', 'Producto no especificado');
            return;
        }
        
        console.log('Edit insumos:', editRecetaInsumos);
        if (editRecetaInsumos.length === 0) {
            console.error('No insumos in edit');
            mostrarMensaje('error', 'Debe agregar al menos un insumo a la receta');
            return;
        }
        
        const data = {
            producto_id: productoId,
            insumos: editRecetaInsumos
        };
        console.log('AJAX edit data:', data);
        console.log('CSRF token:', getCookie('csrftoken'));
        
        $.ajax({
            url: '/vistas/bom/editar-receta/',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            data: JSON.stringify(data),
            success: function(response) {
                console.log('Edit receta success:', response);
                if (response.success) {
                    cerrarModal('modalEditBom');
                    mostrarMensaje('success', response.message);
                    // Limpiar variables
                    editRecetaInsumos = [];
                    
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    console.error('Backend edit error:', response);
                    mostrarMensaje('error', response.error || 'Error al actualizar la receta');
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX EDIT FAILED - Status:', xhr.status);
                console.error('Response:', xhr.responseText);
                console.error('Status:', status, 'Error:', error);
                const response = xhr.responseJSON;
                let errorMsg = 'Error al actualizar la receta: ' + (xhr.status || 'Unknown');
                if (response && response.error) {
                    errorMsg = response.error;
                }
                mostrarMensaje('error', errorMsg);
            }
        });
    });


    // Manejar formulario de eliminación
    $('#formDeleteBom').on('submit', function(e) {
        e.preventDefault();
        
        const id = $('#deleteId').val();
        
        // Verificar si es una eliminación de receta completa (tiene producto_id en el form)
        const productoId = $('input[name="producto_id"]', this).val();
        
        if (productoId) {
            // Es eliminación de receta completa
            $.ajax({
                url: '/vistas/bom/eliminar-receta/',
                type: 'POST',
                data: $(this).serialize(),
                success: function(response) {
                    if (response.success) {
                        cerrarModal('modalDeleteBom');
                        mostrarMensaje('success', response.message);
                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    } else {
                        mostrarMensaje('error', response.error || 'Error al eliminar la receta');
                    }
                },
                error: function(xhr) {
                    const response = xhr.responseJSON;
                    let errorMsg = 'Error al eliminar la receta';
                    if (response && response.error) {
                        errorMsg = response.error;
                    }
                    mostrarMensaje('error', errorMsg);
                }
            });
        } else {
            // Es eliminación de relación individual (legacy)
            $.ajax({
                url: '/vistas/bom/eliminar/' + id + '/',
                type: 'POST',
                data: $(this).serialize(),
                success: function(response) {
                    if (response.success) {
                        cerrarModal('modalDeleteBom');
                        mostrarMensaje('success', 'Relación BOM eliminada correctamente');
                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    } else {
                        mostrarMensaje('error', response.message || 'Error al eliminar la relación BOM');
                    }
                },
                error: function(xhr) {
                    const response = xhr.responseJSON;
                    let errorMsg = 'Error al eliminar la relación BOM';
                    if (response && response.message) {
                        errorMsg = response.message;
                    }
                    mostrarMensaje('error', errorMsg);
                }
            });
        }
    });
});

// Función para agregar insumo a la receta (crear)
function agregarInsumoReceta() {
    const insumoSelect = document.getElementById('recetaInsumo');
    const cantidadInput = document.getElementById('recetaCantidad');
    const unidadSelect = document.getElementById('recetaUnidad');
    
    const insumoId = insumoSelect.value;
    const cantidad = parseInt(cantidadInput.value);
    const unidad = unidadSelect.value;
    
    if (!insumoId) {
        mostrarMensaje('error', 'Debe seleccionar un insumo');
        return;
    }
    
    if (!cantidad || cantidad < 1) {
        mostrarMensaje('error', 'La cantidad debe ser mayor a 0');
        return;
    }
    
    // Verificar si el insumo ya fue agregado
    if (recetaInsumos.some(i => i.insumo_id === insumoId)) {
        mostrarMensaje('error', 'Este insumo ya está en la receta');
        return;
    }
    
    // Obtener nombre del insumo
    const insumoText = insumoSelect.options[insumoSelect.selectedIndex].text;
    
    // Agregar a la lista
    recetaInsumos.push({
        insumo_id: insumoId,
        cantidad: cantidad,
        unidad_medida: unidad
    });
    
    // Actualizar la tabla
    renderRecetaTable();
    
    // Resetear inputs
    $('#recetaInsumo').val('').trigger('change');
    $('#recetaCantidad').val(1);
    $('#recetaUnidad').val('und').trigger('change');
}

// Función para agregar insumo a la receta (editar)
function agregarInsumoEditReceta() {
    const insumoSelect = document.getElementById('editRecetaInsumo');
    const cantidadInput = document.getElementById('editRecetaCantidad');
    const unidadSelect = document.getElementById('editRecetaUnidad');
    
    const insumoId = insumoSelect.value;
    const cantidad = parseInt(cantidadInput.value);
    const unidad = unidadSelect.value;
    
    if (!insumoId) {
        mostrarMensaje('error', 'Debe seleccionar un insumo');
        return;
    }
    
    if (!cantidad || cantidad < 1) {
        mostrarMensaje('error', 'La cantidad debe ser mayor a 0');
        return;
    }
    
    // Verificar si el insumo ya fue agregado
    if (editRecetaInsumos.some(i => i.insumo_id === insumoId)) {
        mostrarMensaje('error', 'Este insumo ya está en la receta');
        return;
    }
    
    // Agregar a la lista
    editRecetaInsumos.push({
        insumo_id: insumoId,
        cantidad: cantidad,
        unidad_medida: unidad
    });
    
    // Actualizar la tabla
    renderEditRecetaTable();
    
    // Resetear inputs
    $('#editRecetaInsumo').val('').trigger('change');
    $('#editRecetaCantidad').val(1);
    $('#editRecetaUnidad').val('und').trigger('change');
}

// Función para renderizar la tabla de insumos en la receta (crear)
function renderRecetaTable() {
    const tbody = document.getElementById('recetaInsumosBody');
    
    if (recetaInsumos.length === 0) {
        tbody.innerHTML = '<tr id="recetaVacio"><td colspan="4" style="padding: 20px; text-align: center; color: #999; border: 1px solid #ddd;">No hay insumos agregados. Use el formulario de arriba para agregar.</td></tr>';
        return;
    }
    
    // Obtener los nombres de los insumos del select
    const insumoSelect = document.getElementById('recetaInsumo');
    const insumoOptions = {};
    for (let option of insumoSelect.options) {
        insumoOptions[option.value] = option.text;
    }
    
    let html = '';
    recetaInsumos.forEach((item, index) => {
        html += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${insumoOptions[item.insumo_id] || 'Insumo ' + item.insumo_id}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.cantidad}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.unidad_medida}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">
                    <button type="button" onclick="eliminarInsumoReceta(${index})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Función para renderizar la tabla de insumos en la receta (editar)
function renderEditRecetaTable() {
    const tbody = document.getElementById('editRecetaInsumosBody');
    
    if (editRecetaInsumos.length === 0) {
        tbody.innerHTML = '<tr id="editRecetaVacio"><td colspan="4" style="padding: 20px; text-align: center; color: #999; border: 1px solid #ddd;">No hay insumos agregados.</td></tr>';
        return;
    }
    
    // Obtener los nombres de los insumos del select
    const insumoSelect = document.getElementById('editRecetaInsumo');
    const insumoOptions = {};
    for (let option of insumoSelect.options) {
        insumoOptions[option.value] = option.text;
    }
    
    let html = '';
    editRecetaInsumos.forEach((item, index) => {
        html += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${insumoOptions[item.insumo_id] || 'Insumo ' + item.insumo_id}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.cantidad}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.unidad_medida}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">
                    <button type="button" onclick="eliminarInsumoEditReceta(${index})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Función para eliminar un insumo de la receta (crear)
function eliminarInsumoReceta(index) {
    recetaInsumos.splice(index, 1);
    renderRecetaTable();
}

// Función para eliminar un insumo de la receta (editar)
function eliminarInsumoEditReceta(index) {
    editRecetaInsumos.splice(index, 1);
    renderEditRecetaTable();
}

// Función para abrir modal
function abrirModal(modalId) {
    // Limpiar receta al abrir
    if (modalId === 'modalReceta') {
        recetaInsumos = [];
        $('#recetaProducto').val('').trigger('change');
        $('#recetaInsumo').val('').trigger('change');
        $('#recetaCantidad').val(1);
        $('#recetaUnidad').val('und').trigger('change');
        $('#recetaInsumosBody').html('<tr id="recetaVacio"><td colspan="4" style="padding: 20px; text-align: center; color: #999; border: 1px solid #ddd;">No hay insumos agregados. Use el formulario de arriba para agregar.</td></tr>');
        
        // Inicializar Select2 para receta (necesario porque el modal estaba oculto)
        // Se usa dropdownParent para que el dropdown aparezca sobre el modal
        $('#recetaProducto, #recetaInsumo').select2({
            language: 'es',
            placeholder: 'Seleccione una opción',
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
                
                // Inicializar Select2 para edición (necesario porque el modal estaba oculto)
                // Se usa dropdownParent para que el dropdown aparezca sobre el modal
                $('#editRecetaProducto, #editRecetaInsumo').select2({
                    language: 'es',
                    placeholder: 'Seleccione una opción',
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

