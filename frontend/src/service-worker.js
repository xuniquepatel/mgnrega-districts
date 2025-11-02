self.addEventListener("install", (e) => {
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const cacheFirst =
    url.pathname.startsWith("/api/metrics") ||
    url.pathname.startsWith("/api/compare");
  if (cacheFirst) {
    event.respondWith(
      (async () => {
        const cache = await caches.open("mgnrega-cache-v1");
        const cached = await cache.match(event.request);
        const network = fetch(event.request)
          .then((res) => {
            cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })()
    );
  }
});
