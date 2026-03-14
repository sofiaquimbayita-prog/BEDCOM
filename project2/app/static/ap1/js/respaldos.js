document.addEventListener('DOMContentLoaded', () => {

    // ══════════════════════════════════════
    //  ESTADO
    // ══════════════════════════════════════
    let verEliminados = false;

    // ── Header ──
    const mainHeader = document.getElementById('mainHeader');
    if (mainHeader) {
        mainHeader.animate([
            { opacity: 0, transform: 'translateY(-30px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 800, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)', fill: 'forwards' });
    }

    document.getElementById('notification-bell')?.addEventListener('click', () => {
        alert('🔔 Notificaciones:\n\n✅ Respaldo completo ejecutado\n⚠️ Espacio en disco bajo (15%)\n🔄 Nueva actualización disponible');
    });

    document.getElementById('settings-btn')?.addEventListener('click', function() {
        this.style.transform = 'rotate(180deg)';
        setTimeout(() => { this.style.transform = 'rotate(0deg)'; }, 300);
        alert('⚙️ Configuración:\n\nTema: Oscuro\nNotificaciones: Activadas\nAuto-respaldo: Desactivado\nIdioma: Español');
    });

    // ══════════════════════════════════════
    //  TOGGLE — VER ELIMINADOS
    // ══════════════════════════════════════
    const toggleInactivos = document.getElementById('toggle-inactivos');
    const toggleIcon      = document.getElementById('toggle-icon');
    const toggleLabel     = document.getElementById('toggle-label');
    const tableTitle      = document.getElementById('table-title');
    const emptyState      = document.getElementById('empty-state');
    const tbody           = document.getElementById('history-tbody');

    toggleInactivos.addEventListener('change', function() {
        verEliminados = this.checked;

        if (verEliminados) {
            toggleIcon.className  = 'fas fa-eye toggle-icon';
            toggleIcon.style.color = 'var(--cyan)';
            toggleLabel.textContent = 'Mostrando eliminados';
            tableTitle.textContent  = 'Respaldos Eliminados';
        } else {
            toggleIcon.className  = 'fas fa-eye-slash toggle-icon';
            toggleIcon.style.color = '';
            toggleLabel.textContent = 'Ver eliminados';
            tableTitle.textContent  = 'Historial de Respaldos';
        }

        actualizarVista();
    });

    function actualizarVista() {
        const filas = tbody.querySelectorAll('tr');
        filas.forEach(fila => {
            const esEliminado = fila.classList.contains('eliminado');
            if (verEliminados) {
                fila.style.display = esEliminado ? '' : 'none';
            } else {
                fila.style.display = esEliminado ? 'none' : '';
            }
        });

        // Empty state para eliminados
        const eliminados = tbody.querySelectorAll('tr.eliminado');
        if (verEliminados && eliminados.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        actualizarStats();
    }

    // ══════════════════════════════════════
    //  STATS
    // ══════════════════════════════════════
    function actualizarStats() {
        const todasFilas   = tbody.querySelectorAll('tr');
        const activos      = [...todasFilas].filter(r => !r.classList.contains('eliminado'));
        const eliminados   = [...todasFilas].filter(r =>  r.classList.contains('eliminado'));

        document.getElementById('total-registros').textContent  = activos.length;
        document.getElementById('total-eliminados').textContent = eliminados.length;

        // Último tipo (de activos)
        if (activos.length > 0) {
            const ultimaFila = activos[0];
            const badge = ultimaFila.querySelector('.badge');
            document.getElementById('ultimo-tipo').textContent = badge ? badge.textContent : '—';

            const fecha = ultimaFila.querySelector('td:first-child').textContent.split(' ')[0];
            document.getElementById('fecha-reciente').textContent = fecha;
        } else {
            document.getElementById('ultimo-tipo').textContent   = '—';
            document.getElementById('fecha-reciente').textContent = '—';
        }
    }

    // ══════════════════════════════════════
    //  ACCIONES EN FILAS (delegación)
    // ══════════════════════════════════════
    tbody.addEventListener('click', (e) => {
        const fila = e.target.closest('tr');
        if (!fila) return;

        // Eliminar
        if (e.target.classList.contains('fa-trash')) {
            eliminarFila(fila);
        }

        // Restaurar
        if (e.target.closest('.btn-restaurar')) {
            restaurarFila(fila);
        }
    });

    function eliminarFila(fila) {
        fila.style.transition = 'opacity 0.3s, transform 0.3s';
        fila.style.opacity    = '0';
        fila.style.transform  = 'translateX(20px)';

        setTimeout(() => {
            fila.style.opacity   = '';
            fila.style.transform = '';
            fila.style.transition = '';

            // Marcar como eliminado y cambiar acciones
            fila.classList.add('eliminado');

            const actionsCell = fila.querySelector('.actions');
            actionsCell.innerHTML = `<button class="btn-restaurar"><i class="fas fa-undo"></i> Restaurar</button>`;

            actualizarVista();
        }, 300);
    }

    function restaurarFila(fila) {
        fila.classList.remove('eliminado');

        // Restaurar iconos de acción originales
        const actionsCell = fila.querySelector('.actions');
        actionsCell.innerHTML = `
            <i class="fas fa-eye" title="Ver"></i>
            <i class="fas fa-download" title="Descargar"></i>
            <i class="fas fa-trash" title="Eliminar"></i>
        `;

        // Animación de entrada
        fila.style.opacity   = '0';
        fila.style.transform = 'translateX(-20px)';
        fila.style.transition = 'opacity 0.35s, transform 0.35s';
        requestAnimationFrame(() => {
            fila.style.opacity   = '';
            fila.style.transform = '';
        });

        actualizarVista();
    }

    // ══════════════════════════════════════
    //  BÚSQUEDA
    // ══════════════════════════════════════
    document.getElementById('search-input').addEventListener('input', function() {
        const q = this.value.toLowerCase();
        tbody.querySelectorAll('tr').forEach(fila => {
            const esEliminado  = fila.classList.contains('eliminado');
            const coincide     = fila.textContent.toLowerCase().includes(q);

            if (!coincide) {
                fila.style.display = 'none';
            } else {
                fila.style.display = (verEliminados === esEliminado) ? '' : 'none';
            }
        });
    });

    // ══════════════════════════════════════
    //  MODAL — NUEVO RESPALDO
    // ══════════════════════════════════════
    const overlay        = document.getElementById('modal-overlay');
    const btnAbrir       = document.getElementById('btn-nuevo-respaldo');
    const btnCerrar      = document.getElementById('modal-close');
    const btnCancelar    = document.getElementById('btn-cancelar');
    const btnConfirmar   = document.getElementById('btn-confirmar');
    const modalTypeCards = document.querySelectorAll('.modal-type-card');
    const modulosSection = document.getElementById('modulos-section');
    const warnModulos    = document.getElementById('warn-modulos');
    const summaryText    = document.getElementById('summary-text');
    const backupDesc     = document.getElementById('backup-desc');
    const modulosInputs  = document.querySelectorAll('input[name="modulo"]');

    let tipoSeleccionado = 'completo';

    btnAbrir.addEventListener('click', () => { overlay.classList.add('open'); resetModal(); });

    function cerrarModal() { overlay.classList.remove('open'); }
    btnCerrar.addEventListener('click', cerrarModal);
    btnCancelar.addEventListener('click', cerrarModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrarModal(); });

    function resetModal() {
        tipoSeleccionado = 'completo';
        modalTypeCards.forEach(c => c.classList.toggle('active', c.dataset.type === 'completo'));
        modulosSection.classList.remove('visible');
        warnModulos.classList.remove('visible');
        modulosInputs.forEach(i => { i.checked = false; });
        backupDesc.value = '';
        actualizarResumen();
    }

    modalTypeCards.forEach(card => {
        card.addEventListener('click', () => {
            tipoSeleccionado = card.dataset.type;
            modalTypeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            modulosSection.classList.toggle('visible', tipoSeleccionado === 'parcial');
            if (tipoSeleccionado !== 'parcial') {
                modulosInputs.forEach(i => i.checked = false);
                warnModulos.classList.remove('visible');
            }
            actualizarResumen();
        });
    });

    modulosInputs.forEach(input => {
        input.addEventListener('change', () => {
            warnModulos.classList.remove('visible');
            actualizarResumen();
        });
    });

    function actualizarResumen() {
        if (tipoSeleccionado === 'completo') {
            summaryText.innerHTML = 'Se realizará un <strong>respaldo completo</strong> de todo el sistema: productos, insumos y proveedores.';
        } else {
            const sel = [...modulosInputs].filter(i => i.checked)
                .map(i => `<strong>${i.closest('.modal-mod-card').querySelector('strong').textContent}</strong>`);
            summaryText.innerHTML = sel.length
                ? `Se realizará un <strong>respaldo parcial</strong> de: ${sel.join(', ')}.`
                : 'Selecciona al menos un módulo para ver el resumen.';
        }
    }

    btnConfirmar.addEventListener('click', () => {
        if (tipoSeleccionado === 'parcial' && ![...modulosInputs].some(i => i.checked)) {
            warnModulos.classList.add('visible');
            modulosSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }

        const ahora    = new Date();
        const fecha    = ahora.toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' });
        const hora     = ahora.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' });
        const desc     = backupDesc.value.trim() || '—';

        let tipoBadge, modulosHtml;

        if (tipoSeleccionado === 'completo') {
            tipoBadge   = `<span class="badge complete">Completo</span>`;
            modulosHtml = `<span class="badge-mod-tag">Todos</span>`;
        } else {
            const sel = [...modulosInputs].filter(i => i.checked);
            tipoBadge   = `<span class="badge parcial">Parcial</span>`;
            modulosHtml = sel.map(i =>
                `<span class="badge-mod-tag">${i.closest('.modal-mod-card').querySelector('strong').textContent}</span>`
            ).join(' ');
        }

        const fila = document.createElement('tr');
        fila.dataset.estado = 'activo';
        fila.innerHTML = `
            <td>${fecha} ${hora}</td>
            <td><i class="fas fa-user" style="margin-right:6px;font-size:0.75rem;"></i> luis</td>
            <td>${tipoBadge}</td>
            <td>${modulosHtml}</td>
            <td>${desc}</td>
            <td class="actions">
                <i class="fas fa-eye" title="Ver"></i>
                <i class="fas fa-download" title="Descargar"></i>
                <i class="fas fa-trash" title="Eliminar"></i>
            </td>
        `;

        fila.style.opacity   = '0';
        fila.style.transform = 'translateY(-8px)';
        tbody.insertBefore(fila, tbody.firstChild);

        requestAnimationFrame(() => {
            fila.style.transition = 'opacity 0.4s, transform 0.4s';
            fila.style.opacity    = '1';
            fila.style.transform  = 'translateY(0)';
        });

        actualizarStats();
        cerrarModal();
    });

    // Inicializar stats
    actualizarStats();
});