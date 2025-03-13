/**
 * Utility functions for managing browser caches
 */
import { safeLog } from './logUtils';

/**
 * Clear all browser caches including:
 * - Service worker caches
 * - Application cache
 * - LocalStorage (optionally)
 * - SessionStorage (optionally)
 * 
 * @param clearLocalStorage Whether to clear localStorage (default: false)
 * @param clearSessionStorage Whether to clear sessionStorage (default: false)
 * @returns Promise that resolves when caches are cleared
 */
export const clearAllCaches = async (
  clearLocalStorage = false,
  clearSessionStorage = false
): Promise<void> => {
  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      safeLog.log('Service worker caches cleared');
    }

    // Clear application cache
    if ('applicationCache' in window) {
      try {
        // @ts-expect-error - applicationCache is deprecated but may still exist
        window.applicationCache.swapCache();
        safeLog.log('Application cache cleared');
      } catch (e) {
        safeLog.log('Application cache not available or already cleared');
      }
    }

    // Clear localStorage if requested
    if (clearLocalStorage) {
      localStorage.clear();
      safeLog.log('LocalStorage cleared');
    }

    // Clear sessionStorage if requested
    if (clearSessionStorage) {
      sessionStorage.clear();
      safeLog.log('SessionStorage cleared');
    }

    safeLog.log('All requested caches cleared successfully');
  } catch (error) {
    safeLog.error('Error clearing caches:', error);
  }
};

/**
 * Unregister all service workers
 * @returns Promise that resolves when all service workers are unregistered
 */
export const unregisterServiceWorkers = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        await registration.unregister();
        safeLog.log('Service worker unregistered');
      }
      
      safeLog.log('All service workers unregistered');
    } catch (error) {
      safeLog.error('Error unregistering service workers:', error);
    }
  }
};

/**
 * Add a button to the page that clears all caches when clicked
 * This is useful for development and debugging
 */
export const addCacheClearButton = (): void => {
  // Only add in development mode
  if (import.meta.env.PROD) return;
  
  // Create button element
  const button = document.createElement('button');
  button.textContent = 'Clear Caches';
  button.style.position = 'fixed';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.padding = '8px 12px';
  button.style.backgroundColor = '#f44336';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.fontWeight = 'bold';
  
  // Add click handler
  button.addEventListener('click', async () => {
    try {
      await clearAllCaches(true, true);
      await unregisterServiceWorkers();
      alert('All caches cleared! Reloading page...');
      window.location.reload();
    } catch (error) {
      safeLog.error('Error clearing caches:', error);
      alert('Error clearing caches. See console for details.');
    }
  });
  
  // Add to document
  document.body.appendChild(button);
}; 