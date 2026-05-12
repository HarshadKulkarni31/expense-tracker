// ============================================================
// STORE - Central household data store with Firebase persistence
// ============================================================

import { sortByDate, generateId } from './utils.js?v=family-auth-5';
import { clearHouseholdData, loadHouseholdData, saveHouseholdData } from './firebase.js?v=family-auth-5';

const STORAGE_KEY = 'expense-tracker-data';
const USER_ID_KEY = 'expense-tracker-user-id';

function getInitialData() {
  return {
    expenses: [],
    budgets: [],
    recurring: [],
    settings: { overallBudget: 50000 }
  };
}

class Store {
  constructor() {
    this.data = getInitialData();
    this.listeners = [];
    this.user = null;
    this.profile = null;
    this.household = null;
  }

  async init(context) {
    this.setContext(context);
    await this.load();
  }

  setContext({ user, profile, household }) {
    this.user = user;
    this.profile = profile;
    this.household = household;
  }

  clearContext() {
    this.user = null;
    this.profile = null;
    this.household = null;
    this.data = getInitialData();
    this.notify(false);
  }

  // ---------- Persistence ----------
  async load() {
    try {
      if (!this.household?.id) {
        this.data = getInitialData();
        return;
      }

      this.data = normalizeData(await loadHouseholdData(this.household.id));
    } catch (e) {
      console.error('Household data load failed:', e);
      this.data = getInitialData();
      throw e;
    }
  }

  async save() {
    try {
      if (this.household?.id) {
        await saveHouseholdData(this.household.id, this.data);
      } else {
        this.saveToLocal();
      }
    } catch (e) {
      console.error('Household save failed:', e);
      this.saveToLocal();
    }
  }

  async clearAllData() {
    if (this.household?.id) {
      try {
        await clearHouseholdData(this.household.id);
      } catch (e) {
        console.warn('Household reset failed:', e);
      }
    }

    this.clearLocalData();
    this.data = getInitialData();
    this.notify();
  }

  loadFromLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = normalizeData(JSON.parse(raw));
      } else {
        this.data = getInitialData();
        this.saveToLocal();
      }
    } catch (e) {
      console.error('Failed to load local data:', e);
      this.data = getInitialData();
      this.saveToLocal();
    }
  }

  saveToLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save local data:', e);
    }
  }

  clearLocalData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_ID_KEY);
    } catch (e) {
      console.error('Failed to clear local data:', e);
    }
  }

  getUserId() {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  }

  notify(shouldSave = true) {
    this.listeners.forEach(fn => fn(this.data));
    if (shouldSave) this.save();
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  getCurrentUser() {
    return this.user;
  }

  getHousehold() {
    return this.household;
  }

  // ---------- Expenses ----------
  getExpenses() {
    return sortByDate(this.data.expenses);
  }

  getExpensesByMonth(year, month) {
    return this.getExpenses().filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  getExpensesByDate(dateStr) {
    return this.getExpenses().filter(e => e.date === dateStr);
  }

  getExpensesByCategory(category) {
    return this.getExpenses().filter(e => e.category === category);
  }

  addExpense(expense) {
    this.data.expenses.push({
      ...expense,
      createdBy: expense.createdBy || this.user?.uid || null,
      createdByName: expense.createdByName || this.user?.displayName || this.user?.email || 'Family member'
    });
    this.notify();
  }

  updateExpense(id, updates) {
    const idx = this.data.expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.expenses[idx] = { ...this.data.expenses[idx], ...updates };
      this.notify();
    }
  }

  deleteExpense(id) {
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.notify();
  }

  // ---------- Budgets ----------
  getBudgets() {
    return this.data.budgets;
  }

  getBudgetsByMonth(monthKey) {
    return this.data.budgets.filter(b => b.month === monthKey);
  }

  addBudget(budget) {
    this.data.budgets = this.data.budgets.filter(
      b => !(b.category === budget.category && b.month === budget.month)
    );
    this.data.budgets.push(budget);
    this.notify();
  }

  updateBudget(id, updates) {
    const idx = this.data.budgets.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.budgets[idx] = { ...this.data.budgets[idx], ...updates };
      this.notify();
    }
  }

  deleteBudget(id) {
    this.data.budgets = this.data.budgets.filter(b => b.id !== id);
    this.notify();
  }

  // ---------- Recurring ----------
  getRecurring() {
    return this.data.recurring;
  }

  addRecurring(item) {
    this.data.recurring.push(item);
    this.notify();
  }

  updateRecurring(id, updates) {
    const idx = this.data.recurring.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.recurring[idx] = { ...this.data.recurring[idx], ...updates };
      this.notify();
    }
  }

  deleteRecurring(id) {
    this.data.recurring = this.data.recurring.filter(r => r.id !== id);
    this.notify();
  }

  // ---------- Settings ----------
  getSettings() {
    return this.data.settings;
  }

  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.notify();
  }

  // ---------- Reset ----------
  async resetToEmpty() {
    await this.clearAllData();
  }
}

export const store = new Store();

function normalizeData(data) {
  const initial = getInitialData();
  return {
    expenses: Array.isArray(data?.expenses) ? data.expenses : initial.expenses,
    budgets: Array.isArray(data?.budgets) ? data.budgets : initial.budgets,
    recurring: Array.isArray(data?.recurring) ? data.recurring : initial.recurring,
    settings: {
      ...initial.settings,
      ...(data?.settings || {})
    }
  };
}
