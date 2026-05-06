// monitoreo.js - BEDCOM Dashboard Animations & Safe DOM Ops
// Fixed: Null safety, modern KPIs

// ── SAFE DOM SELECTOR ─────────────────────────────────────────────────────────
function $(sel) { 
    const el = document.querySelector(sel);
    if (!el) console.warn(`DOM element not found: ${sel}`);
    return el;
 }

// ── RELOJ EN TIEMPO REAL ──────────────────────────────────────────────────────
function actualizarFecha() {
    const el = $("#fecha-hora");
    if (!el) return;
    const ahora = new Date();
    el.textContent = ahora.toLocaleString("es-CO", { 
        weekday: "short", day: "numeric", month: "short", 
        hour: "2-digit", minute: "2-digit" 
    });
}

// ── CONTADOR ANIMADO (KPI Numbers) ────────────────────────────────────────────
function animarContador(el, target, duracion = 1200) {
    // Extra null safety for textContent errors
    if (!el) {
        console.warn('animarContador: el is null');
        return;
    }
    if (typeof el.textContent === 'undefined') {
        console.warn('animarContador: el.textContent not writable');
        return;
    }
    if (isNaN(target) || target < 0) {
        console.warn('animarContador: invalid target', target);
        el.textContent = '0';
        return;
    }
    const inicio = performance.now();
    const update = (ahora) => {
        const t = Math.min((ahora - inicio) / duracion, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target).toLocaleString();
        if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

// ── BARRAS DE PROGRESO ────────────────────────────────────────────────────────
function animarBarras() {
    document.querySelectorAll(".kpi-bar[data-pct]").forEach((bar, i) => {
        if (!bar.dataset.pct) return;
        setTimeout(() => { 
            bar.style.width = bar.dataset.pct + "%"; 
            bar.style.opacity = "1";
        }, i * 100);
    });
}

// ── INICIALIZACIÓN SAFE ───────────────────────────────────────────────────────
function initMonitoreo() {
    // 1. Animate KPI counters
    document.querySelectorAll(".kpi-value[data-target]").forEach((el, i) => {
        const target = parseInt(el.dataset.target || 0);
        setTimeout(() => animarContador(el, target), i * 120 + 200);
    });
    
    // 2. Animate KPI bars
    animarBarras();
    
    // 3. Clock
    actualizarFecha();
    setInterval(actualizarFecha, 1000);
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    initMonitoreo();
});

// ── MODULE NAVIGATION ─────────────────────────────────────────────────────────
function irModulo(modulo) {
    const urls = {
        insumos: '/insumos/',
        logistica: '/logistica/',
        productos: '/productos/',
        entrada_p: '/entrada_p/'
    };
    window.location.href = urls[modulo] || '/';
}

// ── EXPORTS for global access ─────────────────────────────────────────────────
window.animarContador = animarContador;
