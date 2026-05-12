// ============================================================
// CALENDAR VIEW — Visual calendar with spend amounts per day
// ============================================================

import { store } from '../store.js?v=family-auth-5';
import { formatCurrency, formatDateFull, MONTH_NAMES, DAY_NAMES, getDaysInMonth, getFirstDayOfMonth, toDateString, isToday, sumBy, groupBy, CATEGORY_COLORS, getCategoryBadgeClass, escapeHtml } from '../utils.js?v=family-auth-5';

let calYear, calMonth, selectedDate = null;

function init() {
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
}

export function renderCalendar() {
  if (calYear === undefined) init();

  const container = document.getElementById('view-calendar');
  const monthExpenses = store.getExpensesByMonth(calYear, calMonth);
  const byDate = groupBy(monthExpenses, e => e.date);

  // Stats
  const totalMonth = sumBy(monthExpenses, 'amount');
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const dailyAvg = monthExpenses.length > 0 ? Math.round(totalMonth / daysInMonth) : 0;

  // Most expensive day
  let maxDay = '', maxDayAmount = 0;
  Object.entries(byDate).forEach(([date, expenses]) => {
    const total = sumBy(expenses, 'amount');
    if (total > maxDayAmount) {
      maxDayAmount = total;
      maxDay = date;
    }
  });

  // Category breakdown
  const byCat = groupBy(monthExpenses, e => e.category);
  const catBreakdown = Object.entries(byCat)
    .map(([cat, items]) => ({ cat, total: sumBy(items, 'amount') }))
    .sort((a, b) => b.total - a.total);

  // Calendar grid
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const days = getDaysInMonth(calYear, calMonth);
  
  let calendarCells = '';
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarCells += '<div class="calendar-day empty"></div>';
  }
  
  // Day cells
  for (let d = 1; d <= days; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayExpenses = byDate[dateStr] || [];
    const dayTotal = sumBy(dayExpenses, 'amount');
    const todayClass = isToday(dateStr) ? 'today' : '';
    const selectedClass = selectedDate === dateStr ? 'selected' : '';
    
    let amountClass = '';
    if (dayTotal > 0) {
      if (dayTotal > dailyAvg * 1.5) amountClass = 'high';
      else if (dayTotal > dailyAvg * 0.7) amountClass = 'medium';
      else amountClass = 'low';
    }

    calendarCells += `
      <div class="calendar-day ${todayClass} ${selectedClass}" data-date="${dateStr}">
        <div class="calendar-day-number">${d}</div>
        ${dayTotal > 0 ? `<div class="calendar-day-amount ${amountClass}">${formatCurrency(dayTotal)}</div>` : ''}
      </div>`;
  }

  // Selected day breakdown
  const selectedExpenses = selectedDate ? (byDate[selectedDate] || []) : [];
  const selectedTotal = sumBy(selectedExpenses, 'amount');

  container.innerHTML = `
    <div class="page-header">
      <h1>Calendar</h1>
      <p>Visualize your daily spending patterns</p>
    </div>

    <div class="calendar-layout">
      <div class="calendar-main">
        <div class="calendar-nav">
          <button class="btn btn-ghost btn-icon" id="cal-prev">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <h3>${MONTH_NAMES[calMonth]} ${calYear}</h3>
          <button class="btn btn-ghost btn-icon" id="cal-next">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <div class="calendar-grid">
          ${DAY_NAMES.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
          ${calendarCells}
        </div>

        ${selectedDate ? `
        <div class="card day-breakdown" style="margin-top: var(--space-lg); animation: fadeInUp 0.3s ease;">
          <div class="day-breakdown-header">
            <div class="day-breakdown-date">${formatDateFull(selectedDate)}</div>
            <div class="day-breakdown-total">${formatCurrency(selectedTotal)}</div>
          </div>
          ${selectedExpenses.length > 0 ? `
          <div class="day-breakdown-list">
            ${selectedExpenses.map(e => `
              <div class="day-expense-item">
                <div>
                  <div class="desc">${escapeHtml(e.description)}</div>
                  <div class="cat"><span class="badge badge-category ${getCategoryBadgeClass(e.category)}">${escapeHtml(e.category)}</span></div>
                </div>
                <div class="amount">${formatCurrency(e.amount)}</div>
              </div>`).join('')}
          </div>` : '<p class="text-secondary" style="margin-top: var(--space-base);">No expenses on this day</p>'}
        </div>` : ''}
      </div>

      <div class="calendar-sidebar">
        <div class="card">
          <h4 class="card-title" style="margin-bottom: var(--space-base);">Monthly Summary</h4>
          <div class="monthly-stat">
            <span class="monthly-stat-label">Total Spent</span>
            <span class="monthly-stat-value">${formatCurrency(totalMonth)}</span>
          </div>
          <div class="monthly-stat">
            <span class="monthly-stat-label">Daily Average</span>
            <span class="monthly-stat-value">${formatCurrency(dailyAvg)}</span>
          </div>
          <div class="monthly-stat">
            <span class="monthly-stat-label">Transactions</span>
            <span class="monthly-stat-value">${monthExpenses.length}</span>
          </div>
          <div class="monthly-stat">
            <span class="monthly-stat-label">Most Expensive Day</span>
            <span class="monthly-stat-value">${maxDay ? new Date(maxDay).getDate() + ' ' + MONTH_NAMES[calMonth].slice(0, 3) : '—'}</span>
          </div>
        </div>

        <div class="card">
          <h4 class="card-title" style="margin-bottom: var(--space-base);">Category Breakdown</h4>
          <div class="category-mini-list">
            ${catBreakdown.length > 0 ? catBreakdown.map(({ cat, total }) => `
              <div class="category-mini-item">
                <div class="category-mini-dot" style="background: ${CATEGORY_COLORS[cat] || '#636e72'};"></div>
                <span class="category-mini-name">${cat}</span>
                <span class="category-mini-amount">${formatCurrency(total)}</span>
              </div>`).join('') : '<p class="text-secondary">No data for this month</p>'}
          </div>
        </div>
      </div>
    </div>`;

  // Events
  container.querySelector('#cal-prev').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    selectedDate = null;
    renderCalendar();
  });

  container.querySelector('#cal-next').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    selectedDate = null;
    renderCalendar();
  });

  container.querySelectorAll('.calendar-day:not(.empty)').forEach(cell => {
    cell.addEventListener('click', () => {
      selectedDate = cell.dataset.date;
      renderCalendar();
    });
  });
}
