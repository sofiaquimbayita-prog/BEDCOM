/* pedido.js — Módulo de Pedidos */

let cfg = {};
if (document.getElementById('js-config')) {
  cfg = document.getElementById('js-config').dataset;
}
const CSRF_TOKEN = cfg.csrf || '';
const URL_CREAR = cfg.urlCrear || '';
const URL_VER = pk => (cfg.urlVerBase || '').replace('/0/', '/' + pk + '/');
const URL_EDITAR = pk => (cfg.urlEditarBase || '').replace('/0/', '/' + pk + '/');
const URL_ESTADO = pk => (cfg.urlEstadoBase || '').replace('/0/', '/' + pk + '/');
const URL_PAGO = pk => (cfg.urlPagoBase || '').replace('/0/', '/' + pk + '/');
const URL_DESPACHO = cfg.urlDespacho || '';
const URL_PEDIDOS_DATA = cfg.urlData || '';

let PRODUCTOS_DATA = [];
let CLIENTES_DATA = [];
let totalActual = 0;
window.originalItems = [];
if (document.getElementById('productos-data')) {
  PRODUCTOS_DATA = JSON.parse(document.getElementById('productos-data').textContent);
}
if (document.getElementById('clientes-data')) {
  CLIENTES_DATA = JSON.parse(document.getElementById('clientes-data').textContent);
}



function openModal(id) {
  // Cerrar cualquier modal abierto antes de abrir el nuevo
  document.querySelectorAll('.modal.mostrar').forEach(modal => {
    if (modal.id !== id) modal.classList.remove('mostrar');
  });
  const m = document.getElementById(id);
  // Usar setTimeout(0) para que el evento de click actual termine
  // antes de mostrar el modal, evitando que el listener "click fuera"
  // lo cierre inmediatamente al recibir el mismo evento.
  setTimeout(() => { if (m) m.classList.add('mostrar'); }, 0);
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('mostrar');
}

// Listener de [data-close] con delegación
$(document).on('click', '[data-close]', function (e) {
  // Evitar cerrar si el elemento tiene otra clase de acción (btn-pagar, etc.)
  if ($(this).hasClass('btn-pagar') || $(this).hasClass('btn-ver') ||
    $(this).hasClass('btn-editar') || $(this).hasClass('btn-despacho')) return;
  closeModal(this.dataset.close);
});

// Cerrar modal clickeando fuera (backdrop)
$(document).on('click', '.modal', function (e) {
  if (e.target === this) closeModal(this.id);
});

