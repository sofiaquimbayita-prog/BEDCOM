/* ==================================================
   script_proveedores.js - Lógica de Proveedores BedCom
   ================================================== */

$(document).ready(function() {
    
    // 1. FILTRADO POR ESTADO (ACTIVO/INACTIVO) PARA GRID DE CARDS
    // Esta función emula el comportamiento de búsqueda de DataTables pero para el diseño de tarjetas
    function filtrarProveedores() {
        const mostrarInactivos = $('#toggleInactivos').is(':checked');
        
        $('.card.provider').each(function() {
            // Verificamos si la tarjeta tiene la clase 'inactive-card'
            const esInactivo = $(this).hasClass('inactive-card');
            
            if (mostrarInactivos) {
                // Switch activado: mostrar solo los que tienen la clase de inactivo
                if (esInactivo) {
                    $(this).fadeIn(300).removeClass('d-none');
                } else {
                    $(this).hide().addClass('d-none');
                }
            } else {
                // Switch desactivado: mostrar solo los que NO son inactivos (activos)
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

    // 2. CONTROL DE MODALES BÁSICOS
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
});

/* ==================================================
   3. FUNCIÓN MAESTRA: ABRIR MODAL PARA EDITAR
   ================================================== */
function abrirModalEditar(id) {
    const modal = document.getElementById('modalEdit');
    modal.style.display = 'flex';
    
    // Spinner de carga
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
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        modal.innerHTML = '<div class="modal-content"><div style="color:#ef4444; padding:20px;">Error al conectar con el servidor.</div></div>';
    });
}

/* ==================================================
   4. FUNCIÓN PARA INACTIVAR PROVEEDOR
   ================================================== */
function abrirModalEliminar(id, nombre, urlImagen) {
    const modal = document.getElementById('modalConfirm'); // Usando tu ID de modal de confirmación
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

/* ==================================================
   5. FUNCIÓN VER DETALLES (ESTILO PRODUCTO)
   ================================================== */
function abrirModalVer(nombre, imagen, telefono, direccion, estado) {
    const modal = document.getElementById('modalView');
    
    document.getElementById('viewNombre').innerText = nombre;
    document.getElementById('viewTelefono').innerText = telefono;
    document.getElementById('viewDireccion').innerText = direccion;
    
    const estadoElement = document.getElementById('viewEstado');
    estadoElement.innerText = estado;

    // Cambiar color del badge dinámicamente
    if (estado === 'Activo') {
        estadoElement.className = 'badge-activo';
    } else {
        estadoElement.className = 'badge-inactivo';
    }

    // Imagen
    const img = document.getElementById('viewImagen');
    img.src = imagen ? imagen : 'ruta/a/tu/placeholder.png';

    abrirModal('modalView');
}

/* ==================================================
   6. FUNCIÓN PARA ACTIVAR PROVEEDOR
   ================================================== */
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
        const toast = btn.closest('.message');
        toast.classList.add('fade-out');
        setTimeout(() => { toast.remove(); }, 400);
    }

    $(document).ready(function() {
        setTimeout(function() {
            $('.message').each(function() {
                cerrarToast($(this).find('.close-toast'));
            });
        }, 5000);
    });