document.addEventListener('DOMContentLoaded', function () {
    // Safe search binding (uses #searchInput if present)
    const search = document.getElementById('searchInput');
    if (search) {
        search.addEventListener('keyup', function () {
            const filtro = this.value.toLowerCase();
            const filas = document.querySelectorAll('.respaldos-table tbody tr');
            filas.forEach(fila => {
                const texto = fila.innerText.toLowerCase();
                fila.style.display = texto.includes(filtro) ? '' : 'none';
            });
        });
    }

    // Auto-dismiss flash messages
    const messages = document.querySelectorAll('.messages-container .message');
    messages.forEach((msg) => {
        setTimeout(() => {
            msg.style.transition = 'opacity 300ms, transform 300ms';
            msg.style.opacity = '0';
            msg.style.transform = 'translateY(-6px)';
            setTimeout(() => { msg.remove(); }, 350);
        }, 4200);
    });

    // Wire up modal cancel button inside delete modal (if present)
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('click', function (e) {
            if (e.target === deleteModal) deleteModal.classList.remove('active');
        });
        const cancelBtn = deleteModal.querySelector('.btn-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', () => deleteModal.classList.remove('active'));
        // Intercept delete form submit to show confirmation
        const deleteForm = deleteModal.querySelector('#deleteForm');
        if (deleteForm) {
            // Modal already asks for confirmation; allow submit normally
            // Ensure the cancel button closes the modal instead
            // (no extra confirm() here to avoid double prompts)
        }
    }
});

// Open delete modal and set form action and display date
function openDeleteModal(id, fecha) {
    const modal = document.getElementById('deleteModal');
    if (!modal) return;
    const dateSpan = modal.querySelector('#deleteRespaldoDate');
    if (dateSpan) dateSpan.textContent = fecha;
    const form = modal.querySelector('#deleteForm');
    if (form) {
        form.action = `/respaldos/eliminar/${id}/`;
    }
    modal.classList.add('active');
}

// Intercept generar formulario to ask confirmation before submitting
document.addEventListener('DOMContentLoaded', function () {
    const generarForm = document.querySelector('.generar-form');
    if (generarForm) {
            generarForm.addEventListener('submit', function (e) {
                const tipo = generarForm.querySelector('[name="tipo_respaldo"]').value || 'completo';
                const descripcion = generarForm.querySelector('[name="descripcion"]').value || '';
                const resumen = descripcion ? ` (${descripcion})` : '';
                const ok = confirm(`Generar respaldo de tipo '${tipo}'${resumen}?`);
                if (!ok) { e.preventDefault(); return; }

                // add a brief animation to signal generation, then submit
                e.preventDefault();
                const tableCont = document.querySelector('.table-container');
                if (tableCont) tableCont.classList.add('anim-generating');
                setTimeout(() => { generarForm.submit(); }, 350);
            });
    }
});
