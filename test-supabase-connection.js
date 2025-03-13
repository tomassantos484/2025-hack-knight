/**
 * Supabase Connection Test Script
 * 
 * This script tests the connection to Supabase and verifies that the client is working correctly.
 * Run with: node test-supabase-connection.js
 */

// Import required modules
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_API_KEY;

// Check if credentials are available
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in environment variables.');
  console.error('Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_API_KEY are set in your .env file.');
  process.exit(1);
}

// Mask the API key for logging
const maskedKey = supabaseKey.substring(0, 4) + '...' + supabaseKey.substring(supabaseKey.length - 4);
console.log(`🔑 Using Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Using Supabase API Key: ${maskedKey}`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test function to verify connection
async function testConnection() {
  console.log('🔄 Testing Supabase connection...');
  
  try {
    // Test a simple query to the system schema
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log(`📊 Retrieved ${data ? data.length : 0} records from users table.`);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during connection test:', error);
    return false;
  }
}

// Test function to verify maybeSingle method
async function testMaybeSingle() {
  console.log('🔄 Testing maybeSingle method...');
  
  try {
    // Test the maybeSingle method
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('❌ maybeSingle test failed:', error.message);
      return false;
    }
    
    console.log('✅ maybeSingle method works correctly!');
    console.log(`📊 Retrieved data:`, data);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during maybeSingle test:', error);
    console.error('This indicates that maybeSingle is not a function on the query builder.');
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Supabase connection tests...');
  
  const connectionSuccess = await testConnection();
  if (!connectionSuccess) {
    console.error('❌ Basic connection test failed. Please check your credentials and network connection.');
    process.exit(1);
  }
  
  const maybeSingleSuccess = await testMaybeSingle();
  if (!maybeSingleSuccess) {
    console.error('❌ maybeSingle test failed. This is likely the cause of your error.');
    console.error('Please make sure you are using the correct Supabase client version and API.');
    process.exit(1);
  }
  
  console.log('🎉 All tests passed! Your Supabase connection is working correctly.');
}

// Execute the tests
runTests().catch(error => {
  console.error('❌ Unhandled error during tests:', error);
  process.exit(1);
}); 