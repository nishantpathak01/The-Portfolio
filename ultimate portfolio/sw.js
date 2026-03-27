const CACHE_NAME = 'cv-offline-cache-v1';
const CV_URL = './assets/cv/resume_image.jpg';

// Install phase: Cache the CV immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache to store static assets (CV).');
      // Using Request to suppress errors if offline locally
      return cache.add(new Request(CV_URL, { cache: 'reload' })).catch(err => console.warn('Failed to cache CV during install:', err));
    })
  );
  self.skipWaiting();
});

// Activate phase: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch phase: Serve from cache if offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('Shubham_Singh_CV.pdf')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached file, or fetch from network if missing
        return cachedResponse || fetch(event.request);
      }).catch(() => {
        return new Response('CV is currently unavailable offline.');
      })
    );
  }
});
