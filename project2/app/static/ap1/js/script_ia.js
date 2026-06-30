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

        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            throw new Error('SpeechRecognition no soportado en este navegador');
        }

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
            const err = event && event.error ? event.error : 'unknown';
            console.error('Speech error:', err);

            let msg = `Error: ${err}`;
            if (err === 'network') {
                msg = 'Sin internet o sin conexión para reconocimiento de voz (SpeechRecognition).';
            } else if (err === 'not-allowed' || err === 'service-not-allowed') {
                msg = 'Permiso de micrófono denegado. Activa el micrófono para este sitio.';
            } else if (err === 'no-speech') {
                msg = 'No se detectó voz. Intenta hablar más cerca del micrófono.';
            } else if (err === 'audio-capture') {
                msg = 'No se pudo capturar audio del micrófono. Revisa el dispositivo de entrada.';
            }

            iaQuery.placeholder = msg;
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

    // Show thinking indicator always at the end
    let thinkingIndicator = document.getElementById('thinkingIndicator');
    if (thinkingIndicator) thinkingIndicator.remove();
    thinkingIndicator = document.createElement('div');
    thinkingIndicator.id = 'thinkingIndicator';
    thinkingIndicator.className = 'msg-luna';
    thinkingIndicator.style.cssText = 'color: #38bdf8; animation: pulse 1.5s ease-in-out infinite; background: transparent; border: none; padding: 12px 12px 12px 0;';
    thinkingIndicator.innerHTML = '<strong>Luna:</strong> pensando <i class="fa-solid fa-spinner fa-spin me-2"></i><span class="typing-dots">...</span>';
    chatContainer.appendChild(thinkingIndicator);
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
            const htmlRespuesta = respuesta
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');
            
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

window.cargarHistorial = async function () {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;
    try {
        const res = await fetch('/vistas/ia/asistente-inventario/api-historial/');
        const data = await res.json();
        if (data.ok && data.mensajes && data.mensajes.length > 0) {
            chatContainer.innerHTML = '';
            data.mensajes.forEach(function (m) {
                var el = document.createElement('div');
                el.className = m.rol === 'luna' ? 'msg-luna' : 'msg-user';
                var texto = m.rol === 'luna' ? '<strong>Luna:</strong><br>' + (typeof marked !== 'undefined' ? marked.parse(m.texto) : m.texto) : '<strong>Tú:</strong><br>' + m.texto;
                el.innerHTML = texto;
                chatContainer.appendChild(el);
            });
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    } catch (e) {
        console.log('No se pudo cargar el historial del chat');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Asistente Luna cargado.");
    window.cargarHistorial();
});
