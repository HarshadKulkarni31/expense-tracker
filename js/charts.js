// ============================================================
// CHARTS — Chart.js dark theme wrappers
// ============================================================

import { CATEGORY_COLORS, formatCurrency } from './utils.js?v=family-auth-5';

// Global Chart.js defaults for dark theme
export function initChartDefaults() {
  if (!window.Chart) return;
  
  Chart.defaults.color = '#8888a0';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.06)';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = '#1a1a2e';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.titleFont = { family: "'Inter', sans-serif", size: 13, weight: '600' };
  Chart.defaults.plugins.tooltip.bodyFont = { family: "'JetBrains Mono', monospace", size: 13 };
  Chart.defaults.plugins.tooltip.displayColors = true;
  Chart.defaults.plugins.tooltip.boxPadding = 4;
  Chart.defaults.animation = { duration: 800, easing: 'easeOutQuart' };
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;
}

// Destroy existing chart on a canvas
function destroyChart(canvasId) {
  const existing = Chart.getChart(canvasId);
  if (existing) existing.destroy();
}

// ---------- Line Chart ----------
export function createLineChart(canvasId, labels, data, options = {}) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(108, 92, 231, 0.3)');
  gradient.addColorStop(1, 'rgba(108, 92, 231, 0.0)');

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: options.label || 'Amount',
        data,
        borderColor: '#6c5ce7',
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#6c5ce7',
        pointBorderColor: '#12121a',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#a29bfe',
        ...options.dataset
      }]
    },
    options: {
      plugins: {
        legend: { display: options.showLegend || false },
        tooltip: {
          callbacks: {
            label: (ctx) => ' ' + formatCurrency(ctx.parsed.y)
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            callback: (v) => formatCurrency(v),
            font: { family: "'JetBrains Mono', monospace", size: 11 }
          }
        }
      },
      ...options.chartOptions
    }
  });
}

// ---------- Doughnut Chart ----------
export function createDoughnutChart(canvasId, labels, data, colors, options = {}) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors || labels.map(l => CATEGORY_COLORS[l] || '#636e72'),
        borderColor: '#12121a',
        borderWidth: 3,
        hoverBorderColor: '#1a1a2e',
        hoverOffset: 8,
        ...options.dataset
      }]
    },
    options: {
      cutout: options.cutout || '68%',
      plugins: {
        legend: {
          display: options.showLegend !== false,
          position: options.legendPosition || 'bottom',
          labels: { padding: 16 }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}`
          }
        }
      },
      ...options.chartOptions
    }
  });
}

// ---------- Bar Chart ----------
export function createBarChart(canvasId, labels, data, colors, options = {}) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  const isHorizontal = !!options.horizontal;

  if (isHorizontal) {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: options.label || 'Amount',
          data: data,
          backgroundColor: colors || 'rgba(108, 92, 231, 0.6)',
          borderColor: colors ? colors.map(c => c) : '#6c5ce7',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: options.maxBarThickness || 50,
          ...options.dataset
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { display: options.showLegend || false },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => ' ' + formatCurrency(tooltipItem.parsed.x)
            }
          }
        },
        scales: {
          x: {
            grid: { display: true, color: 'rgba(255,255,255,0.04)' },
            ticks: {
              callback: (v) => formatCurrency(v),
              font: { size: 11 }
            },
            beginAtZero: true
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { size: 12 },
              color: '#8888a0'
            }
          }
        },
        ...options.chartOptions
      }
    });
  }

  // Vertical bar chart (default)
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: options.label || 'Amount',
        data,
        backgroundColor: colors || 'rgba(108, 92, 231, 0.6)',
        borderColor: colors ? colors.map(c => c) : '#6c5ce7',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: options.maxBarThickness || 50,
        ...options.dataset
      }]
    },
    options: {
      plugins: {
        legend: { display: options.showLegend || false },
        tooltip: {
          callbacks: {
            label: (ctx) => ' ' + formatCurrency(ctx.parsed.y)
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            callback: (v) => formatCurrency(v),
            font: { family: "'JetBrains Mono', monospace", size: 11 }
          }
        }
      },
      ...options.chartOptions
    }
  });
}

// ---------- Multi-Dataset Bar Chart ----------
export function createGroupedBarChart(canvasId, labels, datasets, options = {}) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            callback: (v) => formatCurrency(v),
            font: { family: "'JetBrains Mono', monospace", size: 11 }
          }
        }
      },
      ...options.chartOptions
    }
  });
}
