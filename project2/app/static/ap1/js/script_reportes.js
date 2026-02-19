/**
 * script_reportes.js - Versión Final Limpia
 */

// 1. Configuración de Colores (Sincronizados con tu paleta de CSS)
const CSS_COLORS = {
    principal: '#51a3d3',
    secundario: '#4b89d4',
    exito: '#2ecc71',
    peligro: '#e74c3c',
    borde: '#334155'
};

// 2. Estructuras de datos globales
let salesData = { products: [], units: [], colors: [] };
let monthlyData = { months: [], sales: [], expenses: [] };
let salesChart, monthlyChart;

// 3. Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    if (loadDataFromBridge()) {
        initCharts();
        setupEventListeners();
    }
});

/**
 * Carga los datos desde el elemento oculto en el HTML (Data Bridge)
 */
function loadDataFromBridge() {
    const bridge = document.getElementById('data-bridge');
    if (!bridge) {
        console.error("No se encontró el elemento 'data-bridge'.");
        return false;
    }

    try {
        // Obtenemos los datos que Django puso en los atributos data-*
        const productsRaw = bridge.getAttribute('data-products') || "[]";
        const unitsRaw = bridge.getAttribute('data-units') || "[]";
        const monthsRaw = bridge.getAttribute('data-months') || "[]";
        const salesRaw = bridge.getAttribute('data-sales') || "[]";

        // Parseo seguro de JSON
        salesData.products = JSON.parse(productsRaw);
        salesData.units = JSON.parse(unitsRaw);
        monthlyData.months = JSON.parse(monthsRaw);
        monthlyData.sales = JSON.parse(salesRaw);

        // Colores para la gráfica de dona
        salesData.colors = [CSS_COLORS.principal, CSS_COLORS.exito, CSS_COLORS.secundario];
        
        // Simulación de gastos (60% de las ventas) si no vienen de la DB
        monthlyData.expenses = monthlyData.sales.map(valor => valor * 0.6);

        return true;
    } catch (e) {
        console.error("Error al procesar JSON del bridge:", e);
        return false;
    }
}

/**
 * Crea las instancias de las gráficas
 */
function initCharts() {
    // --- Gráfica de Distribución (Dona) ---
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx && salesData.products.length > 0) {
        salesChart = new Chart(salesCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: salesData.products,
                datasets: [{
                    data: salesData.units,
                    backgroundColor: salesData.colors,
                    borderColor: '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#fff' } }
                }
            }
        });
    }

    // --- Gráfica de Evolución (Línea) ---
    const monthlyCtx = document.getElementById('monthlyChart');
    if (monthlyCtx && monthlyData.months.length > 0) {
        monthlyChart = new Chart(monthlyCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: monthlyData.months,
                datasets: [
                    {
                        label: 'Ventas',
                        data: monthlyData.sales,
                        borderColor: CSS_COLORS.principal,
                        backgroundColor: 'rgba(81, 163, 211, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Gastos',
                        data: monthlyData.expenses,
                        borderColor: CSS_COLORS.peligro,
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            color: '#fff',
                            callback: value => '$' + (value / 1000000).toFixed(1) + 'M'
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: { ticks: { color: '#fff' }, grid: { display: false } }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } }
                }
            }
        });
    }
}

/**
 * Configura los botones para cambiar el tipo de gráfica
 */
function setupEventListeners() {
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const chartId = this.getAttribute('data-chart');
            const chartType = this.getAttribute('data-type');
            
            // UI: Cambiar botón activo
            this.parentElement.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const targetChart = (chartId === 'salesChart') ? salesChart : monthlyChart;
            
            if (targetChart) {
                // Usar el método config del chart para cambiar el tipo de manera segura
                // Esto evita los errores de recurrencia y opciones inválidas
                targetChart.config.type = chartType;
                targetChart.update();
            }
        });
    });
}
