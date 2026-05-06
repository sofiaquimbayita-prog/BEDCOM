/* mantenimientos.js — Módulo de mantenimiento */

/* ── Configuración desde el DOM ─────────────────────────────────────────── */
let cfg = {};
const jsConfig = document.getElementById('js-config');
if (jsConfig) cfg = jsConfig.dataset;

const CSRF_TOKEN = cfg.csrf     || '';
const URL_CREAR  = cfg.urlCrear  || '';
const URL_ESTADO = cfg.urlEstado || '';
const URL_DETALLE= cfg.urlDetalle|| '';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const toast = (msg, tipo = 'success') => {
  if (typeof window.showToast === 'function') window.showToast(msg, tipo);
  else alert(msg);
};

/** Muestra/oculta mensaje de error debajo de un campo */
function setError(inputId, msg) {
  const el  = document.getElementById(inputId);
  const err = document.getElementById(inputId + '_error');
  if (!el || !err) return;
  if (msg) {
    el.classList.add('input-error');
    err.textContent = msg;
    err.style.display = 'block';
  } else {
    el.classList.remove('input-error');
    err.textContent = '';
    err.style.display = 'none';
  }
}

const REGEX_DESC = /^[a-zA-Z0-9\sÁÉÍÓÚáéíóúÑñ.,\-]+$/;

/* ── Validaciones individuales ───────────────────────────────────────────── */
function validarProducto() {
  const val = $('#inpProducto').val();
  if (!val) { setError('inpProducto', 'Seleccione un producto.'); return false; }
  setError('inpProducto', ''); return true;
}



function validarDescripcion() {
  const val = $('#inpDescripcion').val().trim();
  if (!val)           { setError('inpDescripcion', 'La descripción es obligatoria.');            return false; }
  if (val.length < 5) { setError('inpDescripcion', 'Mínimo 5 caracteres.');                     return false; }
  if (val.length > 500){ setError('inpDescripcion', 'Máximo 500 caracteres.');                  return false; }
  if (!REGEX_DESC.test(val)){ setError('inpDescripcion', 'Solo letras, números y signos . , -'); return false; }
  setError('inpDescripcion', ''); return true;
}

