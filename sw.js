/* NoteTime offline support: keeps the app working without a connection. */
const VERSION = 'notetime-1.0.3';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'js/standalone.js', 'js/math.js', 'js/app.js', 'js/ink.js', 'js/io.js', 'js/share.js', 'js/extras.js', 'js/updates.js',
  'img/logo-128.png', 'img/logo-256.png', 'img/icon-192.png', 'img/icon-512.png', 'img/apple-touch-icon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'api.anthropic.com') return; // never cache AI requests
  const sameOrigin = url.origin === self.location.origin;
  const cdn = /^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)$/.test(url.hostname);
  if (!sameOrigin && !cdn) return;
  // app files: network first so updates arrive, cache as fallback for offline use
  if (sameOrigin){
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  // fonts and libraries: cache first
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok || res.type === 'opaque'){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)) } return res })));
});
