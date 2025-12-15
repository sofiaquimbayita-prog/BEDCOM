// ==========================================================
// script_global.js (Cargado en base.html - LÓGICA GLOBAL)
// Funciones universales: Perfil, Notificaciones, Accesibilidad.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    
    // =========================
    // PERFIL Y LOGOUT
    // =========================
    const perfilBtn = document.getElementById("perfilBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");
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

    if (homeBtn) {
        homeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // AJUSTAR RUTA DE DJANGO si es necesario
            window.location.href = "/vistas/menu/"; 
        });
    }

    // ============================
    // MANEJO DE NOTIFICACIONES
    // ============================

    const notiBtn = document.getElementById("noti");
    
    if (notiBtn) {
        // DEFINICIÓN DE REFERENCIAS INTERNAS DENTRO DEL BLOQUE
        const notiMenu = document.getElementById("noti-menu");
        const bell = document.querySelector(".icono-noti");

        // Crear badge dinámico
        const badge = document.createElement("span");
        badge.classList.add("noti-badge");
        badge.textContent = "0";
        notiBtn.appendChild(badge);
        
        let notiCount = 0;
        let notificaciones = [];

        // Toggle menú
        notiBtn.addEventListener("click", () => {
            if (notiMenu) {
                 notiMenu.classList.toggle("oculto");
            }
        });

        function renderNotificaciones() {
            if (!notiMenu) return; 
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
            if (!notiMenu || !bell) return; 
            notificaciones.push(...nuevas);
            notiCount = notificaciones.length;

            badge.textContent = notiCount > 9 ? "9+" : notiCount;
            badge.classList.add("pop");
            setTimeout(() => badge.classList.remove("pop"), 400);

            renderNotificaciones();
            sonarCampanita();
        }

        function sonarCampanita() {
            if (!bell) return; 
            bell.classList.add("ring");
            bell.addEventListener("animationend", () => {
                bell.classList.remove("ring");
            }, { once: true });
        }
        
        // EJEMPLO DE USO (Simulación de notificaciones)
        setTimeout(() => {
            actualizarNotificaciones(["Nueva entrada registrada", "Stock bajo: Tornillos", "Entrega programada mañana"]);
        }, 3000);

        setTimeout(() => {
            actualizarNotificaciones(["Actualización del sistema completada"]);
        }, 6000);
    } // Fin if notiBtn

    // ==================================
    // ACCESIBILIDAD
    // ==================================
    const btnAccesibilidad = document.getElementById("btn-accesibilidad");
    const menuAccesibilidad = document.getElementById("menu-accesibilidad");
    
    // Solo si los elementos principales existen, buscamos los demás y ejecutamos la lógica
    if (btnAccesibilidad && menuAccesibilidad) {
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
        
        // Listeners individuales
        if (aumentarTextoBtn) {
             aumentarTextoBtn.addEventListener("click", () => {
                fontSize += 2;
                body.style.fontSize = fontSize + "px";
            });
        }
        if (disminuirTextoBtn) {
            disminuirTextoBtn.addEventListener("click", () => {
                fontSize -= 2;
                body.style.fontSize = fontSize + "px";
            });
        }
        if (altoContrasteBtn) altoContrasteBtn.addEventListener("click", () => body.classList.toggle("alto-contraste"));
        if (modoOscuroBtn) modoOscuroBtn.addEventListener("click", () => body.classList.toggle("dark-mode"));
        if (resaltarEnlacesBtn) resaltarEnlacesBtn.addEventListener("click", () => body.classList.toggle("resaltar-enlaces"));
        if (fuenteLegibleBtn) fuenteLegibleBtn.addEventListener("click", () => body.classList.toggle("fuente-legible"));
        if (cursorGrandeBtn) cursorGrandeBtn.addEventListener("click", () => body.classList.toggle("cursor-grande"));
        if (desaturarBtn) desaturarBtn.addEventListener("click", () => body.classList.toggle("blanco-negro"));
        
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                body.className = "";
                body.style.fontSize = "16px";
                fontSize = 16;
            });
        }
    } // Fin if btnAccesibilidad
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
});