document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const modalCrear = document.getElementById('form-modal-container');
  const modalDetalle = document.getElementById('event-modal');
  const formCrear = document.getElementById("event-form");
  const btnAbrirCrear = document.getElementById('btn-nueva-actividad');
  const btnCerrarCrear = document.querySelectorAll('.close-modal-form');
  const btnCerrarDetalle = document.querySelector('.close-modal');

  let selectedEvent = null; // Para saber qué evento borrar o editar

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
    },
    // RUTA DE LECTURA 
    events: '/vistas/calendario/data/', 

    eventClick: function(info) {
      selectedEvent = info.event;
      document.getElementById("modal-title").innerText = selectedEvent.title;
      document.getElementById("modal-date").innerText = selectedEvent.start.toLocaleDateString();
      document.getElementById("modal-time").innerText = selectedEvent.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      document.getElementById("modal-description").innerText = selectedEvent.extendedProps.description || "Sin descripción";
      document.getElementById("modal-category").innerText = selectedEvent.extendedProps.category;
      
      modalDetalle.style.display = "flex";
    },

    dateClick: function(info) {
      document.getElementById("date").value = info.dateStr;
      modalCrear.style.display = "flex";
    }
  });

  calendar.render();

// 3. Lógica de Modales (Abrir/Cerrar)
if (btnAbrirCrear) {
  btnAbrirCrear.onclick = () => modalCrear.style.display = 'flex';
}

// Cerrar modal de creación (todas las X)
if (btnCerrarCrear.length > 0) {
  btnCerrarCrear.forEach(btn => {
    btn.onclick = () => {
      modalCrear.style.display = 'none';
      formCrear.reset();
    };
  });
}

// Cerrar modal de detalle
if (btnCerrarDetalle) {
  btnCerrarDetalle.onclick = () => modalDetalle.style.display = 'none';
}


  // 4. GUARDAR NUEVA ACTIVIDAD (CONEXIÓN POST A DIJANGO)
  formCrear.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    fetch('/vistas/calendario/crear/', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': getCookie('csrftoken') 
      }
    })
    .then(response => {
        if (!response.ok) throw new Error('Error en el servidor');
        return response.json();
    })
    .then(data => {
      if (data.status === 'success') {
        calendar.refetchEvents(); 
        modalCrear.style.display = 'none';
        formCrear.reset();
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch(error => console.error('Error al guardar:', error));
  });

  // 5. ELIMINAR ACTIVIDAD
  const btnEliminar = document.getElementById("delete-event");
  if(btnEliminar) {
    btnEliminar.addEventListener("click", function() {
        if (confirm("¿Estás seguro de eliminar esta actividad?")) {
          fetch(`/vistas/calendario/eliminar/${selectedEvent.id}/`, {
            method: 'POST',
            headers: {
              'X-CSRFToken': getCookie('csrftoken')
            }
          })
          .then(response => response.json())
          .then(data => {
            if (data.status === 'success') {
              selectedEvent.remove();
              modalDetalle.style.display = "none";
            }
          });
        }
      });
  }

  // FUNCIÓN AUXILIAR: Obtener el Token CSRF de las cookies
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }
});