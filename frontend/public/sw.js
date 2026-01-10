const CACHE_NAME = 'halaltrade-v2';
const API_CACHE_NAME = 'halaltrade-api-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// API endpoints to cache for offline use
const CACHEABLE_API_PATTERNS = [
  '/api/stocks/list',
  '/api/dashboard',
  '/api/portfolio',
  '/api/alerts',
  '/api/stocks/history'
];

// Cache duration for API responses (in milliseconds)
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Check if URL matches cacheable API patterns
function isCacheableAPI(url) {
  return CACHEABLE_API_PATTERNS.some(pattern => url.includes(pattern));
}

// Get cached response with timestamp check
async function getCachedAPIResponse(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (!cachedResponse) return null;
  
  // Check if cache is expired
  const cachedTime = cachedResponse.headers.get('sw-cached-time');
  if (cachedTime) {
    const age = Date.now() - parseInt(cachedTime);
    if (age > API_CACHE_DURATION) {
      // Cache expired, delete it
      await cache.delete(request);
      return null;
    }
  }
  
  return cachedResponse;
}

// Cache API response with timestamp
async function cacheAPIResponse(request, response) {
  const cache = await caches.open(API_CACHE_NAME);
  
  // Clone response and add timestamp header
  const headers = new Headers(response.headers);
  headers.set('sw-cached-time', Date.now().toString());
  
  const cachedResponse = new Response(await response.clone().blob(), {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
  
  await cache.put(request, cachedResponse);
}

// Fetch event - handle caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip WebSocket upgrades
  if (event.request.url.includes('/ws/')) return;

  const url = event.request.url;

  // Handle cacheable API requests - Network first, cache fallback
  if (isCacheableAPI(url)) {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          if (response.ok) {
            await cacheAPIResponse(event.request, response);
          }
          return response;
        })
        .catch(async () => {
          console.log('[SW] Network failed, trying cache for:', url);
          const cachedResponse = await getCachedAPIResponse(event.request);
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', url);
            return cachedResponse;
          }
          return new Response(JSON.stringify({ 
            error: 'Offline', 
            message: 'No cached data available' 
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Skip non-cacheable API requests
  if (url.includes('/api/')) return;

  // Handle static assets - Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response before caching
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Message handler for cache control from app
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_API_CACHE') {
    caches.delete(API_CACHE_NAME).then(() => {
      console.log('[SW] API cache cleared');
    });
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'HalalTrade Pro', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});