// ═══════════════════════════════════════════════════════════════
// DATATABLES INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════
$(document).ready(function () {
  if (!($ && $.fn && $.fn.DataTable)) return;
  window.pedidoDT = $('#tablaPedidos').DataTable({
    language: { url: '/static/ap1/js/i18n/Spanish.json' },
    pageLength: 10,
    order: [[0, 'desc']],
    columnDefs: [{ orderable: false, targets: 7 }],
    ajax: {
      url: URL_PEDIDOS_DATA,
      type: 'GET',
      dataSrc: function (json) { return json.pedidos || []; }
    },
    columns: [
      { data: 'id', render: function (d) { return '<strong style="color:var(--color-acento)">#' + d + '</strong>'; } },
      { data: 'fecha' },
      { data: 'cliente_nombre', render: function (d) { return '<span style="font-weight:600">' + d + '</span>'; } },
      { data: 'total', render: function (d) { return '<span style="color:var(--color-exito);font-weight:700">$' + parseFloat(d).toFixed(2) + '</span>'; } },
      { data: 'abono', render: function (d) { return '<span style="color:var(--color-advertencia);font-weight:700">$' + parseFloat(d || 0).toFixed(2) + '</span>'; } },
      { data: 'saldo', render: function (d) { var s = parseFloat(d); return '<span class="saldo ' + (s > 0 ? 'pendiente' : 'pagado') + '" style="color:' + (s > 0 ? 'var(--color-deuda)' : 'var(--color-exito)') + ';font-weight:700">$' + s.toFixed(2) + '</span>'; } },
      {
        data: null,
        render: function (d) {
          var estado = d.estado, low = estado.toLowerCase(), opts = ['Pendiente', 'En Fabricación', 'Listo para Despacho', 'Completado', 'Anulado'];
          var s = '<select class="ped-estado-select estado-' + low + '" data-id="' + d.id + '" data-estado-actual="' + estado + '">';
          opts.forEach(function (o) { s += '<option value="' + o + '"' + (o === estado ? 'selected' : '') + '>' + o + '</option>'; });
          return s + '</select>';
        }
      },
      {
        data: null,
        render: function (d) {
          var id = d.id, html = '<div class="icons">';
          html += '<button type="button" class="view-btn btn-ver" data-id="' + id + '" title="Ver detalle"><i class="fas fa-eye"></i></button>';
          if (d.estado !== 'Anulado' && d.estado !== 'Completado') html += '<button type="button" class="edit-btn btn-editar" data-id="' + id + '" title="Editar"><i class="fas fa-edit"></i></button>';
          if (d.estado !== 'Anulado' && parseFloat(d.saldo) > 0) html += '<button type="button" class="btn-pagar" data-id="' + id + '" data-total="' + d.total + '" data-abono="' + (d.abono || 0) + '" data-saldo="' + d.saldo + '" title="Registrar pago"><i class="fas fa-money-bill-wave"></i></button>';
          if (d.estado === 'Listo para Despacho') html += '<button type="button" class="btn-despacho" data-id="' + id + '" title="Crear despacho"><i class="fas fa-truck"></i></button>';
          return html + '</div>';
        }
      }
    ]
  });
});

// ─── Toggle anulados (AJAX, sin recargar) ───
document.getElementById('toggleAnulados').addEventListener('change', function () {
  this.parentElement.querySelector('.slider').style.backgroundColor = this.checked ? '#22c55e' : '#64748b';
  if (window.pedidoDT) {
    window.pedidoDT.ajax.url(URL_PEDIDOS_DATA + '?anulados=' + (this.checked ? '1' : '')).load();
  }
});

// ─── Recargar tabla ───
function recargarTabla() {
  if (window.pedidoDT) {
    window.pedidoDT.ajax.reload();
  } else {
    location.reload();
  }
}

// ═══════════════════════════════════════════════════════════════
// DELEGACIÓN DE EVENTOS (necesario para compatibilidad DataTables)
// ═══════════════════════════════════════════════════════════════

// 1. Cambio de estado en <select>
$(document).on('change', '.ped-estado-select', async function () {
  const pk = this.dataset.id, nuevo = this.value, anterior = this.dataset.estadoActual;
  const fd = new FormData();
  fd.append('csrfmiddlewaretoken', CSRF_TOKEN);
  fd.append('nuevo_estado', nuevo);
  try {
    const res = await fetch(URL_ESTADO(pk), { method: 'POST', body: fd });
    const data = await res.json();
    if (data.ok) {
      this.dataset.estadoActual = nuevo;
      this.className = `ped-estado-select estado-${nuevo.toLowerCase()}`;
      window.showToast(data.message);
      recargarTabla();
    } else {
      this.value = anterior;
      window.showToast(data.error, 'error');
    }
  } catch (e) {
    this.value = anterior;
    window.showToast('Error al cambiar estado', 'error');
  }
});

window.__pedidoVerId = null;

