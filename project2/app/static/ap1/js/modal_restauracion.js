// ================= MODAL + LOADER =================
function abrirRespaldos() {
    const contenedor = document.getElementById('contenidoRespaldos');

    contenedor.innerHTML = `
        <div class="text-center p-4">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2">Cargando modulo...</p>
        </div>
    `;

    fetch(URL_MODAL_RESPALDOS)
        .then(res => res.text())
        .then(html => {
            contenedor.innerHTML = html;
            activarJSRespaldos();
        })
        .catch(() => {
            mostrarToast('Error cargando el modulo de restauracion.', 'error');
        });
}

// ================= FUNCIONALIDAD =================
function activarJSRespaldos() {
    const input = document.getElementById('archivo-respaldo');
    const zonaCarga = document.getElementById('zona-carga');
    const nombreArchivo = document.getElementById('archivo-respaldo-nombre');
    const estado = document.getElementById('restauracion-estado');
    const barra = document.getElementById('restauracion-progress-bar');
    const porcentaje = document.getElementById('restauracion-porcentaje');
    const detalle = document.getElementById('restauracion-detalle');
    let progresoSimulado = null;

    if (!input) {
        return;
    }

    const nuevoInput = input.cloneNode(true);
    input.parentNode.replaceChild(nuevoInput, input);

    function actualizarProgreso(valor, mensaje, indeterminado = false) {
        if (!barra || !porcentaje || !detalle || !estado) {
            return;
        }

        const progreso = Math.max(0, Math.min(100, valor));
        estado.hidden = false;
        barra.style.width = `${progreso}%`;
        barra.classList.toggle('indeterminate', indeterminado);
        porcentaje.textContent = `${Math.round(progreso)}%`;
        detalle.textContent = mensaje;
        if (barra.parentElement) {
            barra.parentElement.setAttribute('aria-valuenow', String(Math.round(progreso)));
        }
    }

    function iniciarEstadoRestauracion(nombre) {
        if (zonaCarga) {
            zonaCarga.classList.add('restaurando');
        }

        nuevoInput.disabled = true;
        actualizarProgreso(5, `Preparando el archivo ${nombre} para restaurar la base de datos...`);
    }

    function iniciarSimulacionProcesamiento() {
        clearInterval(progresoSimulado);
        let progresoActual = 55;

        progresoSimulado = window.setInterval(() => {
            if (progresoActual >= 92) {
                clearInterval(progresoSimulado);
                actualizarProgreso(
                    92,
                    'Archivo cargado. Aplicando sentencias SQL y esperando confirmacion del servidor...',
                    true
                );
                return;
            }

            progresoActual += 4;
            actualizarProgreso(
                progresoActual,
                'Archivo cargado. Restaurando estructura y datos de la base de datos...'
            );
        }, 450);
    }

    function finalizarEstadoRestauracion() {
        clearInterval(progresoSimulado);
        progresoSimulado = null;

        if (zonaCarga) {
            zonaCarga.classList.remove('restaurando');
        }

        nuevoInput.disabled = false;
    }

    function reiniciarSelector(mensaje = 'Ningun archivo seleccionado') {
        nuevoInput.value = '';

        if (zonaCarga) {
            zonaCarga.classList.remove('archivo-seleccionado');
        }

        if (nombreArchivo) {
            nombreArchivo.textContent = mensaje;
        }
    }

    nuevoInput.addEventListener('change', function () {
        const archivo = this.files[0];

        if (!archivo) {
            reiniciarSelector();
            if (estado) {
                estado.hidden = true;
            }
            return;
        }

        if (!archivo.name.toLowerCase().endsWith('.sql')) {
            reiniciarSelector('Selecciona un archivo con extension .sql');
            mostrarToast('Archivo invalido. Debe tener extension .sql.', 'warning');
            return;
        }

        if (zonaCarga) {
            zonaCarga.classList.add('archivo-seleccionado');
        }

        if (nombreArchivo) {
            nombreArchivo.textContent = `Archivo seleccionado: ${archivo.name}`;
        }

        iniciarEstadoRestauracion(archivo.name);

        const formData = new FormData();
        formData.append('archivo', archivo);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', URL_RESTAURAR, true);
        xhr.setRequestHeader('X-CSRFToken', getCSRFToken());
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.upload.addEventListener('progress', function (evento) {
            if (!evento.lengthComputable) {
                actualizarProgreso(25, 'Subiendo el archivo SQL al servidor...');
                return;
            }

            const progresoCarga = Math.round((evento.loaded / evento.total) * 55);
            actualizarProgreso(
                progresoCarga,
                `Subiendo el archivo SQL al servidor... ${Math.round((evento.loaded / evento.total) * 100)}% del archivo enviado.`
            );
        });

        xhr.upload.addEventListener('load', function () {
            actualizarProgreso(60, 'Archivo cargado. Iniciando restauracion en el servidor...');
            iniciarSimulacionProcesamiento();
        });

        xhr.addEventListener('loadstart', function () {
            actualizarProgreso(10, 'Iniciando la transferencia del respaldo...');
        });

        xhr.addEventListener('load', function () {
            clearInterval(progresoSimulado);

            let data = {};

            try {
                data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            } catch (error) {
                data = {};
            }

            if (xhr.status >= 200 && xhr.status < 300 && !data.error) {
                actualizarProgreso(100, data.mensaje || 'Base de datos restaurada correctamente.');
                mostrarToast(data.mensaje || 'Restauracion completada correctamente.', 'success');

                window.setTimeout(() => {
                    if (typeof cerrarModal === 'function') {
                        cerrarModal('generarModal');
                    }
                    window.location.reload();
                }, 1800);
                return;
            }

            const mensajeError = data.error || data.mensaje || 'No fue posible restaurar la base de datos.';
            actualizarProgreso(100, mensajeError);
            mostrarToast(mensajeError, 'error');
            reiniciarSelector(`Ultimo intento: ${archivo.name}`);
        });

        xhr.addEventListener('error', function () {
            clearInterval(progresoSimulado);
            actualizarProgreso(100, 'Se perdio la comunicacion con el servidor durante la restauracion.');
            mostrarToast('Se perdio la comunicacion con el servidor durante la restauracion.', 'error');
            reiniciarSelector(`Ultimo intento: ${archivo.name}`);
        });

        xhr.addEventListener('loadend', function () {
            finalizarEstadoRestauracion();
        });

        xhr.send(formData);
    });
}

// ================= TOAST =================
function mostrarToast(mensaje, tipo = 'success') {
    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    let contenedor = document.getElementById('toast-container');

    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'toast-container';
        contenedor.className = 'messages-container';
        document.body.appendChild(contenedor);
    }

    const tipoVisual = ['success', 'error', 'warning', 'info'].includes(tipo) ? tipo : 'info';
    const toast = document.createElement('div');
    toast.className = `message ${tipoVisual}`;
    toast.innerHTML = `
        <div class="message-content">
            <i class="fas ${iconos[tipoVisual]}"></i>
            <span class="text"></span>
        </div>
        <button type="button" class="close-toast" aria-label="Cerrar notificacion">
            <i class="fas fa-times"></i>
        </button>
    `;

    toast.querySelector('.text').textContent = mensaje;
    toast.querySelector('.close-toast').addEventListener('click', function () {
        toast.remove();
    });

    contenedor.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 5000);
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
