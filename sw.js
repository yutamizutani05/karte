/* カルテ Service Worker — offline app shell.
   Customer data lives in IndexedDB, never in this cache.
   Bump CACHE when shipping changes to the shell. */
const CACHE = 'karte-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  // Page: answer from cache at once (works offline), refresh the cache in the background
  // so the next launch picks up a new version.
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(CACHE).then(c =>
      c.match('./index.html').then(hit => {
        const net = fetch(req).then(res => {
          if (res.ok) c.put('./index.html', res.clone());
          return res;
        });
        if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
        return net;
      })
    ));
    return;
  }

  // Everything else: cache-first.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
