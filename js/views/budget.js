// ============================================================
// BUDGET VIEW — Set budgets, progress bars, alerts, projected chart
// ============================================================

import { store } from '../store.js?v=family-auth-5';
import { formatCurrency, CATEGORIES, CATEGORY_COLORS, MONTH_NAMES, MONTH_NAMES_SHORT, sumBy, groupBy, getProgressColor, generateId, getDaysInMonth, getMonthsRange } from '../utils.js?v=family-auth-5';
import { openBudgetModal, openOverallBudgetModal } from '../components/modal.js?v=family-auth-5';
import { showToast } from '../components/toast.js?v=family-auth-5';
import { createGroupedBarChart } from '../charts.js?v=family-auth-5';

export function renderBudget() {
  const container = document.getElementById('view-budget');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const settings = store.getSettings();
  const monthExpenses = store.getExpensesByMonth(year, month);
  const totalSpent = sumBy(monthExpenses, 'amount');
  const overallBudget = settings.overallBudget || 0;
  const overallPct = overallBudget > 0 ? Math.round((totalSpent / overallBudget) * 100) : 0;
  const overallColor = getProgressColor(overallPct);

  // Per-category budgets
  const budgets = store.getBudgetsByMonth(monthKey);
  const byCat = groupBy(monthExpenses, e => e.category);

  const categoryBudgets = budgets.map(b => {
    const spent = byCat[b.category] ? sumBy(byCat[b.category], 'amount') : 0;
    const pct = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
    const color = getProgressColor(pct);
    return { ...b, spent, pct, color };
  }).sort((a, b) => b.pct - a.pct);

  // Alerts
  const alerts = categoryBudgets.filter(b => b.pct >= 85);

  // Projected vs Actual data (last 6 months)
  const months6 = getMonthsRange(6);
  const projLabels = months6.map(m => MONTH_NAMES_SHORT[m.month]);
  const actualData = months6.map(m => sumBy(store.getExpensesByMonth(m.year, m.month), 'amount'));
  const projectedData = months6.map((m, i) => {
    const daysTotal = getDaysInMonth(m.year, m.month);
    const mNow = new Date();
    if (m.year === mNow.getFullYear() && m.month === mNow.getMonth()) {
      const elapsed = mNow.getDate();
      const dailyAvg = elapsed > 0 ? actualData[i] / elapsed : 0;
      return Math.round(dailyAvg * daysTotal);
    }
    return actualData[i]; // past months: projected = actual
  });

  container.innerHTML = `
    <div class="page-header">
      <h1>Budget</h1>
      <p>Manage your spending limits for ${MONTH_NAMES[month]} ${year}</p>
    </div>

    ${alerts.length > 0 ? alerts.map(a => `
      <div class="budget-alert-banner ${a.pct >= 100 ? 'danger' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <span class="budget-alert-text">
          ${a.pct >= 100 
            ? `⚠️ <strong>${a.category}</strong> budget exceeded! Spent ${formatCurrency(a.spent)} of ${formatCurrency(a.monthlyLimit)} (${a.pct}%)`
            : `<strong>${a.category}</strong> is approaching limit — ${formatCurrency(a.spent)} of ${formatCurrency(a.monthlyLimit)} (${a.pct}%)`}
        </span>
      </div>`).join('') : ''}

    <div class="card budget-overall">
      <div class="card-header">
        <h4 class="card-title">Overall Monthly Budget</h4>
        <button class="btn btn-secondary btn-sm" id="edit-overall-budget">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Edit
        </button>
      </div>
      <div class="budget-overall-amount">${formatCurrency(totalSpent)} <span class="text-secondary" style="font-size: var(--fs-base); font-weight: 400;">/ ${formatCurrency(overallBudget)}</span></div>
      <div class="progress-bar-wrapper progress-bar-lg">
        <div class="progress-bar-track">
          <div class="progress-bar-fill ${overallColor}" style="width: ${Math.min(overallPct, 100)}%;"></div>
        </div>
      </div>
      <div class="budget-overall-stats">
        <span>${overallPct}% used</span>
        <span>${formatCurrency(Math.max(0, overallBudget - totalSpent))} remaining</span>
      </div>
    </div>

    <div class="flex items-center justify-between" style="margin-bottom: var(--space-lg);">
      <h3>Category Budgets</h3>
      <button class="btn btn-primary" id="add-budget-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Set Budget
      </button>
    </div>

    <div class="budget-categories">
      ${categoryBudgets.length > 0 ? categoryBudgets.map(b => `
        <div class="budget-category-card ${b.pct >= 85 ? 'danger' : b.pct >= 60 ? 'warning' : ''}">
          <div class="budget-category-header">
            <div class="budget-category-name">
              <div class="budget-category-dot" style="background: ${CATEGORY_COLORS[b.category] || '#636e72'};"></div>
              ${b.category}
            </div>
            <span class="badge ${b.pct >= 85 ? 'badge-danger' : b.pct >= 60 ? 'badge-warning' : 'badge-success'}">${b.pct}%</span>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar-track">
              <div class="progress-bar-fill ${b.color}" style="width: ${Math.min(b.pct, 100)}%;"></div>
            </div>
          </div>
          <div class="budget-category-amounts">
            <span class="spent">${formatCurrency(b.spent)} spent</span>
            <span class="limit">of ${formatCurrency(b.monthlyLimit)}</span>
          </div>
        </div>`).join('') : `
        <div class="card" style="grid-column: 1 / -1;">
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <h3>No category budgets set</h3>
            <p>Set budgets per category to track your spending limits</p>
          </div>
        </div>`}
    </div>

    <div class="card budget-chart-section">
      <div class="card-header">
        <h4 class="card-title">Projected vs Actual Spending</h4>
      </div>
      <div class="chart-container" style="height: 300px;">
        <canvas id="budget-projected-chart"></canvas>
      </div>
    </div>`;

  // Events
  container.querySelector('#edit-overall-budget').addEventListener('click', () => {
    openOverallBudgetModal((data) => {
      store.updateSettings({ overallBudget: Number(data.overallBudget) });
      showToast('Overall budget updated!', 'success');
      renderBudget();
    }, { overallBudget: overallBudget });
  });

  container.querySelector('#add-budget-btn').addEventListener('click', () => {
    openBudgetModal((data) => {
      store.addBudget({
        id: generateId(),
        category: data.category,
        monthlyLimit: Number(data.monthlyLimit),
        month: monthKey
      });
      showToast(`Budget set for ${data.category}!`, 'success');
      renderBudget();
    });
  });

  // Chart
  requestAnimationFrame(() => {
    createGroupedBarChart('budget-projected-chart', projLabels, [
      {
        label: 'Actual',
        data: actualData,
        backgroundColor: 'rgba(108, 92, 231, 0.6)',
        borderColor: '#6c5ce7',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Projected',
        data: projectedData,
        backgroundColor: 'rgba(162, 155, 254, 0.3)',
        borderColor: '#a29bfe',
        borderWidth: 1,
        borderRadius: 6,
        borderDash: [5, 5],
      }
    ]);
  });
}
