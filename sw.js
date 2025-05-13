// sw.js
const CACHE_VERSION = 'v5-wow'; // Increment this to force updates for users
const CACHE_NAME = `wow-quotes-cache-${CACHE_VERSION}`;

// IMPORTANT: Ensure all these paths are correct relative to the root of your domain.
// Based on your screenshot, 'assets', 'data', 'images' are top-level folders.
const PRECACHE_ASSETS = [
  '/', // Alias for index.html
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',

  // Core PWA Icons from /assets/ (as per your manifest and file structure)
  '/assets/android-chrome-192x192.png',
  '/assets/android-chrome-512x512.png',
  '/assets/apple-touch-icon.png',
  '/assets/favicon-32x32.png',
  '/assets/favicon-16x16.png',
  '/assets/favicon.ico',

  // Notification related images (Ensure these exist in /assets/)
  '/assets/badge-72x72.png',    // Example for notification badge
  '/assets/icon-96x96.png',      // Example for notification icon

  // Your Data files from /data/ (as per your categories.json and file structure)
  '/data/categories.json',
  '/data/quotes_inspiration.json',
  '/data/quotes_motivation.json',
  '/data/quotes_positive_thinking.json',
  '/data/quotes_happiness.json',
  '/data/quotes_love.json',
  '/data/quotes_gratitude.json',
  '/data/quotes_resilience.json',
  '/data/quotes_courage.json',
  '/data/quotes_change.json',
  '/data/quotes_life_lessons.json',
  '/data/quotes_dreams.json',
  '/data/quotes_kindness.json',
  '/data/quotes_beauty.json',
  '/data/quotes_wisdom.json',
  '/data/quotes_sufi_wisdom.json',
  '/data/quotes_truth.json',
  '/data/quotes_time.json',
  '/data/quotes_mortality.json',
  '/data/quotes_freedom.json',
  '/data/quotes_society.json',
  '/data/quotes_learning.json',
  '/data/quotes_simplicity.json',
  '/data/quotes_self_care.json',
  '/data/quotes_mindfulness.json',
  '/data/quotes_self_knowledge.json',
  '/data/quotes_innerpeace.json',
  '/data/quotes_spirituality.json',
  '/data/quotes_perseverance.json',
  '/data/quotes_urdu_aqwal.json',
  '/data/quotes_urdu_ashaar.json',
  '/data/affirmations.json',
  '/data/good_vibes.json',
  '/data/words.json',

  // Your Audio Assets from /assets/
  '/assets/chime-gen-quote.mp3',
  '/assets/ui-save-fav.mp3',

  // Any other critical local assets (e.g., from /images/ if used directly and critically)
  '/images/app_logo.png' // If this is the logo used for OG tags and it's local
];

self.addEventListener('install', event => {
  console.log('[SW] Install event for version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching assets:', PRECACHE_ASSETS.length, 'files');
        // Add assets one by one to identify problematic ones if addAll fails
        const promises = PRECACHE_ASSETS.map(assetUrl => {
          return cache.add(assetUrl).catch(err => {
            console.error(`[SW] Failed to cache ${assetUrl}:`, err);
            // Optionally, throw err to make the entire install fail, or just log and skip
          });
        });
        return Promise.all(promises);
      })
      .then(() => {
        console.log('[SW] Precache complete, activating new SW version.');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Precaching failed catastrophically:', error);
        // If precaching fails, the SW might not install correctly.
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activate event for version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('wow-quotes-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('[SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] Old caches cleaned up, claiming clients.');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') {
    return;
  }

  // Strategy: Stale-while-revalidate for assets expected to be in cache.
  if (PRECACHE_ASSETS.includes(url.pathname) || url.pathname.endsWith('.json') && url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Strategy: Cache-first for images from origin.
  if (req.destination === 'image' && url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
    return;
  }
  
  // Strategy: Network-first for other requests from origin
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(req));
    return;
  }

  // For cross-origin requests (like CDNs), try cache then network.
  // Be cautious with opaque responses from CDNs if you cache them without 'cors' mode.
  event.respondWith(
    caches.match(req).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(req).then(networkResponse => {
        // Optionally cache CDN assets here if needed, but ensure CORS headers allow it.
        // if (networkResponse.ok && (url.href.includes('cdnjs.cloudflare.com') || url.href.includes('fonts.gstatic.com'))) {
        //   const cache = await caches.open(CACHE_NAME);
        //   cache.put(req, networkResponse.clone());
        // }
        return networkResponse;
      }).catch(() => {
         console.warn(`[SW] Cross-origin fetch failed for: ${req.url}`);
         // No generic offline fallback here for cross-origin, browser will handle.
      });
    })
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponsePromise = cache.match(request);
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      } else if (response.status === 404) {
        console.warn(`[SW] SWR: Resource not found (404) on network for ${request.url}. Using cache if available.`);
      }
      return response;
    })
    .catch(async (err) => { // Changed to async to allow await inside
      console.warn(`[SW] SWR: Network fetch failed for ${request.url}:`, err);
      const cached = await cachedResponsePromise; // Ensure we use the initially fetched cached response
      if (cached) return cached;
      // If both network and cache fail for a precached asset, it's a problem.
      // For navigation, networkFirst already handles /index.html fallback.
      // For other assets, you might return a specific placeholder or re-throw.
      console.error(`[SW] SWR: Both network and cache failed for ${request.url}`);
      // Return a synthetic error response or undefined to let browser handle
      return new Response("Network error and no cache match", { status: 503, statusText: "Service Unavailable" });
    });

  const cachedResponse = await cachedResponsePromise;
  return cachedResponse || networkResponsePromise;
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn(`[SW] CacheFirst: Network fetch failed for ${request.url}`, error);
    // Consider returning a placeholder for images if you have one in PRECACHE_ASSETS
    // return caches.match('/assets/offline-placeholder.png'); 
    throw error;
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    } else if (response.status === 404) {
        console.warn(`[SW] NetworkFirst: Resource not found (404) on network for ${request.url}. Trying cache.`);
    }
    return networkResponse;
  } catch (error) {
    console.warn(`[SW] NetworkFirst: Network fetch failed for ${request.url}`, error);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    if (request.mode === 'navigate') {
      console.log('[SW] NetworkFirst: Falling back to /index.html for navigation.');
      return caches.match('/'); // Ensure '/' is in PRECACHE_ASSETS
    }
    // Return a synthetic error response or undefined
    return new Response("Network error and no cache match for navigation", { status: 503, statusText: "Service Unavailable" });
  }
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING message received, skipping wait.');
    self.skipWaiting();
  }
});

self.addEventListener('push', event => {
  console.log('[SW] Push Received.');
  let pushData = {
    title: 'Words of Wisdom',
    body: 'A new insight awaits you!',
    icon: '/assets/icon-96x96.png', // Default icon (ensure this exists)
    badge: '/assets/badge-72x72.png', // Default badge (ensure this exists)
    tag: 'wow-quote-update',
    url: '/'
  };

  if (event.data) {
    try {
      const eventData = event.data.json();
      pushData = { ...pushData, ...eventData };
    } catch (e) {
      console.error('[SW] Push event data is not valid JSON:', event.data.text(), e);
      pushData.body = event.data.text();
    }
  }

  const options = {
    body: pushData.body,
    icon: pushData.icon,
    badge: pushData.badge,
    tag: pushData.tag,
    renotify: true,
    data: {
      url: pushData.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(pushData.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click Received.');
  event.notification.close();

  const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(urlToOpen, self.location.origin);
        if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
