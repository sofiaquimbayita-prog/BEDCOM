$(document).ready(function () {
    const modal = $('#modal-insumo');
    const form = document.getElementById('form-insumo');
    const tituloModal = document.getElementById('modal-titulo');

    const tabla = $('#tablaInsumos').DataTable({
        ajax: INSUMOS_DATA_URL,
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
                            <button type="button" onclick="editarInsumo(${data})" class="btn-icon-edit">✏️</button>
                            <button type="button" onclick="eliminarInsumo(${data})" class="btn-icon-delete">🗑️</button>
                        </div>`;
                }
            }
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json" // Traducción completa
        }
    });

    $('#btn-agregar-insumo').click(function() {
        form.reset();
        tituloModal.innerText = "Agregar Nuevo Insumo";
        form.action = "crear/"; 
        modal.addClass('mostrar');
    });

    window.editarInsumo = function(id) {
        fetch(`obtener/${id}/`)
            .then(res => res.json())
            .then(data => {
                form.nombre.value = data.nombre;
                form.cantidad.value = data.cantidad;
                form.unidad_medida.value = data.unidad_medida;
                form.id_categoria.value = data.id_categoria;
                form.estado.value = data.estado;
                tituloModal.innerText = "Editar Insumo";
                form.action = `editar/${id}/`;
                modal.addClass('mostrar');
            });
    };

    window.eliminarInsumo = function(id) {
        if (confirm('¿Deseas eliminar este insumo?')) {
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            fetch(`eliminar/${id}/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': csrftoken, 'X-Requested-With': 'XMLHttpRequest' }
            }).then(res => { if (res.ok) tabla.ajax.reload(); });
        }
    };

    const cerrar = () => modal.removeClass('mostrar');
    $('#btn-cerrar-modal, #btn-cancelar').click(cerrar);
});