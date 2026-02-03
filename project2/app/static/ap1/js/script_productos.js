// =========================
// 1. Datos e Inicialización
// =========================
let productos = [
    { id: 1, nombre: "Base Cama Clásica", precio: 250000, categoria: "Base Cama", stock: 25, estado: "Disponible", descripcion: "Base cama de madera maciza.", imagen: "https://i.ibb.co/L5Qx3Yg/base-cama.jpg" },
    { id: 2, nombre: "Cabecero Capitoné", precio: 180000, categoria: "Cabeceros", stock: 12, estado: "Disponible", descripcion: "Elegante cabecero tapizado.", imagen: "https://i.ibb.co/P42yX4b/cabecero-capitone.jpg" }
];

window.onload = () => {
    loadProductos();
    renderProductos();
    inicializarAccesibilidad();
};

// =========================
// 2. Persistencia (LocalStorage)
// =========================
function saveProductos() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

function loadProductos() {
    const data = localStorage.getItem("productos");
    if (data) productos = JSON.parse(data);
}

// =========================
// 3. Control de Modales
// =========================
// Función universal para abrir modales (usada por el botón "Nuevo Producto" y los de acción)
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
}

// Cerrar modales si se hace clic fuera del contenido
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
};

// =========================
// 4. Renderizado y Acciones
// =========================
function renderProductos() {
    const grid = document.getElementById("gridProductos");
    if (!grid) return;
    grid.innerHTML = "";

    productos.forEach((p, i) => {
        const card = document.createElement("div");
        card.className = "card";
        // Importante para tu CSS de etiquetas de precio
        card.dataset.precio = `$${p.precio}`;

        card.innerHTML = `
            <img src="${p.imagen}" alt="${p.nombre}">
            <p class="nombre">${p.nombre}</p>
            <p class="stock">Stock: ${p.stock} unidades</p>
            <div class="acciones">
                <button class="view-btn" onclick="viewProducto(${i})"><i class="fa fa-eye"></i></button>
                <button class="edit-btn" onclick="editProducto(${i})"><i class="fa fa-pen"></i></button>
                <button class="delete-btn" onclick="deleteProducto(${i})"><i class="fa fa-trash"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Ver Detalle
function viewProducto(i) {
    const p = productos[i];
    document.getElementById("viewNombre").textContent = p.nombre;
    document.getElementById("viewImagen").src = p.imagen;
    document.getElementById("viewPrecio").textContent = `💲 Precio: $${p.precio}`;
    document.getElementById("viewDescripcion").textContent = p.descripcion;
    abrirModal("modalView");
}

// Eliminar
function deleteProducto(i) {
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
        productos.splice(i, 1);
        saveProductos();
        renderProductos();
    }
}

// =========================
// 5. Formularios (Agregar)
// =========================
const form = document.getElementById("formAddProducto");
if (form) { // Solo ejecuta si el formulario existe
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Usamos IDs que coincidan con tu formulario HTML
        const nombreInput = document.getElementById("nombre");
        const precioInput = document.getElementById("precio");
        
        const nuevo = {
            id: Date.now(),
            nombre: nombreInput ? nombreInput.value : "Sin nombre",
            precio: precioInput ? precioInput.value : 0,
            imagen: "https://via.placeholder.com/150"
        };

        productos.push(nuevo);
        saveProductos();
        renderProductos();
        cerrarModal("modalAdd");
        e.target.reset();
    });
}

// =========================
// 6. Accesibilidad (Simplificado)
// =========================
function inicializarAccesibilidad() {
    const body = document.body;
    
    // Toggle de Clases
    const toggler = (btnId, className) => {
        const btn = document.getElementById(btnId);
        if (btn) btn.onclick = () => body.classList.toggle(className);
    };

    toggler('alto-contraste', 'alto-contraste');
    toggler('modo-oscuro', 'dark-mode');
    toggler('resaltar-enlaces', 'resaltar-enlaces');
    toggler('fuente-legible', 'fuente-legible');
    toggler('cursor-grande', 'cursor-grande');

    // Menú desplegable
    const btnAcc = document.getElementById('btn-accesibilidad');
    const menuAcc = document.getElementById('menu-accesibilidad');
    if (btnAcc && menuAcc) {
        btnAcc.onclick = (e) => {
            e.stopPropagation();
            menuAcc.style.display = (menuAcc.style.display === 'block') ? 'none' : 'block';
        };
    }
}