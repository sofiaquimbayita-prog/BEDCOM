/* ════════════════════════════════════════════════
   pedido.js  —  Lógica del módulo de Pedidos
   Requiere: PRODUCTOS_DATA, CLIENTES_DATA, CSRF_TOKEN
             URL_CREAR, URL_VER, URL_EDITAR, URL_ESTADO,
             URL_DESPACHO  (definidos en el template)
   ════════════════════════════════════════════════ */

/* ── Toast ── */
function showToast(msg, tipo = 'success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const d = document.createElement('div');
  const icon = tipo === 'success' ? 'fa-check-circle'
             : tipo === 'error'   ? 'fa-times-circle'
             : 'fa-info-circle';
  d.className = `message message--${tipo}`;
  d.innerHTML = `<i class="fas ${icon}"></i><span>${msg}</span>`;
  c.appendChild(d);
  setTimeout(() => d.remove(), 3500);
}

/* ── Modales ── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('mostrar');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('mostrar');
}
document.querySelectorAll('[data-close]').forEach(b => {
  b.addEventListener('click', () => closeModal(b.dataset.close));
});
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});

/* ── DataTable ── */
$(document).ready(function () {
  const dt = $('#tablaPedidos').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json' },
    pageLength: 10,
    order: [[0, 'desc']],
    columnDefs: [{ orderable: false, targets: 7 }]
  });

  // BUG CORREGIDO: 'this.checked' dentro del each() apuntaba al <tr>, no al checkbox.
  // Se captura 'checked' en el scope del handler del evento.
  $('#toggleAnulados').on('change', function () {
    const checked = this.checked;
    dt.rows().nodes().to$().each(function () {
      const anulado = $(this).data('anulado') === true;
      $(this).toggle(!anulado || checked);
    });
  }).trigger('change');
});

/* ── Cambio de estado ── */
document.querySelectorAll('.ped-estado-select').forEach(sel => {
  sel.addEventListener('change', async function () {
    const pk = this.dataset.id;
    const nuevo = this.value;
    const anterior = this.dataset.estadoActual;
    const fd = new FormData();
    fd.append('csrfmiddlewaretoken', CSRF_TOKEN);
    fd.append('nuevo_estado', nuevo);
    try {
      const res = await fetch(URL_ESTADO(pk), { method: 'POST', body: fd });
      const data = await res.json();
      if (data.ok) {
        this.dataset.estadoActual = nuevo;
        this.className = `ped-estado-select estado-${nuevo.toLowerCase()}`;
        this.closest('tr').dataset.anulado = nuevo === 'Anulado' ? 'true' : 'false';
        showToast(data.message);
        setTimeout(() => location.reload(), 1000);
      } else {
        this.value = anterior;
        showToast(data.error, 'error');
      }
    } catch (e) {
      this.value = anterior;
      showToast('Error al cambiar estado', 'error');
    }
  });
});

/* ── Botón Despacho ── */
document.querySelectorAll('.btn-despacho').forEach(btn => {
  btn.addEventListener('click', async () => {
    const pk = btn.dataset.id;
    if (!confirm('¿Enviar pedido #' + pk + ' a despachos?')) return;
    try {
      const res = await fetch(URL_DESPACHO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
        body: JSON.stringify({ pedido_id: pk })
      });
      const data = await res.json();
      if (data.ok) {
        showToast(data.message);
        btn.outerHTML = `<button class="btn-despacho-ver" data-despacho-id="${data.despacho.id}" title="Ver en despachos"><i class="fas fa-truck" style="color: #10b981;"></i></button>`;
        window.location.href = '/vistas/despacho/';
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    }
  });
});

/* ── Modal VER ── */
/* ── Botón Ver Despacho ── */
document.querySelectorAll('.btn-despacho-ver').forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = `/vistas/despacho/`;
  });
});

