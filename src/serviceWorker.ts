import { handleApiRequest } from './api';

// Define the FetchEvent interface
interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

// Cache name and version
const CACHE_NAME = 'ecovision-cache-v1';

// Resources to cache initially
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/fonts/GeneralSans-Variable.woff2'
];

// Install event - cache static resources
self.addEventListener('install', (event: Event) => {
  const installEvent = event as unknown as ExtendableEvent;
  installEvent.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_RESOURCES);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: Event) => {
  const activateEvent = event as unknown as ExtendableEvent;
  activateEvent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
});

// Set up a fetch event listener with caching strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  
  // Handle API requests with caching
  if (url.pathname.startsWith('/api/')) {
    // For API requests, use a network-first strategy with cache fallback
    event.respondWith(
      // Try network first
      fetch(event.request)
        .then(response => {
          // Clone the response for caching
          const responseToCache = response.clone();
          
          // Only cache successful responses
          if (response.ok) {
            caches.open(CACHE_NAME)
              .then(cache => {
                // Create a cacheable request (POST requests aren't cacheable by default)
                const cacheKey = new Request(event.request.url, {
                  method: 'GET',
                  headers: event.request.headers,
                  mode: event.request.mode === 'navigate' ? 'navigate' : 'cors',
                  credentials: event.request.credentials,
                  redirect: event.request.redirect
                });
                
                // Store the response in cache
                cache.put(cacheKey, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If not in cache, use the service worker API handler
              return handleApiRequest(event.request);
            });
        })
    );
  } else {
    // For non-API requests, use a cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache, fetch from network and cache the response
          return fetch(event.request)
            .then(response => {
              // Don't cache non-successful responses or non-GET requests
              if (!response.ok || event.request.method !== 'GET') {
                return response;
              }
              
              // Clone the response for caching
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            });
        })
    );
  }
});

// Define ExtendableEvent interface
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

// Export an empty function to register the service worker
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/serviceWorker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
}

// Export an empty function to unregister the service worker
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
} 