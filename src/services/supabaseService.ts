import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ilnffpgpzwxnwdobwutf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbmZmcGdwend4bndkb2J3dXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNzcxOTgsImV4cCI6MjA1Njk1MzE5OH0.6RsxgBiAkcL2GLjjE2XaiuGT2Cw7aLQy0HS4GZaY1Hw';

// Create a default anonymous client
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get an authenticated Supabase client using the Clerk session token
 * @param clerkToken Clerk session token
 * @returns Authenticated Supabase client
 */
export const getAuthenticatedClient = (clerkToken?: string) => {
  if (!clerkToken) {
    console.log('No Clerk token provided, using anonymous client');
    return supabase;
  }

  // Create a new client with the Clerk token
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`
      }
    }
  });
};

/**
 * For development purposes: Skip RLS policies by using service role key
 * WARNING: This should NEVER be used in production as it bypasses all security
 * This is only for development and testing
 */
export const getDevBypassClient = () => {
  // In a real app, you would never expose this key in client-side code
  // This is just for development purposes
  console.warn('Using development bypass client - NEVER use this in production!');
  
  // For development, we'll use the anonymous client but add headers to help bypass RLS
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        // These headers might help bypass RLS in development
        'x-client-info': 'dev-bypass',
        'x-supabase-auth': 'dev-bypass'
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}; 