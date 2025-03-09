import React, { useState, useEffect } from 'react';
import { testDatabaseConnection } from '../services/receiptProcessingService';
import { getEcoActions } from '../services/ecoActionsService';
import { seedDatabase } from '../services/seedData';
import { EcoAction } from '@/types/database';

// Define types for the error objects
interface DatabaseError {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<{
    usersTableExists?: boolean;
    receiptsTableExists?: boolean;
    usersError?: DatabaseError;
    receiptsError?: DatabaseError;
    error?: Error | unknown;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [actions, setActions] = useState<{
    data: EcoAction[] | null;
    error: string | null;
    loading: boolean;
  }>({
    data: null,
    error: null,
    loading: true
  });

  const [seedResult, setSeedResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true);
        const result = await testDatabaseConnection();
        setConnectionStatus(result);
      } catch (error) {
        console.error('Error testing connection:', error);
        setConnectionStatus({ error });
      } finally {
        setLoading(false);
      }
    };

    const loadActions = async () => {
      try {
        const result = await getEcoActions();
        setActions({
          data: result.data,
          error: result.error,
          loading: false
        });
      } catch (error) {
        console.error('Error loading actions:', error);
        setActions({
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false
        });
      }
    };

    testConnection();
    loadActions();
  }, []);

  const handleSeedDatabase = async () => {
    try {
      setSeedResult({
        success: false,
        message: 'Seeding database...'
      });
      
      await seedDatabase();
      
      // Reload actions to get the count
      const actionsResult = await getEcoActions();
      
      setSeedResult({
        success: true,
        message: `Database seeded successfully! ${actionsResult.data?.length || 0} eco actions created.`
      });
      
      // Update the actions state
      setActions({
        data: actionsResult.data,
        error: actionsResult.error,
        loading: false
      });
      
    } catch (error) {
      console.error('Error seeding database:', error);
      setSeedResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred while seeding database'
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <div className="w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-2">Testing connection...</p>
        </div>
      ) : connectionStatus ? (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-md">
                <h3 className="font-medium">Users Table</h3>
                {connectionStatus.usersTableExists ? (
                  <div className="text-green-600 mt-1">✓ Table exists</div>
                ) : (
                  <div className="text-red-600 mt-1">✗ Table does not exist</div>
                )}
                {connectionStatus.usersError && (
                  <div className="mt-2 text-sm bg-red-50 p-2 rounded">
                    <p className="font-medium">Error:</p>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {JSON.stringify(connectionStatus.usersError, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              
              <div className="p-3 border rounded-md">
                <h3 className="font-medium">Receipts Table</h3>
                {connectionStatus.receiptsTableExists ? (
                  <div className="text-green-600 mt-1">✓ Table exists</div>
                ) : (
                  <div className="text-red-600 mt-1">✗ Table does not exist</div>
                )}
                {connectionStatus.receiptsError && (
                  <div className="mt-2 text-sm bg-red-50 p-2 rounded">
                    <p className="font-medium">Error:</p>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {JSON.stringify(connectionStatus.receiptsError, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            
            {connectionStatus.error && (
              <div className="mt-4 p-3 bg-red-50 rounded-md">
                <h3 className="font-medium text-red-700">Connection Error</h3>
                <pre className="whitespace-pre-wrap text-xs mt-1">
                  {JSON.stringify(connectionStatus.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
            
            {!connectionStatus.usersTableExists || !connectionStatus.receiptsTableExists ? (
              <div>
                <p className="mb-2">You need to create the database schema in your Supabase project.</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to your <a href="https://app.supabase.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                  <li>Select your project</li>
                  <li>Go to the SQL Editor</li>
                  <li>Run the SQL commands from the schema.sql file</li>
                </ol>
              </div>
            ) : (
              <p className="text-green-600">All tables exist! Your database is ready to use.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">Failed to test connection.</p>
        </div>
      )}

      <div className="p-4 mt-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Eco Actions</h2>
        
        {actions.loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-eco-green border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-2">Loading actions...</p>
          </div>
        ) : actions.error ? (
          <div className="p-3 bg-red-50 rounded-md">
            <p className="text-red-600">{actions.error}</p>
          </div>
        ) : actions.data && actions.data.length > 0 ? (
          <div>
            <p className="mb-2 text-green-600">Found {actions.data.length} eco actions in the database.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              {actions.data.slice(0, 5).map((action) => (
                <li key={action.id} className="text-sm">
                  {action.title} - {action.impact}
                </li>
              ))}
              {actions.data.length > 5 && (
                <li className="text-sm text-gray-500">...and {actions.data.length - 5} more</li>
              )}
            </ul>
          </div>
        ) : (
          <div>
            <p className="mb-2">No eco actions found in the database.</p>
            <button
              onClick={handleSeedDatabase}
              className="px-4 py-2 bg-eco-green text-white rounded hover:bg-eco-green-dark transition"
            >
              Seed Database with Sample Data
            </button>
            
            {seedResult && (
              <div className={`mt-3 p-2 rounded text-sm ${seedResult.success ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                {seedResult.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseTest; 