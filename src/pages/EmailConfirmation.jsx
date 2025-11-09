import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function EmailConfirmation() {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check for tokens in URL hash (Supabase format)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken && type === 'signup') {
          // Handle Supabase email confirmation
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Email confirmation error:', error);
            setStatus('error');
            setMessage('Failed to confirm email. The link may be expired or invalid.');
          } else {
            setStatus('success');
            setMessage('Email confirmed successfully! Redirecting to sign in...');
            // Auto redirect after successful confirmation
            setTimeout(() => {
              navigate('/auth');
            }, 2000);
          }
        } else {
          // Check for query params (custom confirmation)
          const token = searchParams.get('token');
          const email = searchParams.get('email');

          if (token && email) {
            // Handle custom email confirmation
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com'}/api/email/confirm-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok && result.success) {
              setStatus('success');
              setMessage('Email confirmed successfully! Redirecting to sign in...');
              // Auto redirect after successful confirmation
              setTimeout(() => {
                navigate('/auth');
              }, 2000);
            } else {
              setStatus('error');
              setMessage(result.message || 'Failed to confirm email.');
            }
          } else {
            setStatus('error');
            setMessage('Invalid confirmation link. Please check your email for the correct link.');
          }
        }
      } catch (error) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/auth');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-highlight flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-2xl text-highlight">
              Email Confirmation
            </CardTitle>
          </div>
          <CardDescription>
            {status === 'loading' && 'Confirming your email address...'}
            {status === 'error' && 'Confirmation failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={handleContinue} className="w-full bg-primary hover:bg-primary/90">
                Continue to Sign In
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={handleContinue} variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}