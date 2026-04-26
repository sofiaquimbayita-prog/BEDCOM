/* ─── URLs ─── */
const URL_CLIENTES_DATA  = "/vistas/clientes/data/";
const URL_CREAR          = "/vistas/clientes/crear/";
const URL_OBTENER   = pk => `/vistas/clientes/obtener/${pk}/`;
const URL_EDITAR    = pk => `/vistas/clientes/editar/${pk}/`;
const URL_TOGGLE    = pk => `/vistas/clientes/toggle/${pk}/`;
const URL_HISTORIAL = pk => `/vistas/clientes/historial/${pk}/`;
const URL_HISTORIAL_PAGOS = pk => `/vistas/clientes/historial-pagos/${pk}/`;
const CSRF_TOKEN         = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

/* ─── DataTable ─── */
let tabla;
document.addEventListener('DOMContentLoaded', function () {

  tabla = $('#tablaClientes').DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
    },
    order: [[1, 'asc']],
    columnDefs: [{ orderable: false, targets: -1 }],
    pageLength: 15,
  });

  ocultarInactivos();
  cargarDeudas();
});

/* ─── Toggle inactivos ─── */
document.getElementById('toggleInactivos').addEventListener('change', function () {
  this.checked ? mostrarTodos() : ocultarInactivos();
});

function ocultarInactivos() {
  document.querySelectorAll('#tablaClientes tbody tr[data-inactivo="true"]').forEach(tr => tr.style.display = 'none');
  tabla.rows().invalidate().draw(false);
}
function mostrarTodos() {
  document.querySelectorAll('#tablaClientes tbody tr[data-inactivo="true"]').forEach(tr => tr.style.display = '');
  tabla.rows().invalidate().draw(false);
}

/* ─── Cargar deudas en tabla ─── */
async function cargarDeudas() {
  try {
    const res  = await fetch(URL_CLIENTES_DATA);
    const data = await res.json();
    if (!data.ok) return;
    data.clientes.forEach(c => {
      const td = document.querySelector(`.td-deuda[data-id="${c.id}"]`);
      if (!td) return;
      const deuda = parseFloat(c.deuda);
      if (deuda > 0) {
        td.innerHTML = `<span class="badge-estado badge-deuda"><i class="fas fa-exclamation-circle" style="font-size:0.65rem"></i> $${deuda.toLocaleString('es-CO', {minimumFractionDigits:0})}</span>`;
      } else {
        td.innerHTML = `<span class="badge-estado badge-saldado"><i class="fas fa-check-circle" style="font-size:0.65rem"></i> Saldado</span>`;
      }
    });
  } catch (e) { console.error('Error cargando deudas:', e); }
}

/* ─── Modales ─── */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});

