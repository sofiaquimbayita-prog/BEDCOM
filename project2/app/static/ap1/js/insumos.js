$(document).ready(function () {
    const modal = $('#modal-insumo');
    const form = document.getElementById('form-insumo');
    const tituloModal = document.getElementById('modal-titulo');
    
    const swalConfig = {
        background: '#1b2537',
        color: '#e9eef7',
        confirmButtonColor: '#5cc8ff', 
        cancelButtonColor: '#4ea3a5'  
    };

    // 1. Interceptar el envío del formulario (Crear/Editar)
    form.onsubmit = function(e) {
        e.preventDefault(); 

        const formData = new FormData(form);
        const actionUrl = form.getAttribute('action');
        const nombreInsumo = formData.get('nombre');
        // Detectamos si es edición revisando la URL de acción
        const esEdicion = actionUrl.includes('editar');

        fetch(actionUrl, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la solicitud');
            return response.json();
        })
        .then(data => {
            // Notificación de éxito
            Swal.fire({
                ...swalConfig,
                icon: 'success',
                title: esEdicion ? '¡Actualizado!' : '¡Guardado!',
                text: `El insumo "${nombreInsumo}" ha sido ${esEdicion ? 'actualizado' : 'creado'} con éxito.`,
                timer: 2000,
                showConfirmButton: false
            });

            modal.removeClass('mostrar'); // Cerrar modal
            form.reset(); // Limpiar formulario
            $('#tablaInsumos').DataTable().ajax.reload(); // Recargar tabla
        })
        .catch(error => {
            Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron guardar los cambios. Intente de nuevo.',
            });
            console.error(error);
        });
    };

    // 2. Inicializar DataTable
    const tabla = $('#tablaInsumos').DataTable({
        ajax: INSUMOS_DATA_URL,
        columns: [
            { data: "nombre" },
            { data: "categoria" },
            { data: "cantidad" },
            { data: "unidad" },
            { data: "precio" },
            { data: "proveedor" },
            { data: "estado" },
            {
            data: "id",
            render: function (data) {
                return `
                    <div class="acciones-tabla">
                        <button type="button" class="btn-accion btn-editar" onclick="editarInsumo(${data})" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn-accion btn-eliminar" onclick="eliminarInsumo(${data})" title="Eliminar">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>`;
                }
            }
        ],
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json" }
    });

    // 3. Abrir modal para 
    $('#btn-agregar-insumo').click(function() {
        form.reset();
        tituloModal.innerText = "Agregar Nuevo Insumo";
        form.action = "crear/"; 
        modal.addClass('mostrar');
    });

    // 4. Función para Editar (Carga datos en modal)
    window.editarInsumo = function(id) {
        fetch(`obtener/${id}/`)
            .then(res => res.json())
            .then(data => {
                form.nombre.value = data.nombre;
                form.cantidad.value = data.cantidad;
                form.unidad_medida.value = data.unidad_medida;
                form.precio.value = data.precio;
                form.id_proveedor.value = data.id_proveedor;
                form.id_categoria.value = data.id_categoria;
                form.estado.value = data.estado;
                
                tituloModal.innerText = "Editar Insumo";
                form.action = `editar/${id}/`; // Cambia la ruta a modo edición
                modal.addClass('mostrar');
            });
    };

    // 5. Función para Eliminar con SweetAlert2
   window.eliminarInsumo = function(id) {
    fetch(`obtener/${id}/`)
        .then(res => res.json())
        .then(data => {
            const nombreDelInsumo = data.nombre;
            // alerta personalizada con el nombre
            Swal.fire({
                background: '#1b2537',
                color: '#e9eef7',
                title: `¿Eliminar el insumo "${nombreDelInsumo}"?`, 
                text: "Esta acción no se puede deshacer y afectará al inventario.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33', 
                cancelButtonColor: '#4ea3a5',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // procedemos al borrado real
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
                            // otificación final de éxito con el nombre
                            Swal.fire({
                                background: '#1b2537',
                                color: '#e9eef7',
                                title: '¡Eliminado!',
                                text: `El insumo "${nombreDelInsumo}" ha sido borrado correctamente.`,
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            });
                            $('#tablaInsumos').DataTable().ajax.reload();
                        }
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error al obtener datos:", error);
            Swal.fire('Error', 'No se pudo obtener la información del registro.', 'error');
        });
};

    // 6. Cerrar Modal
    const cerrar = () => modal.removeClass('mostrar');
    $('#btn-cerrar-modal, #btn-cancelar').click(cerrar);
});