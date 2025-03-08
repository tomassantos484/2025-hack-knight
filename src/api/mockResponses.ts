// Mock responses for the EcoChatbot when the Gemini API is unavailable
const mockResponses: Record<string, string> = {
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
    "Fresh water is a precious resource - every drop counts!",
  
  energy: "Energy saving tips:\n\n" +
    "• Switch to LED light bulbs\n" +
    "• Unplug electronics when not in use\n" +
    "• Use smart power strips\n" +
    "• Adjust your thermostat (lower in winter, higher in summer)\n" +
    "• Air dry clothes when possible\n" +
    "• Use energy-efficient appliances\n" +
    "• Consider solar panels if feasible\n\n" +
    "Saving energy reduces both your carbon footprint and your utility bills!",
  
  recycle: "Recycling tips:\n\n" +
    "• Know your local recycling guidelines\n" +
    "• Clean containers before recycling\n" +
    "• Remove lids and separate materials when required\n" +
    "• Don't bag recyclables unless specified\n" +
    "• Avoid wishcycling (putting non-recyclable items in recycling)\n" +
    "• Consider composting for food waste\n\n" +
    "Remember: Reduce and Reuse come before Recycle for a reason!",
    
  ecovision: "EcoVision is a sustainability tracking application designed to help you monitor and improve your environmental impact. With EcoVision, you can:\n\n" +
    "• Track your daily eco-friendly actions\n" +
    "• Use the Trash Scanner to identify recyclable items\n" +
    "• Earn Buds in your EcoWallet for sustainable choices\n" +
    "• Upload receipts to analyze your purchases' environmental impact\n" +
    "• View your personal sustainability statistics\n\n" +
    "Is there a specific EcoVision feature you'd like to learn more about?",
    
  buds: "Buds are EcoVision's sustainability rewards currency. You earn Buds when you:\n\n" +
    "• Log eco-friendly actions in the app\n" +
    "• Purchase eco-friendly products (tracked through Receiptify)\n" +
    "• Complete sustainability challenges\n" +
    "• Properly recycle items using the Trash Scanner\n\n" +
    "You can redeem your Buds for digital badges, eco-friendly merchandise, or donate them to environmental causes through the EcoWallet feature.",
    
  wallet: "The EcoWallet feature in EcoVision allows you to:\n\n" +
    "• Track your earned Buds (sustainability rewards)\n" +
    "• View your transaction history\n" +
    "• Redeem Buds for digital badges\n" +
    "• Purchase eco-friendly merchandise\n" +
    "• Donate to environmental causes\n\n" +
    "It's a great way to see the tangible benefits of your sustainable choices!",
    
  receiptify: "Receiptify is an innovative feature in EcoVision that allows you to:\n\n" +
    "• Upload photos of your shopping receipts\n" +
    "• Get AI analysis of your purchases' environmental impact\n" +
    "• Identify which items are eco-friendly\n" +
    "• Earn Buds for sustainable purchases\n" +
    "• Receive personalized recommendations for eco-friendly alternatives\n\n" +
    "It's like having a sustainability expert review your shopping habits!",
    
  scanner: "The Trash Scanner in EcoVision helps you properly dispose of waste items:\n\n" +
    "• Take a photo of any item you're unsure how to dispose of\n" +
    "• The AI identifies the material and composition\n" +
    "• Get specific instructions on whether to recycle, compost, or trash\n" +
    "• Learn about local disposal guidelines\n" +
    "• Earn Buds for properly recycling items\n\n" +
    "It's a powerful tool to reduce contamination in recycling streams and divert waste from landfills.",
    
  help: "I can help you with various sustainability topics, including:\n\n" +
    "• Reducing your carbon footprint\n" +
    "• Recycling and waste management\n" +
    "• Energy and water conservation\n" +
    "• Sustainable shopping practices\n" +
    "• Composting and food waste\n" +
    "• EcoVision app features and usage\n\n" +
    "What specific topic would you like to explore today?",
};

// Additional response patterns for common questions
const responsePatterns = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: mockResponses.greeting
  },
  {
    keywords: ['what can you do', 'what do you do', 'help me', 'how can you help'],
    response: mockResponses.help
  },
  {
    keywords: ['ecovision', 'app', 'application', 'about the app'],
    response: mockResponses.ecovision
  },
  {
    keywords: ['bud', 'buds', 'points', 'rewards', 'earn'],
    response: mockResponses.buds
  },
  {
    keywords: ['wallet', 'ecowallet', 'redeem', 'spend'],
    response: mockResponses.wallet
  },
  {
    keywords: ['receipt', 'receiptify', 'scan receipt', 'upload receipt'],
    response: mockResponses.receiptify
  },
  {
    keywords: ['trash', 'scanner', 'trash scanner', 'dispose', 'throw away'],
    response: mockResponses.scanner
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
    keywords: ['shop', 'buy', 'purchase', 'shopping'],
    response: mockResponses.shopping
  },
  {
    keywords: ['water', 'shower', 'conserve', 'drought'],
    response: mockResponses.water
  },
  {
    keywords: ['energy', 'electricity', 'power', 'solar'],
    response: mockResponses.energy
  },
  {
    keywords: ['recycle', 'recycling', 'waste', 'garbage'],
    response: mockResponses.recycle
  }
];

export function getMockResponse(query: string): string {
  // Convert query to lowercase for matching
  const lowercaseQuery = query.toLowerCase();
  
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
  
  if (lowercaseQuery.includes('how are you') || lowercaseQuery.includes('how do you feel')) {
    return "I'm functioning well, thank you for asking! I'm here to help with your sustainability questions. What eco-friendly topic would you like to explore today?";
  }
  
  if (lowercaseQuery.length < 10) {
    return "I'd be happy to help with that. Could you provide a bit more detail about what you'd like to know regarding sustainability or eco-friendly practices?";
  }
  
  // Default response if no keywords match
  return mockResponses.default;
} 