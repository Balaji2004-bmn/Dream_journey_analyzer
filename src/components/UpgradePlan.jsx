import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { fetchActiveSubscription } from '@/services/payments';

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    priceUSD: 5,
    features: [
      'Everything in Free',
      'Priority video generation',
      'Video duration: up to 10s',
      'HD thumbnails',
      'Email export',
    ],
    cta: 'Upgrade to Pro'
  },
  {
    id: 'premium',
    name: 'Premium',
    priceUSD: 10,
    features: [
      'Everything in Pro',
      'Priority support',
      'Video duration: up to 15s',
      'Early access features',
      'Advanced analytics',
    ],
    cta: 'Upgrade to Premium'
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
      {plans.map((p) => (
        <div key={p.id} className="p-6 rounded-lg border border-border/30 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <div className="mt-1">
                <span className="text-3xl font-bold text-primary">${p.priceUSD}</span>
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </div>
            {currentPlan === p.id && <span className="text-sm text-green-500">Current</span>}
          </div>
          <ul className="mt-4 text-sm text-muted-foreground list-disc list-inside">
            {p.features.map((f) => (<li key={f}>{f}</li>))}
          </ul>
          <Button
            className="mt-4"
            variant="cosmic"
            disabled={loadingPlan === p.id || currentPlan === p.id || (currentPlan === 'premium' && p.id !== 'premium')}
            onClick={() => startCheckout(p.id)}
          >
            {loadingPlan === p.id ? 'Redirecting...' : (currentPlan === p.id ? 'Current Plan' : (currentPlan === 'pro' && p.id === 'premium' ? 'Upgrade to Premium' : p.cta))}
          </Button>
        </div>
      ))}
    </div>
    {/* Allow users to change plan anytime */}
    <div className="mt-4">
      <Button variant="outline" onClick={() => navigate('/upgrade')}>
        Change Plan
      </Button>
    </div>
    </>
  );
}
