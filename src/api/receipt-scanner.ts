import axios from 'axios';
import { processReceiptImage } from '../services/receiptProcessingService';
import { API_BASE_URL } from './api-config';

/**
 * Process a receipt image and return analysis
 * This function handles the secure communication with the backend API
 * @param imageFile The receipt image file
 * @param userId Optional user ID
 * @returns Receipt analysis data
 */
export const scanReceipt = async (imageFile: File, userId?: string) => {
  try {
    console.log('API: Processing receipt image:', imageFile.name);
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // Add user ID if available
    if (userId) {
      formData.append('userId', userId);
    }
    
    // Call the secure backend endpoint
    const response = await axios.post(`${API_BASE_URL}/api/process-receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    // Check if the request was successful
    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.error || 'Failed to process receipt');
    }
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('API: Error processing receipt:', error);
    
    // If the backend API fails, fall back to the local processing
    try {
      console.log('API: Falling back to local processing');
      const receiptData = await processReceiptImage(imageFile, userId);
      
      return {
        success: true,
        data: receiptData
      };
    } catch (fallbackError) {
      console.error('API: Fallback processing also failed:', fallbackError);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing receipt'
      };
    }
  }
}; 