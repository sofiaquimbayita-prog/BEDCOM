
function limitInput(input, maxLength) {
  if (input.value.length > maxLength) {
    input.value = input.value.slice(0, maxLength);
  }
}


function limitDigits(input, maxLength) {
  input.value = input.value.replace(/[^0-9]/g, "").slice(0, maxLength);
}


document.addEventListener("DOMContentLoaded", function () {
  validarEnTiempoReal();
});

function validarEnTiempoReal() {
  const inputs = document.querySelectorAll(
    'input[required], input[name="cedula"], input[name="telefono"]',
  );
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      validarCampo(this);
    });
    input.addEventListener("blur", function () {
      validarCampo(this);
    });
  });
  const pass1 = document.getElementById("id_password1");
  const pass2 = document.getElementById("id_password2");
  if (pass1 && pass2) {
    pass2.addEventListener("input", validarMatchPasswords);
    pass1.addEventListener("input", validarMatchPasswords);
  }
}

function validarCampo(input) {
  const name = input.name;
  const value = input.value.trim();
  let errorMsg = "";

  switch (name) {
    case "username":
      if (value.length < 5) errorMsg = "Mínimo 5 caracteres";
      break;
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) errorMsg = "Email inválido";
      break;
    case "first_name":
    case "last_name":
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) errorMsg = "Solo letras";
      break;
    case "cedula":
      if (!/^\d{10}$/.test(value)) errorMsg = "10 dígitos exactos";
      break;
    case "telefono":
      if (value && !/^\d{10}$/.test(value)) errorMsg = "10 dígitos";
      break;
    case "password1":
      if (value.length < 8) {
        errorMsg = "Mínimo 8 caracteres";
      } else if (!/[A-Z]/.test(value)) {
        errorMsg = "Requiere al menos una mayúscula";
      } else if (!/\d/.test(value)) {
        errorMsg = "Requiere al menos un número";
      } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(value)) {
        errorMsg = "Requiere al menos un carácter especial";
      }
      break;
  }

  if (errorMsg) mostrarError(input, errorMsg);
  else ocultarError(input);
}

function validarMatchPasswords() {
  const pass1 = document.getElementById("id_password1").value;
  const pass2 = document.getElementById("id_password2");
  if (pass1 !== pass2.value && pass2.value) {
    mostrarError(pass2, "Contraseñas no coinciden");
  } else if (pass2) {
    ocultarError(pass2);
  }
}

function mostrarError(input, mensaje) {
  document.getElementById("error_" + input.name).textContent = mensaje;
  document.getElementById("error_" + input.name).classList.add("show");
  input.classList.remove('success');
  input.classList.add("error");
  input.setCustomValidity(mensaje);
}

function ocultarError(input) {
  const errorId = "error_" + input.name;
  document.getElementById(errorId).textContent = "";
  document.getElementById(errorId).classList.remove("show");
  input.classList.remove("error", "success");
  input.setCustomValidity("");
  if (input.value.trim()) {
    input.classList.add("success");
  }
}

document
  .getElementById("registroForm")
  .addEventListener("submit", function (e) {
    let valido = this.checkValidity();
    if (!valido) {
      e.preventDefault();
      mostrarMensaje("error", "Corrige los errores.");
    }
  });

// Toast → usa window.mostrarMensaje() global (base.html)


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
