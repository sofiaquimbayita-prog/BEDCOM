/**
 * script_ia.js - BEDCOM IA Assistant (SpeechRecognition)
 * Fixed: Removed buggy Vosk, reliable browser SpeechRecog (es-CO)
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

// --- DEBUG GET EL Helper ---
function debugGetEl(id) {
  const el = document.getElementById(id);
  console.log(`🔍 [IA.js] ID "${id}" -> ${el ? 'OK' : 'NULL!'}`);
  return el;
}

// --- SPEECH RECOGNITION (Simplified & Reliable) ---
window.escucharVoz = function() {
  console.log('🔍 [IA.js] CLICK escucharVoz called');
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    console.log('🔍 [IA.js] SpeechRecognition:', !!Recognition);
    
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

    const btnVoz = debugGetEl('btnVoz');
    
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
  console.log('🔍 [IA.js] CLICK enviarConsultaIA called');
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
window.abrirModalIA = function() {
    const m = document.getElementById('modalIA');
    console.log('[DEBUG IA] abrirModalIA called, modal:', m);
    if (m) {
        m.style.display = 'flex !important';
        m.style.zIndex = '9999 !important';
        m.querySelector('.modal-dialog, .modal-content, .modal-body, #chatContainer, .input-group, input, button').forEach(el => {
            el.style.pointerEvents = 'auto';
            el.style.zIndex = '10001';
        });
        document.body.style.overflow = 'hidden';
        console.log('[DEBUG IA] Modal shown, pointerEvents auto');
    } else {
        console.log('[DEBUG IA] Modal #modalIA not found');
    }
};

window.cerrarModalIA = function() {
    const m = document.getElementById('modalIA');
    console.log('[DEBUG IA] cerrarModalIA called');
    if (m) {
        m.style.display = 'none';
        m.classList.remove('show', 'oculto');
        document.body.classList.remove('modal-open');
        console.log('[DEBUG IA] Modal hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const modalIA = document.getElementById('modalIA');
    console.log('[DEBUG IA] DOM loaded, modalIA:', modalIA);
    if (modalIA) {
        // Backdrop
        modalIA.addEventListener('click', (e) => {
            if (e.target === modalIA) cerrarModalIA();
        });
        // Stop prop AGRESIVO - previene cierres clicks internos
        modalIA.querySelectorAll('*').forEach(el => {
            el.addEventListener('click', e => {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }, true); // Capture phase
        });
        // También input/button specific
        const inputs = modalIA.querySelectorAll('input, button, textarea');
        inputs.forEach(el => {
            el.addEventListener('click', e => {
                e.stopPropagation();
                e.stopImmediatePropagation();
            });
        });
        // ESC
        const escHandler = (e) => {
            if (e.key === 'Escape' && getComputedStyle(modalIA).display !== 'none') cerrarModalIA();
        };
        document.addEventListener('keydown', escHandler);
        console.log('[DEBUG IA] Handlers added');
    } else {
        console.log('[DEBUG IA] No modalIA, no handlers');
    }
    console.log("✅ Asistente Luna + Modal IA debug ready");
});