/* ── DataTable ───────────────────────────────────────────────────────────── */
$(document).ready(function () {

  $('#tablaMantenimientos').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json' },
    pageLength: 25,
    order: [[0, 'desc']],
    columnDefs: [{ orderable: false, targets: [5, 6] }],
  });




  /* ── Validaciones en tiempo real ─────────────────────────────────────── */
  $('#inpProducto').on('change', validarProducto);


  $('#inpDescripcion').on('input', function () {
    // Eliminar caracteres no permitidos al vuelo
    this.value = this.value.replace(/[^a-zA-Z0-9\sÁÉÍÓÚáéíóúÑñ.,\-]/g, '');
    const len = this.value.trim().length;
    const counter = document.getElementById('descContador');
    if (counter) counter.textContent = len + '/500';
    validarDescripcion();
  });

  /* ── Abrir Modal Crear ────────────────────────────────────────────────── */
  $('#btnNuevaMantenimiento').on('click', function () {
    $('#inpPedido').val('');
    $('#inpProducto').val('');
    $('#inpDescripcion').val('');
    const counter = document.getElementById('descContador');
    if (counter) counter.textContent = '0/500';
    ['inpProducto', 'inpDescripcion'].forEach(id => setError(id, ''));
    document.getElementById('modalCrear').classList.add('mostrar');
  });


  /* ── Guardar Mantenimiento ────────────────────────────────────────────── */
  $('#btnGuardar').on('click', async function () {
    const ok = [validarProducto(), validarDescripcion()];
    if (ok.includes(false)) return;

    const payload = {
      pedido_id:           $('#inpPedido').val()      || null,
      producto_id:         $('#inpProducto').val(),
      descripcion_falla:   $('#inpDescripcion').val().trim(),
    };


    $(this).prop('disabled', true)
           .html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

    try {
      const res  = await fetch(URL_CREAR, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.ok) {
        toast(data.message);
        document.getElementById('modalCrear').classList.remove('mostrar');
        setTimeout(() => location.reload(), 1000);
      } else {
        toast(data.error || 'No se pudo guardar el mantenimiento.', 'error');
        $(this).prop('disabled', false).html('<i class="fas fa-save"></i> Guardar');
      }
    } catch {
      toast('Error de conexión al guardar.', 'error');
      $(this).prop('disabled', false).html('<i class="fas fa-save"></i> Guardar');
    }
  });

  /* ── Cambiar Estado (select en tabla) ────────────────────────────────── */
  $(document).on('change', '.estado-select', async function () {
    const pk             = this.dataset.id;
    const nuevoEstado    = this.value;
    const estadoAnterior = this.dataset.estadoActual;
    const selectEl       = this;

    // FormData — el backend acepta ambos formatos
    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', CSRF_TOKEN);
    formData.append('estado_reparacion', nuevoEstado);

    try {
      const res  = await fetch(URL_ESTADO + pk + '/', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.ok) {
        toast(data.message);
        selectEl.dataset.estadoActual = nuevoEstado;
        setTimeout(() => location.reload(), 1000);
      } else {
        selectEl.value = estadoAnterior;
        toast(data.error || 'No se pudo actualizar el estado.', 'error');
      }
    } catch {
      selectEl.value = estadoAnterior;
      toast('Error de conexión al cambiar estado.', 'error');
    }
  });

  /* ── Modal Detalle ────────────────────────────────────────────────────── */
  $(document).on('click', '.btn-ver', async function () {
    const id = this.dataset.id;
    try {
      const res = await fetch(URL_DETALLE + id + '/');
      if (!res.ok) throw new Error('Error HTTP ' + res.status);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Error desconocido');

      const d = data.mantenimiento;
      if (!d || typeof d !== 'object') throw new Error('Respuesta inválida del servidor.');

      document.getElementById('modalTitulo').innerHTML =
        '<i class="fas fa-screwdriver-wrench"></i> Mantenimiento #' + d.id;

      // Modal “Detalle” estilo ENTRADA_P (usa estructura con .detail-row / badges)
      document.getElementById('modalBody').innerHTML = `
        <div class="modal-body-view" style="padding: 0;">
          <div class="info-grid">
            <div class="info-card">
              <h4><i class="fas fa-file-invoice" style="color:#6366f1;"></i> Información General</h4>
              <div class="detail-row">
                <label>Fecha Solicitud</label>
                <span>${d.fecha_solicitud_display || '—'}</span>
              </div>
              <div class="detail-row">
                <label>Pedido</label>
                <span>${d.pedido_id ? '#' + d.pedido_id : 'Sin pedido asociado'}</span>
              </div>
              <div class="detail-row">
                <label>Cliente</label>
                <span>${d.cliente_nombre || '—'}</span>
              </div>
              <div class="detail-row">
                <label>Producto</label>
                <span>${d.producto_nombre || '—'}</span>
              </div>
            </div>

            <div class="info-card">
              <h4><i class="fas fa-clipboard-list" style="color:#6366f1;"></i> Estado &amp; Reparación</h4>
              <div class="detail-row">
                <label>Estado</label>
                <span>
                  <span class="badge-estado active">${d.estado_display || '—'}</span>
                </span>
              </div>
              <div class="detail-row" style="align-items:flex-start;">
                <label>Descripción</label>
                <span style="white-space: pre-wrap;">
                  ${d.descripcion_falla || '<em style="color:#94a3b8;">Sin descripción</em>'}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('modalDetalle').classList.add('mostrar');
    } catch (e) {
      toast(e.message || 'Error al cargar el detalle.', 'error');
    }
  });

  /* ── Cierre de Modales ────────────────────────────────────────────────── */
  $(document).on('click', '[data-close]', function () {
    const modal = document.getElementById(this.dataset.close);
    if (modal) modal.classList.remove('mostrar');
  });

  $(document).on('click', '.modal', function (e) {
    if (e.target === this) this.classList.remove('mostrar');
  });

}); // end document.ready