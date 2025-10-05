import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from '@/components/ui/dream-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import UpgradePlan from '@/components/UpgradePlan';
import { fetchActiveSubscription } from '@/services/payments';
import { Crown, Zap, Clock, Sparkles, Shield, CheckCircle } from 'lucide-react';

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
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-background to-card dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Subscription Management</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-highlight">
              Your Subscription
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your plan and unlock premium features
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
                Current: {currentPlan.toUpperCase()}
              </Badge>
              {sub && (
                <Badge variant="outline" className="border-primary/50">
                  Status: {sub.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Benefits Comparison */}
          <DreamCard className="border-2 border-border bg-card shadow-cosmic">
            <DreamCardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <DreamCardTitle className="text-2xl text-highlight">Plan Benefits</DreamCardTitle>
              </div>
            </DreamCardHeader>
            <DreamCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <div className="p-6 rounded-xl border-2 border-border bg-gradient-to-br from-muted/30 to-background">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-bold text-foreground">Free</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">AI dream analysis</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Dream gallery & saving</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Video: up to 5s</span>
                    </li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div className="p-6 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold text-foreground">Pro</h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">Everything in Free</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">Priority generation</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">Video: up to 10s</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Premium Plan */}
                <div className="p-6 rounded-xl border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">Premium</h3>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        Popular
                      </Badge>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">Everything in Pro</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">Priority support 24/7</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">Video: up to 15s</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </DreamCardContent>
          </DreamCard>

          {/* Upgrade Plans */}
          <DreamCard className="border-2 border-border bg-card shadow-cosmic">
            <DreamCardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <DreamCardTitle className="text-2xl text-highlight">Choose Your Plan</DreamCardTitle>
              </div>
            </DreamCardHeader>
            <DreamCardContent>
              <UpgradePlan />
              {currentPlan !== 'free' && (
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    You can manage or upgrade your plan at any time. Changes take effect immediately.
                  </div>
                </div>
              )}
            </DreamCardContent>
          </DreamCard>

          {/* Back Button */}
          <div className="text-center">
            <Button variant="ghost" size="lg" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}