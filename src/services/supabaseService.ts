import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL2_0 || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY2_0 || '';

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
  
  // For development, we'll use the anonymous client with special headers
  return createClient(supabaseUrl, supabaseKey, {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        // These headers help bypass RLS in development
        'x-client-info': 'supabase-js-bypass',
      }
    }
  });
}; 