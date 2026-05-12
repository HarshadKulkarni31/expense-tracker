// ============================================================
// RECURRING VIEW — Recurring bills management
// ============================================================

import { store } from '../store.js?v=family-auth-5';
import { formatCurrency, formatDate, toDateString, daysBetween, generateId, sumBy, getCategoryBadgeClass, CATEGORY_COLORS } from '../utils.js?v=family-auth-5';
import { openRecurringModal } from '../components/modal.js?v=family-auth-5';
import { showToast } from '../components/toast.js?v=family-auth-5';

export function renderRecurring() {
  const container = document.getElementById('view-recurring');
  const recurring = store.getRecurring();
  const today = toDateString(new Date());

  // Stats
  const totalMonthly = recurring
    .filter(r => r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const overdueCount = recurring.filter(r => r.nextDueDate < today && !r.isPaid).length;
  const upcomingCount = recurring.filter(r => {
    const diff = daysBetween(today, r.nextDueDate);
    return diff >= 0 && diff <= 7;
  }).length;

  // Sort: overdue first, then due today, then upcoming
  const sorted = [...recurring].sort((a, b) => {
    const aOverdue = a.nextDueDate < today ? -2 : a.nextDueDate === today ? -1 : 0;
    const bOverdue = b.nextDueDate < today ? -2 : b.nextDueDate === today ? -1 : 0;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return new Date(a.nextDueDate) - new Date(b.nextDueDate);
  });

  container.innerHTML = `
    <div class="page-header">
      <h1>Recurring Bills</h1>
      <p>Manage your recurring expenses and subscriptions</p>
    </div>

    <div class="recurring-stats stagger-children">
      <div class="summary-card">
        <div class="summary-card-icon" style="background: rgba(108,92,231,0.15); color: #6c5ce7;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
        </div>
        <div class="summary-card-content">
          <div class="summary-card-label">Monthly Total</div>
          <div class="summary-card-value">${formatCurrency(totalMonthly)}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-card-icon" style="background: ${overdueCount > 0 ? 'rgba(255,71,87,0.15)' : 'rgba(0,214,143,0.15)'}; color: ${overdueCount > 0 ? '#ff4757' : '#00d68f'};">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div class="summary-card-content">
          <div class="summary-card-label">Overdue</div>
          <div class="summary-card-value">${overdueCount}</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-card-icon" style="background: rgba(59,130,246,0.15); color: #3b82f6;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="summary-card-content">
          <div class="summary-card-label">Due This Week</div>
          <div class="summary-card-value">${upcomingCount}</div>
        </div>
      </div>
    </div>

    <div class="recurring-header" style="margin-top: var(--space-xl);">
      <h3>Your Bills</h3>
      <button class="btn btn-primary" id="add-recurring-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Bill
      </button>
    </div>

    <div class="recurring-list">
      ${sorted.length > 0 ? sorted.map(r => {
        const isOverdue = r.nextDueDate < today;
        const isDueToday = r.nextDueDate === today;
        const daysUntil = daysBetween(today, r.nextDueDate);
        
        let statusBadge, cardClass;
        if (isOverdue) {
          statusBadge = '<span class="badge badge-overdue">OVERDUE</span>';
          cardClass = 'overdue';
        } else if (isDueToday) {
          statusBadge = '<span class="badge badge-warning">DUE TODAY</span>';
          cardClass = 'due-today';
        } else if (daysUntil <= 7) {
          statusBadge = `<span class="badge badge-info">In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}</span>`;
          cardClass = '';
        } else {
          statusBadge = '<span class="badge badge-success">Upcoming</span>';
          cardClass = '';
        }

        const freqLabel = r.frequency.charAt(0).toUpperCase() + r.frequency.slice(1);

        return `
          <div class="recurring-card ${cardClass}">
            <div class="recurring-card-header">
              <div>
                <div class="recurring-card-title">${r.description}</div>
                ${statusBadge}
              </div>
              <div class="recurring-card-amount">${formatCurrency(r.amount)}</div>
            </div>
            <div class="recurring-card-details">
              <div class="recurring-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                <span class="badge badge-category ${getCategoryBadgeClass(r.category)}">${r.category}</span>
              </div>
              <div class="recurring-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                <span>${freqLabel}</span>
              </div>
              <div class="recurring-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Next due: ${formatDate(r.nextDueDate)}</span>
              </div>
            </div>
            <div class="recurring-card-actions">
              <button class="btn btn-success btn-sm mark-paid-btn" data-id="${r.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Mark Paid
              </button>
              <button class="btn btn-ghost btn-sm delete-recurring-btn" data-id="${r.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Delete
              </button>
            </div>
          </div>`;
      }).join('') : `
        <div class="card" style="grid-column: 1 / -1;">
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            <h3>No recurring bills</h3>
            <p>Add your first recurring bill to track subscriptions and regular payments</p>
          </div>
        </div>`}
    </div>`;

  // Events
  container.querySelector('#add-recurring-btn').addEventListener('click', () => {
    openRecurringModal((data) => {
      store.addRecurring({
        id: generateId(),
        description: data.description,
        amount: Number(data.amount),
        category: data.category,
        frequency: data.frequency,
        nextDueDate: data.nextDueDate,
        isPaid: false
      });
      showToast('Recurring bill added!', 'success');
      renderRecurring();
    });
  });

  // Mark as paid
  container.querySelectorAll('.mark-paid-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = recurring.find(r => r.id === id);
      if (!item) return;

      // Create expense entry
      store.addExpense({
        id: generateId(),
        date: toDateString(new Date()),
        amount: item.amount,
        category: item.category,
        description: item.description + ' (Recurring)',
        isRecurring: true
      });

      // Advance due date
      const nextDate = new Date(item.nextDueDate);
      switch (item.frequency) {
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      store.updateRecurring(id, {
        nextDueDate: toDateString(nextDate),
        isPaid: false
      });

      showToast(`${item.description} marked as paid! Next due: ${formatDate(toDateString(nextDate))}`, 'success');
      renderRecurring();
    });
  });

  // Delete
  container.querySelectorAll('.delete-recurring-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this recurring bill?')) {
        store.deleteRecurring(btn.dataset.id);
        showToast('Recurring bill deleted', 'info');
        renderRecurring();
      }
    });
  });
}
