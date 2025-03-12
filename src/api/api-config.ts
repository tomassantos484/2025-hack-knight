/**
 * API Configuration
 * 
 * This file centralizes API configuration to ensure consistent usage across the application.
 * The API base URL is determined from environment variables with fallbacks for different environments.
 */

// Get the API base URL from environment variables with a fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production'
    ? 'https://ecovision-backend-production.up.railway.app'
    : 'http://localhost:5000');

// Log the API base URL in development mode for debugging
if (import.meta.env.DEV) {
  console.log(`Using API base URL: ${API_BASE_URL} (${import.meta.env.MODE} mode)`);
} else if (import.meta.env.PROD) {
  console.log(`API initialized with base URL: ${API_BASE_URL}`);
}

// Export other API-related configuration as needed
export const API_ENDPOINTS = {
  TEST: `${API_BASE_URL}/api/test`,
  PROCESS_RECEIPT: `${API_BASE_URL}/api/process-receipt`,
  CLASSIFY_TRASH: `${API_BASE_URL}/api/classify-trash`,
  SUPABASE_DATA: `${API_BASE_URL}/api/supabase/data`,
};

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
}; 