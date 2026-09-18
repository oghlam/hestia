// HESTIA PWA Service Worker
const CACHE_NAME = 'hestia-pwa-v5-splash-transparent';
const STATIC_ASSETS = [
  '/',
  '/?view=validator',
  '/manifest.json',
  '/logo/hestia_logo_full.png',
  '/logo/hestia_logo_primary.png',
  '/logo/hestia_pwa_192.png',
  '/logo/hestia_pwa_512.png',
  '/logo/hestia_maskable_192.png',
  '/logo/hestia_maskable_512.png',
  '/logo/hestia_apple_180.png',
  '/logo/hestia_favicon_32.png',
  '/logo/hestia_splash_transparent.png',
  '/logo/hestia_topbar_80.png',
  '/avatar/default.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Do not cache API endpoints or dynamic webhook feeds
  if (event.request.url.includes('/api/') || event.request.url.includes('/webhooks/') || event.request.url.includes('/health')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch update in background for next time
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/?view=validator') || caches.match('/');
        }
      });
    })
  );
});
