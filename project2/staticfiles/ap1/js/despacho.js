/**
 * DESPACHOS JS
 * Requiere que el template defina ANTES de cargar este script:
 *   CSRF_TOKEN, URL_DETALLE, URL_ESTADO, PENDIENTES
 */

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
      const res  = await fetch(`${URL_DETALLE}${id}/`);
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
            ${d.fecha_entrega_real
              ? `<p><strong>Entrega real:</strong> ${fmtFecha(d.fecha_entrega_real)}</p>`
              : ''}
            ${d.observaciones
              ? `<p><strong>Observaciones:</strong> ${d.observaciones}</p>`
              : ''}
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
      const res  = await fetch(`${URL_ESTADO}${pk}/`, { method: 'POST', body: formData });
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

  /* ── Cierre de Modales ──────────────────────────────── */
  $(document).on('click', '[data-close]', function () {
    document.getElementById(this.dataset.close).classList.remove('mostrar');
  });

  $(document).on('click', '.modal', function (e) {
    if (e.target === this) this.classList.remove('mostrar');
  });

}); // ← cierre correcto de $(document).ready  (FIX 1)