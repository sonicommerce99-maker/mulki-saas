// Service Worker for Mahfadati PropTech PWA
const CACHE_NAME = 'mahfadati-proptech-v15';

// Only lightweight static assets
const STATIC_ASSETS = [
  '/manifest.json?v=15',
  '/portfolio-logo.jpg?v=15',
  '/pwa-192x192.png?v=15',
  '/pwa-512x512.png?v=15',
  '/apple-touch-icon.png?v=15'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => caches.match(event.request))
  );
});
