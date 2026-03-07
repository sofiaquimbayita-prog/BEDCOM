/**
 * script_login.js - Funcionalidad para el formulario de inicio de sesión
 */

document.addEventListener('DOMContentLoaded', function() {
    // Toggle de contraseña para el login
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const loginContrasena = document.getElementById('loginContrasena');
    
    if (toggleLoginPassword && loginContrasena) {
        toggleLoginPassword.addEventListener('click', function() {
            // Cambiar el tipo de input entre password y text
            const type = loginContrasena.getAttribute('type') === 'password' ? 'text' : 'password';
            loginContrasena.setAttribute('type', type);
            
            // Cambiar el icono del botón
            const icon = this.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Validación de formulario de login
    const loginForm = document.getElementById('loginForm');
    const loginCorreo = document.getElementById('loginCorreo');
    const loginEmailError = document.getElementById('loginEmailError');
    const loginPasswordError = document.getElementById('loginPasswordError');
    const loginButton = document.getElementById('loginButton');
    
    if (loginForm) {
        // Validar correo en tiempo real
        if (loginCorreo) {
            loginCorreo.addEventListener('blur', function() {
                validateEmail(this.value);
            });
            
            loginCorreo.addEventListener('input', function() {
                if (loginEmailError && loginEmailError.style.display === 'block') {
                    loginEmailError.style.display = 'none';
                    this.classList.remove('input-error');
                }
            });
        }
        
        // Validar contraseña en tiempo real
        if (loginContrasena) {
            loginContrasena.addEventListener('input', function() {
                if (loginPasswordError && loginPasswordError.style.display === 'block') {
                    loginPasswordError.style.display = 'none';
                    this.classList.remove('input-error');
                }
            });
        }
        
        // Validar al enviar el formulario
        loginForm.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Validar correo
            if (loginCorreo && !validateEmail(loginCorreo.value)) {
                showError(loginCorreo, loginEmailError, 'Por favor ingresa un correo válido');
                isValid = false;
            }
            
            // Validar contraseña
            if (loginContrasena && loginContrasena.value.trim() === '') {
                showError(loginContrasena, loginPasswordError, 'Por favor ingresa tu contraseña');
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Función para validar correo electrónico
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Función para mostrar error
    function showError(input, errorElement, message) {
        if (input) {
            input.classList.add('input-error');
        }
        if (errorElement) {
            errorElement.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + message;
            errorElement.style.display = 'block';
        }
    }
    
    // Animación de entrada para el formulario
    const formulario = document.querySelector('.formulario');
    if (formulario) {
        formulario.style.opacity = '0';
        formulario.style.transform = 'translateY(20px)';
        
        setTimeout(function() {
            formulario.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            formulario.style.opacity = '1';
            formulario.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Efecto de hover en el botón de envío
    const botonr = document.querySelector('.botonr');
    if (botonr) {
        botonr.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 5px 15px rgba(0, 123, 255, 0.4)';
        });
        
        botonr.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    }
});

