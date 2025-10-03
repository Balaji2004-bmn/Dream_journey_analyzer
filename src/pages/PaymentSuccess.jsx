import { useEffect, useState } from 'react';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { fetchActiveSubscription } from '@/services/payments';
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from '@/components/ui/dream-card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const { user, loading } = useAuth();
  const [sub, setSub] = useState(null);
  const subscriptionId = params.get('subscription_id');
  const sessionId = params.get('session_id');
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      // Give webhook a moment to arrive (provider may take a few seconds)
      await new Promise(r => setTimeout(r, 1500));
      const s = await fetchActiveSubscription(user.id);
      setSub(s);
    };
    run();
  }, [user]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const reference = subscriptionId || sessionId;
  const isActive = sub?.status === 'active';

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <DreamCard className="p-6">
            <DreamCardHeader>
              <div className="flex items-center gap-3">
                {isActive ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                ) : (
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                )}
                <DreamCardTitle className="!text-3xl">
                  {isActive ? 'Subscription Activated' : 'Processing Payment'}
                </DreamCardTitle>
              </div>
            </DreamCardHeader>
            <DreamCardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {isActive
                    ? 'Your subscription is active. You now have access to premium features.'
                    : 'We are finalizing your subscription. This usually takes a few seconds.'}
                </p>

                <div className="rounded-lg border border-border/30 bg-card/50 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Plan</div>
                      <div className="font-medium capitalize">{sub?.plan || '—'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <div className="font-medium capitalize">{sub?.status || 'pending'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Reference</div>
                      <div className="font-mono break-all">{reference || 'processing…'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Currency</div>
                      <div className="font-medium">{sub?.currency || '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button variant="cosmic" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                  <Button variant="ghost" onClick={() => navigate('/')}>Explore Features</Button>
                </div>
              </div>
            </DreamCardContent>
          </DreamCard>
        </div>
      </div>
    </div>
  );
}

