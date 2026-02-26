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

  // PERFIL Y LOGOUT
  const perfilBtn = document.getElementById("perfilBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const homeBtn = document.getElementById("homeBtn");

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
  // MODAL DE CONFIRMACIÓN
  // =====================
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  console.log('Buscando botón btnCerrarSesion:', btnCerrarSesion);
  
  if (btnCerrarSesion) {
    console.log('Botón encontrado, agregando event listener');
    btnCerrarSesion.addEventListener('click', function(e) {
      console.log('Click detectado en botón cerrar sesión');
      e.preventDefault();
      e.stopPropagation();
      
      // Verificar si ya existe un modal
      const modalExistente = document.querySelector('.modal-confirmacion');
      if (modalExistente) {
        console.log('Ya existe un modal, no crear otro');
        return;
      }
      
      console.log('Creando modal de confirmación...');
      
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
      console.log('Modal agregado al DOM');
      
      // Agregar estilos
      if (!document.getElementById('modal-confirmacion-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-confirmacion-styles';
        styles.textContent = `
          .modal-confirmacion {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px 10px;
          }
          .modal-confirmacion-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
          }
          .modal-confirmacion-content {
            position: relative;
            background: #0f172a !important;
            color: #ffffff !important;
            border-radius: 15px !important;
            padding: 30px !important;
            max-width: 400px !important;
            width: 90% !important;
            border: 1px solid #334155 !important;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6) !important;
            animation: modalFadeIn 0.3s ease-out;
            text-align: center;
          }
          @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .modal-confirmacion-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #334155;
            padding-bottom: 15px;
          }
          .modal-confirmacion-header i {
            font-size: 3rem;
            color: #ef4444;
            margin-bottom: 12px;
          }
          .modal-confirmacion-header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #ef4444;
            font-weight: 600;
          }
          .modal-confirmacion-mensaje {
            margin: 0 0 25px;
            font-size: 15px;
            color: #94a3b8;
            line-height: 1.6;
          }
          .modal-confirmacion-botones {
            display: flex;
            gap: 10px;
            justify-content: center;
          }
          .modal-confirmacion-botones button {
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
            flex: 1;
          }
          .btn-cancelar { 
            background: #1f6684 !important;
            color: white;
          }
          .btn-cancelar:hover { 
            background: #165e7a !important;
          }
          .btn-confirmar { 
            background: #ef4444;
            color: white;
          }
          .btn-confirmar:hover { 
            background: #dc2626;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          }
        `;
        document.head.appendChild(styles);
      }
      
      // Botón cancelar
      document.getElementById('btnCancelarLogout').addEventListener('click', () => {
        console.log('Clic en Cancelar');
        document.body.removeChild(modal);
      });
      
      // Botón confirmar
      document.getElementById('btnConfirmarLogout').addEventListener('click', () => {
        console.log('Clic en Confirmar - enviando formulario');
        document.body.removeChild(modal);
        const logoutForm = document.getElementById('logoutForm');
        if (logoutForm) {
          logoutForm.submit();
        }
      });
      
      // Cerrar al hacer clic en overlay
      modal.querySelector('.modal-confirmacion-overlay').addEventListener('click', () => {
        console.log('Clic en overlay - cerrando modal');
        document.body.removeChild(modal);
      });
    });
  } else {
    console.log('NO se encontró el botón btnCerrarSesion');
  }

  if (homeBtn) {
    homeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/1-MENU/menu.html";
    });
  }

  // =========================
  // CALENDARIO SEMANAL
  // =========================
  const eventos = [
    { fecha: "2025-08-26", titulo: "Reunión", icono: "📌" },
    { fecha: "2025-12-02", titulo: "Fiesta Daniel", icono: "🎉" },
    { fecha: "2025-09-01", titulo: "Fiesta", icono: "🎉" },
    { fecha: "2025-09-03", titulo: "Entrega", icono: "📦" },
    { fecha: "2025-09-05", titulo: "Reunión", icono: "📌" }
  ];

  function getStartOfWeek(fecha) {
    const dia = fecha.getDay();
    const diff = fecha.getDate() - dia + (dia === 0 ? -6 : 1);
    return new Date(fecha.setDate(diff));
  }

  function crearCalendario() {
    const calendario = document.querySelector(".calendar");
    const header = document.getElementById("calendar-header");
    if (!calendario || !header) return;

    calendario.querySelectorAll(".calendar-dates, .calendar-cells").forEach(el => el.remove());

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioSemana = getStartOfWeek(new Date(hoy));

    header.textContent = "ESTA SEMANA";

    for (let i = 0; i < 7; i++) {
      const fechaActual = new Date(inicioSemana);
      fechaActual.setDate(inicioSemana.getDate() + i);
      fechaActual.setHours(0, 0, 0, 0);

      const divDia = document.createElement("div");
      divDia.className = "calendar-dates";
      divDia.textContent = fechaActual.getDate();
      if (fechaActual.getTime() === hoy.getTime()) divDia.classList.add("hoy");

      calendario.appendChild(divDia);
    }

    for (let i = 0; i < 7; i++) {
      const fechaActual = new Date(inicioSemana);
      fechaActual.setDate(inicioSemana.getDate() + i);
      fechaActual.setHours(0, 0, 0, 0);

      const divCelda = document.createElement("div");
      divCelda.className = "calendar-cells";
      if (fechaActual.getTime() === hoy.getTime()) divCelda.classList.add("hoy");

      const fechaStr = fechaActual.toISOString().slice(0, 10);
      const eventoDelDia = eventos.find(e => e.fecha === fechaStr);

      if (eventoDelDia) {
        const icono = document.createElement("div");
        icono.className = "event-icon";
        icono.title = eventoDelDia.titulo;
        icono.textContent = eventoDelDia.icono;
        divCelda.appendChild(icono);
      }

      calendario.appendChild(divCelda);
    }
  }

  crearCalendario();

  // =============================
  // MANEJO DE NOTIFICACIONES
  // ============================

  const notiBtn = document.getElementById("noti");
  const notiMenu = document.getElementById("noti-menu");
  const bell = document.querySelector(".icono-noti");

  const badge = document.createElement("span");
  badge.classList.add("noti-badge");
  badge.textContent = "0";
  notiBtn.appendChild(badge);
  
  let notiCount = 0;
  let notificaciones = [];

  notiBtn.addEventListener("click", () => {
    notiMenu.classList.toggle("oculto");
  });

  function renderNotificaciones() {
    const notiList = notiMenu.querySelector("ul");
    notiList.innerHTML = "";
    if (notificaciones.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No hay nuevas notificaciones";
      notiList.appendChild(li);
    } else {
      notificaciones.forEach(msg => {
        const li = document.createElement("li");
        li.textContent = msg;
        notiList.appendChild(li);
      });
    }
  }

  function actualizarNotificaciones(nuevas) {
    notificaciones.push(...nuevas);
    notiCount = notificaciones.length;
    badge.textContent = notiCount > 9 ? "9+" : notiCount;
    badge.classList.add("pop");
    setTimeout(() => badge.classList.remove("pop"), 400);
    renderNotificaciones();
    sonarCampanita();
  }

  function sonarCampanita() {
    bell.classList.add("ring");
    bell.addEventListener("animationend", () => {
      bell.classList.remove("ring");
    }, { once: true });
  }

  setTimeout(() => {
    actualizarNotificaciones([
      "Nueva entrada registrada",
      "Stock bajo: Tornillos",
      "Entrega programada mañana"
    ]);
  }, 3000);

  setTimeout(() => {
    actualizarNotificaciones([
      "Actualización del sistema completada"
    ]);
  }, 6000);

  // ==================================
  // ACCESIBILIDAD
  // ==================================
  const btnAccesibilidad = document.getElementById("btn-accesibilidad");
  const menuAccesibilidad = document.getElementById("menu-accesibilidad");
  const aumentarTextoBtn = document.getElementById("aumentar-texto");
  const disminuirTextoBtn = document.getElementById("disminuir-texto");
  const altoContrasteBtn = document.getElementById("alto-contraste");
  const modoOscuroBtn = document.getElementById("modo-oscuro");
  const resaltarEnlacesBtn = document.getElementById("resaltar-enlaces");
  const fuenteLegibleBtn = document.getElementById("fuente-legible");
  const cursorGrandeBtn = document.getElementById("cursor-grande");
  const desaturarBtn = document.getElementById("desaturar");
  const resetBtn = document.getElementById("reset-accesibilidad");

  let fontSize = 16;
  const body = document.body;

  btnAccesibilidad.addEventListener("click", (e) => {
    e.stopPropagation();
    menuAccesibilidad.style.display =
      menuAccesibilidad.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!btnAccesibilidad.contains(e.target) && !menuAccesibilidad.contains(e.target)) {
      menuAccesibilidad.style.display = "none";
    }
  });

  aumentarTextoBtn.addEventListener("click", () => {
    fontSize += 2;
    body.style.fontSize = fontSize + "px";
  });

  disminuirTextoBtn.addEventListener("click", () => {
    fontSize -= 2;
    body.style.fontSize = fontSize + "px";
  });

  altoContrasteBtn.addEventListener("click", () => {
    body.classList.toggle("alto-contraste");
  });

  modoOscuroBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
  });

  resaltarEnlacesBtn.addEventListener("click", () => {
    body.classList.toggle("resaltar-enlaces");
  });

  fuenteLegibleBtn.addEventListener("click", () => {
    body.classList.toggle("fuente-legible");
  });

  cursorGrandeBtn.addEventListener("click", () => {
    body.classList.toggle("cursor-grande");
  });

  desaturarBtn.addEventListener("click", () => {
    body.classList.toggle("blanco-negro");
  });

  resetBtn.addEventListener("click", () => {
    body.className = "";
    body.style.fontSize = "16px";
    fontSize = 16;
  });
});