/* ─── Toast ─── */
function showToast(msg, tipo = 'success') {
  const container = document.querySelector('.messages') || (() => {
    const d = document.createElement('div'); d.className = 'messages'; document.body.appendChild(d); return d;
  })();
  const el = document.createElement('div');
  el.className = `message message--${tipo}`;
  const icon = tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-times-circle' : 'fa-info-circle';
  el.innerHTML = `<i class="fas ${icon}"></i><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/* ══════════════════════════════════════════════════════════════════════
   DELEGACIÓN DE EVENTOS — un único listener en la tabla captura clics
   de TODAS las páginas de DataTables, incluyendo las que se renderizan
   después de que el script se ejecutó por primera vez.
   Antes: querySelectorAll('.view-btn').forEach(btn => btn.addEventListener(...))
           → solo asignaba eventos a los botones del DOM inicial (página 1).
   Ahora: document.getElementById('tablaClientes').addEventListener('click', ...)
           → intercepta cualquier clic dentro de la tabla sin importar la página.
══════════════════════════════════════════════════════════════════════ */
document.getElementById('tablaClientes').addEventListener('click', async function (e) {

  /* closest() sube por el árbol hasta encontrar el botón real,
     incluso si el usuario hizo clic en el <i> del icono interior */
  const btn = e.target.closest('.view-btn, .edit-btn, .historial-btn, .pago-btn, .toggle-btn');
  if (!btn) return;

  const id = btn.dataset.id;

  /* ─── MODAL VER ─── */
  if (btn.classList.contains('view-btn')) {
    const res  = await fetch(URL_OBTENER(id));
    const data = await res.json();
    if (!data.ok) { showToast(data.error, 'error'); return; }
    const c     = data.cliente;
    const deuda = parseFloat(c.deuda);
      document.getElementById('verInfoCliente').innerHTML = `
      <div class="ver-campo"><span class="ver-label">Nombre</span><span class="ver-valor">${c.nombre}</span></div>
      <div class="ver-campo"><span class="ver-label">Teléfono</span><span class="ver-valor">${c.telefono}</span></div>
      <div class="ver-campo"><span class="ver-label">Correo electrónico</span><span class="ver-valor">${c.email || '<span style="color:var(--color-texto-muted)">No registrado</span>'}</span></div>
      <div class="ver-campo"><span class="ver-label">Dirección</span><span class="ver-valor">${c.direccion}</span></div>
      <div class="ver-campo"><span class="ver-label">Estado</span><span class="ver-valor"><span class="badge-estado badge-${c.estado ? 'activo' : 'inactivo'}">${c.estado ? 'Activo' : 'Inactivo'}</span></span></div>
      <div class="ver-campo ver-campo--destacado" style="${deuda > 0 ? 'background:var(--color-deuda-glow);border-color:var(--color-deuda-brd)' : ''}">
        <span class="ver-label">Deuda Pendiente</span>
        <span class="ver-valor ver-valor--monto" style="color:${deuda > 0 ? 'var(--color-deuda)' : 'var(--color-exito)'}">$${deuda.toLocaleString('es-CO', {minimumFractionDigits:0})}</span>
      </div>`;
    openModal('modalVer');
    return;
  }

  /* ─── MODAL EDITAR ─── */
  if (btn.classList.contains('edit-btn')) {
    const tr = btn.closest('tr');
    modoEdicion       = true;
    clienteEditandoId = id;
    configurarModalEditar(id);
    document.getElementById('fNombre').value    = tr.dataset.nombre    || '';
    document.getElementById('fTelefono').value  = tr.dataset.telefono  || '';
    document.getElementById('fDireccion').value = tr.dataset.direccion || '';
    document.getElementById('fEmail').value     = tr.dataset.email     || '';
    document.getElementById('formAlerta').style.display = 'none';
    openModal('modalForm');
    return;
  }

  /* ─── MODAL HISTORIAL DE PEDIDOS ─── */
  if (btn.classList.contains('historial-btn')) {
    document.getElementById('histPedidosList').innerHTML =
      '<div class="historial-vacio"><i class="fas fa-spinner fa-spin"></i><p>Cargando historial…</p></div>';
    openModal('modalHistorial');

    const res  = await fetch(URL_HISTORIAL(id));
    const data = await res.json();
    if (!data.ok) { showToast(data.error, 'error'); closeModal('modalHistorial'); return; }

    const c = data.cliente;
    document.getElementById('histCliAvatar').textContent      = c.nombre.charAt(0).toUpperCase();
    document.getElementById('histCliNombre').textContent      = c.nombre;
    document.getElementById('histTotalPedidos').textContent   = data.total_pedidos;

    const totalFacturado = data.pedidos.reduce((a, p) => a + parseFloat(p.total), 0);
    document.getElementById('histTotalFacturado').textContent = `$${totalFacturado.toLocaleString('es-CO', {minimumFractionDigits:0})}`;
    document.getElementById('histDeudaTotal').textContent     = `$${parseFloat(data.deuda_total).toLocaleString('es-CO', {minimumFractionDigits:0})}`;

    if (!data.pedidos.length) {
      document.getElementById('histPedidosList').innerHTML =
        '<div class="historial-vacio"><i class="fas fa-shopping-bag"></i><p>Este cliente no tiene pedidos registrados.</p></div>';
      return;
    }

    document.getElementById('histPedidosList').innerHTML = data.pedidos.map(p => {
      const pendiente  = parseFloat(p.pendiente);
      const badgeClass = p.estado === 'Completado' ? 'badge-completado'
                       : p.estado === 'Anulado'    ? 'badge-anulado'
                       : 'badge-pendiente';
      
      // Tabla de productos del pedido
      const detallesHtml = p.detalles && p.detalles.length
        ? `<div class="pedido-detalles-tabla-wrap">
            <table class="pedido-detalles-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align:center;width:70px">Cant.</th>
                  <th style="text-align:right;width:100px">P. Unit.</th>
                  <th style="text-align:right;width:100px">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${p.detalles.map(d => `
                  <tr>
                    <td>
                      <div style="font-weight:600">${d.producto}</div>
                      ${d.observaciones ? `<div style="font-size:0.75rem;color:var(--color-texto-muted);margin-top:2px">${d.observaciones}</div>` : ''}
                    </td>
                    <td style="text-align:center">${d.cantidad}</td>
                    <td style="text-align:right">$${parseFloat(d.precio_unitario).toLocaleString('es-CO', {minimumFractionDigits:0})}</td>
                    <td style="text-align:right;color:var(--color-exito);font-weight:600">$${parseFloat(d.sub_total).toLocaleString('es-CO', {minimumFractionDigits:0})}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
           </div>`
        : '<div style="font-size:0.82rem;color:var(--color-texto-muted);padding:8px 0">Sin productos registrados</div>';
      
      // Resumen de totales del pedido
      const totalesHtml = `<div class="pedido-totales">
        <div class="pedido-total-row">
          <span>Total pedido:</span>
          <span class="pedido-total-valor">$${parseFloat(p.total).toLocaleString('es-CO', {minimumFractionDigits:0})}</span>
        </div>
        <div class="pedido-total-row">
          <span>Pagado:</span>
          <span style="color:var(--color-exito)">$${parseFloat(p.pagado).toLocaleString('es-CO', {minimumFractionDigits:0})}</span>
        </div>
        ${pendiente > 0 && p.estado !== 'Anulado'
          ? `<div class="pedido-total-row">
               <span>Pendiente:</span>
               <span style="color:var(--color-deuda);font-weight:700">$${pendiente.toLocaleString('es-CO', {minimumFractionDigits:0})}</span>
             </div>`
          : ''}
      </div>`;
      
      return `
        <div class="historial-pedido">
          <div class="historial-row">
            <div>
              <span class="historial-id">#${p.id}</span>
              <span class="historial-fecha" style="margin-left:8px">${p.fecha}</span>
              <span style="margin-left:10px;font-size:0.78rem;color:var(--color-texto-muted)"><i class="fas fa-box" style="font-size:0.65rem;margin-right:3px"></i>${p.cantidad_productos} producto${p.cantidad_productos !== 1 ? 's' : ''}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <span class="badge-estado ${badgeClass}">${p.estado}</span>
            </div>
          </div>
          ${detallesHtml}
          ${totalesHtml}
        </div>`;
    }).join('');
    return;
  }

  /* ─── MODAL HISTORIAL DE PAGOS ─── */
  if (btn.classList.contains('pago-btn')) {
    document.getElementById('histPagosBody').innerHTML =
      '<tr><td colspan="4" style="text-align:center;padding:20px"><i class="fas fa-spinner fa-spin"></i> Cargando pagos…</td></tr>';
    openModal('modalHistorialPagos');

    const res  = await fetch(URL_HISTORIAL_PAGOS(id));
    const data = await res.json();
    if (!data.ok) { showToast(data.error, 'error'); closeModal('modalHistorialPagos'); return; }

    const c = data.cliente;
    document.getElementById('histPagosCliAvatar').textContent   = c.nombre.charAt(0).toUpperCase();
    document.getElementById('histPagosCliNombre').textContent   = c.nombre;
    document.getElementById('histPagosTotalPagos').textContent  = data.total_pagos;
    document.getElementById('histPagosTotalPagado').textContent = `$${parseFloat(data.total_pagado).toLocaleString('es-CO', {minimumFractionDigits:0})}`;

    if (!data.pagos.length) {
      document.getElementById('histPagosBody').innerHTML =
        '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--color-texto-muted)"><i class="fas fa-info-circle"></i> Este cliente no tiene pagos registrados.</td></tr>';
      return;
    }

    document.getElementById('histPagosBody').innerHTML = data.pagos.map(p => `
      <tr>
        <td>${p.fecha}</td>
        <td><strong>#${p.pedido_id}</strong></td>
        <td>$${parseFloat(p.pedido_total).toLocaleString('es-CO', {minimumFractionDigits:0})}</td>
        <td style="color:var(--color-exito);font-weight:700">$${parseFloat(p.monto).toLocaleString('es-CO', {minimumFractionDigits:0})}</td>
      </tr>
    `).join('');
    return;
  }

  /* ─── TOGGLE ESTADO (activar / inactivar) — ahora manejado por modales ─── */
  if (btn.classList.contains('toggle-btn')) {
    return;
  }
});

