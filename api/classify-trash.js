// API endpoint to classify trash images
export default function handler(req, res) {
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
      // In a real implementation, you would process the image and classify it
      // For now, we'll return a mock result
      const mockResult = generateMockResult();
      
      res.status(200).json(mockResult);
    } catch (error) {
      console.error('Error classifying trash:', error);
      res.status(500).json({ error: 'Failed to classify trash' });
    }
    return;
  }
  
  // Handle other methods
  res.status(405).json({ error: 'Method not allowed' });
}

// Generate a mock classification result
function generateMockResult() {
  const categories = ['recycle', 'compost', 'landfill'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  return {
    category: randomCategory,
    confidence: Math.floor(Math.random() * 30) + 70, // 70-99%
    details: `This item appears to be ${randomCategory === 'recycle' ? 'recyclable' : 
              randomCategory === 'compost' ? 'compostable' : 'non-recyclable trash'}. 
              This is a mock result from the local API.`,
    tips: [
      "When in doubt, check your local recycling guidelines.",
      "Clean items before recycling to avoid contamination.",
      "Consider reducing waste by using reusable alternatives."
    ],
    environmental_impact: "Using local API - environmental impact data not available.",
    buds_reward: 5
  };
} 