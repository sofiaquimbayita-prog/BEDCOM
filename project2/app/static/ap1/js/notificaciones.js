// notificaciones.js - BEDCOM Professional Notifications Module
// Implements premium client-side multi-filter, dynamic sidebar, counters animation and triggers sync.

// ── SAFE DOM SELECTOR HELPER ─────────────────────────────────────────
function $(sel) {
    const el = document.querySelector(sel);
    if (!sel.startsWith('#clear') && !el) {
        console.debug(`[Notifs JS] Optional DOM element not found: ${sel}`);
    }
    return el;
}

// ── GLOBAL STATE ──────────────────────────────────────────────────────
let _activeFilterTab = 'all'; // all, pending, critical, attended
let _activeCategory = 'all';  // all, bajo_stock_insumo, bajo_stock_producto, etc.
let _searchText = '';
let _currentNotifsData = null; // Cache of the grouped notifications list

// ── REALTIME CLOCK ────────────────────────────────────────────────────
function initClock() {
    const clockEl = $("#fecha-hora");
    if (!clockEl) return;
    
    const updateTime = () => {
        const now = new Date();
        clockEl.innerHTML = `<i class="far fa-clock"></i> ` + now.toLocaleString("es-CO", { 
            weekday: "short", day: "numeric", month: "short", 
            hour: "2-digit", minute: "2-digit", second: "2-digit"
        });
    };
    updateTime();
    setInterval(updateTime, 1000);
}

// ── KPI COUNTER ANIMATION ─────────────────────────────────────────────
function animateCounter(elementId, targetVal, duration = 1000) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const startVal = parseInt(el.textContent) || 0;
    if (startVal === targetVal) return;
    
    const startTime = performance.now();
    
    const update = (now) => {
        const elapsed = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic
        const currentVal = Math.round(startVal + ease * (targetVal - startVal));
        el.textContent = currentVal.toLocaleString();
        
        if (elapsed < 1) {
            requestAnimationFrame(update);
        }
    };
    requestAnimationFrame(update);
}

// ── SYNC KPI CARD COUNTERS ────────────────────────────────────────────
function syncKpiCards() {
    fetch('/vistas/notificaciones/api/kpis/')
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(kpis => {
            animateCounter('kpi-total-notifs', kpis.total_alertas || 0);
            animateCounter('kpi-pending-notifs', kpis.alertas_pendientes || 0);
            animateCounter('kpi-critical-notifs', kpis.alertas_criticas || 0);
            animateCounter('kpi-attended-notifs', kpis.alertas_atendidas || 0);
        })
        .catch(err => console.error('Error syncing KPIs:', err));
}

