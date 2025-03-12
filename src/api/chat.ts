import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getMockResponse } from './mockResponses';
import { validateMockResponse } from './mockResponseValidator';
import { API_BASE_URL } from './api-config';

// Get the API key from environment variables with proper fallback
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize the Gemini API only if we have a key
let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

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

// Flag to determine if we should use mock responses
// Set to false to try using the Gemini API first
const USE_MOCK_RESPONSES = false;

/**
 * Get a mock response with validation and logging
 * @param message User message
 * @returns Validated mock response
 */
function getValidatedMockResponse(message: string): string {
  // Get the mock response
  const mockResponse = getMockResponse(message);
  
  // Validate the mock response
  const validationResult = validateMockResponse(message, mockResponse);
  
  // Log validation results in development
  if (process.env.NODE_ENV === 'development') {
    if (validationResult.isValid) {
      console.log('Mock response validation passed:', validationResult.score);
    } else {
      console.warn('Mock response validation failed:', validationResult.reason);
      console.warn('Query:', message);
      console.warn('Response:', mockResponse);
    }
  }
  
  return mockResponse;
}

export async function handleChatRequest(message: string, history: { role: string; content: string }[]) {
  console.log('Chat request received:', { message, historyLength: history.length });
  
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Gemini API Key is missing. Using mock responses for development. Ensure responses are accurate and up-to-date.');
      } else {
        console.error('CRITICAL: Gemini API Key is missing in production environment. Using fallback mock responses.');
        // Log additional context to help with debugging
        console.error('Environment check:', {
          nodeEnv: process.env.NODE_ENV,
          apiKeyLength: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0,
          timestamp: new Date().toISOString()
        });
      }
      return { response: getValidatedMockResponse(message) };
    }
    
    // Use mock responses if flag is explicitly set to true
    if (USE_MOCK_RESPONSES) {
      console.log('Using mock response system (flag is set to true)');
      return { response: getValidatedMockResponse(message) };
    }
    
    // For testing - return a mock response if we're in development and having API issues
    if (process.env.NODE_ENV === 'development' && message.includes('test fallback')) {
      console.log('Using mock response for testing');
      return { 
        response: `This is a mock response for testing. In production, this would be a real response from the Gemini API about: "${message}"` 
      };
    }
    
    try {
      // Ensure genAI is initialized
      if (!genAI) {
        console.error('Gemini API not initialized. Falling back to mock response.');
        return { response: getValidatedMockResponse(message) };
      }
      
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
  
      console.log('Sending to Gemini API:', { 
        message, 
        historyLength: chatHistory.length,
        apiKeyPresent: !!GEMINI_API_KEY
      });
  
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
      
      console.log('Received from Gemini API:', { responseLength: response.length });
  
      return { response };
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      
      // Log detailed error information
      if (apiError instanceof Error) {
        console.error('API Error details:', {
          name: apiError.name,
          message: apiError.message,
          stack: apiError.stack,
          timestamp: new Date().toISOString()
        });
      }
      
      // Provide a fallback response using our mock system
      console.log('API error, falling back to mock response');
      return { response: getValidatedMockResponse(message) };
    }
  } catch (error) {
    console.error('Error in handleChatRequest:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      return { 
        error: true, 
        response: `Error: ${error.message}. Please try again or contact support if the issue persists.` 
      };
    }
    
    throw error;
  }
} 