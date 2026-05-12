// ============================================================
// AUTH UI - Sign in, sign up, and household onboarding screens
// ============================================================

export function renderLoadingScreen(message = 'Loading your family workspace...') {
  const container = getAuthContainer();
  container.innerHTML = `
    <div class="auth-panel auth-panel-narrow">
      <div class="auth-brand">
        <div class="auth-logo">₹</div>
        <div>
          <h1>SpendWise</h1>
          <p>${escapeHtml(message)}</p>
        </div>
      </div>
      <div class="auth-loader"></div>
    </div>`;
}

export function renderAuthScreen({ onSignIn, onSignUp, error = '' }) {
  const container = getAuthContainer();
  container.innerHTML = `
    <div class="auth-panel">
      <div class="auth-brand">
        <div class="auth-logo">₹</div>
        <div>
          <h1>SpendWise</h1>
          <p>Shared expenses for your family, private to your household.</p>
        </div>
      </div>

      ${error ? `<div class="auth-error">${escapeHtml(error)}</div>` : ''}

      <div class="auth-tabs" role="tablist">
        <button class="auth-tab active" data-auth-tab="signin" type="button">Sign in</button>
        <button class="auth-tab" data-auth-tab="signup" type="button">Create account</button>
      </div>

      <form class="auth-form active" id="signin-form">
        <div class="form-group">
          <label class="form-label" for="signin-email">Email</label>
          <input class="form-input" id="signin-email" name="email" type="email" autocomplete="email" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="signin-password">Password</label>
          <input class="form-input" id="signin-password" name="password" type="password" autocomplete="current-password" required>
        </div>
        <button class="btn btn-primary w-full" type="submit">Sign in</button>
      </form>

      <form class="auth-form" id="signup-form">
        <div class="form-group">
          <label class="form-label" for="signup-name">Name</label>
          <input class="form-input" id="signup-name" name="name" type="text" autocomplete="name" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="signup-email">Email</label>
          <input class="form-input" id="signup-email" name="email" type="email" autocomplete="email" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="signup-password">Password</label>
          <input class="form-input" id="signup-password" name="password" type="password" autocomplete="new-password" minlength="6" required>
        </div>
        <button class="btn btn-primary w-full" type="submit">Create account</button>
      </form>
    </div>`;

  bindAuthTabs(container);

  container.querySelector('#signin-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    await onSignIn(data);
  });

  container.querySelector('#signup-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    await onSignUp(data);
  });
}

export function renderHouseholdScreen({ user, profile, onCreate, onJoin, onLogout, error = '' }) {
  const displayName = profile?.displayName || user.displayName || user.email;
  const container = getAuthContainer();
  container.innerHTML = `
    <div class="auth-panel">
      <div class="auth-brand">
        <div class="auth-logo">₹</div>
        <div>
          <h1>Family setup</h1>
          <p>Signed in as ${escapeHtml(displayName)}.</p>
        </div>
      </div>

      ${error ? `<div class="auth-error">${escapeHtml(error)}</div>` : ''}

      <div class="household-grid">
        <form class="household-card" id="create-household-form">
          <h3>Create a family</h3>
          <p>Your family gets a private invite code. Share it only with members you want in this household.</p>
          <div class="form-group">
            <label class="form-label" for="household-name">Family name</label>
            <input class="form-input" id="household-name" name="name" type="text" placeholder="e.g., Sharma Family" required>
          </div>
          <button class="btn btn-primary w-full" type="submit">Create family</button>
        </form>

        <form class="household-card" id="join-household-form">
          <h3>Join a family</h3>
          <p>Enter the invite code from the family member who created the household.</p>
          <div class="form-group">
            <label class="form-label" for="invite-code">Invite code</label>
            <input class="form-input invite-input" id="invite-code" name="inviteCode" type="text" maxlength="8" placeholder="ABCD2345" required>
          </div>
          <button class="btn btn-secondary w-full" type="submit">Join family</button>
        </form>
      </div>

      <button class="btn btn-ghost w-full auth-logout" id="auth-logout-btn" type="button">Sign out</button>
    </div>`;

  container.querySelector('#create-household-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    await onCreate(data);
  });

  container.querySelector('#join-household-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    await onJoin(data);
  });

  container.querySelector('#auth-logout-btn').addEventListener('click', onLogout);
}

function bindAuthTabs(container) {
  container.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.authTab;
      container.querySelectorAll('.auth-tab').forEach(item => {
        item.classList.toggle('active', item.dataset.authTab === mode);
      });
      container.querySelector('#signin-form').classList.toggle('active', mode === 'signin');
      container.querySelector('#signup-form').classList.toggle('active', mode === 'signup');
    });
  });
}

function getAuthContainer() {
  return document.getElementById('auth-screen');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
