/**
 * API Configuration Test Script
 * 
 * This script tests the API configuration to ensure it's working correctly.
 * Run with: npx ts-node src/api/testApiConfig.ts
 */

import { API_BASE_URL, API_ENDPOINTS } from './api-config';
import axios from 'axios';

/**
 * Test the API configuration
 */
async function testApiConfig() {
  console.log('=== API Configuration Test ===');
  console.log(`API_BASE_URL: ${API_BASE_URL}`);
  console.log('API_ENDPOINTS:');
  Object.entries(API_ENDPOINTS).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  // Test the API connection
  console.log('\nTesting API connection...');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/test`, {
      timeout: 5000,
      params: { t: new Date().getTime() } // Add timestamp to prevent caching
    });
    
    console.log('API connection successful!');
    console.log(`Status: ${response.status}`);
    console.log('Response data:', response.data);
    
    return true;
  } catch (error) {
    console.error('API connection failed!');
    if (axios.isAxiosError(error)) {
      console.error(`Status: ${error.response?.status || 'Unknown'}`);
      console.error('Error message:', error.message);
      if (error.response?.data) {
        console.error('Response data:', error.response.data);
      }
    } else {
      console.error('Error:', error);
    }
    
    return false;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testApiConfig()
    .then(success => {
      console.log('\n=== Test Complete ===');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export default testApiConfig; 