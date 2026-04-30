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

$(document).ready(function () {
  $('#tablaGarantias').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json' },
    pageLength: 25,
    order: [[0, 'desc']],
    columnDefs: [
      { orderable: false, targets: [5, 6] }
    ]
  });

  /* ── Modal Detalle ────────────────────────────────── */
  $(document).on('click', '.btn-ver', async function () {
    const id = this.dataset.id;
    try {
      const res  = await fetch(`${URL_DETALLE}${id}/`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      const d = data.garantia;
      document.getElementById('modalTitulo').innerHTML =
        `<i class="fas fa-screwdriver-wrench"></i> Garantía #${d.id}`;

      document.getElementById('modalBody').innerHTML = `
        <div class="info-grid" style="display:flex; flex-direction:column; gap:15px;">
          <div class="info-card" style="padding:15px; border-radius:8px; border:1px solid #ddd;">
            <h4><i class="fas fa-file-invoice"></i> Información de Garantía</h4>
            <p><strong>Fecha Solicitud:</strong> ${d.fecha_solicitud}</p>
            <p><strong>Pedido:</strong> ${d.pedido_id ? '#' + d.pedido_id : 'Ninguno'}</p>
            <p><strong>Cliente:</strong> ${d.cliente_nombre}</p>
            <p><strong>Producto:</strong> ${d.producto_nombre}</p>
          </div>
          <div class="info-card" style="padding:15px; border-radius:8px; border:1px solid #ddd;">
            <h4><i class="fas fa-clipboard-list"></i> Estado & Reparación</h4>
            <p><strong>Estado:</strong> ${d.estado_display}</p>
            <p><strong>Descripción de Falla:</strong></p>
            <p style="background:#f9f9f9; padding:10px; border-radius:4px; font-size:0.9rem;">${d.descripcion_falla}</p>
          </div>
        </div>
      `;
      document.getElementById('modalDetalle').classList.add('mostrar');
    } catch (e) {
      showToast(e.message || 'Error al cargar el detalle', 'error');
    }
  });

  /* ── Cambiar Estado ───────────────────────────────── */
  $(document).on('change', '.estado-select', async function () {
    const pk = this.dataset.id;
    const nuevoEstado = this.value;
    const estadoAnterior = this.dataset.estadoActual;
    const selectEl = this;

    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', CSRF_TOKEN);
    formData.append('estado_reparacion', nuevoEstado);

    try {
      const res  = await fetch(`${URL_ESTADO}${pk}/`, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.ok) {
        showToast(data.message);
        selectEl.dataset.estadoActual = nuevoEstado;
        setTimeout(() => location.reload(), 1000);
      } else {
        selectEl.value = estadoAnterior;
        showToast(data.error || 'No se pudo actualizar el estado', 'error');
      }
    } catch {
      selectEl.value = estadoAnterior;
      showToast('Error de conexión', 'error');
    }
  });

  /* ── Crear Garantia ───────────────────────────────── */
  $('#btnNuevaGarantia').click(function(){
      $('#inpPedido').val('');
      $('#inpProducto').val('');
      $('#inpDescripcion').val('');
      $('#modalCrear').addClass('mostrar');
  });

  $('#btnGuardar').click(async function(){
      const pedido = $('#inpPedido').val();
      const producto = $('#inpProducto').val();
      const descripcion = $('#inpDescripcion').val();
      
      if(!producto || !descripcion){
          showToast('El producto y la descripción son requeridos', 'error');
          return;
      }

      $(this).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

      try {
          const res = await fetch(URL_CREAR, {
              method: 'POST',
              headers:{'Content-Type':'application/json','X-CSRFToken':CSRF_TOKEN},
              body: JSON.stringify({
                  pedido_id: pedido,
                  producto_id: producto,
                  descripcion_falla: descripcion
              })
          });
          const data = await res.json();
          if(data.ok) {
              showToast(data.message);
              $('#modalCrear').removeClass('mostrar');
              setTimeout(()=>location.reload(), 1000);
          } else {
              showToast(data.error, 'error');
              $(this).prop('disabled', false).html('<i class="fas fa-save"></i> Guardar');
          }
      } catch(e) {
          showToast('Error al guardar', 'error');
          $(this).prop('disabled', false).html('<i class="fas fa-save"></i> Guardar');
      }
  });

  /* ── Cierre de Modales ──────────────────────────────── */
  $(document).on('click', '[data-close]', function () {
    document.getElementById(this.dataset.close).classList.remove('mostrar');
  });

  $(document).on('click', '.modal', function (e) {
    if (e.target === this) this.classList.remove('mostrar');
  });

});
