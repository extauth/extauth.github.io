const CACHE_NAME = 'v.1.3.9';
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
      }).then(() => self.clients.claim())
  );
});
