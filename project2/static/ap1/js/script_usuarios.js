// script_usuarios.js - Gestión de usuarios con validaciones y toasts
// Basado en patrones de script_crear_usuario.js

function limitInput(input, maxLength) {
  if (input.value.length > maxLength) {
    input.value = input.value.slice(0, maxLength);
  }
}

function limitDigits(input, maxLength) {
  input.value = input.value.replace(/[^0-9]/g, '').slice(0, maxLength);
}

// Validación específica para contraseñas
function validarPassword(password) {
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Requiere al menos una mayúscula';
  if (!/\\d/.test(password)) return 'Requiere al menos un número';
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) return 'Requiere al menos un carácter especial';
  return '';
}

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar DataTable
  $('#tablaUsuarios').DataTable({
    responsive: true,
    language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
    order: [[0, 'desc']]
  });

  // Toggle inactivos
  $('#toggleInactivos').change(function() {
    if (this.checked) {
      $('.fila-inactiva').show();
    } else {
      $('.fila-inactiva').hide();
    }
  });

  // Validación real-time
  validarEnTiempoRealUsuarios();

  // Toggle password visibility
  document.querySelectorAll('[onclick^=\"togglePassword\"]').forEach(btn => {
    btn.addEventListener('click', function() { togglePassword(this.dataset.id, this); });
  });
});

function validarEnTiempoRealUsuarios() {
  // Esperar a que el modal esté completamente cargado
  const observer = new MutationObserver(() => {
    const inputs = document.querySelectorAll('#formEditUsuario input:not([data-validated]), #formAddUsuario input:not([data-validated])');
    inputs.forEach(input => {
      input.dataset.validated = 'true';
      input.addEventListener('input', () => validarCampoUsuario(input));
      input.addEventListener('blur', () => validarCampoUsuario(input));
    });

    const passNew = document.getElementById('edit_password');
    const passConfirm = document.getElementById('edit_confirm_password');
    if (passNew && passConfirm && !passNew.dataset.passwordListeners) {
      passNew.dataset.passwordListeners = 'true';
      passConfirm.dataset.passwordListeners = 'true';
      passNew.addEventListener('input', () => validarPasswordMatchEdit());
      passConfirm.addEventListener('input', () => validarPasswordMatchEdit());
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // También validar inmediatamente si ya existen
  setTimeout(() => {
    document.querySelectorAll('#formEditUsuario input, #formAddUsuario input').forEach(input => validarCampoUsuario(input));
  }, 100);
}

function validarCampoUsuario(input) {
  const name = input.name;
  const value = input.value.trim();
  let errorMsg = '';

  switch (name) {
    case 'username':
      if (value.length < 5) errorMsg = 'Mínimo 5 caracteres';
      break;
    case 'email':
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (value && !emailRegex.test(value)) errorMsg = 'Email inválido';
      break;
    case 'first_name':
    case 'last_name':
      if (value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$/.test(value)) errorMsg = 'Solo letras';
      break;
    case 'cedula':
      if (value && !/^\\d{10}$/.test(value)) errorMsg = '10 dígitos exactos';
      break;
    case 'telefono':
      if (value && !/^\\d{10}$/.test(value)) errorMsg = '10 dígitos';
      break;
    case 'password':
    case 'confirm_password':
      // Match ya manejado por validarPasswordMatchEdit
      break;
  }

  if (errorMsg) mostrarError(input, errorMsg);
  else ocultarError(input);
}

function validarPasswordMatchEdit() {
  const passNew = document.getElementById('edit_password');
  const passConfirm = document.getElementById('edit_confirm_password');
  if (!passNew || !passConfirm) return;
  
  if (passNew.value && passConfirm.value && passNew.value !== passConfirm.value) {
    mostrarError(passConfirm, 'Contraseñas no coinciden');
  } else {
    ocultarError(passConfirm);
  }
  
  // Validar strength de password
  if (passNew.value) {
    const strengthError = validarPassword(passNew.value);
    if (strengthError) {
      mostrarError(passNew, strengthError);
    } else {
      ocultarError(passNew);
    }
  }
}

function mostrarError(input, mensaje) {
  let errorSpan = document.getElementById('error_' + input.name);
  if (!errorSpan) {
    errorSpan = document.createElement('span');
    errorSpan.id = 'error_' + input.name;
    errorSpan.className = 'error-message';
    input.parentNode.appendChild(errorSpan);
  }
  errorSpan.textContent = mensaje;
  errorSpan.classList.add('show');
  input.classList.add('error');
  input.classList.remove('success');
  input.setCustomValidity(mensaje);
}

function ocultarError(input) {
  const errorSpan = document.getElementById('error_' + input.name);
  if (errorSpan) {
    errorSpan.textContent = '';
    errorSpan.classList.remove('show');
  }
  input.classList.remove('error');
  if (input.value.trim()) input.classList.add('success');
  input.setCustomValidity('');
}

// Inicializar validación cuando se abra modal editar
function abrirModalEditar(pk) {
  // Cargar datos via AJAX
  fetch(`/usuarios/obtener-detalle/${pk}/`)
    .then(r => r.json())
    .then(data => {
      document.getElementById('edit_username').value = data.username;
      document.getElementById('edit_email').value = data.email;
      document.getElementById('edit_first_name').value = data.first_name;
      document.getElementById('edit_last_name').value = data.last_name;
      document.getElementById('edit_cedula').value = data.cedula;
      document.getElementById('edit_telefono').value = data.telefono;
      document.getElementById('edit_rol').value = data.rol;
      document.getElementById('editUsuarioNombre').textContent = data.username;
      document.getElementById('formEditUsuario').action = `/usuarios/editar/${pk}/`;
      
      // Limpiar errores y passwords
      document.querySelectorAll('#formEditUsuario .error-message').forEach(span => {
        span.textContent = '';
        span.classList.remove('show');
      });
      document.querySelectorAll('#formEditUsuario input').forEach(input => {
        input.classList.remove('error', 'success');
        if (input.id === 'edit_password' || input.id === 'edit_confirm_password') {
          input.value = '';
        }
      });
      
      // Remover data-validated para re-atach listeners
      document.querySelectorAll('#formEditUsuario input[data-validated]').forEach(input => {
        delete input.dataset.validated;
        delete input.dataset.passwordListeners;
      });
      
      document.getElementById('modalEdit').style.display = 'flex';
      
      // Forzar validación inicial
      setTimeout(() => {
        document.querySelectorAll('#formEditUsuario input').forEach(input => validarCampoUsuario(input));
      }, 50);
    })
    .catch(() => mostrarMensaje('error', 'Error cargando datos del usuario.'));
}

// AJAX para editar usuario - usar event delegation por dinamismo
document.addEventListener('submit', function(e) {
  if (e.target.id === 'formEditUsuario') {
    e.preventDefault();
    
    // Validación final mejorada
    let valido = true;
    e.target.querySelectorAll('input[required]').forEach(input => {
      if (!input.value.trim()) valido = false;
    });
    
    const passNew = document.getElementById('edit_password');
    const passConf = document.getElementById('edit_confirm_password');
    if (passNew && passNew.value && !passConf.value) {
      mostrarError(passConf, 'Confirme la contraseña');
      valido = false;
    }
    if (passNew && passNew.value) {
      const strength = validarPassword(passNew.value);
      if (strength) {
        mostrarError(passNew, strength);
        valido = false;
      }
      if (passConf.value && passNew.value !== passConf.value) {
        mostrarError(passConf, 'Contraseñas no coinciden');
        valido = false;
      }
    }
    
    if (!valido) {
      mostrarMensaje('error', 'Por favor corrige los errores antes de enviar.');
      return;
    }

    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type=\"submit\"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Guardando...';
    submitBtn.disabled = true;

    fetch(e.target.action, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        mostrarMensaje('success', data.message || '¡Usuario actualizado exitosamente! (Contraseña cambiada)');
        setTimeout(() => {
          document.getElementById('modalEdit').style.display = 'none';
          location.reload();
        }, 1500);
      } else {
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, msgs]) => {
            const input = document.querySelector(`#formEditUsuario [name=\"${field}\"]`);
            if (input) mostrarError(input, Array.isArray(msgs) ? msgs[0] : msgs);
          });
        }
        mostrarMensaje('error', data.message || 'Error al actualizar. Revisa los campos.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      mostrarMensaje('error', 'Error de conexión. Intenta nuevamente.');
    })
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  }
});

