import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Server } from 'lucide-react';
import { dreamAPI, aiAPI, videoAPI } from '@/services/api';

export const BackendConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [errorMessage, setErrorMessage] = useState('');
  const [testResults, setTestResults] = useState(null);

  const testBackendConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');
    setTestResults(null);

    try {
      // Test 1: Health check
      const healthResponse = await fetch('http://localhost:3002/health');
      if (!healthResponse.ok) {
        throw new Error('Backend health check failed');
      }
      const healthData = await healthResponse.json();

      // Test 2: Test public dreams endpoint (no auth required)
      const publicDreamsResponse = await dreamAPI.getPublicDreams({ limit: 1 });

      // Test 3: Test video styles endpoint (no auth required)
      const videoStylesResponse = await videoAPI.getVideoStyles();

      setTestResults({
        health: healthData,
        publicDreams: publicDreamsResponse.data,
        videoStyles: videoStylesResponse.data,
        backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api'
      });

      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Unknown error occurred');
    }
  };

  useEffect(() => {
    testBackendConnection();
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
        return 'Testing backend connection...';
      case 'connected':
        return 'Backend connected successfully!';
      case 'error':
        return 'Backend connection failed';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Backend Connection Test
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusText()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{errorMessage}</p>
            <p className="text-xs text-red-600 mt-1">
              Make sure the backend server is running on port 3002
            </p>
          </div>
        )}

        {connectionStatus === 'connected' && testResults && (
          <div className="space-y-2">
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <h4 className="font-medium text-green-800">Connection Details:</h4>
              <ul className="text-sm text-green-700 mt-1 space-y-1">
                <li>Backend URL: {testResults.backendUrl}</li>
                <li>Server Status: {testResults.health.status}</li>
                <li>Environment: {testResults.health.environment}</li>
                <li>Uptime: {Math.floor(testResults.health.uptime)}s</li>
                <li>Public Dreams API: ✓</li>
                <li>Video Styles API: ✓</li>
                <li>Available Video Styles: {testResults.videoStyles.styles?.length || 0}</li>
              </ul>
            </div>
          </div>
        )}

        <Button 
          onClick={testBackendConnection} 
          disabled={connectionStatus === 'testing'}
          className="w-full"
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Again'}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>Frontend: {window.location.origin}</p>
          <p>Backend: {import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

