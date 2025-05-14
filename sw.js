// sw.js

const CACHE_NAME = 'quotes-app-cache-v3'; // Incremented version for new structure
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

  // Main PWA icons from 'images/' folder
  'images/icon-128x128.png', // Assuming you have these based on manifest
  'images/icon-144x144.png',
  'images/icon-152x152.png',
  'images/icon-192x192.png',
  'images/icon-384x384.png',
  'images/icon-512x512.png',

  // **ACTION: Add your .mp3 sound effect file paths from 'assets/' folder below**
  // 'assets/click-sound1.mp3', // Example: Replace with actual filename(s)
  // 'assets/another-sound.mp3', // Example: Add all necessary sound files

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
            fetch(url, { cache: 'reload' }) // {cache: 'reload'} bypasses HTTP cache for these requests
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${response.url} for precache. Status: ${response.status}`);
                }
                if (response.status === 206) {
                  console.warn(`Service Worker (${CACHE_NAME}): Skipped caching partial content (206) for ${response.url} during install. This is usually an error for precaching.`);
                  throw new Error(`Attempted to precache a partial response (206) for ${response.url}.`);
                }
                return cache.put(url, response);
              })
              .catch(error => {
                console.error(`Service Worker (${CACHE_NAME}): Failed to cache ${url} during install:`, error);
                throw error; // Propagate error to fail SW installation if any asset fails
              })
          );
        });
        return Promise.all(stack);
      })
      .then(() => {
        console.log(`Service Worker (${CACHE_NAME}): App shell cached successfully.`);
        return self.skipWaiting(); // Activate new SW immediately
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
      return self.clients.claim(); // Take control of all open clients
    })
  );
});

// Fetch event: Cache-First for precached, Network-First for others
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return; // Ignore non-GET requests and non-http/https requests
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            if (cachedResponse.status === 206) {
                console.warn(`Service Worker (${CACHE_NAME}): Serving 206 from cache: ${event.request.url}. Attempting network update for this resource.`);
                // Fall through to network to try and get a fresh full copy for this specific resource
            } else {
                // console.log(`Service Worker (${CACHE_NAME}): Serving from cache: ${event.request.url}`);
                return cachedResponse; // Serve from cache if valid
            }
          }

          // Not in cache or was a 206, so fetch from network
          return fetch(event.request)
            .then(networkResponse => {
              if (networkResponse) {
                if (networkResponse.ok && networkResponse.status !== 206) {
                  const responseToCache = networkResponse.clone();
                  cache.put(event.request, responseToCache)
                    .catch(err => {
                      console.warn(`Service Worker (${CACHE_NAME}): Failed to cache ${event.request.url} after network fetch:`, err);
                    });
                } else if (networkResponse.status === 206) {
                  console.warn(`Service Worker (${CACHE_NAME}): Received 206 (Partial Content) for ${event.request.url}. Serving from network WITHOUT caching it.`);
                }
                return networkResponse;
              }
              throw new Error('Network fetch returned no response.');
            })
            .catch(error => {
              console.warn(`Service Worker (${CACHE_NAME}): Network request failed for ${event.request.url}. Error: ${error.message}`);
              // If it was a cached item (meaning cachedResponse existed but was 206), and network fails,
              // it's better to return the stale 206 than nothing, if absolutely necessary,
              // but typically this part of the logic implies cachedResponse was null or we decided to bypass it.
              // So, if network fails and we are here, it means no valid cache hit.
              if (cachedResponse && cachedResponse.status === 206) {
                  console.warn(`Service Worker (${CACHE_NAME}): Network update failed for 206 resource ${event.request.url}. Serving stale 206 from cache.`);
                  return cachedResponse; // Serve the stale 206 as a last resort if it was the item being updated.
              }

              // Fallback for navigation requests
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
