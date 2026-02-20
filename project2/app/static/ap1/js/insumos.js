$(document).ready(function () {
    const modal = $('#modal-insumo');
    const form = document.getElementById('form-insumo');
    const tituloModal = document.getElementById('modal-titulo');
    
    const swalConfig = {
        background: '#1b2537',
        color: '#f7e9e9',
        confirmButtonColor: '#5cc8ff', 
        cancelButtonColor: '#4ea3a5'
    };

    // Constantes para límites
    const NOMBRE_MAX = 100;
    const DESCRIPCION_MAX = 500;

    // Reglas de validación (similares a las de calendario)
    const REGLAS = {
        nombre(valor) {
            const v = (valor || '').trim();
            if (!v) return 'El nombre es obligatorio.';
            if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
            if (v.length > NOMBRE_MAX) return `El nombre no puede superar los ${NOMBRE_MAX} caracteres.`;
            if (/[<>!='¡@||¬°+*{}\[\]\\]/.test(v)) 
                return 'El nombre contiene caracteres no permitidos ( < > { } [ ] \\ ! = ¡ @ || ¬ ° + * ).';
            return null;
        },
        descripcion(valor) {
            const v = (valor || '').trim();
            if (v.length > DESCRIPCION_MAX)
                return `La descripción no puede superar los ${DESCRIPCION_MAX} caracteres (${v.length}/${DESCRIPCION_MAX}).`;
            return null;
        },
        cantidad(valor) {
            if (!valor && valor !== 0) return 'La cantidad es obligatoria.';
            const num = Number(valor);
            if (isNaN(num) || !Number.isFinite(num)) return 'Debe ser un número válido.';
            if (num <= 0) return 'La cantidad debe ser mayor a cero.';
            return null;
        },
        precio(valor) {
            if (!valor && valor !== 0) return 'El precio es obligatorio.';
            const num = Number(valor);
            if (isNaN(num) || !Number.isFinite(num)) return 'Debe ser un número válido.';
            if (num <= 0) return 'El precio debe ser mayor a cero.';
            return null;
        },
        unidad(valor) {
            const v = (valor || '').trim();
            if (!v) return 'La unidad de medida es obligatoria.';
            return null;
        },
        proveedor(valor) {
            if (!valor) return 'Debes seleccionar un proveedor.';
            return null;
        },
        categoria(valor) {
            if (!valor) return 'Debes seleccionar una categoría.';
            return null;
        }
    };

    function mostrarError(fieldId, mensaje) {
        const $field = $('#' + fieldId);
        $field.addClass('input-error').attr('aria-invalid', 'true');
        const $grupo = $field.closest('.form-grupo');
        $grupo.find('.msg-error').remove();
        const $msg = $(`
            <span class="msg-error" role="alert" aria-live="assertive"> ${mensaje}
            </span>`);
        $grupo.append($msg);
    }

    function mostrarExito(fieldId) {
        const $field = $('#' + fieldId);
        $field.removeClass('input-error').addClass('input-ok').attr('aria-invalid', 'false');
        $field.closest('.form-grupo').find('.msg-error').remove();
    }

    function limpiarEstado(fieldId) {
        const $field = $('#' + fieldId);
        $field.removeClass('input-error input-ok').removeAttr('aria-invalid');
        $field.closest('.form-grupo').find('.msg-error').remove();
    }

    function limpiarTodosLosErrores() {
        ['in_nombre', 'in_descripcion', 'in_cantidad', 'in_precio', 'in_unidad', 'in_proveedor', 'in_categoria']
            .forEach(limpiarEstado);
    }

    // Validación completa del formulario
    function validarFormulario() {
        let valido = true;

        const nombre      = $('#in_nombre').val();
        const descripcion = $('#in_descripcion').val();
        const cantidad    = $('#in_cantidad').val();
        const precio      = $('#in_precio').val();
        const unidad      = $('#in_unidad').val();
        const proveedor   = $('#in_proveedor').val();
        const categoria   = $('#in_categoria').val();

        const resultados = {
            in_nombre:      REGLAS.nombre(nombre),
            in_descripcion: REGLAS.descripcion(descripcion),
            in_cantidad:    REGLAS.cantidad(cantidad),
            in_precio:      REGLAS.precio(precio),
            in_unidad:      REGLAS.unidad(unidad),
            in_proveedor:   REGLAS.proveedor(proveedor),
            in_categoria:   REGLAS.categoria(categoria)
        };

        Object.entries(resultados).forEach(([id, error]) => {
            if (error) {
                mostrarError(id, error);
                valido = false;
            } else {
                const $campo = $('#' + id);
                if ($campo.is('select') || ($campo.val() && $campo.val().toString().trim() !== '')) {
                    mostrarExito(id);
                } else {
                    limpiarEstado(id);
                }
            }
        });

        if (!valido) {
            const $primerError = $('.form-input.input-error, .form-select.input-error').first();
            if ($primerError.length) $primerError.focus();
        }

        return valido;
    }

    // --- Eventos de validación en tiempo real ---

    // Nombre
    $('#in_nombre').on('input', function () {
        const error = REGLAS.nombre($(this).val());
        if (error) mostrarError('in_nombre', error);
        else       mostrarExito('in_nombre');

        // Contador de caracteres
        const len = $(this).val().trim().length;
        let $contador = $('#contador-nombre');
        if (!$contador.length) {
            $contador = $('<span id="contador-nombre" class="campo-contador"></span>');
            $(this).parent().append($contador);
        }
        $contador
            .text(len + '/' + NOMBRE_MAX)
            .toggleClass('contador-alerta', len > NOMBRE_MAX * 0.9);
    });

    // Descripción
    $('#in_descripcion').on('input', function () {
        const error = REGLAS.descripcion($(this).val());
        if (error) mostrarError('in_descripcion', error);
        else       limpiarEstado('in_descripcion'); // opcional → sin verde

        const len = ($(this).val() || '').trim().length;
        let $contador = $('#contador-descripcion');
        if (!$contador.length) {
            $contador = $('<span id="contador-descripcion" class="campo-contador"></span>');
            $(this).parent().append($contador);
        }
        $contador
            .text(len + '/' + DESCRIPCION_MAX)
            .toggleClass('contador-alerta', len > DESCRIPCION_MAX * 0.9);
    });

    // Cantidad
    $('#in_cantidad').on('input', function () {
        const error = REGLAS.cantidad($(this).val());
        if (error) mostrarError('in_cantidad', error);
        else       mostrarExito('in_cantidad');
    });

    // Precio
    $('#in_precio').on('input', function () {
        const error = REGLAS.precio($(this).val());
        if (error) mostrarError('in_precio', error);
        else       mostrarExito('in_precio');
    });

    // Unidad de medida
    $('#in_unidad').on('input', function () {
        const error = REGLAS.unidad($(this).val());
        if (error) mostrarError('in_unidad', error);
        else       mostrarExito('in_unidad');
    });

    // Proveedor (select)
    $('#in_proveedor').on('change', function () {
        const error = REGLAS.proveedor($(this).val());
        if (error) mostrarError('in_proveedor', error);
        else       mostrarExito('in_proveedor');
    });

    // Categoría (select)
    $('#in_categoria').on('change', function () {
        const error = REGLAS.categoria($(this).val());
        if (error) mostrarError('in_categoria', error);
        else       mostrarExito('in_categoria');
    });

    // --- Interceptar envío del formulario ---
    form.onsubmit = function(e) {
        e.preventDefault();

        if (!validarFormulario()) return;

        const $btnGuardar = $(form).find('.btn-guardar');
        const formData = new FormData(form);
        const actionUrl = form.getAttribute('action');
        const nombreInsumo = formData.get('nombre');
        const esEdicion = actionUrl.includes('editar');

        $btnGuardar.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Guardando…');

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
            Swal.fire({
                ...swalConfig,
                icon: 'success',
                title: esEdicion ? '¡Actualizado!' : '¡Guardado!',
                text: `El insumo "${nombreInsumo}" ha sido ${esEdicion ? 'actualizado' : 'creado'} con éxito.`,
                timer: 2000,
                showConfirmButton: false
            });

            modal.removeClass('mostrar');
            form.reset();
            limpiarTodosLosErrores();
            $('#contador-nombre, #contador-descripcion').remove();
            $('#tablaInsumos').DataTable().ajax.reload();
        })
        .catch(error => {
            Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron guardar los cambios. Intente de nuevo.',
            });
            console.error(error);
        })
        .finally(() => {
            $btnGuardar.prop('disabled', false).html('<i class="fa-solid fa-floppy-disk"></i> Guardar');
        });
    };

    // --- Inicializar DataTable ---
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

    // --- Abrir modal para agregar ---
    $('#btn-agregar-insumo').click(function() {
        form.reset();
        limpiarTodosLosErrores();
        $('#contador-nombre, #contador-descripcion').remove();
        tituloModal.innerText = "Agregar Nuevo Insumo";
        form.action = "crear/"; 
        modal.addClass('mostrar');
        setTimeout(() => $('#in_nombre').focus(), 150);
    });

    // --- Función para Editar (carga datos en modal) ---
    window.editarInsumo = function(id) {
        fetch(`obtener/${id}/`)
            .then(res => res.json())
            .then(data => {
                // Asignar valores
                form.nombre.value = data.nombre || '';
                form.descripcion.value = data.descripcion || '';
                form.cantidad.value = data.cantidad;
                form.unidad_medida.value = data.unidad_medida;
                form.precio.value = data.precio;
                form.id_proveedor.value = data.id_proveedor;
                form.id_categoria.value = data.id_categoria;
                form.estado.value = data.estado;

                // Forzar validación y contadores
                $('#in_nombre').trigger('input');
                $('#in_descripcion').trigger('input');
                $('#in_cantidad').trigger('input');
                $('#in_precio').trigger('input');
                $('#in_unidad').trigger('input');
                $('#in_proveedor').trigger('change');
                $('#in_categoria').trigger('change');

                tituloModal.innerText = "Editar Insumo";
                form.action = `editar/${id}/`;
                modal.addClass('mostrar');
                setTimeout(() => $('#in_nombre').focus(), 150);
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo obtener la información del registro.', 'error');
            });
    };

    // --- Función para Eliminar con SweetAlert2 ---
    window.eliminarInsumo = function(id) {
        fetch(`obtener/${id}/`)
            .then(res => res.json())
            .then(data => {
                const nombreDelInsumo = data.nombre;
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
                            } else {
                                Swal.fire('Error', 'No se pudo eliminar el insumo.', 'error');
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

    // --- Cerrar modal y limpiar ---
    const cerrar = () => {
        modal.removeClass('mostrar');
        limpiarTodosLosErrores();
        $('#contador-nombre, #contador-descripcion').remove();
    };
    $('#btn-cerrar-modal, #btn-cancelar').click(cerrar);

    // Cerrar al hacer clic en el fondo oscuro
    $(window).on('click', function (e) {
        if ($(e.target).is(modal)) {
            cerrar();
        }
    });

    // Cerrar con tecla ESC
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && modal.hasClass('mostrar')) {
            cerrar();
        }
    });
});