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
window.isMuted = localStorage.getItem('iaMuted') === 'true' || false;

// --- REPRODUCCIÓN DE AUDIO (PIPER) ---
function reproducirVozLuna(urlAudio) {
    if (audioActual) audioActual.pause();

    if (urlAudio) {
        audioActual = new Audio(urlAudio);
        if (!window.isMuted) {
            audioActual.play().catch(e => console.error("Error al reproducir voz de Luna:", e));
        }
    }
}

window.toggleMute = function() {
    window.isMuted = !window.isMuted;
    localStorage.setItem('iaMuted', window.isMuted);
    
    // Mute/desmute audio actual si existe
    if (audioActual) {
        if (window.isMuted) {
            audioActual.pause();
            audioActual.muted = true;
        } else {
            audioActual.muted = false;
            audioActual.currentTime = 0; // Reiniciar para desmute instantáneo
            audioActual.play().catch(e => console.log('Auto-resume failed:', e));
        }
    }
    
    const btnMute = document.getElementById('btnMute');
    if (btnMute) {
        if (window.isMuted) {
            btnMute.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            btnMute.style.background = '#ef4444';
            btnMute.title = 'IA mutada - Clic para desmutar';
        } else {
            btnMute.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            btnMute.style.background = '#10b981';
            btnMute.title = 'IA sin mute - Clic para mutar';
        }
    }
    
    console.log('IA ' + (window.isMuted ? 'MUTADA (audio pausado)' : 'DESMUTADA (audio resumed)'));
};

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
    
    // Append user message SAFELY without destroying existing elements
    const userMsg = document.createElement('div');
    userMsg.className = 'msg-user';
    userMsg.innerHTML = `<strong>Tú:</strong><br>${pregunta}`;
    chatContainer.appendChild(userMsg);
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    input.value = '';

    // Show/create thinking indicator dynamically
    let thinkingIndicator = document.getElementById('thinkingIndicator');
    if (!thinkingIndicator) {
        thinkingIndicator = document.createElement('div');
        thinkingIndicator.id = 'thinkingIndicator';
        thinkingIndicator.className = 'msg-luna';
        thinkingIndicator.style.cssText = 'color: #38bdf8; animation: pulse 1.5s ease-in-out infinite; background: transparent; border: none; padding: 12px 12px 12px 0;';
        thinkingIndicator.innerHTML = '<strong>Luna:</strong> pensando <i class="fa-solid fa-spinner fa-spin me-2"></i><span class="typing-dots">...</span>';
        chatContainer.appendChild(thinkingIndicator);
    }
    thinkingIndicator.style.display = 'block';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    fetch('/vistas/ia/asistente-inventario/api-consultar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify({ pregunta: pregunta })
    })
    .then(response => response.json())
    .then(data => {
        // Hide thinking indicator
        const thinkingIndicator = document.getElementById('thinkingIndicator');
        if (thinkingIndicator) thinkingIndicator.style.display = 'none';
        
        if (data.error) {
            // Append error SAFELY
            const errorMsg = document.createElement('div');
            errorMsg.className = 'msg-luna';
            errorMsg.style.color = '#ef4444';
            errorMsg.innerHTML = `<strong>Error:</strong> ${data.error}`;
            chatContainer.appendChild(errorMsg);
        } else {
            const respuesta = data.respuesta || 'No pude procesar tu pregunta.';
            const htmlRespuesta = typeof marked !== 'undefined' ? marked.parse(respuesta) : respuesta;
            
            // Append response SAFELY
            const lunaMsg = document.createElement('div');
            lunaMsg.className = 'msg-luna';
            lunaMsg.innerHTML = `<strong>Luna:</strong><br>${htmlRespuesta}`;
            chatContainer.appendChild(lunaMsg);
            
            if (data.audio_url) {
                reproducirVozLuna(data.audio_url);
            }
        }
        chatContainer.scrollTop = chatContainer.scrollHeight;
    })
    .catch(error => {
        // Hide thinking indicator
        const thinkingIndicator = document.getElementById('thinkingIndicator');
        if (thinkingIndicator) thinkingIndicator.style.display = 'none';
        
        console.error("Error API:", error);
        // Append error connection SAFELY
        const connError = document.createElement('div');
        connError.className = 'msg-luna';
        connError.style.color = '#ef4444';
        connError.innerHTML = '<strong>Error de conexión</strong>';
        chatContainer.appendChild(connError);
    })
    .finally(() => { 
        if (btnPreguntar) btnPreguntar.disabled = false; 
    });
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Asistente Luna cargado.");
});

