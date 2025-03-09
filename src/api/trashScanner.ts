import axios from 'axios';

// Define the base URL for the API
// Use environment variable if available, otherwise use the deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://2025-hack-knight.vercel.app';

console.log('Using API base URL:', API_BASE_URL);

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
    return response.status === 200;
  } catch (error) {
    console.error('Error connecting to API server:', error);
    // Log more details about the error
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : 'No response',
        request: error.request ? 'Request was made but no response received' : 'No request was made'
      });
    }
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
    console.log(`Sending image data of length: ${imageBase64.length}`);
    
    // Make sure the image data is in the correct format
    // If it doesn't start with 'data:', add the prefix
    const formattedImageData = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;
    
    console.log('Sending request to:', `${API_BASE_URL}/api/classify-trash`);
    
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
    console.error('Error classifying trash image:', error);
    throw error;
  }
}; 