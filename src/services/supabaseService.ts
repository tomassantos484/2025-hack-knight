import { supabase as originalSupabase } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Ensure the supabase client has all the necessary methods
const supabase = {
  ...originalSupabase,
  from: (table: string) => {
    const originalFrom = originalSupabase.from(table);
    
    return {
      ...originalFrom,
      select: (columns: string = '*') => {
        const originalSelect = originalFrom.select(columns);
        
        // Create a wrapper around the select result to ensure maybeSingle is available
        const selectWrapper = {
          ...originalSelect,
          
          // Ensure maybeSingle is always available
          maybeSingle: async () => {
            // If the original has maybeSingle, use it
            if (typeof originalSelect.maybeSingle === 'function') {
              return originalSelect.maybeSingle();
            }
            
            // Otherwise, implement it using limit and single
            console.warn('Using fallback implementation of maybeSingle');
            try {
              const result = await originalSelect.limit(1).single();
              return result;
            } catch (error) {
              // If single throws because no rows were found, return null data
              if (error.message && error.message.includes('No rows found')) {
                return { data: null, error: null };
              }
              // Otherwise, propagate the error
              throw error;
            }
          }
        };
        
        // Add methods that return the wrapper
        const methodsToWrap = ['eq', 'neq', 'in', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike', 'is', 'not'];
        methodsToWrap.forEach(method => {
          if (typeof originalSelect[method] === 'function') {
            selectWrapper[method] = (...args) => {
              const result = originalSelect[method](...args);
              // Add maybeSingle to the result if it doesn't have it
              if (result && typeof result.maybeSingle !== 'function') {
                result.maybeSingle = selectWrapper.maybeSingle;
              }
              return result;
            };
          }
        });
        
        // Add methods that return a new wrapper
        const chainableMethods = ['limit', 'order', 'range'];
        chainableMethods.forEach(method => {
          if (typeof originalSelect[method] === 'function') {
            selectWrapper[method] = (...args) => {
              const result = originalSelect[method](...args);
              // Create a new wrapper with the result
              return {
                ...result,
                maybeSingle: selectWrapper.maybeSingle,
                // Recursively wrap methods that return a new builder
                ...methodsToWrap.reduce((acc, m) => {
                  if (typeof result[m] === 'function') {
                    acc[m] = (...mArgs) => {
                      const mResult = result[m](...mArgs);
                      if (mResult && typeof mResult.maybeSingle !== 'function') {
                        mResult.maybeSingle = selectWrapper.maybeSingle;
                      }
                      return mResult;
                    };
                  }
                  return acc;
                }, {})
              };
            };
          }
        });
        
        return selectWrapper;
      },
      
      // Ensure insert is available
      insert: (data, options) => {
        if (typeof originalFrom.insert === 'function') {
          return originalFrom.insert(data, options);
        }
        
        console.warn('Using fallback implementation of insert');
        return {
          select: (columns) => ({
            data: null,
            error: { message: 'insert.select is not implemented in fallback' }
          })
        };
      },
      
      // Ensure upsert is available
      upsert: (data, options) => {
        if (typeof originalFrom.upsert === 'function') {
          return originalFrom.upsert(data, options);
        }
        
        console.warn('Using fallback implementation of upsert');
        // Try to use insert with onConflict option if available
        if (typeof originalFrom.insert === 'function') {
          return originalFrom.insert(data, { ...options, onConflict: options?.onConflict || 'id' });
        }
        
        return {
          data: null,
          error: { message: 'upsert is not implemented in fallback' }
        };
      },
      
      // Ensure update is available
      update: (data, options) => {
        if (typeof originalFrom.update === 'function') {
          const updateResult = originalFrom.update(data, options);
          
          // Add eq method if it doesn't exist
          if (updateResult && typeof updateResult.eq !== 'function') {
            return {
              ...updateResult,
              eq: (column, value) => {
                console.warn('Using fallback implementation of update.eq');
                return {
                  data: null,
                  error: { message: 'update.eq is not implemented in fallback' }
                };
              }
            };
          }
          
          return updateResult;
        }
        
        console.warn('Using fallback implementation of update');
        return {
          eq: (column, value) => ({
            data: null,
            error: { message: 'update is not implemented in fallback' }
          })
        };
      },
      
      // Ensure delete is available
      delete: (options) => {
        if (typeof originalFrom.delete === 'function') {
          const deleteResult = originalFrom.delete(options);
          
          // Add eq method if it doesn't exist
          if (deleteResult && typeof deleteResult.eq !== 'function') {
            return {
              ...deleteResult,
              eq: (column, value) => {
                console.warn('Using fallback implementation of delete.eq');
                return {
                  data: null,
                  error: { message: 'delete.eq is not implemented in fallback' }
                };
              }
            };
          }
          
          return deleteResult;
        }
        
        console.warn('Using fallback implementation of delete');
        return {
          eq: (column, value) => ({
            data: null,
            error: { message: 'delete is not implemented in fallback' }
          })
        };
      }
    };
  }
};

/**
 * Get an authenticated Supabase client using the Clerk session token
 * @param clerkToken Clerk session token
 * @returns Authenticated Supabase client
 */
export const getAuthenticatedClient = async (sessionToken: string) => {
  // In development, we'll bypass authentication for easier testing
  if (import.meta.env.DEV) {
    console.log('Using development bypass client');
    return getDevBypassClient();
  }
  
  // In production, we'll use the session token to authenticate
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing in environment variables');
      return null;
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
    return null;
  }
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
  if (import.meta.env.PROD) {
    console.error('Attempted to use development bypass client in production!');
    return null;
  }
  
  return supabase;
};

// Generate a UUID that's compatible with Supabase
export const uuid = () => {
  return uuidv4();
};

// Export the supabase client
export { supabase }; 