// sw.js

const CACHE_NAME = 'wow-quotes-cache-v1'; // Updated cache name for clarity, new version
const URLS_TO_PRECACHE = [
  '/',                        // For accessing the root
  'index.html',
  'app.js',
  'style.css',
  'manifest.json',            // manifest.json is in the root

  // JSON data files in 'data/' folder
  'data/categories.json',
  'data/good_vibes.json',
  'data/quotes_inspiration.json',

  // Icons from 'assets/' folder
  'assets/badge-72x72.png',
  'assets/icon-96x96.png',

  // Main PWA icons from 'images/' folder (using your naming convention)
  // **ACTION: Verify these filenames and add/remove to match your actual files**
  'images/android-chrome-144x144.png', // Example, if you have it
  'images/android-chrome-192x192.png',
  'images/android-chrome-384x384.png', // Example, if you have it
  'images/android-chrome-512x512.png',
  // Add other PWA icons from 'images/' folder if you precache them
  // 'images/apple-touch-icon.png',
  // 'images/favicon-32x32.png',
  // 'images/favicon.ico', // Often good to precache

  // **ACTION: Add your .mp3 sound effect file paths from 'assets/' folder below**
  // 'assets/chime-gen-quote.mp3', // Example: Replace with actual filename(s)
  // 'assets/ui-save-fav.mp3', // Example: Add all necessary sound files

  // Optional: Add an offline fallback page
  // 'offline.html'
];

// Install event: precache app shell
self.addEventListener('install', event => {
  console.log(`Service Worker (${CACHE_NAME}): Installing...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`Service Worker (${CACHE_NAME}): Caching app shell files.`);
        const stack = [];
        URLS_TO_PRECACHE.forEach(url => {
          stack.push(
            fetch(url, { cache: 'reload' })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${response.url} for precache. Status: ${response.status}`);
                }
                if (response.status === 206) {
                  console.warn(`Service Worker (${CACHE_NAME}): Skipped caching partial content (206) for ${response.url} during install.`);
                  throw new Error(`Attempted to precache a partial response (206) for ${response.url}.`);
                }
                return cache.put(url, response);
              })
              .catch(error => {
                console.error(`Service Worker (${CACHE_NAME}): Failed to cache ${url} during install:`, error);
                throw error;
              })
          );
        });
        return Promise.all(stack);
      })
      .then(() => {
        console.log(`Service Worker (${CACHE_NAME}): App shell cached successfully.`);
        return self.skipWaiting();
      })
      .catch(error => {
        console.error(`Service Worker (${CACHE_NAME}): App shell caching failed during install:`, error);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  console.log(`Service Worker (${CACHE_NAME}): Activating...`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Service Worker (${CACHE_NAME}): Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`Service Worker (${CACHE_NAME}): Activated and old caches cleaned.`);
      return self.clients.claim();
    })
  );
});

// Fetch event: Cache-First for precached, Network-First for others (Stale-While-Revalidate like behavior for cached items)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request)
        .then(cachedResponse => {
          // Fetch from network in parallel to update cache (Stale-While-Revalidate part)
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              if (networkResponse) {
                if (networkResponse.ok && networkResponse.status !== 206) {
                  const responseToCache = networkResponse.clone();
                  cache.put(event.request, responseToCache)
                    .catch(err => {
                      console.warn(`Service Worker (${CACHE_NAME}): Failed to cache ${event.request.url} after network fetch:`, err);
                    });
                } else if (networkResponse.status === 206) {
                  console.warn(`Service Worker (${CACHE_NAME}): Received 206 (Partial Content) for ${event.request.url}. Not caching.`);
                }
                return networkResponse; // Return the network response
              }
              // If fetch itself fails (e.g., network error but not an HTTP error status)
              throw new Error('Network request failed to produce a response.');
            });

          // If a cached response exists, return it immediately.
          if (cachedResponse) {
            // console.log(`Service Worker (${CACHE_NAME}): Serving from cache: ${event.request.url}`);
            return cachedResponse;
          }

          // If no cached response, wait for the network response.
          return fetchPromise.catch(error => {
            console.warn(`Service Worker (${CACHE_NAME}): Network request failed for ${event.request.url}. Error: ${error.message}`);
            if (event.request.mode === 'navigate' && event.request.headers.get('accept').includes('text/html')) {
              // return caches.match('/offline.html'); // Ensure 'offline.html' is in URLS_TO_PRECACHE
            }
            return new Response('Network error and resource not found in cache.', {
              status: 408,
              statusText: 'Network error and resource not found in cache.',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        });
    })
  );
});

// Listen for messages from client to skip waiting and activate new SW
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log(`Service Worker (${CACHE_NAME}): Received SKIP_WAITING message. Skipping wait.`);
    self.skipWaiting();
  }
});
