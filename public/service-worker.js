// Service Worker for FGC Kenya PWA
const CACHE_NAME = 'fgc-kenya-v1.0.1';
const DYNAMIC_CACHE = 'fgc-kenya-dynamic-v1.0.1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      // Only cache offline.html and manifest, not the root
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.error('[Service Worker] Failed to cache static assets:', err);
        // Continue installation even if some assets fail to cache
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL: Only handle requests for this specific app
  // Skip requests from other localhost apps or different ports
  if (url.hostname === 'localhost' && url.port !== '3000') {
    return; // Don't handle requests from other localhost apps
  }

  // Skip requests to other domains entirely
  if (url.hostname !== 'localhost' && !url.hostname.includes('fgckenya') && !url.hostname.includes('atote')) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip WebSocket requests (HMR in development)
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Skip Next.js development files
  if (url.pathname.includes('_next/webpack-hmr') || 
      url.pathname.includes('_next/static/development') ||
      url.pathname.includes('__nextjs') ||
      url.hostname === 'localhost' && url.pathname.includes('.hot-update.')) {
    return;
  }

  // API requests - network only, no caching in development
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Network request failed' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Next.js build files - use intelligent caching
  if (url.pathname.includes('/_next/')) {
    // Build chunks with hash - cache them as they're immutable
    if (url.pathname.match(/\/_next\/static\/chunks\/.*\.[a-f0-9]{8,}\.js$/)) {
      event.respondWith(cacheFirst(request));
      return;
    }
    // Other Next.js files - network first
    event.respondWith(networkFirstWithTimeout(request, 3000));
    return;
  }

  // Static assets - cache first, fallback to network
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages - network first with quick timeout for better UX
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithTimeout(request, 3000));
    return;
  }

  // Default - network first with timeout
  event.respondWith(networkFirstWithTimeout(request, 3000));
});

// Cache first strategy with better error handling
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      console.log('[Service Worker] Cache hit:', request.url);
      return cached;
    }

    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.ok && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone()).catch(err => {
        console.error('[Service Worker] Failed to cache response:', err);
      });
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Cache first error:', error);
    
    // Try to get from cache again as fallback
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Only return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    
    // Return error response
    return new Response('Network error occurred', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Network first strategy with timeout
async function networkFirstWithTimeout(request, timeout = 5000) {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), timeout)
  );

  try {
    // Race between network request and timeout
    const response = await Promise.race([
      fetch(request),
      timeoutPromise
    ]);
    
    // Only cache successful responses
    if (response.ok && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone()).catch(err => {
        console.error('[Service Worker] Failed to cache response:', err);
      });
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Network request failed or timed out, trying cache:', request.url);
    
    // Try cache
    const cached = await caches.match(request);
    if (cached) {
      console.log('[Service Worker] Serving from cache after network failure:', request.url);
      return cached;
    }
    
    // For navigation requests, show offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        console.log('[Service Worker] Serving offline page');
        return offlinePage;
      }
    }
    
    // Return error response
    console.error('[Service Worker] No cached response available:', request.url);
    return new Response('Network error occurred', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Check if request is for static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  let data = {
    title: 'FGC Kenya',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    timestamp: Date.now(),
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    timestamp: data.timestamp,
    data: data.data,
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('Notifications synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync notifications:', error);
    throw error; // Retry later
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkForNewNotifications());
  }
});

async function checkForNewNotifications() {
  try {
    const response = await fetch('/api/notifications/check');
    if (response.ok) {
      const data = await response.json();
      if (data.hasNew) {
        // Show notification about new content
        await self.registration.showNotification('New Updates Available', {
          body: 'You have new notifications',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'new-content',
          data: { url: '/dashboard' }
        });
      }
    }
  } catch (error) {
    console.error('Failed to check notifications:', error);
  }
}

// Message handling for client communication
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }
});