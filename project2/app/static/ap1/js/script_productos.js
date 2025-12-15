// =======================================
// 1. CONFIGURACIÓN Y VARIABLES GLOBALES
// =======================================
// La API_URL es relativa y coincide con las rutas en tu urls.py
const API_URL = "/api/productos"; 
let productos = []; // Arreglo local para almacenar los datos del servidor

// Referencias a elementos clave del DOM (Asegúrate que existen en tu HTML)
const grid = document.getElementById("gridProductos");
const searchInput = document.getElementById("searchInput");
const formAdd = document.getElementById("formAdd"); 
const formEdit = document.getElementById("formEdit"); 

// =======================================
// 2. FUNCIONES BÁSICAS DE UI (MODALES)
// =======================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
}

// -------------------------------------------------------------
// 3. READ (Lectura/Carga) - Petición GET a /api/productos
// -------------------------------------------------------------

// 3.1. Carga los productos desde el servidor
async function loadProductos() {
    try {
        const response = await fetch(API_URL); 
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} al cargar productos.`);
        }

        // El backend devuelve una lista de diccionarios (JSON)
        const data = await response.json();
        
        productos = data; 
        renderProductos(); 
        
    } catch (error) {
        console.error("❌ Fallo al cargar productos:", error);
        if (grid) grid.innerHTML = `<p class="error-message">Error al conectar con la API: ${error.message}.</p>`;
    }
}

// 3.2. Pinta las tarjetas en el grid
function renderProductos(data = productos) {
    if (!grid) return;

    grid.innerHTML = "";

    if (data.length === 0) {
        grid.innerHTML = `<p class="no-results-message">No se encontraron productos.</p>`;
        return;
    }
    
    data.forEach(p => { 
        const card = document.createElement("div");
        card.className = "card";
        
        const imgSrc = p.imagen || "producto_default.jpg"; 

        card.innerHTML = `
            <img src="${imgSrc}" alt="${p.nombre}">
            <p class="nombre">${p.nombre}</p>
            <p class="stock">Stock: ${p.stock || 0}</p>
            <div class="acciones">
                <button class="view-btn" onclick="viewProductoById(${p.id})">Ver</button>
                <button class="edit-btn" onclick="openEditModal(${p.id})">Editar</button>
                <button class="delete-btn" onclick="deleteProductoById(${p.id})">Eliminar</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

// -------------------------------------------------------------
// 4. DELETE (Eliminación) - Petición DELETE a /api/productos/{id}
// -------------------------------------------------------------

async function deleteProductoById(id) {
    if (confirm("¿Estás seguro de eliminar el producto con ID " + id + "?")) {
        // Construye la URL con el ID: /api/productos/5
        const URL_DELETE = `${API_URL}/${id}`; 

        try {
            const response = await fetch(URL_DELETE, {
                method: 'DELETE'
            });

            // El backend de Django nativo devuelve 204 No Content
            if (response.status !== 204) {
                throw new Error(`Error al eliminar. Código: ${response.status}`);
            }

            alert("✅ Producto eliminado exitosamente.");
            
            // Recargamos los datos del servidor para actualizar la vista
            await loadProductos(); 

        } catch (error) {
            console.error("❌ Fallo en la eliminación:", error);
            alert("Error al intentar eliminar el producto.");
        }
    }
}


// -------------------------------------------------------------
// 5. CREATE (Creación) - Petición POST a /api/productos
// -------------------------------------------------------------

if (formAdd) {
    formAdd.addEventListener("submit", async function (e) {
        e.preventDefault();

        // 1. Capturar datos del formulario
        const nuevoProducto = {
            nombre: document.getElementById("addNombre").value,
            precio: Number(document.getElementById("addPrecio").value),
            categoria: document.getElementById("addCategoria").value,
            stock: Number(document.getElementById("addStock").value),
            estado: document.getElementById("addEstado").value,
            descripcion: document.getElementById("addDescripcion").value,
            imagen: document.getElementById("addImagen").value || "producto_default.jpg"
        };
        
        // 2. Enviar la petición POST
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                // Indicar al backend que estamos enviando JSON
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(nuevoProducto) // Convertir el objeto a cadena JSON
            });

            if (response.status !== 201) { // El backend devuelve 201 Created
                let errorDetails = `Fallo la creación. Código: ${response.status}`;
                throw new Error(errorDetails);
            }

            // 3. Éxito: recargar y limpiar
            alert("✅ Producto agregado exitosamente.");
            await loadProductos(); // Recarga la lista actualizada
            closeModal("modalAdd");
            e.target.reset();

        } catch (error) {
            console.error("❌ Error al crear producto:", error);
            alert("Error al intentar agregar el producto: " + error.message);
        }
    });
}


// -------------------------------------------------------------
// 6. UPDATE (Actualización) y VIEW
// -------------------------------------------------------------

// 6.1. Rellena el modal de edición
function openEditModal(id) {
    const producto = productos.find(p => p.id === Number(id));

    if (producto && formEdit) {
        // Rellenar campos del modal de edición
        document.getElementById("editId").value = producto.id; // CLAVE
        document.getElementById("editNombre").value = producto.nombre;
        document.getElementById("editPrecio").value = producto.precio;
        document.getElementById("editCategoria").value = producto.categoria;
        document.getElementById("editStock").value = producto.stock;
        document.getElementById("editEstado").value = producto.estado;
        document.getElementById("editDescripcion").value = producto.descripcion;
        document.getElementById("editImagen").value = producto.imagen || '';
        
        openModal("modalEdit");
    } else {
        alert("Producto no encontrado para editar.");
    }
}

// 6.2. Listener del formulario de edición (Petición PUT a /api/productos/{id})
if (formEdit) {
    formEdit.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const id = document.getElementById("editId").value;
        const URL_UPDATE = `${API_URL}/${id}`;

        const productoActualizado = {
            nombre: document.getElementById("editNombre").value,
            precio: Number(document.getElementById("editPrecio").value),
            categoria: document.getElementById("editCategoria").value,
            stock: Number(document.getElementById("editStock").value),
            estado: document.getElementById("editEstado").value,
            descripcion: document.getElementById("editDescripcion").value,
            imagen: document.getElementById("editImagen").value
        };

        try {
            const response = await fetch(URL_UPDATE, {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productoActualizado)
            });

            if (response.status !== 200) { // El backend devuelve 200 OK
                let errorDetails = `Fallo la actualización. Código: ${response.status}`;
                throw new Error(errorDetails);
            }

            alert("✅ Producto actualizado exitosamente.");
            await loadProductos();
            closeModal("modalEdit");

        } catch (error) {
            console.error("❌ Error al actualizar producto:", error);
            alert("Error al intentar actualizar el producto: " + error.message);
        }
    });
}


// -------------------------------------------------------------
// 7. BUSCADOR/FILTRO (Opera sobre el arreglo local 'productos')
// -------------------------------------------------------------

if (searchInput) {
    searchInput.addEventListener("input", function() {
        const searchTerm = this.value.toLowerCase();
        
        const filteredProducts = productos.filter(p => {
            const nameMatch = p.nombre.toLowerCase().includes(searchTerm);
            const categoryMatch = p.categoria ? p.categoria.toLowerCase().includes(searchTerm) : false;
            const descriptionMatch = p.descripcion ? p.descripcion.toLowerCase().includes(searchTerm) : false;
            
            return nameMatch || categoryMatch || descriptionMatch;
        });
        
        renderProductos(filteredProducts);
    });
}


// -------------------------------------------------------------
// 8. INICIALIZACIÓN
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Inicia la carga de productos al iniciar la página
    loadProductos(); 
});