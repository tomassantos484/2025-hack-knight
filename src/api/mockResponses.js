// Mock responses for the EcoChatbot when the Gemini API is unavailable
const mockResponses = {
  default: "I understand you're asking about sustainability. While I don't have a specific answer to your exact question, I'd be happy to discuss eco-friendly practices, recycling tips, or ways to reduce your carbon footprint. Could you provide more details about what sustainability topic interests you most?",
  
  greeting: "Hello! I'm EcoBot, your sustainability assistant. I can help with questions about eco-friendly practices, recycling, reducing waste, sustainable living, and more. What would you like to know today?",
  
  carbon: "Here are some effective ways to reduce your carbon footprint:\n\n" +
    "• Use public transportation, bike, or walk instead of driving\n" +
    "• Reduce meat consumption, especially beef\n" +
    "• Choose energy-efficient appliances\n" +
    "• Insulate your home properly\n" +
    "• Support renewable energy sources\n" +
    "• Reduce air travel when possible\n\n" +
    "Even small changes can make a significant difference!",
  
  plastic: "Reducing plastic use is crucial for our environment. Here are some tips:\n\n" +
    "• Carry reusable shopping bags\n" +
    "• Use a refillable water bottle\n" +
    "• Say no to plastic straws and utensils\n" +
    "• Buy products with minimal packaging\n" +
    "• Choose glass or metal containers over plastic\n" +
    "• Try shampoo bars instead of bottled shampoo\n\n" +
    "Remember, the best plastic is the one you don't use!",
  
  compost: "Composting is a great way to reduce waste and create nutrient-rich soil. Here's how to start:\n\n" +
    "• Choose a compost bin or designate an area in your yard\n" +
    "• Add brown materials (leaves, paper) and green materials (food scraps, grass)\n" +
    "• Keep it moist but not wet\n" +
    "• Turn it regularly to aerate\n" +
    "• Be patient - it takes 3-12 months to create finished compost\n\n" +
    "Avoid adding meat, dairy, or oily foods to prevent pests.",
  
  shopping: "Eco-friendly shopping tips:\n\n" +
    "• Buy local to reduce transportation emissions\n" +
    "• Choose organic when possible\n" +
    "• Look for sustainable certifications (Fair Trade, FSC, etc.)\n" +
    "• Bring your own bags and containers\n" +
    "• Buy in bulk to reduce packaging\n" +
    "• Consider second-hand items\n" +
    "• Research brands' sustainability practices\n\n" +
    "Remember, the most sustainable product is often the one you already own!",
  
  water: "Water conservation tips:\n\n" +
    "• Fix leaky faucets and pipes\n" +
    "• Take shorter showers\n" +
    "• Install low-flow fixtures\n" +
    "• Collect rainwater for plants\n" +
    "• Only run full loads in dishwashers and washing machines\n" +
    "• Turn off the tap while brushing teeth\n" +
    "• Water plants in the early morning or evening\n\n" +
    "Fresh water is a precious resource - every drop counts! You should try to reduce your water usage whenever possible."
};

// Additional response patterns for common questions
const responsePatterns = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: mockResponses.greeting
  },
  {
    keywords: ['carbon', 'footprint', 'emissions', 'co2'],
    response: mockResponses.carbon
  },
  {
    keywords: ['plastic', 'single-use', 'disposable'],
    response: mockResponses.plastic
  },
  {
    keywords: ['compost', 'food waste', 'garden waste'],
    response: mockResponses.compost
  },
  {
    keywords: ['shop', 'buy', 'purchase', 'shopping', 'eco shopping', 'sustainable shopping', 'green products'],
    response: mockResponses.shopping
  },
  {
    keywords: ['water', 'shower', 'conserve', 'drought'],
    response: mockResponses.water
  }
];

export function getMockResponse(query) {
  // Convert query to lowercase for matching
  const lowercaseQuery = query.toLowerCase();
  
  // Special handling for greetings
  if (lowercaseQuery.includes('hello') || 
      lowercaseQuery.includes('hi') || 
      lowercaseQuery.includes('hey') || 
      lowercaseQuery.includes('greetings') ||
      lowercaseQuery.includes('good morning') ||
      lowercaseQuery.includes('how are you')) {
    return mockResponses.greeting;
  }
  
  // Check for matches in response patterns
  for (const pattern of responsePatterns) {
    if (pattern.keywords.some(keyword => lowercaseQuery.includes(keyword))) {
      return pattern.response;
    }
  }
  
  // If no specific match, try to provide a contextual response
  if (lowercaseQuery.includes('thank')) {
    return "You're welcome! I'm happy to help with any sustainability questions you have. Is there anything else you'd like to know?";
  }
  
  if (lowercaseQuery.includes('sorry') || lowercaseQuery.includes('apologize')) {
    return "No need to apologize! I'm here to help with your sustainability questions. What would you like to know about eco-friendly practices?";
  }
  
  if (lowercaseQuery.length < 10) {
    return "I'd be happy to help with that. Could you provide a bit more detail about what you'd like to know regarding sustainability or eco-friendly practices?";
  }
  
  // Default response if no keywords match
  return mockResponses.default;
} 