document.querySelectorAll('.btn-ver').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      const res = await fetch(URL_VER(btn.dataset.id));
      const data = await res.json();
      if (!data.ok) { showToast(data.error, 'error'); return; }
      const p = data.pedido;
      document.getElementById('verTitulo').textContent = `Pedido #${p.id}`;
      document.getElementById('verInfoCliente').innerHTML = `
        <div class="ver-campo"><span class="ver-label">Cliente</span><span class="ver-valor">${p.cliente_nombre}</span></div>
        <div class="ver-campo"><span class="ver-label">Teléfono</span><span class="ver-valor">${p.cliente_telefono}</span></div>
        <div class="ver-campo"><span class="ver-label">Fecha Creación</span><span class="ver-valor">${p.fecha}</span></div>
        <div class="ver-campo"><span class="ver-label">Fecha Entrega</span><span class="ver-valor">${p.fecha_entrega ? new Date(p.fecha_entrega + 'T00:00').toLocaleDateString('es-CO') : '—'}</span></div>
        <div class="ver-campo"><span class="ver-label">Estado</span><span class="ver-valor"><span class="badge-estado badge-${p.estado.toLowerCase()}">${p.estado}</span></span></div>
        <div class="ver-campo"><span class="ver-label">Abono</span><span class="ver-valor">$${parseFloat(p.abono || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span></div>
        <div class="ver-campo ver-campo--destacado"><span class="ver-label">Total</span><span class="ver-valor ver-valor--monto">$${parseFloat(p.total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span></div>
      `;
      document.getElementById('verDetallesBody').innerHTML = p.detalles.map(d => `
        <tr>
          <td>${d.producto_nombre}</td>
          <td>${d.cantidad}</td>
          <td><span class="precio-display">$${parseFloat(d.precio_unitario).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span></td>
          <td><span class="precio-display">$${parseFloat(d.sub_total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span></td>
          <td style="color:var(--color-texto-muted);font-size:0.85rem">${d.observaciones || '—'}</td>
        </tr>`).join('');
      document.getElementById('verTotal').textContent = `$${parseFloat(p.total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
      openModal('modalVer');
    } catch (e) {
      showToast('Error al cargar detalle', 'error');
    }
  });
});

/* ── Validaciones ── */

function validarAbono(total, abono) {
  const minimo = total * 0.5;
  if (abono < minimo) {
    return {
      valido: false,
      mensaje: `El abono debe ser al menos el 50% del total (mínimo $${minimo.toLocaleString('es-CO', { minimumFractionDigits: 2 })})`
    };
  }
  if (abono > total) {
    return { valido: false, mensaje: 'El abono no puede ser mayor al total del pedido.' };
  }
  return { valido: true, mensaje: '' };
}

function validarStock(productoId, cantidad) {
  const producto = PRODUCTOS_DATA.find(p => p.id == productoId);
  if (!producto) return { valido: false, mensaje: 'Producto no encontrado' };
  if (producto.stock < cantidad) {
    return { valido: false, mensaje: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}` };
  }
  return { valido: true, mensaje: '' };
}

function validarCantidad(cantidad) {
  if (!cantidad || cantidad < 1) {
    return { valido: false, mensaje: 'La cantidad debe ser al menos 1' };
  }
  if (cantidad > 9999) {
    return { valido: false, mensaje: 'La cantidad no puede superar 9999' };
  }
  return { valido: true, mensaje: '' };
}

function validarCliente(clienteId) {
  if (!clienteId) {
    return { valido: false, mensaje: 'Debe seleccionar un cliente' };
  }
  return { valido: true, mensaje: '' };
}

function validarProductosDuplicados(items) {
  const productosIds = items.map(item => item.producto_id);
  const duplicados = productosIds.filter((id, index) => productosIds.indexOf(id) !== index);
  if (duplicados.length > 0) {
    const productosNombres = duplicados.map(id => {
      const p = PRODUCTOS_DATA.find(p => p.id == id);
      return p ? p.nombre : id;
    });
    return { valido: false, mensaje: `Productos duplicados: ${productosNombres.join(', ')}` };
  }
  return { valido: true, mensaje: '' };
}

const MAX_PRODUCTOS_POR_PEDIDO = 150;
function validarLimiteProductos(items) {
  if (items.length > MAX_PRODUCTOS_POR_PEDIDO) {
    return { valido: false, mensaje: `Máximo ${MAX_PRODUCTOS_POR_PEDIDO} productos por pedido` };
  }
  return { valido: true, mensaje: '' };
}