/* ─── MODAL CREAR ─── */
let modoEdicion = false, clienteEditandoId = null;

function configurarModalCrear() {
  document.getElementById('modalFormHeader').className  = 'modal-header modal-header--agregar';
  document.getElementById('formModalTitulo').innerHTML  = '<i class="fas fa-user-plus"></i> Nuevo Cliente';
  document.getElementById('formModalTitulo').className  = 'modal-titulo modal-titulo--agregar';
  document.getElementById('btnGuardarCliente').className= 'btn-guardar';
  document.getElementById('btnGuardarTexto').textContent= 'Guardar Cliente';
  ['fNombre','fTelefono','fDireccion','fEmail'].forEach(id => {
    document.getElementById(id).className = 'form-input';
  });
}
function configurarModalEditar(id) {
  document.getElementById('modalFormHeader').className  = 'modal-header modal-header--editar';
  document.getElementById('formModalTitulo').innerHTML  = `<i class="fas fa-user-edit"></i> Editar Cliente #${id}`;
  document.getElementById('formModalTitulo').className  = 'modal-titulo modal-titulo--editar';
  document.getElementById('btnGuardarCliente').className= 'btn-guardar btn-guardar--editar';
  document.getElementById('btnGuardarTexto').textContent= 'Actualizar Cliente';
  ['fNombre','fTelefono','fDireccion','fEmail'].forEach(id => {
    document.getElementById(id).className = 'form-input editar';
  });
}

