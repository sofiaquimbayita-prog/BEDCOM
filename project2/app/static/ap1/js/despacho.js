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
const URL_DESPACHOS_DATA = cfg.urlData || '';
const PENDIENTES = parseInt(cfg.pendientes || '0', 10);

/* ── Toast → usa window.showToast() global (base.html) ── */


/* ── DataTable + Delegación de eventos ─────────────── */
$(document).ready(function () {
  const tablaDespachos = $('#tablaDespachos');
  const modalCrearDespacho = $('#modalCrearDespacho');

  const abrirModalCrearDespacho = function () {
    $('#inpCrearPedidoId').val('');
    $('#inpCrearEmpresa').val('');
    $('#inpCrearTelefono').val('');
    $('#inpCrearGuia').val('');
    $('#inpCrearCosto').val('0');
    $('.error-msg').hide().text('');
    $('.form-input').removeClass('input-error input-success');
    modalCrearDespacho.addClass('mostrar');
  };

  $(document).on('click', '#btnNuevoDespacho', abrirModalCrearDespacho);

  window.despachoDT = tablaDespachos.DataTable({
    language: {
      search: 'Buscar:',
      lengthMenu: 'Mostrar _MENU_ registros',
      info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
      infoEmpty: 'Mostrando 0 a 0 de 0 registros',
      infoFiltered: '(filtrado de _MAX_ registros totales)',
      zeroRecords: 'No se encontraron registros',
      emptyTable: 'No hay despachos registrados',
      paginate: { first: 'Primero', previous: 'Anterior', next: 'Siguiente', last: 'Ultimo' }
    },
    pageLength: 25,
    order: [[0, 'desc']],
    columnDefs: [{ orderable: false, targets: [-2, -1] }],
    ajax: {
      url: URL_DESPACHOS_DATA,
      type: 'GET',
      dataSrc: function (json) { return json.despachos || []; }
    },
    columns: [
      { data: 'pedido_id', render: function (d) { return '<strong>Pedido #' + d + '</strong>'; } },
      { data: 'cliente_nombre' },
      { data: 'direccion_entrega', render: function (d) { return '<span title="' + d + '">' + (d.length > 30 ? d.slice(0, 30) + '...' : d) + '</span>'; } },
      { data: 'telefono_contacto' },
      { data: 'fecha_despacho' },
      {
        data: null,
        render: function (d) {
          var estado = d.estado, opts = ['pendiente', 'en_ruta', 'entregado', 'fallido'];
          var labels = { pendiente: 'Pendiente', en_ruta: 'En Ruta', entregado: 'Entregado', fallido: 'Fallido' };
          var s = '<select class="estado-select" data-id="' + d.id + '" data-estado-actual="' + estado + '">';
          opts.forEach(function (o) { s += '<option value="' + o + '"' + (o === estado ? 'selected' : '') + '>' + labels[o] + '</option>'; });
          return s + '</select>';
        }
      },
      {
        data: null,
        render: function (d) {
          return '<div class="icons"><button class="btn-ver" data-id="' + d.id + '" title="Ver detalle"><i class="fas fa-eye"></i></button></div>';
        }
      }
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
        selectEl.dataset.estadoActual = nuevoEstado;
        recargarTabla();
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
  const EMPRESA_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]{2,80}$/;
  const normalizeEmpresa = value => String(value || '')
    .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 80);
  const normalizeTelefono = value => String(value || '').replace(/\D/g, '').slice(0, 10);
  const normalizeGuia = value => String(value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
  const normalizeCosto = value => {
    let text = String(value || '').trim();
    text = text.replace(/[^0-9.,]/g, '');
    if (!text) return '';

    const commaCount = (text.match(/,/g) || []).length;
    const dotCount = (text.match(/\./g) || []).length;

    if (commaCount > 0 && dotCount > 0) {
      if (text.lastIndexOf(',') > text.lastIndexOf('.')) {
        text = text.replace(/\./g, '').replace(/,/g, '.');
      } else {
        text = text.replace(/,/g, '');
      }
    } else if (commaCount > 0) {
      text = text.replace(/,/g, '.');
    } else if (dotCount > 1) {
      text = text.replace(/\./g, '');
    }

    const parts = text.split('.');
    if (parts.length > 1) {
      return parts.shift() + '.' + parts.join('').slice(0, 2);
    }
    return text;
  };
  const setFieldState = (field, state) => {
    field.removeClass('input-error input-success');
    if (state === 'error') field.addClass('input-error');
    if (state === 'success') field.addClass('input-success');
  };

  $(document).on('change blur', '#inpCrearPedidoId', function() {
    setFieldState($(this), this.value ? 'success' : 'error');
  });

  $(document).on('input', '#inpCrearEmpresa', function() {
    const clean = normalizeEmpresa(this.value);
    if (this.value !== clean) this.value = clean;
    setFieldState($(this), EMPRESA_REGEX.test(clean.trim()) ? 'success' : 'error');
  });

  $(document).on('blur', '#inpCrearEmpresa', function() {
    $(this).trigger('input');
  });

  $(document).on('keydown', '#inpCrearEmpresa', function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowedKeys = [8, 9, 13, 27, 35, 36, 37, 38, 39, 40, 46];
    if (allowedKeys.includes(e.keyCode)) return;
    if ((this.value || '').length >= 80) {
      e.preventDefault();
      return;
    }
    if (e.key && e.key.length === 1 && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  $(document).on('paste', '#inpCrearEmpresa', function(e) {
    const paste = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
    if (/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]/.test(paste)) {
      e.preventDefault();
    }
  });

  $(document).on('input', '#inpCrearTelefono', function() {
    const clean = normalizeTelefono(this.value);
    if (this.value !== clean) this.value = clean;
    setFieldState($(this), clean.length === 10 ? 'success' : 'error');
  });

  $(document).on('blur', '#inpCrearTelefono', function() {
    $(this).trigger('input');
  });

  $(document).on('keydown', '#inpCrearTelefono', function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowedKeys = [8, 9, 13, 27, 35, 36, 37, 38, 39, 40, 46];
    if (allowedKeys.includes(e.keyCode)) return;
    if ((this.value || '').length >= 10) {
      e.preventDefault();
      return;
    }
    if (e.key && e.key.length === 1 && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  $(document).on('paste', '#inpCrearTelefono', function(e) {
    const paste = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
    if (!/^[0-9]+$/.test(paste)) {
      e.preventDefault();
    }
  });

  $(document).on('input', '#inpCrearGuia', function() {
    const clean = normalizeGuia(this.value);
    if (this.value !== clean) this.value = clean;
    setFieldState($(this), clean.length === 6 ? 'success' : 'error');
  });

  $(document).on('blur', '#inpCrearGuia', function() {
    $(this).trigger('input');
  });

  $(document).on('keydown', '#inpCrearGuia', function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowedKeys = [8, 9, 13, 27, 35, 36, 37, 38, 39, 40, 46];
    if (allowedKeys.includes(e.keyCode)) return;
    if ((this.value || '').length >= 6) {
      e.preventDefault();
      return;
    }
    if (e.key && e.key.length === 1 && !/^[A-Za-z0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  $(document).on('paste', '#inpCrearGuia', function(e) {
    const paste = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
    if (!/^[A-Za-z0-9]+$/.test(paste)) {
      e.preventDefault();
    }
  });

  $(document).on('input', '#inpCrearCosto', function() {
    const clean = normalizeCosto(this.value);
    if (this.value !== clean) this.value = clean;
    const num = Number(clean);
    setFieldState($(this), clean !== '' && !Number.isNaN(num) && num >= 0 && num <= 9999999999 ? 'success' : 'error');
  });

  $(document).on('blur', '#inpCrearCosto', function() {
    $(this).trigger('input');
  });

  $(document).on('keydown', '#inpCrearCosto', function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowedKeys = [8, 9, 13, 27, 35, 36, 37, 38, 39, 40, 46];
    if (allowedKeys.includes(e.keyCode)) return;
    if (e.key && e.key.length === 1 && !/^[0-9.,]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  $(document).on('paste', '#inpCrearCosto', function(e) {
    const paste = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
    if (!/^[0-9.,]+$/.test(paste)) {
      e.preventDefault();
    }
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
    $('.form-input').removeClass('input-error input-success');

    // Validate each field
    if (!fields.pedido.val()) {
      errors.pedido = 'Seleccione un pedido';
      valid = false;
      setFieldState(fields.pedido, 'error');
    } else {
      setFieldState(fields.pedido, 'success');
    }
    const emp = normalizeEmpresa(fields.empresa.val()).trim();
    fields.empresa.val(emp);
    if (!EMPRESA_REGEX.test(emp)) {
      errors.empresa = 'Nombre del acarreista: solo letras, números y espacios (2 a 80 caracteres)';
      valid = false;
      setFieldState(fields.empresa, 'error');
    } else {
      setFieldState(fields.empresa, 'success');
    }

    const tel = normalizeTelefono(fields.telefono.val());
    fields.telefono.val(tel);
    const telefonoValido = /^[0-9]{10}$/.test(tel);
    if (!telefonoValido) {
      errors.telefono = 'El teléfono debe tener exactamente 10 dígitos numéricos';
      valid = false;
      setFieldState(fields.telefono, 'error');
    } else {
      setFieldState(fields.telefono, 'success');
    }

    const gui = normalizeGuia(fields.guia.val());
    fields.guia.val(gui);
    if (!/^[A-Z0-9]{6}$/.test(gui)) {
      errors.guia = 'La placa debe tener exactamente 6 letras o números';
      valid = false;
      setFieldState(fields.guia, 'error');
    } else {
      setFieldState(fields.guia, 'success');
    }
    const cleanedCosto = normalizeCosto(fields.costo.val());
    fields.costo.val(cleanedCosto);
    const cos = Number(cleanedCosto);
    if (cleanedCosto === '' || Number.isNaN(cos) || cos < 0 || cos > 9999999999) {
      errors.costo = 'Costo de envío inválido. Ingrese hasta 9.999.999.999 COP';
      valid = false;
      setFieldState(fields.costo, 'error');
    } else {
      setFieldState(fields.costo, 'success');
    }

    if (!valid) {
      // Show errors
      Object.keys(errors).forEach(key => {
        $(`#error-${key}`).text(errors[key]).show();
        setFieldState(fields[key], 'error');
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
        recargarTabla();
      } else if (data.field) {
        // Server field error
        $(`#error-${data.field}`).text(data.error).show();
        setFieldState(fields[data.field], 'error');
        fields[data.field].focus();
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


  /* ── Recargar tabla ─── */
  window.recargarTabla = function () {
    if (window.despachoDT) {
      window.despachoDT.ajax.reload();
    } else {
      location.reload();
    }
  };

  /* ── Cierre de Modales ──────────────────────────────── */
  $(document).on('click', '[data-close]', function () {
    document.getElementById(this.dataset.close).classList.remove('mostrar');
  });

  $(document).on('click', '.modal', function (e) {
    if (e.target === this) this.classList.remove('mostrar');
  });

}); // ← cierre correcto de $(document).ready  (FIX 1)
