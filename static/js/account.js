// Learner accounts: Netlify Identity login, progress saved to the account, personal dashboard and verified certificates.
// Runs after the main lab script and uses its globals (RES, XS, S, QZ, cur, upd, go, xWeak, openCert, tEsc…).
import {
  getUser, getSettings, login, signup, logout, oauthLogin, handleAuthCallback,
  requestPasswordRecovery, updateUser, onAuthChange, AUTH_EVENTS, AuthError, MissingIdentityError,
} from './auth.js';

const $ = s => document.querySelector(s);
const csrfToken = () => (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '';
const esc = x => tEsc(String(x ?? ''));
const day = d => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

let user = null, synced = false, timer = null, saveState = '', lastSim = null, myCert = null;
let mode = 'login', flash = null, google = false, signupOff = false, noIdentity = false, authing = false;

// ---------- Saving progress ----------
async function api(path, opt = {}) {
  const r = await fetch(path, { credentials: 'same-origin', ...opt, headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken(), ...opt.headers } });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error(d?.error || 'Request failed'), { status: r.status });
  return d;
}
const body = first => JSON.stringify({ quiz: RES, exam: XS, lastSim: cur, first });
function keepLocal() {
  try { localStorage.setItem('mpq', JSON.stringify(RES)); localStorage.setItem('mpx', JSON.stringify(XS)) } catch (e) {}
}
// Take the merged progress the server sends back. The in-progress exam is only replaced on the first sync,
// so an exam running on this device is never disturbed.
function apply(d, first) {
  for (const k of Object.keys(RES)) delete RES[k];
  Object.assign(RES, d.quiz || {});
  const x = d.exam || {};
  XS.h = x.h || []; XS.t = x.t || {};
  if (first) XS.a = x.a || null;
  if (d.lastSim != null) lastSim = d.lastSim;
  keepLocal(); upd();
}
async function save(first = false) {
  clearTimeout(timer); timer = null;
  if (!user) return;
  status('saving');
  try {
    apply(await api('/api/progress', { method: 'PUT', body: body(first) }), first);
    status('saved');
  } catch (e) {
    status(e.status == 401 ? 'expired' : navigator.onLine ? 'error' : 'offline');
  }
}
// Progress made offline is kept on this device and saved as soon as the connection returns.
addEventListener('online', () => { if (user && synced && (saveState == 'offline' || saveState == 'error')) save() });
window.acPush = () => {
  if (!user || !synced) return;
  clearTimeout(timer); timer = setTimeout(save, 2500); status('pending');
};
addEventListener('pagehide', () => {
  if (!timer) return;
  clearTimeout(timer); timer = null;
  try { fetch('/api/progress', { method: 'PUT', keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: body(false) }) } catch (e) {}
});
function status(s) {
  saveState = s;
  const el = $('#acs');
  if (el) el.innerHTML = statusText();
}
const statusText = () => ({
  saving: '⏳ Saving…', pending: '⏳ Saving…', saved: '✅ All progress saved to your account',
  error: '⚠️ Could not save just now. Your progress is kept on this device and will be saved on the next change.',
  expired: '⚠️ Your session has ended. Log out and back in to keep saving.',
  offline: '📴 You’re offline. Your progress is kept on this device and will be saved to your account when you reconnect.',
}[saveState] || '');

// ---------- Login state ----------
async function onLogin(u) {
  user = u; window.acUser = u; synced = false; upd(); $('#tq').hidden = true; renderBar();
  await save(true);
  synced = true;
  try { myCert = await api('/api/certificate') } catch (e) { myCert = null }
  if ($('#ac').classList.contains('on')) render();
  if ($('#cert').classList.contains('on')) acCert();
}
function clearLocal() {
  for (const k of Object.keys(RES)) delete RES[k];
  XS.h = []; XS.t = {}; XS.a = null; xLast = null;
  try { localStorage.removeItem('mpq'); localStorage.removeItem('mpx') } catch (e) {}
  S.forEach((s, i) => buildQuiz(i)); upd();
}
function onLogout() {
  user = null; window.acUser = null; synced = false; myCert = null; lastSim = null; saveState = '';
  $('#tq').hidden = true; renderBar();
  clearTimeout(timer); timer = null;
  // Clear this device so the next person on a shared computer starts fresh. Progress stays in the account.
  clearLocal();
  $('#cert').classList.remove('on');
  if (typeof xClose == 'function') xClose();
}

