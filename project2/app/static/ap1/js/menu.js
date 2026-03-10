document.addEventListener("DOMContentLoaded", () => {
  
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
  // MODAL DE PERFIL
  // =====================
  const btnMiPerfil = document.getElementById('btnMiPerfil');
  const modalPerfil = document.getElementById('modalPerfil');
  const cerrarModalPerfil = document.getElementById('cerrarModalPerfil');
  const cancelarPerfil = document.getElementById('cancelarPerfil');
  const formPerfil = document.getElementById('formPerfil');
  
  // Función para abrir modal de perfil
  if (btnMiPerfil && modalPerfil) {
    btnMiPerfil.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Cerrar dropdown primero
      if (dropdownMenu) {
        dropdownMenu.classList.add('oculto');
      }
      
      // Obtener datos del perfil
      fetch('/vistas/menu/perfil/')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            document.getElementById('perfilCedula').value = data.data.cedula;
            document.getElementById('perfilNombre').value = data.data.nombre_usuario;
            document.getElementById('perfilEmail').value = data.data.email;
            document.getElementById('perfilRol').value = data.data.rol;
            document.getElementById('perfilEstado').value = data.data.estado;
            modalPerfil.classList.remove('oculto');
          } else {
            alert('Error al cargar perfil: ' + data.error);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al cargar el perfil');
        });
    });
  }
  
  // Cerrar modal de perfil
  function cerrarModalPerfilFunc() {
    if (modalPerfil) {
      modalPerfil.classList.add('oculto');
    }
  }
  
  if (cerrarModalPerfil) {
    cerrarModalPerfil.addEventListener('click', cerrarModalPerfilFunc);
  }
  
  if (cancelarPerfil) {
    cancelarPerfil.addEventListener('click', cerrarModalPerfilFunc);
  }
  
  // Cerrar al hacer clic fuera del modal
  if (modalPerfil) {
    modalPerfil.addEventListener('click', function(e) {
      if (e.target === modalPerfil) {
        cerrarModalPerfilFunc();
      }
    });
  }
  
  // Cerrar con tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalPerfil && !modalPerfil.classList.contains('oculto')) {
      cerrarModalPerfilFunc();
    }
  });
  
  // Enviar formulario de perfil
  if (formPerfil) {
    formPerfil.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const data = {
        nombre_usuario: document.getElementById('perfilNombre').value,
        email: document.getElementById('perfilEmail').value
      };
      
      fetch('/vistas/menu/perfil/actualizar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Perfil actualizado correctamente');
          cerrarModalPerfilFunc();
          // Recargar la página para actualizar los datos en el header
          location.reload();
        } else {
          alert('Error al actualizar perfil: ' + data.error);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar el perfil');
      });
    });
  }
  
  // Función para obtener CSRF token
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
  
  console.log('Menú cargado correctamente');
  
}); // Fin DOMContentLoaded

