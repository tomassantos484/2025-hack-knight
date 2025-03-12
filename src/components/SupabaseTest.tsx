import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const SupabaseTest = () => {
  const [testResults, setTestResults] = useState<{
    direct: { success: boolean; message: string };
    eq: { success: boolean; message: string };
    order: { success: boolean; message: string };
  }>({
    direct: { success: false, message: 'Not tested yet' },
    eq: { success: false, message: 'Not tested yet' },
    order: { success: false, message: 'Not tested yet' },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const runTests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test 1: Direct maybeSingle call
      console.log('Testing direct maybeSingle call...');
      try {
        const directResult = await supabase
          .from('user_stats')
          .select('*')
          .limit(1)
          .maybeSingle();
        
        console.log('Direct maybeSingle result:', directResult);
        setTestResults(prev => ({
          ...prev,
          direct: { 
            success: true, 
            message: 'Direct maybeSingle call successful' 
          }
        }));
      } catch (directError) {
        console.error('Direct maybeSingle error:', directError);
        setTestResults(prev => ({
          ...prev,
          direct: { 
            success: false, 
            message: `Error: ${directError.message || 'Unknown error'}` 
          }
        }));
      }
      
      // Test 2: maybeSingle after eq
      console.log('Testing maybeSingle after eq...');
      try {
        const eqResult = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', '00000000-0000-0000-0000-000000000000') // Using a non-existent ID
          .maybeSingle();
        
        console.log('eq + maybeSingle result:', eqResult);
        setTestResults(prev => ({
          ...prev,
          eq: { 
            success: true, 
            message: 'eq + maybeSingle call successful' 
          }
        }));
      } catch (eqError) {
        console.error('eq + maybeSingle error:', eqError);
        setTestResults(prev => ({
          ...prev,
          eq: { 
            success: false, 
            message: `Error: ${eqError.message || 'Unknown error'}` 
          }
        }));
      }
      
      // Test 3: maybeSingle after order
      console.log('Testing maybeSingle after order...');
      try {
        const orderResult = await supabase
          .from('user_stats')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        console.log('order + maybeSingle result:', orderResult);
        setTestResults(prev => ({
          ...prev,
          order: { 
            success: true, 
            message: 'order + maybeSingle call successful' 
          }
        }));
      } catch (orderError) {
        console.error('order + maybeSingle error:', orderError);
        setTestResults(prev => ({
          ...prev,
          order: { 
            success: false, 
            message: `Error: ${orderError.message || 'Unknown error'}` 
          }
        }));
      }
      
    } catch (error) {
      console.error('Error running tests:', error);
      setError(`Error running tests: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Run tests on component mount
    runTests();
  }, []);
  
  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Supabase Client Test</CardTitle>
          <CardDescription>
            Testing the maybeSingle method on the Supabase client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Direct maybeSingle call</h3>
                {testResults.direct.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{testResults.direct.message}</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">eq + maybeSingle call</h3>
                {testResults.eq.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{testResults.eq.message}</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">order + maybeSingle call</h3>
                {testResults.order.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{testResults.order.message}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Tests Again'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SupabaseTest; 