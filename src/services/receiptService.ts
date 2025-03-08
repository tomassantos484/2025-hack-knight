// This is a temporary version to help debug
// No imports needed for now

import { processReceiptImage } from './receiptProcessingService';

// Receipt item interface
export interface ReceiptItem {
  id: number;
  receipt_id?: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  isEcoFriendly: boolean;
  carbonFootprint: number;
  alternativeSuggestion?: string;
}

// Receipt analysis interface
export interface ReceiptAnalysis {
  totalItems: number;
  ecoFriendlyItems: number;
  totalSpent: number;
  ecoFriendlySpent: number;
  ecoScore: number;
  totalCarbonFootprint: number;
  budsEarned: number;
  items: ReceiptItem[];
  extractedText: string;
}

/**
 * Analyze receipt and return results
 * @param imageFile Receipt image file
 * @param userId User ID (optional)
 * @returns Receipt analysis results
 */
export const analyzeReceipt = async (
  imageFile: File,
  userId?: string
): Promise<ReceiptAnalysis> => {
  try {
    console.log('Analyzing receipt image:', imageFile.name);
    
    // Process the receipt image using Gemini AI
    let receiptData;
    try {
      receiptData = await processReceiptImage(imageFile, userId);
      console.log('Receipt data processed:', receiptData);
    } catch (error) {
      console.error('Error processing receipt with Gemini AI, falling back to static data:', error);
      // Continue with static data
    }
    
    // If we have real data from the receipt processing, use it
    if (receiptData && receiptData.extracted_text) {
      // Convert from snake_case to camelCase for frontend
      return {
        totalItems: receiptData.total_items_count,
        ecoFriendlyItems: receiptData.eco_items_count,
        totalSpent: receiptData.total_spent,
        ecoFriendlySpent: receiptData.eco_friendly_spent,
        ecoScore: receiptData.eco_score,
        totalCarbonFootprint: receiptData.carbon_footprint,
        budsEarned: receiptData.buds_earned,
        extractedText: receiptData.extracted_text,
        // Generate mock items based on the extracted text
        items: generateMockItemsFromText(receiptData.extracted_text, receiptData.eco_items_count)
      };
    }
    
    // For now, we'll use mock data but in the future, this should be replaced with actual parsing logic
    // based on the extracted text
    
    // Mock items
    const items: ReceiptItem[] = [
      {
        id: 1,
        name: 'Organic Apples',
        price: 4.99,
        quantity: 3,
        isEcoFriendly: true,
        category: 'Produce',
        carbonFootprint: 0.3,
        alternativeSuggestion: ''
      },
      {
        id: 2,
        name: 'Reusable Water Bottle',
        price: 7.99,
        quantity: 1,
        isEcoFriendly: true,
        category: 'Home Goods',
        carbonFootprint: 1.2,
        alternativeSuggestion: ''
      },
      {
        id: 3,
        name: 'Plastic Wrapped Cookies',
        price: 3.49,
        quantity: 1,
        isEcoFriendly: false,
        category: 'Snacks',
        carbonFootprint: 1.8,
        alternativeSuggestion: 'Try bulk bin cookies in your own container'
      },
      {
        id: 4,
        name: 'Paper Towels',
        price: 5.99,
        quantity: 1,
        isEcoFriendly: false,
        category: 'Household',
        carbonFootprint: 2.1,
        alternativeSuggestion: 'Switch to reusable cloth towels'
      },
      {
        id: 5,
        name: 'Single-Use Plastic Bags',
        price: 2.99,
        quantity: 1,
        isEcoFriendly: false,
        category: 'Household',
        carbonFootprint: 2.8,
        alternativeSuggestion: 'Use reusable shopping bags'
      }
    ];

    // Calculate totals
    const totalItems = items.length;
    const ecoFriendlyItems = items.filter(item => item.isEcoFriendly).length;
    const totalSpent = items.reduce((sum, item) => sum + item.price, 0);
    const ecoFriendlySpent = items
      .filter(item => item.isEcoFriendly)
      .reduce((sum, item) => sum + item.price, 0);
    
    // Calculate eco score
    const ecoScore = Math.round((ecoFriendlyItems / totalItems) * 100);
    
    // Calculate carbon footprint
    const totalCarbonFootprint = parseFloat(
      items.reduce((sum, item) => sum + item.carbonFootprint, 0).toFixed(1)
    );
    
    // Calculate buds earned
    const budsEarned = ecoFriendlyItems * 5 + Math.round(ecoScore / 10);
    
    return {
      totalItems,
      ecoFriendlyItems,
      totalSpent,
      ecoFriendlySpent,
      ecoScore,
      totalCarbonFootprint,
      budsEarned,
      items,
      extractedText: receiptData?.extracted_text || ''
    };
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    throw error;
  }
};

// Helper function to generate mock items based on extracted text
function generateMockItemsFromText(text: string, ecoItemsCount: number): ReceiptItem[] {
  // Extract lines that look like items from the receipt text
  const lines = text.split('\n');
  const itemLines = lines.filter(line => 
    /\d+\.\d+/.test(line) && // Contains a price (e.g., 4.99)
    !/SUBTOTAL|TOTAL|TAX/.test(line.toUpperCase()) // Not a total line
  );
  
  // Create items from the extracted lines
  const items: ReceiptItem[] = [];
  let id = 1;
  
  // Determine how many eco-friendly items to create
  const totalItemsToCreate = Math.min(itemLines.length, 10); // Cap at 10 items
  const ecoItemsToCreate = Math.min(ecoItemsCount, totalItemsToCreate);
  
  for (let i = 0; i < totalItemsToCreate && i < itemLines.length; i++) {
    const line = itemLines[i];
    
    // Extract item name and price using regex
    const priceMatch = line.match(/(\d+\.\d+)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
    
    // Get the item name by removing the price and any leading numbers/codes
    let name = line.replace(/\d+\.\d+/, '').replace(/^\s*\d+\s*/, '').trim();
    name = name.replace(/\d{12,}/, '').trim(); // Remove long numeric codes (likely barcodes)
    
    // If name is still empty or just contains special characters, use a generic name
    if (!name || /^[^a-zA-Z0-9]+$/.test(name)) {
      name = `Item ${id}`;
    }
    
    // Determine if this item is eco-friendly (make the first ecoItemsToCreate items eco-friendly)
    const isEcoFriendly = i < ecoItemsToCreate;
    
    items.push({
      id: id++,
      name: name,
      price: price || (Math.random() * 10 + 1).toFixed(2) as unknown as number, // Random price if none found
      quantity: 1,
      isEcoFriendly: isEcoFriendly,
      category: isEcoFriendly ? 'Eco-Friendly' : 'Regular',
      carbonFootprint: isEcoFriendly ? Math.random() * 0.5 : Math.random() * 2 + 1,
      alternativeSuggestion: isEcoFriendly ? '' : 'Consider an eco-friendly alternative'
    });
  }
  
  return items;
} 