// ── GENERATE SIDEBAR PRIORITIES DYNAMICALLY ───────────────────────────
function renderPrioritiesSidebar(data) {
    const container = document.getElementById('prioridades-hoy-container');
    if (!container) return;
    
    const grupos = data.grupos || [];
    
    // Extraer alertas críticas de inventario pendientes
    let criticalItems = [];
    grupos.forEach(grupo => {
        if (grupo.tipo === 'bajo_stock_insumo' || grupo.tipo === 'bajo_stock_producto') {
            grupo.items.forEach(item => {
                if (!item.leida) {
                    criticalItems.push({
                        id: item.id,
                        tipo: grupo.tipo,
                        titulo: item.titulo,
                        mensaje: item.mensaje
                    });
                }
            });
        }
    });
    
    if (criticalItems.length === 0) {
        container.innerHTML = `
            <div class="priority-empty">
                <i class="fas fa-shield-alt" style="color: #10b981; font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
                <span>No hay prioridades críticas de inventario pendientes hoy.</span>
            </div>
        `;
        return;
    }
    
    let html = '<div class="priorities-list">';
    criticalItems.slice(0, 4).forEach(item => {
        const isProduct = item.tipo === 'bajo_stock_producto';
        const urlDestino = isProduct ? '/vistas/productos/' : '/vistas/insumos/';
        const labelText = isProduct ? 'Producto Crítico' : 'Insumo Crítico';
        
        html += `
            <div class="priority-item-card" onclick="window.location.href='${urlDestino}'" title="Ir al módulo correspondiente">
                <div class="priority-icon-indicator danger-priority">
                    <i class="fas ${isProduct ? 'fa-box-open' : 'fa-exclamation-triangle'}"></i>
                </div>
                <div class="priority-details">
                    <span class="priority-title">${item.titulo}</span>
                    <span class="priority-subtitle">${labelText} - Haga clic para reabastecer</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// ── CLIENT-SIDE ENGINE FOR MULTI-FILTERING ────────────────────────────
function applyFilters() {
    const container = document.getElementById('notif-grouped-view');
    if (!container) return;
    
    const groups = container.querySelectorAll('.notif-group-card');
    let totalVisibleItems = 0;
    
    groups.forEach(group => {
        const groupType = group.dataset.tipo;
        const items = group.querySelectorAll('.notif-nested-item-row');
        let visibleItemsInGroup = 0;
        
        // Determinar si la categoría del grupo coincide con el filtro de categoría
        let categoryMatches = (_activeCategory === 'all' || 
            _activeCategory === groupType || 
            (_activeCategory === 'calendario' && (groupType === 'calendario_hoy' || groupType === 'calendario_manaña')));
            
        items.forEach(item => {
            const isRead = item.classList.contains('read-item');
            const isUnread = item.classList.contains('unread-item');
            
            // 1. Filtro por pestaña (Estado)
            let tabMatches = false;
            if (_activeFilterTab === 'all') {
                tabMatches = true;
            } else if (_activeFilterTab === 'pending') {
                tabMatches = isUnread;
            } else if (_activeFilterTab === 'attended') {
                tabMatches = isRead;
            } else if (_activeFilterTab === 'critical') {
                // Son críticas las no leídas de stock, pagos y despachos
                const isCriticalType = ['bajo_stock_producto', 'bajo_stock_insumo', 'pago_pendiente', 'pendido_despacho'].includes(groupType);
                tabMatches = isUnread && isCriticalType;
            }
            
            // 2. Filtro por búsqueda de texto
            let searchMatches = true;
            if (_searchText) {
                const titleText = item.querySelector('.item-notification-headline')?.textContent.toLowerCase() || '';
                const msgText = item.querySelector('.item-notification-message')?.textContent.toLowerCase() || '';
                searchMatches = titleText.includes(_searchText) || msgText.includes(_searchText);
            }
            
            // Aplicar visibilidad si coincide con categoría, pestaña y búsqueda
            if (categoryMatches && tabMatches && searchMatches) {
                item.style.display = 'flex';
                visibleItemsInGroup++;
                totalVisibleItems++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Si el grupo tiene elementos visibles y coincide con los filtros, mostrar la cabecera del grupo
        if (visibleItemsInGroup > 0) {
            group.style.display = 'block';
            
            // Actualizar badge dinámico en cabecera del grupo (solo cuenta los visibles)
            const badgeVisible = group.querySelector('.notif-badge-count');
            if (badgeVisible) {
                badgeVisible.textContent = visibleItemsInGroup;
            }
            
            // Auto-expandir grupo si estamos buscando o filtrando específicamente
            if (_searchText || _activeFilterTab !== 'all' || _activeCategory !== 'all') {
                group.classList.add('expanded');
            }
        } else {
            group.style.display = 'none';
        }
    });
    
    // Mostrar empty state si no hay coincidencias
    let emptyStateEl = document.getElementById('notif-empty-state-search');
    if (totalVisibleItems === 0) {
        if (!emptyStateEl) {
            emptyStateEl = document.createElement('div');
            emptyStateEl.id = 'notif-empty-state-search';
            emptyStateEl.className = 'notif-empty-state-premium';
            emptyStateEl.innerHTML = `
                <i class="fas fa-search-minus" style="color: #64748b; filter: none;"></i>
                <h4>Sin coincidencias de búsqueda</h4>
                <p>Prueba ajustando los filtros de estado o eliminando términos de búsqueda.</p>
            `;
            container.appendChild(emptyStateEl);
        }
    } else if (emptyStateEl) {
        emptyStateEl.remove();
    }
}

// ── RENDERING THE ACCORDION GROUPS ────────────────────────────────────
function renderGroupedNotifications(data) {
    const container = document.getElementById('notif-grouped-view');
    if (!container) return;
    
    const grupos = data.grupos || [];
    _currentNotifsData = data;
    
    if (grupos.length === 0) {
        container.innerHTML = `
            <div class="notif-empty-state-premium">
                <i class="fas fa-check-circle"></i>
                <h4>¡Todo al día!</h4>
                <p>El sistema no reporta alertas pendientes en este momento.</p>
            </div>
        `;
        renderPrioritiesSidebar(data);
        return;
    }
    
    let html = '';
    
    grupos.forEach(grupo => {
        const hasUnread = grupo.no_leidas > 0;
        const badgeClass = hasUnread ? 'notif-badge-unread-premium' : 'notif-badge-count';
        
        html += `
        <div class="notif-group-card" data-tipo="${grupo.tipo}">
            <div class="notif-group-header-glass" onclick="toggleAccordionCard(this)" style="--group-color: ${grupo.color}">
                <div class="notif-group-meta-left">
                    <div class="group-category-icon" style="--group-color: ${grupo.color}">
                        <i class="${grupo.icon}"></i>
                    </div>
                    <span class="notif-group-title-label">${grupo.titulo_grupo}</span>
                    <span class="${badgeClass}">
                        ${hasUnread ? `<i class="fas fa-bell animate-pulse"></i> ${grupo.no_leidas} nuevas` : `${grupo.cantidad}`}
                    </span>
                </div>
                <div class="notif-group-actions-right">
                    <button class="btn-group-action-check" onclick="event.stopPropagation(); markGroupAsRead('${grupo.tipo}')" title="Marcar grupo como leído" ${grupo.no_leidas === 0 ? 'disabled' : ''}>
                        <i class="fas fa-check-double"></i>
                    </button>
                    <i class="fas fa-chevron-down accordion-chevron-icon"></i>
                </div>
            </div>
            <div class="notif-group-card-body">
                <ul class="notif-nested-items-list">`;
        
        grupo.items.forEach(item => {
            const readClass = item.leida ? 'read-item' : 'unread-item';
            const dotClass = item.leida ? 'read-dot' : 'unread-dot';
            
            // Formatear fecha relativa amigable
            const dateObj = new Date(item.fecha_notif);
            const fechaString = dateObj.toLocaleString('es-CO', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            });
            
            html += `
                    <li class="notif-nested-item-row ${readClass}" id="notif-row-${item.id}">
                        <div class="item-left-details">
                            <span class="item-reading-dot ${dotClass}"></span>
                            <div class="item-text-info">
                                <div class="item-text-title-line">
                                    <span class="item-notification-headline">${item.titulo}</span>
                                    <span class="item-relative-time"><i class="far fa-clock"></i> ${fechaString}</span>
                                </div>
                                <span class="item-notification-message">${item.mensaje}</span>
                            </div>
                        </div>
                        <div class="item-actions-right">
                            ${!item.leida ? `
                            <button class="btn-item-action-small" onclick="markIndividualRead(${item.id})" title="Marcar como leída">
                                <i class="fas fa-eye"></i>
                            </button>` : `
                            <span class="attended-label-badge"><i class="fas fa-check"></i> Atendida</span>`}
                            <button class="btn-item-action-small redirect" onclick="redirectToAction('${grupo.tipo}')" title="Ir al módulo">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                        </div>
                    </li>`;
        });
        
        html += `
                </ul>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
    
    // Aplicar filtros de inmediato para conservar filtros activos tras recarga
    applyFilters();
    
    // Renderizar la barra lateral de prioridades
    renderPrioritiesSidebar(data);
}

// ── ACCORDION TOGGLE ──────────────────────────────────────────────────
function toggleAccordionCard(headerEl) {
    const card = headerEl.closest('.notif-group-card');
    if (!card) return;
    
    card.classList.toggle('expanded');
}

// ── GET CSRF TOKEN ────────────────────────────────────────────────────
function getCsrfToken() {
    let csrfToken = null;
    if (document.cookie) {
        document.cookie.split(';').forEach(cookie => {
            cookie = cookie.trim();
            if (cookie.startsWith('csrftoken=')) {
                csrfToken = decodeURIComponent(cookie.substring(10));
            }
        });
    }
    return csrfToken;
}

// ── MARK SINGLE NOTIFICATION READ ─────────────────────────────────────
function markIndividualRead(id) {
    const row = document.getElementById(`notif-row-${id}`);
    if (row) {
        row.classList.add('marking-read');
    }
    
    fetch(`/vistas/notificaciones/api/notif-read/${id}/`, {
        method: 'POST',
        headers: { 
            'X-CSRFToken': getCsrfToken(),
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Sincronizar sistema global y recargar bandeja
            if (window.BedcomNotifs) {
                window.BedcomNotifs.forceCheck();
            }
            syncKpiCards();
        }
    })
    .catch(err => {
        console.error('Mark read error:', err);
        if (row) row.classList.remove('marking-read');
    });
}

// ── MARK FULL GROUP AS READ ───────────────────────────────────────────
function markGroupAsRead(tipo) {
    fetch(`/vistas/notificaciones/api/notif-group-read/${tipo}/`, {
        method: 'POST',
        headers: { 
            'X-CSRFToken': getCsrfToken(),
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.showToast(`✅ ${data.marcadas} notificaciones marcadas como leídas`);
            if (window.BedcomNotifs) {
                window.BedcomNotifs.forceCheck();
            }
            syncKpiCards();
        }
    })
    .catch(err => console.error('Mark group read error:', err));
}

// ── REDIRECT INTELLIGENTLY ────────────────────────────────────────────
function redirectToAction(tipo) {
    let urlDestino = '/vistas/notificaciones/';
    switch(tipo) {
        case 'bajo_stock_insumo': urlDestino = '/vistas/insumos/'; break;
        case 'bajo_stock_producto': urlDestino = '/vistas/productos/'; break;
        case 'calendario_hoy':
        case 'calendario_manaña': urlDestino = '/vistas/calendario/'; break;
        case 'pendido_despacho': urlDestino = '/vistas/despacho/'; break;
        case 'sin_bom': urlDestino = '/vistas/bom/'; break;
        case 'pago_pendiente': urlDestino = '/vistas/pedido/'; break;
        case 'mantenimiento_nueva': urlDestino = '/vistas/mantenimientos/'; break;
        case 'reporte_generado': urlDestino = '/vistas/reportes/'; break;
    }
    window.location.href = urlDestino;
}

// ── VERIFY TRIGGERS MANUALLY (Premium Action) ─────────────────────────
function checkTriggersNow() {
    const btn = document.getElementById('btn-check-triggers');
    const badge = document.getElementById('check-status-badge');
    
    if (btn) {
        btn.classList.add('checking');
        btn.disabled = true;
        const textSpan = btn.querySelector('span');
        if (textSpan) textSpan.textContent = 'Verificando...';
    }
    
    if (badge) {
        badge.textContent = 'Sincronizando triggers...';
        badge.className = 'status-loading';
    }
    
    // Forzar ejecución del ciclo de triggers globales
    if (window.BedcomNotifs) {
        window.BedcomNotifs.forceCheck();
    }
    
    // Esperar a que se procese el API de fondo y sincronizar bandeja
    setTimeout(() => {
        fetch('/vistas/notificaciones/api/notificaciones-agrupadas/')
            .then(res => res.json())
            .then(data => {
                renderGroupedNotifications(data);
                syncKpiCards();
                
                if (btn) {
                    btn.classList.remove('checking');
                    btn.disabled = false;
                    const textSpan = btn.querySelector('span');
                    if (textSpan) textSpan.textContent = 'Verificar Ahora';
                }
                
                if (badge) {
                    badge.textContent = '✓ Sistema Actualizado';
                    badge.className = 'status-ok';
                    setTimeout(() => {
                        badge.textContent = '';
                        badge.className = 'check-status-idle';
                    }, 4000);
                }
            })
            .catch(err => {
                console.error('Error fetching grouped notifs during manual check:', err);
                if (btn) {
                    btn.classList.remove('checking');
                    btn.disabled = false;
                }
            });
    }, 1200);
}

// ── APIS FOR EXTERNAL USE / GLOBAL ATTACHMENTS ────────────────────────
window.checkTriggersNow = checkTriggersNow;

// ── INITIALIZATION ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // 1. Iniciar reloj premium
    initClock();
    
    // 2. Animar contadores iniciales (contexto inyectado en HTML)
    document.querySelectorAll('.metric-value[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target) || 0;
        animateCounter(el.id, target, 1200);
    });
    
    // 3. Cargar bandeja de notificaciones agrupadas al inicio
    fetch('/vistas/notificaciones/api/notificaciones-agrupadas/')
        .then(res => res.json())
        .then(data => renderGroupedNotifications(data))
        .catch(err => console.error('Error in initial fetch:', err));
        
    // 4. Suscribirse a actualizaciones del servicio centralizado global
    if (window.BedcomNotifs) {
        window.BedcomNotifs.onUpdate((data) => {
            // Cuando la campanita central detecte cambios, recargar
            fetch('/vistas/notificaciones/api/notificaciones-agrupadas/')
                .then(res => res.json())
                .then(data => {
                    renderGroupedNotifications(data);
                    syncKpiCards();
                });
        });
    }

    // ── CONFIGURACIÓN EVENT LISTENERS DE CONTROLES ──

    // A. Buscador en vivo
    const searchInput = document.getElementById('notif-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            _searchText = e.target.value.trim().toLowerCase();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = _searchText ? 'flex' : 'none';
            }
            applyFilters();
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                _searchText = '';
            }
            clearSearchBtn.style.display = 'none';
            applyFilters();
        });
    }

    // B. Selector de Categoría
    const categorySelect = document.getElementById('notif-category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            _activeCategory = e.target.value;
            applyFilters();
        });
    }

    // C. Pestañas de Estado (Tabs)
    const tabButtons = document.querySelectorAll('.notif-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabBtn = e.currentTarget;
            tabButtons.forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');
            
            _activeFilterTab = tabBtn.dataset.filter;
            applyFilters();
        });
    });
});
