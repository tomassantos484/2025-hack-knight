// API endpoint to classify trash images using Google's Gemini API
import axios from 'axios';

// Get the API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Main handler function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      // Check if we have an API key
      if (!GEMINI_API_KEY) {
        console.warn('No Gemini API key found. Using mock result.');
        const mockResult = generateMockResult();
        res.status(200).json(mockResult);
        return;
      }

      // Get the image data from the request
      const { image } = req.body;
      
      if (!image) {
        res.status(400).json({ error: 'No image provided' });
        return;
      }
      
      // Extract the base64 data from the data URL
      const base64Image = image.split(',')[1];
      
      // Classify the image using Gemini API
      const result = await classifyTrashWithGemini(base64Image);
      
      // Return the classification result
      res.status(200).json(result);
    } catch (error) {
      console.error('Error classifying trash:', error);
      
      // Return a mock result if there's an error with the API
      console.warn('Error with Gemini API. Falling back to mock result.');
      const mockResult = generateMockResult();
      res.status(200).json({ ...mockResult, error_message: error.message });
    }
    return;
  }
  
  // Handle other methods
  res.status(405).json({ error: 'Method not allowed' });
}

// Export functions for testing
export { classifyTrashWithGemini, generateMockResult, calculateBudsReward };

/**
 * Classify trash image using Google's Gemini API
 * @param {string} base64Image - Base64 encoded image data
 * @returns {object} Classification result
 */
async function classifyTrashWithGemini(base64Image) {
  try {
    // API endpoint for Gemini
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    
    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY
    };
    
    // Prepare request body with a detailed prompt
    const data = {
      contents: [
        {
          parts: [
            {
              text: `Analyze this image of trash and classify it into one of these categories: 'recycle', 'compost', or 'landfill'.
              
              Provide your response in JSON format with the following fields:
              - category: The category (recycle, compost, or landfill)
              - confidence: A number between 1-100 representing your confidence level
              - details: A detailed explanation of why this item belongs in this category, including material composition and environmental impact
              - environmental_impact: A brief explanation of the environmental impact of this type of waste
              - tips: An array of 2-3 specific tips for properly disposing of this item
              - buds_reward: A number between 5-20 representing eco-points (buds) earned for proper disposal
                (recycle: 10-15 buds, compost: 15-20 buds, landfill: 5-10 buds)
              
              Example response format:
              {
                "category": "recycle",
                "confidence": 95,
                "details": "This is a plastic bottle made of PET (polyethylene terephthalate), which is widely recyclable.",
                "environmental_impact": "Recycling plastic bottles reduces landfill waste and conserves resources.",
                "tips": ["Rinse before recycling", "Remove cap and recycle separately", "Check local guidelines"],
                "buds_reward": 12
              }`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };
    
    // Make the API request
    const response = await axios.post(url, data, { headers });
    
    // Extract the text response
    const textResponse = response.data.candidates[0].content.parts[0].text;
    
    // Extract the JSON from the text response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }
    
    // Parse the JSON
    const result = JSON.parse(jsonMatch[0]);
    
    // Validate the result
    if (!result.category || !result.confidence || !result.details || !result.tips) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    // Ensure the category is one of the expected values
    if (!['recycle', 'compost', 'landfill'].includes(result.category)) {
      result.category = 'unknown';
    }
    
    // Ensure tips is an array
    if (!Array.isArray(result.tips)) {
      result.tips = [result.tips];
    }
    
    // Ensure buds_reward is within range
    if (!result.buds_reward || result.buds_reward < 5 || result.buds_reward > 20) {
      result.buds_reward = calculateBudsReward(result.category);
    }
    
    return result;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Calculate buds reward based on category
 * @param {string} category - The waste category
 * @returns {number} Buds reward
 */
function calculateBudsReward(category) {
  switch (category) {
    case 'recycle':
      return Math.floor(Math.random() * 6) + 10; // 10-15
    case 'compost':
      return Math.floor(Math.random() * 6) + 15; // 15-20
    case 'landfill':
      return Math.floor(Math.random() * 6) + 5; // 5-10
    default:
      return 5;
  }
}

/**
 * Generate a mock classification result
 * @returns {object} Mock classification result
 */
function generateMockResult() {
  const categories = ['recycle', 'compost', 'landfill'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  return {
    category: randomCategory,
    confidence: Math.floor(Math.random() * 30) + 70, // 70-99%
    details: `This item appears to be ${randomCategory === 'recycle' ? 'recyclable' : 
              randomCategory === 'compost' ? 'compostable' : 'non-recyclable trash'}. 
              This is a mock result because the Gemini API is not available.`,
    tips: [
      "When in doubt, check your local recycling guidelines.",
      "Clean items before recycling to avoid contamination.",
      "Consider reducing waste by using reusable alternatives."
    ],
    environmental_impact: "Mock result - environmental impact data not available.",
    buds_reward: calculateBudsReward(randomCategory),
    is_mock: true
  };
} 