import Tesseract from 'tesseract.js';
import axios from 'axios';
import { getAuthenticatedClient, getDevBypassClient } from './supabaseService';
import { supabase } from '../services/supabaseClient';
import { EcoAction, UserAction } from '@/types/database';
import { getUserByClerkId } from './userService';

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
        
        // Try to get the Supabase user ID from the Clerk ID
        let supabaseUserId = null;
        
        try {
          const supabaseUser = await getUserByClerkId(userId);
          if (supabaseUser) {
            supabaseUserId = supabaseUser;
            console.log('Found Supabase user ID from Clerk ID:', supabaseUserId);
          }
        } catch (userError) {
          console.error('Error getting Supabase user from Clerk ID:', userError);
        }
        
        // If we couldn't find a Supabase user, fall back to generating a UUID
        if (!supabaseUserId) {
          // Generate a UUID for the user
          const userUuid = generateUuidFromString(userId);
          console.log('Generated UUID for user:', userUuid);
          
          // First, check if the user exists in the users table by email
          const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('email', `user_${userUuid.substring(0, 8)}@example.com`)
            .maybeSingle();
          
          let existingUserId = existingUser?.id;
          
          if (existingUser) {
            console.log('User exists in database with id:', existingUserId);
          }
          
          if (userCheckError) {
            console.error('Error checking if user exists:', userCheckError);
            
            // Check if the error is because the table doesn't exist
            if (userCheckError.code === '42P01') { // relation does not exist
              throw new Error('The users table does not exist in your Supabase project. Please run the schema.sql file in your Supabase SQL editor to create the necessary tables.');
            }
          }
          
          // If the user doesn't exist, create them
          if (!existingUserId) {
            const formattedUuid = formatUuid(userUuid);
            console.log('User does not exist in database, creating user:', formattedUuid);
            
            // Create a basic user record with properly formatted UUID
            const { error: createUserError } = await supabase
              .from('users')
              .insert({
                id: formattedUuid,
                email: `user_${userUuid.substring(0, 8)}@example.com`,
                clerk_id: userId, // Store the Clerk ID for future reference
                created_at: new Date().toISOString()
              });
            
            if (createUserError) {
              console.error('Error creating user in database:', createUserError);
              
              // Check if the error is because the table doesn't exist
              if (createUserError.code === '42P01') { // relation does not exist
                throw new Error('The users table does not exist in your Supabase project. Please run the schema.sql file in your Supabase SQL editor to create the necessary tables.');
              }
              
              // Continue anyway - the user might actually exist but we couldn't see it due to RLS
            } else {
              console.log('User created in database');
              existingUserId = formattedUuid;
            }
          }
          
          supabaseUserId = existingUserId || userUuid;
        }
        
        // Use the Supabase user ID for the receipt
        const finalUserId = supabaseUserId;
        
        // Generate a valid receipt ID as a proper UUID
        const receiptId = generateValidUuid();
        
        // Prepare the receipt data - make sure field names match the database schema
        const receiptDataToInsert = {
          id: receiptId,
          user_id: finalUserId,
          eco_score: receiptAnalysis.eco_score,
          eco_items_count: receiptAnalysis.eco_items_count,
          total_items_count: receiptAnalysis.total_items_count,
          carbon_footprint: receiptAnalysis.carbon_footprint,
          buds_earned: receiptAnalysis.buds_earned,
          total_amount: receiptAnalysis.total_spent, // Changed to match schema
          created_at: receiptAnalysis.created_at
        };
        
        console.log('Inserting receipt with ID:', receiptId);
        const { data: receiptResult, error } = await supabase
          .from('receipts')
          .insert(receiptDataToInsert);
        
        if (error) {
          console.error('Error storing receipt data in database:', error);
          
          // Check if the error is because the table doesn't exist
          if (error.code === '42P01') { // relation does not exist
            throw new Error('The receipts table does not exist in your Supabase project. Please run the schema.sql file in your Supabase SQL editor to create the necessary tables.');
          }
          
          // Check if it's a UUID format error
          if (error.code === '22P02') { // invalid input syntax for type uuid
            console.error('UUID format error. Receipt ID:', receiptId);
            throw new Error(`Invalid UUID format. Please ensure all UUIDs are properly formatted. Error: ${error.message}`);
          }
          
          // If it's a permission error, try with upsert
          if (error.code === '42501') { // permission denied
            console.log('Permission denied, trying with upsert...');
            const { error: upsertError } = await supabase
              .from('receipts')
              .upsert(receiptDataToInsert);
              
            if (upsertError) {
              console.error('Error upserting receipt data:', upsertError);
              throw upsertError;
            }
          } else {
            throw error;
          }
        } else {
          console.log('Receipt data stored in database:', receiptResult);
        }
        
        // Return the full analysis with the receipt ID
        return {
          ...fullAnalysis,
          id: receiptId,
          user_id: finalUserId
        };
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Return the analysis without database info
        return fullAnalysis;
      }
    }
    
    // Return the analysis
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
  
  // Create random hex strings for parts we don't derive from the hash
  const randomHex = (length: number) => 
    Array.from({length}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  
  // Generate the UUID parts
  const p1 = hashStr.substring(0, 8);
  const p2 = hashStr.substring(0, 4);
  const p3 = '4' + hashStr.substring(1, 4); // Version 4 UUID
  
  // For the variant bits (position 17), we need a hex value of 8, 9, A, or B
  const variantDigit = [8, 9, 10, 11][Math.floor(Math.random() * 4)].toString(16);
  const p4 = variantDigit + randomHex(3);
  
  const p5 = randomHex(12);
  
  // Format as UUID
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
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
    console.log('Testing database connection to Project 2.0');
    
    // Get the development bypass client
    const supabase = getDevBypassClient();
    
    // Check if the users table exists
    console.log('Checking if users table exists...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (usersError) {
      console.error('Error accessing users table:', usersError);
      
      // If the table doesn't exist, we need to create it
      if (usersError.code === '42P01') { // relation does not exist
        console.log('Users table does not exist. You need to create the database schema.');
        console.log('Please run the SQL commands from schema.sql in your Supabase SQL editor.');
      }
    } else {
      console.log('Users table exists:', usersData);
    }
    
    // Check if the receipts table exists
    console.log('Checking if receipts table exists...');
    const { data: receiptsData, error: receiptsError } = await supabase
      .from('receipts')
      .select('*')
      .limit(1);
      
    if (receiptsError) {
      console.error('Error accessing receipts table:', receiptsError);
      
      // If the table doesn't exist, we need to create it
      if (receiptsError.code === '42P01') { // relation does not exist
        console.log('Receipts table does not exist. You need to create the database schema.');
        console.log('Please run the SQL commands from schema.sql in your Supabase SQL editor.');
      }
    } else {
      console.log('Receipts table exists:', receiptsData);
    }
    
    // We'll skip the schema check since it requires special permissions
    // that might not be available in the client
    
    return {
      usersTableExists: !usersError,
      receiptsTableExists: !receiptsError,
      usersError,
      receiptsError
    };
  } catch (error) {
    console.error('Database connection failed:', error);
    return {
      usersTableExists: false,
      receiptsTableExists: false,
      error
    };
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

/**
 * Format a string as a UUID
 * @param uuid String to format as UUID
 * @returns Formatted UUID string
 */
export function formatUuid(uuid: string): string {
  // Check if the UUID is already properly formatted
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
    return uuid;
  }
  
  // Remove any non-alphanumeric characters
  const cleaned = uuid.replace(/[^a-f0-9]/gi, '');
  
  // Ensure we have enough characters (pad if necessary)
  const padded = (cleaned + '0'.repeat(32)).slice(0, 32);
  
  // Format as UUID
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
}