// ---------- Persistent "logged in as" bar (always visible, no need to open the dashboard) ----------
const acbar = document.createElement('div');
acbar.id = 'acbar'; acbar.setAttribute('role', 'status'); acbar.hidden = true;
acbar.innerHTML = '<button type=button class=xb id=acbp></button><button type=button class="xb p" id=acbg hidden>⭐ Go Premium</button><button type=button class=xb id=acbo>Log out</button>';
document.body.append(acbar);
function renderBar() {
  if (!user) { acbar.hidden = true; return }
  acbar.hidden = false;
  acbar.querySelector('#acbp').textContent = (window.LAB_CONFIG?.isPremium ? ' ' : '👤 ') + (user.name || user.email);
  acbar.querySelector('#acbg').hidden = !!window.LAB_CONFIG?.isPremium;
}
acbar.querySelector('#acbp').onclick = () => acOpen();
acbar.querySelector('#acbg').onclick = () => window.payOpen && window.payOpen();
acbar.querySelector('#acbo').onclick = async (e) => {
  const b = e.target; b.disabled = true; b.textContent = 'Logging out…'; authing = true;
  if (timer) await save();
  try { await logout() } catch (er) {}
  authing = false; b.disabled = false; b.textContent = 'Log out';
  onLogout(); mode = 'login';
  if ($('#ac').classList.contains('on')) { flash = ['You are logged out. Your progress is saved in your account and this device has been cleared.', 'ok']; render() }
};

// ---------- Panel ----------
const ac = document.createElement('div');
ac.id = 'ac'; ac.setAttribute('role', 'dialog'); ac.setAttribute('aria-label', 'Your account');
ac.innerHTML = '<div class=xi></div>';
document.body.append(ac);
const ai = ac.querySelector('.xi');
window.acOpen = (m) => { if (m) mode = m; tClose(); ac.classList.add('on'); render(); ac.scrollTop = 0 };
const acClose = () => ac.classList.remove('on');
ac.addEventListener('click', e => { if (e.target === ac) acClose() });
addEventListener('keydown', e => { if (e.key == 'Escape' && ac.classList.contains('on')) acClose() });

function render() { user ? dash() : authForm() }

