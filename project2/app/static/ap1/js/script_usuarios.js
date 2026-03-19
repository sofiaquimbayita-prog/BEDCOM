/* ==================================================
   script_usuarios.js - Gestión de Usuarios BedCom
   ================================================== */

/**
 * 1. FILTRO POR ESTADO (Columna 6)
 * Switch OFF -> Muestra solo Activos
 * Switch ON  -> Muestra solo Inactivos
 */
$.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
    if (settings.nTable.id !== 'tablaUsuarios') return true;

    var mostrarInactivos = $('#toggleInactivos').is(':checked');
    
    // Obtenemos el texto de la columna 6 ("Activo" o "Inactivo")
    var valorEstado = data[6].trim(); 

    if (!mostrarInactivos) {
        // MODO NORMAL: Solo Activos
        return valorEstado === 'Activo' || valorEstado === '1' || valorEstado === 'True';
    } else {
        // MODO INACTIVOS: Solo Inactivos
        return valorEstado === 'Inactivo' || valorEstado === '0' || valorEstado === 'False';
    }
});

$(document).ready(function() {
    /**
     * 2. CONFIGURACIÓN DE DATATABLES
     */
    const lenguajeEspanol = {
        "sProcessing": "Procesando...",
        "sLengthMenu": "Mostrar _MENU_ registros",
        "sZeroRecords": "No se encontraron resultados",
        "sEmptyTable": "Ningún dato disponible en esta tabla",
        "sInfo": "Mostrando _START_ a _END_ de _TOTAL_ usuarios",
        "sSearch": "Buscar:",
        "oPaginate": {
            "sFirst": "Primero", "sLast": "Último", "sNext": "Siguiente", "sPrevious": "Anterior"
        }
    };

    // Inicializamos la tabla
    const table = $('#tablaUsuarios').DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 10,
        language: lenguajeEspanol,
        order: [[1, "asc"]],
        columnDefs: [{ orderable: false, targets: [7] }]
    });

    // Evento para que el switch refresque la tabla
    $('#toggleInactivos').on('change', function() {
        table.draw();
    });

    /**
     * 3. LÓGICA DE CREACIÓN (AJAX)
     */
    $(document).on('submit', '#formAddUsuario', function(e) {
        e.preventDefault();
        var form = $(this);
        var formData = new FormData(this);
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        fetch(form.attr('action'), {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrftoken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cerrarModal('modalAdd');
                window.location.reload();
            } else {
                alert("Error: " + (data.message || "Datos inválidos"));
            }
        })
        .catch(error => console.error('Error:', error));
    });
});

/**
 * 4. FUNCIONES GLOBALES (MODALES)
 */
window.abrirModal = function(id) {
    const m = document.getElementById(id);
    if(m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
};

window.cerrarModal = function(id) {
    const m = document.getElementById(id);
    if(m) { m.style.display = 'none'; document.body.style.overflow = 'auto'; }
};

/**
 * 5. ACCIONES DE FILA
 */
function abrirModalEditar(id) {
    fetch(`/usuarios/detalle_json/${id}/`)
        .then(response => response.json())
        .then(data => {
            const form = document.getElementById('formEditarUsuario');
            form.action = `/usuarios/editar/${id}/`;
            form.querySelector('[name="username"]').value = data.username;
            form.querySelector('[name="email"]').value = data.email;
            form.querySelector('[name="first_name"]').value = data.first_name;
            form.querySelector('[name="last_name"]').value = data.last_name;
            form.querySelector('[name="cedula"]').value = data.cedula;
            form.querySelector('[name="rol"]').value = data.rol;
            abrirModal('modalEditar');
        });
}

function abrirModalEliminar(id, nombre) {
    const form = document.getElementById('formEliminar');
    if(document.getElementById('nombreEliminar')) document.getElementById('nombreEliminar').textContent = nombre;
    form.action = `/usuarios/cambiar_estado/${id}/`;
    abrirModal('modalDelete');
}

function abrirModalActivar(id, nombre) {
    const form = document.getElementById('formActivar');
    if(document.getElementById('nombreActivar')) document.getElementById('nombreActivar').textContent = nombre;
    form.action = `/usuarios/cambiar_estado/${id}/`;
    abrirModal('modalActivar');
}