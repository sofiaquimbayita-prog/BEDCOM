/**
 * ENTRADA DE PRODUCTOS - JavaScript
 * Funcionalidad para gestión de entradas de productos
 */

// Funciones globales para compatibilidad con el HTML
window.abrirModalEliminar = abrirModalEliminar;
window.abrirModalVer = abrirModalVer;
window.abrirModalReactivar = abrirModalReactivar;
window.cerrarModal = cerrarModal;
window.mostrarMensaje = mostrarMensaje;
window.cerrarToast = cerrarToast;
window.mostrarStockActual = mostrarStockActual;
window.calcularNuevoStock = calcularNuevoStock;

/**
 * Abre el modal de edición con los datos de la entrada
 */
function abrirModalEditar(id) {
    $('#edit_id').val(id);
    
    $.ajax({
        url: '/vistas/entrada_p/obtener/' + id + '/',
        type: 'GET',
        success: function(data) {
            $('#edit_id').val(data.id);
            $('#edit_producto').val(data.producto_id);
            $('#edit_cantidad').val(data.cantidad);
            $('#edit_precio').val(data.precio_unitario);
            $('#edit_observaciones').val(data.observaciones || '');
            
            // Calcular total
            const total = data.cantidad * data.precio_unitario;
            $('#edit_total').val('$' + total.toFixed(2));
        },
        error: function() {
            mostrarMensaje('error', 'Error al cargar los datos de la entrada');
        }
    });
    
    $('#modalEdit').css('display', 'flex');
    $('body').css('overflow', 'hidden');
}

/**
 * Abre el modal de eliminación
 */
function abrirModalEliminar(id, nombre) {
    $('#delete_entrada_id').val(id);
    $('#delete_entrada_nombre').text('Producto: ' + nombre);
    $('#modalDelete').css('display', 'flex');
    $('body').css('overflow', 'hidden');
}

/**
 * Abre el modal de ver detalle
 */
function abrirModalVer(id) {
    $.ajax({
        url: '/vistas/entrada_p/obtener/' + id + '/',
        type: 'GET',
        success: function(data) {
            $('#view_id').text('#' + data.id);
            $('#view_fecha').text(data.fecha);
            $('#view_producto').text(data.producto);
            $('#view_cantidad').text(data.cantidad + ' unidades');
            $('#view_precio').text('$' + data.precio_unitario.toFixed(2));
            $('#view_total').text('$' + data.total.toFixed(2));
            $('#view_usuario').text(data.usuario);
            $('#view_observaciones').text(data.observaciones || 'Sin observaciones');
        },
        error: function() {
            mostrarMensaje('error', 'Error al cargar los datos de la entrada');
        }
    });
    
    $('#modalView').css('display', 'flex');
    $('body').css('overflow', 'hidden');
}

/**
 * Cierra un modal específico
 */
function cerrarModal(modalId) {
    $('#' + modalId).css('display', 'none');
    $('body').css('overflow', 'auto');
}

/**
 * Muestra un mensaje toast
 */
