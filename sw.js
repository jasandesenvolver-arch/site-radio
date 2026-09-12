const CACHE_NAME = 'studio-fm-v2026.10';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/stations.js',
  './js/visualizer.js',
  './js/player.js',
  './manifest.json',
  './assets/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass stream audio requests directly through network
  if (event.request.url.includes('stream') || event.request.url.includes('ice1') || event.request.url.includes('zeno')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
