/**
 * Utility to check if the Gemini API key is properly loaded
 */

// Check if the Gemini API key is available
export function checkGeminiApiKey(): { isAvailable: boolean; message: string } {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return {
        isAvailable: false,
        message: "Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file."
      };
    }
    
    if (typeof apiKey !== 'string' || apiKey.trim() === '') {
      return {
        isAvailable: false,
        message: "Gemini API key is empty. Please set a valid API key in your .env file."
      };
    }
    
    // Check if it looks like a valid API key format (basic check)
    if (!apiKey.startsWith('AI') && apiKey.length < 20) {
      return {
        isAvailable: false,
        message: "Gemini API key appears to be invalid. Please check your .env file."
      };
    }
    
    return {
      isAvailable: true,
      message: "Gemini API key is available."
    };
  } catch (error) {
    console.error("Error checking Gemini API key:", error);
    return {
      isAvailable: false,
      message: "Error accessing environment variables. Please check your configuration."
    };
  }
}

// Log API key status on app initialization
export function logApiKeyStatus() {
  const status = checkGeminiApiKey();
  if (status.isAvailable) {
    console.log("✅ Gemini API key is available and valid.");
  } else {
    console.warn(`⚠️ ${status.message}`);
    console.warn("The chatbot will use mock responses instead of the Gemini API.");
  }
} 