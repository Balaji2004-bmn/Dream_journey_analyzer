import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Crown, Zap, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '5 dream analyses per month',
      'Basic dream tracking',
      'Community support'
    ],
    buttonText: 'Current Plan',
    popular: false,
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    features: [
      'Unlimited dream analyses',
      'Advanced analytics',
      'Priority support',
      'Export to PDF'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    features: [
      'Everything in Pro',
      '1:1 dream coaching session',
      'Custom dream interpretations',
      'Early access to new features'
    ],
    buttonText: 'Get Premium',
    popular: false,
    icon: <Crown className="w-5 h-5" />
  }
];

export default function Subscription() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [plans, setPlans] = useState(PLANS);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const loadSubscription = async () => {
    if (!user) return;
    try {
      const response = await axios.get('/api/subscription');
      setSub(response.data.subscription);
      
      // Update plans with current selection
      setPlans(PLANS.map(plan => ({
        ...plan,
        buttonText: plan.id === response.data.subscription?.plan ? 'Current Plan' : 
                   plan.id === 'pro' ? 'Upgrade to Pro' : 
                   plan.id === 'premium' ? 'Get Premium' : 'Downgrade to Free'
      })));
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSub(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const currentPlan = useMemo(() => sub?.plan || 'free', [sub]);

  const handlePlanSelect = (plan) => {
    if (plan.id === currentPlan) return;
    setSelectedPlan(plan);
    setShowConfirmDialog(true);
  };

  const confirmPlanChange = async () => {
    if (!selectedPlan) return;
    
    setChangingPlan(selectedPlan.id);
    
    try {
      const response = await axios.post('/api/subscription/change-plan', {
        plan: selectedPlan.id
      });
      
      toast.success(`Successfully changed to ${selectedPlan.name} plan`);
      await loadSubscription();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error(error.response?.data?.error || 'Failed to change plan');
    } finally {
      setChangingPlan(null);
      setShowConfirmDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Choose Your Plan
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
            Select the plan that works best for your dream journey
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative flex flex-col overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-3 py-1 transform translate-x-2 -translate-y-2 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {plan.id !== 'free' ? (
                        <>
                          <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-foreground">Free</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    {plan.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  onClick={() => handlePlanSelect(plan)}
                  disabled={plan.id === currentPlan || changingPlan === plan.id}
                  className={`w-full ${
                    plan.id === currentPlan 
                      ? 'bg-gray-200 dark:bg-gray-800 text-foreground' 
                      : plan.popular 
                        ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90' 
                        : ''
                  }`}
                >
                  {changingPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : plan.id === currentPlan ? (
                    'Current Plan'
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need help choosing?{' '}
            <a href="#" className="text-primary hover:underline">
              Compare all features
            </a>
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change to the {selectedPlan?.name} plan?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Current Plan</span>
              <span className="font-medium">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
            </div>
            
            <div className="flex items-center justify-center py-2">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">New Plan</span>
              <div className="text-right">
                <div className="font-medium">
                  {selectedPlan?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedPlan?.price > 0 ? `$${selectedPlan.price}/month` : 'Free'}
                </div>
              </div>
            </div>
            
            {selectedPlan?.price > 0 && currentPlan !== 'free' && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your account will be charged a prorated amount based on your billing cycle.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={changingPlan}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmPlanChange}
              disabled={changingPlan}
              className="bg-primary hover:bg-primary/90"
            >
              {changingPlan ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Change'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
