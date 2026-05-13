// ============================================================
// EXPENSES VIEW — Table with search, filter, inline edit, delete
// ============================================================

import { store } from '../store.js?v=family-auth-5';
import { formatCurrency, formatDate, CATEGORIES, MONTH_NAMES, getCategoryBadgeClass, generateId, toDateString, escapeHtml } from '../utils.js?v=family-auth-5';
import { openExpenseModal } from '../components/modal.js?v=family-auth-5';
import { showToast } from '../components/toast.js?v=family-auth-5';

const PAGE_SIZE = 15;
let currentPage = 1;
let searchQuery = '';
let filterMonth = '';
let filterCategory = '';
let editingId = null;

export function renderExpenses() {
  const container = document.getElementById('view-expenses');
  
  // Get filtered expenses
  let expenses = store.getExpenses();

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    expenses = expenses.filter(e =>
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    );
  }

  if (filterMonth) {
    const [fy, fm] = filterMonth.split('-').map(Number);
    expenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === fy && d.getMonth() + 1 === fm;
    });
  }

  if (filterCategory) {
    expenses = expenses.filter(e => e.category === filterCategory);
  }

  // Pagination
  const totalPages = Math.ceil(expenses.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageExpenses = expenses.slice(start, start + PAGE_SIZE);

  // Month options
  const allExpenses = store.getExpenses();
  const monthSet = new Set();
  allExpenses.forEach(e => {
    const d = new Date(e.date);
    monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  });
  const monthOptions = [...monthSet].sort().reverse();

  container.innerHTML = `
    <div class="page-header">
      <h1>Expenses</h1>
      <p>Track and manage all your expenses</p>
    </div>

    <div class="expenses-toolbar">
      <div class="search-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" class="search-input" id="expense-search" placeholder="Search expenses..." value="${searchQuery}">
      </div>
      
      <div class="expenses-filters">
        <select class="form-select" id="filter-month">
          <option value="">All Months</option>
          ${monthOptions.map(m => {
            const [y, mo] = m.split('-');
            return `<option value="${m}" ${m === filterMonth ? 'selected' : ''}>${MONTH_NAMES[parseInt(mo) - 1]} ${y}</option>`;
          }).join('')}
        </select>
        
        <select class="form-select" id="filter-category">
          <option value="">All Categories</option>
          ${CATEGORIES.map(c => `<option value="${c}" ${c === filterCategory ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>

      <div class="toolbar-spacer"></div>

      <button class="btn btn-primary" id="add-expense-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Expense
      </button>
    </div>

    ${pageExpenses.length > 0 ? `
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Added By</th>
            <th style="text-align: right;">Amount</th>
            <th style="text-align: center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pageExpenses.map(e => editingId === e.id ? renderEditRow(e) : renderRow(e)).join('')}
        </tbody>
      </table>
    </div>

    ${totalPages > 1 ? `
    <div class="pagination">
      <button class="btn btn-secondary btn-sm" id="prev-page" ${currentPage <= 1 ? 'disabled' : ''}>← Prev</button>
      <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
      <button class="btn btn-secondary btn-sm" id="next-page" ${currentPage >= totalPages ? 'disabled' : ''}>Next →</button>
    </div>` : ''}
    ` : `
    <div class="card">
      <div class="empty-state">
        <lottie-player src="https://assets10.lottiefiles.com/packages/lf20_puciaact.json" background="transparent" speed="1" style="width: 150px; height: 150px; margin: 0 auto var(--space-base);" loop autoplay></lottie-player>
        <h3>No expenses found</h3>
        <p>${searchQuery || filterMonth || filterCategory ? 'Try adjusting your filters' : 'Add your first expense to get started'}</p>
      </div>
    </div>`}`;

  bindExpenseEvents(container);
}

function renderRow(e) {
  return `
    <tr>
      <td>${formatDate(e.date)}</td>
      <td><span class="fw-medium">${escapeHtml(e.description)}</span></td>
      <td><span class="badge badge-category ${getCategoryBadgeClass(e.category)}">${escapeHtml(e.category)}</span></td>
      <td>${escapeHtml(e.createdByName || 'Family member')}</td>
      <td class="table-amount" style="text-align: right;">${formatCurrency(e.amount)}</td>
      <td>
        <div class="table-actions" style="justify-content: center;">
          <button class="btn btn-ghost btn-icon edit-expense-btn" data-id="${e.id}" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn btn-ghost btn-icon delete-expense-btn" data-id="${e.id}" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>`;
}

function renderEditRow(e) {
  return `
    <tr class="expense-row-editing">
      <td><input class="form-input" type="date" id="edit-date" value="${e.date}"></td>
      <td><input class="form-input" type="text" id="edit-desc" value="${e.description}"></td>
      <td>
        <select class="form-select" id="edit-cat">
          ${CATEGORIES.map(c => `<option value="${c}" ${c === e.category ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </td>
      <td>${e.createdByName || 'Family member'}</td>
      <td><input class="form-input" type="number" id="edit-amount" value="${e.amount}" style="text-align: right;"></td>
      <td>
        <div class="inline-edit-actions" style="justify-content: center;">
          <button class="btn btn-success btn-sm save-edit-btn" data-id="${e.id}">Save</button>
          <button class="btn btn-secondary btn-sm cancel-edit-btn">Cancel</button>
        </div>
      </td>
    </tr>`;
}

function bindExpenseEvents(container) {
  // Search
  const searchInput = container.querySelector('#expense-search');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        searchQuery = e.target.value;
        currentPage = 1;
        renderExpenses();
      }, 300);
    });
  }

  // Filters
  const monthFilter = container.querySelector('#filter-month');
  if (monthFilter) {
    monthFilter.addEventListener('change', (e) => {
      filterMonth = e.target.value;
      currentPage = 1;
      renderExpenses();
    });
  }

  const catFilter = container.querySelector('#filter-category');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      filterCategory = e.target.value;
      currentPage = 1;
      renderExpenses();
    });
  }

  // Add expense
  const addBtn = container.querySelector('#add-expense-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openExpenseModal((data) => {
        store.addExpense({
          id: generateId(),
          date: data.date,
          amount: Number(data.amount),
          category: data.category,
          description: data.description
        });
        showToast('Expense added successfully!', 'success');
        renderExpenses();
      });
    });
  }

  // Edit buttons
  container.querySelectorAll('.edit-expense-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      editingId = btn.dataset.id;
      renderExpenses();
    });
  });

  // Delete buttons
  container.querySelectorAll('.delete-expense-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this expense?')) {
        store.deleteExpense(btn.dataset.id);
        showToast('Expense deleted', 'info');
        renderExpenses();
      }
    });
  });

  // Save inline edit
  container.querySelectorAll('.save-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      store.updateExpense(id, {
        date: document.getElementById('edit-date').value,
        description: document.getElementById('edit-desc').value,
        category: document.getElementById('edit-cat').value,
        amount: Number(document.getElementById('edit-amount').value)
      });
      editingId = null;
      showToast('Expense updated!', 'success');
      renderExpenses();
    });
  });

  // Cancel inline edit
  container.querySelectorAll('.cancel-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      editingId = null;
      renderExpenses();
    });
  });

  // Pagination
  const prevBtn = container.querySelector('#prev-page');
  if (prevBtn) prevBtn.addEventListener('click', () => { currentPage--; renderExpenses(); });
  
  const nextBtn = container.querySelector('#next-page');
  if (nextBtn) nextBtn.addEventListener('click', () => { currentPage++; renderExpenses(); });
}
