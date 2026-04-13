// ═══════════════════════════════════════════════════════
// VALIDACIONES EN TIEMPO REAL - MÓDULO CLIENTES
// ═══════════════════════════════════════════════════════

class ClienteValidator {
    constructor() {
        this.errors = {};
        this.initValidations();
    }

    initValidations() {
        this.setupNombreValidation();
        this.setupTelefonoValidation();
        this.setupDireccionValidation();
        this.setupPagoMontoValidation();
    }

    // ═══════════════════════════════════════════════════════
    // VALIDACIÓN DE NOMBRE
    // ═══════════════════════════════════════════════════════
    setupNombreValidation() {
        const nombreInput = document.getElementById('fNombre');
        if (!nombreInput) return;

        // Crear contenedor de error
        const errorDiv = this.createErrorElement('nombre-error');
        nombreInput.parentNode.appendChild(errorDiv);

        // Agregar contador de caracteres
        const counterSpan = document.createElement('span');
        counterSpan.className = 'char-counter';
        counterSpan.style.cssText = 'font-size: 0.7rem; color: var(--color-texto-muted); float: right;';
        nombreInput.parentNode.appendChild(counterSpan);

        nombreInput.addEventListener('input', (e) => {
            const valor = e.target.value.trim();
            counterSpan.textContent = `${valor.length}/100`;
            
            // Validaciones
            if (valor.length === 0) {
                this.showError('nombre-error', '');
                nombreInput.classList.remove('input-error', 'input-success');
            } else if (valor.length < 3) {
                this.showError('nombre-error', ' El nombre debe tener al menos 3 caracteres');
                nombreInput.classList.add('input-error');
                nombreInput.classList.remove('input-success');
            } else if (valor.length > 100) {
                this.showError('nombre-error', ' El nombre no puede exceder 100 caracteres');
                nombreInput.classList.add('input-error');
                nombreInput.classList.remove('input-success');
            } else if (/^\d+$/.test(valor)) {
                this.showError('nombre-error', ' El nombre no puede contener solo números');
                nombreInput.classList.add('input-error');
                nombreInput.classList.remove('input-success');
            } else if (/[<>{}[\]$%&#]/.test(valor)) {
                this.showError('nombre-error', ' El nombre contiene caracteres no permitidos ([<>{}[\]$%&#])');
                nombreInput.classList.add('input-error');
                nombreInput.classList.remove('input-success');
            } else {
                this.showError('nombre-error', ' Nombre válido');
                nombreInput.classList.add('input-success');
                nombreInput.classList.remove('input-error');
                
                // Verificar duplicados con debounce
                this.checkDuplicateWithDebounce(valor);
            }
        });
    }

    // ═══════════════════════════════════════════════════════
    // VALIDACIÓN DE TELÉFONO
    // ═══════════════════════════════════════════════════════
    setupTelefonoValidation() {
        const telefonoInput = document.getElementById('fTelefono');
        if (!telefonoInput) return;

        const errorDiv = this.createErrorElement('telefono-error');
        telefonoInput.parentNode.appendChild(errorDiv);

        telefonoInput.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, ''); // Solo dígitos
            
            // Limitar a 10 dígitos
            if (valor.length > 10) {
                valor = valor.slice(0, 10);
            }
            
            // Formatear: 300 123 4567
            if (valor.length >= 7) {
                valor = valor.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
            } else if (valor.length >= 4) {
                valor = valor.replace(/(\d{3})(\d{3})/, '$1 $2');
            }
            
            e.target.value = valor;
            const soloDigitos = valor.replace(/\D/g, '');
            
            if (soloDigitos.length === 0) {
                this.showError('telefono-error', '');
                telefonoInput.classList.remove('input-error', 'input-success');
            } else if (soloDigitos.length < 10) {
                this.showError('telefono-error', ` Faltan ${10 - soloDigitos.length} dígitos`);
                telefonoInput.classList.add('input-error');
                telefonoInput.classList.remove('input-success');
            } else if (soloDigitos.length === 10) {
                this.showError('telefono-error', ' Teléfono válido');
                telefonoInput.classList.add('input-success');
                telefonoInput.classList.remove('input-error');
            }
        });

        // Prevenir entrada de letras
        telefonoInput.addEventListener('keypress', (e) => {
            if (!/[\d]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                e.preventDefault();
            }
        });
    }

    // ═══════════════════════════════════════════════════════
    // VALIDACIÓN DE DIRECCIÓN
    // ═══════════════════════════════════════════════════════
    setupDireccionValidation() {
        const direccionInput = document.getElementById('fDireccion');
        if (!direccionInput) return;

        const errorDiv = this.createErrorElement('direccion-error');
        direccionInput.parentNode.appendChild(errorDiv);

        direccionInput.addEventListener('input', (e) => {
            const valor = e.target.value.trim();
            
            if (valor.length === 0) {
                this.showError('direccion-error', '');
                direccionInput.classList.remove('input-error', 'input-success');
            } else if (valor.length < 5) {
                this.showError('direccion-error', ' La dirección debe tener al menos 5 caracteres');
                direccionInput.classList.add('input-error');
                direccionInput.classList.remove('input-success');
            } else if (valor.length > 200) {
                this.showError('direccion-error', ' La dirección no puede exceder 200 caracteres');
                direccionInput.classList.add('input-error');
                direccionInput.classList.remove('input-success');
            } else if (/^\s*$/.test(valor)) {
                this.showError('direccion-error', ' La dirección no puede contener solo espacios');
                direccionInput.classList.add('input-error');
                direccionInput.classList.remove('input-success');
            } else {
                this.showError('direccion-error', ' Dirección válida');
                direccionInput.classList.add('input-success');
                direccionInput.classList.remove('input-error');
            }
        });
    }

    // ═══════════════════════════════════════════════════════
    // VALIDACIÓN DE MONTO DE PAGO
    // ═══════════════════════════════════════════════════════
    setupPagoMontoValidation() {
        const montoInput = document.getElementById('pagoMonto');
        if (!montoInput) return;

        montoInput.addEventListener('input', (e) => {
            let valor = e.target.value;
            
            // Permitir solo números y un punto decimal
            valor = valor.replace(/[^\d.]/g, '');
            
            // Asegurar solo un punto decimal
            const partes = valor.split('.');
            if (partes.length > 2) {
                valor = partes[0] + '.' + partes.slice(1).join('');
            }
            
            // Limitar a 2 decimales
            if (partes.length === 2 && partes[1].length > 2) {
                valor = partes[0] + '.' + partes[1].slice(0, 2);
            }
            
            e.target.value = valor;
            
            // Validar contra el pendiente
            const monto = parseFloat(valor);
            if (window.pedidoPagoPendiente && monto > window.pedidoPagoPendiente) {
                montoInput.style.borderColor = 'var(--color-inactivar)';
                this.showToast('El monto no puede superar el saldo pendiente', 'error');
            } else {
                montoInput.style.borderColor = '';
            }
        });
    }

    // ═══════════════════════════════════════════════════════
    // VERIFICACIÓN DE DUPLICADOS (con debounce)
    // ═══════════════════════════════════════════════════════
    checkDuplicateWithDebounce(nombre) {
        clearTimeout(this.duplicateTimeout);
        this.duplicateTimeout = setTimeout(() => {
            this.checkDuplicate(nombre);
        }, 500);
    }

    async checkDuplicate(nombre) {
        if (!nombre || nombre.length < 3) return;
        
        const telefono = document.getElementById('fTelefono')?.value.replace(/\D/g, '') || '';
        
        try {
            const response = await fetch(`/vistas/clientes/verificar-duplicado/?nombre=${encodeURIComponent(nombre)}&telefono=${telefono}`);
            const data = await response.json();
            
            if (data.existe) {
                this.showError('nombre-error', ' Ya existe un cliente con este nombre y teléfono');
                document.getElementById('fNombre').classList.add('input-error');
                document.getElementById('fNombre').classList.remove('input-success');
            }
        } catch (error) {
            console.error('Error verificando duplicado:', error);
        }
    }

    // ═══════════════════════════════════════════════════════
    // UTILIDADES
    // ═══════════════════════════════════════════════════════
    createErrorElement(id) {
        const div = document.createElement('div');
        div.id = id;
        div.style.cssText = 'font-size: 0.75rem; margin-top: 4px; min-height: 20px;';
        return div;
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.color = message.includes('OK') ? 'var(--color-exito)' : 'var(--color-inactivar)';
        }
    }

    showToast(msg, tipo = 'error') {
        // Usar la función showToast existente si está disponible
        if (typeof window.showToast === 'function') {
            window.showToast(msg, tipo);
        }
    }
}

// ═══════════════════════════════════════════════════════
// VALIDACIÓN ANTES DE GUARDAR
// ═══════════════════════════════════════════════════════
function validarFormularioCliente() {
    const nombre = document.getElementById('fNombre')?.value.trim() || '';
    const telefono = document.getElementById('fTelefono')?.value.replace(/\D/g, '') || '';
    
    const errores = [];
    
    if (!nombre) {
        errores.push('El nombre es obligatorio');
    } else if (nombre.length < 3) {
        errores.push('El nombre debe tener al menos 3 caracteres');
    } else if (/^\d+$/.test(nombre)) {
        errores.push('El nombre no puede contener solo números');
    }
    
    if (telefono && telefono.length !== 10) {
        errores.push('El teléfono debe tener 10 dígitos');
    }
    
    return {
        valido: errores.length === 0,
        errores: errores
    };
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.clienteValidator = new ClienteValidator();
});

// Exportar para uso global
window.validarFormularioCliente = validarFormularioCliente;