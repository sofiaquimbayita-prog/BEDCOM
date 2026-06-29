// Función para obtener el token CSRF
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Variable global para DataTable
var dataTableSalidas = null;

// Función para anular una salida
function anularSalida(id) {
    console.log('🔄 AnularSalida llamada con ID:', id);

    if (confirm('¿Estás seguro de que deseas anular la salida #' + id + '? El stock se reintegrará al producto.')) {
        _doAnularFetch(id);
    }
}

function _doAnularFetch(id) {
    console.log('📡 Fetch POST /vistas/salida/anular/' + id);
    fetch('/vistas/salida/anular/' + id + '/', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(response => {
            console.log('📥 Response status:', response.status);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log(' Data received:', data);
            if (data.success) {
                window.showToast(data.message || 'Anulada correctamente', 'success');
                recargarTabla();
            } else {
                window.showToast(data.message || 'Error backend', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Anular error:', error);
            window.showToast('Error conexión: ' + error.message, 'error');
        });
}

// Función para el toggle de mostrar anulados (sin recargar página)
function toggleAnulados() {
    var checkbox = document.getElementById('toggleAnulados');
    if (!checkbox) return;
    var soloInactivos = checkbox.checked;
    if (dataTableSalidas) {
        dataTableSalidas.ajax.url('/vistas/salida/data/?solo_inactivos=' + soloInactivos).load();
    }
}

// Funciones para el modal de nueva salida
function abrirModalSalida() {
    var modal = document.getElementById('modalSalida');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function cerrarModalSalida() {
    var modal = document.getElementById('modalSalida');
    if (modal) {
        modal.style.display = 'none';
        var form = document.getElementById('formSalida');
        if (form) form.reset();

        var stockInput = document.getElementById('stockDisponible');
        if (stockInput) stockInput.value = '';
    }
}

function enviarFormularioSalida() {
    var form = document.getElementById('formSalida');
    if (!form) return;

    var formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cerrarModalSalida();
                window.showToast(data.message, 'success');
                recargarTabla();
            } else {
                var errorMessage = data.message || "Error al registrar";
                if (data.errors) {
                    var errores = [];
                    for (var campo in data.errors) {
                        errores.push(campo + ": " + data.errors[campo].join(', '));
                    }
                    errorMessage = errores.join('\n');
                }
                window.showToast(errorMessage, 'error');
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
            window.showToast("Ocurrió un error al procesar la solicitud", 'error');
        });
}

// Función para recargar la tabla
function recargarTabla() {
    if (dataTableSalidas) {
        dataTableSalidas.ajax.reload();
    } else {
        location.reload();
    }
}

// Asignar funciones al objeto window para que estén disponibles globalmente
window.anularSalida = anularSalida;
window.toggleAnulados = toggleAnulados;
window.abrirModalSalida = abrirModalSalida;
window.cerrarModalSalida = cerrarModalSalida;
window.enviarFormularioSalida = enviarFormularioSalida;


// Inicializar DataTable con AJAX
$(document).ready(function() {
    if (typeof $.fn.DataTable !== 'undefined') {
        dataTableSalidas = $('#tablaSalidas').DataTable({
            language: {
                processing: "Cargando datos...",
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ salidas",
                infoEmpty: "No hay salidas disponibles",
                infoFiltered: "(filtrado de _MAX_ salidas totales)",
                emptyTable: "No hay datos disponibles en la tabla",
                zeroRecords: "No se encontraron coincidencias",
                paginate: {
                    first: "Primero",
                    previous: "Anterior",
                    next: "Siguiente",
                    last: "Último"
                }
            },
            responsive: true,
            dom: '<"top"fl<"clear">>rt<"bottom"ip<"clear">>',
            pageLength: 10,
            lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
            order: [[2, 'desc']],
            columnDefs: [
                { orderable: false, targets: [3, 6] }
            ],
            ajax: {
                url: '/vistas/salida/data/',
                type: 'GET',
                dataSrc: function(json) {
                    return json.data || [];
                },
                error: function(xhr, error, thrown) {
                    console.error('Error cargando datos:', thrown);
                }
            },
            columns: [
                {
                    data: 'producto',
                    render: function(data) {
                        return '<strong>' + data + '</strong>';
                    }
                },
                { data: 'cantidad' },
                { data: 'fecha' },
                {
                    data: 'motivo',
                    render: function(data) {
                        if (data && data.length > 50) {
                            return '<span title="' + data.replace(/"/g, '&quot;') + '">' + data.substring(0, 50) + '...</span>';
                        }
                        return data || '';
                    }
                },
                { data: 'responsable' },
                {
                    data: 'estado',
                    render: function(data) {
                        if (data) {
                            return '<span class="badge badge-active"><i class="fas fa-check"></i> Activo</span>';
                        } else {
                            return '<span class="badge badge-anulada"><i class="fas fa-times"></i> Anulada</span>';
                        }
                    }
                },
                {
                    data: null,
                    render: function(data) {
                        var id = data.id;
                        var html = '<div class="actions-cell">';
                        html += '<button type="button" class="btn-action btn-view" onclick="abrirModalDetalle(' + id + ')" title="Ver detalles"><i class="fas fa-eye"></i></button>';
                        if (data.estado) {
                            html += '<button type="button" class="btn-action btn-anular" onclick="anularSalida(' + id + ')" title="Anular salida"><i class="fas fa-ban"></i></button>';
                        }
                        html += '</div>';
                        return html;
                    }
                }
            ]
        });
    }

    // --- ELEMENTOS DE LA BARRA SUPERIOR ---
    const perfilBtn = document.getElementById('perfilBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const notiBtn = document.getElementById('noti');
    const notiMenu = document.getElementById('noti-menu');
    const accesibilidadBtn = document.getElementById('btn-accesibilidad');
    const menuAccesibilidad = document.getElementById('menu-accesibilidad');

    // --- FORMULARIO DE SALIDA ---
    const formSalida = document.getElementById('formSalida');
    const responsableInput = document.getElementById("responsable");
    const errorResponsable = document.getElementById("errorResponsable");

    const cantidadInput = document.getElementById("cantidad");
    const errorCantidad = document.getElementById("errorCantidad");

    const productoSelect = document.getElementById("id_producto");
    const stockInput = document.getElementById("stockDisponible");
    const errorProducto = document.getElementById("errorProducto");

    const fechaInput = document.getElementById("fecha");
    const errorFecha = document.getElementById("errorFecha");

    const motivoInput = document.getElementById("motivo");
    const errorMotivo = document.getElementById("errorMotivo");

    // --- EVENTO NATIVO DEL SELECT ---
    if (productoSelect) {
        productoSelect.addEventListener('change', function () {
            const selectedValue = this.value;

            if (selectedValue) {
                const selectedOption = this.options[this.selectedIndex];
                const stock = selectedOption.getAttribute('data-stock');

                if (stock && stock !== "null" && stock !== "") {
                    stockInput.value = stock + " unidades";
                    errorProducto.textContent = "";
                    productoSelect.classList.remove("input-error");
                    productoSelect.classList.add("input-ok");
                } else {
                    stockInput.value = "";
                }

                if (cantidadInput) {
                    cantidadInput.dispatchEvent(new Event('input'));
                }
            } else {
                stockInput.value = "";
                errorProducto.textContent = "";
                productoSelect.classList.remove("input-error", "input-ok");
            }
        });
    }

    // --- FUNCIONES DE LOS MENÚS ---
    function cerrarMenus() {
        if (dropdownMenu) dropdownMenu.classList.add('oculto');
        if (notiMenu) notiMenu.classList.add('oculto');
        if (menuAccesibilidad) menuAccesibilidad.classList.add('oculto');
    }

    if (perfilBtn && dropdownMenu) {
        perfilBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const estaOculto = dropdownMenu.classList.contains('oculto');
            cerrarMenus();
            if (estaOculto) dropdownMenu.classList.remove('oculto');
        });
    }

    if (notiBtn && notiMenu) {
        notiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const estaOculto = notiMenu.classList.contains('oculto');
            cerrarMenus();
            if (estaOculto) notiMenu.classList.remove('oculto');
        });
    }

    if (accesibilidadBtn && menuAccesibilidad) {
        accesibilidadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const estaOculto = menuAccesibilidad.style.display === 'none' || menuAccesibilidad.style.display === '';
            cerrarMenus();
            if (estaOculto) {
                menuAccesibilidad.style.display = 'block';
            } else {
                menuAccesibilidad.style.display = 'none';
            }
        });
    }

    document.addEventListener('click', () => {
        cerrarMenus();
        if (menuAccesibilidad) {
            menuAccesibilidad.style.display = 'none';
        }
    });

    // --- VALIDACIONES ---
    function validarProducto() {
        if (productoSelect && errorProducto) {
            const valor = productoSelect.value;
            if (!valor) {
                errorProducto.textContent = "Debe seleccionar un producto";
                productoSelect.classList.add("input-error");
                productoSelect.classList.remove("input-ok");
                return false;
            } else {
                errorProducto.textContent = "";
                productoSelect.classList.remove("input-error");
                productoSelect.classList.add("input-ok");
                return true;
            }
        }
        return false;
    }

    function validarCantidad() {
        let stock = 0;
        const productoValor = productoSelect?.value;

        if (productoValor) {
            const selectedOption = productoSelect.options[productoSelect.selectedIndex];
            const stockValue = selectedOption?.getAttribute('data-stock');
            stock = parseInt(stockValue) || 0;
        }

        const cantidad = parseInt(cantidadInput?.value) || 0;

        if (cantidadInput && errorCantidad) {
            if (cantidad <= 0) {
                errorCantidad.textContent = "La cantidad debe ser mayor a 0";
                cantidadInput.classList.add("input-error");
                cantidadInput.classList.remove("input-ok");
                return false;
            }
            else if (cantidad > stock) {
                errorCantidad.textContent = "No hay suficiente stock disponible (máximo: " + stock + ")";
                cantidadInput.classList.add("input-error");
                cantidadInput.classList.remove("input-ok");
                return false;
            }
            else if (cantidad < 0) {
                errorCantidad.textContent = "La cantidad no puede ser negativa";
                cantidadInput.classList.add("input-error");
                cantidadInput.classList.remove("input-ok");
                return false;
            } else {
                errorCantidad.textContent = "";
                cantidadInput.classList.remove("input-error");
                cantidadInput.classList.add("input-ok");
                return true;
            }
        }
        return false;
    }

    if (cantidadInput) {
        cantidadInput.addEventListener("input", function () {
            if (this.value < 0) {
                this.value = Math.abs(this.value);
            }
        });

        cantidadInput.addEventListener("input", validarCantidad);
    }

    function validarResponsable() {
        const valor = responsableInput?.value?.trim() || '';
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/;

        if (responsableInput && errorResponsable) {
            if (valor.length < 3) {
                responsableInput.classList.add("input-error");
                responsableInput.classList.remove("input-ok");
                errorResponsable.textContent = "El nombre debe tener al menos 3 caracteres";
                return false;
            } else if (!regex.test(valor)) {
                responsableInput.classList.add("input-error");
                responsableInput.classList.remove("input-ok");
                errorResponsable.textContent = "No se permiten caracteres especiales";
                return false;
            } else {
                responsableInput.classList.remove("input-error");
                responsableInput.classList.add("input-ok");
                errorResponsable.textContent = "";
                return true;
            }
        }
        return false;
    }

    if (responsableInput) {
        responsableInput.addEventListener("input", function () {
            var valorActual = this.value;
            var regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/;

            if (!regex.test(valorActual) && valorActual.length > 0) {
                this.value = valorActual.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]/g, '');
                if (errorResponsable) {
                    errorResponsable.textContent = 'No se permiten caracteres especiales';
                    errorResponsable.style.display = 'block';
                }
            } else {
                if (errorResponsable) {
                    errorResponsable.textContent = '';
                    errorResponsable.style.display = 'none';
                }
            }
        });

        responsableInput.addEventListener("input", validarResponsable);
    }

    function validarFecha() {
        const fechaValor = fechaInput?.value;

        if (fechaInput && errorFecha) {
            if (!fechaValor) {
                errorFecha.textContent = "La fecha es requerida";
                fechaInput.classList.add("input-error");
                return false;
            }

            const fechaSeleccionada = new Date(fechaValor);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fechaSeleccionada > hoy) {
                errorFecha.textContent = "La fecha no puede ser futura";
                fechaInput.classList.add("input-error");
                fechaInput.classList.remove("input-ok");
                return false;
            } else {
                errorFecha.textContent = "";
                fechaInput.classList.remove("input-error");
                fechaInput.classList.add("input-ok");
                return true;
            }
        }
        return false;
    }

    if (fechaInput) {
        fechaInput.addEventListener("change", validarFecha);

        const today = new Date().toISOString().split('T')[0];
        fechaInput.max = today;
        fechaInput.value = today;
    }

    function validarMotivo() {
        const valor = motivoInput?.value?.trim() || '';

        if (motivoInput && errorMotivo) {
            if (valor.length < 5) {
                motivoInput.classList.add("input-error");
                motivoInput.classList.remove("input-ok");
                errorMotivo.textContent = "El motivo debe tener al menos 5 caracteres";
                return false;
            }
            if (valor.length > 200) {
                motivoInput.classList.add("input-error");
                motivoInput.classList.remove("input-ok");
                errorMotivo.textContent = "El motivo no puede exceder 200 caracteres";
                return false;
            }
            const patron = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,;()]+$/;
            if (!patron.test(valor)) {
                motivoInput.classList.add("input-error");
                motivoInput.classList.remove("input-ok");
                errorMotivo.textContent = "El motivo no puede contener caracteres especiales";
                return false;
            } else {
                motivoInput.classList.remove("input-error");
                motivoInput.classList.add("input-ok");
                errorMotivo.textContent = "";
                return true;
            }
        }
        return false;
    }

    if (motivoInput) {
        motivoInput.addEventListener("input", function () {
            var valorActual = this.value;
            var patron = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,;()]+$/;

            if (!patron.test(valorActual) && valorActual.length > 0) {
                this.value = valorActual.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,;()]/g, '');
                if (errorMotivo) {
                    errorMotivo.textContent = 'No se permiten caracteres especiales';
                    errorMotivo.style.display = 'block';
                }
            } else {
                if (errorMotivo) {
                    errorMotivo.textContent = '';
                    errorMotivo.style.display = 'none';
                }
            }
        });

        motivoInput.addEventListener("input", validarMotivo);
    }

    // --- ENVÍO DEL FORMULARIO ---
    if (formSalida) {
        formSalida.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;
            let firstError = null;

            if (!validarProducto()) {
                window.showToast("Debe seleccionar un producto", 'error');
                isValid = false;
                firstError = productoSelect;
            }

            if (isValid && !validarCantidad()) {
                window.showToast("La cantidad debe ser mayor a 0 y no exceder el stock disponible", 'error');
                isValid = false;
                if (!firstError) firstError = cantidadInput;
            }

            if (isValid && !validarFecha()) {
                window.showToast("La fecha no puede ser futura", 'error');
                isValid = false;
                if (!firstError) firstError = fechaInput;
            }

            if (isValid && !validarMotivo()) {
                window.showToast("El motivo debe tener al menos 5 caracteres", 'error');
                isValid = false;
                if (!firstError) firstError = motivoInput;
            }

            if (isValid && !validarResponsable()) {
                window.showToast("El nombre del responsable debe tener mínimo 3 caracteres", 'error');
                isValid = false;
                if (!firstError) firstError = responsableInput;
            }

            if (!isValid) {
                if (firstError) {
                    firstError.focus();
                }
                return;
            }

            const formData = new FormData(formSalida);

            fetch(formSalida.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        cerrarModalSalida();
                        window.showToast(data.message, 'success');
                        recargarTabla();
                    } else {
                        let errorMessage = data.message || "Error al registrar la salida";

                        if (data.errors) {
                            const errores = [];
                            for (const [campo, mensajes] of Object.entries(data.errors)) {
                                errores.push(campo + ": " + mensajes.join(', '));
                            }
                            errorMessage = errores.join('\n');
                        }

                        window.showToast(errorMessage, 'error');
                    }
                })
                .catch(function (error) {
                    console.error('Error:', error);
                    window.showToast("Ocurrió un error al procesar la solicitud", 'error');
                });
        });
    }
});