function mostrarMensaje(tipo, texto) {
    const container = $('#toast-container');
    if (container.length === 0) {
        $('body').append('<div class="messages-container" id="toast-container"></div>');
    }
    
    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const mensaje = `
        <div class="message ${tipo}">
            <div class="message-content">
                <i class="fas ${iconos[tipo] || iconos.info}"></i>
                <span class="text">${texto}</span>
            </div>
            <button type="button" class="close-toast" onclick="cerrarToast(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    $('#toast-container').append(mensaje);
    
    // Auto cerrar después de 5 segundos
    setTimeout(function() {
        $('.message').last().fadeOut(300, function() {
            $(this).remove();
        });
    }, 5000);
}

/**
 * Cierra un toast específico
 */
function cerrarToast(btn) {
    const message = $(btn).closest('.message');
    message.fadeOut(300, function() {
        $(this).remove();
    });
}

/**
 * Muestra el stock actual del producto seleccionado
 */
function mostrarStockActual() {
    const selectProducto = document.getElementById('producto');
    const stockActual = document.getElementById('stock-actual');
    const selectedOption = selectProducto.options[selectProducto.selectedIndex];
    const stock = selectedOption.getAttribute('data-stock') || 0;
    stockActual.textContent = stock;
    calcularNuevoStock();
}

/**
 * Calcula el nuevo stock
 */
function calcularNuevoStock() {
    const selectProducto = document.getElementById('producto');
    const cantidadInput = document.getElementById('cantidad');
    const nuevoStock = document.getElementById('nuevo-stock');
    
    if (!selectProducto || !cantidadInput || !nuevoStock) return;
    
    const selectedOption = selectProducto.options[selectProducto.selectedIndex];
    const stockActual = parseInt(selectedOption.getAttribute('data-stock')) || 0;
    const cantidad = parseInt(cantidadInput.value) || 0;
    
    nuevoStock.textContent = stockActual + cantidad;
}

/**
 * Abre el modal de reactivar entrada
 */
function abrirModalReactivar(id, nombre) {
    $('#reactivate_entrada_id').val(id);
    $('#reactivate_entrada_nombre').text('Producto: ' + nombre);
    $('#modalReactivate').css('display', 'flex');
    $('body').css('overflow', 'hidden');
}

/**
 * AJAX Global para Anular Entrada
 */
function ejecutarAnular(entradaId) {
    console.log('🔴 Anular entrada ID:', entradaId);
    const csrftoken = getCSRFToken();
    const $btn = $('#btnConfirmarAnular');
    const originalText = $btn.html();
    
    $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Anulando...');
    
    $.ajax({
        url: `/vistas/entrada_p/eliminar/${entradaId}/`,
        type: 'POST',
        headers: { 'X-CSRFToken': csrftoken },
        data: { id: entradaId },
        success: (response) => {
            console.log('✅ Anular success:', response);
            if (response.success) {
                mostrarMensaje('success', response.message || 'Entrada anulada');
                cerrarModal('modalDelete');
                if (window.recargarTabla) recargarTabla();
                else location.reload();
            } else {
                mostrarMensaje('error', response.message || 'Error desconocido');
            }
        },
        error: (xhr) => {
            console.error('❌ Anular error:', xhr.status, xhr.responseText);
            const msg = xhr.status === 403 ? 'Error CSRF - Recarga página' : 'Error servidor';
            mostrarMensaje('error', msg);
        },
        complete: () => {
            $btn.prop('disabled', false).html(originalText);
        }
    });
}

/**
 * AJAX Global para Reactivar Entrada
 */
function ejecutarReactivar(entradaId) {
    console.log('🟢 Reactivar entrada ID:', entradaId);
    const csrftoken = getCSRFToken();
    const $btn = $('.btn-delete[style*="22c55e"]'); // Reactivar button
    const originalText = $btn.html();
    
    $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Reactivando...');
    
    $.ajax({
        url: `/vistas/entrada_p/reactivar/${entradaId}/`,
        type: 'POST',
        headers: { 'X-CSRFToken': csrftoken },
        data: { id: entradaId },
        success: (response) => {
            console.log('✅ Reactivar success:', response);
            if (response.success) {
                mostrarMensaje('success', response.message || 'Entrada reactivada');
                cerrarModal('modalReactivate');
                if (window.recargarTabla) recargarTabla();
                else location.reload();
            } else {
                mostrarMensaje('error', response.message || 'Error desconocido');
            }
        },
        error: (xhr) => {
            console.error('❌ Reactivar error:', xhr.status, xhr.responseText);
            const msg = xhr.status === 403 ? 'Error CSRF - Recarga página' : 'Error servidor';
            mostrarMensaje('error', msg);
        },
        complete: () => {
            $btn.prop('disabled', false).html(originalText);
        }
    });
}

/**
 * Obtener CSRF Token from cookie (global)
 */
function getCSRFToken() {
    let token = null;
    if (document.cookie) {
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') token = decodeURIComponent(value);
        });
    }
    console.log('🔑 CSRF Token:', token ? 'Found' : 'Missing');
    return token;
}

// =====================================================
// INICIALIZACIÓN ADICIONAL - Logout y notificaciones + MODAL HANDLERS
// =====================================================

document.addEventListener("DOMContentLoaded", function() {
  
  // ============================
  // MODAL LOGOUT - Funciones globales
  // ============================
  
  // Hacer las funciones accesibles globalmente
  window.abrirModalLogout = function() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
      modal.classList.remove('oculto');
      console.log('Modal abierto');
    }
  };
  
  window.cerrarModalLogout = function() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
      modal.classList.add('oculto');
      console.log('Modal cerrado');
    }
  };

  // ============================
  // TOAST NOTIFICATIONS
  // ============================
  
  // Función para cerrar toast
  window.cerrarToast = function(btn) {
    const toast = btn.closest('.message');
    if (toast) {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  };

  // Agregar animación de salida
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Auto-cerrar toast después de 5 segundos
  const toasts = document.querySelectorAll('.message');
  toasts.forEach(toast => {
    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
          toast.remove();
        }, 300);
      }
    }, 5000);
  });

  // PERFIL Y LOGOUT - with null checks
  const perfilBtn = document.getElementById("perfilBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (perfilBtn && dropdownMenu) {
    perfilBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("oculto");
    });
  }

  // Cerrar el dropdown si se hace clic fuera de él
  document.addEventListener("click", (e) => {
    if (dropdownMenu && !dropdownMenu.contains(e.target) && 
        perfilBtn && !perfilBtn.contains(e.target)) {
      dropdownMenu.classList.add("oculto");
    }
  });

  // =====================
  // MODAL DE CONFIRMACIÓN - with null check
  // =====================
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Verificar si ya existe un modal
      const modalExistente = document.querySelector('.modal-confirmacion');
      if (modalExistente) {
        return;
      }
      
      // Crear el modal
      const modal = document.createElement('div');
      modal.className = 'modal-confirmacion';
      modal.innerHTML = `
        <div class="modal-confirmacion-overlay"></div>
        <div class="modal-confirmacion-content">
          <div class="modal-confirmacion-header">
            <i class="fas fa-sign-out-alt"></i>
            <h2>Cerrar Sesión</h2>
          </div>
          <p class="modal-confirmacion-mensaje">¿Está seguro que desea cerrar sesión?</p>
          <div class="modal-confirmacion-botones">
            <button type="button" class="btn-cancelar" id="btnCancelarLogout">Cancelar</button>
            <button type="button" class="btn-confirmar" id="btnConfirmarLogout">Sí, cerrar sesión</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Agregar estilos
      if (!document.getElementById('modal-confirmacion-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-confirmacion-styles';
        styles.textContent = `
          .modal-confirmacion { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px 10px; }
          .modal-confirmacion-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); }
          .modal-confirmacion-content { position: relative; background: #0f172a !important; color: #ffffff !important; border-radius: 15px !important; padding: 30px !important; max-width: 400px !important; width: 90% !important; border: 1px solid #334155 !important; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6) !important; animation: modalFadeIn 0.3s ease-out; text-align: center; }
          @keyframes modalFadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
          .modal-confirmacion-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 15px; }
          .modal-confirmacion-header i { font-size: 3rem; color: #ef4444; margin-bottom: 12px; }
          .modal-confirmacion-header h2 { margin: 0; font-size: 1.5rem; color: #ef4444; font-weight: 600; }
          .modal-confirmacion-mensaje { margin: 0 0 25px; font-size: 15px; color: #94a3b8; line-height: 1.6; }
          .modal-confirmacion-botones { display: flex; gap: 10px; justify-content: center; }
          .modal-confirmacion-botones button { padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s ease; flex: 1; }
          .btn-cancelar { background: #1f6684 !important; color: white; }
          .btn-cancelar:hover { background: #165e7a !important; }
          .btn-confirmar { background: #ef4444; color: white; }
          .btn-confirmar:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }
        `;
        document.head.appendChild(styles);
      }
      
      // Botón cancelar
      const btnCancelar = document.getElementById('btnCancelarLogout');
      if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
          modal.remove();
        });
      }
      
      // Botón confirmar
      const btnConfirmar = document.getElementById('btnConfirmarLogout');
      if (btnConfirmar) {
        btnConfirmar.addEventListener('click', function() {
          window.location.href = '/logout/';
        });
      }
      
      // Cerrar al hacer clic en el overlay
      const overlay = modal.querySelector('.modal-confirmacion-overlay');
      if (overlay) {
        overlay.addEventListener('click', function() {
          modal.remove();
        });
      }
      
      // Cerrar con tecla Escape
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.querySelector('.modal-confirmacion')) {
          modal.remove();
        }
      });
    });
  }

  // ============================
  // INICIALIZACIÓN ADICIONAL
  // ============================
  
    // 🔧 FIXED: Global handlers for modals (reliable binding)
    $(document).on('click', '#btnConfirmarAnular', function(e) {
        e.preventDefault();
        const id = $('#delete_entrada_id').val();
        if (id) ejecutarAnular(id);
    });
    
    $(document).on('click', '.btn-delete[style*="22c55e"], #btnReactivar', function(e) {
        e.preventDefault();
        const id = $('#reactivate_entrada_id').val();
        if (id) ejecutarReactivar(id);
    });
    
    console.log('✅ Entrada_p.js loaded: Anular/Reactivar handlers active');
  }); // Fin DOMContentLoaded

