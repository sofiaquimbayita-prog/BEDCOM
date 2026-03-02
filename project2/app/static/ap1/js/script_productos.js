// =========================
// 1. Control de Modales
// =========================

// Función para abrir cualquier modal por su ID
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "flex";
    }
}

// Función para cerrar cualquier modal por su ID
function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "none";
    }
}

// Cerrar modales si se hace clic fuera del contenido blanco
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
};

// =========================
// 2. Manejo del Formulario
// =========================

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formAddProducto");
    
    if (form) {
        form.addEventListener("submit", function(e) {
            // IMPORTANTE: NO usamos e.preventDefault() porque 
            // queremos que Django reciba los datos y recargue la página.
            console.log("Enviando datos al servidor Django...");
            
            // Opcional: Puedes deshabilitar el botón para evitar doble clic
            const btn = document.getElementById("btnGuardar");
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            }
        });
    }
});

// =========================
// 3. Accesibilidad (Opcional)
// =========================
function inicializarAccesibilidad() {
    const body = document.body;
    const toggler = (btnId, className) => {
        const btn = document.getElementById(btnId);
        if (btn) btn.onclick = () => body.classList.toggle(className);
    };

    toggler('modo-oscuro', 'dark-mode');
    toggler('fuente-legible', 'fuente-legible');
}

// Inicializar funciones al cargar la página
window.onload = () => {
    inicializarAccesibilidad();
};