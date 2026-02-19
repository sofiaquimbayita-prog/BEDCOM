
$(document).ready(function() {
    
    // 1. FILTRADO 
    function filtrarProveedores() {
        const mostrarInactivos = $('#toggleInactivos').is(':checked');
        
        $('.card.provider').each(function() {
            const esInactivo = $(this).hasClass('inactive-card');
            
            if (mostrarInactivos) {
                if (esInactivo) {
                    $(this).fadeIn(300).removeClass('d-none');
                } else {
                    $(this).hide().addClass('d-none');
                }
            } else {
                if (esInactivo) {
                    $(this).hide().addClass('d-none');
                } else {
                    $(this).fadeIn(300).removeClass('d-none');
                }
            }
        });
    }

    $('#toggleInactivos').on('change', function() {
        filtrarProveedores();
    });

    filtrarProveedores();

    // MODALES

    window.abrirModal = function(idModal) {
        const modal = document.getElementById(idModal);
        if (modal) modal.style.display = 'flex';
    };

    window.cerrarModal = function(idModal) {
        const modal = document.getElementById(idModal);
        if (modal) modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    //VALIDACIONES

    function validarNombre(nombre) {
        const errores = [];
        if (!nombre || nombre.trim() === '') {
            errores.push('El nombre es requerido');
        } else {
            const nombreTrimmed = nombre.trim();
            if (nombreTrimmed.length < 3) {
                errores.push('El nombre debe tener al menos 3 caracteres');
            }
            if (nombreTrimmed.length > 100) {
                errores.push('El nombre no puede exceder 100 caracteres');
            }

            if (!/^[a-zA-Z0-9\s]+$/.test(nombreTrimmed)) {
                errores.push('El nombre solo puede contener letras, números y espacios');
            }
        }
        return errores;
    }

    //validar teléfono
    function validarTelefono(telefono) {
        const errores = [];
        if (!telefono || telefono.trim() === '') {
            errores.push('El teléfono es requerido');
        } else {
            const tel = telefono.trim();
            if (!/^\d+$/.test(tel)) {
                errores.push('El teléfono solo debe contener números');
            } else if (tel.length !== 10) {
                errores.push('El teléfono debe tener 10 dígitos');
            }
        }
        return errores;
    }

    //validar dirección

    function validarDireccion(direccion) {
        const errores = [];
        if (!direccion || direccion.trim() === '') {
            errores.push('La dirección es requerida');
        } else {
            const dirTrimmed = direccion.trim();
            if (dirTrimmed.length < 10) {
                errores.push('debe tener al menos 10 caracteres');
            }
            if (dirTrimmed.length > 200) {
                errores.push('no puede pasar de los 200 caracteres');
            }
        }
        return errores;
    }

    //validar imagen
    function validarImagen(imagen) {
        const errores = [];
        if (imagen && imagen.files && imagen.files[0]) {
            const file = imagen.files[0];
            const maxSize = 2 * 1024 * 1024; // 2MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            
            if (file.size > maxSize) {
                errores.push('La imagen no puede exceder 2MB');
            }
            if (!allowedTypes.includes(file.type)) {
                errores.push('Tipo de imagen no permitido.');
            }
        }
        return errores;
    }

    //mostrar errores formulario
    function mostrarErrores(campoId, errores) {
        const campo = document.getElementById(campoId);
        if (!campo) return;
        
        //contenedor de error
        let errorDiv = campo.parentElement.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = '#ef4444';
            errorDiv.style.fontSize = '0.85rem';
            errorDiv.style.marginTop = '5px';
            campo.parentElement.appendChild(errorDiv);
        }
        
        if (errores.length > 0) {
            errorDiv.innerHTML = errores.join('<br>');
            campo.style.borderColor = '#ef4444';
        } else {
            errorDiv.innerHTML = '';
            campo.style.borderColor = '';
        }
    }

    // Función errores
    function limpiarErrores(form) {
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(el => el.innerHTML = '');
        
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => input.style.borderColor = '');
    }

    //Validar formulario agregar proveedor
    const formAgregar = document.getElementById('addProveedorForm');
    if (formAgregar) {
        formAgregar.addEventListener('submit', function(e) {
            limpiarErrores(this);
            const nombre = document.getElementById('addNombre');
            const telefono = document.getElementById('addTelefono');
            const direccion = document.getElementById('addDireccion');
            const imagen = document.getElementById('addImagen');
            let hasErrors = false;
            
            const erroresNombre = validarNombre(nombre.value);
            if (erroresNombre.length > 0) {
                mostrarErrores('addNombre', erroresNombre);
                hasErrors = true;
            }
            
            const erroresTelefono = validarTelefono(telefono.value);
            if (erroresTelefono.length > 0) {
                mostrarErrores('addTelefono', erroresTelefono);
                hasErrors = true;
            }
            
            const erroresDireccion = validarDireccion(direccion.value);
            if (erroresDireccion.length > 0) {
                mostrarErrores('addDireccion', erroresDireccion);
                hasErrors = true;
            }
            
            const erroresImagen = validarImagen(imagen);
            if (erroresImagen.length > 0) {
                let errorDiv = imagen.parentElement.querySelector('.error-message');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.style.color = '#ef4444';
                    errorDiv.style.fontSize = '0.85rem';
                    errorDiv.style.marginTop = '5px';
                    imagen.parentElement.appendChild(errorDiv);
                }
                errorDiv.innerHTML = erroresImagen.join('<br>');
                hasErrors = true;
            }
            if (hasErrors) {
                e.preventDefault();
                return false;
            }
        });
        const addNombre = document.getElementById('addNombre');
        const addTelefono = document.getElementById('addTelefono');
        const addDireccion = document.getElementById('addDireccion');
        
        if (addNombre) {
            addNombre.addEventListener('blur', function() {
                const errores = validarNombre(this.value);
                mostrarErrores('addNombre', errores);
            });
            addNombre.addEventListener('input', function() {
                const errorDiv = this.parentElement.querySelector('.error-message');
                if (errorDiv && errorDiv.innerHTML !== '') {
                    const errores = validarNombre(this.value);
                    if (errores.length === 0) {
                        mostrarErrores('addNombre', []);
                    }
                }
            });
        }
        
        if (addTelefono) {
            addTelefono.addEventListener('blur', function() {
                const errores = validarTelefono(this.value);
                mostrarErrores('addTelefono', errores);
            });
            addTelefono.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d]/g, '');
                const errorDiv = this.parentElement.querySelector('.error-message');
                if (errorDiv && errorDiv.innerHTML !== '') {
                    const errores = validarTelefono(this.value);
                    if (errores.length === 0) {
                        mostrarErrores('addTelefono', []);
                    }
                }
            });
        }
        
        if (addDireccion) {
            addDireccion.addEventListener('blur', function() {
                const errores = validarDireccion(this.value);
                mostrarErrores('addDireccion', errores);
            });
            addDireccion.addEventListener('input', function() {
                const errorDiv = this.parentElement.querySelector('.error-message');
                if (errorDiv && errorDiv.innerHTML !== '') {
                    const errores = validarDireccion(this.value);
                    if (errores.length === 0) {
                        mostrarErrores('addDireccion', []);
                    }
                }
            });
        }
    }

    // ejecucion dinámica
    $(document).on('submit', '#formEditarProveedor', function(e) {
        limpiarErrores(this);

        const nombre = this.querySelector('input[name="nombre"]');
        const telefono = this.querySelector('input[name="telefono"]');
        const direccion = this.querySelector('input[name="direccion"]');
        const imagen = this.querySelector('input[name="imagen"]');
        
        let hasErrors = false;
        
        if (nombre) {
            const erroresNombre = validarNombre(nombre.value);
            if (erroresNombre.length > 0) {
                mostrarErroresPorNombre(this, 'nombre', erroresNombre);
                hasErrors = true;
            }
        }
        
        if (telefono) {
            const erroresTelefono = validarTelefono(telefono.value);
            if (erroresTelefono.length > 0) {
                mostrarErroresPorNombre(this, 'telefono', erroresTelefono);
                hasErrors = true;
            }
        }
        
        if (direccion) {
            const erroresDireccion = validarDireccion(direccion.value);
            if (erroresDireccion.length > 0) {
                mostrarErroresPorNombre(this, 'direccion', erroresDireccion);
                hasErrors = true;
            }
        }
        
        if (imagen && imagen.files && imagen.files[0]) {
            const erroresImagen = validarImagen(imagen);
            if (erroresImagen.length > 0) {
                let errorDiv = imagen.parentElement.querySelector('.error-message');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.style.color = '#ef4444';
                    errorDiv.style.fontSize = '0.85rem';
                    errorDiv.style.marginTop = '5px';
                    imagen.parentElement.appendChild(errorDiv);
                }
                errorDiv.innerHTML = erroresImagen.join('<br>');
                hasErrors = true;
            }
        }
        
        if (hasErrors) {
            e.preventDefault();
            return false;
        }
    });

    function mostrarErroresPorNombre(form, nombreCampo, errores) {
        const campo = form.querySelector(`[name="${nombreCampo}"]`);
        if (!campo) return;
        
        let errorDiv = campo.parentElement.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = '#ef4444';
            errorDiv.style.fontSize = '0.85rem';
            errorDiv.style.marginTop = '5px';
            campo.parentElement.appendChild(errorDiv);
        }
        
        if (errores.length > 0) {
            errorDiv.innerHTML = errores.join('<br>');
            campo.style.borderColor = '#ef4444';
        } else {
            errorDiv.innerHTML = '';
            campo.style.borderColor = '';
        }
    }
});

