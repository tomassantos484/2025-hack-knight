/**
 * Safely access environment variables with fallbacks
 * @param key The environment variable key
 * @param defaultValue Optional default value if the environment variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnvVariable(key: string, defaultValue: string = ''): string {
  try {
    const value = import.meta.env[key];
    if (value === undefined) {
      console.warn(`Environment variable ${key} is not defined. Using default value.`);
      return defaultValue;
    }
    return value;
  } catch (error) {
    console.error(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Check if an environment variable is defined
 * @param key The environment variable key
 * @returns True if the environment variable is defined and not empty
 */
export function hasEnvVariable(key: string): boolean {
  try {
    const value = import.meta.env[key];
    return value !== undefined && value !== '';
  } catch (error) {
    console.error(`Error checking environment variable ${key}:`, error);
    return false;
  }
} 