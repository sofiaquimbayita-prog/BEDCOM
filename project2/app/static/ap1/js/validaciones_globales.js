// VALIDACIONES GLOBALES - IGUAL PARA TODOS MÓDULOS
window.mostrarNotificacionGlobal = function(titulo, mensaje, tipo = 'info') {
    const containerId = 'toast-global';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        Object.assign(container.style, {
            position: 'fixed', top: '90px', right: '30px', zIndex: '9999',
            display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px'
        });
        document.body.appendChild(container);
    }
    
    const colors = {
        success: { icon: 'fa-check-circle', color: '#10b981' },
        error: { icon: 'fa-exclamation-circle', color: '#ef4444' },
        warning: { icon: 'fa-exclamation-triangle', color: '#f59e0b' },
        info: { icon: 'fa-info-circle', color: '#3b82f6' }
    };
    
    const config = colors[tipo] || colors.info;
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: #1e293b; color: white; padding: 16px 20px; border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4); border-left: 4px solid ${config.color};
        display: flex; align-items: center; gap: 12px; animation: slideIn 0.4s ease;
        min-width: 300px; backdrop-filter: blur(10px);
    `;
    toast.innerHTML = `
        <i class="fas ${config.icon}" style="font-size: 20px; color: ${config.color}; flex-shrink: 0;"></i>
        <div><strong>${titulo}</strong><br><small>${mensaje}</small></div>
        <button onclick="this.parentElement.style.animation='slideOut 0.3s ease forwards'; setTimeout(()=>this.parentElement.remove(), 300);" 
                style="background:none; border:none; color:white; font-size:18px; cursor:pointer; margin-left:auto; padding:0 5px;">×</button>
    `;
    
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
};

// Animaciones CSS globales
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideOut { to { opacity: 0; transform: translateX(100%); } }
`;
document.head.appendChild(style);

