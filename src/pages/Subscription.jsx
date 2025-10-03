import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from '@/components/ui/dream-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import UpgradePlan from '@/components/UpgradePlan';
import { fetchActiveSubscription } from '@/services/payments';
import { Crown, Zap, Clock } from 'lucide-react';

export default function Subscription() {
  const { user, loading } = useAuth();
  const [sub, setSub] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const s = await fetchActiveSubscription(user.id);
        setSub(s);
      } catch (_) {
        setSub(null);
      }
    };
    load();
  }, [user]);

  const currentPlan = useMemo(() => sub?.plan || 'free', [sub]);

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Subscription
              </h1>
            </div>
            <p className="text-muted-foreground">Choose a plan to unlock longer dream videos and premium features</p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="cosmic">Current plan: {currentPlan}</Badge>
              {sub && <Badge variant="outline">Status: {sub.status}</Badge>}
            </div>
          </div>

          {/* Benefits */}
          <DreamCard className="p-6">
            <DreamCardHeader>
              <DreamCardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                What you get
              </DreamCardTitle>
            </DreamCardHeader>
            <DreamCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg border border-border/30 bg-card/50">
                  <p className="font-medium">Free</p>
                  <ul className="mt-2 list-disc list-inside text-muted-foreground">
                    <li>AI analysis</li>
                    <li>Gallery & saving</li>
                    <li>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Video duration: up to 5s</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border border-border/30 bg-card/50">
                  <p className="font-medium">Pro</p>
                  <ul className="mt-2 list-disc list-inside text-muted-foreground">
                    <li>Everything in Free</li>
                    <li>Priority generation</li>
                    <li>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Video duration: up to 10s</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border border-border/30 bg-card/50">
                  <p className="font-medium">Premium</p>
                  <ul className="mt-2 list-disc list-inside text-muted-foreground">
                    <li>Everything in Pro</li>
                    <li>Priority support</li>
                    <li>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Video duration: up to 15s</span>
                    </li>
                  </ul>
                </div>
              </div>
            </DreamCardContent>
          </DreamCard>

          {/* Plans */}
          <DreamCard className="p-6">
            <DreamCardHeader>
              <DreamCardTitle>Choose your plan</DreamCardTitle>
            </DreamCardHeader>
            <DreamCardContent>
              <UpgradePlan />
              {currentPlan !== 'free' && (
                <div className="mt-4 text-sm text-muted-foreground">
                  You can manage or upgrade your plan at any time.
                </div>
              )}
            </DreamCardContent>
          </DreamCard>

          {/* CTA back to analyzer */}
          <div className="text-center">
            <Button variant="ghost" onClick={() => window.history.back()}>Go back</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
