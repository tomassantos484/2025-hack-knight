import axios from 'axios';

// Define the base URL for the API
// Use environment variable if available, otherwise use the Railway URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ecovision-backend-production.up.railway.app';

// Log basic information about the API URL
console.log('Using API base URL for trash scanner');

// Flag to enable offline mode if backend is unavailable
let OFFLINE_MODE = false;

// Define the response type
export interface TrashScanResult {
  category: 'recycle' | 'compost' | 'landfill' | 'unknown';
  confidence: number;
  details: string;
  tips: string[];
  environmental_impact?: string;
  buds_reward: number;
  offline_mode?: boolean;
}

/**
 * Tests the connection to the API server
 * @returns A promise that resolves to true if the server is reachable
 */
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    
    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = `${API_BASE_URL}/api/test?t=${timestamp}`;
    console.log('Full URL:', url);
    
    try {
      const response = await axios.get(url, {
        // Add timeout to prevent hanging
        timeout: 5000,
        // Add headers to help with CORS
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API connection test response:', response.status, response.data);
      OFFLINE_MODE = false;
      return response.status === 200;
    } catch (error) {
      console.error('API connection failed, using offline mode:', error);
      OFFLINE_MODE = true;
      return false;
    }
  } catch (error) {
    console.error('Error connecting to API server:', error);
    OFFLINE_MODE = true;
    return false;
  }
};

/**
 * Uploads an image to the trash scanner API and returns the classification result
 * @param imageBase64 - The base64-encoded image data
 * @returns A promise that resolves to the classification result
 */
export const classifyTrashImage = async (imageBase64: string): Promise<TrashScanResult> => {
  try {
    // If offline mode is enabled, return a mock result
    if (OFFLINE_MODE) {
      console.log('Using offline mode for classification');
      return generateMockResult();
    }
    
    console.log(`Sending image data of length: ${imageBase64.length}`);
    
    // Make sure the image data is in the correct format
    // If it doesn't start with 'data:', add the prefix
    const formattedImageData = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;
    
    console.log('Sending request to:', `${API_BASE_URL}/api/classify-trash`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/classify-trash`, {
        image: formattedImageData
      }, {
        // Add timeout to prevent hanging
        timeout: 30000,
        // Add headers to help with CORS
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Classification request failed, using offline mode:', error);
      OFFLINE_MODE = true;
      return generateMockResult();
    }
  } catch (error) {
    console.error('Error classifying trash image:', error);
    OFFLINE_MODE = true;
    return generateMockResult();
  }
};

/**
 * Generates a mock classification result for offline mode
 * @returns A mock classification result
 */
function generateMockResult(): TrashScanResult {
  const categories = ['recycle', 'compost', 'landfill'] as const;
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  const mockResult: TrashScanResult = {
    category: randomCategory,
    confidence: Math.floor(Math.random() * 30) + 70, // 70-99%
    details: `This item appears to be ${randomCategory === 'recycle' ? 'recyclable' : 
              randomCategory === 'compost' ? 'compostable' : 'non-recyclable trash'}. 
              Using offline mode due to backend limitations.`,
    tips: [
      "When in doubt, check your local recycling guidelines.",
      "Clean items before recycling to avoid contamination.",
      "Consider reducing waste by using reusable alternatives."
    ],
    environmental_impact: "Using offline mode - environmental impact data not available.",
    buds_reward: 5,
    offline_mode: true
  };
  
  return mockResult;
} 