import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dbInfo, setDbInfo] = useState<any>(null);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');
    setDbInfo(null);

    try {
      // Test 1: Check if client is initialized
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      // Test 2: Test database connection with a simple query
      const { data, error } = await supabase
        .from('dreams')
        .select('count', { count: 'exact', head: true });

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      // Test 3: Check auth status
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.warn('Auth check failed:', authError.message);
      }

      setDbInfo({
        dreamsCount: data,
        authStatus: session ? 'Authenticated' : 'Not authenticated',
        url: import.meta.env.VITE_SUPABASE_URL,
        projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID
      });

      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testing connection...';
      case 'connected':
        return 'Connected successfully!';
      case 'error':
        return 'Connection failed';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Supabase Connection Test
        </CardTitle>
        <CardDescription>
          {getStatusText()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {connectionStatus === 'connected' && dbInfo && (
          <div className="space-y-2">
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <h4 className="font-medium text-green-800">Connection Details:</h4>
              <ul className="text-sm text-green-700 mt-1 space-y-1">
                <li>URL: {dbInfo.url}</li>
                <li>Project ID: {dbInfo.projectId}</li>
                <li>Auth Status: {dbInfo.authStatus}</li>
                <li>Dreams table accessible: ✓</li>
              </ul>
            </div>
          </div>
        )}

        <Button 
          onClick={testConnection} 
          disabled={connectionStatus === 'testing'}
          className="w-full"
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Again'}
        </Button>
      </CardContent>
    </Card>
  );
};
