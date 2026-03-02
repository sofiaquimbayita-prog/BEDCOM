/* ===============================
   PERFIL (MENÚ USUARIO)
================================ */
const perfilBtn = document.getElementById("perfilBtn");
const dropdownMenu = document.getElementById("dropdownMenu");

perfilBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle("oculto");

  const expanded = perfilBtn.getAttribute("aria-expanded") === "true";
  perfilBtn.setAttribute("aria-expanded", !expanded);
});

/* ===============================
   NOTIFICACIONES
================================ */
const notiBtn = document.getElementById("noti");
const notiMenu = document.getElementById("noti-menu");

notiBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  notiMenu.classList.toggle("oculto");
});

/* ===============================
   ACCESIBILIDAD
================================ */
const btnAccesibilidad = document.getElementById("btn-accesibilidad");
const menuAccesibilidad = document.getElementById("menu-accesibilidad");

btnAccesibilidad.addEventListener("click", (e) => {
  e.stopPropagation();
  menuAccesibilidad.style.display =
    menuAccesibilidad.style.display === "block" ? "none" : "block";
});

/* ===============================
   CERRAR MENÚS AL HACER CLICK FUERA
================================ */
document.addEventListener("click", () => {
  dropdownMenu.classList.add("oculto");
  notiMenu.classList.add("oculto");
  menuAccesibilidad.style.display = "none";

  perfilBtn.setAttribute("aria-expanded", "false");
});

/* ===============================
   BUSCADOR (BASE FUNCIONAL)
================================ */
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const texto = searchInput.value.toLowerCase();

  // Ejemplo: filtrar cards
  document.querySelectorAll(".card").forEach(card => {
    const contenido = card.innerText.toLowerCase();
    card.style.display = contenido.includes(texto) ? "block" : "none";
  });
});

