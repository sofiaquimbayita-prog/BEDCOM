/**
 * DESPACHOS JS
 */

let cfg = {};
if (document.getElementById('js-config')) {
  cfg = document.getElementById('js-config').dataset;
}
const CSRF_TOKEN = cfg.csrf || '';
const URL_DETALLE = pk => (cfg.urlDetalle || '').replace('/0/', '/' + pk + '/');
const URL_ESTADO = pk => (cfg.urlEstado || '').replace('/0/', '/' + pk + '/');
const PENDIENTES = parseInt(cfg.pendientes || '0', 10);

/* ── Toast ─────────────────────────────────────────── */
function showToast(msg, tipo = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `message message--${tipo}`;
  toast.innerHTML = `
    <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
    <span>${msg}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/* ── DataTable + Delegación de eventos ─────────────── */
$(document).ready(function () {

  /* FIX 1: Se añade el cierre correcto "})" que faltaba.
     FIX 2: Se elimina "{ visible: false, targets: 7 }" que ocultaba
             erróneamente la columna "Acciones". */
  $('#tablaDespachos').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json' },
    pageLength: 25,
    order: [[0, 'desc']],
    columnDefs: [
      { orderable: false, targets: [6, 7] }  // Estado y Acciones: no ordenables
    ]
  });

  /* ── Modal Detalle ──────────────────────────────────
     FIX 3: Delegación de eventos en lugar de querySelectorAll.
     Así funciona también en filas renderizadas por DataTable
     al paginar o filtrar. */
  $(document).on('click', '.btn-ver', async function () {
    const id = this.dataset.id;
    try {
      const res  = await fetch(URL_DETALLE(id));
      const data = await res.json();

      if (!data.ok) throw new Error(data.error);

      const d = data.despacho;
      document.getElementById('modalTitulo').innerHTML =
        `<i class="fas fa-truck"></i> Despacho #${d.id}`;

      const fmtFecha = iso => iso
        ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
        : '—';

      const estadoLabel = d.estado
        .replace('_', ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      document.getElementById('modalBody').innerHTML = `
        <div class="info-grid">
          <div class="info-card">
            <h4><i class="fas fa-box"></i> Pedido #${d.pedido_id}</h4>
            <p><strong>Cliente:</strong> ${d.cliente_nombre}</p>
            <p><strong>Dirección:</strong> ${d.direccion_entrega}</p>
            <p><strong>Teléfono:</strong> ${d.telefono_contacto}</p>
          </div>
          <div class="info-card">
            <h4><i class="fas fa-info-circle"></i> Estado &amp; Fechas</h4>
            <p>
              <strong>Estado:</strong>
              <span class="badge-estado badge-${d.estado}">${estadoLabel}</span>
            </p>
            <p><strong>Fecha despacho:</strong> ${fmtFecha(d.fecha_despacho)}</p>
            <p><strong>Fecha de despacho programada:</strong> ${fmtFecha(d.fecha_entrega)}</p>
            ${d.observaciones
              ? `<p><strong>Observaciones:</strong> ${d.observaciones}</p>`
              : ''}
          </div>
          <div class="info-card">
            <h4><i class="fas fa-truck-loading"></i> Datos del Distribuidor</h4>
            <p><strong>Distribuidor:</strong> ${d.empresa_transporte || 'Propia / Sin asignar'}</p>
            <p><strong>No. Guía:</strong> ${d.numero_guia || '—'}</p>
            <p><strong>Costo:</strong> $${parseFloat(d.costo_envio || 0).toLocaleString('es-CO')}</p>
            <p><strong>Responsable:</strong> ${d.responsable || '—'}</p>
          </div>
        </div>

        <div class="items-tabla-wrap">
          <table class="items-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio/u</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${d.productos.map(p => `
                <tr>
                  <td>${p.nombre}</td>
                  <td>${p.cantidad}</td>
                  <td>$${parseFloat(p.precio_unitario).toLocaleString('es-CO')}</td>
                  <td>$${parseFloat(p.sub_total).toLocaleString('es-CO')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      document.getElementById('modalDetalle').classList.add('mostrar');

    } catch (e) {
      showToast(e.message || 'Error al cargar el detalle', 'error');
    }
  });

  /* ── Cambiar Estado ─────────────────────────────────
     FIX 3 (mismo): delegación para que funcione tras paginación. */
  $(document).on('change', '.estado-select', async function () {
    const pk             = this.dataset.id;
    const nuevoEstado    = this.value;
    const estadoAnterior = this.dataset.estadoActual;
    const selectEl       = this;

    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', CSRF_TOKEN);
    formData.append('nuevo_estado', nuevoEstado);

    try {
      const res  = await fetch(URL_ESTADO(pk), { method: 'POST', body: formData });
      const data = await res.json();

      if (data.ok) {
        showToast(data.message);

        // Actualizar atributo de color del select en la columna Estado
        selectEl.dataset.estadoActual = nuevoEstado;

        // DataTable: refrescar para que el orden refleje el cambio
        setTimeout(() => $('#tablaDespachos').DataTable().draw(false), 600);

      } else {
        // Revertir si el servidor rechazó el cambio
        selectEl.value = estadoAnterior;
        showToast(data.error || 'No se pudo actualizar el estado', 'error');
      }

    } catch {
      selectEl.value = estadoAnterior;
      showToast('Error de conexión con el servidor', 'error');
    }
  });

  /* ── Crear Nuevo Despacho ───────────────────────────── */
  $('#btnNuevoDespacho').on('click', function(){
    $('#inpCrearPedidoId').val('');
    $('#inpCrearEmpresa').val('');
    $('#inpCrearGuia').val('');
    $('#inpCrearCosto').val('0');
    $('#modalCrearDespacho').addClass('mostrar');
  });

  // Strict phone and placa input filtering
  $(document).on('keydown', '#inpCrearTelefono', function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowedKeys = [8, 9, 13, 27, 35, 36, 37, 38, 39, 40];
    if (allowedKeys.includes(e.keyCode)) return;
    if (this.value.length >= 10) {
      e.preventDefault();
      return;
    }
    if (e.key.length === 1 && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  $(document).on('paste', '#inpCrearTelefono', function(e) {
    const paste = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
    if (!/^[0-9]+$/.test(paste)) {
      e.preventDefault();
    }
  });

  $(document).on('input', '#inpCrearTelefono', function() {
    const clean = this.value.replace(/\D/g, '').slice(0, 10);
    if (this.value !== clean) this.value = clean;
  });

  $(document).on('keydown', '#inpCrearGuia', function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowedKeys = [8, 9, 13, 27, 35, 36, 37, 38, 39, 40];
    if (allowedKeys.includes(e.keyCode)) return;
    if (this.value.length >= 8) {
      e.preventDefault();
      return;
    }
    if (e.key.length === 1 && !/^[A-Za-z0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  $(document).on('paste', '#inpCrearGuia', function(e) {
    const paste = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
    if (!/^[A-Za-z0-9]+$/.test(paste)) {
      e.preventDefault();
    }
  });

  $(document).on('input', '#inpCrearGuia', function() {
    const clean = this.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
    if (this.value !== clean) this.value = clean;
  });

  $('#btnGuardarDespacho').on('click', async function(){
    // Client-side validation
    const fields = {
      pedido: $('#inpCrearPedidoId'),
      empresa: $('#inpCrearEmpresa'),
      telefono: $('#inpCrearTelefono'),
      guia: $('#inpCrearGuia'),
      costo: $('#inpCrearCosto')
    };

    let valid = true;
    const errors = {};

    // Reset previous errors
    $('.error-msg').hide().text('');
    $('.form-input').removeClass('input-error');

    // Validate each field
    if (!fields.pedido.val()) {
      errors.pedido = 'Seleccione un pedido';
      valid = false;
    }
    const emp = fields.empresa.val().trim();
    if (!emp || emp.length < 2) {
      errors.empresa = 'Nombre del acarreista requerido (mín 2 caracteres)';
      valid = false;
    }
   const tel = fields.telefono.val();

if (!/^[0-9]{10}$/.test(tel)) {
  errors.telefono = 'El teléfono debe tener exactamente 10 dígitos numéricos';
  valid = false;
}
   const gui = fields.guia.val().trim();

if (!/^[a-zA-Z0-9]{1,8}$/.test(gui)) {
  errors.guia = 'Placa: solo letras y números (máx 8 caracteres)';
  valid = false;
}
    const cos = parseFloat(fields.costo.val()) || 0;
    if (cos < 0) {
      errors.costo = 'Costo no puede ser negativo';
      valid = false;
    }

    if (!valid) {
      // Show errors
      Object.keys(errors).forEach(key => {
        $(`#error-${key}`).text(errors[key]).show();
        fields[key].addClass('input-error');
      });
      fields.pedido.focus();
      showToast('Corrija los errores en el formulario', 'error');
      return;
    }

    const pedido_id = fields.pedido.val();
    const btn = $(this);
    const originalHtml = btn.html();
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Enviando...');

    try {
      const res = await fetch('/vistas/despacho/crear/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
        body: JSON.stringify({
          pedido_id: pedido_id,
          empresa_transporte: emp,
          numero_guia: gui,
          costo_envio: cos,
          telefono: tel  // Send cleaned
        })
      });
      const data = await res.json();

      if (data.ok) {
        showToast(data.message);
        $('#modalCrearDespacho').removeClass('mostrar');
        setTimeout(() => location.reload(), 1000);
      } else if (data.field) {
        // Server field error
        $(`#error-${data.field}`).text(data.error).show();
        fields[data.field].addClass('input-error').focus();
        showToast(data.error, 'error');
        btn.prop('disabled', false).html(originalHtml);
      } else {
        showToast(data.error || 'Error desconocido', 'error');
        btn.prop('disabled', false).html(originalHtml);
      }
    } catch(e) {
      showToast('Error de conexión con el servidor', 'error');
      btn.prop('disabled', false).html(originalHtml);
    }
  });


  /* ── Cierre de Modales ──────────────────────────────── */
  $(document).on('click', '[data-close]', function () {
    document.getElementById(this.dataset.close).classList.remove('mostrar');
  });

  $(document).on('click', '.modal', function (e) {
    if (e.target === this) this.classList.remove('mostrar');
  });

}); // ← cierre correcto de $(document).ready  (FIX 1)