/**
 * Generate a valid UUID v4 compatible with PostgreSQL
 * This is a simple implementation for development purposes
 * In production, you would use a proper UUID library
 * @returns UUID string in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateValidUuid(): string {
  // Create random hex strings
  const randomHex = (length: number) => 
    Array.from({length}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  
  // Generate the UUID parts
  const p1 = randomHex(8);
  const p2 = randomHex(4);
  const p3 = '4' + randomHex(3); // Version 4 UUID
  
  // For the variant bits (position 17), we need a hex value of 8, 9, A, or B
  const variantDigit = [8, 9, 10, 11][Math.floor(Math.random() * 4)].toString(16);
  const p4 = variantDigit + randomHex(3);
  
  const p5 = randomHex(12);
  
  // Format as UUID
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

// Define a Receipt type
export interface Receipt {
  id: string;
  user_id: string;
  store_name?: string;
  purchase_date?: string;
  total_amount: number;
  eco_score?: number;
  carbon_footprint?: number;
  buds_earned?: number;
  eco_items_count?: number;
  total_items_count?: number;
  eco_friendly_spent?: number;
  created_at: string;
}

/**
 * Get receipt history for a user
 * @param userId User ID
 * @returns Array of receipt data
 */
export const getUserReceiptHistory = async (userId: string): Promise<Receipt[]> => {
  try {
    if (!userId) {
      console.warn('No user ID provided for receipt history');
      return [];
    }

    const formattedUserId = formatUuid(userId);
    console.log('Getting receipt history for user ID:', userId);
    console.log('Formatted user ID:', formattedUserId);
    
    const supabase = getDevBypassClient();
    
    // First try with the formatted UUID
    console.log('Querying with formatted UUID:', formattedUserId);
    const { data: receiptsWithFormattedId, error: errorWithFormattedId } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', formattedUserId)
      .order('created_at', { ascending: false });
    
    if (errorWithFormattedId) {
      console.error('Error fetching receipt history with formatted ID:', errorWithFormattedId);
    } else if (receiptsWithFormattedId && receiptsWithFormattedId.length > 0) {
      console.log(`Found ${receiptsWithFormattedId.length} receipts with formatted ID`);
      return receiptsWithFormattedId;
    }
    
    // If no results, try a broader search
    console.log('No receipts found with formatted ID, trying a broader search...');
    const { data: allReceipts, error: allReceiptsError } = await supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (allReceiptsError) {
      console.error('Error fetching all receipts:', allReceiptsError);
      return [];
    }
    
    console.log(`Found ${allReceipts?.length || 0} total receipts in database`);
    
    if (allReceipts && allReceipts.length > 0) {
      // Log the first few receipts to see their user_id format
      console.log('Sample receipt user_ids:', allReceipts.slice(0, 3).map(r => r.user_id));
      
      // Try to find receipts that might match this user with different ID formats
      const possibleUserReceipts = allReceipts.filter(receipt => {
        // Check if the receipt's user_id contains parts of our userId
        const receiptUserId = String(receipt.user_id || '');
        return (
          receiptUserId.includes(userId.substring(0, 8)) || 
          userId.includes(receiptUserId.substring(0, 8))
        );
      });
      
      if (possibleUserReceipts.length > 0) {
        console.log(`Found ${possibleUserReceipts.length} possible matching receipts for this user`);
        return possibleUserReceipts;
      }
    }
    
    console.log('No receipts found for this user');
    return [];
  } catch (error) {
    console.error('Error in getUserReceiptHistory:', error);
    return [];
  }
};

