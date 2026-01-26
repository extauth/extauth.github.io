const CACHE_NAME = 'qrauth-v1.3.5';
const ASSETS = [
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon.svg',
  "./frw/bootstrap.min.css",
  "./frw/jquery.min.js",
  "./frw/bootstrap.bundle.min.js",
  "./frw/age.min.js",
  "./frw/qrcode.min.js",
  "./frw/qr-scanner.legacy.min.js",
  "./frw/totp.js",
  "./qrauth.js"
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME)
                return caches.delete(cacheName);
            })
        );
      }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
if (event.request.url.startsWith('http://10.'))
    return;
  event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
  );
});
