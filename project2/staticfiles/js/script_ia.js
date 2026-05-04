/**
 * script_ia.js - BEDCOM IA Assistant (SpeechRecognition)
 * Fixed: Removed buggy Vosk, reliable browser SpeechRecog (es-CO)
 * Synced from app/static/ap1/js/
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

// === ESTADO GLOBAL ===
let audioActual = null;

// --- REPRODUCCIÓN DE AUDIO ---
function reproducirVozLuna(urlAudio) {
    if (audioActual) audioActual.pause();
    if (urlAudio) {
        audioActual = new Audio(urlAudio);
        audioActual.play().catch(e => console.error("Error al reproducir voz de Luna:", e));
    }
}

// --- SPEECH RECOGNITION (Simplified & Reliable) ---
window.escucharVoz = function() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!Recognition) {
        const iaQuery = document.getElementById('iaQuery');
        if (iaQuery) iaQuery.placeholder = "Chrome/Edge requerido para mic";
        console.warn("SpeechRecognition no soportado. Usa Chrome/Edge.");
        return;
    }

    // HTTPS check (required for mic)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        const iaQuery = document.getElementById('iaQuery');
        if (iaQuery) iaQuery.placeholder = "HTTPS requerido para mic";
        console.warn("Mic requiere HTTPS (excepto localhost)");
        return;
    }

    const recognition = new Recognition();
    recognition.lang = 'es-CO';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const btnVoz = document.getElementById('btnVoz');
    
    recognition.onstart = () => {
        if (btnVoz) {
            btnVoz.innerHTML = '<i class="fa-solid fa-waveform-lines"></i>';
            btnVoz.style.background = "#ef4444";
        }
        const iaQuery = document.getElementById('iaQuery');
        if (iaQuery) iaQuery.placeholder = "Escuchando...";
        console.log("🎤 Escuchando...");
    };

    recognition.onresult = (event) => {
        const texto = event.results[0][0].transcript;
        const iaQuery = document.getElementById('iaQuery');
        if (iaQuery) iaQuery.value = texto;
        console.log("Reconocido:", texto);
        window.enviarConsultaIA();
    };

    recognition.onspeechend = () => {
        recognition.stop();
        if (btnVoz) {
            btnVoz.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            btnVoz.style.background = "#0f172a";
        }
        console.log("🛑 Escucha terminada");
    };

    recognition.onerror = (event) => {
        let msg = event.error;
        if (msg === 'network') {
            msg = 'Sin conexión/red. Revisa internet o usa localhost.';
        } else if (msg === 'not-allowed') {
            msg = 'Mic denegado. Habilita permisos en navegador.';
        } else if (msg === 'no-speech') {
            msg = 'No se detectó voz. Habla más cerca.';
        }
        console.error("❌ Error voz (" + msg + "):", event.error);
        const iaQuery = document.getElementById('iaQuery');
        if (iaQuery) iaQuery.placeholder = msg;
        if (btnVoz) {
            btnVoz.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
            btnVoz.style.background = "#1e293b";
        }
    };

    recognition.start();
};

// --- CONSULTA IA ---
window.enviarConsultaIA = function() {
    const input = document.getElementById('iaQuery');
    const chatContainer = document.getElementById('chatContainer');
    const btnPreguntar = document.getElementById('btnPreguntarIA');
    
    const pregunta = input ? input.value.trim() : '';
    if (!pregunta) return;

    if (btnPreguntar) btnPreguntar.disabled = true;
    
    if (chatContainer) {
        chatContainer.innerHTML += `<div class="msg-user"><strong>Tú:</strong><br>${pregunta}</div>`;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    if (input) input.value = '';

    const loadingMsgId = 'loadingMsg_' + Date.now();
    if (chatContainer) {
        chatContainer.innerHTML += `<div id="${loadingMsgId}" class="msg-luna msg-loading">
            <strong>Luna:</strong> (pensando<span class="typing-dots"></span>) 
            <i class="fas fa-brain spinner"></i>
        </div>`;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

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
        if (document.getElementById(loadingMsgId)) document.getElementById(loadingMsgId).remove();

        if (data.error) {
            if (chatContainer) {
                chatContainer.innerHTML += `<div class="msg-luna" style="color: #ef4444;"><strong>Error:</strong> ${data.error}</div>`;
            }
        } else {
            const respuesta = data.respuesta || 'No pude procesar tu pregunta.';
            const htmlRespuesta = typeof marked !== 'undefined' ? marked.parse(respuesta) : respuesta;
            
            if (chatContainer) {
                chatContainer.innerHTML += `<div class="msg-luna"><strong>Luna:</strong><br>${htmlRespuesta}</div>`;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
            
            if (data.audio_url) {
                reproducirVozLuna(data.audio_url);
            }
        }
    })
    .catch(error => {
        if (document.getElementById(loadingMsgId)) document.getElementById(loadingMsgId).remove();
        console.error("Error API:", error);
        if (chatContainer) {
            chatContainer.innerHTML += `<div class="msg-luna" style="color: #ef4444;"><strong>Error de conexión</strong></div>`;
        }
    })
    .finally(() => { 
        if (btnPreguntar) btnPreguntar.disabled = false; 
    });
};

// --- INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Asistente Luna cargado - Mic fixed (SpeechRecognition es-CO)");
});
