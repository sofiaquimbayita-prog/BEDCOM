// ── DATOS SIMULADOS (reemplazar con fetch a Django) ──────────────────────────

// ── RELOJ EN TIEMPO REAL ──────────────────────────────────────────────────────
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
        const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(update);
        else el.textContent = target;
    };
    requestAnimationFrame(update);
}

// ── BARRAS DE PROGRESO ────────────────────────────────────────────────────────
function animarBarras() {
    document.querySelectorAll(".kpi-bar").forEach(bar => {
        const pct = bar.dataset.pct;
        setTimeout(() => { bar.style.width = pct + "%"; }, 200);
    });
}

// ── TABLA ─────────────────────────────────────────────────────────────────────
function cargarTabla() {
    const tbody = document.getElementById("tabla-body");
    procesos.forEach((p, i) => {
        const tr = document.createElement("tr");
        tr.style.opacity = "0";
        tr.style.transform = "translateY(10px)";
        tr.style.transition = `opacity .4s ${i * 0.1 + 0.3}s, transform .4s ${i * 0.1 + 0.3}s`;

        tr.innerHTML = `
            <td><strong>${p.nombre}</strong></td>
            <td><span class="estado ${p.estado}">${p.estado}</span></td>
            <td>${p.responsable}</td>
            <td>${p.fecha}</td>
            <td>
                <div class="row-progress-wrap">
                    <div class="row-progress" style="background:${p.color}" data-pct="${p.progreso}"></div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);

        // fade in row
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                tr.style.opacity = "1";
                tr.style.transform = "translateY(0)";
            });
        });
    });

    // animate row progress bars
    setTimeout(() => {
        document.querySelectorAll(".row-progress").forEach(bar => {
            bar.style.width = bar.dataset.pct + "%";
        });
    }, 600);
}

// ── INICIALIZACIÓN ────────────────────────────────────────────────────────────
function init() {
    // contadores KPI
    document.querySelectorAll(".kpi-value[data-target]").forEach((el, i) => {
        const target = parseInt(el.dataset.target);
        setTimeout(() => animarContador(el, target), i * 80 + 100);
    });

    // barras KPI
    animarBarras();

    // tabla
    cargarTabla();
}

document.addEventListener("DOMContentLoaded", init);

// ── NAVEGACIÓN ────────────────────────────────────────────────────────────────
function irModulo(modulo) {
    if (modulo === "insumos")   window.location.href = "/insumos/";
    if (modulo === "logistica") window.location.href = "/logistica/";
}