/* MODAL PARA EDITA*/

function abrirModalEditar(id) {
    const modal = document.getElementById('modalEdit');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <div style="color:white; padding:20px; text-align:center;">
                <i class="fas fa-spinner fa-spin"></i> Cargando datos del proveedor...
            </div>
        </div>`;

    const urlEditar = `/vistas/proveedores/editar/${id}/`;

    fetch(urlEditar, {
        method: 'GET',
        headers: { 'Accept': 'text/html' }
    })
    .then(response => response.text().then(html => ({ ok: response.ok, html })))
    .then(({ok, html}) => {
       
        modal.innerHTML = html;

        if (ok) {
            const form = modal.querySelector('#formEditarProveedor');
            if (form) {
                form.action = urlEditar;
                console.log("Action inyectado en Proveedor:", form.action);
                
                const nombreInput = form.querySelector('input[name="nombre"]');
                const telefonoInput = form.querySelector('input[name="telefono"]');
                const direccionInput = form.querySelector('input[name="direccion"]');
                
                if (nombreInput) {
                    nombreInput.addEventListener('blur', function() {
                        const errores = validarNombre(this.value);
                        mostrarErroresPorElemento(this, errores);
                    });
                }
                
                if (telefonoInput) {
                    telefonoInput.addEventListener('blur', function() {
                        this.value = this.value.replace(/[^\d]/g, '');
                        const errores = validarTelefono(this.value);
                        mostrarErroresPorElemento(this, errores);
                    });
                    telefonoInput.addEventListener('input', function() {
                        this.value = this.value.replace(/[^\d]/g, '');
                    });
                }
                
                if (direccionInput) {
                    direccionInput.addEventListener('blur', function() {
                        const errores = validarDireccion(this.value);
                        mostrarErroresPorElemento(this, errores);
                    });
                }
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        modal.innerHTML = '<div class="modal-content"><div style="color:#ef4444; padding:20px;">Error al conectar con el servidor.</div></div>';
    });
}

function validarNombre(nombre) {
    const errores = [];
    if (!nombre || nombre.trim() === '') {
        errores.push('El nombre es requerido');
    } else {
        const nombreTrimmed = nombre.trim();
        if (nombreTrimmed.length < 3) {
            errores.push('El nombre debe tener al menos 3 caracteres');
        }
        if (nombreTrimmed.length > 100) {
            errores.push('El nombre no puede exceder 100 caracteres');
        }
        if (!/^[a-zA-Z0-9\s]+$/.test(nombreTrimmed)) {
            errores.push('El nombre solo puede contener letras, números y espacios');
        }
    }
    return errores;
}

function validarTelefono(telefono) {
    const errores = [];
    if (!telefono || telefono.trim() === '') {
        errores.push('El teléfono es requerido');
    } else {
        const tel = telefono.trim();
        if (!/^\d+$/.test(tel)) {
            errores.push('El teléfono solo debe contener números');
        } else if (tel.length !== 10) {
            errores.push('El teléfono debe tener exactamente 10 dígitos');
        }
    }
    return errores;
}

function validarDireccion(direccion) {
    const errores = [];
    if (!direccion || direccion.trim() === '') {
        errores.push('La dirección es requerida');
    } else {
        const dirTrimmed = direccion.trim();
        if (dirTrimmed.length < 10) {
            errores.push('La dirección debe tener al menos 10 caracteres');
        }
        if (dirTrimmed.length > 200) {
            errores.push('La dirección no puede exceder 200 caracteres');
        }
    }
    return errores;
}

function mostrarErroresPorElemento(elemento, errores) {
    if (!elemento) return;
    
    let errorDiv = elemento.parentElement.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '5px';
        elemento.parentElement.appendChild(errorDiv);
    }
    
    if (errores.length > 0) {
        errorDiv.innerHTML = errores.join('<br>');
        elemento.style.borderColor = '#ef4444';
    } else {
        errorDiv.innerHTML = '';
        elemento.style.borderColor = '';
    }
}

/* inactivar proveedor */

function abrirModalEliminar(id, nombre, urlImagen) {
    const modal = document.getElementById('modalConfirm');
    const txtNombre = document.getElementById('nombreConfirm');
    const imgModal = document.getElementById('imgConfirm');
    const form = document.getElementById('formConfirm');
    const btnSubmit = document.getElementById('btnConfirmSubmit');
    const title = document.getElementById('confirmTitle');

    if (title) title.textContent = "¿Deseas inactivar?";
    if (txtNombre) txtNombre.textContent = nombre;
    if (btnSubmit) {
        btnSubmit.textContent = "Inactivar";
        btnSubmit.style.backgroundColor = "#ef4444";
    }

    if (imgModal) {
        if (urlImagen && urlImagen !== 'None' && urlImagen !== '') {
            imgModal.src = urlImagen;
            imgModal.style.display = 'inline-block';
        } else {
            imgModal.style.display = 'none';
        }
    }

    if (form) {
        form.action = `/vistas/proveedores/eliminar/${id}/`;
        form.method = 'POST';
    }

    modal.style.display = 'flex';
}

/* Ver detalle*/
function abrirModalVer(nombre, imagen, telefono, direccion, estado) {
    const modal = document.getElementById('modalView');
    
    document.getElementById('viewNombre').innerText = nombre;
    document.getElementById('viewTelefono').innerText = telefono;
    document.getElementById('viewDireccion').innerText = direccion;
    
    const estadoElement = document.getElementById('viewEstado');
    estadoElement.innerText = estado;

    if (estado === 'Activo') {
        estadoElement.className = 'badge-activo';
    } else {
        estadoElement.className = 'badge-inactivo';
    }

    const img = document.getElementById('viewImagen');
    img.src = imagen ? imagen : 'ruta/a/tu/placeholder.png';

    abrirModal('modalView');
}

/* activar proveedor*/
function abrirModalActivar(id, nombre, urlImagen) {
    const modal = document.getElementById('modalConfirm');
    const txtNombre = document.getElementById('nombreConfirm');
    const imgModal = document.getElementById('imgConfirm');
    const form = document.getElementById('formConfirm');
    const btnSubmit = document.getElementById('btnConfirmSubmit');
    const title = document.getElementById('confirmTitle');

    if (title) title.textContent = "¿Deseas reactivar?";
    if (txtNombre) txtNombre.textContent = nombre;
    if (btnSubmit) {
        btnSubmit.textContent = "Reactivar";
        btnSubmit.style.backgroundColor = "#10b981";
    }

    if (imgModal) {
        if (urlImagen && urlImagen !== 'None' && urlImagen !== '') {
            imgModal.src = urlImagen;
            imgModal.style.display = 'inline-block';
        } else {
            imgModal.style.display = 'none';
        }
    }

    if (form) {
        form.action = `/vistas/proveedores/activar/${id}/`;
        form.method = 'POST';
    }

    modal.style.display = 'flex';
}
function cerrarToast(btn) {
    const $toast = $(btn).closest('.message');
    $toast.addClass('fade-out');
    setTimeout(() => { $toast.remove(); }, 400);
}


$(document).ready(function() {
    setTimeout(function() {
        $('.message').each(function() {
            cerrarToast($(this).find('.close-toast'));
        });
    }, 5000);
});