function authForm() {
  const tabs = mode == 'login' || mode == 'signup';
  const head = { login: 'Log in', signup: 'Create your free account', forgot: 'Reset your password', reset: 'Choose a new password' }[mode];
  let f = '';
  if (mode == 'reset') {
    f = '<label>New password<input name=pw type=password minlength=8 required autocomplete=new-password></label><button class="xb p">Save new password</button>';
  } else if (mode == 'forgot') {
    f = '<label>Email<input name=em type=email required autocomplete=email></label><button class="xb p">Send reset link</button><button type=button class=alink data-m=login>← Back to log in</button>';
  } else {
    f = (mode == 'signup' ? '<label>Full name <small>(as it should appear on your certificate)</small><input name=nm required maxlength=60 autocomplete=name></label>' : '')
      + '<label>Email<input name=em type=email required autocomplete=email></label>'
      + '<label>Password' + (mode == 'signup' ? ' <small>(at least 8 characters)</small>' : '') + '<input name=pw type=password ' + (mode == 'signup' ? 'minlength=8 autocomplete=new-password' : 'autocomplete=current-password') + ' required></label>'
      + '<button class="xb p">' + (mode == 'signup' ? 'Create account' : 'Log in') + '</button>'
      + (mode == 'login' ? '<button type=button class=alink data-m=forgot>Forgot your password?</button>' : '');
  }
  ai.innerHTML = '<div class=xh><h2>👤 ' + head + '</h2><button type=button class=xb data-x>Close</button></div>'
    + (tabs ? '<p class=goal>Save your quick-check scores, mock exams and certificate to an account, so your progress follows you to any phone, tablet or computer and is never lost when browser data is cleared. Progress already on this device is added to your account.</p>'
      + '<div class=atab role=tablist><button type=button class=xb role=tab data-m=login aria-selected=' + (mode == 'login') + '>Log in</button>' + (signupOff ? '' : '<button type=button class=xb role=tab data-m=signup aria-selected=' + (mode == 'signup') + '>Create account</button>') + '</div>' : '')
    + (noIdentity ? '<p class="amsg er">Accounts are not available right now. Please try again later.</p>' : '')
    + '<form class=af novalidate>' + f + '<p class=amsg id=am role=status aria-live=polite></p></form>'
    + (tabs && google ? '<div class=af><p class=aor>or</p><button type=button class=xb data-g>Continue with Google</button></div>' : '');
  if (flash) { msg(flash[0], flash[1]); flash = null }
  const form = ai.querySelector('form');
  form.onsubmit = e => { e.preventDefault(); if (form.reportValidity()) submit(form) };
  (form.querySelector('input') || {}).focus?.();
}
function msg(t, kind = 'er') { const m = $('#am'); if (m) { m.className = 'amsg ' + kind; m.textContent = t } }
function authErr(e) {
  if (e instanceof MissingIdentityError) return 'Accounts are not available right now. Please try again later.';
  if (e instanceof AuthError) {
    if (/confirm/i.test(e.message)) return 'Please confirm your email first. Check your inbox for the link we sent.';
    if (e.status == 401 || e.status == 400) return 'Invalid email or password.';
    if (e.status == 403) return 'New sign-ups are closed at the moment.';
    if (e.status == 422) return e.message || 'Please check your details.';
    if (e.status == 429) return 'Too many attempts. Please wait a minute and try again.';
    return e.message;
  }
  return 'Something went wrong. Please check your connection and try again.';
}
async function submit(form) {
  const v = n => form.elements[n]?.value.trim() ?? '';
  const btn = form.querySelector('.xb.p'), label = btn.textContent;
  btn.disabled = true; btn.textContent = 'Please wait…'; msg('', ''); authing = true;
  try {
    if (mode == 'login') {
      await onLogin(await login(v('em'), form.elements.pw.value)); render();
    } else if (mode == 'signup') {
      const u = await signup(v('em'), form.elements.pw.value, { full_name: v('nm') });
      if (u.emailVerified || u.confirmedAt) { await onLogin(u); render() }
      else { mode = 'login'; flash = ['📧 Almost done! We sent a confirmation link to ' + v('em') + '. Click it, and you will be logged in here with your progress saved.', 'ok']; render() }
    } else if (mode == 'forgot') {
      await requestPasswordRecovery(v('em'));
      msg('📧 If an account exists for that email, a reset link is on its way.', 'ok');
    } else if (mode == 'reset') {
      await updateUser({ password: form.elements.pw.value });
      await onLogin(await getUser()); flash = null; render();
    }
  } catch (e) {
    msg(authErr(e));
  } finally {
    authing = false;
    if (btn.isConnected) { btn.disabled = false; btn.textContent = label }
  }
}

