// Offline cache for Калькулятор lango.show.
// The app page is network-first (bypassing the HTTP cache), so a new version shows on the next launch; offline it opens from the cache.
const CACHE = 'lango-calc-bbec61a0';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const timeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const u = new URL(req.url), isApp = /\/(index\.html)?$/.test(u.pathname);
    if (req.mode === 'navigate' && !isApp) { const r = await fetch(req).catch(() => null); return r || await c.match(req, {ignoreSearch: true}) || new Response('Нет сети', {status: 503}); }
    if (isApp){
      const net = fetch(new Request(u.pathname.endsWith('/') ? u.pathname : u.pathname, {cache: 'no-cache'})).then(r => { if (r && r.ok) c.put('./index.html', r.clone()); return r && r.ok ? r : null; }).catch(() => null);
      return (await timeout(net, 3000)) || await c.match('./index.html') || (await net) || new Response('Нет сети', {status: 503});
    }
    const hit = await c.match(req, {ignoreSearch: true});
    const net = fetch(req, {cache: 'no-cache'}).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || new Response('Нет сети', {status: 503});
  }));
});
