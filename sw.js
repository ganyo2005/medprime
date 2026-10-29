// Offline support for the Ultrasound Physics Lab.
// The app shell is stored on install so the simulations, quizzes and exam open without a connection.
// Pages, styles and scripts are fetched fresh when online (cheap 304s from the CDN) and fall back to the
// stored copy when offline or on a very slow connection. Images are served from the store and refreshed
// in the background. API calls, Identity and form posts always go to the network.
const VERSION = 'v5';
const CACHE = `lab-${VERSION}`;
const SHELL = [
  '/', '/static/css/app.css', '/static/js/visits.js', '/static/js/lab-helpers.js', '/static/js/app.js', '/static/js/account.js', '/static/js/auth.js',
  '/static/img/logo.png', '/static/img/tutor.jpg', '/static/img/icon-192.png', '/static/manifest.webmanifest',
];
const SLOW_MS = 4000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('lab-') && k != CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const store = async (req, res) => {
  if (res.ok && res.type == 'basic') (await caches.open(CACHE)).put(req, res.clone());
  return res;
};

// Network first, with the stored copy as the fallback.
async function fresh(req, nav) {
  const net = fetch(req).then(res => store(req, res));
  const slow = new Promise(r => setTimeout(r, SLOW_MS));
  const cached = () => caches.match(req, { ignoreSearch: nav }).then(r => r || (nav ? caches.match('/') : undefined));
  try {
    const res = await Promise.race([net, slow.then(async () => (await cached()) || net)]);
    if (res) return res;
  } catch (e) {}
  return (await cached()) || net.catch(() => new Response('You’re offline and this page hasn’t been saved yet.', {
    status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  }));
}

// Stored copy first, refreshed in the background.
async function stale(req) {
  const net = fetch(req).then(res => store(req, res));
  const hit = await caches.match(req);
  if (hit) { net.catch(() => {}); return hit }
  return net;
}

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method != 'GET' || url.origin != location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_allauth/') || url.pathname.startsWith('/accounts/') || url.pathname.startsWith('/__ADMIN_URL__') || url.pathname == '/sw.js') return;
  if (url.pathname.startsWith('/static/img/')) return e.respondWith(stale(req));
  e.respondWith(fresh(req, req.mode == 'navigate'));
});
