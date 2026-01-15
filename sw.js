const CACHE_NAME = 'qrauth-v1.1.11';
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
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
  );
});
