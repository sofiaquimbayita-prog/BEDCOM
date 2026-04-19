// DESPACHOS JS - Patrones consistentes con pedido/clientes
const CSRF_TOKEN = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

/* ── Toast ── */
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

/* ── DataTable con filtros ── */
$(document).ready(function() {
  const table = $('#tablaDespachos').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json' },
    pageLength: 25,
    order: [[0, 'desc']],
    columnDefs: [{ orderable: false, targets: -1 }]
  });

  // Filtros
  $('#filtroEstado, #filtroFecha').on('change', filtrarTabla);
  $('#btnFiltrar').click(filtrarTabla);
  $('#btnLimpiar').click(() => {
    $('#filtroEstado, #filtroFecha').val('').trigger('change');
    table.search('').columns().search('').draw();
    showToast('Filtros limpiados');
  });

  // Update stats
  document.getElementById('statsPendientes').textContent = `${PENDIENTES} pendientes`;
});

function filtrarTabla() {
  const estado = $('#filtroEstado').val();
  const fecha = $('#filtroFecha').val();
  
  $('#tablaDespachos').DataTable().rows().every(function() {
    const row = this.node();
    const rowEstado = $(row).data('estado');
    
    let show = true;
    if (estado && rowEstado !== estado) show = false;
    
    $(row).toggle(show);
  });
}

/* ── Detalle Modal ── */
document.querySelectorAll('.btn-ver').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      const res = await fetch(`${URL_DETALLE}${btn.dataset.id}/`);
      const data = await res.json();
      
      if (!data.ok) throw new Error(data.error);
      
      const d = data.despacho;
      document.getElementById('modalTitulo').textContent = `Despacho #${d.id}`;
      
      document.getElementById('modalBody').innerHTML = `
        <div class="info-grid">
          <div class="info-card">
            <h4>Pedido #${d.pedido_id}</h4>
            <p><strong>Cliente:</strong> ${d.cliente_nombre}</p>
            <p><strong>Dirección:</strong> ${d.direccion_entrega}</p>
            <p><strong>Teléfono:</strong> ${d.telefono_contacto}</p>
          </div>
          <div class="info-card">
            <h4>Estado: <span class="badge-${d.estado}">${d.estado.toUpperCase()}</span></h4>
            <p><strong>Fecha Despacho:</strong> ${new Date(d.fecha_despacho).toLocaleString('es-CO')}</p>
            ${d.fecha_entrega_real ? `<p><strong>Entrega Real:</strong> ${new Date(d.fecha_entrega_real).toLocaleString('es-CO')}</p>` : ''}
            <p><strong>Responsable:</strong> ${d.responsable || '—'}</p>
            ${d.observaciones ? `<p><strong>Observaciones:</strong> ${d.observaciones}</p>` : ''}
          </div>
        </div>
        <div class="items-tabla-wrap">
          <table class="items-tabla">
            <thead><tr><th>Producto</th><th>Cant.</th><th>P/U</th><th>Subtotal</th></tr></thead>
            <tbody>${d.productos.map(p => `
              <tr>
                <td>${p.nombre}</td>
                <td>${p.cantidad}</td>
                <td>$${parseFloat(p.precio_unitario).toLocaleString()}</td>
                <td>$${parseFloat(p.sub_total).toLocaleString()}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      document.getElementById('modalDetalle').classList.add('mostrar');
    } catch (e) {
      showToast(e.message, 'error');
    }
  });
});

/* ── Cambiar Estado ── */
document.querySelectorAll('.estado-select').forEach(select => {
  select.addEventListener('change', async function() {
    const pk = this.dataset.id;
    const nuevoEstado = this.value;
    
    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', CSRF_TOKEN);
    formData.append('nuevo_estado', nuevoEstado);
    
    try {
      const res = await fetch(`${URL_ESTADO}${pk}/`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.ok) {
        showToast(data.message);
        // Update UI
        this.closest('tr').querySelector('.badge-estado').className = `badge-estado badge-${nuevoEstado}`;
        this.closest('tr').querySelector('.badge-estado').textContent = data.despacho.estado.toUpperCase();
        this.remove(); // Ocultar select
        setTimeout(() => location.reload(), 1500);
      } else {
        this.value = this.dataset.estadoActual;
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    }
  });
});

/* ── Modales ── */
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.close).classList.remove('mostrar');
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('mostrar');
  });
});

