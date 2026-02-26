document.addEventListener('DOMContentLoaded', () => {
   
   // ================================
   // SELECTOR DE IDIOMA - FUNCIONALIDAD MEJORADA
   // ================================
   const botonIdioma = document.querySelector('.boton-idioma');

if (botonIdioma) {
   let idiomaActual = localStorage.getItem('idioma') || 'es';

   aplicarIdioma(idiomaActual);
   actualizarTextoBotonIdioma(botonIdioma, idiomaActual);

   botonIdioma.addEventListener('click', () => {
      if (idiomaActual === 'es') {
         idiomaActual = 'en';
      } else {
         idiomaActual = 'es';
      }

      localStorage.setItem('idioma', idiomaActual);
      aplicarIdioma(idiomaActual);
      actualizarTextoBotonIdioma(botonIdioma, idiomaActual);
   });
}

   function aplicarIdioma(idioma) {
      const elementosTraducibles = {
         'es': {
            'titulo-login': 'INICIAR SESION',
            'titulo-registro': 'CREAR CUENTA',
            'titulo-recuperar': 'RECUPERAR CONTRASENA',
            'titulo-cambiar': 'CAMBIAR CONTRASENA',
            'placeholder-email': 'usuario@dominio.com',
            'placeholder-password': 'Contrasena',
            'placeholder-confirmar': 'Confirmar Contrasena',
            'label-nombre': 'Nombre',
            'label-correo': 'Correo electronico',
            'label-contrasena': 'Contrasena',
            'label-confirmar': 'Confirmar contrasena',
            'texto-continuar': 'Continuar',
            'texto-registrar': 'REGISTRAR',
            'texto-validar': 'VALIDAR',
            'texto-generar-codigo': 'Generar codigo de verificacion',
            'texto-olvidaste': '¿Olvidaste tu contrasena?',
            'texto-crear-cuenta': '¿No tienes una cuenta? Crear cuenta',
            'texto-ya-tienes': '¿Ya tienes una cuenta? Inicia sesion',
            'texto-ingresa-correo': 'Ingrese un correo',
            'texto-codigo-enviado': 'Ingresa el codigo enviado al correo',
            'error-email-vacio': 'El correo no puede estar vacio.',
            'error-email-largo': 'El correo no debe superar los 54 caracteres.',
            'error-email-invalido': 'Por favor, ingresa un correo electronico valido.',
            'error-password-vacio': 'La contrasena no puede estar vacia.',
            'error-password-requisitos': 'Debe tener minimo 8 caracteres.',
            'error-nombre-vacio': 'El nombre es obligatorio.',
            'error-credenciales': 'Credenciales incorrectas. Intente de nuevo.',
            'error-passwords-no-coinciden': 'Las contrasenas no coinciden.',
            'placeholder-nombre': 'Nombre',
            'texto-password-rules': 'Minimo 8 caracteres',
            'texto-inicia-sesion': 'Inicia sesion'
         },
         'en': {
            'titulo-login': 'LOGIN',
            'titulo-registro': 'CREATE ACCOUNT',
            'titulo-recuperar': 'RECOVER PASSWORD',
            'titulo-cambiar': 'CHANGE PASSWORD',
            'placeholder-email': 'user@domain.com',
            'placeholder-password': 'Password',
            'placeholder-confirmar': 'Confirm Password',
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
            'error-email-invalido': 'Please enter a valid email address.',
            'error-password-vacio': 'Password cannot be empty.',
            'error-password-requisitos': 'Must have at least 8 characters.',
            'error-nombre-vacio': 'Name is required.',
            'error-credenciales': 'Incorrect credentials. Please try again.',
            'error-passwords-no-coinciden': 'Passwords do not match.',
            'placeholder-nombre': 'Name',
            'texto-password-rules': 'Minimum 8 characters',
            'texto-inicia-sesion': 'Log in'
         }
      };

      const traducciones = elementosTraducibles[idioma];
      
      document.querySelectorAll('[data-i18n]').forEach(elemento => {
         const clave = elemento.getAttribute('data-i18n');
         if (traducciones[clave]) {
            if (elemento.tagName === 'INPUT' && elemento.placeholder && elemento.getAttribute('data-i18n-placeholder') === clave) {
               elemento.placeholder = traducciones[clave];
            } else if (!elemento.hasAttribute('data-i18n-placeholder')) {
               elemento.textContent = traducciones[clave];
            }
         }
      });
   }

   function actualizarTextoBotonIdioma(boton, idioma) {
      if (idioma === 'es') {
         boton.innerHTML = '<i class="fa-solid fa-globe"></i> ES';
      } else {
         boton.innerHTML = '<i class="fa-solid fa-globe"></i> EN';
      }
   }

   // ================================
   // LOGIN
   // ================================
   const loginForm = document.getElementById("loginForm");
   if (loginForm) {
      const button = document.getElementById("loginButton");
      button.disabled = false;
      
      const botonAyuda = document.querySelector('.boton-ayuda');
      if (botonAyuda) {
         botonAyuda.addEventListener('click', () => {
               const modalOverlay = document.createElement('div');
               modalOverlay.className = 'modal-overlay';
               modalOverlay.id = 'modalAyuda';
               modalOverlay.style.display = 'flex';

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

               const faqContainer = document.createElement('div');
               
               const faqItem1 = createFAQItem('¿Como crear una cuenta?', 'Para crear una cuenta, haz clic en "Crear cuenta" y completa el formulario con tus datos personales.');
               const faqItem2 = createFAQItem('¿Olvide mi contrasena?', 'Haz clic en "¿Olvidaste tu contrasena?" en la pagina de login.');
               const faqItem3 = createFAQItem('Requisitos de contrasena', 'La contrasena debe tener minimo 8 caracteres.');
               const faqItem4 = createFAQItem('¿Como contactar soporte?', 'Envia un correo a soporte@bedcom.com o llama al +1 234-567-8900.');

               faqContainer.appendChild(faqItem1);
               faqContainer.appendChild(faqItem2);
               faqContainer.appendChild(faqItem3);
               faqContainer.appendChild(faqItem4);

               modalContent.appendChild(closeButton);
               modalContent.appendChild(modalTitle);
               modalContent.appendChild(faqContainer);

               modalOverlay.appendChild(modalContent);
               document.body.appendChild(modalOverlay);

               modalOverlay.addEventListener('click', (e) => {
                     if (e.target === modalOverlay) {
                           cerrarModal();
                     }
               });

               modalContent.addEventListener('click', (e) => {
                     e.stopPropagation();
               });
         });
      }
   }

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

         preguntaElem.addEventListener('click', () => {
               const isVisible = respuestaElem.style.display === 'block';
               respuestaElem.style.display = isVisible ? 'none' : 'block';
               
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

   function cerrarModal() {
         const modal = document.getElementById('modalAyuda');
         if (modal) {
               modal.remove();
         }
   }

   window.cerrarModal = cerrarModal;

   // ================================
   // VALIDACIONES GENERALES
   // ================================
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   const passwordRegex = /^.{8,}$/;

   function hideError(errorSpan) {
      errorSpan.textContent = "";
      errorSpan.style.display = "none";
   }

   function showError(errorSpan, message) {
      errorSpan.textContent = message;
      errorSpan.style.display = "block";
   }

   function validarEmail(emailInput, errorSpan) {
      let email = emailInput.value.trim();
      emailInput.value = email;
      const idioma = localStorage.getItem('idioma') || 'es';
      const errores = {
         'es': {
            vacio: 'El correo no puede estar vacio.',
            largo: 'El correo no debe superar los 54 caracteres.',
            invalido: 'Por favor, ingresa un correo electronico valido.'
         },
         'en': {
            vacio: 'Email cannot be empty.',
            largo: 'Email must not exceed 54 characters.',
            invalido: 'Please enter a valid email address.'
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
      const errorVacio = idioma === 'es' ? 'La contrasena no puede estar vacia.' : 'Password cannot be empty.';
      
      if (!password) {
         showError(errorSpan, errorVacio);
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
   // REGISTRO
   // ================================
   const registerForm = document.getElementById("registerForm");
   if (registerForm) {
      const name = document.getElementById("registerNombre");
      const nameError = document.getElementById("registerNameError");
      const email = document.getElementById("registerCorreo");
      const emailError = document.getElementById("registerEmailError");
      const password = document.getElementById("registerContrasena");
      const passwordError = document.getElementById("registerPasswordError");
      const confirmPass = document.getElementById("registerConfirmar");
      const confirmError = document.getElementById("registerConfirmError");
      const button = document.getElementById("registerButton");

      function checkRegister() {
         const okName = validarNombre(name, nameError);
         const okEmail = validarEmail(email, emailError);
         const okPass = validarPassword(password, passwordError);
         let okConfirm = true;

         if (confirmPass) {
            if (confirmPass.value.trim() !== password.value.trim() || !confirmPass.value.trim()) {
               const idioma = localStorage.getItem('idioma') || 'es';
               const errorMsg = idioma === 'es' ? 'Las contrasenas no coinciden.' : 'Passwords do not match.';
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
            window.location.href = "/0-LOGIN/index_login.html";
         }
      });

      activarTogglePassword("registerContrasena", "toggleRegisterPassword");
      activarTogglePassword("registerConfirmar", "toggleRegisterConfirmPassword");
   }

   // ================================
   // RECUPERAR CONTRASENA
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

         button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
         button.disabled = true;

         try {
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
               sessionStorage.setItem('recoveryEmail', email.value.trim());
               window.location.href = "verificar_codigo.html";
            } else {
               const idioma = localStorage.getItem('idioma') || 'es';
               const errorMsg = data.message || (idioma === 'es' ? 'Error al enviar el correo.' : 'Error sending email.');
               showError(emailError, errorMsg);
               button.innerHTML = 'Enviar';
               button.disabled = false;
            }
         } catch (error) {
            showError(emailError, "Error de conexion. Intente nuevamente.");
            button.innerHTML = 'Enviar';
            button.disabled = false;
         }
      });
   }

   // ================================
   // VERIFICAR CODIGO
   // ================================
   const verifyForm = document.getElementById("verifyForm");
   if (verifyForm) {
      const code = document.getElementById("verifyCodigo");
      const codeError = document.getElementById("verifyCodeError");
      const button = document.getElementById("verifyButton");

      function checkVerification() {
         if (!code.value.trim()) {
            const idioma = localStorage.getItem('idioma') || 'es';
            const errorMsg = idioma === 'es' ? 'El codigo no puede estar vacio.' : 'The code cannot be empty.';
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

         button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
         button.disabled = true;

         try {
            const recoveryEmail = sessionStorage.getItem('recoveryEmail');
            
            if (!recoveryEmail) {
               window.location.href = "recuperar_password.html";
               return;
            }

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
               window.location.href = "cambiar_password.html";
            } else {
               const idioma = localStorage.getItem('idioma') || 'es';
               const errorMsg = data.message || (idioma === 'es' ? 'Codigo invalido o expirado.' : 'Invalid or expired code.');
               showError(codeError, errorMsg);
               button.innerHTML = 'Validar';
               button.disabled = false;
            }
         } catch (error) {
            showError(codeError, "Error de conexion. Intente nuevamente.");
            button.innerHTML = 'Validar';
            button.disabled = false;
         }
      });
   }
});
