/* Simple offline cache for this static site */
const CACHE_NAME = 'attendance-pwa-v1';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/batches.html',
  '/attendance_sheets.html',
  '/attendance_report.html',
  '/class9.html',
  '/class10.html',
  '/class11.html',
  '/class12.html',
  '/styles.css',
  '/script.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => {
          // Basic fallback for navigation
          if (req.mode === 'navigate') return caches.match('/index.html');
          return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        });
    })
  );
});

