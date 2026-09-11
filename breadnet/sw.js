//sw.js
const CACHE_NAME = 'breadnet-v5';
const DYNAMIC_CACHE = 'breadnet-dynamic-v5';
//Incrementar en cada update!!

const STATIC_ASSETS = [
  '/breadnet/',
  '/breadnet/index.html',
  '/breadnet/styles.css',
  '/breadnet/app.js',
  '/breadnet/reset-password.html',
  '/breadnet/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  if (
    e.request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request).then((cachedResponse) => {
          return cachedResponse || Promise.reject('No network connection | No cache available');
        });
      })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});