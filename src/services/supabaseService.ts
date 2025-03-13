import secureClient, { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { safeLog } from '../utils/logUtils';

/**
 * Get an authenticated Supabase client using the Clerk session token
 * @param clerkToken Clerk session token
 * @returns Authenticated Supabase client
 */
export const getAuthenticatedClient = (clerkToken?: string) => {
  if (!clerkToken) {
    safeLog.log('No Clerk token provided, using anonymous client');
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
    safeLog.error('SECURITY WARNING: Attempted to use development bypass client in production!');
    safeLog.error('This is a security risk and has been prevented.');
    // Return the regular secure client instead
    return secureClient;
  }
  
  // Log a warning, but only in development mode
  safeLog.warn('Using development bypass client - NEVER use this in production!');
  
  // For development, we'll use the secure client with special headers
  return secureClient;
};

/**
 * Format a string as a UUID if it's not already
 * This creates a deterministic UUID based on the input string
 * @param userId The user ID to format as a UUID
 * @returns A properly formatted UUID
 */
export const formatUuid = (userId: string): string => {
  if (!userId) return '';
  
  // If it's already a valid UUID, return it as is
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    return userId;
  }
  
  // For Clerk IDs, create a deterministic UUID
  // First, remove the 'user_' prefix if it exists
  const cleanId = userId.replace(/^user_/, '');
  
  // Create a deterministic UUID using a simple hash function
  let hash = 0;
  for (let i = 0; i < cleanId.length; i++) {
    const char = cleanId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert the hash to a hex string and ensure it's positive
  const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
  
  // Generate remaining parts with some determinism from the input
  const p1 = hashHex.substring(0, 8);
  const p2 = hashHex.substring(0, 4);
  const p3 = '4' + hashHex.substring(0, 3); // Version 4 UUID
  const p4 = (8 + (Math.abs(hash) % 4)).toString(16) + hashHex.substring(0, 3); // Variant bits
  
  // Generate the last part with more entropy
  let p5 = '';
  for (let i = 0; i < 12; i++) {
    p5 += (Math.abs(hash + i) % 16).toString(16);
  }
  
  // Format as UUID (8-4-4-4-12)
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
};

/**
 * Generate a random UUID
 * @returns A random UUID
 */
export const generateUuid = (): string => {
  return uuidv4();
};

// Re-export the secure client as the default
export { secureClient as supabase }; 