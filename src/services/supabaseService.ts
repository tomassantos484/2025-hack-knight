import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY || '';

// Create a direct Supabase client
let supabaseClient;

try {
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a mock client that won't throw errors
  supabaseClient = {
    from: () => ({
      select: () => ({
        eq: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } }),
        maybeSingle: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } })
      })
    })
  };
}

// Create a wrapper with polyfills for missing methods
const supabase = {
  ...supabaseClient,
  from: (table) => {
    const originalFrom = supabaseClient.from(table);
    
    // Create a wrapper for the query builder
    const queryBuilder = {
      ...originalFrom,
      
      // Ensure select method works
      select: (columns = '*') => {
        const originalSelect = originalFrom.select(columns);
        
        // Add maybeSingle method if it doesn't exist
        const enhancedSelect = {
          ...originalSelect,
          
          // Polyfill for maybeSingle
          maybeSingle: async () => {
            if (typeof originalSelect.maybeSingle === 'function') {
              try {
                return await originalSelect.maybeSingle();
              } catch (error) {
                console.error('Error in maybeSingle:', error);
                return { data: null, error };
              }
            }
            
            console.warn('Using fallback implementation of maybeSingle');
            try {
              return await originalSelect.limit(1).single();
            } catch (error) {
              if (error.message && error.message.includes('No rows found')) {
                return { data: null, error: null };
              }
              return { data: null, error };
            }
          }
        };
        
        // Add methods that chain and preserve maybeSingle
        ['eq', 'neq', 'in', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike', 'is', 'not', 'limit', 'order', 'range'].forEach(method => {
          if (typeof originalSelect[method] === 'function') {
            enhancedSelect[method] = (...args) => {
              const result = originalSelect[method](...args);
              return {
                ...result,
                maybeSingle: enhancedSelect.maybeSingle
              };
            };
          }
        });
        
        return enhancedSelect;
      },
      
      // Ensure upsert method works
      upsert: (data, options: { onConflict?: string } = {}) => {
        if (typeof originalFrom.upsert === 'function') {
          try {
            return originalFrom.upsert(data, options);
          } catch (error) {
            console.error('Error in upsert:', error);
            return { data: null, error };
          }
        }
        
        console.warn('Using fallback implementation of upsert');
        try {
          // Use insert with onConflict option
          return originalFrom.insert(data, { onConflict: options.onConflict || 'id' });
        } catch (error) {
          console.error('Error in fallback upsert:', error);
          return { data: null, error };
        }
      },
      
      // Ensure update method works
      update: (data, options = {}) => {
        if (typeof originalFrom.update !== 'function') {
          console.warn('Update method not available');
          return {
            eq: () => ({ data: null, error: { message: 'Update method not available' } })
          };
        }
        
        try {
          const updateResult = originalFrom.update(data, options);
          
          // Ensure eq method is available
          if (typeof updateResult.eq !== 'function') {
            return {
              ...updateResult,
              eq: (column, value) => {
                console.warn('Using direct filter for update');
                try {
                  return originalFrom.update(data, { 
                    ...options,
                    filter: { [column]: value }
                  });
                } catch (error) {
                  console.error('Error in update with filter:', error);
                  return { data: null, error };
                }
              }
            };
          }
          
          return updateResult;
        } catch (error) {
          console.error('Error in update:', error);
          return {
            eq: () => ({ data: null, error })
          };
        }
      }
    };
    
    return queryBuilder;
  }
};

/**
 * Get an authenticated Supabase client using the Clerk session token
 * @param sessionToken Clerk session token
 * @returns Authenticated Supabase client
 */
export const getAuthenticatedClient = async (sessionToken) => {
  if (import.meta.env.DEV) {
    console.log('Using development bypass client');
    return supabase;
  }
  
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing in environment variables');
      return supabase;
    }
    
    const client = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${sessionToken}`
        }
      }
    });
    
    return client;
  } catch (error) {
    console.error('Error creating authenticated Supabase client:', error);
    return supabase;
  }
};

/**
 * For development purposes: Skip RLS policies by using service role key
 */
export const getDevBypassClient = () => {
  if (import.meta.env.PROD) {
    console.error('Attempted to use development bypass client in production!');
    return supabase;
  }
  
  return supabase;
};

// Generate a UUID that's compatible with Supabase
export const uuid = () => {
  return uuidv4();
};

// Format a string as a UUID if it's not already
export const formatUuid = (id) => {
  if (!id) return null;
  
  // Check if it's already a UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  
  // If it's a short ID (e.g. from Clerk), pad it to make a valid UUID
  return `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(12, 16)}-0000-000000000000`.substring(0, 36);
};

// Export the supabase client
export { supabase }; 