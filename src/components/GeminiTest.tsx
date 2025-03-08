import React, { useState, useEffect } from 'react';
import { handleChatRequest } from '../api/chat';

const GeminiTest = () => {
  const [result, setResult] = useState<string>('Testing Gemini API...');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('Checking...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check environment variables
    const vars: Record<string, string> = {};
    
    // Check if the API keys are available
    const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;
    const VITE_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    vars['GEMINI_API_KEY'] = GEMINI_API_KEY ? 'Present' : 'Missing';
    vars['VITE_GEMINI_API_KEY'] = VITE_GEMINI_API_KEY ? 'Present' : 'Missing';
    vars['Using Key'] = GEMINI_API_KEY || VITE_GEMINI_API_KEY ? 'Yes' : 'No';
    
    setEnvVars(vars);
    setApiKey((GEMINI_API_KEY || VITE_GEMINI_API_KEY) ? 'API Key is present' : 'API Key is missing');

    // Test the Gemini API
    const testGeminiApi = async () => {
      setIsLoading(true);
      try {
        // Use a simple test message
        const response = await handleChatRequest('Hello, can you tell me about sustainability?', []);
        if (response.error) {
          setError(response.response);
        } else {
          setResult(response.response);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    testGeminiApi();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-medium mb-2">Gemini API Test</h2>
      
      <div className="mb-4">
        <strong>API Key Status:</strong> {apiKey}
      </div>
      
      <div className="mb-4">
        <strong>Environment Variables:</strong>
        <ul className="mt-1 pl-5 list-disc">
          {Object.entries(envVars).map(([key, value]) => (
            <li key={key}>
              <span className="font-medium">{key}:</span> {value}
            </li>
          ))}
        </ul>
      </div>
      
      {isLoading ? (
        <div className="flex items-center text-blue-500">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Testing API connection...
        </div>
      ) : error ? (
        <div className="text-red-500">
          <strong>Error:</strong>
          <div className="mt-2 p-3 bg-red-50 rounded border border-red-200 whitespace-pre-wrap">{error}</div>
        </div>
      ) : (
        <div>
          <strong>Response:</strong>
          <div className="mt-2 p-3 bg-green-50 rounded border border-green-200 whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </div>
  );
};

export default GeminiTest; 