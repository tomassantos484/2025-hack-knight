import { handleChatRequest } from './chat';

// Setup a mock API endpoint for development
export function setupMockApi() {
  console.log('Setting up mock API for development');
  
  // Create a global fetch interceptor
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? new URL(input, window.location.origin) : 
                input instanceof URL ? input : new URL(input.url, window.location.origin);
    
    // Intercept API calls to /api/chat
    if (url.pathname === '/api/chat' && init?.method === 'POST') {
      console.log('Intercepted API call to /api/chat');
      
      try {
        const body = JSON.parse(init.body as string);
        const { message, history } = body;
        
        console.log('Chat request:', { message, historyLength: history?.length });
        
        if (!message) {
          console.error('Message is required');
          return new Response(JSON.stringify({ error: 'Message is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        // Call the Gemini API directly
        const result = await handleChatRequest(message, history || []);
        console.log('Chat response:', result);
        
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('API error in setupApi:', error);
        
        let errorMessage = 'Internal server error';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        return new Response(JSON.stringify({ 
          error: true, 
          response: `Error: ${errorMessage}. Please try again or contact support if the issue persists.` 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Pass through all other requests
    return originalFetch(input, init);
  };
} 