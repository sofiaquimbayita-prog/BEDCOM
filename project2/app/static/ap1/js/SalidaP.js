// Funciones globales para Toast
function showToast(message, type) {
    var toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    var icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle"></i>';
            break;
    }
    
    toast.innerHTML = icon + '<span>' + message + '</span><button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>';
    
    toastContainer.appendChild(toast);
    
    setTimeout(function() {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(function() {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

function showErrorToast(message) {
    showToast(message, 'error');
}

function showSuccessToast(message) {
    showToast(message, 'success');
}

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

// Función para anular una salida
function anularSalida(id) {
    console.log('Intentando anular salida ID:', id);
    
    if (typeof Swal === 'undefined') {
        console.warn('SweetAlert2 no está cargado, usando confirm nativo');
        if (!confirm('¿Está seguro de que desea anular esta salida? El stock será reintegrado.')) {
            return;
        }
        
        // Proceder con la anulación sin SweetAlert
        fetch('/vistas/salida/anular/' + id + '/', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                showSuccessToast(data.message);
                setTimeout(function() {
                    location.reload();
                }, 1500);
            } else {
                showErrorToast(data.message || 'Error al anular la salida');
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            showErrorToast('Ocurrió un error al procesar la solicitud');
        });
        return;
    }
    
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción anulará la salida y reintegrará el stock al producto.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, anular',
        cancelButtonText: 'Cancelar'
    }).then(function(result) {
        if (result.isConfirmed) {
            fetch('/vistas/salida/anular/' + id + '/', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.success) {
                    showSuccessToast(data.message);
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                } else {
                    showErrorToast(data.message || 'Error al anular la salida');
                }
            })
            .catch(function(error) {
                console.error('Error:', error);
                showErrorToast('Ocurrió un error al procesar la solicitud');
            });
        }
    });
}

// Función para el toggle de mostrar anulados
function toggleAnulados() {
    var checkbox = document.getElementById('toggleAnulados');
    if (!checkbox) return;
    
    var url = new URL(window.location.href);
    
    if (checkbox.checked) {
        url.searchParams.set('mostrar_anulados', 'true');
    } else {
        url.searchParams.set('mostrar_anulados', 'false');
    }
    
    window.location.href = url.toString();
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
            showSuccessToast(data.message);
            setTimeout(function() {
                location.reload();
            }, 1500);
        } else {
            var errorMessage = data.message || "Error al registrar";
            if (data.errors) {
                var errores = [];
                for (var campo in data.errors) {
                    errores.push(campo + ": " + data.errors[campo].join(', '));
                }
                errorMessage = errores.join('\n');
            }
            showErrorToast(errorMessage);
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
        showErrorToast("Ocurrió un error al procesar la solicitud");
    });
}

// Asignar funciones al objeto window para que estén disponibles globalmente
window.anularSalida = anularSalida;
window.toggleAnulados = toggleAnulados;
window.abrirModalSalida = abrirModalSalida;
window.cerrarModalSalida = cerrarModalSalida;
window.enviarFormularioSalida = enviarFormularioSalida;
window.showToast = showToast;
window.showErrorToast = showErrorToast;
window.showSuccessToast = showSuccessToast;

// Código que se ejecuta cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    
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
        productoSelect.addEventListener('change', function() {
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
        cantidadInput.addEventListener("input", function() {
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
        // Validación en tiempo real: eliminar caracteres no permitidos mientras escribe
        responsableInput.addEventListener("input", function() {
            var valorActual = this.value;
            var regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/;
            
            if (!regex.test(valorActual) && valorActual.length > 0) {
                // Remover caracteres no permitidos
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
        // Validación en tiempo real: eliminar caracteres no permitidos mientras escribe
        motivoInput.addEventListener("input", function() {
            var valorActual = this.value;
            var patron = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,;()]+$/;
            
            if (!patron.test(valorActual) && valorActual.length > 0) {
                // Remover caracteres no permitidos
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
        formSalida.addEventListener('submit', function(e) {
            e.preventDefault();

            let isValid = true;
            let firstError = null;

            if (!validarProducto()) {
                showErrorToast("Debe seleccionar un producto");
                isValid = false;
                firstError = productoSelect;
            }

            if (isValid && !validarCantidad()) {
                showErrorToast("La cantidad debe ser mayor a 0 y no exceder el stock disponible");
                isValid = false;
                if (!firstError) firstError = cantidadInput;
            }

            if (isValid && !validarFecha()) {
                showErrorToast("La fecha no puede ser futura");
                isValid = false;
                if (!firstError) firstError = fechaInput;
            }

            if (isValid && !validarMotivo()) {
                showErrorToast("El motivo debe tener al menos 5 caracteres");
                isValid = false;
                if (!firstError) firstError = motivoInput;
            }

            if (isValid && !validarResponsable()) {
                showErrorToast("El nombre del responsable debe tener mínimo 3 caracteres");
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
                    showSuccessToast(data.message);
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                } else {
                    let errorMessage = data.message || "Error al registrar la salida";
                    
                    if (data.errors) {
                        const errores = [];
                        for (const [campo, mensajes] of Object.entries(data.errors)) {
                            errores.push(campo + ": " + mensajes.join(', '));
                        }
                        errorMessage = errores.join('\n');
                    }

                    showErrorToast(errorMessage);
                }
            })
            .catch(function(error) {
                console.error('Error:', error);
                showErrorToast("Ocurrió un error al procesar la solicitud");
            });
        });
    }
    window.onload = function() {
        // Función para ordenar la tabla al hacer clic en el encabezado
        function ordenarTabla(columna) {

            console.log('Ordenando por columna:', columna);  // Agrega esta línea para depuración

            const tabla = document.querySelector(".salidas-table");
            const tbody = tabla.querySelector("tbody");
            const filas = Array.from(tbody.querySelectorAll("tr"));

            // Alternar entre orden ascendente y descendente
            const asc = tabla.classList.toggle("asc");
            tabla.classList.toggle("desc", !asc);

            filas.sort((a, b) => {
                const celdaA = a.children[columna].innerText.trim();
                const celdaB = b.children[columna].innerText.trim();

                // Si los valores son números
                if (!isNaN(celdaA) && !isNaN(celdaB)) {
                    return asc ? celdaA - celdaB : celdaB - celdaA;
                }

                // Si son cadenas de texto
                return asc
                    ? celdaA.localeCompare(celdaB)
                    : celdaB.localeCompare(celdaA);
            });

            filas.forEach(fila => tbody.appendChild(fila)); // Reorganizar las filas
        }
        // Asignamos la función al objeto window para que sea global
        window.ordenarTabla = ordenarTabla; // Asegura que la función esté disponible globalmente
    };
});