$(document).on('click', '.btn-ver', async function () {
  try {
    const res = await fetch(URL_VER(this.dataset.id));
    const data = await res.json();
    if (!data.ok) { window.showToast(data.error, 'error'); return; }
    const p = data.pedido;
    window.__pedidoVerId = p.id;
    document.getElementById('verTitulo').textContent = `Pedido #${p.id}`;
    document.getElementById('verInfoCliente').innerHTML = `
      <div class="ver-campo"><span class="ver-label">Cliente</span><span class="ver-valor">${p.cliente_nombre}</span></div>
      <div class="ver-campo"><span class="ver-label">Teléfono</span><span class="ver-valor">${p.cliente_telefono}</span></div>
      <div class="ver-campo"><span class="ver-label">Fecha Creación</span><span class="ver-valor">${p.fecha}</span></div>
      <div class="ver-campo"><span class="ver-label">Fecha Entrega</span><span class="ver-valor">${p.fecha_entrega ? new Date(p.fecha_entrega + 'T00:00').toLocaleDateString('es-CO') : '—'}</span></div>
      <div class="ver-campo"><span class="ver-label">Estado</span><span class="ver-valor"><span class="badge-estado badge-${p.estado.toLowerCase()}">${p.estado}</span></span></div>
      <div class="ver-campo"><span class="ver-label">Abono</span><span class="ver-valor">$${parseFloat(p.abono || 0).toFixed(2)}</span></div>
      <div class="ver-campo ver-campo--destacado"><span class="ver-label">Total</span><span class="ver-valor ver-valor--monto">$${parseFloat(p.total).toFixed(2)}</span></div>`;
    document.getElementById('verDetallesBody').innerHTML = p.detalles.map(d => `
      <tr><td>${d.producto_nombre} ${d.es_personalizado ? '<span class="badge-estado badge-pendiente">Personalizado</span>' : ''}</td><td>${d.cantidad}</td>
      <td><span class="precio-display">$${parseFloat(d.precio_unitario).toFixed(2)}</span></td>
      <td><span class="precio-display">$${parseFloat(d.sub_total).toFixed(2)}</span></td>
      <td style="color:var(--color-texto-muted);font-size:0.85rem">${d.especificaciones || d.observaciones || '—'}</td></tr>
    `).join('');
    document.getElementById('verTotal').textContent = `$${parseFloat(p.total).toFixed(2)}`;
    openModal('modalVer');
  } catch (e) { window.showToast('Error al cargar detalle', 'error'); }
});

// 5. Botón EDITAR
$(document).on('click', '.btn-editar', async function () {
  try {
    const res = await fetch(URL_VER(this.dataset.id));
    const data = await res.json();
    if (!data.ok) { window.showToast(data.error, 'error'); return; }
    const p = data.pedido;
    modoEdicion = true;
    pedidoEditandoId = this.dataset.id;
    window.originalItems = p.detalles || [];
    configurarModalEditar(p.id);
    if (clienteSelect) clienteSelect.value = p.cliente_id || '';
    const alerta = document.getElementById('formAlerta');
    const itemsBody = document.getElementById('formItemsBody');
    const abonoInput = document.getElementById('abonoInput');
    if (alerta) alerta.style.display = 'none';
    const fechaEntregaInput = document.getElementById('fechaEntregaInput');
    if (fechaEntregaInput) fechaEntregaInput.value = p.fecha_entrega || '';
    if (itemsBody) { itemsBody.innerHTML = ''; p.detalles.forEach(d => itemsBody.appendChild(crearFila(d))); }
    if (abonoInput) abonoInput.value = parseFloat(p.abono || 0);
    recalcular();
    openModal('modalForm');
  } catch (e) { window.showToast('Error al cargar pedido', 'error'); }
});


let pedidoPagoId = null;
let pedidoPagoPendiente = 0;

$(document).on('click', '.btn-pagar', function (e) {
  e.preventDefault();
  e.stopPropagation();

  pedidoPagoId = $(this).data('id');
  const total = parseFloat($(this).data('total')) || 0;
  const abono = parseFloat($(this).data('abono')) || 0;
  pedidoPagoPendiente = parseFloat($(this).data('saldo')) || 0;

  document.getElementById('pagoIdPedido').textContent = `Pedido #${pedidoPagoId}`;
  document.getElementById('pagoTotalPedido').textContent = `$${total.toFixed(2)}`;
  document.getElementById('pagoPagado').textContent = `$${abono.toFixed(2)}`;
  document.getElementById('pagoPendiente').textContent = `$${pedidoPagoPendiente.toFixed(2)}`;
  document.getElementById('pagoMonto').value = pedidoPagoPendiente.toFixed(2);
  document.getElementById('pagoAlerta').style.display = 'none';

  openModal('modalPago');
});

