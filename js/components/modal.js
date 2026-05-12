// ============================================================
// MODAL — Reusable modal system
// ============================================================

import { CATEGORIES } from '../utils.js?v=family-auth-5';

let modalOverlay = null;

function ensureOverlay() {
  if (!modalOverlay) {
    modalOverlay = document.getElementById('modal-overlay');
  }
  return modalOverlay;
}

export function openModal({ title, fields, onSubmit, submitText = 'Save', values = {} }) {
  const overlay = ensureOverlay();
  
  const fieldsHTML = fields.map(f => {
    const val = values[f.name] || f.default || '';
    
    if (f.type === 'select') {
      const opts = f.options.map(o => {
        const optVal = typeof o === 'string' ? o : o.value;
        const optLabel = typeof o === 'string' ? o : o.label;
        const selected = optVal === val ? 'selected' : '';
        return `<option value="${optVal}" ${selected}>${optLabel}</option>`;
      }).join('');
      return `
        <div class="form-group">
          <label class="form-label" for="modal-${f.name}">${f.label}</label>
          <select class="form-select" id="modal-${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>
            <option value="">Select ${f.label.toLowerCase()}</option>
            ${opts}
          </select>
        </div>`;
    }
    
    return `
      <div class="form-group">
        <label class="form-label" for="modal-${f.name}">${f.label}</label>
        <input class="form-input" type="${f.type || 'text'}" id="modal-${f.name}" name="${f.name}"
          value="${val}" placeholder="${f.placeholder || ''}"
          ${f.required ? 'required' : ''}
          ${f.min !== undefined ? `min="${f.min}"` : ''}
          ${f.step !== undefined ? `step="${f.step}"` : ''}>
      </div>`;
  }).join('');

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="modal-close-btn" aria-label="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <form id="modal-form">
        <div class="modal-body">
          ${fieldsHTML}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-primary">${submitText}</button>
        </div>
      </form>
    </div>`;

  // Show
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });

  // Bind events
  const form = document.getElementById('modal-form');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');

  const close = () => closeModal();

  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    if (onSubmit(data) !== false) {
      close();
    }
  });

  // Focus first input
  const firstInput = form.querySelector('input, select');
  if (firstInput) firstInput.focus();

  // Escape to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

export function closeModal() {
  const overlay = ensureOverlay();
  overlay.classList.remove('visible');
  setTimeout(() => {
    overlay.innerHTML = '';
  }, 300);
}

// ---------- Pre-built modal configs ----------
export function openExpenseModal(onSubmit, values = {}) {
  openModal({
    title: values.id ? 'Edit Expense' : 'Add Expense',
    submitText: values.id ? 'Update' : 'Add Expense',
    values,
    fields: [
      { name: 'description', label: 'Description', type: 'text', placeholder: 'e.g., Lunch at restaurant', required: true },
      { name: 'amount', label: 'Amount (₹)', type: 'number', placeholder: '0', required: true, min: 1, step: 1 },
      { name: 'category', label: 'Category', type: 'select', options: CATEGORIES, required: true },
      { name: 'date', label: 'Date', type: 'date', required: true, default: new Date().toISOString().split('T')[0] }
    ],
    onSubmit
  });
}

export function openBudgetModal(onSubmit, values = {}) {
  openModal({
    title: values.id ? 'Edit Budget' : 'Set Budget',
    submitText: values.id ? 'Update' : 'Set Budget',
    values,
    fields: [
      { name: 'category', label: 'Category', type: 'select', options: CATEGORIES, required: true },
      { name: 'monthlyLimit', label: 'Monthly Limit (₹)', type: 'number', placeholder: '5000', required: true, min: 100, step: 100 }
    ],
    onSubmit
  });
}

export function openRecurringModal(onSubmit, values = {}) {
  openModal({
    title: values.id ? 'Edit Recurring Bill' : 'Add Recurring Bill',
    submitText: values.id ? 'Update' : 'Add Bill',
    values,
    fields: [
      { name: 'description', label: 'Description', type: 'text', placeholder: 'e.g., Netflix subscription', required: true },
      { name: 'amount', label: 'Amount (₹)', type: 'number', placeholder: '0', required: true, min: 1, step: 1 },
      { name: 'category', label: 'Category', type: 'select', options: CATEGORIES, required: true },
      { name: 'frequency', label: 'Frequency', type: 'select', options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' }
      ], required: true },
      { name: 'nextDueDate', label: 'Next Due Date', type: 'date', required: true, default: new Date().toISOString().split('T')[0] }
    ],
    onSubmit
  });
}

export function openOverallBudgetModal(onSubmit, values = {}) {
  openModal({
    title: 'Set Overall Monthly Budget',
    submitText: 'Save',
    values,
    fields: [
      { name: 'overallBudget', label: 'Total Monthly Budget (₹)', type: 'number', placeholder: '50000', required: true, min: 1000, step: 500 }
    ],
    onSubmit
  });
}
