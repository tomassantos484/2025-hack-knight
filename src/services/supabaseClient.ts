import { createClient } from '@supabase/supabase-js';
import { selectData, insertData, updateData, deleteData, DataRecord } from './apiService';

// Define types to match Supabase client API
type SupabaseResponse<T = unknown> = {
  data: T | null;
  error: { message: string; code?: string } | null;
};

// Define a type for the select query builder
type SelectQueryBuilder = {
  eq: (column: string, value: string | number) => Promise<SupabaseResponse>;
  neq: (column: string, value: string | number) => Promise<SupabaseResponse>;
  limit: (limit: number) => SelectQueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => SelectQueryBuilder;
  single: () => Promise<SupabaseResponse>;
  maybeSingle: () => Promise<SupabaseResponse>;
};

// Get Supabase credentials from environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY || '';

// Log warning if environment variables are missing (but not in production)
if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_API_KEY)) {
  console.warn(
    'Supabase credentials missing in environment variables. ' +
    'API calls will be routed through the backend API.'
  );
} else if (import.meta.env.PROD) {
  // Only log that initialization happened, not the actual URL
  console.log('Supabase client initialized');
}

// Create a client for TypeScript type support
// In production, this will only be used for type support, not actual API calls
// We wrap this in a try-catch to prevent errors if the credentials are invalid
let supabaseOriginal;
try {
  supabaseOriginal = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a mock client that won't throw errors
  supabaseOriginal = {
    from: () => ({
      select: () => ({
        eq: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } }),
        neq: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } }),
        limit: () => ({
          eq: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } })
        }),
        order: () => ({
          eq: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } })
        }),
        single: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } }),
        maybeSingle: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } })
      }),
      insert: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } }),
      update: () => ({
        eq: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } })
      }),
      delete: () => ({
        eq: async () => ({ data: null, error: { message: 'Supabase client not initialized properly' } })
      })
    })
  };
}

// Create a wrapper around the Supabase client to ensure maybeSingle is always available
const supabase = {
  ...supabaseOriginal,
  from: (table: string) => {
    const originalFrom = supabaseOriginal.from(table);
    
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
      }
    };
  }
};

// Export the client
export { supabase };

// Create a secure client that uses the backend API
export const secureClient = {
  from: (table: string) => ({
    select: (columns: string = '*'): SelectQueryBuilder => {
      // Create a query state object to track parameters
      const queryState = {
        columns,
        filters: {} as Record<string, string>,
        orderColumn: '',
        orderAscending: true,
        limitValue: 0
      };
      
      // Helper to execute the query with current state
      const executeQuery = async (): Promise<SupabaseResponse> => {
        const params: Record<string, string | number | boolean> = { select: queryState.columns };
        
        // Add filters
        Object.entries(queryState.filters).forEach(([key, value]) => {
          params[key] = value;
        });
        
        // Add order if set
        if (queryState.orderColumn) {
          params.order = queryState.orderColumn;
          params.ascending = queryState.orderAscending;
        }
        
        // Add limit if set
        if (queryState.limitValue > 0) {
          params.limit = queryState.limitValue;
        }
        
        return await selectData(table, params);
      };
      
      // Create the builder object with chainable methods
      const builder: SelectQueryBuilder = {
        eq: async (column: string, value: string | number): Promise<SupabaseResponse> => {
          queryState.filters[column] = `eq.${value}`;
          return executeQuery();
        },
        neq: async (column: string, value: string | number): Promise<SupabaseResponse> => {
          queryState.filters[column] = `neq.${value}`;
          return executeQuery();
        },
        limit: (limit: number): SelectQueryBuilder => {
          queryState.limitValue = limit;
          return builder;
        },
        order: (column: string, options: { ascending?: boolean } = {}): SelectQueryBuilder => {
          queryState.orderColumn = column;
          queryState.orderAscending = options.ascending !== false;
          return builder;
        },
        single: async (): Promise<SupabaseResponse> => {
          queryState.limitValue = 1;
          const result = await executeQuery();
          if (Array.isArray(result.data) && result.data.length > 0) {
            return { data: result.data[0], error: null };
          }
          return { data: null, error: null };
        },
        maybeSingle: async (): Promise<SupabaseResponse> => {
          queryState.limitValue = 1;
          const result = await executeQuery();
          if (Array.isArray(result.data) && result.data.length > 0) {
            return { data: result.data[0], error: null };
          }
          return { data: null, error: null };
        }
      };
      
      return builder;
    },
    insert: async (data: DataRecord): Promise<SupabaseResponse> => {
      return await insertData(table, data);
    },
    upsert: async (data: DataRecord): Promise<SupabaseResponse> => {
      // Upsert is just an insert with upsert flag
      return await insertData(table, { ...data, _upsert: true });
    },
    update: (data: DataRecord) => ({
      eq: async (column: string, value: string | number): Promise<SupabaseResponse> => {
        const params = { [column]: `eq.${value}` };
        return await updateData(table, data, params);
      }
    }),
    delete: () => ({
      eq: async (column: string, value: string | number): Promise<SupabaseResponse> => {
        const params = { [column]: `eq.${value}` };
        return await deleteData(table, params);
      }
    })
  })
};

// Export the secure client as the default
export default secureClient; 