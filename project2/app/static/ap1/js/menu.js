document.addEventListener("DOMContentLoaded", () => {
  
  // ============================
  // MODAL LOGOUT - Funciones globales
  // ============================
  
  // Hacer las funciones accesibles globalmente
  window.abrirModalLogout = function() {
    const modal = document.getElementById('modalLogout');
    if (modal) {
      modal.classList.remove('oculto');
      console.log('Modal abierto');
    }
  };
  
  window.cerrarModalLogout = function() {
    const modal = document.getElementById('modalLogout');
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
  const perfilFoto = document.getElementById('perfilFoto');
  const fotoPreview = document.getElementById('fotoPreview');
  const fotoIcon = document.getElementById('fotoIcon');

  if (perfilFoto) {
    perfilFoto.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          fotoPreview.src = e.target.result;
          fotoPreview.style.display = 'block';
          fotoIcon.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    });
  }
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
            document.getElementById('perfilNombre').value = data.data.username || '';
            document.getElementById('perfilEmail').value = data.data.email;
            document.getElementById('perfilRol').value = data.data.rol;
            document.getElementById('perfilEstado').value = data.data.estado;
            // Update foto preview
            if (data.data.foto_perfil) {
              document.getElementById('fotoPreview').src = data.data.foto_perfil;
              document.getElementById('fotoPreview').style.display = 'block';
              document.getElementById('fotoIcon').style.display = 'none';
            }
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
      
      const formData = new FormData();
      formData.append('nombre_usuario', document.getElementById('perfilNombre').value);
      formData.append('email', document.getElementById('perfilEmail').value);
      formData.append('cedula', document.getElementById('perfilCedula').value);
      const fotoFile = document.getElementById('perfilFoto').files[0];
      if (fotoFile) {
        formData.append('foto_perfil', fotoFile);
      }
      
      fetch('/vistas/menu/perfil/actualizar/', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': getCookie('csrftoken')
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Toast success como otros módulos
          const toast = document.createElement('div');
          toast.className = 'message success';
          toast.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10001; max-width: 350px;';
          toast.innerHTML = `
            <div class="message-content">
              <i class="fas fa-check-circle"></i>
              <span>Perfil actualizado correctamente</span>
            </div>
            <button onclick="cerrarToast(this)" class="close-toast">
              <i class="fas fa-times"></i>
            </button>
          `;
          document.body.appendChild(toast);
          
          // Auto cerrar toast después de 5s
          setTimeout(() => {
            if (toast.parentNode) {
              toast.style.animation = 'slideOut 0.3s ease forwards';
              setTimeout(() => toast.remove(), 300);
            }
          }, 5000);
          
          cerrarModalPerfilFunc();
          setTimeout(() => location.reload(), 2000);
        } else {
          // Toast error
          const toast = document.createElement('div');
          toast.className = 'message error';
          toast.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10001; max-width: 350px;';
          toast.innerHTML = `
            <div class="message-content">
              <i class="fas fa-exclamation-circle"></i>
              <span>Error: ${data.error}</span>
            </div>
            <button onclick="cerrarToast(this)" class="close-toast">
              <i class="fas fa-times"></i>
            </button>
          `;
          document.body.appendChild(toast);
          
          // Auto cerrar después de 6s
          setTimeout(() => {
            if (toast.parentNode) {
              toast.style.animation = 'slideOut 0.3s ease forwards';
              setTimeout(() => toast.remove(), 300);
            }
          }, 6000);
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

  console.log('Menú cargado correctamente');
}); // Fin DOMContentLoaded
