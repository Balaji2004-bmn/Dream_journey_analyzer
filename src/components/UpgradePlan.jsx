import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchActiveSubscription } from '@/services/payments';
import { Crown, Zap, CheckCircle } from 'lucide-react';

const USD_TO_INR = 83;

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    priceUSD: 5,
    priceINR: 5 * USD_TO_INR,
    features: [
      'Everything in Free',
      'Priority video generation',
      'Video duration: up to 10s',
      'HD thumbnails',
      'Email support',
      'No watermark'
    ],
    cta: 'Upgrade to Pro',
    icon: Zap,
    color: 'text-blue-500'
  },
  {
    id: 'premium',
    name: 'Premium',
    priceUSD: 10,
    priceINR: 10 * USD_TO_INR,
    features: [
      'Everything in Pro',
      'Priority support 24/7',
      'Video duration: up to 15s',
      'Full HD quality',
      'Advanced analytics',
      'Early access features'
    ],
    cta: 'Upgrade to Premium',
    icon: Crown,
    color: 'text-purple-500',
    popular: true
  },
];

export default function UpgradePlan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [sub, setSub] = useState(null);

  const currentPlan = useMemo(() => sub?.plan || 'free', [sub]);

  const refresh = async () => {
    if (!user) return;
    try {
      const s = await fetchActiveSubscription(user.id);
      setSub(s);
    } catch (_) {
      // ignore
    }
  };

  useEffect(() => { refresh(); }, [user]);

  const startCheckout = async (plan) => {
    // Always use the dedicated Upgrade page with UPI QR + screenshot flow
    navigate(`/upgrade?plan=${encodeURIComponent(plan)}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((p) => {
          const Icon = p.icon;
          const isCurrentPlan = currentPlan === p.id;
          const canUpgrade = (currentPlan === 'free') || (currentPlan === 'pro' && p.id === 'premium');

          return (
            <div 
              key={p.id} 
              className={`p-6 rounded-xl border-2 ${
                isCurrentPlan 
                  ? 'border-green-500 bg-green-500/5' 
                  : 'border-border/30 bg-card'
              } hover:border-primary/50 transition-all relative`}
            >
              {p.popular && !isCurrentPlan && (
                <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Popular
                </Badge>
              )}
              
              {isCurrentPlan && (
                <Badge className="absolute -top-3 right-4 bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Current Plan
                </Badge>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${
                    p.id === 'premium' ? 'from-purple-500/20 to-pink-500/20' : 'from-blue-500/20 to-cyan-500/20'
                  }`}>
                    <Icon className={`w-6 h-6 ${p.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{p.name}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-bold text-primary">${p.priceUSD}</span>
                      <span className="text-sm text-muted-foreground">USD/month</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      (₹{Math.round(p.priceINR)} INR)
                    </p>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrentPlan ? "outline" : "cosmic"}
                disabled={loadingPlan === p.id || isCurrentPlan || !canUpgrade}
                onClick={() => startCheckout(p.id)}
              >
                {loadingPlan === p.id 
                  ? 'Redirecting...' 
                  : isCurrentPlan 
                    ? 'Current Plan' 
                    : canUpgrade
                      ? p.cta
                      : 'Contact Support'
                }
              </Button>
            </div>
          );
        })}
      </div>

      {/* Change Plan / View All Plans Button */}
      <div className="mt-6 flex justify-center">
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/upgrade')}
          className="min-w-[200px]"
        >
          View All Plans & Options
        </Button>
      </div>
    </>
  );
}
