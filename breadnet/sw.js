const CACHE_NAME = 'breadnet-v3';
const DYNAMIC_CACHE = 'breadnet-dynamic-v3';
//Incrementar en cada update!!

// basic
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
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(e.request.url, networkResponse.clone());
          return networkResponse;
        });
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
    })
  );
});