function validarPedidoCompleto(items, total, abono, clienteId) {
  const errores = [];

  if (!clienteId) errores.push('Debe seleccionar un cliente');
  if (!items.length) errores.push('Debe agregar al menos un producto');

  const productosIds = items.map(item => item.producto_id);
  const duplicados = productosIds.filter((id, index) => productosIds.indexOf(id) !== index);
  if (duplicados.length > 0) errores.push('No puede agregar el mismo producto múltiples veces');

  for (const item of items) {
    const producto = PRODUCTOS_DATA.find(p => p.id == item.producto_id);
    if (!producto) {
      errores.push(`Producto ID ${item.producto_id} no existe`);
    } else if (producto.stock < item.cantidad) {
      errores.push(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`);
    }
  }

  const minimoAbono = total * 0.5;
  if (abono < minimoAbono) {
    errores.push(`El abono debe ser al menos el 50% del total (mínimo $${minimoAbono.toLocaleString('es-CO', { minimumFractionDigits: 2 })})`);
  }
  if (abono > total) errores.push('El abono no puede ser mayor al total del pedido');

  return errores;
}

/* Validación en tiempo real de cantidad vs stock */
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
        if (producto && cantidad > producto.stock) {
          e.target.classList.add('error-input');
          e.target.style.borderColor = 'var(--color-error)';

          const errorMsg = document.createElement('small');
          errorMsg.textContent = `Stock máximo: ${producto.stock}`;
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
  });
}

/* Validación de abono en tiempo real */
function validarAbonoEnTiempoReal() {
  const abonoInput = document.getElementById('abonoInput');
  const totalDisplay = document.getElementById('formTotal');
  if (!abonoInput || !totalDisplay) return;

  abonoInput.addEventListener('input', function () {
    const total = parseFloat(totalDisplay.textContent.replace(/[^0-9.-]/g, '')) || 0;
    const abono = parseFloat(this.value) || 0;
    const minimo = total * 0.5;
    const helpText = document.getElementById('abonoHelp');

    if (abono > 0 && abono < minimo) {
      this.style.borderColor = 'var(--color-error)';
      if (helpText) {
        helpText.style.color = 'var(--color-error)';
        helpText.textContent = `El abono debe ser mínimo $${minimo.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
      }
    } else {
      this.style.borderColor = '';
      if (helpText) {
        helpText.style.color = 'var(--color-texto-muted)';
        helpText.textContent = 'El abono debe ser al menos el 50% del total del pedido';
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  agregarValidacionTiempoReal();
  validarAbonoEnTiempoReal();
});

/* ── Dropdown cliente ── */
const clienteSelect = document.getElementById('clienteSelect');
if (clienteSelect) {
  clienteSelect.innerHTML = '<option value="">— Seleccionar cliente —</option>' +
    CLIENTES_DATA.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

/* ── Tabla dinámica de productos ── */
let modoEdicion = false;
let pedidoEditandoId = null;

function buildOpts(selId = '') {
  return `<option value="">— Producto —</option>` +
    PRODUCTOS_DATA.map(p =>
      `<option value="${p.id}" data-precio="${p.precio}" data-stock="${p.stock}" ${p.id == selId ? 'selected' : ''}>${p.nombre}</option>`
    ).join('');
}

function crearFila(item = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><select class="form-select-ped sel-producto">${buildOpts(item.producto_id || '')}</select></td>
    <td><span class="stock-badge">—</span></td>
    <td><span class="precio-display">—</span></td>
    <td><input type="number" class="form-input inp-cantidad" value="${item.cantidad || 1}" min="1" style="width:70px"></td>
    <td><input type="text" class="form-input inp-notas" placeholder="Color, talla…" value="${item.observaciones || ''}"></td>
    <td style="text-align:center"><button type="button" class="btn-quitar-fila"><i class="fas fa-trash-alt"></i></button></td>`;

  if (item.producto_id) {
    const prod = PRODUCTOS_DATA.find(p => p.id == item.producto_id);
    if (prod) {
      tr.querySelector('.stock-badge').textContent = prod.stock;
      tr.querySelector('.precio-display').textContent = `$${parseFloat(prod.precio).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
    }
  }

  tr.querySelector('.sel-producto').addEventListener('change', function () {
    const opt = this.options[this.selectedIndex];
    tr.querySelector('.stock-badge').textContent = opt.dataset.stock || '—';
    tr.querySelector('.precio-display').textContent = opt.dataset.precio
      ? `$${parseFloat(opt.dataset.precio).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
      : '—';
    recalcular();
  });

  tr.querySelector('.inp-cantidad').addEventListener('input', recalcular);
  tr.querySelector('.btn-quitar-fila').addEventListener('click', () => { tr.remove(); recalcular(); });
  return tr;
}

function recalcular() {
  let t = 0;
  document.querySelectorAll('#formItemsBody tr').forEach(tr => {
    const sel = tr.querySelector('.sel-producto');
    const cant = parseInt(tr.querySelector('.inp-cantidad').value) || 0;
    if (sel && sel.value) {
      const p = PRODUCTOS_DATA.find(p => p.id == sel.value);
      if (p) t += p.precio * cant;
    }
  });
  const formatted = `$${t.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
  // Actualiza el span oculto que usa el handler de guardar
  const formTotal = document.getElementById('formTotal');
  if (formTotal) formTotal.textContent = formatted;
  // Actualiza el input visible en la sección de abono
  const formTotalDisplay = document.getElementById('formTotalDisplay');
  if (formTotalDisplay) formTotalDisplay.value = formatted;
  // Actualiza el resumen visual del modal
  const formTotalMonto = document.getElementById('formTotalMonto');
  if (formTotalMonto) formTotalMonto.textContent = formatted;
}

/* ── Configuración visual de modales ── */
function configurarModalCrear() {
  const h = document.getElementById('modalFormHeader');
  const t = document.getElementById('formModalTitulo');
  const b = document.getElementById('btnGuardarPedido');
  const c = document.getElementById('btnCerrarForm');
  if (h) h.className = 'modal-header modal-header--agregar';
  if (t) {
    t.innerHTML = '<i class="fas fa-cart-plus"></i> Registrar Pedido';
    t.className = 'modal-titulo modal-titulo--agregar';
  }
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
  if (t) {
    t.innerHTML = `<i class="fas fa-edit"></i> Editar Pedido #${id}`;
    t.className = 'modal-titulo modal-titulo--editar';
  }
  if (b) b.className = 'btn-guardar btn-guardar--editar';
  if (c) c.className = 'btn-cerrar btn-cerrar--editar';
  const btnTexto = document.getElementById('btnGuardarTexto');
  if (btnTexto) btnTexto.textContent = 'Actualizar Pedido';
}

function abrirModalCrear() {
  modoEdicion = false;
  pedidoEditandoId = null;
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

/* Botón Nuevo Pedido */
const btnNuevo = document.getElementById('btnNuevoPedido');
if (btnNuevo) btnNuevo.addEventListener('click', abrirModalCrear);

/* Botones Editar */
document.querySelectorAll('.btn-editar').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      const res = await fetch(URL_VER(btn.dataset.id));
      const data = await res.json();
      if (!data.ok) { showToast(data.error, 'error'); return; }
      const p = data.pedido;
      modoEdicion = true;
      pedidoEditandoId = btn.dataset.id;
      configurarModalEditar(p.id);
      if (clienteSelect) clienteSelect.value = p.cliente_id || '';
      const alerta = document.getElementById('formAlerta');
      const itemsBody = document.getElementById('formItemsBody');
      const abonoInput = document.getElementById('abonoInput');
      if (alerta) alerta.style.display = 'none';
      const fechaEntregaInput = document.getElementById('fechaEntregaInput');
      if (fechaEntregaInput) fechaEntregaInput.value = p.fecha_entrega || '';
      if (itemsBody) {
        itemsBody.innerHTML = '';
        p.detalles.forEach(d => itemsBody.appendChild(crearFila(d)));
      }
      if (abonoInput) abonoInput.value = parseFloat(p.abono || 0);
      recalcular();
      openModal('modalForm');
    } catch (e) {
      showToast('Error al cargar pedido', 'error');
    }
  });
});

/* Botón Agregar Fila */
const btnAgregarFila = document.getElementById('btnAgregarFila');
if (btnAgregarFila) {
  btnAgregarFila.addEventListener('click', () => {
    const itemsBody = document.getElementById('formItemsBody');
    if (itemsBody) itemsBody.appendChild(crearFila());
  });
}

/* ── Guardar Pedido ── */
const btnGuardar = document.getElementById('btnGuardarPedido');
if (btnGuardar) {
  btnGuardar.addEventListener('click', async () => {
    const alerta = document.getElementById('formAlerta');
    if (alerta) alerta.style.display = 'none';

    const clienteId = clienteSelect ? clienteSelect.value : '';
    if (!clienteId) {
      if (alerta) { alerta.textContent = 'Selecciona un cliente.'; alerta.style.display = 'block'; }
      return;
    }

    const clienteSeleccionado = CLIENTES_DATA.find(c => c.id == clienteId);
    const nombreCliente   = clienteSeleccionado ? clienteSeleccionado.nombre   : '';
    const telefonoCliente = clienteSeleccionado ? clienteSeleccionado.telefono : '';

    const fechaEntregaInput = document.getElementById('fechaEntregaInput');
    const fechaEntrega = fechaEntregaInput ? fechaEntregaInput.value : '';
    const abonoInput = document.getElementById('abonoInput');
    const abono = parseFloat(abonoInput ? abonoInput.value : 0) || 0;

    // Leer el total desde el span oculto actualizado por recalcular()
    const formTotal = document.getElementById('formTotal');
    const total = parseFloat(formTotal ? formTotal.textContent.replace(/[^0-9.-]/g, '') : 0) || 0;

    if (!fechaEntrega) {
      if (alerta) { alerta.textContent = 'Selecciona la fecha de entrega.'; alerta.style.display = 'block'; }
      return;
    }
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaEntrega <= hoy) {
      if (alerta) { alerta.textContent = 'La fecha de entrega debe ser futura.'; alerta.style.display = 'block'; }
      return;
    }

    const validacion = validarAbono(total, abono);
    if (!validacion.valido) {
      if (alerta) { alerta.textContent = validacion.mensaje; alerta.style.display = 'block'; }
      return;
    }

    const items = [];
    document.querySelectorAll('#formItemsBody tr').forEach(tr => {
      const sel  = tr.querySelector('.sel-producto');
      const cant = tr.querySelector('.inp-cantidad');
      const nota = tr.querySelector('.inp-notas');
      if (!sel || !sel.value) return;
      const cantidad = parseInt(cant ? cant.value : 0);
      if (!cantidad || cantidad < 1) return;
      items.push({
        producto_id: sel.value,
        cantidad: cantidad,
        observaciones: nota ? nota.value.trim() : ''
      });
    });

    if (!items.length) {
      if (alerta) { alerta.textContent = 'Agrega al menos un producto válido.'; alerta.style.display = 'block'; }
      return;
    }

    // Validación completa antes de enviar
    const errores = validarPedidoCompleto(items, total, abono, clienteId);
    if (errores.length) {
      if (alerta) { alerta.textContent = errores.join(' | '); alerta.style.display = 'block'; }
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
        body: JSON.stringify({
          cliente_id: clienteId,
          cliente_nombre: nombreCliente,
          cliente_telefono: telefonoCliente,
          fecha_entrega: fechaEntrega,
          items: items,
          abono: abono
        })
      });
      const data = await res.json();

      if (btn) { btn.disabled = false; btn.innerHTML = originalHtml; }

      if (data.ok) {
        closeModal('modalForm');
        showToast(data.message);
        setTimeout(() => location.reload(), 1200);
      } else {
        if (alerta) { alerta.textContent = data.error; alerta.style.display = 'block'; }
      }
    } catch (error) {
      if (btn) { btn.disabled = false; btn.innerHTML = originalHtml; }
      if (alerta) { alerta.textContent = 'Error al guardar el pedido'; alerta.style.display = 'block'; }
    }
  });
}