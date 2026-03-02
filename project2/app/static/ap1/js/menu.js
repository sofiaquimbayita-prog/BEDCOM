// =============================
// TODO EL SCRIPT EN UN SOLO DOMContentLoaded
// =============================
document.addEventListener("DOMContentLoaded", () => {
  // PERFIL Y LOGOUT
  const perfilBtn = document.getElementById("perfilBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const homeBtn = document.getElementById("homeBtn");

  if (perfilBtn && dropdownMenu) {
    perfilBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que el clic se propague
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

  // if (logoutBtn) {
  //   logoutBtn.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     window.location.href = "/0-LOGIN/index_login.php";
  //   });
  // }

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
  // BARRA DE BÚSQUEDA
  // =============================
  const searchInput = document.getElementById("searchInput");
  const tiles = document.querySelectorAll(".menu-grid .tile");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      tiles.forEach(tile => {
        const title = tile.querySelector("h3").textContent.toLowerCase();
        const subtitle = tile.querySelector(".muted").textContent.toLowerCase();
        tile.style.display = title.includes(query) || subtitle.includes(query) ? "" : "none";
      });
    });
  }

  // ============================
  // MANEJO DE NOTIFICACIONES
  // ============================

  // Referencias
  const notiBtn = document.getElementById("noti");
  const notiMenu = document.getElementById("noti-menu");
  const bell = document.querySelector(".icono-noti");

  // Crear badge dinámico
  const badge = document.createElement("span");
  badge.classList.add("noti-badge");
  badge.textContent = "0";
  notiBtn.appendChild(badge);
  
  // Estado
  let notiCount = 0;
  let notificaciones = []; // aquí guardamos los mensajes

  // Toggle menú
  notiBtn.addEventListener("click", () => {
    notiMenu.classList.toggle("oculto");
  });

  // Función para renderizar lista
  function renderNotificaciones() {
    const notiList = notiMenu.querySelector("ul");
    notiList.innerHTML = ""; // limpiar lista
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

  // Actualizar notificaciones
  function actualizarNotificaciones(nuevas) {
    // agregar mensajes
    notificaciones.push(...nuevas);
    notiCount = notificaciones.length;

    // actualizar badge
    badge.textContent = notiCount > 9 ? "9+" : notiCount;
    badge.classList.add("pop");
    setTimeout(() => badge.classList.remove("pop"), 400);

    // actualizar lista
    renderNotificaciones();

    // animar campana
    sonarCampanita();
  }

  // Animación campana
  function sonarCampanita() {
    bell.classList.add("ring");

    // Quita la clase cuando termine la animación
    bell.addEventListener("animationend", () => {
      bell.classList.remove("ring");
    }, { once: true });
  }

  // ============================
  // EJEMPLO DE USO
  // ============================
  // Simulamos que llegan notis después de 3s
  setTimeout(() => {
    actualizarNotificaciones([
      "Nueva entrada registrada",
      "Stock bajo: Tornillos",
      "Entrega programada mañana"
    ]);
  }, 3000);

  // Otra tanda a los 6s
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

  // Cierra si haces clic fuera
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
