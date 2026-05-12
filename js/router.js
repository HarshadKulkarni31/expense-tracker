// ============================================================
// ROUTER — Hash-based SPA routing
// ============================================================

import { renderDashboard } from './views/dashboard.js?v=family-auth-5';
import { renderExpenses } from './views/expenses.js?v=family-auth-5';
import { renderCalendar } from './views/calendar.js?v=family-auth-5';
import { renderAnalytics } from './views/analytics.js?v=family-auth-5';
import { renderBudget } from './views/budget.js?v=family-auth-5';
import { renderRecurring } from './views/recurring.js?v=family-auth-5';

const routes = {
  dashboard:  renderDashboard,
  expenses:   renderExpenses,
  calendar:   renderCalendar,
  analytics:  renderAnalytics,
  budget:     renderBudget,
  recurring:  renderRecurring
};

let currentView = null;

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  const viewName = hash.split('?')[0];

  if (!routes[viewName]) {
    window.location.hash = '#dashboard';
    return;
  }

  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  // Show target view
  const viewEl = document.getElementById(`view-${viewName}`);
  if (viewEl) {
    viewEl.classList.add('active');
  }

  // Update sidebar active state
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  // Render the view
  if (routes[viewName]) {
    routes[viewName]();
  }

  currentView = viewName;

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    expenses: 'Expenses',
    calendar: 'Calendar',
    analytics: 'Analytics',
    budget: 'Budget',
    recurring: 'Recurring Bills'
  };
  document.title = `${titles[viewName] || 'Dashboard'} | SpendWise`;
}

export function navigateTo(view) {
  window.location.hash = `#${view}`;
}

export function getCurrentView() {
  return currentView;
}

export function refreshCurrentView() {
  if (currentView && routes[currentView]) {
    routes[currentView]();
  }
}
