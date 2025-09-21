// Service Worker for AI Photo Travel - Enhanced Version
const CACHE_NAME = 'ai-photo-travel-v1.0.1';
const STATIC_CACHE = 'static-v1.0.1';
const DYNAMIC_CACHE = 'dynamic-v1.0.1';
const IMAGE_CACHE = 'images-v1.0.1';

const urlsToCache = [
  './',
  './ai-photo-editor.html',
  './index.html',
  './manifest.json'
];

// Install event - cache resources with error handling
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache static files:', error);
      })
  );
});

// Enhanced fetch event with smart caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Handle image requests with dedicated cache
    if (request.destination === 'image' || 
        request.url.includes('.jpg') || 
        request.url.includes('.png') || 
        request.url.includes('.webp') || 
        request.url.includes('.svg')) {
      event.respondWith(handleImageRequest(request));
    }
    // Handle API requests with network-first strategy
    else if (url.origin !== location.origin || 
             request.url.includes('api-inference.huggingface.co') ||
             request.url.includes('replicate.com') ||
             request.url.includes('remove.bg')) {
      event.respondWith(handleApiRequest(request));
    }
    // Handle static files with cache-first strategy
    else {
      event.respondWith(handleStaticRequest(request));
    }
  }
});

// Handle static file requests (Cache First strategy)
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Static request failed:', error);
    return caches.match('./ai-photo-editor.html');
  }
}

// Handle image requests (Cache First with size limit)
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      const contentLength = networkResponse.headers.get('content-length');
      if (!contentLength || parseInt(contentLength) < 5 * 1024 * 1024) {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    console.error('Image request failed:', error);
    return new Response(
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#999">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Handle API requests (Network First strategy)
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      if (request.url.startsWith('http')) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    console.error('API request failed:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Fallback for failed requests
function handleFailedRequest(request) {
  return caches.match('./ai-photo-editor.html')
    .then(response => {
      // If both cache and network fail, show offline page
      if (request.destination === 'document') {
        return response || new Response('Offline', { status: 503 });
      }
      return response;
    });
}
// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Background sync for failed API requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending background tasks
  console.log('Background sync triggered');
}

// Push notifications (for future use)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Yeni özellikler mevcut!',
    icon: './icon-192x192.png',
    badge: './badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Keşfet',
        icon: './icon-explore.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: './icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('AI Photo Travel', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./ai-photo-editor.html')
    );
  }
});