import axios from 'axios';
import { API_BASE_URL } from '../api/api-config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define types for query parameters and data
export type QueryParams = Record<string, string | number | boolean | null | undefined>;
export type DataRecord = Record<string, string | number | boolean | null | undefined | object>;

/**
 * Perform Supabase data operations through the Flask backend
 * @param table The Supabase table name
 * @param operation The operation to perform (select, insert, update, delete)
 * @param params Query parameters for the operation
 * @param data Data for insert or update operations
 * @param authToken Optional auth token for authenticated requests
 */
export const supabaseData = async <T>(
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete' = 'select',
  params: QueryParams = {},
  data?: DataRecord,
  authToken?: string
): Promise<T> => {
  try {
    const headers: Record<string, string> = {};
    
    // Add authorization header if token is provided
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await api.post('/supabase/data', {
      table,
      operation,
      params,
      data,
    }, { headers });
    
    return response.data;
  } catch (error) {
    console.error(`Error in ${operation} operation on ${table}:`, error);
    throw error;
  }
};

/**
 * Select data from a Supabase table
 * @param table The Supabase table name
 * @param params Query parameters
 * @param authToken Optional auth token
 */
export const selectData = async <T>(
  table: string,
  params: QueryParams = {},
  authToken?: string
): Promise<T> => {
  return supabaseData<T>(table, 'select', params, undefined, authToken);
};

/**
 * Insert data into a Supabase table
 * @param table The Supabase table name
 * @param data Data to insert
 * @param authToken Optional auth token
 */
export const insertData = async <T>(
  table: string,
  data: DataRecord,
  authToken?: string
): Promise<T> => {
  return supabaseData<T>(table, 'insert', {}, data, authToken);
};

/**
 * Update data in a Supabase table
 * @param table The Supabase table name
 * @param data Data to update
 * @param params Query parameters to identify records to update
 * @param authToken Optional auth token
 */
export const updateData = async <T>(
  table: string,
  data: DataRecord,
  params: QueryParams,
  authToken?: string
): Promise<T> => {
  return supabaseData<T>(table, 'update', params, data, authToken);
};

/**
 * Delete data from a Supabase table
 * @param table The Supabase table name
 * @param params Query parameters to identify records to delete
 * @param authToken Optional auth token
 */
export const deleteData = async <T>(
  table: string,
  params: QueryParams,
  authToken?: string
): Promise<T> => {
  return supabaseData<T>(table, 'delete', params, undefined, authToken);
};

export default api; 