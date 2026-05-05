document.addEventListener("DOMContentLoaded", () => {
  
  // ============================
  // MODAL LOGOUT - Funciones globales
  // ============================
  
  // Hacer las funciones accesibles globalmente
  window.abrirModalLogout = function() {
    const modal = document.getElementById('modalLogout');
    if (modal) {
      modal.classList.remove('oculto');
      modal.classList.add('show');
      modal.style.display = 'flex';
      console.log('Modal abierto');
    }
  };
  
  window.cerrarModalLogout = function() {
    const modal = document.getElementById('modalLogout');
    if (modal) {
      modal.classList.add('oculto');
      modal.classList.remove('show');
      modal.style.display = 'none';
      console.log('Modal cerrado');
    }
  };

  // ============================
  // GLOBAL TOAST NOTIFICATIONS
  // window.showToast() ya está definido en base.html (carga antes del body).
  // Este archivo NO debe redefinirlo. Se usa directamente donde se necesite.
  // ============================

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
            document.getElementById('perfilCedula').value = data.data.cedula || '';
            document.getElementById('perfilNombre').value = data.data.username || '';
            document.getElementById('perfilEmail').value = data.data.email || '';
            document.getElementById('perfilTelefono').value = data.data.telefono || '';
            document.getElementById('perfilFirstName').value = data.data.first_name || '';
            document.getElementById('perfilLastName').value = data.data.last_name || '';
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
      formData.append('telefono', document.getElementById('perfilTelefono').value);
      formData.append('first_name', document.getElementById('perfilFirstName').value);
      formData.append('last_name', document.getElementById('perfilLastName').value);
      formData.append('cedula', document.getElementById('perfilCedula').value);
      formData.append('password', document.getElementById('perfilPassword').value);
      formData.append('confirm_password', document.getElementById('perfilConfirmPassword').value);
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
          window.showToast('Perfil actualizado correctamente', 'success');
          cerrarModalPerfilFunc();
          setTimeout(() => location.reload(), 2000);
        } else {
          window.showToast('Error: ' + (data.error || 'No se pudo actualizar el perfil'), 'error');
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