// Per-topic accuracy from quick checks and mock exams together.
function topicStats() {
  return S.map((s, t) => {
    let ok = 0, n = 0;
    if (RES[t] != null) { ok += RES[t]; n += QZ[t].length }
    const x = XS.t[t]; if (x) { ok += x[0]; n += x[1] }
    return { t, n, p: n ? ok / n : null };
  });
}
function dash() {
  const ks = Object.keys(RES), n = ks.length, tq = ks.reduce((a, k) => a + QZ[k].length, 0), sc = ks.reduce((a, k) => a + RES[k], 0),
    pc = tq ? Math.round(100 * sc / tq) : 0, ok = n == S.length && pc >= XP, H = XS.h.slice(-10), best = XS.h.length ? Math.max(...XS.h.map(h => h.pc)) : null;
  const T = topicStats(), weak = T.filter(x => x.n && x.p < 1).sort((a, b) => a.p - b.p).slice(0, 5), todo = S.findIndex((s, t) => RES[t] == null);
  const go1 = (t, label) => '<button type=button class=xb data-go=' + t + '>' + label + '</button>';
  const cont = lastSim != null ? lastSim : cur;

  let cert;
  if (myCert) cert = '<p>✅ Verified certificate issued on <b>' + day(myCert.issuedAt) + '</b> to <b>' + esc(myCert.name) + '</b> · score ' + myCert.score + '%<br><small>Certificate ID <b>' + esc(myCert.id) + '</b> · anyone can check it at <a href="' + esc(myCert.url) + '" target=_blank rel=noopener>' + esc(myCert.url.replace(/^https?:\/\//, '')) + '</a></small></p><div class=xh><button type=button class="xb p" data-cert>🎓 View &amp; print certificate</button><button type=button class=xb data-copy>🔗 Copy verification link</button></div>';
  else if (ok) cert = '<p>🎉 You qualify! You finished every quick check with an overall score of <b>' + pc + '%</b>.</p><div class=xh><button type=button class="xb p" data-cert>🎓 Get your verified certificate</button></div>';
  else cert = '<p>' + (n < S.length ? 'Finish <b>' + (S.length - n) + '</b> more quick check' + (S.length - n > 1 ? 's' : '') : 'Raise your overall quick-check score') + ' and reach ' + XP + '% overall to earn a certificate with a unique ID and QR code that employers and CPD bodies can check online.</p>';

  ai.innerHTML = '<div class=xh><h2>👤 My progress</h2><button type=button class=xb data-out>Log out</button><button type=button class=xb data-x>Close</button></div>'
    + '<p class=goal>Logged in as <b>' + esc(user.name || user.email) + '</b>' + (user.name && user.email ? ' (' + esc(user.email) + ')' : '') + '</p>'
    + '<p class=acs id=acs role=status aria-live=polite>' + statusText() + '</p>'
    + '<div class=xh>' + go1(cont, '▶ Continue where you left off: ' + (cont + 1) + '. ' + esc(S[cont].n)) + (todo >= 0 && todo != cont ? go1(todo, 'Next quick check: ' + (todo + 1) + '. ' + esc(S[todo].n)) : '') + '</div>'
    + '<div class=ast><div><b>' + n + '/' + S.length + '</b><small>quick checks done</small></div><div><b>' + (tq ? pc + '%' : '–') + '</b><small>quick-check score</small></div><div><b>' + XS.h.length + '</b><small>mock exams taken</small></div><div><b>' + (best != null ? best + '%' : '–') + '</b><small>best mock exam</small></div></div>'
    + '<h3>Mock exam scores</h3>' + (H.length ? trend(H) : '<p class=goal>No mock exams yet. <button type=button class=alink data-exam>Take your first mock exam</button></p>')
    + '<h3>Topics to work on</h3>' + (weak.length ? '<p class=goal>Weakest first, from your quick checks and mock exams.</p>' + weak.map(x => { const p = Math.round(100 * x.p), col = p >= XP ? '#4ade80' : p >= 50 ? '#fcd034' : '#ff3b30'; return '<div class=xrow><span>' + (x.t + 1) + '. ' + esc(S[x.t].n) + '</span><div class=bar><i style="width:' + Math.max(p, 2) + '%;background:' + col + '"></i></div><b>' + p + '%</b>' + go1(x.t, 'Practise') + '</div>' }).join('') + (weak.length > 1 ? '<div class=xh style="margin-top:10px"><button type=button class=xb data-exam>📝 Mock exam on my weakest topics</button></div>' : '') : '<p class=goal>' + (n || XS.h.length ? 'No weak topics so far. Keep going!' : 'Do a few quick checks and this will show where to focus.') + '</p>')
    + '<h3>🎓 Certificate</h3>' + cert
    + (window.LAB_CONFIG && window.LAB_CONFIG.orgEnrollmentEnabled && !window.LAB_CONFIG.isPremium
      ? '<h3>🏫 Organization code</h3><p class=goal>If your school, hospital or employer has enrolled with us, enter their join code to unlock full access — no payment needed from you.</p><form id=orgf class=xh><input name=code placeholder="ORG-XXXX-XXXX" maxlength=20 style="flex:1"><button type=submit class="xb p">Join</button></form><p class=amsg id=orgm role=status aria-live=polite></p>'
      : '');
}
// Bar per recent exam, with the pass mark as a dashed line.
function trend(H) {
  return '<div class=atr role=img aria-label="Last ' + H.length + ' mock exam scores: ' + H.map(h => h.pc + '%').join(', ') + '. Pass mark ' + XP + '%."><div class=apl style="bottom:' + (18 + XP * 1.2) + 'px"><span>Pass ' + XP + '%</span></div>'
    + H.map(h => '<div class=ab title="' + esc(day(h.d) + ' · ' + h.ok + '/' + h.n + ' · ' + h.m) + '"><span>' + h.pc + '%</span><i style="height:' + Math.max(h.pc, 2) * 1.2 + 'px;background:' + (h.pc >= XP ? '#4ade80' : '#ff3b30') + '"></i><small>' + new Date(h.d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + '</small></div>').join('') + '</div>';
}
ai.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return; const D = b.dataset;
  if (D.x != null) return acClose();
  if (D.m) { mode = D.m; return render() }
  if (D.g != null) { try { oauthLogin('google') } catch (er) { msg(authErr(er)) } return }
  if (D.go != null) { const t = +D.go; acClose(); go(t); tTopic(); cv[t][0].scrollIntoView({ behavior: 'smooth' }); return }
  if (D.exam != null) { acClose(); return xOpen() }
  if (D.cert != null) { acClose(); const ks = Object.keys(RES), tq = ks.reduce((a, k) => a + QZ[k].length, 0); return openCert(tq ? Math.round(100 * ks.reduce((a, k) => a + RES[k], 0) / tq) : 0) }
  if (D.copy != null) { try { await navigator.clipboard.writeText(myCert.url); b.textContent = '✅ Link copied' } catch (er) { prompt('Copy this link:', myCert.url) } return }
  if (D.out != null) {
    b.disabled = true; b.textContent = 'Logging out…'; authing = true;
    if (timer) await save();
    try { await logout() } catch (er) {}
    authing = false; onLogout(); mode = 'login'; flash = ['You are logged out. Your progress is saved in your account and this device has been cleared.', 'ok']; render();
  }
});
ai.addEventListener('submit', async e => {
  const f = e.target.closest('#orgf'); if (!f) return;
  e.preventDefault();
  const code = f.elements.code.value.trim(), m = $('#orgm'), btn = f.querySelector('button');
  if (!code) return;
  btn.disabled = true; m.className = 'amsg'; m.textContent = 'Checking…';
  try {
    const d = await api('/api/payments/org/join', { method: 'POST', body: JSON.stringify({ code }) });
    m.className = 'amsg ok'; m.textContent = '✅ Joined ' + d.organization + ' — reloading…';
    setTimeout(() => location.reload(), 1200);
  } catch (er) {
    m.className = 'amsg er'; m.textContent = er.message || 'Could not join with that code.';
    btn.disabled = false;
  }
});

// ---------- Certificate ----------
const cn = $('#cn'), cvb = $('#cv'), cms = $('#cms'), cvf = $('#cvf');
function showVerified(c) {
  $('#cqr').innerHTML = c.qr;
  $('#cid').textContent = c.id;
  $('#cvu').textContent = c.url.replace(/^https?:\/\//, '').replace(/\?.*/, '');
  $('#csc').textContent = c.score;
  $('#cdt').textContent = 'Issued ' + day(c.issuedAt);
  cvf.hidden = false;
}
// Called whenever the certificate opens. Logged-in learners get a verified, server-issued certificate.
window.acCert = () => {
  cvf.hidden = true; cms.innerHTML = '';
  if (!user) {
    cvb.hidden = true;
    cms.innerHTML = '<button type=button class=alink id=cli>Log in</button> to get a verified certificate with an ID and QR code that employers can check.';
    $('#cli').onclick = () => { $('#cert').classList.remove('on'); acOpen('login') };
    return;
  }
  cvb.hidden = false;
  if (myCert) {
    cn.value = myCert.name; $('#cnm').textContent = myCert.name; showVerified(myCert);
    cvb.textContent = '✏️ Update name'; cvb.disabled = true;
  } else {
    if (!cn.value && user.name) { cn.value = user.name; $('#cnm').textContent = user.name }
    cvb.textContent = '🔒 Issue verified certificate'; cvb.disabled = false;
    cms.textContent = 'Check your name, then issue your verified certificate before printing.';
  }
};
cn.addEventListener('input', () => {
  if (!user || !myCert) return;
  const same = cn.value.trim() == myCert.name;
  cvf.hidden = !same; cvb.disabled = same;
  cms.textContent = same ? '' : 'Click Update name to reissue the certificate with this name before printing.';
});
cvb.onclick = async () => {
  cvb.disabled = true; cms.textContent = 'Issuing…';
  try {
    if (timer) await save();
    myCert = await api('/api/certificate', { method: 'POST', body: JSON.stringify({ name: cn.value }) });
    $('#cnm').textContent = myCert.name; cn.value = myCert.name; showVerified(myCert);
    cvb.textContent = '✏️ Update name';
    cms.textContent = '✅ Verified certificate ready. Print it or save it as a PDF.';
  } catch (e) {
    cvb.disabled = false;
    cms.textContent = e.status == 401 ? 'Your session has ended. Please log in again.' : e.message;
  }
};

// ---------- Nudge to save progress ----------
window.acNudge = () => {
  if (user || noIdentity || sessionStorage.getItem('acn')) return;
  sessionStorage.setItem('acn', 1);
  const t = document.createElement('div');
  t.id = 'acn'; t.setAttribute('role', 'status');
  t.innerHTML = '<b>💾 Save your progress</b><p>Create a free account so your scores follow you to any device and you can earn a verified certificate.</p><div class=xh><button type=button class="xb p" data-a>Create account</button><button type=button class=xb data-c>Not now</button></div>';
  t.onclick = e => { const b = e.target.closest('button'); if (!b) return; t.remove(); if (b.dataset.a != null) acOpen('signup') };
  document.body.append(t);
};

// ---------- Go Premium — one purchase unlocks everything (Paystack) ----------
const PLAN_PRICE = {
  monthly: () => window.LAB_CONFIG?.priceMonthlyGhs,
  six_month: () => window.LAB_CONFIG?.priceSixMonthGhs,
  yearly: () => window.LAB_CONFIG?.priceYearlyGhs,
};
let paystackLoading = null;
function loadPaystack() {
  if (window.PaystackPop) return Promise.resolve();
  if (!paystackLoading) paystackLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v2/inline.js'; s.onload = resolve; s.onerror = reject;
    document.head.append(s);
  });
  return paystackLoading;
}
async function pollPaid(tries = 6) {
  for (let i = 0; i < tries; i++) {
    try { const d = await api('/api/payments/status'); if (d.is_premium) return true } catch (e) {}
    await new Promise(r => setTimeout(r, 1500));
  }
  return false;
}
let subEl = null;
function subModal() {
  if (subEl) return subEl;
  const d = document.createElement('div');
  d.id = 'subm';
  const tutor = window.LAB_CONFIG?.tutorEnabled;
  d.innerHTML = `<div class=xi>
    <div id=subPick>
      <div class=xh><h2>⭐ Go Premium</h2><button type=button class=xb data-close>Close</button></div>
      <h3>What you get</h3>
      <ul class=pf>
        <li>✅ All 34 simulation topics &amp; quick checks</li>
        <li>✅ Full 110-question SPI mock exam</li>
        ${tutor ? '<li>✅ Medprime Physics AI Tutor</li>' : ''}
      </ul>
      <p class=goal>Access runs for the plan you pick below, then simply expires — no auto-charge, no card kept on file.</p>
      <h3>Choose a plan</h3>
      <div class=eqf>
        <button type=button class=xb data-plan=monthly>1 month<br>GHS <span data-p=monthly></span></button>
        <button type=button class=xb data-plan=six_month>6 months<br>GHS <span data-p=six_month></span></button>
        <button type=button class="xb p" data-plan=yearly>12 months<br>GHS <span data-p=yearly></span></button>
      </div>
      <p id=subMsg class=amsg role=status aria-live=polite></p>
    </div>
    <div id=subResult style="display:none">
      <div class=xh><h2 id=subResultTitle>Payment successful</h2></div>
      <p id=subResultMsg></p>
      <button type=button class="xb p" data-continue>Continue to the lab</button>
    </div>
  </div>`;
  d.onclick = (e) => {
    if (e.target.closest('[data-continue]')) { location.reload(); return }
    if (e.target === d || e.target.closest('[data-close]')) { d.classList.remove('on'); return }
    const b = e.target.closest('[data-plan]');
    if (b && !b.disabled) startCheckout(b.dataset.plan, d);
  };
  document.body.append(d);
  subEl = d;
  return d;
}
function openSubModal() {
  const d = subModal();
  d.querySelector('#subPick').style.display = '';
  d.querySelector('#subResult').style.display = 'none';
  d.querySelectorAll('[data-p]').forEach(s => s.textContent = PLAN_PRICE[s.dataset.p]());
  const msg = d.querySelector('#subMsg'); msg.className = 'amsg'; msg.textContent = '';
  d.querySelectorAll('[data-plan]').forEach(b => b.disabled = false);
  d.classList.add('on');
}
function showSubResult(d, ok) {
  d.querySelector('#subPick').style.display = 'none';
  d.querySelector('#subResultTitle').textContent = ok ? '✅ Payment successful' : 'Payment received';
  d.querySelector('#subResultMsg').textContent = ok
    ? 'Premium is unlocked. Continue to pick up right where you left off.'
    : 'It can take a moment to confirm — continue and it should be unlocked shortly. If it isn’t, come back in a minute and check again.';
  d.querySelector('#subResult').style.display = '';
  d.classList.add('on');
}
async function startCheckout(plan, d) {
  const msg = d.querySelector('#subMsg');
  d.querySelectorAll('[data-plan]').forEach(b => b.disabled = true);
  msg.className = 'amsg'; msg.textContent = 'Starting checkout…';
  try {
    const r = await api('/api/payments/initialize', { method: 'POST', body: JSON.stringify({ plan }) });
    await loadPaystack();
    d.classList.remove('on');
    const popup = new window.PaystackPop();
    popup.resumeTransaction(r.access_code, {
      onSuccess: async () => {
        const ok = await pollPaid();
        showSubResult(d, ok);
      },
      onCancel: () => { d.classList.add('on'); d.querySelectorAll('[data-plan]').forEach(b => b.disabled = false); msg.textContent = ''; },
      onError: (err) => alert('Payment error: ' + (err?.message || 'something went wrong on Paystack’s side.')),
    });
  } catch (e) {
    d.classList.add('on');
    d.querySelectorAll('[data-plan]').forEach(b => b.disabled = false);
    msg.className = 'amsg er'; msg.textContent = e.message || 'Could not start checkout. Please try again in a moment.';
  }
}
window.payOpen = () => {
  if (!user) { acOpen('signup'); flash = ['Create a free account, then come back to go Premium.', 'ok']; return }
  openSubModal();
};

// ---------- Start ----------
(async () => {
  try {
    const cb = await handleAuthCallback();
    if (cb?.type == 'recovery') { mode = 'reset'; flash = ['Choose a new password for your account.', 'ok'] }
    else if (cb?.type == 'confirmation') flash = ['✅ Email confirmed. Welcome to your account!', 'ok'];
  } catch (e) {
    flash = [e instanceof AuthError ? 'That link has expired or was already used. Please try again.' : authErr(e)];
    mode = 'login';
  }
  getSettings().then(s => { google = !!s.providers?.google; signupOff = !!s.disableSignup }).catch(e => { if (e instanceof MissingIdentityError) noIdentity = true });
  const u = await getUser();
  if (u && mode != 'reset') await onLogin(u);
  else upd();
  if (mode == 'reset' || flash) acOpen();
  onAuthChange((ev, u2) => {
    if (authing) return;
    // Keep other open tabs in step.
    if (ev == AUTH_EVENTS.LOGOUT && user) { onLogout(); if (ac.classList.contains('on')) render() }
    if (ev == AUTH_EVENTS.LOGIN && !user && u2 && mode != 'reset') onLogin(u2).then(() => ac.classList.contains('on') && render());
  });
})();
