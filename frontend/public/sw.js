const CACHE_NAME = 'zemam-driver-pwa-v4';
const STATIC_ASSETS = [
  '/driver',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/landing/zimam-official-emblem.png',
];

// Install: Pre-cache critical assets including Driver App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll non-fatal warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean older caches immediately
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
    })
  );
  self.clients.claim();
});

// Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-http requests and chrome extensions
  if (!url.protocol.startsWith('http')) return;

  // Next.js hot module reloading (HMR) bypass in development
  if (url.pathname.includes('webpack-hmr')) return;

  // Socket.io polling or websocket requests bypass service worker
  if (url.pathname.includes('/socket.io/')) return;

  // 1. Next.js Static Assets (hashed JS chunks, CSS, fonts) -> Cache-First
  // This allows the full React/Next.js application UI to load even when 100% offline
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cached || Response.error());
      })
    );
    return;
  }

  // 2. API Requests: Network-first, fallback to cache for GET
  if (url.pathname.startsWith('/api/')) {
    if (request.method !== 'GET') {
      return;
    }
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 3. Static images and icons: Cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => null);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. HTML Page Navigation: Network-First with App Shell Cache Fallback
  // If offline, serve cached /driver shell instead of generic offline.html!
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // A. Try exact URL match in cache
          const cachedExact = await caches.match(request);
          if (cachedExact) return cachedExact;

          // B. Fallback to /driver app shell
          const cachedDriver = await caches.match('/driver');
          if (cachedDriver) return cachedDriver;

          // C. If completely unavailable, show offline.html
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // 5. Default fallback: Try network, then cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
