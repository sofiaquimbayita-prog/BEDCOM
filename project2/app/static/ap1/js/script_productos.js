// =========================
// 1. Datos e Inicialización
// =========================
let productos = [
    { id: 1, nombre: "Base Cama Clásica", precio: 250000, stock: 25, imagen: "/static/ap1/imagenes/cama.jpg" },
    { id: 2, nombre: "Colchón Ortopédico", precio: 180000, stock: 8, imagen: "/static/ap1/imagenes/cama.jpg" }
];

window.onload = () => {
    loadProductos();
    renderProductos();
    inicializarAccesibilidad();
};

// =========================
// 2. Persistencia y Renderizado
// =========================
function saveProductos() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

function loadProductos() {
    const data = localStorage.getItem("productos");
    if (data) productos = JSON.parse(data);
}

function renderProductos() {
    const grid = document.getElementById("gridProductos"); // Coincide con el ID en el index
    if (!grid) return;
    grid.innerHTML = "";

    productos.forEach((p, i) => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.precio = `$${p.precio}`;

        card.innerHTML = `
            <img src="${p.imagen}" alt="${p.nombre}">
            <div class="nombre">${p.nombre}</div>
            <div class="stock">Stock: ${p.stock} unidades</div>
            <div class="acciones">
                <button class="view-btn" onclick="viewProducto(${i})"><i class="fas fa-eye"></i></button>
                <button class="edit-btn"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteProducto(${i})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// =========================
// 3. Control de Modales
// =========================
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
}

// Cerrar si hacen clic fuera del modal
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
};

// =========================
// 4. Lógica del Formulario (Agregar)
// =========================
const form = document.getElementById("formAddProducto");
if (form) {
    form.addEventListener("submit", function(e) {
        // IMPORTANTE: Si vas a usar Django puro para guardar, quita el preventDefault.
        // Si quieres que el JS lo maneje en el navegador, déjalo.
        e.preventDefault(); 
        
        const nuevo = {
            id: Date.now(),
            nombre: document.getElementById("nombre").value,
            precio: document.getElementById("precio").value,
            stock: document.getElementById("stock").value,
            tipo: document.getElementById("tipo").value,
            categoria: document.getElementById("id_cat").value,
            imagen: "/static/ap1/imagenes/cama.jpg" // Ruta estática por defecto
        };

        productos.push(nuevo);
        saveProductos();
        renderProductos();
        cerrarModal("modalAdd");
        e.target.reset(); // Limpia el formulario
    });
}

// =========================
// 5. Acciones (Eliminar/Ver)
// =========================
function deleteProducto(i) {
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
        productos.splice(i, 1);
        saveProductos();
        renderProductos();
    }
}

function viewProducto(i) {
    const p = productos[i];
    alert(`Producto: ${p.nombre}\nPrecio: $${p.precio}\nStock: ${p.stock}`);
}