// Funciones modales (asumiendo existen en otro JS o inline)
function abrirModalEditar(pk) {
  fetch(`/usuarios/obtener-detalle/${pk}/`)
    .then(r => r.json())
    .then(data => {
      document.getElementById('edit_username').value = data.username;
      document.getElementById('edit_email').value = data.email;
      document.getElementById('edit_first_name').value = data.first_name;
      document.getElementById('edit_last_name').value = data.last_name;
      document.getElementById('edit_cedula').value = data.cedula;
      document.getElementById('edit_telefono').value = data.telefono;
      document.getElementById('edit_rol').value = data.rol;
      document.getElementById('editUsuarioNombre').textContent = data.username;
      document.getElementById('formEditUsuario').action = `/usuarios/editar/${pk}/`;
      // Limpiar errores
      document.querySelectorAll('.error-message.show').forEach(el => el.classList.remove('show'));
      document.querySelectorAll('.error, .success').forEach(el => {
        el.classList.remove('error', 'success');
      });
      document.getElementById('edit_password').value = '';
      document.getElementById('edit_confirm_password').value = '';
      abrirModal('modalEdit');
    });
}

function cerrarModal(id) {
  document.getElementById(id).style.display = 'none';
}

function abrirModal(id) {
  document.getElementById(id).style.display = 'flex';
}

// Toast functions (copiadas de script_crear_usuario.js)
function mostrarMensaje(tipo, texto) {
  let cont = document.getElementById('toast-container') || crearToastContainer();
  let msg = document.createElement('div');
  msg.className = `message ${tipo}`;
  msg.innerHTML = `
    <div class="message-content">
      <i class="fas fa-${tipo === 'success' ? 'check' : 'times'}-circle"></i>
      <span>${texto}</span>
    </div>
    <button class="close-toast" onclick="cerrarToast(this)">
      <i class="fas fa-times"></i>
    </button>
  `;
  cont.appendChild(msg);
  setTimeout(() => cerrarToast(msg.querySelector('.close-toast')), 5000);
}

function crearToastContainer() {
  let c = document.createElement('div');
  c.id = 'toast-container';
  c.className = 'messages-container';
  document.querySelector('.contenedor')?.prepend(c) || document.body.prepend(c);
  return c;
}

function cerrarToast(btn) {
  btn.closest('.message').style.animation = 'slideOutToast .3s';
  setTimeout(() => btn.closest('.message').remove(), 300);
}

function togglePassword(id, el) {
  const input = document.getElementById(id);
  const icon = el.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

