$(document).ready(function () {
    const modal = document.getElementById('modal-insumo');
    const form = document.getElementById('form-insumo');
    const tituloModal = document.getElementById('modal-titulo');

    // 1. DATATABLE (Carga de datos)
    const tabla = $('#tablaInsumos').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json'
        },
        ajax: INSUMOS_DATA_URL, // Usa la constante definida en el HTML
        columns: [
            { data: "nombre" },
            { data: "categoria" },
            { data: "cantidad" },
            { data: "unidad" },
            { data: "estado" },
            {
                data: "id",
                render: function (data) {
                    return `
                        <div class="acciones-tabla">
                            <button type="button" onclick="editarInsumo(${data})" class="btn-icon-edit" title="Editar">✏️</button>
                            <button type="button" onclick="eliminarInsumo(${data})" class="btn-icon-delete" title="Eliminar">🗑️</button>
                        </div>`;
                }
            }
        ]
    });

    // 2. LÓGICA PARA AGREGAR
    const btnAgregar = document.getElementById('btn-agregar-insumo');
    if (btnAgregar) {
        btnAgregar.onclick = () => {
            form.reset();
            tituloModal.innerText = "Agregar Nuevo Insumo";
            // Ruta relativa: se convierte en /vistas/insumos/crear/
            form.action = "crear/"; 
            modal.classList.add('mostrar');
        };
    }

    // 3. FUNCIÓN PARA EDITAR (FETCH READ)
    window.editarInsumo = function(id) {
        // Ruta relativa: se convierte en /vistas/insumos/obtener/id/
        fetch(`obtener/${id}/`)
            .then(response => {
                if (!response.ok) throw new Error("Error al obtener datos");
                return response.json();
            })
            .then(data => {
                // Rellenar campos del formulario
                form.nombre.value = data.nombre;
                form.cantidad.value = data.cantidad;
                form.unidad_medida.value = data.unidad_medida;
                form.id_categoria.value = data.id_categoria;
                form.estado.value = data.estado;

                tituloModal.innerText = "Editar Insumo";
                // Ruta relativa: se convierte en /vistas/insumos/editar/id/
                form.action = `editar/${id}/`;
                
                modal.classList.add('mostrar');
            })
            .catch(error => {
                console.error("Error:", error);
                alert("No se pudieron cargar los datos del insumo.");
            });
    };

    // 4. FUNCIÓN PARA ELIMINAR (AJAX POST)
    window.eliminarInsumo = function(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este insumo?')) {
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            fetch(`eliminar/${id}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (response.ok) {
                    tabla.ajax.reload(); // Recarga la tabla sin refrescar la página
                } else {
                    alert("Error al eliminar el registro.");
                }
            })
            .catch(error => console.error("Error:", error));
        }
    };

    // 5. FUNCIONES DE CIERRE DE MODAL
    const cerrarModal = () => {
        modal.classList.remove('mostrar');
    };

    const btnCerrarX = document.getElementById('btn-cerrar-modal');
    const btnCancelar = document.getElementById('btn-cancelar');

    if (btnCerrarX) btnCerrarX.onclick = cerrarModal;
    if (btnCancelar) btnCancelar.onclick = cerrarModal;

    window.onclick = (e) => {
        if (e.target == modal) cerrarModal();
    };
});