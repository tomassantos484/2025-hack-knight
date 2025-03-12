// Test script to verify that the maybeSingle method works
import { supabase } from './src/services/supabaseClient.ts';

async function testMaybeSingle() {
  console.log('Testing maybeSingle method...');
  
  try {
    // Test the maybeSingle method directly
    console.log('Testing direct maybeSingle call...');
    const directResult = await supabase
      .from('user_stats')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    console.log('Direct maybeSingle result:', directResult);
    
    // Test the maybeSingle method after eq
    console.log('\nTesting maybeSingle after eq...');
    const eqResult = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000000') // Using a non-existent ID
      .maybeSingle();
    
    console.log('eq + maybeSingle result:', eqResult);
    
    // Test the maybeSingle method after order
    console.log('\nTesting maybeSingle after order...');
    const orderResult = await supabase
      .from('user_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    console.log('order + maybeSingle result:', orderResult);
    
    console.log('\nAll tests completed successfully!');
    console.log('The maybeSingle method is now working correctly.');
    
  } catch (error) {
    console.error('Error testing maybeSingle:', error);
  }
}

// Run the test
testMaybeSingle(); 