/**
 * Environment Variable Check Utility
 * 
 * This utility helps verify that required environment variables are properly set.
 * It logs warnings in development mode if any required variables are missing.
 */

// Track whether warnings have been shown to avoid repeated console logs
const warningsShown = {
  supabase: false,
  clerk: false,
  api: false,
  general: false
};

/**
 * Check if Supabase environment variables are properly set
 * @returns True if all required Supabase variables are set, false otherwise
 */
export function checkSupabaseEnv(): boolean {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
  
  const isValid = !!supabaseUrl && !!supabaseKey;
  
  if (!isValid && import.meta.env.DEV && !warningsShown.supabase) {
    console.warn(
      '⚠️ Supabase environment variables are missing or invalid:\n' +
      `VITE_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}\n` +
      `VITE_SUPABASE_API_KEY: ${supabaseKey ? '✓' : '✗'}\n\n` +
      'Please check your .env file and make sure these variables are properly set.\n' +
      'You can copy the values from .env.example and replace them with your actual Supabase credentials.\n' +
      'The application will continue to work using the backend API for data operations.'
    );
    warningsShown.supabase = true;
  }
  
  return isValid;
}

/**
 * Check if Clerk environment variables are properly set
 * @returns True if all required Clerk variables are set, false otherwise
 */
export function checkClerkEnv(): boolean {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  const isValid = !!clerkKey;
  
  if (!isValid && import.meta.env.DEV && !warningsShown.clerk) {
    console.warn(
      '⚠️ Clerk environment variables are missing or invalid:\n' +
      `VITE_CLERK_PUBLISHABLE_KEY: ${clerkKey ? '✓' : '✗'}\n\n` +
      'Authentication features may not work correctly without this variable.'
    );
    warningsShown.clerk = true;
  }
  
  return isValid;
}

/**
 * Check if API environment variables are properly set
 * @returns True if all required API variables are set, false otherwise
 */
export function checkApiEnv(): boolean {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  const isValid = !!apiUrl;
  
  if (!isValid && import.meta.env.DEV && !warningsShown.api) {
    console.warn(
      '⚠️ API environment variables are missing or invalid:\n' +
      `VITE_API_BASE_URL: ${apiUrl ? '✓' : '✗'}\n\n` +
      'The application will use default API URLs based on the environment.'
    );
    warningsShown.api = true;
  }
  
  return isValid;
}

/**
 * Check if all required environment variables are properly set
 * @returns True if all required variables are set, false otherwise
 */
export function checkAllRequiredEnv(): boolean {
  const checks = [
    checkSupabaseEnv(),
    checkClerkEnv(),
    checkApiEnv()
  ];
  
  const isValid = checks.every(Boolean);
  
  if (!isValid && import.meta.env.DEV && !warningsShown.general) {
    console.info(
      'ℹ️ Some environment variables are missing. ' +
      'The application will continue to work with limited functionality. ' +
      'See warnings above for details.'
    );
    warningsShown.general = true;
  }
  
  return isValid;
}

export default {
  checkSupabaseEnv,
  checkClerkEnv,
  checkApiEnv,
  checkAllRequiredEnv
}; 