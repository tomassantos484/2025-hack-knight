const MissingClerkKeyError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-semibold text-amber-700 mb-2">Configuration Error</h2>
        <p className="text-gray-700 mb-4">
          Missing Clerk Publishable Key. The application cannot initialize authentication.
        </p>
        <div className="bg-gray-50 p-4 rounded text-left mb-4">
          <p className="text-sm font-mono text-gray-600">
            Please add the Clerk Publishable Key to your <code className="bg-gray-200 px-1 rounded">.env</code> file:
          </p>
          <pre className="bg-gray-800 text-green-400 p-2 rounded mt-2 overflow-x-auto text-xs">
            VITE_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_KEY
          </pre>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          If you're a developer, check the console for more details. If you're a user, please contact support.
        </p>
      </div>
    </div>
  );
};

export default MissingClerkKeyError; 