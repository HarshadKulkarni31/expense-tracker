// ============================================================
// DASHBOARD VIEW
// ============================================================

import { store } from '../store.js?v=family-auth-5';
import { formatCurrency, CATEGORY_COLORS, MONTH_NAMES_SHORT, sumBy, groupBy, getMonthsRange, getCategoryBadgeClass, formatDateShort } from '../utils.js?v=family-auth-5';
import { createLineChart, createDoughnutChart } from '../charts.js?v=family-auth-5';

export function renderDashboard() {
  const container = document.getElementById('view-dashboard');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const thisMonthExpenses = store.getExpensesByMonth(year, month);
  const allExpenses = store.getExpenses();
  
  // Calculations
  const thisMonthTotal = sumBy(thisMonthExpenses, 'amount');
  const daysElapsed = now.getDate();
  const dailyAvg = daysElapsed > 0 ? Math.round(thisMonthTotal / daysElapsed) : 0;
  
  const settings = store.getSettings();
  const budgetPct = settings.overallBudget > 0 ? Math.round((thisMonthTotal / settings.overallBudget) * 100) : 0;
  
  // Top category
  const byCat = groupBy(thisMonthExpenses, e => e.category);
  let topCategory = 'None';
  let topAmount = 0;
  Object.entries(byCat).forEach(([cat, items]) => {
    const total = sumBy(items, 'amount');
    if (total > topAmount) {
      topAmount = total;
      topCategory = cat;
    }
  });

  // Trend data - last 6 months
  const months6 = getMonthsRange(6);
  const trendLabels = months6.map(m => MONTH_NAMES_SHORT[m.month]);
  const trendData = months6.map(m => {
    const expenses = store.getExpensesByMonth(m.year, m.month);
    return sumBy(expenses, 'amount');
  });

  // Category data for donut
  const categories = Object.keys(byCat);
  const catAmounts = categories.map(c => sumBy(byCat[c], 'amount'));
  const catColors = categories.map(c => CATEGORY_COLORS[c] || '#636e72');

  // Recent expenses (last 5)
  const recent = allExpenses.slice(0, 5);

  container.innerHTML = `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Your financial overview for ${MONTH_NAMES_SHORT[month]} ${year}</p>
    </div>

    <div class="dashboard-summary stagger-children">
      <div class="summary-card">
        <div class="summary-card-icon" style="background: rgba(108,92,231,0.15); color: #6c5ce7;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="summary-card-content">
          <div class="summary-card-label">This Month</div>
          <div class="summary-card-value">${formatCurrency(thisMonthTotal)}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-card-icon" style="background: rgba(59,130,246,0.15); color: #3b82f6;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="summary-card-content">
          <div class="summary-card-label">Daily Average</div>
          <div class="summary-card-value">${formatCurrency(dailyAvg)}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-card-icon" style="background: ${budgetPct >= 85 ? 'rgba(255,71,87,0.15)' : budgetPct >= 60 ? 'rgba(255,170,0,0.15)' : 'rgba(0,214,143,0.15)'}; color: ${budgetPct >= 85 ? '#ff4757' : budgetPct >= 60 ? '#ffaa00' : '#00d68f'};">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="summary-card-content">
          <div class="summary-card-label">Budget Used</div>
          <div class="summary-card-value">${budgetPct}%</div>
          <div class="summary-card-trend ${budgetPct >= 85 ? 'up' : 'down'}">
            of ${formatCurrency(settings.overallBudget)}
          </div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-card-icon" style="background: rgba(238,90,157,0.15); color: #ee5a9d;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <div class="summary-card-content">
          <div class="summary-card-label">Top Category</div>
          <div class="summary-card-value" style="font-size: var(--fs-lg);">${topCategory}</div>
          <div class="summary-card-trend">${formatCurrency(topAmount)}</div>
        </div>
      </div>
    </div>

    <div class="dashboard-charts">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">6-Month Spending Trend</h4>
        </div>
        <div class="chart-container" style="height: 280px;">
          <canvas id="trend-chart"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h4 class="card-title">By Category</h4>
        </div>
        <div class="chart-container relative" style="height: 280px;">
          <canvas id="category-donut"></canvas>
          ${thisMonthTotal > 0 ? `
          <div class="donut-center-text">
            <div class="amount">${formatCurrency(thisMonthTotal)}</div>
            <div class="label">Total</div>
          </div>` : ''}
        </div>
      </div>
    </div>

    <div class="card dashboard-recent">
      <div class="card-header">
        <h4 class="card-title">Recent Expenses</h4>
        <a href="#expenses" class="btn btn-ghost btn-sm">View All →</a>
      </div>
      <div class="recent-list">
        ${recent.length > 0 ? recent.map(e => `
          <div class="recent-item">
            <div class="recent-item-icon" style="background: ${CATEGORY_COLORS[e.category]}20; color: ${CATEGORY_COLORS[e.category]};">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <div class="recent-item-info">
              <div class="recent-item-desc">${e.description}</div>
              <div class="recent-item-date">${formatDateShort(e.date)} · ${e.createdByName || 'Family member'} · <span class="badge badge-category ${getCategoryBadgeClass(e.category)}">${e.category}</span></div>
            </div>
            <div class="recent-item-amount">${formatCurrency(e.amount)}</div>
          </div>`).join('') : '<div class="empty-state"><p>No expenses yet. Add your first expense!</p></div>'}
      </div>
    </div>`;

  // Render charts after DOM is ready
  requestAnimationFrame(() => {
    createLineChart('trend-chart', trendLabels, trendData);
    if (categories.length > 0) {
      createDoughnutChart('category-donut', categories, catAmounts, catColors);
    }
  });
}
