// ============================================================
// UTILS — Formatters, date helpers, CSV export, ID generator
// ============================================================

export const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Bills', 'Health', 'Education', 'Groceries', 'Rent', 'Other'
];

export const CATEGORY_COLORS = {
  Food:          '#ff6b6b',
  Transport:     '#ffa502',
  Shopping:      '#ee5a9d',
  Entertainment: '#a29bfe',
  Bills:         '#3b82f6',
  Health:        '#00d68f',
  Education:     '#1dd1a1',
  Groceries:     '#fdcb6e',
  Rent:          '#e17055',
  Other:         '#636e72'
};

export const CATEGORY_ICONS = {
  Food:          'utensils',
  Transport:     'car',
  Shopping:      'shopping-bag',
  Entertainment: 'gamepad-2',
  Bills:         'file-text',
  Health:        'heart-pulse',
  Education:     'graduation-cap',
  Groceries:     'shopping-cart',
  Rent:          'home',
  Other:         'more-horizontal'
};

// ---------- Currency ----------
export function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

export function formatCurrencyDecimal(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ---------- Dates ----------
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });
}

export function formatDateFull(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function getMonthYear(dateStr) {
  const d = new Date(dateStr);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export function toDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isToday(dateStr) {
  return toDateString(new Date()) === dateStr;
}

export function isSameMonth(dateStr, year, month) {
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() === month;
}

export function getMonthsRange(count) {
  const months = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

// ---------- ID Generator ----------
let idCounter = 0;
export function generateId() {
  return Date.now().toString(36) + (idCounter++).toString(36) + Math.random().toString(36).slice(2, 6);
}

// ---------- CSV Export ----------
export function exportToCSV(expenses) {
  const headers = ['Date', 'Description', 'Category', 'Added By', 'Amount (₹)'];
  const rows = expenses.map(e => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    `"${(e.createdByName || 'Family member').replace(/"/g, '""')}"`,
    e.amount
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses_${toDateString(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------- Helpers ----------
export function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
}

export function sumBy(arr, key) {
  return arr.reduce((sum, item) => sum + Number(item[key] || 0), 0);
}

export function sortByDate(arr, key = 'date', desc = true) {
  return [...arr].sort((a, b) => {
    const diff = new Date(a[key]) - new Date(b[key]);
    return desc ? -diff : diff;
  });
}

export function getCategoryBadgeClass(category) {
  return 'badge-' + category.toLowerCase().replace(/\s+/g, '-');
}

export function getProgressColor(percentage) {
  if (percentage >= 85) return 'red';
  if (percentage >= 60) return 'amber';
  return 'green';
}
