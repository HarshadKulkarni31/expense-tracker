// ============================================================
// APP - Entry point, auth flow, sidebar init, CSV export
// ============================================================

import { renderAuthScreen, renderHouseholdScreen, renderLoadingScreen } from './auth.js?v=family-auth-5';
import { initRouter, refreshCurrentView } from './router.js?v=family-auth-5';
import { initChartDefaults } from './charts.js?v=family-auth-5';
import { store } from './store.js?v=family-auth-5';
import { exportToCSV, escapeHtml } from './utils.js?v=family-auth-5';
import { showToast } from './components/toast.js?v=family-auth-5';
import { initVoiceAssistant } from './voice.js';
import {
  createHousehold,
  createUserProfileIfMissing,
  getHousehold,
  joinHousehold,
  signInUser,
  signOutUser,
  signUpUser,
  watchAuth
} from './firebase.js?v=family-auth-5';

let shellInitialized = false;
let routerInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
  initChartDefaults();
  renderLoadingScreen();

  try {
    watchAuth(handleAuthState);
  } catch (error) {
    renderAuthGate(error.message);
  }
});

async function handleAuthState(user) {
  if (!user) {
    hideAppShell();
    store.clearContext();
    renderAuthGate();
    return;
  }

  renderLoadingScreen();

  try {
    const profile = await createUserProfileIfMissing(user);

    if (profile.householdId) {
      const household = await getHousehold(profile.householdId);
      if (household?.members?.[user.uid]) {
        await bootApp({ user, profile, household });
        return;
      }
    }

    hideAppShell();
    renderHouseholdGate({ user, profile });
  } catch (error) {
    hideAppShell();
    renderHouseholdGate({ user, profile: null, error: cleanFirebaseError(error) });
  }
}

function renderAuthGate(error = '') {
  renderAuthScreen({
    error,
    onSignIn: async (data) => {
      renderLoadingScreen('Signing you in...');
      try {
        await signInUser(data);
      } catch (authError) {
        renderAuthGate(cleanFirebaseError(authError));
      }
    },
    onSignUp: async (data) => {
      renderLoadingScreen('Creating your account...');
      try {
        await signUpUser(data);
      } catch (authError) {
        renderAuthGate(cleanFirebaseError(authError));
      }
    }
  });
}

function renderHouseholdGate({ user, profile, error = '' }) {
  renderHouseholdScreen({
    user,
    profile,
    error,
    onCreate: async (data) => {
      renderLoadingScreen('Creating your family workspace...');
      try {
        const household = await createHousehold({ name: data.name.trim(), user });
        await bootApp({
          user,
          profile: { ...profile, householdId: household.id },
          household
        });
      } catch (householdError) {
        renderHouseholdGate({ user, profile, error: cleanFirebaseError(householdError) });
      }
    },
    onJoin: async (data) => {
      renderLoadingScreen('Joining your family workspace...');
      try {
        const household = await joinHousehold({ inviteCode: data.inviteCode, user });
        await bootApp({
          user,
          profile: { ...profile, householdId: household.id },
          household
        });
      } catch (householdError) {
        renderHouseholdGate({ user, profile, error: cleanFirebaseError(householdError) });
      }
    },
    onLogout: async () => {
      await signOutUser();
    }
  });
}

async function bootApp({ user, profile, household }) {
  await store.init({ user, profile, household });

  document.getElementById('auth-screen').hidden = true;
  document.getElementById('app-shell').hidden = false;
  updateFamilyPanel(user, household);

  if (!shellInitialized) {
    initShell();
    shellInitialized = true;
  }

  if (!routerInitialized) {
    initRouter();
    routerInitialized = true;
  } else {
    refreshCurrentView();
  }

  updateOverdueBadge();
}

function initShell() {
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = `#${item.dataset.view}`;
      closeMobileSidebar();
    });
  });

  const exportBtn = document.getElementById('export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const expenses = store.getExpenses();
      if (expenses.length === 0) {
        showToast('No expenses to export', 'warning');
        return;
      }
      exportToCSV(expenses);
      showToast(`Exported ${expenses.length} expenses to CSV`, 'success');
    });
  }

  const resetBtn = document.getElementById('reset-data-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('Reset all expenses, budgets and recurring bills for this family?')) {
        await store.resetToEmpty();
        showToast('Family data cleared', 'info');
        window.location.hash = '#dashboard';
        refreshCurrentView();
      }
    });
  }

  const signOutBtn = document.getElementById('sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      await signOutUser();
    });
  }

  // Theme Toggle Logic
  const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
  
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('spendwise-theme', theme);
    if (themeToggleCheckbox) {
      themeToggleCheckbox.checked = (theme === 'light');
    }
  };
  
  // Initial load
  const savedTheme = localStorage.getItem('spendwise-theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggleCheckbox) {
    themeToggleCheckbox.addEventListener('change', (e) => {
      applyTheme(e.target.checked ? 'light' : 'dark');
    });
  }

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }

  store.onChange(() => {
    updateOverdueBadge();
  });

  initVoiceAssistant();
}

function hideAppShell() {
  document.getElementById('auth-screen').hidden = false;
  document.getElementById('app-shell').hidden = true;
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
}

function updateFamilyPanel(user, household) {
  const panel = document.getElementById('sidebar-family');
  if (!panel || !household) return;

  panel.innerHTML = `
    <div class="sidebar-family-name">${escapeHtml(household.name || 'Family')}</div>
    <div class="sidebar-family-code-container">
      <div class="sidebar-family-code">Code <span>${escapeHtml(household.inviteCode || '')}</span></div>
      <button class="copy-code-btn" title="Copy Code" data-code="${escapeHtml(household.inviteCode || '')}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
    </div>
    <div class="sidebar-family-user">${escapeHtml(user.displayName || user.email)}</div>`;

  const copyBtn = panel.querySelector('.copy-code-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = copyBtn.dataset.code;
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          showToast('Family code copied!', 'success');
        }).catch(() => {
          showToast('Failed to copy code', 'error');
        });
      }
    });
  }
}

function updateOverdueBadge() {
  const recurring = store.getRecurring();
  const today = new Date().toISOString().split('T')[0];
  const overdueCount = recurring.filter(r => r.nextDueDate < today && !r.isPaid).length;

  const badge = document.getElementById('recurring-badge');
  if (badge) {
    if (overdueCount > 0) {
      badge.textContent = overdueCount;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function cleanFirebaseError(error) {
  const message = error?.message || 'Something went wrong. Please try again.';

  if (message.includes('auth/operation-not-allowed')) {
    return 'Email/password sign-in is not enabled. In Firebase Console, open Authentication > Sign-in method and enable Email/Password.';
  }

  if (message.includes('auth/email-already-in-use')) {
    return 'This email already has an account. Use Sign in instead.';
  }

  if (message.includes('auth/weak-password')) {
    return 'Password should be at least 6 characters.';
  }

  if (message.includes('auth/invalid-email')) {
    return 'Enter a valid email address.';
  }

  if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
    return 'Firebase blocked the database write. Publish the Firestore rules from firestore.rules, then try again.';
  }

  return message
    .replace('Firebase: ', '')
    .replace(/\s*\(auth\/.*\)\.?$/, '')
    .replace(/\s*\(permission-denied\)\.?$/, '');
}


