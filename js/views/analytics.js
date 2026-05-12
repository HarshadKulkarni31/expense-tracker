// ============================================================
// ANALYTICS VIEW — Category charts, daily spending, top days
// ============================================================

import { store } from '../store.js?v=family-auth-5';
import { formatCurrency, formatDate, MONTH_NAMES, MONTH_NAMES_SHORT, CATEGORY_COLORS, CATEGORIES, sumBy, groupBy, getDaysInMonth, getMonthsRange, toDateString } from '../utils.js?v=family-auth-5';
import { createBarChart, createDoughnutChart, createLineChart } from '../charts.js?v=family-auth-5';

let analyticsYear, analyticsMonth;

function init() {
  const now = new Date();
  analyticsYear = now.getFullYear();
  analyticsMonth = now.getMonth();
}

export function renderAnalytics() {
  if (analyticsYear === undefined) init();

  const container = document.getElementById('view-analytics');
  const monthExpenses = store.getExpensesByMonth(analyticsYear, analyticsMonth);

  // Category data
  const byCat = groupBy(monthExpenses, e => e.category);
  const catEntries = Object.entries(byCat)
    .map(([cat, items]) => ({ cat, total: sumBy(items, 'amount') }))
    .sort((a, b) => b.total - a.total);
  
  const catLabels = catEntries.map(e => e.cat);
  const catAmounts = catEntries.map(e => e.total);
  const catColors = catEntries.map(e => CATEGORY_COLORS[e.cat] || '#636e72');

  // Daily spending data
  const daysInMonth = getDaysInMonth(analyticsYear, analyticsMonth);
  const dailyLabels = [];
  const dailyData = [];
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${analyticsYear}-${String(analyticsMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dailyLabels.push(d.toString());
    const dayExpenses = monthExpenses.filter(e => e.date === dateStr);
    dailyData.push(sumBy(dayExpenses, 'amount'));
  }

  // Top spending days
  const byDate = groupBy(monthExpenses, e => e.date);
  const topDays = Object.entries(byDate)
    .map(([date, items]) => ({ date, total: sumBy(items, 'amount'), count: items.length }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  
  const maxDayAmount = topDays.length > 0 ? topDays[0].total : 1;

  // Month selector options
  const months = getMonthsRange(12);

  container.innerHTML = `
    <div class="page-header">
      <h1>Analytics</h1>
      <p>Deep dive into your spending patterns</p>
    </div>

    <div class="analytics-month-selector toolbar">
      <select class="form-select" id="analytics-month-select" style="min-width: 180px;">
        ${months.reverse().map(m => {
          const val = `${m.year}-${m.month}`;
          const selected = m.year === analyticsYear && m.month === analyticsMonth ? 'selected' : '';
          return `<option value="${val}" ${selected}>${MONTH_NAMES[m.month]} ${m.year}</option>`;
        }).join('')}
      </select>
    </div>

    <div class="analytics-grid">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Spending by Category</h4>
        </div>
        <div class="chart-container" style="height: 300px;">
          <canvas id="analytics-bar-chart"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Category Distribution</h4>
        </div>
        <div class="chart-container" style="height: 300px;">
          <canvas id="analytics-pie-chart"></canvas>
        </div>
      </div>
    </div>

    <div class="card analytics-full-width">
      <div class="card-header">
        <h4 class="card-title">Daily Spending — ${MONTH_NAMES[analyticsMonth]} ${analyticsYear}</h4>
      </div>
      <div class="chart-container" style="height: 280px;">
        <canvas id="analytics-daily-chart"></canvas>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Top Spending Days</h4>
        <span class="text-secondary" style="font-size: var(--fs-sm);">${MONTH_NAMES_SHORT[analyticsMonth]} ${analyticsYear}</span>
      </div>
      <div class="top-spending-days">
        ${topDays.length > 0 ? topDays.map((d, i) => `
          <div class="spending-day-item">
            <div class="spending-day-rank ${i < 3 ? 'top-3' : ''}">#${i + 1}</div>
            <div class="spending-day-info">
              <div class="spending-day-date">${formatDate(d.date)} · ${d.count} transaction${d.count > 1 ? 's' : ''}</div>
              <div class="spending-day-bar">
                <div class="spending-day-bar-fill" style="width: ${Math.round((d.total / maxDayAmount) * 100)}%;"></div>
              </div>
            </div>
            <div class="spending-day-amount">${formatCurrency(d.total)}</div>
          </div>`).join('') : '<div class="empty-state"><p>No spending data for this month</p></div>'}
      </div>
    </div>`;

  // Bind month selector
  container.querySelector('#analytics-month-select').addEventListener('change', (e) => {
    const [y, m] = e.target.value.split('-').map(Number);
    analyticsYear = y;
    analyticsMonth = m;
    renderAnalytics();
  });

  // Render charts
  requestAnimationFrame(() => {
    if (catLabels.length > 0) {
      createBarChart('analytics-bar-chart', catLabels, catAmounts, catColors, { horizontal: true });
      createDoughnutChart('analytics-pie-chart', catLabels, catAmounts, catColors, { cutout: '55%' });
    }
    createLineChart('analytics-daily-chart', dailyLabels, dailyData, { label: 'Daily Spend' });
  });
}
