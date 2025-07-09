const CACHE_NAME = 'kitchen-manager-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/vite.svg'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests, dev tools, and external APIs
  if (!event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('chrome-extension') ||
      event.request.url.includes('api.spoonacular.com') ||
      event.request.url.includes('api.edamam.com') ||
      event.request.url.includes('/@vite/') ||
      event.request.url.includes('/@react-refresh') ||
      event.request.url.includes('sockjs-node') ||
      event.request.url.includes('webpack-dev-server') ||
      event.request.url.includes('hot-update')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(error => {
        console.log('Fetch failed for:', event.request.url, error);
        // Don't return fallback for failed requests to avoid breaking the app
        return fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered');
}