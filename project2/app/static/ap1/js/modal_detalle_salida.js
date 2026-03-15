// Modal Detalle Salida JS - Formato Vertical Limpio
// Compatible con el proyecto SalidaP

(function() {
    'use strict';

    // Función para obtener token CSRF
    function getCsrfToken() {
        const tokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
        if (tokenElement) {
            return tokenElement.value;
        }

        // Fallback desde cookies
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            const value = eqPos > -1 ? cookie.substr(eqPos + 1) : '';
            if (name === 'csrftoken') {
                return decodeURIComponent(value);
            }
        }
        return '';
    }

    // Función toast de error (compatible con proyecto)
    function showErrorToast(message) {
        // Si existe función global del proyecto
        if (typeof window.showErrorToast === 'function') {
            window.showErrorToast(message);
            return;
        }

        // Toast nativo fallback
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        document.body.appendChild(toast);
        
        // Animación entrada
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto cerrar
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Controlador principal del modal
    const ModalController = {
        modalElement: null,

        init() {
            this.modalElement = document.getElementById('modalDetalleSalida');
            if (!this.modalElement) return;

            this.attachEvents();
        },

        attachEvents() {
            // Click en backdrop
            this.modalElement.addEventListener('click', (event) => {
                if (event.target === this.modalElement) {
                    this.close();
                }
            });

            // Tecla Escape
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && this.modalElement.classList.contains('show')) {
                    this.close();
                }
            });
        },

        open(salidaId) {
            if (!this.modalElement) {
                showErrorToast('Elemento modal no encontrado');
                return;
            }

            // Reset y mostrar
            this.reset();
            this.modalElement.classList.add('show');
            document.body.style.overflow = 'hidden';

            // Cargar datos
            this.fetchData(salidaId);
        },

        fetchData(id) {
            this.showLoading();

            fetch(`/vistas/salida/detalle/${id}/`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCsrfToken()
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.hideLoading();
                if (data.success && data.salida) {
                    this.fillData(data.salida);
                } else {
                    throw new Error(data.message || 'Respuesta inválida');
                }
            })
            .catch(error => {
                this.hideLoading();
                console.error('Error modal detalle:', error);
                showErrorToast('Error al cargar: ' + error.message);
            });
        },

        fillData(salida) {
            // Campos de texto
            const textFields = {
                'producto': salida.producto || '--',
                'cantidad': salida.cantidad || '--',
                'fecha': salida.fecha || '--',
                'motivo': salida.motivo || '--',
                'responsable': salida.responsable || '--'
            };

            Object.entries(textFields).forEach(([field, value]) => {
                const element = document.getElementById('detalle-' + field);
                if (element) {
                    element.textContent = value;
                }
            });

            // Estado con badge
            const estadoElement = document.getElementById('detalle-estado');
            if (estadoElement) {
                if (salida.estado === true || salida.estado === 'true') {
                    estadoElement.innerHTML = '<span class="badge badge-active"><i class="fas fa-check-circle"></i> Activo</span>';
                } else {
                    estadoElement.innerHTML = '<span class="badge badge-anulada"><i class="fas fa-ban"></i> Anulada</span>';
                }
            }
        },

        reset() {
            const fields = ['producto', 'cantidad', 'fecha', 'motivo', 'responsable', 'estado'];
            fields.forEach(fieldId => {
                const element = document.getElementById('detalle-' + fieldId);
                if (element) {
                    if (fieldId === 'estado') {
                        element.innerHTML = '';
                    } else {
                        element.textContent = '--';
                    }
                }
            });
        },

        showLoading() {
            const elements = document.querySelectorAll('#modalDetalleSalida .form-group p');
            elements.forEach(el => {
                el.textContent = 'Cargando...';
                el.classList.add('loading');
            });
        },

        hideLoading() {
            const elements = document.querySelectorAll('#modalDetalleSalida .form-group p.loading');
            elements.forEach(el => el.classList.remove('loading'));
        },

        close() {
            if (this.modalElement) {
                this.reset();
                this.modalElement.classList.remove('show');
                document.body.style.overflow = '';
            }
        }
    };

    // Inicializar cuando DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ModalController.init());
    } else {
        ModalController.init();
    }

    // Exponer funciones globales (para botones HTML)
    window.abrirModalDetalle = function(id) {
        ModalController.open(id);
    };

    window.cerrarModalDetalle = function() {
        ModalController.close();
    };

})();

