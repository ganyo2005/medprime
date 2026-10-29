// Preview renderer for the AI topic-authoring staff page. This is the only
// place generated code is executed before a draft is approved — there is no
// server-side JS execution available on this host, so this IS the smoke test.
// Containment: new Function(...) (not eval) only ever sees its own params
// plus the real globals from lab-helpers.js; a compile error is caught at
// construction, a runtime error is caught inside this pane's own rAF tick and
// only stops that one pane's animation — it can never reach the production
// page (different file, different canvas, never merged into app.js's arrays).

const _loadedPreviews = new Set();

function compileTopic(dt) {
  try {
    const d = new Function('c', 't', 'v', dt.d);
    const o = new Function('v', dt.o);
    return { d, o };
  } catch (e) {
    return { compileError: e.message };
  }
}

function showPaneError(pane, msg) {
  let err = pane.querySelector('.previewerr');
  if (!err) { err = document.createElement('div'); err.className = 'previewerr'; pane.prepend(err); }
  err.textContent = msg;
}

function buildPreviewControls(pane, ctl) {
  const v = {};
  const wrap = pane.querySelector('.ctl');
  wrap.innerHTML = '';
  (ctl || []).forEach(k => {
    const w = document.createElement('div');
    if (Array.isArray(k[2])) {
      w.innerHTML = `<label>${k[1]}</label><select>${k[2].map((o, j) => `<option value=${j}>${o}</option>`).join('')}</select>`;
      const el = w.querySelector('select');
      v[k[0]] = k[3]; el.value = k[3];
      el.onchange = () => v[k[0]] = +el.value;
    } else {
      w.innerHTML = `<label>${k[1]} <b></b></label><input type=range min=${k[3]} max=${k[4]} step=${k[6]} value=${k[5]}>`;
      const el = w.querySelector('input'), o = w.querySelector('b');
      const u = () => { v[k[0]] = +el.value; o.textContent = el.value + ' ' + k[2] };
      el.oninput = u; u();
    }
    wrap.append(w);
  });
  return v;
}

function buildPreviewQuiz(pane, quiz, explanations) {
  const wrap = pane.querySelector('.quiz');
  wrap.innerHTML = '<h4>📝 Quiz preview — click an answer to check it</h4>';
  (quiz || []).forEach((q, qi) => {
    const d = document.createElement('div'); d.className = 'q';
    d.innerHTML = '<p>' + (qi + 1) + '. ' + q[0] + '</p>';
    q[1].forEach((choice, k) => {
      const b = document.createElement('button');
      b.textContent = choice;
      b.onclick = () => {
        if (d.dataset.answered) return;
        d.dataset.answered = '1';
        d.querySelectorAll('button').forEach((btn, j) => { btn.className = j === q[2] ? 'good' : (j === k ? 'bad' : '') });
        const ex = document.createElement('p');
        ex.style.color = '#4ade80';
        ex.textContent = '💡 ' + (explanations[qi] || '');
        d.append(ex);
      };
      d.append(b);
    });
    wrap.append(d);
  });
}

function startPreview(pane, dt) {
  const { d, o, compileError } = compileTopic(dt);
  if (compileError) { showPaneError(pane, 'Code failed to compile: ' + compileError); return; }

  const canvas = pane.querySelector('canvas'), c = canvas.getContext('2d'), out = pane.querySelector('.out');
  const v = buildPreviewControls(pane, dt.ctl);
  buildPreviewQuiz(pane, dt.quiz, dt.quiz_explanations);

  function tick(ms) {
    try {
      c.clearRect(0, 0, W, H);
      d(c, ms / 1000, v);
      out.innerHTML = o(v).map(([a, b]) => `<div>${a}<b>${b}</b></div>`).join('');
      requestAnimationFrame(tick);  // only reached on success — one throw stops only this pane
    } catch (err) {
      showPaneError(pane, 'This topic crashed while running: ' + err.message);
    }
  }
  requestAnimationFrame(tick);
}

async function togglePreview(id) {
  const pane = document.getElementById('preview-' + id);
  pane.classList.toggle('on');
  if (!pane.classList.contains('on') || _loadedPreviews.has(id)) return;
  _loadedPreviews.add(id);
  const loading = document.createElement('div');
  loading.className = 'loadmsg'; loading.innerHTML = '<span class=spin></span>Loading preview…';
  pane.prepend(loading);
  try {
    const r = await fetch(pane.dataset.url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const dt = await r.json();
    loading.remove();
    startPreview(pane, dt);
  } catch (e) {
    loading.remove();
    showPaneError(pane, 'Could not load this draft: ' + e.message);
  }
}

document.querySelectorAll('[data-preview-toggle]').forEach(btn => {
  btn.onclick = () => togglePreview(btn.dataset.id);
});

// Plain form POST (full page reload) — the loading state just needs to stay
// visible until the response arrives, so disabling + relabeling on submit is
// enough; no fetch/AJAX needed here.
const genForm = document.getElementById('genForm');
if (genForm) {
  genForm.addEventListener('submit', () => {
    const btn = document.getElementById('genBtn'), msg = document.getElementById('genMsg');
    btn.disabled = true; btn.textContent = '⏳ Generating…';
    msg.className = 'meta loadmsg';
    msg.innerHTML = '<span class=spin></span>Calling Claude — this can take up to a minute, please wait…';
  });
}
