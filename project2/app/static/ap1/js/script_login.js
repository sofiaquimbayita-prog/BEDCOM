document.addEventListener('DOMContentLoaded', () => {
  
  // ================================
  // SELECTOR DE IDIOMA - FUNCIONALIDAD MEJORADA
  // ================================
  const botonIdioma = document.querySelector('.boton-idioma');

if (botonIdioma) {
  // Obtener el idioma guardado en localStorage o usar español por defecto
  let idiomaActual = localStorage.getItem('idioma') || 'es';

  // Aplicar el idioma guardado al cargar la página
  aplicarIdioma(idiomaActual);
  actualizarTextoBotonIdioma(botonIdioma, idiomaActual);

  botonIdioma.addEventListener('click', () => {
    // Alternar entre español e inglés
    if (idiomaActual === 'es') {
      idiomaActual = 'en';
    } else {
      idiomaActual = 'es';
    }

    // Guardar preferencia y aplicar cambios
    localStorage.setItem('idioma', idiomaActual);
    aplicarIdioma(idiomaActual);
    actualizarTextoBotonIdioma(botonIdioma, idiomaActual);
  });
}

  // Función para aplicar el idioma a todos los elementos
  function aplicarIdioma(idioma) {
    const elementosTraducibles = {
      'es': {
        'titulo-login': 'INICIAR SESIÓN',
        'titulo-registro': 'CREAR CUENTA',
        'titulo-recuperar': 'RECUPERAR CONTRASEÑA',
        'titulo-cambiar': 'CAMBIAR CONTRASEÑA',
        'placeholder-email': 'usuario@dominio.com',
        'placeholder-password': 'Contraseña',
        'placeholder-confirmar': 'Confirmar Contraseña', // <<-- AÑADIDO
        'label-nombre': 'Nombre',
        'label-correo': 'Correo electrónico',
        'label-contrasena': 'Contraseña',
        'label-confirmar': 'Confirmar contraseña',
        'texto-continuar': 'Continuar',
        'texto-registrar': 'REGISTRAR',
        'texto-validar': 'VALIDAR',
        'texto-generar-codigo': 'Generar código de verificación',
        'texto-olvidaste': '¿Olvidaste tu contraseña?',
        'texto-crear-cuenta': '¿No tienes una cuenta? Crear cuenta',
        'texto-ya-tienes': '¿Ya tienes una cuenta? Inicia sesión',
        'texto-ingresa-correo': 'Ingrese un correo',
        'texto-codigo-enviado': 'Ingresa el código enviado al correo',
        'error-email-vacio': 'El correo no puede estar vacío.',
        'error-email-largo': 'El correo no debe superar los 54 caracteres.',
        'error-email-invalido': 'Por favor, ingresa un correo electrónico válido (ej: usuario@dominio.com).',
        'error-password-vacio': 'La contraseña no puede estar vacía.',
        'error-password-requisitos': 'Debe tener min. 8 caracteres, 3 números, 3 letras, 1 símbolo y mayúsculas/minúsculas.',
        'error-nombre-vacio': 'El nombre es obligatorio.',
        'error-credenciales': 'Credenciales incorrectas. Intente de nuevo.',
        'error-passwords-no-coinciden': 'Las contraseñas no coinciden.',
        'placeholder-nombre': 'Nombre', // <<-- AÑADIDO
        'texto-password-rules': 'Mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos',
        'texto-inicia-sesion': 'Inicia sesión'
      },
      'en': {
        'titulo-login': 'LOGIN',
        'titulo-registro': 'CREATE ACCOUNT',
        'titulo-recuperar': 'RECOVER PASSWORD',
        'titulo-cambiar': 'CHANGE PASSWORD',
        'placeholder-email': 'user@domain.com',
        'placeholder-password': 'Password',
        'placeholder-confirmar': 'Confirm Password', // <<-- AÑADIDO
        'label-nombre': 'Name',
        'label-correo': 'Email',
        'label-contrasena': 'Password',
        'label-confirmar': 'Confirm Password',
        'texto-continuar': 'Continue',
        'texto-registrar': 'REGISTER',
        'texto-validar': 'VALIDATE',
        'texto-generar-codigo': 'Generate verification code',
        'texto-olvidaste': 'Forgot your password?',
        'texto-crear-cuenta': 'Don\'t have an account? Create account',
        'texto-ya-tienes': 'Already have an account? Login',
        'texto-ingresa-correo': 'Enter an email',
        'texto-codigo-enviado': 'Enter the code sent to email',
        'error-email-vacio': 'Email cannot be empty.',
        'error-email-largo': 'Email must not exceed 54 characters.',
        'error-email-invalido': 'Please enter a valid email address (e.g.: user@domain.com).',
        'error-password-vacio': 'Password cannot be empty.',
        'error-password-requisitos': 'Must have min. 8 characters, 3 numbers, 3 letters, 1 symbol and uppercase/lowercase.',
        'error-nombre-vacio': 'Name is required.',
        'error-credenciales': 'Incorrect credentials. Please try again.',
        'error-passwords-no-coinciden': 'Passwords do not match.',
        'placeholder-nombre': 'Name', // <<-- AÑADIDO
        'texto-password-rules': 'Minimum 8 characters, with uppercase, lowercase, numbers and symbols',
        'texto-inicia-sesion': 'Log in'
      }
    };

    const traducciones = elementosTraducibles[idioma];
    
    // Aplicar traducciones a todos los elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(elemento => {
      const clave = elemento.getAttribute('data-i18n');
      if (traducciones[clave]) {
        // Usa data-i18n-placeholder para inputs de placeholder y data-i18n para otros
        if (elemento.tagName === 'INPUT' && elemento.placeholder && elemento.getAttribute('data-i18n-placeholder') === clave) {
          elemento.placeholder = traducciones[clave];
        } else if (!elemento.hasAttribute('data-i18n-placeholder')) {
          elemento.textContent = traducciones[clave];
        }
      }
    });
  }
  // El bloque aplicarIdioma fue ajustado para manejar mejor los placeholders de los inputs
  // usando un atributo adicional 'data-i18n-placeholder' si es necesario para evitar 
  // conflictos con elementos con el mismo 'data-i18n' (ej: placeholder y label).

  // Función para actualizar el texto del botón de idioma
  function actualizarTextoBotonIdioma(boton, idioma) {
    if (idioma === 'es') {
      boton.innerHTML = '<i class="fa-solid fa-globe"></i> ES';
    } else {
      boton.innerHTML = '<i class="fa-solid fa-globe"></i> EN';
    }
  }

  // ================================
  // LOGIN (conexión a base de datos) - IDs ACTUALIZADOS
  // ================================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
      const email = document.getElementById("loginCorreo");
      const emailError = document.getElementById("loginEmailError");
      const password = document.getElementById("loginContrasena");
      const passwordError = document.getElementById("loginPasswordError");
      const button = document.getElementById("loginButton");

      function checkLogin() {
          const okEmail = validarEmail(email, emailError);
          const okPass = validarPassword(password, passwordError);
          button.disabled = !(okEmail && okPass);
      }

      email.addEventListener("input", checkLogin);
      password.addEventListener("input", checkLogin);

      loginForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          if (button.disabled) return;

          // Mostrar indicador de carga
          button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
          button.disabled = true;

          // Ocultar errores previos
          hideError(loginEmailError);
          hideError(loginPasswordError);

          try {
              // Preparar datos para enviar
              const datos = {
                  correo: email.value.trim(),
                  contrasena: password.value
              };
              
              // Enviar los datos al servidor PHP para validación
              const response = await fetch('login.php', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(datos)
              });

              const data = await response.json();

              if (data.success) {
                  // Redirigir al dashboard si el login es exitoso
                  window.location.href = data.redirect || "/proyecto_2/1-MENU/menu.html";
              } else {
                  // Mostrar mensaje de error
                  // Usar la función aplicarIdioma para obtener el texto de error correcto
                  const idioma = localStorage.getItem('idioma') || 'es';
                  const errorMsg = data.message || (idioma === 'es' ? 'Credenciales incorrectas. Intente de nuevo.' : 'Incorrect credentials. Please try again.');
                  
                  showError(passwordError, errorMsg);
                  button.innerHTML = 'Continuar';
                  button.disabled = false;
              }
          } catch (error) {
              
              // Mostrar mensaje de error detallado
              let errorMsg = "Error de conexión. ";
              
              if (error.message.includes('Failed to fetch')) {
                  errorMsg += "No se pudo conectar al servidor. Verifica que login.php exista y esté accesible.";
              } else {
                  errorMsg += `Detalles: ${error.message}`;
              }
              
              showError(passwordError, errorMsg);
              button.innerHTML = 'Continuar';
              button.disabled = false;
          }
      });

      activarTogglePassword("loginContrasena", "toggleLoginPassword");
  }

  // ================================
  // BOTÓN DE AYUDA - FUNCIONALIDAD COMPLETA (Sin cambios funcionales)
  // ================================
  const botonAyuda = document.querySelector('.boton-ayuda');
  if (botonAyuda) {
      botonAyuda.addEventListener('click', () => {
          // ... [La lógica del modal de ayuda permanece igual] ...
          
          // Crear modal de ayuda completamente con JavaScript
          const modalOverlay = document.createElement('div');
          modalOverlay.className = 'modal-overlay';
          modalOverlay.id = 'modalAyuda';
          modalOverlay.style.display = 'flex';

          // Crear contenido del modal con estilos similares a la página
          const modalContent = document.createElement('div');
          modalContent.className = 'modal-content';
          modalContent.style.cssText = `
              background-color: rgba(0, 0, 0, 0.36);
              padding: 30px;
              border-radius: 15px;
              width: 90%;
              max-width: 500px;
              text-align: left;
              color: white;
              position: relative;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
              border: 2px solid var(--color-borde);
              backdrop-filter: blur(10px);
          `;

          // Botón de cerrar
          const closeButton = document.createElement('span');
          closeButton.className = 'modal-close';
          closeButton.innerHTML = '&times;';
          closeButton.style.cssText = `
              position: absolute;
              top: 15px;
              right: 20px;
              font-size: 28px;
              font-weight: bold;
              cursor: pointer;
              color: white;
              transition: color 0.3s ease;
          `;
          closeButton.addEventListener('click', cerrarModal);

          // Título del modal
          const modalTitle = document.createElement('h3');
          modalTitle.className = 'modal-title';
          modalTitle.textContent = 'Centro de Ayuda';
          modalTitle.style.cssText = `
              text-align: center;
              margin-bottom: 25px;
              color: white;
              font-size: 1.8rem;
              border-bottom: 2px solid white;
              padding-bottom: 10px;
          `;

          // Contenedor de preguntas frecuentes
          const faqContainer = document.createElement('div');
          
          // Pregunta 1
          const faqItem1 = createFAQItem(
              '¿Cómo crear una cuenta?',
              'Para crear una cuenta, haz clic en "Crear cuenta" y completa el formulario con tus datos personales. Asegúrate de usar un correo válido y una contraseña segura.'
          );

          // Pregunta 2
          const faqItem2 = createFAQItem(
              '¿Olvidé mi contraseña?',
              'Haz clic en "¿Olvidaste tu contraseña?" en la página de login. Ingresa tu correo electrónico y sigue las instrucciones para restablecer tu contraseña.'
          );

          // Pregunta 3
          const faqItem3 = createFAQItem(
              'Requisitos de contraseña',
              'La contraseña debe tener mínimo 8 caracteres, incluyendo: 3 números, 3 letras, 1 símbolo (@$!%*?&) y al menos una mayúscula y una minúscula.'
          );

          // Pregunta 4
          const faqItem4 = createFAQItem(
              '¿Cómo contactar soporte?',
              'Para asistencia técnica, envía un correo a soporte@bedcom.com o llama al +1 234-567-8900. Horario de atención: Lunes a Viernes 8:00 AM - 6:00 PM.'
          );

          // Ensamblar el modal
          faqContainer.appendChild(faqItem1);
          faqContainer.appendChild(faqItem2);
          faqContainer.appendChild(faqItem3);
          faqContainer.appendChild(faqItem4);

          modalContent.appendChild(closeButton);
          modalContent.appendChild(modalTitle);
          modalContent.appendChild(faqContainer);

          modalOverlay.appendChild(modalContent);
          document.body.appendChild(modalOverlay);

          // Cerrar modal al hacer click fuera del contenido
          modalOverlay.addEventListener('click', (e) => {
              if (e.target === modalOverlay) {
                  cerrarModal();
              }
          });

          // Prevenir que el click dentro del contenido cierre el modal
          modalContent.addEventListener('click', (e) => {
              e.stopPropagation();
          });
      });
  }

  // Función para crear items de FAQ (Sin cambios funcionales)
  function createFAQItem(pregunta, respuesta) {
      const faqItem = document.createElement('div');
      faqItem.className = 'modal-faq-item';
      faqItem.style.cssText = `
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 10px;
          background: rgba(79, 137, 232, 0.1);
          border-left: 4px solid var(--color-botones);
      `;

      const preguntaElem = document.createElement('h4');
      preguntaElem.textContent = pregunta;
      preguntaElem.style.cssText = `
          margin: 0 0 10px 0;
          color: white;
          cursor: pointer;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 10px;
      `;
      preguntaElem.innerHTML = `<i class="fa-solid fa-circle-question" style="color: var(--color-botones);"></i> ${pregunta}`;

      const respuestaElem = document.createElement('p');
      respuestaElem.textContent = respuesta;
      respuestaElem.style.cssText = `
          margin: 0;
          padding: 10px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          border-left: 3px solid var(--color-botones);
          display: none;
      `;

      // Toggle para mostrar/ocultar respuesta
      preguntaElem.addEventListener('click', () => {
          const isVisible = respuestaElem.style.display === 'block';
          respuestaElem.style.display = isVisible ? 'none' : 'block';
          
          // Cambiar icono
          const icon = preguntaElem.querySelector('i');
          if (icon) {
              icon.className = isVisible ? 'fa-solid fa-circle-question' : 'fa-solid fa-trash-can';
              icon.style.color = 'var(--color-botones)';
          }
      });

      faqItem.appendChild(preguntaElem);
      faqItem.appendChild(respuestaElem);

      return faqItem;
  }

  // Función para cerrar modal (Sin cambios funcionales)
  function cerrarModal() {
      const modal = document.getElementById('modalAyuda');
      if (modal) {
          modal.remove(); // Eliminar completamente el modal del DOM
      }
  }

  // Hacer la función global para que funcione con los eventos onclick
  window.cerrarModal = cerrarModal;

  // ================================
  // VALIDACIONES GENERALES (Sin cambios funcionales)
  // ================================
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=(?:.*[a-z]){3,})(?=(?:.*[A-Z]){1,})(?=(?:.*\d){3,})(?=(?:.*[@$!%*?&]){1,})[A-Za-z\d@$!%*?&]{8,}$/;

  function showError(errorSpan, message) {
    errorSpan.textContent = message;
    errorSpan.style.display = "block";
  }

  function hideError(errorSpan) {
    errorSpan.textContent = "";
    errorSpan.style.display = "none";
  }

  function validarEmail(emailInput, errorSpan) {
    // Implementar el uso de aplicarIdioma si fuera necesario, pero la lógica de error se mantiene
    let email = emailInput.value.trim();
    emailInput.value = email;
    const idioma = localStorage.getItem('idioma') || 'es';
    const errores = {
      'es': {
        vacio: 'El correo no puede estar vacío.',
        largo: 'El correo no debe superar los 54 caracteres.',
        invalido: 'Por favor, ingresa un correo electrónico válido (ej: usuario@dominio.com).'
      },
      'en': {
        vacio: 'Email cannot be empty.',
        largo: 'Email must not exceed 54 characters.',
        invalido: 'Please enter a valid email address (e.g.: user@domain.com).'
      }
    };
    const msgs = errores[idioma];

    if (!email) {
      showError(errorSpan, msgs.vacio);
      return false;
    }
    if (email.length > 54) {
      showError(errorSpan, msgs.largo);
      return false;
    }
    if (!emailRegex.test(email)) {
      showError(errorSpan, msgs.invalido);
      return false;
    }
    hideError(errorSpan);
    return true;
  }

  function validarPassword(passInput, errorSpan) {
    let password = passInput.value.trim();
    const idioma = localStorage.getItem('idioma') || 'es';
    const errorVacio = idioma === 'es' ? 'La contraseña no puede estar vacía.' : 'Password cannot be empty.';
    const errorRequisitos = idioma === 'es' ? 'Debe tener min. 8 caracteres, 3 números, 3 letras, 1 símbolo y mayúsculas/minúsculas.' : 'Must have min. 8 characters, 3 numbers, 3 letters, 1 symbol and uppercase/lowercase.';
      
    if (!password) {
      showError(errorSpan, errorVacio);
      return false;
    }
    if (!passwordRegex.test(password)) {
      showError(errorSpan, errorRequisitos);
      return false;
    }
    hideError(errorSpan);
    return true;
  }

  function validarNombre(nameInput, errorSpan) {
    const idioma = localStorage.getItem('idioma') || 'es';
    const errorMsg = idioma === 'es' ? 'El nombre es obligatorio.' : 'Name is required.';

    if (!nameInput.value.trim()) {
      showError(errorSpan, errorMsg);
      return false;
    }
    hideError(errorSpan);
    return true;
  }

  function activarTogglePassword(inputId, toggleId) {
    const passInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(toggleId);
    if (passInput && toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        if (passInput.type === "password") {
          passInput.type = "text";
          toggleBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        } else {
          passInput.type = "password";
          toggleBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
      });
    }
  }

  // ================================
  // REGISTRO - IDs ACTUALIZADOS Y VALIDACIÓN MEJORADA
  // ================================
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    // IDs ÚNICOS
    const name = document.getElementById("registerNombre");
    const nameError = document.getElementById("registerNameError");
    const email = document.getElementById("registerCorreo");
    const emailError = document.getElementById("registerEmailError");
    const password = document.getElementById("registerContrasena");
    const passwordError = document.getElementById("registerPasswordError");
    const confirmPass = document.getElementById("registerConfirmar"); // Nuevo ID
    const confirmError = document.getElementById("registerConfirmError"); // Nuevo ID
    const button = document.getElementById("registerButton");

    function checkRegister() {
      const okName = validarNombre(name, nameError);
      const okEmail = validarEmail(email, emailError);
      const okPass = validarPassword(password, passwordError);
      let okConfirm = true;

      // Validar si las contraseñas coinciden
      if (confirmPass) {
        if (confirmPass.value.trim() !== password.value.trim() || !confirmPass.value.trim()) {
          const idioma = localStorage.getItem('idioma') || 'es';
          const errorMsg = idioma === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.';
          showError(confirmError, errorMsg);
          okConfirm = false;
        } else {
          hideError(confirmError);
        }
      }
      
      button.disabled = !(okName && okEmail && okPass && okConfirm);
    }

    name.addEventListener("input", checkRegister);
    email.addEventListener("input", checkRegister);
    password.addEventListener("input", checkRegister);
    if(confirmPass) confirmPass.addEventListener("input", checkRegister);

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!button.disabled) {
        // Aquí debería ir la lógica para enviar los datos de registro a un archivo PHP/API.
        // Dejo la redirección como estaba, asumiendo que el envío ocurre internamente después.
        window.location.href = "/0-LOGIN/index_login.html";
      }
    });

    activarTogglePassword("registerContrasena", "toggleRegisterPassword");
    activarTogglePassword("registerConfirmar", "toggleRegisterConfirmPassword"); // Nuevo Toggle
  }

  // ================================
  // RECUPERAR CONTRASEÑA - IDs ACTUALIZADOS
  // ================================
  const recoveryForm = document.getElementById("recoveryForm");
  if (recoveryForm) {
    const email = document.getElementById("recoveryCorreo");
    const emailError = document.getElementById("recoveryEmailError");
    const button = document.getElementById("recoveryButton");

    function checkRecovery() {
      const okEmail = validarEmail(email, emailError);
      button.disabled = !okEmail;
    }

    email.addEventListener("input", checkRecovery);

    recoveryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (button.disabled) return;

      // Mostrar indicador de carga
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
      button.disabled = true;

      try {
        // Enviar solicitud de recuperación
        const response = await fetch('recuperar_password.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo: email.value.trim()
          })
        });

        const data = await response.json();

        if (data.success) {
          // Guardar email en sessionStorage para usarlo en la página de cambio de contraseña
          sessionStorage.setItem('recoveryEmail', email.value.trim());
          // Redirigir a la página de verificación de código
          window.location.href = "verificar_codigo.html";
        } else {
          const idioma = localStorage.getItem('idioma') || 'es';
          const errorMsg = data.message || (idioma === 'es' ? 'Error al enviar el correo de recuperación.' : 'Error sending recovery email.');
          showError(emailError, errorMsg);
          button.innerHTML = 'Enviar';
          button.disabled = false;
        }
      } catch (error) {
        console.error('Error:', error);
        showError(emailError, "Error de conexión. Intente nuevamente.");
        button.innerHTML = 'Enviar';
        button.disabled = false;
      }
    });
  }

  // ================================
  // VERIFICAR CÓDIGO - IDs ACTUALIZADOS
  // ================================
  const verifyForm = document.getElementById("verifyForm");
  if (verifyForm) {
    const code = document.getElementById("verifyCodigo");
    const codeError = document.getElementById("verifyCodeError");
    const button = document.getElementById("verifyButton");

    function checkVerification() {
      if (!code.value.trim()) {
        const idioma = localStorage.getItem('idioma') || 'es';
        const errorMsg = idioma === 'es' ? 'El código no puede estar vacío.' : 'The code cannot be empty.';
        showError(codeError, errorMsg);
        button.disabled = true;
        return false;
      }
      hideError(codeError);
      button.disabled = false;
      return true;
    }

    code.addEventListener("input", checkVerification);

    verifyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!checkVerification()) return;

      // Mostrar indicador de carga
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
      button.disabled = true;

      try {
        // Obtener el email de sessionStorage
        const recoveryEmail = sessionStorage.getItem('recoveryEmail');
        
        if (!recoveryEmail) {
          window.location.href = "recuperar_password.html";
          return;
        }

        // Enviar código para verificación
        const response = await fetch('verificar_codigo.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo: recoveryEmail,
            codigo: code.value.trim()
          })
        });

        const data = await response.json();

        if (data.success) {
          // Redirigir a la página de cambio de contraseña
          window.location.href = "cambiar_password.html";
        } else {
          const idioma = localStorage.getItem('idioma') || 'es';
          const errorMsg = data.message || (idioma === 'es' ? 'Código inválido o expirado.' : 'Invalid or expired code.');
          showError(codeError, errorMsg);
          button.innerHTML = 'Validar';
          button.disabled = false;
        }
      } catch (error) {
        console.error('Error:', error);
        showError(codeError, "Error de conexión. Intente nuevamente.");
        button.innerHTML = 'Validar';
        button.disabled = false;
      }
    });
  }

  // ================================
  // CAMBIAR CONTRASEÑA (COMPLETO) - IDs ACTUALIZADOS
  // ================================
  const changePassForm = document.getElementById("changePassForm");
  if (changePassForm) {
    // Verificar si hay un email guardado para recuperación
    const recoveryEmail = sessionStorage.getItem('recoveryEmail');
    if (!recoveryEmail && window.location.pathname.includes('cambiar_password.html')) {
      alert('Sesión expirada. Redirigiendo a recuperación...');
      window.location.href = 'recuperar_password.html';
      return;
    }

    const pass1 = document.getElementById("changeContrasena");
    const pass2 = document.getElementById("changeConfirmar");
    const passError1 = document.getElementById("changePasswordError");
    const passError2 = document.getElementById("changeConfirmPasswordError");
    const button = document.getElementById("changeButton");

    function checkChange() {
      const ok1 = validarPassword(pass1, passError1);
      let ok2 = true;
      if (pass2.value.trim() !== pass1.value.trim() || !pass2.value.trim()) {
        const idioma = localStorage.getItem('idioma') || 'es';
        const errorMsg = idioma === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.';
        showError(passError2, errorMsg);
        ok2 = false;
      } else {
        hideError(passError2);
      }
      button.disabled = !(ok1 && ok2);
      return ok1 && ok2;
    }

    pass1.addEventListener("input", checkChange);
    pass2.addEventListener("input", checkChange);

    changePassForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!checkChange()) return;

      // Mostrar indicador de carga
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cambiando...';
      button.disabled = true;

      try {
        // Obtener el email de sessionStorage
        const recoveryEmail = sessionStorage.getItem('recoveryEmail');
        
        // Enviar la nueva contraseña al servidor
        const response = await fetch('cambiar_password.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo: recoveryEmail,
            nuevaContrasena: pass1.value
          })
        });

        const data = await response.json();

        if (data.success) {
          // Limpiar sessionStorage y redirigir al login
          sessionStorage.removeItem('recoveryEmail');
          alert('Contraseña cambiada exitosamente');
          window.location.href = "index_login.html";
        } else {
          const idioma = localStorage.getItem('idioma') || 'es';
          const errorMsg = data.message || (idioma === 'es' ? 'Error al cambiar la contraseña.' : 'Error changing password.');
          showError(passError1, errorMsg);
          button.innerHTML = 'Cambiar';
          button.disabled = false;
        }
      } catch (error) {
        console.error('Error:', error);
        showError(passError1, "Error de conexión. Intente nuevamente.");
        button.innerHTML = 'Cambiar';
        button.disabled = false;
      }
    });

    activarTogglePassword("changeContrasena", "toggleChangePassword");
    activarTogglePassword("changeConfirmar", "toggleConfirmPassword");
  }
});