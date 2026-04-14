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
        document.getElementById('chatContainer').innerHTML = '<div id="iaResponse" style="line-height: 1.5;">Esperando tu consulta...</div>';
    }
};

window.enviarConsultaIA = function() {
    const input = document.getElementById('iaQuery');
    const chatContainer = document.getElementById('chatContainer');
    const pregunta = input.value.trim();

    if (!pregunta) return;

    // Mensaje del usuario
    chatContainer.innerHTML += `<div class="text-end mb-2" style="color: #e2e8f0;"><strong>Tú:</strong> ${pregunta}</div>`;
    
    // Añadir indicador de carga
    const loadingId = "loading-" + Date.now();
    chatContainer.innerHTML += `<div id="${loadingId}" class="text-start mb-2" style="color: #94a3b8;"><em>El asistente de BEDCOM está pensando...</em></div>`;
    
    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // ✅ URL CORREGIDA según rutas Django
    fetch('/vistas/ia/asistente-inventario/api-consultar/', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ pregunta: pregunta })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Quitar indicador de carga
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        
        // Mostrar respuesta de la IA
        chatContainer.innerHTML += `<div class="text-start mb-2" style="color: #38bdf8;"><strong>IA:</strong> ${data.respuesta || 'Respuesta vacía del servidor.'}</div>`;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    })
    .catch(error => {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        chatContainer.innerHTML += `<div class="text-danger mb-2"><strong>Error:</strong> No se pudo conectar con el servidor IA. Verifica: ${error.message}</div>`;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        console.error('IA API Error:', error);
    });
};

// Permitir Enter para enviar (bonus UX)
document.addEventListener('DOMContentLoaded', function() {
    const iaQuery = document.getElementById('iaQuery');
    if (iaQuery) {
        iaQuery.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarConsultaIA();
            }
        });
    }
    
    // Inicializar chat container scroll
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});

