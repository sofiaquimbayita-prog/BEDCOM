document.addEventListener('DOMContentLoaded', () => {
   
   // ================================
   // SELECTOR DE IDIOMA - FUNCIONALIDAD MEJORADA
   // ================================
   const botonIdioma = document.querySelector('.boton-idioma');

if (botonIdioma) {
   // Obtener el idioma guardado en localStorage o usar espaá±ol por defecto
   let idiomaActual = localStorage.getItem('idioma') || 'es';

   // Aplicar el idioma guardado al cargar la pá¡gina
   aplicarIdioma(idiomaActual);
   actualizarTextoBotonIdioma(botonIdioma, idiomaActual);

   botonIdioma.addEventListener('click', () => {
      // Alternar entre espaá±ol e inglá©s
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

   // Funciá³n para aplicar el idioma a todos los elementos
   function aplicarIdioma(idioma) {
      const elementosTraducibles = {
         'es': {
            'titulo-login': 'INICIAR SESIáN',
            'titulo-registro': 'CREAR CUENTA',
            'titulo-recuperar': 'RECUPERAR CONTRASEáA',
            'titulo-cambiar': 'CAMBIAR CONTRASEáA',
            'placeholder-email': 'usuario@dominio.com',
            'placeholder-password': 'Contraseá±a',
            'placeholder-confirmar': 'Confirmar Contraseá±a', // <<-- AáADIDO
            'label-nombre': 'Nombre',
            'label-correo': 'Correo electrá³nico',
            'label-contrasena': 'Contraseá±a',
            'label-confirmar': 'Confirmar contraseá±a',
            'texto-continuar': 'Continuar',
            'texto-registrar': 'REGISTRAR',
            'texto-validar': 'VALIDAR',
            'texto-generar-codigo': 'Generar cá³digo de verificaciá³n',
            'texto-olvidaste': 'Â¿Olvidaste tu contraseá±a?',
            'texto-crear-cuenta': 'Â¿No tienes una cuenta? Crear cuenta',
            'texto-ya-tienes': 'Â¿Ya tienes una cuenta? Inicia sesiá³n',
            'texto-ingresa-correo': 'Ingrese un correo',
            'texto-codigo-enviado': 'Ingresa el cá³digo enviado al correo',
            'error-email-vacio': 'El correo no puede estar vacá­o.',
            'error-email-largo': 'El correo no debe superar los 54 caracteres.',
            'error-email-invalido': 'Por favor, ingresa un correo electrá³nico vá¡lido (ej: usuario@dominio.com).',
            'error-password-vacio': 'La contraseá±a no puede estar vacá­a.',
        'error-password-requisitos': 'Debe tener má­nimo 8 caracteres.',
            'error-nombre-vacio': 'El nombre es obligatorio.',
            'error-credenciales': 'Credenciales incorrectas. Intente de nuevo.',
            'error-passwords-no-coinciden': 'Las contraseá±as no coinciden.',
            'placeholder-nombre': 'Nombre', // <<-- AáADIDO
        'texto-password-rules': 'Má­nimo 8 caracteres',
            'texto-inicia-sesion': 'Inicia sesiá³n'
         },
         'en': {
            'titulo-login': 'LOGIN',
            'titulo-registro': 'CREATE ACCOUNT',
            'titulo-recuperar': 'RECOVER PASSWORD',
            'titulo-cambiar': 'CHANGE PASSWORD',
            'placeholder-email': 'user@domain.com',
            'placeholder-password': 'Password',
            'placeholder-confirmar': 'Confirm Password', // <<-- AáADIDO
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
        'error-password-requisitos': 'Must have at least 8 characters.',
            'error-nombre-vacio': 'Name is required.',
            'error-credenciales': 'Incorrect credentials. Please try again.',
            'error-passwords-no-coinciden': 'Passwords do not match.',
            'placeholder-nombre': 'Name', // <<-- AáADIDO
        'texto-password-rules': 'Minimum 8 characters',
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

   // Funciá³n para actualizar el texto del botá³n de idioma
   function actualizarTextoBotonIdioma(boton, idioma) {
      if (idioma === 'es') {
         boton.innerHTML = '<i class="fa-solid fa-globe"></i> ES';
      } else {
         boton.innerHTML = '<i class="fa-solid fa-globe"></i> EN';
      }
   }

   // ================================
   // LOGIN (conexiá³n a base de datos) - IDs ACTUALIZADOS
   // ================================
   const loginForm = document.getElementById("loginForm");
   if (loginForm) {
      const button = document.getElementById("loginButton");
      
      // Permitir envá­o normal solo con validaciá³n HTML5 (type="email", required)
      // Django maneja la autenticaciá³n
      button.disabled = false;
      
      // Toggle de contraseá±a
   // ================================
   const botonAyuda = document.querySelector('.boton-ayuda');
   if (botonAyuda) {
         botonAyuda.addEventListener('click', () => {
               // ... [La lá³gica del modal de ayuda permanece igual] ...
               
               // Crear modal de ayuda completamente con JavaScript
               const modalOverlay = document.createElement('div');
               modalOverlay.className = 'modal-overlay';
               modalOverlay.id = 'modalAyuda';
               modalOverlay.style.display = 'flex';

               // Crear contenido del modal con estilos similares a la pá¡gina
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

               // Botá³n de cerrar
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

               // Tá­tulo del modal
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
                     'Â¿Cá³mo crear una cuenta?',
                     'Para crear una cuenta, haz clic en "Crear cuenta" y completa el formulario con tus datos personales. Asegáºrate de usar un correo vá¡lido y una contraseá±a segura.'
               );

               // Pregunta 2
               const faqItem2 = createFAQItem(
                     'Â¿Olvidá© mi contraseá±a?',
                     'Haz clic en "Â¿Olvidaste tu contraseá±a?" en la pá¡gina de login. Ingresa tu correo electrá³nico y sigue las instrucciones para restablecer tu contraseá±a.'
               );

               // Pregunta 3
               const faqItem3 = createFAQItem(
                     'Requisitos de contraseá±a',
                     'La contraseá±a debe tener má­nimo 8 caracteres, incluyendo: 3 náºmeros, 3 letras, 1 sá­mbolo (@$!%*?&) y al menos una mayáºscula y una mináºscula.'
               );

               // Pregunta 4
               const faqItem4 = createFAQItem(
                     'Â¿Cá³mo contactar soporte?',
                     'Para asistencia tá©cnica, envá­a un correo a soporte@bedcom.com o llama al +1 234-567-8900. Horario de atenciá³n: Lunes a Viernes 8:00 AM - 6:00 PM.'
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

   // Funciá³n para crear items de FAQ (Sin cambios funcionales)
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
                     icon.className = isVisible ? 'fa-solid fa-circle-question' : 'fa-solid fa-circle-check';
                     icon.style.color = 'var(--color-botones)';
               }
         });

         faqItem.appendChild(preguntaElem);
         faqItem.appendChild(respuestaElem);

         return faqItem;
   }

   // Funciá³n para cerrar modal (Sin cambios funcionales)
   function cerrarModal() {
         const modal = document.getElementById('modalAyuda');
         if (modal) {
               modal.remove(); // Eliminar completamente el modal del DOM
         }
   }

   // Hacer la funciá³n global para que funcione con los eventos onclick
   window.cerrarModal = cerrarModal;

   // ================================
   // VALIDACIONES GENERALES (Sin cambios funcionales)
   // ================================
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Contraseá±a: má­nimo 8 caracteres (validaciá³n de Django) - Sin requisitos complejos
  const passwordRegex = /^.{8,}$/;
   }

   function hideError(errorSpan) {
      errorSpan.textContent = "";
      errorSpan.style.display = "none";
   }

   function validarEmail(emailInput, errorSpan) {
      // Implementar el uso de aplicarIdioma si fuera necesario, pero la lá³gica de error se mantiene
      let email = emailInput.value.trim();
      emailInput.value = email;
      const idioma = localStorage.getItem('idioma') || 'es';
      const errores = {
         'es': {
            vacio: 'El correo no puede estar vacá­o.',
            largo: 'El correo no debe superar los 54 caracteres.',
            invalido: 'Por favor, ingresa un correo electrá³nico vá¡lido (ej: usuario@dominio.com).'
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
      const errorVacio = idioma === 'es' ? 'La contraseá±a no puede estar vacá­a.' : 'Password cannot be empty.';
    const errorRequisitos = idioma === 'es' ? 'Debe tener má­nimo 8 caracteres.' : 'Must have at least 8 characters.';
      
    if (!password) {
      showError(errorSpan, errorVacio);
      return false;
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
   // REGISTRO - IDs ACTUALIZADOS Y VALIDACIáN MEJORADA
   // ================================
   const registerForm = document.getElementById("registerForm");
   if (registerForm) {
      // IDs áNICOS
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

         // Validar si las contraseá±as coinciden
         if (confirmPass) {
            if (confirmPass.value.trim() !== password.value.trim() || !confirmPass.value.trim()) {
               const idioma = localStorage.getItem('idioma') || 'es';
               const errorMsg = idioma === 'es' ? 'Las contraseá±as no coinciden.' : 'Passwords do not match.';
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
            // Aquá­ deberá­a ir la lá³gica para enviar los datos de registro a un archivo PHP/API.
            // Dejo la redirecciá³n como estaba, asumiendo que el envá­o ocurre internamente despuá©s.
            window.location.href = "/0-LOGIN/index_login.html";
         }
      });

      activarTogglePassword("registerContrasena", "toggleRegisterPassword");
      activarTogglePassword("registerConfirmar", "toggleRegisterConfirmPassword"); // Nuevo Toggle
   }

   // ================================
   // RECUPERAR CONTRASEáA - IDs ACTUALIZADOS
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
            // Enviar solicitud de recuperaciá³n
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
               // Guardar email en sessionStorage para usarlo en la pá¡gina de cambio de contraseá±a
               sessionStorage.setItem('recoveryEmail', email.value.trim());
               // Redirigir a la pá¡gina de verificaciá³n de cá³digo
               window.location.href = "verificar_codigo.html";
            } else {
               const idioma = localStorage.getItem('idioma') || 'es';
               const errorMsg = data.message || (idioma === 'es' ? 'Error al enviar el correo de recuperaciá³n.' : 'Error sending recovery email.');
               showError(emailError, errorMsg);
               button.innerHTML = 'Enviar';
               button.disabled = false;
            }
         } catch (error) {
            console.error('Error:', error);
            showError(emailError, "Error de conexiá³n. Intente nuevamente.");
            button.innerHTML = 'Enviar';
            button.disabled = false;
         }
      });
   }

   // ================================
   // VERIFICAR CáDIGO - IDs ACTUALIZADOS
   // ================================
   const verifyForm = document.getElementById("verifyForm");
   if (verifyForm) {
      const code = document.getElementById("verifyCodigo");
      const codeError = document.getElementById("verifyCodeError");
      const button = document.getElementById("verifyButton");

      function checkVerification() {
         if (!code.value.trim()) {
            const idioma = localStorage.getItem('idioma') || 'es';
            const errorMsg = idioma === 'es' ? 'El cá³digo no puede estar vacá­o.' : 'The code cannot be empty.';
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

            // Enviar cá³digo para verificaciá³n
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
               // Redirigir a la pá¡gina de cambio de contraseá±a
               window.location.href = "cambiar_password.html";
            } else {
               const idioma = localStorage.getItem('idioma') || 'es';
               const errorMsg = data.message || (idioma === 'es' ? 'Cá³digo invá¡lido o expirado.' : 'Invalid or expired code.');
               showError(codeError, errorMsg);
               button.innerHTML = 'Validar';
               button.disabled = false;
            }
         } catch (error) {
            console.error('Error:', error);
            showError(codeError, "Error de conexiá³n. Intente nuevamente.");
            button.innerHTML = 'Validar';
            button.disabled = false;
         }
      });
   }


  // CAMBIAR CONTRASEáA - Django maneja automá¡ticamente
   