document.getElementById('btnNuevoCliente').addEventListener('click', () => {
  modoEdicion = false; clienteEditandoId = null;
  configurarModalCrear();
  ['fNombre','fTelefono','fDireccion','fEmail'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('formAlerta').style.display = 'none';
  openModal('modalForm');
});

/* ─── Guardar cliente ─── */
document.getElementById('btnGuardarCliente').addEventListener('click', async () => {
  const alerta = document.getElementById('formAlerta');
  alerta.style.display = 'none';
  const validacion = window.validarFormularioCliente();
  if (!validacion.valido) {
    alerta.innerHTML = validacion.errores.join('<br>');
    alerta.style.display = 'block';
    return;
  }

  const nombre    = document.getElementById('fNombre').value.trim();
  const telefono  = document.getElementById('fTelefono').value.trim();
  const direccion = document.getElementById('fDireccion').value.trim();
  const email     = document.getElementById('fEmail').value.trim();

  if (!nombre) { alerta.textContent = 'El nombre es obligatorio.'; alerta.style.display = 'block'; return; }

  const btn = document.getElementById('btnGuardarCliente');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando…';

  const url = modoEdicion ? URL_EDITAR(clienteEditandoId) : URL_CREAR;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
    body: JSON.stringify({ nombre, telefono, direccion, email })
  });
  const data = await res.json();

  btn.disabled = false;
  const textoBtn = modoEdicion ? 'Actualizar Cliente' : 'Guardar Cliente';
  btn.innerHTML = `<i class="fas fa-save"></i> <span id="btnGuardarTexto">${textoBtn}</span>`;

  if (data.ok) {
    closeModal('modalForm');
    showToast(data.message);
    setTimeout(() => location.reload(), 1200);
  } else {
    alerta.textContent = data.error;
    alerta.style.display = 'block';
  }
});

/* ─── Cerrar modales con ESC ─── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['modalVer','modalForm','modalHistorial','modalHistorialPagos','modalInactivar','modalActivar'].forEach(id => closeModal(id));
  }
});

/* ════════════════════════════════════════════════════════════════
   MODALES INACTIVAR / ACTIVAR CLIENTE
   ════════════════════════════════════════════════════════════════ */
function abrirModalInactivar(id, nombre) {
  document.getElementById('inactivar-nombre').textContent = nombre;
  document.getElementById('formInactivar').action = URL_TOGGLE(id);
  openModal('modalInactivar');
}

function abrirModalActivar(id, nombre) {
  document.getElementById('activar-nombre').textContent = nombre;
  document.getElementById('formActivar').action = URL_TOGGLE(id);
  openModal('modalActivar');
}

/* ─── Submit Inactivar vía fetch ─── */
document.getElementById('formInactivar').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando…';

  try {
    const res = await fetch(this.action, {
      method: 'POST',
      headers: { 'X-CSRFToken': CSRF_TOKEN }
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    if (data.ok) {
      closeModal('modalInactivar');
      showToast(data.message);
      setTimeout(() => location.reload(), 1200);
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    showToast('Error de conexión', 'error');
  }
});

/* ─── Submit Activar vía fetch ─── */
document.getElementById('formActivar').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando…';

  try {
    const res = await fetch(this.action, {
      method: 'POST',
      headers: { 'X-CSRFToken': CSRF_TOKEN }
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    if (data.ok) {
      closeModal('modalActivar');
      showToast(data.message);
      setTimeout(() => location.reload(), 1200);
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    showToast('Error de conexión', 'error');
  }
});
