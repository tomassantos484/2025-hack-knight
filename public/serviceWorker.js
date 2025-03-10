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
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_RESOURCES);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
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
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // For API requests, use a network-first strategy with fallback to offline mode
  if (url.pathname.startsWith('/api/')) {
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
              
              // If not in cache, return a simple offline response
              return new Response(JSON.stringify({ 
                error: 'You are offline',
                offline_mode: true 
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
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
            })
            .catch(() => {
              // If it's a navigation request, return the offline page
              if (event.request.mode === 'navigate') {
                return caches.match('/');
              }
              
              // Otherwise, just return an error
              return new Response('Offline', { status: 503 });
            });
        })
    );
  }
}); 