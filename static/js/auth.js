// Thin shim over django-allauth's "headless" JSON API, exposing the same
// function names/shapes the original js/netlify-identity.js did, so
// account.js's own logic needs minimal changes. See the migration plan for
// the exact allauth endpoints this wraps (verified against the installed
// allauth source, not guessed): GET/DELETE auth/session, POST auth/login,
// POST auth/signup, POST auth/password/request, POST auth/password/reset,
// POST account/password/change, POST auth/email/verify, GET config.

const BASE = '/_allauth/browser/v1';

export const AUTH_EVENTS = { LOGIN: 'login', LOGOUT: 'logout' };
const listeners = new Set();
let lastAuthed = null;
let pendingResetKey = null; // set by handleAuthCallback() when the link was a password-reset link

export class AuthError extends Error {
  constructor(message, status) { super(message); this.name = 'AuthError'; this.status = status; }
}
export class MissingIdentityError extends Error {
  constructor() { super('Accounts are not available right now.'); this.name = 'MissingIdentityError'; }
}

function csrfToken() {
  return (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '';
}

function mapUser(u) {
  if (!u) return null;
  return { id: u.id, email: u.email, name: u.full_name || undefined, confirmedAt: u.email ? '1' : undefined };
}

async function call(method, path, body) {
  const r = await fetch(`${BASE}/${path}`, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  return { status: r.status, data: d.data || {}, errors: d.errors || [] };
}

function notifyFromAuthResponse(resp) {
  const authed = !!resp.data.user;
  if (authed && !lastAuthed) for (const l of listeners) l(AUTH_EVENTS.LOGIN, mapUser(resp.data.user));
  if (!authed && lastAuthed) for (const l of listeners) l(AUTH_EVENTS.LOGOUT, null);
  lastAuthed = authed;
}

function errorFrom(resp, fallback) {
  const pendingVerify = (resp.data.flows || []).some((f) => f.is_pending);
  const msg = pendingVerify ? 'Please confirm your email first.' : (resp.errors[0] && resp.errors[0].message) || fallback;
  return new AuthError(msg, resp.status);
}

export async function getUser() {
  const resp = await call('GET', 'auth/session');
  notifyFromAuthResponse(resp);
  return resp.status === 200 ? mapUser(resp.data.user) : null;
}

export async function login(email, password) {
  const resp = await call('POST', 'auth/login', { email, password });
  if (resp.status !== 200) throw errorFrom(resp, 'Invalid email or password.');
  notifyFromAuthResponse(resp);
  return mapUser(resp.data.user);
}

export async function signup(email, password, data = {}) {
  const resp = await call('POST', 'auth/signup', { email, password, full_name: data.full_name || '' });
  if (resp.status === 200) {
    notifyFromAuthResponse(resp);
    const u = mapUser(resp.data.user);
    return { ...u, emailVerified: true, confirmedAt: '1' };
  }
  if (resp.status === 401 && (resp.data.flows || []).some((f) => f.is_pending)) {
    return { emailVerified: false };
  }
  throw errorFrom(resp, 'Could not create your account.');
}

export async function logout() {
  await call('DELETE', 'auth/session');
  if (lastAuthed) for (const l of listeners) l(AUTH_EVENTS.LOGOUT, null);
  lastAuthed = false;
}

export function oauthLogin(provider) {
  window.location.href = `${BASE}/auth/provider/redirect?provider=${encodeURIComponent(provider)}&process=login&callback_url=${encodeURIComponent(window.location.origin + '/')}`;
}

export async function requestPasswordRecovery(email) {
  const resp = await call('POST', 'auth/password/request', { email });
  if (resp.status !== 200) throw errorFrom(resp, 'Could not send the reset link.');
}

// Mirrors the original netlify-identity.js updateUser({password}) call site,
// which only ever runs right after a password-reset-email link is opened.
export async function updateUser(payload) {
  if (payload && payload.password && pendingResetKey) {
    const resp = await call('POST', 'auth/password/reset', { key: pendingResetKey, password: payload.password });
    pendingResetKey = null;
    if (resp.status !== 200) throw errorFrom(resp, 'Could not reset your password. The link may have expired.');
    notifyFromAuthResponse(resp);
    return mapUser(resp.data.user);
  }
  if (payload && payload.password) {
    const resp = await call('POST', 'account/password/change', { new_password: payload.password });
    if (resp.status !== 200) throw errorFrom(resp, 'Could not update your password.');
    return mapUser(resp.data.user);
  }
  throw new AuthError('Unsupported update.');
}

export async function getSettings() {
  const resp = await call('GET', 'config');
  const providers = (resp.data.socialaccount && resp.data.socialaccount.providers) || [];
  return {
    disableSignup: resp.data.account ? !resp.data.account.is_open_for_signup : false,
    providers: { google: providers.some((p) => p.id === 'google') },
  };
}

// Django/allauth email links use query-string tokens (?confirm_email=KEY or
// ?reset_password=KEY), not Netlify's hash-fragment tokens — so this reads
// location.search instead of location.hash.
export async function handleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const confirmKey = params.get('confirm_email');
  const resetKey = params.get('reset_password');
  if (!confirmKey && !resetKey) return null;
  history.replaceState(null, '', window.location.pathname);

  if (resetKey) {
    pendingResetKey = resetKey;
    return { type: 'recovery', user: null };
  }
  const resp = await call('POST', 'auth/email/verify', { key: confirmKey });
  if (resp.status !== 200) throw new AuthError('That link has expired or was already used.');
  notifyFromAuthResponse(resp);
  return { type: 'confirmation', user: mapUser(resp.data.user) };
}

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
