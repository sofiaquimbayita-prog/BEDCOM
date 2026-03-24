ra// ── RELOJ EN TIEMPO REAL ──────────────────────────────────────────────────────
function actualizarFecha() {
    const el = document.getElementById("fecha-hora");
    if (!el) return;
    const ahora = new Date();
    const opciones = { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
    el.textContent = ahora.toLocaleString("es-CO", opciones);
}
actualizarFecha();
setInterval(actualizarFecha, 1000);

// ── CONTADOR ANIMADO ──────────────────────────────────────────────────────────
function animarContador(el, target, duracion = 1200) {
    const inicio = performance.now();
    const update = (ahora) => {
        const t = Math.min((ahora - inicio) / duracion, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(update);
        else el.textContent = target;
    };
    requestAnimationFrame(update);
}

// ── BARRAS DE PROGRESO KPI ────────────────────────────────────────────────────────
function animarBarras() {
    document.querySelectorAll(".kpi-bar").forEach(bar => {
        const pct = bar.dataset.pct;
        setTimeout(() => { bar.style.width = pct + "%"; }, 200);
    });
}

// ── TABLA HISTORIAL ─────────────────────────────────────────────────────────────
function cargarHistorial(procesos) {
    const tbody = document.getElementById("historial-body"); // Fixed: use visible tbody
    if (!tbody) return;
    
    let html = '';
    if (procesos.length === 0) {
        html = `<tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: #94a3b8;">
                        No hay acciones recientes.
                    </td>
                </tr>`;
    } else {
        procesos.forEach((item, i) => {
            html += `
                <tr style="opacity: 0; transform: translateY(10px); transition: opacity .4s ${i * 0.05 + 0.2}s, transform .4s ${i * 0.05 + 0.2}s;">
                    <td>${item.modulo || 'General'}</td>
                    <td>${item.accion || item.descripcion || '-'}</td>
                    <td>${item.fecha}</td>
                    <td>${item.responsable || item.usuario || 'Sistema'}</td>
                </tr>`;
        });
    }
    
    tbody.innerHTML = html;
    
    // Animate in rows
    setTimeout(() => {
        document.querySelectorAll("#historial-body tr").forEach(tr => {
            tr.style.opacity = "1";
            tr.style.transform = "translateY(0)";
        });
    }, 100);
}

// ── ACTUALIZAR HISTORIAL AJAX (from template) ────────────────────────────────────
function actualizarHistorialAhora() {
    const icon = document.getElementById('icon-refresh');
    const text = document.getElementById('text-refresh');
    
    icon.classList.add('fa-spin');
    text.innerText = "Actualizando...";

    fetch('/api/historial-tiempo-real/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cargarHistorial(data.data); // Use fixed function
            }
        })
        .catch(error => console.error('Error actualizando historial:', error))
        .finally(() => {
            setTimeout(() => {
                icon.classList.remove('fa-spin');
                text.innerText = "Auto (5s)";
            }, 500);
        });
}

// ── INICIALIZACIÓN ────────────────────────────────────────────────────────────
function init() {
    // Animate KPI counters
    document.querySelectorAll(".kpi-value[data-target]").forEach((el, i) => {
        const target = parseInt(el.dataset.target);
setTimeout(() => animateCounter(the, target), i * 80 + 100);
    });

    // Animate KPI bars
    animarBarras();

// Load initial historial from global procesos (Django context)
    if (typeof procesos !== 'undefined' && Array.isArray(procesos)) {
        cargarHistorial(procesos);
    }
}

document.addEventListener("DOMContentLoaded", init);

// Auto-refresh historial every 5s (from template)
setInterval(actualizarHistorialAhora, 5000);

