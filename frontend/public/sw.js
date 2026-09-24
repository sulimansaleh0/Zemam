const CACHE_NAME = 'zemam-driver-pwa-v2';
const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install: Cache critical assets
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

  // Ignore non-http requests and chrome-extension
  if (!url.protocol.startsWith('http')) return;

  // Next.js chunks, HMR, and build files must ALWAYS bypass Service Worker in development
  if (url.pathname.startsWith('/_next/')) return;

  // Socket.io polling or websocket requests bypass service worker
  if (url.pathname.includes('/socket.io/')) return;

  // API Requests: Network-first, fallback to cache for GET
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

  // Static images and icons: Cache-first
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

  // HTML Page Navigation: Network-first, fallback to /offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Default fallback: Try network
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
