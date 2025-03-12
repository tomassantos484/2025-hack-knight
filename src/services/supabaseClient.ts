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
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY || 'placeholder-key';

// Log warning if environment variables are missing (but not in production)
if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_API_KEY)) {
  console.warn(
    'Supabase credentials missing in environment variables. ' +
    'Using placeholder values for type support only. ' +
    'API calls will be routed through the backend API.'
  );
}

// Create a client for TypeScript type support
// In production, this will only be used for type support, not actual API calls
// We wrap this in a try-catch to prevent errors if the credentials are invalid
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a mock client that won't throw errors
  supabase = {
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