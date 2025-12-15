// =============================
// TODO EL SCRIPT EN UN SOLO DOMContentLoaded
// =============================
document.addEventListener("DOMContentLoaded", () => {
  
  // =========================
  // CALENDARIO SEMANAL
  // =========================
  const eventos = [
    { fecha: "2025-12-9", titulo: "Reunión", icono: "📌" },
    { fecha: "2025-12-11", titulo: "Fiesta", icono: "🎉" },
    { fecha: "2025-12-12", titulo: "Fiesta", icono: "🎉" },
    { fecha: "2025-12-14", titulo: "Entrega", icono: "📦" },
    { fecha: "2026-01-05", titulo: "Reunión", icono: "📌" }
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

  

 
});