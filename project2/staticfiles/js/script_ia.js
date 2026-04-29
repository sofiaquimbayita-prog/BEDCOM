/**
 * script_ia.js - Gestión del Asistente IA de BEDCOM
 * Desarrollado para: Edgar Mendivelso
 */

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

window.abrirModalIA = function() {
    const modal = document.getElementById('modalIA');
    if (modal) {
        modal.classList.remove('oculto');
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.getElementById('iaQuery').focus();
    }
};

window.cerrarModalIA = function() {
    const modal = document.getElementById('modalIA');
    if (modal) {
        modal.classList.remove('show');
        modal.classList.add('oculto');
        modal.style.display = 'none';
        document.getElementById('iaQuery').value = '';
        // Reiniciar el contenedor al estado inicial
        document.getElementById('chatContainer').innerHTML = '<div id="iaResponse" style="line-height: 1.5; color: #94a3b8;">Esperando tu consulta...</div>';
    }
};

window.enviarConsultaIA = function() {
    const input = document.getElementById('iaQuery');
    const chatContainer = document.getElementById('chatContainer');
    const pregunta = input.value.trim();

    if (!pregunta) return;

    // 1. Mostrar tu pregunta con saltos de línea colapsados
    chatContainer.innerHTML += `<div class="text-end mb-3" style="color: #e2e8f0;"><strong>Tú:</strong><br>${pregunta.replace(/\\n\\s*\\n/g, '\\n').replace(/\\n/g, '<br>')}</div>`;
    
    // 2. Indicador de carga
    const loadingId = "loading-" + Date.now();
    chatContainer.innerHTML += `<div id="${loadingId}" class="text-start mb-3" style="color: #94a3b8;"><em>Luna está escribiendo...</em></div>`;
    
    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    fetch('/vistas/ia/asistente-inventario/api-consultar/', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ pregunta: pregunta })
    })
    .then(response => response.json())
    .then(data => {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        
        // --- AQUÍ ESTÁ EL TRUCO PARA LOS SALTOS DE LÍNEA ---
        // Creamos un DIV nuevo para la respuesta
        const aiDiv = document.createElement('div');
        aiDiv.className = "text-start mb-3";
        aiDiv.style.color = "#38bdf8";
        
        // Ponemos el encabezado "IA:" sin br extra
        aiDiv.innerHTML = `<strong>LUNA: </strong>`;
        
        // Creamos un SPAN especial para el contenido
        const textContent = document.createElement('span');
        
        // ESTA PROPIEDAD ES LA QUE HACE LA MAGIA
        textContent.style.whiteSpace = "pre-wrap"; 
        textContent.style.display = "block";
        
        // Convertimos múltiples saltos de línea: colapsa \n\n a single \n, luego a <br>
        textContent.innerHTML = data.respuesta.replace(/\\n\\s*\\n/g, '\\n').replace(/\\n/g, '<br>');
        
        aiDiv.appendChild(textContent);
        chatContainer.appendChild(aiDiv);
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    })
    .catch(error => {
        console.error('Error:', error);
    });
};
const lectura = new SpeechSynthesisUtterance(data.respuesta);
lectura.lang = 'es-MX';
window.speechSynthesis.speak(lectura);

window.escucharVoz = function() {
    // Verificar si el navegador soporta reconocimiento de voz
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!Recognition) {
        alert("Tu navegador no soporta reconocimiento de voz. Intenta con Chrome o Edge.");
        return;
    }

    const recognition = new Recognition();
    recognition.lang = 'es-CO'; // Configurado para Colombia
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const btnVoz = document.getElementById('btnVoz');
    
    // Cambiar color del botón mientras escucha
    recognition.onstart = () => {
        btnVoz.style.background = "#ef4444"; // Rojo mientras escucha
        btnVoz.innerHTML = '<i class="fa-solid fa-waveform-lines"></i>';
    };

    recognition.onresult = (event) => {
        const textoEscuchado = event.results[0][0].transcript;
        document.getElementById('iaQuery').value = textoEscuchado;
        // Opcional: enviar automáticamente al terminar de hablar
        // enviarConsultaIA(); 
    };

    recognition.onspeechend = () => {
        recognition.stop();
        btnVoz.style.background = "#1e293b";
        btnVoz.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    };

    recognition.onerror = (event) => {
        console.error("Error de voz: ", event.error);
        btnVoz.style.background = "#1e293b";
        btnVoz.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    };

    recognition.start();
};
// Configuración de eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    const iaQuery = document.getElementById('iaQuery');
    if (iaQuery) {
        iaQuery.addEventListener('keypress', function(e) {
            // Enviar con Enter, pero permitir Salto de línea con Shift+Enter
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarConsultaIA();
            }
        });
    }
    
    // Auto-scroll inicial si hay mensajes
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
