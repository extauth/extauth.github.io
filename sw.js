self.addEventListener('install', (event) => {
  /*event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(resourcesToCache);
    })
  );*/
});

self.addEventListener('fetch', (event) => {
  // Intercept requests and serve from cache if offline
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
