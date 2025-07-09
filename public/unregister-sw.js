// Script para desregistrar service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(boolean) {
        console.log('Service Worker desregistrado:', boolean);
      });
    }
  });
  
  // Limpar todos os caches
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('Removendo cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(function() {
    console.log('Todos os caches removidos');
    // Recarregar a página após limpeza
    window.location.reload();
  });
}