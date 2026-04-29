/**
 * script_ia.js - BEDCOM IA Assistant (VOSK + PIPER AUDIO)
 * Optimizado para Daniela (Voz Local)
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
let model = null;
let recognizer = null;
let audioActual = null;

// --- REPRODUCCIÓN DE AUDIO (PIPER) ---
function reproducirVozLuna(urlAudio) {
    if (audioActual) audioActual.pause();

    if (urlAudio) {
        audioActual = new Audio(urlAudio);
        audioActual.play().catch(e => console.error("Error al reproducir voz de Luna:", e));
    }
}

// --- MICROFONO LOCAL CON VOSK ---
async function inicializarVosk() {
    // VALIDACIÓN CRÍTICA: Esperar a que la librería esté cargada
    if (typeof Vosk === 'undefined') {
        throw new Error("La librería Vosk no se ha cargado. Revisa la conexión o el orden de los scripts en el HTML.");
    }

    if (!model) {
        console.log("Cargando modelo Vosk desde static...");
        // Asegúrate de que esta carpeta exista en tu static/ap1/js/
        model = await Vosk.createModel('/static/ap1/js/vosk-model-small-es-0.42/');
    }
}

window.escucharVoz = async function() {
    const btnVoz = document.getElementById('btnVoz');
    const iaQuery = document.getElementById('iaQuery');

    try {
        btnVoz.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btnVoz.style.background = "#ef4444";
        iaQuery.placeholder = "Cargando motor local...";

        await inicializarVosk();

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        recognizer = new model.KaldiRecognizer(16000);
        recognizer.start();
        iaQuery.placeholder = "Te escucho, Edgar...";
        btnVoz.innerHTML = '<i class="fa-solid fa-stop"></i>';

        recognizer.on("result", (message) => {
            const result = message.result;
            if (result.text && result.text.trim() !== "") {
                iaQuery.value = result.text;
                detenerMicrofono(stream);
                window.enviarConsultaIA(); 
            }
        });

        recognizer.on("partialresult", (message) => {
            if (message.result.partial) {
                iaQuery.placeholder = message.result.partial + "...";
            }
        });

// Browser Speech API handles stream internally - no connect needed

    } catch (error) {
        console.error("Error Vosk/STT:", error);
        // Graceful fallback - no alert, just stop
        iaQuery.placeholder = "Speech API no disponible";
        detenerMicrofono(stream);
        btnVoz.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
    }
};

function detenerMicrofono(stream) {
    if (stream) stream.getTracks().forEach(track => track.stop());
    const btnVoz = document.getElementById('btnVoz');
    if (btnVoz) {
        btnVoz.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        btnVoz.style.background = "#0f172a";
    }
}

// --- CONSULTA ---
window.enviarConsultaIA = function() {
    const input = document.getElementById('iaQuery');
    const chatContainer = document.getElementById('chatContainer');
    const btnPreguntar = document.getElementById('btnPreguntarIA');
    
    const pregunta = input.value.trim();
    if (!pregunta) return;

    btnPreguntar.disabled = true;
    
    // Usar las burbujas que definimos en el HTML
    chatContainer.innerHTML += `<div class="msg-user"><strong>Tú:</strong><br>${pregunta}</div>`;
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    input.value = '';

    fetch('/vistas/ia/asistente-inventario/api-consultar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify({ pregunta: pregunta })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            chatContainer.innerHTML += `<div class="msg-luna" style="color: #ef4444;"><strong>Error:</strong> ${data.error}</div>`;
        } else {
            const respuesta = data.respuesta || 'No pude procesar tu pregunta.';
            // Formatear respuesta con Marked (si está cargado) para negritas y listas
            const htmlRespuesta = typeof marked !== 'undefined' ? marked.parse(respuesta) : respuesta;
            
            chatContainer.innerHTML += `<div class="msg-luna"><strong>Luna:</strong><br>${htmlRespuesta}</div>`;
            
            if (data.audio_url) {
                reproducirVozLuna(data.audio_url);
            }
        }
        chatContainer.scrollTop = chatContainer.scrollHeight;
    })
    .catch(error => {
        console.error("Error API:", error);
        chatContainer.innerHTML += `<div class="msg-luna" style="color: #ef4444;"><strong>Error de conexión</strong></div>`;
    })
    .finally(() => { 
        if (btnPreguntar) btnPreguntar.disabled = false; 
    });
};

// --- INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Asistente Luna cargado.");
});