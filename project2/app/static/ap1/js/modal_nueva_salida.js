// Funciones para el modal de Nueva Salida
// Extraído de modal_salida.html

// Funciones para el modal
function cerrarModalSalida() {
    var modal = document.getElementById('modalSalida');
    if (modal) {
        modal.style.display = 'none';
        var form = document.getElementById('formSalida');
        if (form) form.reset();
        
        // Limpiar stock
        var stockInput = document.getElementById('stockDisponible');
        if (stockInput) stockInput.value = '';
    }
}

function abrirModalSalida() {
    var modal = document.getElementById('modalSalida');
    if (modal) {
        modal.style.display = 'flex';
        
        var productoSelect = document.getElementById('id_producto');
        if (productoSelect) {
            productoSelect.onchange = function() {
                var stockInput = document.getElementById('stockDisponible');
                var selectedOption = productoSelect.options[productoSelect.selectedIndex];
                var stock = selectedOption.getAttribute('data-stock');

                if (stock && stock !== "null" && stock !== "") {
                    if (stockInput) stockInput.value = stock + " unidades";
                } else {
                    if (stockInput) stockInput.value = "";
                }
            };
        }
        
        // Validación en tiempo real para el campo responsable
        var responsableInput = document.getElementById('id_responsable');
        if (responsableInput) {
            responsableInput.oninput = function() {
                var errorResponsable = document.getElementById('errorResponsable');
                var regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/;
                
                if (!regex.test(this.value) && this.value.length > 0) {
                    if (errorResponsable) {
                        errorResponsable.textContent = 'No se permiten caracteres especiales';
                        errorResponsable.style.display = 'block';
                    }

                    this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]/g, '');
                } else {
                    if (errorResponsable) {
                        errorResponsable.textContent = '';
                        errorResponsable.style.display = 'none';
                    }
                }
            };
        }
    }
}

// ===============================
// FUNCIONES DE NOTIFICACIONES TOAST
// ===============================
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

// ===============================
// FUNCION PARA ENVIAR EL FORMULARIO
// ===============================
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
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
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

                var nombresCampos = {
                    id_producto: "Producto",
                    cantidad: "Cantidad",
                    fecha: "Fecha",
                    motivo: "Motivo",
                    responsable: "Responsable"
                };

                var errores = [];

                for (var campo in data.errors) {
                    var nombreCampo = nombresCampos[campo] || campo;
                    errores.push("Debe completar el campo <b>" + nombreCampo + "</b>");
                }

                errorMessage = errores.join('<br>');
            }

            showErrorToast(errorMessage);
        }

    })
    .catch(function(error) {
        console.error('Error:', error);
        showErrorToast("Ocurrió un error al procesar la solicitud");
    });
}

// Hacer las funciones globales disponibles
window.cerrarModalSalida = cerrarModalSalida;
window.abrirModalSalida = abrirModalSalida;
window.enviarFormularioSalida = enviarFormularioSalida;
window.showToast = showToast;
window.showErrorToast = showErrorToast;
window.showSuccessToast = showSuccessToast;