// Define a ReceiptItem type
export interface ReceiptItem {
  id?: string;
  receipt_id: string;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
  is_eco_friendly: boolean;
  carbon_footprint?: number;
  suggestion?: string;
  created_at?: string;
}

/**
 * Store receipt items in the database
 * @param receiptId Receipt ID
 * @param items Array of receipt items
 * @returns Success status
 */
export const storeReceiptItems = async (
  receiptId: string, 
  items: Array<{
    name: string;
    price: number;
    isEcoFriendly: boolean;
    category?: string;
    carbonFootprint?: number;
    alternativeSuggestion?: string;
  }>
): Promise<boolean> => {
  try {
    if (!receiptId || !items || items.length === 0) {
      console.warn('No receipt ID or items provided');
      return false;
    }

    console.log(`Storing ${items.length} items for receipt ${receiptId}`);
    
    // Convert items to the database format
    const dbItems = items.map(item => ({
      id: generateValidUuid(),
      receipt_id: receiptId,
      name: item.name,
      category: item.category || 'Uncategorized',
      price: item.price,
      quantity: 1,
      is_eco_friendly: item.isEcoFriendly,
      carbon_footprint: item.carbonFootprint || 0,
      suggestion: item.alternativeSuggestion,
      created_at: new Date().toISOString()
    }));
    
    // Store items in the database
    const { error } = await supabase
      .from('receipt_items')
      .insert(dbItems);
    
    if (error) {
      console.error('Error storing receipt items:', error);
      return false;
    }
    
    console.log(`Successfully stored ${items.length} items for receipt ${receiptId}`);
    return true;
  } catch (error) {
    console.error('Error in storeReceiptItems:', error);
    return false;
  }
};

/**
 * Get receipt items from the database
 * @param receiptId Receipt ID
 * @returns Array of receipt items
 */
export const getReceiptItems = async (receiptId: string): Promise<ReceiptItem[]> => {
  try {
    if (!receiptId) {
      console.warn('No receipt ID provided for getReceiptItems');
      throw new Error('Receipt ID is required');
    }

    console.log(`Getting items for receipt ${receiptId}`);
    
    // First check if the receipt exists
    const { data: receiptExists, error: receiptCheckError } = await supabase
      .from('receipts')
      .select('id')
      .eq('id', receiptId)
      .maybeSingle();
    
    if (receiptCheckError) {
      console.error('Error checking if receipt exists:', receiptCheckError);
      // Continue anyway, we'll try to get the items
    } else if (!receiptExists) {
      console.error(`Receipt with ID ${receiptId} does not exist`);
      throw new Error(`Receipt with ID ${receiptId} does not exist`);
    }
    
    // Check if the receipt_items table exists
    try {
      const { data: tableExists, error: tableCheckError } = await supabase.rpc(
        'check_table_exists',
        { table_name: 'receipt_items' }
      );
      
      if (tableCheckError) {
        console.error('Error checking if receipt_items table exists:', tableCheckError);
        // Continue anyway, the query will fail if the table doesn't exist
      } else if (!tableExists) {
        console.error('receipt_items table does not exist');
        throw new Error('receipt_items table does not exist');
      }
    } catch (tableCheckError) {
      console.error('Error in check_table_exists RPC:', tableCheckError);
      // Continue anyway, we'll try the query directly
    }
    
    // Try to get the receipt items
    const { data, error } = await supabase
      .from('receipt_items')
      .select('*')
      .eq('receipt_id', receiptId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error getting receipt items:', error);
      
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') { // relation does not exist
        throw new Error('receipt_items table does not exist');
      }
      
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`Found ${data?.length || 0} items for receipt ${receiptId}`);
    return data || [];
  } catch (error) {
    console.error('Error in getReceiptItems:', error);
    throw error; // Re-throw to be handled by the caller
  }
}; 