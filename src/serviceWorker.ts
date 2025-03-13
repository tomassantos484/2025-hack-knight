// Service worker registration functions

/**
 * Register the service worker
 */
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/serviceWorker.js';
      
      // First, try to unregister any existing service workers
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      }).then(() => {
        // Clear all caches
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              return caches.delete(cacheName);
            })
          );
        }).then(() => {
          // Register the new service worker
          navigator.serviceWorker.register(swUrl)
            .then(registration => {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
              console.error('ServiceWorker registration failed: ', error);
            });
        });
      });
    });
  }
}

/**
 * Unregister the service worker and clear caches
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    // Unregister all service workers
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });

    // Clear all caches
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    });
  }
} 