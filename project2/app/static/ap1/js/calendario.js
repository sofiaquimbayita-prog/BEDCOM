document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const currentMonthElement = document.getElementById("current-month");
  
  // Obtener referencia a los campos del formulario
  const titleInput = document.getElementById("title");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const descriptionInput = document.getElementById("description");
  const categorySelect = document.getElementById("category");

  // Variables para el modal y el evento seleccionado
  const modal = document.getElementById('event-modal');
  const closeModalBtn = document.querySelector('.close-modal');
  const closeModalBtn2 = document.getElementById('close-modal');
  let selectedEvent = null;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    headerToolbar: false,
    events: [],
    dateClick: function(info) {
      // Remover clase de selección anterior
      document.querySelectorAll('.fc-daygrid-day.fecha-seleccionada').forEach(el => {
        el.classList.remove('fecha-seleccionada');
      });
      
      // Agregar clase a la fecha clickeada
      info.dayEl.classList.add('fecha-seleccionada');
      
      // Establecer la fecha en el formulario
      dateInput.value = info.dateStr;
    },
    datesSet: function(info) {
      // Actualizar el título del mes actual
      const title = info.view.title;
      currentMonthElement.textContent = title;
    },
    eventClick: function(info) {
      info.jsEvent.preventDefault();
      showEventDetails(info.event);
    }
  });

  calendar.render();

  // Actualizar el título del mes inicial
  currentMonthElement.textContent = calendar.view.title;

  // Navegación
  document.getElementById("prev").addEventListener("click", () => {
    calendar.prev();
  });
  document.getElementById("next").addEventListener("click", () => {
    calendar.next();
  });
  document.getElementById("today").addEventListener("click", () => {
    calendar.today();
  });

  // Configurar event listeners para el modal
  closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
  closeModalBtn2.addEventListener('click', () => modal.style.display = 'none');

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Función para mostrar detalles del evento
  function showEventDetails(event) {
    selectedEvent = event;
    
    // Formatear fecha y hora
    const eventDate = event.start.toLocaleDateString('es-ES');
    const eventTime = event.start.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Llenar modal con información del evento
    document.getElementById('modal-title').textContent = event.title;
    document.getElementById('modal-date').textContent = eventDate;
    document.getElementById('modal-time').textContent = eventTime;
    document.getElementById('modal-description').textContent = event.extendedProps.description || 'Sin descripción';
    document.getElementById('modal-category').textContent = event.extendedProps.category || 'Sin categoría';
    
    // Mostrar modal
    modal.style.display = 'flex';
  }

  // Función para encontrar un evento por título y fecha
  function findEventByDetails(title, dateTimeStr) {
    const allEvents = calendar.getEvents();
    return allEvents.find(event => 
      event.title === title && event.start.toISOString() === dateTimeStr
    );
  }

  // Mostrar/ocultar campo personalizado para categoría "Otro"
  categorySelect.addEventListener('change', function() {
    const customCategoryContainer = document.getElementById('custom-category-container');
    const customCategoryInput = document.getElementById('custom-category');
    
    if (this.value === 'otro') {
      customCategoryContainer.style.display = 'flex';
      customCategoryInput.setAttribute('required', 'required');
    } else {
      customCategoryContainer.style.display = 'none';
      customCategoryInput.removeAttribute('required');
    }
  });

  // Agregar evento
  const form = document.getElementById("event-form");
  const list = document.getElementById("event-list");
  const search = document.getElementById("search");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = titleInput.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const description = descriptionInput.value;
    const category = categorySelect.value;

    if (!title || !date || !time || !category) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    // Manejar categoría personalizada
    let finalCategory = category;
    if (category === 'otro') {
      const customCategory = document.getElementById('custom-category').value;
      if (!customCategory) {
        alert("Por favor ingresa un nombre para la categoría personalizada.");
        return;
      }
      finalCategory = customCategory;
    }

    // CORRECCIÓN: Crear fecha ISO correctamente
    const startDateTime = new Date(`${date}T${time}:00`);
    const isoString = startDateTime.toISOString();

    const eventObj = {
      title: title,
      start: isoString, // Usar la fecha ISO corregida
      allDay: false, // Importante: especificar que no es evento de día completo
      extendedProps: { description, category: finalCategory }
    };

    // Añadir al calendario
    const addedEvent = calendar.addEvent(eventObj);
    
    // Asignar color según categoría
    switch(finalCategory) {
      case "reunion":
        addedEvent.setProp('color', '#FF9F43');
        break;
      case "tarea":
        addedEvent.setProp('color', '#ED5565');
        break;
      case "evento":
        addedEvent.setProp('color', '#48CFAD');
        break;
      default:
        addedEvent.setProp('color', '#AC92EC');
    }

    // Añadir a la lista
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${title}</strong>
        <div>${date} ${time}</div>
      </div>
      <span class="event-category">${finalCategory}</span>
    `;
    
    // Almacenar información del evento en el elemento li
    li.dataset.eventTitle = title;
    li.dataset.eventStart = isoString;
    
    // Añadir funcionalidad para mostrar detalles al hacer clic
    li.addEventListener('click', function() {
      const eventTitle = this.dataset.eventTitle;
      const eventStart = this.dataset.eventStart;
      const event = findEventByDetails(eventTitle, eventStart);
      
      if (event) {
        showEventDetails(event);
      }
    });
    
    list.appendChild(li);

    // Reset form
    form.reset();
    
    // Ocultar campo personalizado si estaba visible
    document.getElementById('custom-category-container').style.display = 'none';
  });

  // Eliminar evento
  document.getElementById('delete-event').addEventListener('click', function() {
    if (selectedEvent && confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      // Eliminar del calendario
      selectedEvent.remove();
      
      // Eliminar de la lista
      const eventItems = document.querySelectorAll('#event-list li');
      eventItems.forEach(item => {
        if (item.dataset.eventTitle === selectedEvent.title && 
            item.dataset.eventStart === selectedEvent.start.toISOString()) {
          item.remove();
        }
      });
      
      modal.style.display = 'none';
      selectedEvent = null;
    }
  });

  // Editar evento (pendiente de implementación)
  document.getElementById('edit-event').addEventListener('click', function() {
    alert('Funcionalidad de edición pendiente de implementar');
  });

  // Búsqueda
  search.addEventListener("input", () => {
    const term = search.value.toLowerCase();
    const items = list.querySelectorAll("li");
    items.forEach(item => {
      const textContent = item.textContent.toLowerCase();
      item.style.display = textContent.includes(term) ? "flex" : "none";
    });
  });
  
  // Establecer fecha mínima como hoy
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate();
  
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  
  const todayStr = `${yyyy}-${mm}-${dd}`;
  dateInput.setAttribute('min', todayStr);
});
// --- MENÚ DE ACCESIBILIDAD ---
const btnAccesibilidad = document.getElementById("btn-accesibilidad");
const menuAccesibilidad = document.getElementById("menu-accesibilidad");

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

// --- FUNCIONES DE ACCESIBILIDAD ---
let fontSize = 16;

// Aumentar texto
document.getElementById("aumentar-texto").addEventListener("click", () => {
  fontSize += 2;
  document.body.style.fontSize = fontSize + "px";
});

// Disminuir texto
document.getElementById("disminuir-texto").addEventListener("click", () => {
  fontSize -= 2;
  document.body.style.fontSize = fontSize + "px";
});

// Alto contraste
document.getElementById("alto-contraste").addEventListener("click", () => {
  document.body.classList.toggle("alto-contraste");
});

// Modo oscuro
document.getElementById("modo-oscuro").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Resaltar enlaces
document.getElementById("resaltar-enlaces").addEventListener("click", () => {
  document.body.classList.toggle("resaltar-enlaces");
});

// Fuente legible
document.getElementById("fuente-legible").addEventListener("click", () => {
  document.body.classList.toggle("fuente-legible");
});

// Cursor grande
document.getElementById("cursor-grande").addEventListener("click", () => {
  document.body.classList.toggle("cursor-grande");
});

// Blanco y negro
document.getElementById("desaturar").addEventListener("click", () => {
  document.body.classList.toggle("blanco-negro");
});

// Reset accesibilidad
document.getElementById("reset-accesibilidad").addEventListener("click", () => {
  document.body.className = "";
  document.body.style.fontSize = "16px";
  fontSize = 16;
});
