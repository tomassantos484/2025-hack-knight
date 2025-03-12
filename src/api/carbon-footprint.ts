import axios from 'axios';

// Get the API key from environment variables
const CLIMATIQ_API_KEY = import.meta.env.VITE_CLIMATIQ_API_KEY || '';

/**
 * Calculate carbon footprint for a list of items
 * This function handles the secure communication with the Climatiq API
 * @param items List of items to calculate carbon footprint for
 * @returns Carbon footprint data
 */
export const calculateCarbonFootprint = async (items: string[]) => {
  try {
    console.log('API: Calculating carbon footprint for items:', items);
    
    // Make the API call with the secure API key
    const response = await axios.post('https://beta3.api.climatiq.io/estimate', {
      items: items.map(item => ({
        name: item,
        quantity: 1
      }))
    }, {
      headers: {
        'Authorization': `Bearer ${CLIMATIQ_API_KEY}`
      }
    });
    
    return {
      success: true,
      data: {
        totalCarbon: response.data.total_carbon,
        details: response.data.details || []
      }
    };
  } catch (error) {
    console.error('API: Error calculating carbon footprint:', error);
    
    // If we can't connect to the Climatiq API, provide a fallback calculation
    // This is a simplified estimation for demonstration purposes
    if (axios.isAxiosError(error) && (error.code === 'ECONNREFUSED' || error.response?.status === 401)) {
      console.log('Using fallback carbon footprint calculation');
      const estimatedFootprint = estimateCarbonFootprint(items);
      
      return {
        success: true,
        data: {
          totalCarbon: estimatedFootprint,
          details: [],
          isEstimate: true
        }
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calculating carbon footprint'
    };
  }
};

/**
 * Fallback function to estimate carbon footprint when API is unavailable
 * This is a simplified estimation for demonstration purposes
 * @param items List of items
 * @returns Estimated carbon footprint
 */
const estimateCarbonFootprint = (items: string[]): number => {
  // Very simplified estimation based on item keywords
  let totalFootprint = 0;
  
  items.forEach(item => {
    const itemLower = item.toLowerCase();
    
    // Assign carbon values based on keywords (very simplified)
    if (itemLower.includes('meat') || itemLower.includes('beef')) {
      totalFootprint += 2.5; // Higher carbon footprint for meat
    } else if (itemLower.includes('dairy') || itemLower.includes('milk') || itemLower.includes('cheese')) {
      totalFootprint += 1.2;
    } else if (itemLower.includes('plastic')) {
      totalFootprint += 0.8;
    } else if (itemLower.includes('organic') || itemLower.includes('vegetable') || itemLower.includes('fruit')) {
      totalFootprint += 0.3; // Lower carbon footprint for organic produce
    } else {
      totalFootprint += 0.5; // Default value for other items
    }
  });
  
  return parseFloat(totalFootprint.toFixed(2));
}; 