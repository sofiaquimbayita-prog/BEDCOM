document.addEventListener("DOMContentLoaded", function () {
    const modal      = document.getElementById('form-modal-container');
    const form       = document.getElementById('event-form');
    const btnNuevo   = document.getElementById('btn-nueva-actividad');
    const statusBar  = document.querySelector('.modal-status-bar'); // Seleccionamos la barra del modal
    const categoryEl = document.getElementById('category');
    const modalTitle = document.getElementById('modal-form-title');

    // Mapa de colores (Debe coincidir con las variables del CSS)
    const coloresCat = {
        pago:      '#e74c3c', // Rojo
        compra:    '#f1c40f', // Amarillo
        pedido:    '#3498db', // Azul
        entrega:   '#2ecc71', // Verde (si se usa)
    };

    // Actualiza visualmente la barra lateral del modal según la categoría seleccionada
    function actualizarBarra(categoria) {
        if (statusBar) {
            statusBar.style.backgroundColor = coloresCat[categoria] || 'var(--brand)';
        }
    }

    // --- ABRIR MODAL PARA CREAR ---
    if (btnNuevo) {
        btnNuevo.onclick = () => {
            form.reset();
            document.getElementById('event-id').value = "";
            if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-calendar-plus"></i> Nueva Actividad';
            
            // Forzar color inicial (por defecto o el del select)
            actualizarBarra(categoryEl.value);
            modal.style.display = 'flex';
        };
    }

    // --- ABRIR MODAL PARA EDITAR ---
    // Usamos delegación o forEach para los botones de la lista
    document.querySelectorAll('.edit-trigger').forEach(btn => {
        btn.onclick = function () {
            const data = this.dataset;
            
            if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Actividad';
            
            // Llenar campos del formulario
            document.getElementById('event-id').value    = data.id;
            document.getElementById('title').value       = data.titulo;
            document.getElementById('date').value        = data.fecha;
            document.getElementById('time').value        = data.hora;
            document.getElementById('category').value    = data.categoria;
            document.getElementById('description').value = data.descripcion;
            
            actualizarBarra(data.categoria);
            modal.style.display = 'flex';
        };
    });

    // Cambiar color de la barra en tiempo real cuando el usuario cambia el select
    if (categoryEl) {
        categoryEl.addEventListener('change', () => actualizarBarra(categoryEl.value));
    }

    // --- CERRAR MODAL ---
    document.querySelectorAll('.close-modal-form, .btn-modal-cancelar').forEach(el => {
        el.onclick = () => {
            modal.style.display = 'none';
        };
    });

    // Cerrar si se hace click fuera del cuadro blanco (en el overlay)
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // --- GUARDAR (CREAR O EDITAR) ---
    form.onsubmit = function (e) {
        e.preventDefault();
        const id  = document.getElementById('event-id').value;
        
        // Definir URL: si hay ID editamos, si no, creamos
        const url = id 
            ? `/vistas/calendario/editar/${id}/` 
            : '/vistas/calendario/crear/';

        const formData = new FormData(this);

        fetch(url, {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        })
        .then(response => {
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                location.reload(); // Recargar para ver los cambios
            } else {
                alert("Error: " + (data.message || "No se pudo guardar"));
            }
        })
        .catch(error => {
            console.error("Error fatal:", error);
            alert("Ocurrió un error al procesar la solicitud.");
        });
    };

    // --- ELIMINAR ACTIVIDAD ---
    document.querySelectorAll('.delete-trigger').forEach(btn => {
        btn.onclick = function () {
            const id = this.dataset.id;
            if (confirm("¿Estás seguro de que deseas eliminar esta actividad de Bedcom?")) {
                fetch(`/vistas/calendario/eliminar/${id}/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCookie('csrftoken') }
                })
                .then(r => r.json())
                .then(data => {
                    if (data.status === 'success') {
                        location.reload();
                    } else {
                        alert("Error al eliminar");
                    }
                });
            }
        };
    });

    // --- HELPER: OBTENER CSRF TOKEN ---
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
    // ─── DRAWER DE DETALLE ─────────────────────────────
    const drawer         = document.getElementById('detail-drawer');
    const drawerOverlay  = document.getElementById('detail-drawer-overlay');
    const drawerClose    = document.getElementById('drawer-close-btn');
    const drawerAccent   = document.getElementById('drawer-accent-bar');
    const drawerCatPill  = document.getElementById('drawer-cat-pill');
    const drawerCatText  = document.getElementById('drawer-cat-text');
    const drawerActionEdit = document.getElementById('drawer-action-edit');
    const drawerActionDone = document.getElementById('drawer-action-done');

    // Colores de acento por categoría
    const coloresDrawer = {
        pago:    '#e74c3c',
        compra:  '#f1c40f',
        pedido:  '#3498db',
        entrega: '#27ae60',
    };

    let currentDrawerData = {};

    function openDrawer(data) {
        currentDrawerData = data;
        const color = coloresDrawer[data.categoria] || 'var(--info)';

        // Aplicar color de acento
        drawerAccent.style.background = color;
        drawer.style.setProperty('--color-cat-drawer', color);
        drawerCatPill.style.color        = color;
        drawerCatPill.style.borderColor  = color;

        // Rellenar datos
        document.getElementById('drawer-cat-text').textContent     = data.categoriadisplay || data.categoria;
        document.getElementById('drawer-titulo').textContent        = data.titulo || '—';
        document.getElementById('drawer-fecha').textContent         = formatFecha(data.fechadisplay || data.fecha);
        document.getElementById('drawer-hora').textContent          = formatHora(data.hora);
        document.getElementById('drawer-descripcion').textContent   = data.descripcion || 'Sin descripción registrada.';

        // Borde izquierdo de la descripción
        document.getElementById('drawer-descripcion').style.borderLeftColor = color;

        // Abrir
        drawerOverlay.classList.add('is-open');
        drawer.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('is-open');
        drawerOverlay.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    function formatFecha(fechaStr) {
        if (!fechaStr) return '—';
        // Si viene en Y-m-d, reformateamos
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
            const [y, m, d] = fechaStr.split('-');
            const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            return `${parseInt(d)} ${meses[parseInt(m)-1]} ${y}`;
        }
        return fechaStr;
    }

    function formatHora(horaStr) {
        if (!horaStr) return '—';
        const [h, m] = horaStr.split(':');
        const hNum = parseInt(h);
        const ampm = hNum >= 12 ? 'PM' : 'AM';
        const h12  = hNum % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    }

    // Botones de vista en las tarjetas
    document.querySelectorAll('.view-trigger').forEach(btn => {
        btn.onclick = function() {
            openDrawer(this.dataset);
        };
    });

    // Cerrar drawer
    if (drawerClose)   drawerClose.onclick   = closeDrawer;
    if (drawerOverlay) drawerOverlay.onclick  = closeDrawer;

    // Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeDrawer();
    });

    // Botón Editar dentro del drawer → abre el modal de edición
    if (drawerActionEdit) {
        drawerActionEdit.onclick = function() {
            closeDrawer();
            const d = currentDrawerData;
            if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Actividad';
            document.getElementById('event-id').value    = d.id;
            document.getElementById('title').value       = d.titulo;
            document.getElementById('date').value        = d.fecha;
            document.getElementById('time').value        = d.hora;
            document.getElementById('category').value    = d.categoria;
            document.getElementById('description').value = d.descripcion;
            actualizarBarra(d.categoria);
            modal.style.display = 'flex';
        };
    }

    // Botón Completar dentro del drawer → dispara el delete
    if (drawerActionDone) {
        drawerActionDone.onclick = function() {
            const id = currentDrawerData.id;
            if (!id) return;
            if (confirm('¿Marcar esta actividad como completada y eliminarla de la agenda?')) {
                closeDrawer();
                fetch(`/vistas/calendario/eliminar/${id}/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCookie('csrftoken') }
                })
                .then(r => r.json())
                .then(data => {
                    if (data.status === 'success') location.reload();
                    else alert('Error al eliminar');
                });
            }
        };
    }


});