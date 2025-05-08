// sw.js

const CACHE_NAME = 'wow-quotes-cache-v1';
const ASSETS = [
  '/',                // your index.html
  '/index.html',
  '/style.css',       // main stylesheet
  '/app.js',          // your app logic
  // any JSON you load dynamically
  '/quotes_inspiration.json',
  '/quotes_motivation.json',
  '/quotes_positive_thinking.json',
  '/affirmations.json',
  '/categories.json',
];

// Install: cache all the core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first, then cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // put a copy in cache for next time
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

