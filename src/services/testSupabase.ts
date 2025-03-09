import { supabase } from './supabaseClient';

/**
 * Test Supabase connection and basic queries
 * Call this function from a component to verify your setup
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Test 1: Basic connection
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    
    if (error) throw error;
    
    console.log('Supabase connection successful!');
    console.log('Retrieved data:', data);
    
    return {
      success: true,
      message: 'Supabase connection successful!',
      data
    };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 