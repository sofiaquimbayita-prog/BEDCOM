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

  // Ocultar inactivos por defecto
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

/* ─── MODAL VER ─── */
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const res  = await fetch(URL_OBTENER(btn.dataset.id));
    const data = await res.json();
    if (!data.ok) { showToast(data.error, 'error'); return; }
    const c = data.cliente;
    const deuda = parseFloat(c.deuda);
    document.getElementById('verInfoCliente').innerHTML = `
      <div class="ver-campo"><span class="ver-label">Nombre</span><span class="ver-valor">${c.nombre}</span></div>
      <div class="ver-campo"><span class="ver-label">Teléfono</span><span class="ver-valor">${c.telefono}</span></div>
      <div class="ver-campo"><span class="ver-label">Dirección</span><span class="ver-valor">${c.direccion}</span></div>
      <div class="ver-campo"><span class="ver-label">Estado</span><span class="ver-valor"><span class="badge-estado badge-${c.estado ? 'activo' : 'inactivo'}">${c.estado ? 'Activo' : 'Inactivo'}</span></div>
      <div class="ver-campo ver-campo--destacado" style="${deuda > 0 ? 'background:var(--color-deuda-glow);border-color:var(--color-deuda-brd)' : ''}">
        <span class="ver-label">Deuda Pendiente</span>
        <span class="ver-valor ver-valor--monto" style="color:${deuda > 0 ? 'var(--color-deuda)' : 'var(--color-exito)'}">$${deuda.toLocaleString('es-CO', {minimumFractionDigits:0})}</span>
      </div>`;
    openModal('modalVer');
  });
});

/* ─── MODAL CREAR ─── */
let modoEdicion = false, clienteEditandoId = null;

function configurarModalCrear() {
  document.getElementById('modalFormHeader').className = 'modal-header modal-header--agregar';
  document.getElementById('formModalTitulo').innerHTML  = '<i class="fas fa-user-plus"></i> Nuevo Cliente';
  document.getElementById('formModalTitulo').className  = 'modal-titulo modal-titulo--agregar';
  document.getElementById('btnGuardarCliente').className= 'btn-guardar';
  document.getElementById('btnGuardarTexto').textContent= 'Guardar Cliente';
  ['fNombre','fTelefono','fDireccion','fEmail'].forEach(id => {
    document.getElementById(id).className = 'form-input';
  });
}
function configurarModalEditar(id) {
  document.getElementById('modalFormHeader').className = 'modal-header modal-header--editar';
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

document.querySelectorAll('.edit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tr    = btn.closest('tr');
    modoEdicion = true; clienteEditandoId = btn.dataset.id;
    configurarModalEditar(btn.dataset.id);
    document.getElementById('fNombre').value    = tr.dataset.nombre    || '';
    document.getElementById('fTelefono').value  = tr.dataset.telefono  || '';
    document.getElementById('fDireccion').value = tr.dataset.direccion || '';
    document.getElementById('fEmail').value     = tr.dataset.email     || '';
    document.getElementById('formAlerta').style.display = 'none';
    openModal('modalForm');
  });
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

  const url    = modoEdicion ? URL_EDITAR(clienteEditandoId) : URL_CREAR;
  const res    = await fetch(url, {
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

/* ─── Toggle estado (activar / inactivar) ─── */
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const estado = btn.dataset.estado === 'True';
    const accion = estado ? 'inactivar' : 'activar';
    if (!confirm(`¿Desea ${accion} este cliente?`)) return;

    const res  = await fetch(URL_TOGGLE(btn.dataset.id), {
      method: 'POST', headers: { 'X-CSRFToken': CSRF_TOKEN }
    });
    const data = await res.json();
    if (data.ok) { showToast(data.message); setTimeout(() => location.reload(), 1200); }
    else showToast(data.error, 'error');
  });
});

/* ─── MODAL HISTORIAL DE PEDIDOS ─── */
document.querySelectorAll('.historial-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.getElementById('histPedidosList').innerHTML = '<div class="historial-vacio"><i class="fas fa-spinner fa-spin"></i><p>Cargando historial…</p></div>';
    openModal('modalHistorial');

    const res  = await fetch(URL_HISTORIAL(btn.dataset.id));
    const data = await res.json();
    if (!data.ok) { showToast(data.error, 'error'); closeModal('modalHistorial'); return; }

    const c = data.cliente;
    document.getElementById('histCliAvatar').textContent = c.nombre.charAt(0).toUpperCase();
    document.getElementById('histTotalPedidos').textContent = data.total_pedidos;

    const totalFacturado = data.pedidos.reduce((a, p) => a + parseFloat(p.total), 0);
    document.getElementById('histTotalFacturado').textContent = `$${totalFacturado.toLocaleString('es-CO', {minimumFractionDigits:0})}`;
    document.getElementById('histDeudaTotal').textContent = `$${parseFloat(data.deuda_total).toLocaleString('es-CO', {minimumFractionDigits:0})}`;

    if (!data.pedidos.length) {
      document.getElementById('histPedidosList').innerHTML = `
        <div class="historial-vacio"><i class="fas fa-shopping-bag"></i><p>Este cliente no tiene pedidos registrados.</p></div>`;
      return;
    }

    document.getElementById('histPedidosList').innerHTML = data.pedidos.map(p => {
      const pendiente = parseFloat(p.pendiente);
      const badgeClass = p.estado === 'Completado' ? 'badge-completado' : p.estado === 'Anulado' ? 'badge-anulado' : 'badge-pendiente';
      return `
        <div class="historial-pedido">
          <div class="historial-row">
            <div>
              <span class="historial-id">#${p.id}</span>
              <span class="historial-fecha" style="margin-left:8px">${p.fecha}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <span class="badge-estado ${badgeClass}">${p.estado}</span>
              <span class="historial-monto">$${parseFloat(p.total).toLocaleString('es-CO', {minimumFractionDigits:0})}</span>
            </div>
          ${pendiente > 0 && p.estado !== 'Anulado' ? `<div class="historial-pendiente"><i class="fas fa-exclamation-circle"></i> Pendiente: $${pendiente.toLocaleString('es-CO', {minimumFractionDigits:0})}</div>` : ''}
        </div>`;
    }).join('');
  });
});

/* ─── MODAL HISTORIAL DE PAGOS ─── */
document.querySelectorAll('.pagos-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.getElementById('histPagosBody').innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px"><i class="fas fa-spinner fa-spin"></i> Cargando pagos…</td></tr>';
    openModal('modalHistorialPagos');

    const res = await fetch(URL_HISTORIAL_PAGOS(btn.dataset.id));
    const data = await res.json();
    if (!data.ok) { showToast(data.error, 'error'); closeModal('modalHistorialPagos'); return; }

    const c = data.cliente;
    document.getElementById('histPagosCliAvatar').textContent = c.nombre.charAt(0).toUpperCase();
    document.getElementById('histPagosCliNombre').textContent = c.nombre;
    document.getElementById('histPagosTotalPagos').textContent = data.total_pagos;
    document.getElementById('histPagosTotalPagado').textContent = `$${parseFloat(data.total_pagado).toLocaleString('es-CO', {minimumFractionDigits:0})}`;

    if (!data.pagos.length) {
      document.getElementById('histPagosBody').innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--color-texto-muted)"><i class="fas fa-info-circle"></i> Este cliente no tiene pagos registrados.</td></tr>';
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
  });
});

/* ─── Cerrar modales con ESC ─── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['modalVer','modalForm','modalHistorial','modalHistorialPagos'].forEach(id => closeModal(id));
  }
});
