import React, { useState } from 'react';

const Debug: React.FC = () => {
  const [showEnv, setShowEnv] = useState(false);
  
  // Get all environment variables that start with VITE_
  const env = Object.keys(import.meta.env)
    .filter(key => key.startsWith('VITE_'))
    .reduce((obj, key) => {
      obj[key] = import.meta.env[key];
      return obj;
    }, {} as Record<string, string>);
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => setShowEnv(!showEnv)}
        className="bg-gray-800 text-white px-3 py-1 rounded-md text-xs"
      >
        Debug
      </button>
      
      {showEnv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Environment Variables</h2>
              <button 
                onClick={() => setShowEnv(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(env, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Note: Only variables starting with VITE_ are shown for security reasons.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debug; 