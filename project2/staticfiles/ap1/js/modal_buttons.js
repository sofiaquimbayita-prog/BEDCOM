(function () {
  const styledClass = 'modal-trigger-button';
  const compactClass = 'modal-trigger-button--compact';
  const openerClassPattern = /\b(btn-agregar|button-2|button-3|btn-nueva-salida|btn-nueva-actividad|btn-generar|btn-quick-add)\b/;
  const compactClassPattern = /\b(view-btn|edit-btn|delete-btn|activate-btn|btn-ver|btn-despacho|btn-despacho-ver|btn-pagar)\b/;
  const skipClassPattern = /\b(btn-cerrar|btn-cancelar|btn-cancel|close-modal|modal-close|close-btn|notif-modal-close|btn-ia-flotante)\b/;
  const openerCallPattern = /\b(abrirModal|abrirModalEditar|abrirModalEliminar|abrirModalActivar|abrirModalVer|abrirModalSalida|abrirModalDetalle|abrirModalReactivar|abrirModalQuickCategoria|abrirRespaldos|abrirModalDescargaSQL|openViewModal|openDeleteModal|openRestoreModal)\b/;
  const modalTextPattern = /\b(Nuevo|Nueva|Agregar|Crear|Respaldo|Receta|Producto|Proveedor|Insumo|Cliente|Pedido|Mantenimiento|Garantia|Garantía|Salida)\b/i;

  function isSkippable(button) {
    const className = button.className || '';
    const onclick = button.getAttribute('onclick') || '';
    return (
      skipClassPattern.test(className) ||
      /\b(cerrarModal|closeNotifModal|cerrarModalLogout|cerrarModalIA|confirmarLogout|enviarConsultaIA)\b/.test(onclick) ||
      button.id === 'btnPreguntarIA' ||
      button.id === 'btnMute'
    );
  }

  function shouldStyle(button) {
    const className = button.className || '';
    const onclick = button.getAttribute('onclick') || '';
    const text = (button.textContent || '').trim();
    return (
      openerClassPattern.test(className) ||
      openerCallPattern.test(onclick) ||
      button.matches('[data-bs-toggle="modal"], [data-open], [data-target]') ||
      /^btn(Nuevo|Nueva|Agregar|Crear)/.test(button.id || '') ||
      (modalTextPattern.test(text) && /modal|Modal/.test(onclick))
    );
  }

  function shouldBeCompact(button) {
    const className = button.className || '';
    const text = (button.textContent || '').trim();
    return compactClassPattern.test(className) || text.length <= 2;
  }

  function styleButton(button) {
    if (!button || button.tagName !== 'BUTTON' || isSkippable(button) || !shouldStyle(button)) return;
    button.classList.add(styledClass);
    if (shouldBeCompact(button)) button.classList.add(compactClass);
  }

  function styleModalButtons(root) {
    const scope = root && root.querySelectorAll ? root : document;
    if (scope.tagName === 'BUTTON') styleButton(scope);
    scope.querySelectorAll('button').forEach(styleButton);
  }

  document.addEventListener('DOMContentLoaded', function () {
    styleModalButtons(document);
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(styleModalButtons);
      });
    }).observe(document.body, { childList: true, subtree: true });
  });
})();
