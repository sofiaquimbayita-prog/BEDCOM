

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
let recognition = null;
let audioActual = null;

// --- REPRODUCCIÓN DE AUDIO (PIPER) ---
function reproducirVozLuna(urlAudio) {
    if (audioActual) audioActual.pause();

    if (urlAudio) {
        audioActual = new Audio(urlAudio);
        audioActual.play().catch(e => console.error("Error al reproducir voz de Luna:", e));
    }
}

// --- MICROFONO CON SPEECHRECOGNITION NATIVO ---
window.escucharVoz = async function() {
    const btnVoz = document.getElementById('btnVoz');
    const iaQuery = document.getElementById('iaQuery');

    try {
        btnVoz.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btnVoz.style.background = "#ef4444";
        iaQuery.placeholder = "Iniciando reconocimiento...";


        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'es-ES';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            console.log('Escuchando...');
            iaQuery.placeholder = "Habla ahora...";
            btnVoz.innerHTML = '<i class="fa-solid fa-stop"></i>';
        };

        recognition.onspeechend = () => {
            console.log('Fin de habla detectado');
        };

        recognition.onresult = (event) => {
            let interimText = '';
            let finalText = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += transcript;
                } else {
                    interimText += transcript;
                }
            }
            
            if (interimText) {
                iaQuery.placeholder = interimText + '...';
            }
            
            if (finalText.trim()) {
                iaQuery.value = finalText.trim();
                recognition.stop();
                window.enviarConsultaIA();
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech error:', event.error);
            iaQuery.placeholder = `Error: ${event.error}`;
            btnVoz.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
        };

        recognition.onend = () => {
            detenerMicrofono();
        };

        recognition.start();

    } catch (error) {
        console.error("Error STT:", error);
        iaQuery.placeholder = "Speech no disponible en este navegador";
        btnVoz.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
    }
};

function detenerMicrofono() {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    const btnVoz = document.getElementById('btnVoz');
    if (btnVoz) {
        btnVoz.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        btnVoz.style.background = "#0f172a";
    }
}


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

document.addEventListener('DOMContentLoaded', () => {
    console.log("Asistente Luna cargado.");
});