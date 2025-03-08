import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API with the API key from environment variables
const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define the model to use - using the most stable model
const modelName = "gemini-2.0-flash";

// Define the system prompt to guide the AI's responses
const systemPrompt = `You are an eco-friendly AI assistant for EcoVision, a sustainability tracking application. 
Your name is EcoBot.

Your primary goals are to:
1. Provide helpful information about sustainability, eco-friendly practices, and reducing carbon footprints
2. Answer questions about recycling, composting, and proper waste disposal
3. Suggest eco-friendly alternatives to common products and practices
4. Explain environmental concepts in simple, accessible language
5. Encourage and motivate users on their sustainability journey

Keep your responses concise, friendly, and focused on sustainability topics.
If asked about topics unrelated to sustainability or the environment, politely redirect the conversation back to eco-friendly topics.

Important: Never claim to have capabilities you don't have, like accessing the user's personal data or controlling their device.
`;

export async function handleChatRequest(message: string, history: { role: string; content: string }[]) {
  try {
    console.log('Gemini API Key:', GEMINI_API_KEY ? 'Present' : 'Missing');
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is missing');
    }
    
    // For testing - return a mock response if the API is not working
    if (process.env.NODE_ENV === 'development' && !GEMINI_API_KEY.startsWith('AI')) {
      console.log('Using mock response for development');
      return { 
        response: `This is a mock response for development. In production, this would be a real response from the Gemini API about: "${message}"` 
      };
    }
    
    try {
      // Get the model - using the correct parameter structure
      const model = genAI.getGenerativeModel({ model: modelName });
  
      // Prepare the chat history for Gemini API
      // The Gemini API expects the first message to be from the user
      let chatHistory = [];
      
      // Convert history to the format expected by Gemini
      if (history.length > 0) {
        chatHistory = history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));
      }
  
      console.log('Sending to Gemini API:', { message, chatHistory });
  
      // Create generation config
      const generationConfig = {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      };
  
      // Create safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];
  
      let result;
      
      // If we have chat history, use it
      if (chatHistory.length > 0) {
        // Start a chat session with history
        const chat = model.startChat({
          history: chatHistory,
          generationConfig,
          safetySettings,
        });
        
        // Send the message and get the response
        result = await chat.sendMessage(message);
      } else {
        // No history, so use the system prompt as context in the first message
        const prompt = `${systemPrompt}\n\nUser: ${message}`;
        result = await model.generateContent(prompt);
      }
      
      const response = result.response.text();
      
      console.log('Received from Gemini API:', { response });
  
      return { response };
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      
      // Provide a fallback response for common errors
      if (apiError.message && apiError.message.includes('fetch')) {
        return { 
          response: "I'm having trouble connecting to my knowledge base right now. Let me provide some general information about sustainability instead.\n\nSustainability involves making choices that balance environmental health, social well-being, and economic prosperity. Some simple ways to be more eco-friendly include reducing single-use plastics, conserving water and energy, recycling properly, and supporting sustainable businesses.\n\nIs there a specific sustainability topic you'd like to learn more about?" 
        };
      }
      
      throw apiError;
    }
  } catch (error) {
    console.error('Error in handleChatRequest:', error);
    
    // Return a more specific error message
    if (error instanceof Error) {
      return { 
        error: true, 
        response: `Error: ${error.message}. Please try again or contact support if the issue persists.` 
      };
    }
    
    throw error;
  }
} 