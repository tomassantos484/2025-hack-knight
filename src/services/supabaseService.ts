import secureClient, { supabase } from './supabaseClient';

/**
 * Get an authenticated Supabase client using the Clerk session token
 * @param clerkToken Clerk session token
 * @returns Authenticated Supabase client
 */
export const getAuthenticatedClient = (clerkToken?: string) => {
  if (!clerkToken) {
    console.log('No Clerk token provided, using anonymous client');
    return secureClient;
  }

  // Create a new client with the Clerk token
  // In the future, we'll pass the token to the backend API
  return secureClient;
};

/**
 * For development purposes: Skip RLS policies by using service role key
 * WARNING: This should NEVER be used in production as it bypasses all security
 * This is only for development and testing
 * 
 * NOTE: If you see the warning "Using development bypass client - NEVER use this in production!"
 * in your console, it means this function is being called. This is expected during development
 * when testing database connections. The warning is there to remind developers not to use
 * this function in production code. You can safely ignore this warning during development.
 * 
 * If you want to disable this warning, you can:
 * 1. Comment out the database connection test in App.tsx
 * 2. Set localStorage.setItem('hasTestedDbConnection', 'true') in your browser console
 */
export const getDevBypassClient = () => {
  // Only allow this function to be used in development mode
  if (import.meta.env.PROD) {
    console.error('SECURITY WARNING: Attempted to use development bypass client in production!');
    console.error('This is a security risk and has been prevented.');
    // Return the regular secure client instead
    return secureClient;
  }
  
  // Log a warning, but only in development mode
  console.warn('Using development bypass client - NEVER use this in production!');
  
  // For development, we'll use the secure client with special headers
  return secureClient;
};

// Re-export the secure client as the default
export { secureClient as supabase }; 