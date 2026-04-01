// ================= MODAL + LOADER =================
function abrirRespaldos() {

    const contenedor = document.getElementById('contenidoRespaldos');

    // Loader mientras carga
    contenedor.innerHTML = `
        <div class="text-center p-4">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2">Cargando módulo...</p>
        </div>
    `;

    fetch('/modal/respaldos/')
        .then(res => res.text())
        .then(html => {
            contenedor.innerHTML = html;
            activarJSRespaldos();
        })
        .catch(() => {
            mostrarToast('Error cargando el módulo', 'danger');
        });
}


// ================= FUNCIONALIDAD =================
function activarJSRespaldos() {
    console.log("🔥 activarJSRespaldos ejecutado");
    const input = document.getElementById('archivo-respaldo');

    if (!input) return;

    // Evitar eventos duplicados
    const nuevoInput = input.cloneNode(true);
    input.parentNode.replaceChild(nuevoInput, input);

    nuevoInput.addEventListener('change', function () {
        console.log("📂 archivo seleccionado");

        const archivo = this.files[0];
        if (!archivo) return;

        if (!archivo.name.endsWith('.sql')) {
            mostrarToast('Archivo inválido. Debe ser .sql', 'warning');
            this.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('archivo', archivo);

        mostrarLoaderBoton(this);

        fetch(URL_RESTAURAR, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        })
        .then(async response => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || 'Error en la restauración');
            }

            return data;
        })
        
        .then(data => {
            console.log("✅ RESPUESTA BACKEND:", data);

            if (data.error) {
                mostrarToast(data.error, 'danger');
            } else {
                mostrarToast(data.mensaje || 'Restauración exitosa', 'success');

                // Esperar antes de recargar
                setTimeout(() => {
                    location.reload();
                }, 5000);
            }
        })

        .catch(error => {
            mostrarToast(error.message, 'danger');
        })
        .finally(() => {
            quitarLoaderBoton();
        });

    });
}


// ================= TOAST =================
function mostrarToast(mensaje, tipo = 'success') {

    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${tipo} border-0 show mb-2`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${mensaje}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto"></button>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}


// ================= LOADER =================
function mostrarLoaderBoton(elemento) {
    elemento.disabled = true;
}

function quitarLoaderBoton() {
    // puedes mejorar esto si quieres targeting específico
}


// ================= CSRF =================
function getCSRFToken() {
    let cookieValue = null;
    const name = 'csrftoken';

    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            }
        });
    }

    return cookieValue;
}