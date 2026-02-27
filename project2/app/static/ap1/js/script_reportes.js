/**
 * script_reportes.js - Versión Final con Datos Reales
 */

// 1. Configuración de Colores (Sincronizados con tu paleta de CSS)
const CSS_COLORS = {
    principal: '#51a3d3',
    secundario: '#4b89d4',
    exito: '#2ecc71',
    peligro: '#e74c3c',
    borde: '#334155',
    coloresBarras: [
        '#51a3d3', '#4b89d4', '#2ecc71', '#e74c3c', '#9b59b6', 
        '#f39c12', '#1abc9c', '#e67e22', '#3498db', '#2ecc71',
        '#f1c40f', '#8e44ad', '#16a085', '#27ae60', '#c0392b'
    ]
};

// 2. Estructuras de datos globales
let salesData = { products: [], units: [], colors: [] };
let monthlyData = { months: [], sales: [], expenses: [] };
let salesChart, monthlyChart;

/**
 * Genera un array de colores dinámicamente basado en el número de productos
 */
function generarColoresBarras(count) {
    const colores = [];
    for (let i = 0; i < count; i++) {
        colores.push(CSS_COLORS.coloresBarras[i % CSS_COLORS.coloresBarras.length]);
    }
    return colores;
}

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
    if (!bridge) return false;

    try {
        // Obtenemos los datos reales de Django
        const productsRaw = bridge.getAttribute('data-products') || "[]";
        const unitsRaw = bridge.getAttribute('data-units') || "[]";
        const monthsRaw = bridge.getAttribute('data-months') || "[]";
        const salesRaw = bridge.getAttribute('data-sales') || "[]";
        const expensesRaw = bridge.getAttribute('data-expenses') || "[]"; // NUEVO: Gastos Reales

        // Parseo seguro de JSON
        salesData.products = JSON.parse(productsRaw);
        salesData.units = JSON.parse(unitsRaw);
        monthlyData.months = JSON.parse(monthsRaw);
        monthlyData.sales = JSON.parse(salesRaw);
        monthlyData.expenses = JSON.parse(expensesRaw); // ASIGNACIÓN REAL

        // Colores base para la gráfica de dona
        salesData.colors = generarColoresBarras(salesData.products.length);

        return true;
    } catch (e) {
        console.error("Error cargando datos del puente:", e);
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
                    label: 'Unidades Vendidas',
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
                    legend: { 
                        display: true,
                        position: 'bottom', 
                        labels: { color: '#fff', usePointStyle: true } 
                    }
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
                        label: 'Ventas (Ingresos)',
                        data: monthlyData.sales,
                        borderColor: CSS_COLORS.principal,
                        backgroundColor: 'rgba(81, 163, 211, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Gastos (Compras)',
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
                            callback: value => '$' + value.toLocaleString()
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: { ticks: { color: '#fff' }, grid: { display: false } }
                },
                plugins: {
                    legend: { display: true, labels: { color: '#fff' } }
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
            
            this.parentElement.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const targetChart = (chartId === 'salesChart') ? salesChart : monthlyChart;
            
            if (targetChart) {
                targetChart.config.type = chartType;
                
                // Ajustes de escalas si cambia a barras
                if (chartType === 'bar') {
                    targetChart.options.scales = {
                        y: { beginAtZero: true, ticks: { color: '#fff' } },
                        x: { ticks: { color: '#fff' } }
                    };
                }
                
                targetChart.update();
            }
        });
    });
}