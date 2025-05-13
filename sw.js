// sw.js
const CACHE_VERSION = 'v4-wow'; // Increment this to force updates
const CACHE_NAME = `wow-quotes-cache-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/', // Alias for index.html
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json', // For PWA
  // Core PWA Icons (assuming they are in /assets/ and referenced in manifest.json)
  '/assets/android-chrome-192x192.png',
  '/assets/android-chrome-512x512.png',
  '/assets/apple-touch-icon.png',
  '/assets/favicon-32x32.png',
  '/assets/favicon-16x16.png',
  '/assets/favicon.ico',
  // Notification related images (optional, but good for consistency)
  '/assets/badge-72x72.png', // Example for notification badge
  '/assets/icon-96x96.png',   // Example for notification icon if different from main
  // Your Data files (as per your original sw.js)
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
  // Your Audio Assets
  '/assets/chime-gen-quote.mp3',
  '/assets/ui-save-fav.mp3'
  // Add any other critical local assets here
];

// Install: Precache all core assets
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching assets:', PRECACHE_ASSETS);
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Precache complete, activating new SW version.');
        return self.skipWaiting(); // Activate the new service worker immediately
      })
      .catch(error => {
        console.error('[SW] Precaching failed:', error);
      })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Delete all caches that aren't the current one
          return cacheName.startsWith('wow-quotes-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('[SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] Old caches cleaned up, claiming clients.');
      return self.clients.claim(); // Take control of all open clients
    })
  );
});

// Fetch: Handle requests
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') {
    return;
  }

  // Strategy: Stale-while-revalidate for precached assets (HTML, CSS, JS, JSON, Fonts from origin)
  // This ensures a fast response from cache while updating in the background.
  if (PRECACHE_ASSETS.includes(url.pathname) || url.pathname.endsWith('.json')) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Strategy: Cache-first for images from origin
  // Serve from cache if available, otherwise fetch, cache, and return.
  if (req.destination === 'image' && url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Strategy: Network-first for other requests from origin (e.g., new API calls not precached)
  // Try network, if it fails (offline), fallback to cache.
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(req));
    return;
  }

  // For cross-origin requests (like CDNs, external images), just fetch (no caching by default here)
  // You might want to add specific caching for CDNs if needed, but be careful with opaque responses.
  event.respondWith(fetch(req).catch(() => {
    // Generic offline fallback for failed fetches, though specific fallbacks are better.
    // For navigation, index.html is already handled by networkFirst/staleWhileRevalidate for '/'
    console.warn(`[SW] Fetch failed for: ${req.url}`);
    // Consider returning a custom offline response or image if appropriate for the request type
  }));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponsePromise = await cache.match(request);
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(err => {
    console.warn(`[SW] Network fetch failed for SWR: ${request.url}`, err);
    // If network fails, and we don't have a cachedResponse, this will propagate the error
    // which is fine, or you could return a specific offline response here.
    return cachedResponsePromise; // Fallback to cache if network fails completely
  });

  return cachedResponsePromise || networkResponsePromise;
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
    console.warn(`[SW] Network fetch failed for CacheFirst: ${request.url}`, error);
    // For images, you might want to return a placeholder offline image
    // return caches.match('/assets/offline-placeholder.png');
    throw error; // Or rethrow
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn(`[SW] Network fetch failed for NetworkFirst: ${request.url}`, error);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // If it's a navigation request, fall back to the main HTML page for SPA behavior
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw error; // Or return a generic offline response
  }
}


// Listen for skipWaiting message from app.js
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING message received, skipping wait.');
    self.skipWaiting();
  }
});

// Push Notification Event Listener
self.addEventListener('push', event => {
  console.log('[SW] Push Received.');
  let pushData = {
    title: 'Words of Wisdom',
    body: 'A new insight awaits you!',
    icon: '/assets/icon-96x96.png', // Default icon
    badge: '/assets/badge-72x72.png', // Default badge
    tag: 'wow-quote-update',
    url: '/'
  };

  if (event.data) {
    try {
      const eventData = event.data.json();
      pushData = { ...pushData, ...eventData }; // Merge with defaults
    } catch (e) {
      console.error('[SW] Push event data is not valid JSON:', event.data.text(), e);
      pushData.body = event.data.text(); // Use text if not JSON
    }
  }

  const options = {
    body: pushData.body,
    icon: pushData.icon,
    badge: pushData.badge,
    tag: pushData.tag, // Allows new notifications to replace old ones with the same tag
    renotify: true,    // Vibrate/sound even if replacing an existing notification with the same tag
    data: {            // Custom data to use when notification is clicked
      url: pushData.url // URL to open on click
    }
    // Example actions:
    // actions: [
    //   { action: 'explore', title: 'Explore More', icon: '/assets/explore-action.png' },
    //   { action: 'close', title: 'Close', icon: '/assets/close-action.png' },
    // ]
  };

  event.waitUntil(
    self.registration.showNotification(pushData.title, options)
  );
});

// Notification Click Event Listener
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click Received.');
  event.notification.close(); // Close the notification

  // Example: Handle actions
  // if (event.action === 'explore') {
  //   clients.openWindow('/explore-page'); // Open a specific page for this action
  // } else if (event.action === 'close') {
  //   // Do nothing, notification is already closed
  // } else {
    // Default action: open the URL specified in notification data, or root
    const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // Check if a window for this app is already open
        for (const client of clientList) {
          // If a window is already at the target URL or root, focus it.
          if (client.url === self.location.origin + urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no existing client is found or focused, open a new window/tab.
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  // }
});
