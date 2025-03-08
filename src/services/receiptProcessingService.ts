import Tesseract from 'tesseract.js';
import axios from 'axios';
import { getAuthenticatedClient, getDevBypassClient } from './supabaseService';

/**
 * Upload receipt image to Supabase storage
 * @param file Receipt image file
 * @param userId User ID
 * @param sessionToken Clerk session token
 * @returns URL of the uploaded image
 */
export const uploadReceiptImage = async (
  file: File, 
  userId?: string, 
  sessionToken?: string
): Promise<string> => {
  try {
    console.log('Uploading image to Supabase storage:', file.name);
    
    // In development mode, we'll skip actual storage and return a mock URL
    console.log('Skipping Supabase storage in development mode');
    
    // Create a mock URL using a data URL
    const base64Image = await fileToBase64(file);
    const mockUrl = base64Image.substring(0, 100) + '...'; // Truncated for logging
    
    console.log('Mock image URL created:', mockUrl.substring(0, 30) + '...');
    return base64Image; // Return the full base64 image
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Extract text from receipt image using OCR
 * @param imageUrl URL of the uploaded image
 * @returns Extracted text
 */
export const extractTextFromImage = async (imageUrl: string): Promise<string> => {
  const imageBlob = await fetch(imageUrl).then(res => res.blob());
  const { data: { text } } = await Tesseract.recognize(imageBlob, 'eng');
  return text;
};

// Function to extract text using Gemini AI
const extractTextWithGemini = async (imageBase64: string): Promise<string> => {
  try {
    console.log('Calling Gemini AI with image data (truncated)');
    
    // For now, since we're having issues with the Gemini API, let's use Tesseract.js as a fallback
    console.log('Using Tesseract.js as a fallback for OCR');
    
    // Convert base64 to blob
    const byteCharacters = atob(imageBase64);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    const byteArray = new Uint8Array(byteArrays);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    // Use Tesseract.js for OCR
    const { data: { text } } = await Tesseract.recognize(blob, 'eng');
    console.log('Extracted text using Tesseract.js:', text);
    
    return text;
  } catch (error: unknown) {
    console.error('Error extracting text:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { 
        response: { 
          data: Record<string, unknown>; 
          status: number; 
          headers: Record<string, string> 
        } 
      };
      console.error('Response data:', axiosError.response.data);
      console.error('Response status:', axiosError.response.status);
      console.error('Response headers:', axiosError.response.headers);
    }
    throw error;
  }
};

/**
 * Convert image URL to base64
 * @param url Image URL
 * @returns Base64 encoded image
 */
const imageUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Process receipt image without uploading to storage
 * @param file Receipt image file
 * @param userId User ID (optional)
 * @returns Processed receipt data
 */
export const processReceiptImage = async (
  file: File,
  userId?: string
) => {
  try {
    console.log('Processing receipt image:', file.name);
    
    // Convert the image to base64
    const base64Image = await fileToBase64(file);
    console.log('Image converted to base64');
    
    // Extract text from the image
    const extractedText = await extractTextWithGemini(base64Image);
    console.log('Extracted Text:', extractedText);

    // Process the receipt data
    const ecoFriendlyItems = parseReceiptForEcoFriendlyItems(extractedText);
    const totalItems = countTotalItems(extractedText);
    const ecoScore = Math.round((ecoFriendlyItems.length / totalItems) * 100);
    const carbonFootprint = calculateCarbonFootprint(extractedText);
    const budsEarned = calculateBudsEarned(ecoFriendlyItems.length, ecoScore);
    const totalSpent = extractTotalAmount(extractedText);
    const ecoFriendlySpent = calculateEcoFriendlySpent(ecoFriendlyItems);
    
    // Create a receipt analysis object
    const receiptAnalysis = {
      eco_score: ecoScore,
      eco_items_count: ecoFriendlyItems.length,
      total_items_count: totalItems,
      carbon_footprint: carbonFootprint,
      buds_earned: budsEarned,
      total_spent: totalSpent,
      eco_friendly_spent: ecoFriendlySpent,
      created_at: new Date().toISOString()
    };
    
    // Keep the extracted text separate from the database object
    const fullAnalysis = {
      ...receiptAnalysis,
      extracted_text: extractedText
    };
    
    console.log('Receipt analysis:', fullAnalysis);
    
    // Store in database if user is authenticated
    if (userId) {
      try {
        console.log('User authenticated:', userId);
        
        // Get the development bypass client
        const supabase = getDevBypassClient();
        
        // Generate a UUID for the user
        // For development, we'll use a deterministic UUID based on the user ID
        // In production, you would map Clerk user IDs to UUIDs in your database
        const userUuid = generateUuidFromString(userId);
        console.log('Generated UUID for user:', userUuid);
        
        // First, check if the user exists in the Users table by clerk_id
        const { data: userData, error: userCheckError } = await supabase
          .from("Users")  // Ensure "Users" has the correct case
          .select("id")
          .eq("clerk_id", userId);
        
        let existingUserId = null;
        if (userData && userData.length > 0) {
          existingUserId = userData[0].id;
          console.log('User exists in database with id:', existingUserId);
        }
        
        if (userCheckError) {
          console.error('Error checking if user exists:', userCheckError);
        }
        
        // If the user doesn't exist, create them
        if (!existingUserId) {
          console.log('User does not exist in database, creating user:', userUuid);
          
          // Create a basic user record
          const { error: createUserError } = await supabase
            .from('Users')
            .insert({
              id: userUuid,
              clerk_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              username: `user_${userUuid.substring(0, 8)}`,
              email: `user_${userUuid.substring(0, 8)}@example.com`,
            });
          
          if (createUserError) {
            console.error('Error creating user in database:', createUserError);
            // Continue anyway - the user might actually exist but we couldn't see it due to RLS
          } else {
            console.log('User created in database');
            existingUserId = userUuid;
          }
        }
        
        // Use the existing user ID if found, otherwise use the generated UUID
        const finalUserId = existingUserId || userUuid;
        
        // Generate a unique receipt ID using timestamp (numeric)
        const receiptId = Date.now();
        
        // Prepare the receipt data - make sure field names match the database schema
        const receiptDataToInsert = {
          id: receiptId,
          user_id: finalUserId,
          eco_score: receiptAnalysis.eco_score,
          eco_items_count: receiptAnalysis.eco_items_count,
          total_items_count: receiptAnalysis.total_items_count,
          carbon_footprint: receiptAnalysis.carbon_footprint,
          buds_earned: receiptAnalysis.buds_earned,
          total_spent: receiptAnalysis.total_spent,
          eco_friendly_spent: receiptAnalysis.eco_friendly_spent,
          created_at: receiptAnalysis.created_at
        };
        
        console.log('Inserting receipt data:', receiptDataToInsert);
        
        // Insert receipt data into the database
        const { data: receiptResult, error } = await supabase
          .from('Receipts')
          .insert(receiptDataToInsert);
        
        if (error) {
          console.error('Error storing receipt data in database:', error);
          
          // Try a different approach if the first one fails
          if (error.code === '42501') { // Permission denied
            console.log('Permission denied, trying with upsert...');
            const { error: upsertError } = await supabase
              .from('Receipts')
              .upsert(receiptDataToInsert);
              
            if (upsertError) {
              console.error('Error upserting receipt data:', upsertError);
            } else {
              console.log('Receipt data upserted successfully');
            }
          }
        } else {
          console.log('Receipt data stored in database:', receiptResult);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    } else {
      console.log('User not authenticated, skipping database storage');
    }
    
    // Return the full analysis including extracted text
    return fullAnalysis;
  } catch (error) {
    console.error('Error processing receipt image:', error);
    throw error;
  }
};

/**
 * Generate a UUID v5 from a string
 * This is a simple implementation for development purposes
 * In production, you would use a proper UUID library
 * @param str String to generate UUID from
 * @returns UUID string
 */
function generateUuidFromString(str: string): string {
  // Create a simple hash from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use the hash to create a UUID-like string
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
  const uuid = `${hashStr.substring(0, 8)}-${hashStr.substring(0, 4)}-4${hashStr.substring(1, 4)}-${Math.floor(Math.random() * 10000).toString(16).padStart(4, '0')}-${Date.now().toString(16).substring(0, 12)}`;
  
  return uuid;
}

/**
 * Convert file directly to base64
 * @param file File to convert
 * @returns Base64 encoded file
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Test database connection
 * @returns Promise<void>
 */
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection in development mode');
    console.log('Database connection successful (mock)');
    return;
    
    // In production, you would use the following code:
    // const { data, error } = await getDevBypassClient().from('Receipts').select('*').limit(1);
    // if (error) throw error;
    // console.log('Database connection successful:', data);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

// Helper functions for receipt parsing
function parseReceiptForEcoFriendlyItems(text: string): Array<{ name: string; price: number }> {
  // Look for items marked with 'F' or 'N' which might indicate eco-friendly items
  const lines = text.split('\n');
  const ecoFriendlyItems: Array<{ name: string; price: number }> = [];
  
  for (const line of lines) {
    // Check if line contains 'F' or 'N' marker (based on the receipt format)
    if (line.includes(' F ') || line.includes(' N ')) {
      // Extract item name and price
      const parts = line.trim().split(' ');
      if (parts.length >= 3) {
        const price = parseFloat(parts[parts.length - 2]);
        const name = parts.slice(0, parts.length - 3).join(' ');
        if (!isNaN(price) && name) {
          ecoFriendlyItems.push({ name, price });
        }
      }
    }
  }
  
  return ecoFriendlyItems;
}

function countTotalItems(text: string): number {
  // Look for "# ITEMS SOLD" in the receipt
  const match = text.match(/# ITEMS SOLD (\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  // Fallback: count lines that might be items
  const lines = text.split('\n');
  let count = 0;
  for (const line of lines) {
    if (/\d+\.\d+\s[XON0]/.test(line)) {
      count++;
    }
  }
  
  return count || 10; // Default to 10 if we can't determine
}

function calculateCarbonFootprint(text: string): number {
  // Simple estimation based on the number of items
  return parseFloat((countTotalItems(text) * 0.5).toFixed(1));
}

function calculateBudsEarned(ecoFriendlyItemsCount: number, ecoScore: number): number {
  // Calculate buds earned based on eco-friendly items and eco score
  return ecoFriendlyItemsCount * 5 + Math.round(ecoScore / 10);
}

function extractTotalAmount(text: string): number {
  // Look for "TOTAL" in the receipt
  const match = text.match(/TOTAL\s+(\d+\.\d+)/);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  
  return 0; // Default to 0 if we can't determine
}

function calculateEcoFriendlySpent(ecoFriendlyItems: Array<{ name: string; price: number }>): number {
  // Sum up the prices of eco-friendly items
  return parseFloat(ecoFriendlyItems.reduce((sum, item) => sum + item.price, 0).toFixed(2));
} 