// 7. Botón DESPACHO
$(document).on('click', '.btn-despacho', function (e) {
  e.preventDefault();
  e.stopPropagation();
  const pk = $(this).data('id');
  if (!URL_DESPACHO) {
    window.showToast('URL de despacho no configurada', 'error');
    return;
  }
  // Redirigir a la vista de crear despacho pre-cargada con el pedido
  const url = URL_DESPACHO + '?pedido=' + pk;
  window.location.href = url;
});

// 8. Guardar pago
$(document).on('click', '#btnGuardarPago', async function () {
  const monto = parseFloat(document.getElementById('pagoMonto').value);

  if (!monto || monto <= 0) {
    window.showToast('Ingresa un monto válido mayor a cero.', 'error');
    return;
  }
  if (monto > pedidoPagoPendiente) {
    window.showToast(`El monto no puede superar el saldo pendiente ($${pedidoPagoPendiente.toLocaleString('es-CO', { minimumFractionDigits: 0 })}).`, 'error');
    return;
  }

  const btn = this;
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando…';

  try {
    const res = await fetch(URL_PAGO(pedidoPagoId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
      body: JSON.stringify({ monto: monto })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = originalHtml;

    if (data.ok) {
      closeModal('modalPago');
      window.showToast(data.message);
      recargarTabla();
    } else {
      window.showToast(data.error || 'Error al procesar el pago', 'error');
    }
  } catch (e) {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    window.showToast('Error al procesar el pago', 'error');
  }
});

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DEL FORMULARIO (Crear/Editar)
// ═══════════════════════════════════════════════════════════════

function validarAbono(total, abono, esEspecial) {
  if (esEspecial) {
    if (abono > total) return { valido: false, mensaje: 'El abono no puede ser mayor al total del pedido.' };
    return { valido: true, mensaje: '' };
  }
  const minimo = total * 0.5;
  if (abono < minimo) return { valido: false, mensaje: `El abono debe ser al menos el 50% del total (mínimo $${minimo.toFixed(2)})` };
  if (abono > total) return { valido: false, mensaje: 'El abono no puede ser mayor al total del pedido.' };
  return { valido: true, mensaje: '' };
}

function validarPedidoCompleto(items, total, abono, clienteId) {
  const errores = [];
  if (!clienteId) errores.push('Debe seleccionar un cliente');
  if (!items.length) errores.push('Debe agregar al menos un producto');

  // Ignorar productos personalizados al buscar duplicados
  const productosIds = items.filter(item => !item.es_personalizado).map(item => item.producto_id);
  const duplicados = productosIds.filter((id, index) => productosIds.indexOf(id) !== index);
  if (duplicados.length > 0) errores.push('No puede agregar el mismo producto múltiples veces');

  const clienteSeleccionado = CLIENTES_DATA.find(c => c.id == clienteId);
  const esEspecial = clienteSeleccionado ? clienteSeleccionado.es_especial : false;

  for (const item of items) {
    if (item.es_personalizado) {
      if (!item.especificaciones) errores.push('Un producto personalizado requiere especificaciones.');
      if (item.precio_unitario <= 0) errores.push('Un producto personalizado requiere un precio mayor a 0.');
    } else {
      const producto = PRODUCTOS_DATA.find(p => p.id == item.producto_id);
      if (!producto) { errores.push(`Producto ID ${item.producto_id} no existe`); }
      else {
        // En modo edición, sumar la cantidad reservada original al stock disponible
        const originalItem = window.originalItems ? window.originalItems.find(oi => oi.producto_id == item.producto_id && !oi.es_personalizado) : null;
        const originalQty = originalItem ? originalItem.cantidad : 0;
        const virtualStock = producto.stock + originalQty;
        if (virtualStock < item.cantidad) { errores.push(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock} (Reservado original: ${originalQty})`); }
      }
    }
  }
  if (!esEspecial) {
    const minimoAbono = total * 0.5;
    if (abono < minimoAbono) errores.push(`El abono debe ser al menos el 50% del total (mínimo $${minimoAbono.toFixed(2)})`);
  }
  if (abono > total) errores.push('El abono no puede ser mayor al total del pedido');
  return errores;
}

function agregarValidacionTiempoReal() {
  const formItemsBody = document.querySelector('#formItemsBody');
  if (!formItemsBody) return;
  formItemsBody.addEventListener('input', function (e) {
    if (e.target.classList.contains('inp-cantidad')) {
      const tr = e.target.closest('tr');
      const productoSelect = tr.querySelector('.sel-producto');
      const cantidad = parseInt(e.target.value) || 0;
      if (productoSelect && productoSelect.value) {
        const producto = PRODUCTOS_DATA.find(p => p.id == productoSelect.value);
        if (producto) {
          const originalItem = window.originalItems ? window.originalItems.find(oi => oi.producto_id == productoSelect.value && !oi.es_personalizado) : null;
          const originalQty = originalItem ? originalItem.cantidad : 0;
          const virtualStock = producto.stock + originalQty;

          if (cantidad > virtualStock) {
            e.target.classList.add('error-input');
            e.target.style.borderColor = 'var(--color-error)';
            const errorMsg = document.createElement('small');
            errorMsg.textContent = `Stock máximo: ${virtualStock}`;
            errorMsg.style.color = 'var(--color-error)';
            errorMsg.style.fontSize = '0.7rem';
            errorMsg.classList.add('stock-error-msg');
            const parent = e.target.parentElement;
            const existingError = parent.querySelector('.stock-error-msg');
            if (existingError) existingError.remove();
            parent.appendChild(errorMsg);
            setTimeout(() => errorMsg.remove(), 3000);
          } else {
            e.target.style.borderColor = '';
            const existingError = e.target.parentElement.querySelector('.stock-error-msg');
            if (existingError) existingError.remove();
          }
        }
      }
    }
  });
}

function validarAbonoEnTiempoReal() {
  const abonoInput = document.getElementById('abonoInput');
  if (!abonoInput) return;
  abonoInput.addEventListener('input', function () {
    const total = totalActual;
    const abono = parseFloat(this.value) || 0;

    const clienteId = clienteSelect ? clienteSelect.value : '';
    const clienteSeleccionado = CLIENTES_DATA.find(c => c.id == clienteId);
    const esEspecial = clienteSeleccionado ? clienteSeleccionado.es_especial : false;

    if (esEspecial) {
      this.style.borderColor = '';
      const helpText = document.getElementById('abonoHelp');
      if (helpText) { helpText.style.color = 'var(--color-exito)'; helpText.textContent = 'Cliente especial: Plazo extendido (sin mínimo del 50%)'; }
      return;
    }

    const minimo = total * 0.5;
    const helpText = document.getElementById('abonoHelp');
    if (abono > 0 && abono < minimo) {
      this.style.borderColor = 'var(--color-error)';
      if (helpText) { helpText.style.color = 'var(--color-error)'; helpText.textContent = `El abono debe ser mínimo $${minimo.toFixed(2)}`; }
    } else {
      this.style.borderColor = '';
      if (helpText) { helpText.style.color = 'var(--color-texto-muted)'; helpText.textContent = 'El abono debe ser al menos el 50% del total del pedido'; }
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  agregarValidacionTiempoReal();
  validarAbonoEnTiempoReal();

  // Asegurar que todos los modales comiencen ocultos
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('mostrar');
  });
});

const clienteSelect = document.getElementById('clienteSelect');
if (clienteSelect) {
  clienteSelect.innerHTML = '<option value="">— Seleccionar cliente —</option>' + CLIENTES_DATA.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  clienteSelect.addEventListener('change', function () {
    const abonoInput = document.getElementById('abonoInput');
    if (abonoInput) {
      abonoInput.dispatchEvent(new Event('input'));
    }
  });
}

let modoEdicion = false;
let pedidoEditandoId = null;

function buildOpts(selId = '') {
  return `<option value="">— Producto —</option>` + PRODUCTOS_DATA.map(p => `<option value="${p.id}" data-precio="${p.precio}" data-stock="${p.stock}" ${p.id == selId ? 'selected' : ''}>${p.nombre}</option>`).join('');
}

/* ─── Sanitizador de notas/especificaciones ──────────────────────────── */
const REGEX_NOTAS = /[<>{}[\]$%&"'`\\]/g;
function sanitizarNotas(valor) {
  return String(valor || '').replace(REGEX_NOTAS, '').slice(0, 300);
}

function crearFila(item = {}) {
  const tr = document.createElement('tr');
  const isCustom = item.es_personalizado ? 'checked' : '';
  const isCustomBool = item.es_personalizado === true;
  tr.innerHTML = `
    <td><select class="form-select-ped sel-producto" ${isCustomBool ? 'disabled' : ''}>${buildOpts(item.producto_id || '')}</select></td>
    <td style="text-align:center"><input type="checkbox" class="chk-personalizado form-check-input" ${isCustom}></td>
    <td><span class="stock-badge">${isCustomBool ? '—' : ''}</span></td>
    <td><input type="number" class="form-input inp-precio" value="${item.precio_unitario || 0}" ${isCustomBool ? '' : 'readonly'} step="0.01" style="width:90px"></td>
    <td><input type="number" class="form-input inp-cantidad" value="${item.cantidad || 1}" min="1" style="width:70px"></td>
    <td><input type="text" class="form-input inp-notas" placeholder="Especificaciones/Notas" value="${item.especificaciones || item.observaciones || ''}"></td>
    <td style="text-align:center"><button type="button" class="btn-quitar-fila"><i class="fas fa-trash-alt"></i></button></td>
  `;

  if (!isCustomBool && item.producto_id) {
    const prod = PRODUCTOS_DATA.find(p => p.id == item.producto_id);
    if (prod) {
      tr.querySelector('.stock-badge').textContent = prod.stock;
      tr.querySelector('.inp-precio').value = prod.precio;
    }
  }

  const chkPers = tr.querySelector('.chk-personalizado');
  const selProd = tr.querySelector('.sel-producto');
  const inpPrecio = tr.querySelector('.inp-precio');
  const stockBadge = tr.querySelector('.stock-badge');

  chkPers.addEventListener('change', function () {
    if (this.checked) {
      selProd.disabled = true;
      selProd.value = '';
      inpPrecio.readOnly = false;
      stockBadge.textContent = '—';
    } else {
      selProd.disabled = false;
      inpPrecio.readOnly = true;
      selProd.dispatchEvent(new Event('change'));
    }
    recalcular();
  });

  selProd.addEventListener('change', function () {
    if (chkPers.checked) return;
    const opt = this.options[this.selectedIndex];
    stockBadge.textContent = opt.dataset.stock || '—';
    inpPrecio.value = opt.dataset.precio || 0;
    recalcular();
  });

  tr.querySelector('.inp-precio').addEventListener('input', recalcular);
  tr.querySelector('.inp-cantidad').addEventListener('input', recalcular);
  // Sanitizar caracteres especiales en notas en tiempo real
  tr.querySelector('.inp-notas').addEventListener('input', function () {
    const sanitizado = sanitizarNotas(this.value);
    if (this.value !== sanitizado) this.value = sanitizado;
  });
  tr.querySelector('.btn-quitar-fila').addEventListener('click', () => { tr.remove(); recalcular(); });
  return tr;
}

function recalcular() {
  let t = 0;
  document.querySelectorAll('#formItemsBody tr').forEach(tr => {
    const chk = tr.querySelector('.chk-personalizado').checked;
    const cant = parseInt(tr.querySelector('.inp-cantidad').value) || 0;
    if (chk) {
      const precio = parseFloat(tr.querySelector('.inp-precio').value) || 0;
      t += precio * cant;
    } else {
      const sel = tr.querySelector('.sel-producto');
      if (sel && sel.value) {
        const p = PRODUCTOS_DATA.find(p => p.id == sel.value);
        if (p) t += p.precio * cant;
      }
    }
  });
  totalActual = t;
  const formatted = `$${t.toFixed(2)}`;
  const formTotal = document.getElementById('formTotal');
  if (formTotal) formTotal.textContent = formatted;
  const formTotalDisplay = document.getElementById('formTotalDisplay');
  if (formTotalDisplay) formTotalDisplay.value = formatted;
  const formTotalMonto = document.getElementById('formTotalMonto');
  if (formTotalMonto) formTotalMonto.textContent = formatted;

  // Trigger abono update
  const abonoInput = document.getElementById('abonoInput');
  if (abonoInput) {
    abonoInput.dispatchEvent(new Event('input'));
  }
}

function configurarModalCrear() {
  const h = document.getElementById('modalFormHeader');
  const t = document.getElementById('formModalTitulo');
  const b = document.getElementById('btnGuardarPedido');
  const c = document.getElementById('btnCerrarForm');
  if (h) h.className = 'modal-header modal-header--agregar';
  if (t) { t.innerHTML = '<i class="fas fa-cart-plus"></i> Registrar Pedido'; t.className = 'modal-titulo modal-titulo--agregar'; }
  if (b) b.className = 'btn-guardar';
  if (c) c.className = 'btn-cerrar';
  const btnTexto = document.getElementById('btnGuardarTexto');
  if (btnTexto) btnTexto.textContent = 'Guardar Pedido';
}

function configurarModalEditar(id) {
  const h = document.getElementById('modalFormHeader');
  const t = document.getElementById('formModalTitulo');
  const b = document.getElementById('btnGuardarPedido');
  const c = document.getElementById('btnCerrarForm');
  if (h) h.className = 'modal-header modal-header--editar';
  if (t) { t.innerHTML = `<i class="fas fa-edit"></i> Editar Pedido #${id}`; t.className = 'modal-titulo modal-titulo--editar'; }
  if (b) b.className = 'btn-guardar btn-guardar--editar';
  if (c) c.className = 'btn-cerrar btn-cerrar--editar';
  const btnTexto = document.getElementById('btnGuardarTexto');
  if (btnTexto) btnTexto.textContent = 'Actualizar Pedido';
}

function abrirModalCrear() {
  modoEdicion = false;
  pedidoEditandoId = null;
  window.originalItems = [];
  if (clienteSelect) clienteSelect.value = '';
  const fechaEntregaInput = document.getElementById('fechaEntregaInput');
  if (fechaEntregaInput) fechaEntregaInput.value = '';
  configurarModalCrear();
  const itemsBody = document.getElementById('formItemsBody');
  const alerta = document.getElementById('formAlerta');
  const abonoInput = document.getElementById('abonoInput');
  if (itemsBody) itemsBody.innerHTML = '';
  if (alerta) alerta.style.display = 'none';
  if (abonoInput) abonoInput.value = '';
  recalcular();
  if (itemsBody) itemsBody.appendChild(crearFila());
  openModal('modalForm');
}

const btnNuevo = document.getElementById('btnNuevoPedido');
if (btnNuevo) btnNuevo.addEventListener('click', abrirModalCrear);

const btnAgregarFila = document.getElementById('btnAgregarFila');
if (btnAgregarFila) {
  btnAgregarFila.addEventListener('click', () => {
    const itemsBody = document.getElementById('formItemsBody');
    if (itemsBody) itemsBody.appendChild(crearFila());
  });
}

const btnGuardar = document.getElementById('btnGuardarPedido');
if (btnGuardar) {
  btnGuardar.addEventListener('click', async () => {
    const clienteId = clienteSelect ? clienteSelect.value : '';
    if (!clienteId) { window.showToast('Selecciona un cliente.', 'error'); return; }
    const clienteSeleccionado = CLIENTES_DATA.find(c => c.id == clienteId);
    const nombreCliente = clienteSeleccionado ? clienteSeleccionado.nombre : '';
    const telefonoCliente = clienteSeleccionado ? clienteSeleccionado.telefono : '';
    const fechaEntregaInput = document.getElementById('fechaEntregaInput');
    const fechaEntrega = fechaEntregaInput ? fechaEntregaInput.value : '';
    const abonoInput = document.getElementById('abonoInput');
    const abono = parseFloat(abonoInput ? abonoInput.value : 0) || 0;
    const total = totalActual;
    if (!fechaEntrega) { window.showToast('Selecciona la fecha de entrega.', 'error'); return; }
    //  Comparación de fechas con Date para mayor robustez
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fechaEnt = new Date(fechaEntrega + 'T00:00');
    if (fechaEnt <= hoy) { window.showToast('La fecha de entrega debe ser futura.', 'error'); return; }
    const validacion = validarAbono(total, abono, clienteSeleccionado ? clienteSeleccionado.es_especial : false);
    if (!validacion.valido) { window.showToast(validacion.mensaje, 'error'); return; }
    const items = [];
    document.querySelectorAll('#formItemsBody tr').forEach(tr => {
      const chk = tr.querySelector('.chk-personalizado').checked;
      const sel = tr.querySelector('.sel-producto');
      const cant = tr.querySelector('.inp-cantidad');
      const precio = tr.querySelector('.inp-precio');
      const nota = tr.querySelector('.inp-notas');
      const cantidad = parseInt(cant ? cant.value : 0);
      if (!cantidad || cantidad < 1) return;

      if (chk) {
        items.push({
          es_personalizado: true,
          precio_unitario: parseFloat(precio.value) || 0,
          cantidad: cantidad,
          especificaciones: nota ? nota.value.trim() : ''
        });
      } else {
        if (!sel || !sel.value) return;
        items.push({
          producto_id: sel.value,
          cantidad: cantidad,
          observaciones: nota ? nota.value.trim() : ''
        });
      }
    });
    if (!items.length) { window.showToast('Agrega al menos un producto válido.', 'error'); return; }
    const errores = validarPedidoCompleto(items, total, abono, clienteId);
    if (errores.length) {
      errores.forEach(err => window.showToast(err, 'error'));
      return;
    }
    const btn = document.getElementById('btnGuardarPedido');
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando…'; }
    const url = modoEdicion ? URL_EDITAR(pedidoEditandoId) : URL_CREAR;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
        body: JSON.stringify({ cliente_id: clienteId, cliente_nombre: nombreCliente, cliente_telefono: telefonoCliente, fecha_entrega: fechaEntrega, items: items, abono: abono })
      });
      const data = await res.json();
      if (btn) { btn.disabled = false; btn.innerHTML = originalHtml; }
      if (data.ok) {
        closeModal('modalForm');
        recargarTabla();
        if (!modoEdicion && typeof mostrarModalComprobante === 'function') {
          mostrarModalComprobante(data.pedido.id, clienteSeleccionado ? clienteSeleccionado.email : null);
        } else {
          window.showToast(data.message);
        }
      } else {
        window.showToast(data.error || 'Error al guardar el pedido', 'error');
      }
    } catch (error) {
      if (btn) { btn.disabled = false; btn.innerHTML = originalHtml; }
      window.showToast('Error al guardar el pedido', 'error');
    }
  });
}