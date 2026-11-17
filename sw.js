// Offline cache for Калькулятор lango.show. New version is picked up on the next launch after an update.
const CACHE = 'lango-calc-3431a105';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const u = new URL(req.url), isApp = /\/(index\.html)?$/.test(u.pathname);
    if (req.mode === 'navigate' && !isApp) { const r = await fetch(req).catch(() => null); return r || await c.match(req, {ignoreSearch: true}) || new Response('Нет сети', {status: 503}); }
    const hit = await c.match(req, {ignoreSearch: true}) || (req.mode === 'navigate' ? await c.match('./index.html') : null);
    const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || new Response('Нет сети', {status: 503});
  }));
});
