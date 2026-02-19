/**
 * script_reportes.js - Versión Final Limpia
 */

// 1. Configuración de Colores (Sincronizados con tu paleta de CSS)
const CSS_COLORS = {
    principal: '#51a3d3',
    secundario: '#4b89d4',
    exito: '#2ecc71',
    peligro: '#e74c3c',
    borde: '#334155',
    // Colores adicionales para barras
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
 * @param {number} count - Número de productos
 * @returns {Array} - Array de colores
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
    console.log('Inicializando gráficas - Productos:', salesData.products);
    
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
                        labels: { 
                            color: '#fff',
                            font: { size: 12 },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        } 
                    }
                }
            }
        });
        console.log('Gráfica de ventas creada');
    } else {
        console.warn('No hay productos para mostrar en la gráfica');
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
                    legend: { 
                        display: true,
                        labels: { color: '#fff' } 
                    }
                }
            }
        });
        console.log('Gráfica mensual creada');
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
                // Cambiar el tipo de gráfica
                targetChart.config.type = chartType;
                
                // Ajustar opciones según el tipo de gráfica
                if (chartId === 'salesChart') {
                    // Para la gráfica de distribución (salesChart)
                    if (chartType === 'bar') {
                        // Las barras necesitan escalas
                        targetChart.options.scales = {
                            y: {
                                beginAtZero: true,
                                ticks: { color: '#fff' },
                                grid: { color: 'rgba(255,255,255,0.1)' }
                            },
                            x: {
                                ticks: { color: '#fff' },
                                grid: { display: false }
                            }
                        };
                        
                        // Configurar leyenda para barras - mostrar nombres de productos como doughnut
                        targetChart.options.plugins.legend = {
                            display: true,
                            position: 'bottom',
                            labels: {
                                color: '#fff',
                                font: { size: 12 },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'rect',
                                // Generar etiquetas de leyenda desde los nombres de productos
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map(function(label, i) {
                                            return {
                                                text: label,
                                                fillStyle: data.datasets[0].backgroundColor[i],
                                                hidden: !chart.getDataVisibility(i),
                                                index: i,
                                                pointStyle: 'rect'
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        };
                        
                        // FIX: Generar colores dinámicos para las barras
                        // Esto evita 'undefined' cuando hay más de 3 productos
                        const numProductos = salesData.products.length;
                        const coloresBarras = generarColoresBarras(numProductos);
                        targetChart.data.datasets[0].backgroundColor = coloresBarras;
                        targetChart.data.datasets[0].borderColor = '#1e293b';
                        targetChart.data.datasets[0].borderWidth = 1;
                    } else {
                        // Doughnut no usa escalas
                        delete targetChart.options.scales;
                        
                        // Configurar leyenda para doughnut
                        targetChart.options.plugins.legend = {
                            display: true,
                            position: 'bottom',
                            labels: {
                                color: '#fff',
                                font: { size: 12 },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        };
                        
                        // Restaurar colores de doughnut
                        targetChart.data.datasets[0].backgroundColor = salesData.colors;
                        targetChart.data.datasets[0].borderColor = '#1e293b';
                        targetChart.data.datasets[0].borderWidth = 2;
                    }
                } else {
                    // Para la gráfica de evolución (monthlyChart) - línea/barra
                    targetChart.options.scales = {
                        y: {
                            ticks: {
                                color: '#fff',
                                callback: value => '$' + (value / 1000000).toFixed(1) + 'M'
                            },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        x: {
                            ticks: { color: '#fff' },
                            grid: { display: false }
                        }
                    };
                }
                
                targetChart.update();
            }
        });
    });
}
