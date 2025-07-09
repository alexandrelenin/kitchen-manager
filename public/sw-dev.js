// Service Worker para desenvolvimento - minimalista
const CACHE_NAME = 'kitchen-manager-dev';

// Install event - apenas instala sem cache
self.addEventListener('install', event => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Activate event - limpa caches antigos
self.addEventListener('activate', event => {
  console.log('Service Worker ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - apenas para recursos estáticos específicos
self.addEventListener('fetch', event => {
  // Apenas cachear recursos estáticos essenciais
  if (event.request.url.includes('manifest.json') || 
      event.request.url.includes('vite.svg')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(response => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          });
        })
        .catch(() => fetch(event.request))
    );
  }
});