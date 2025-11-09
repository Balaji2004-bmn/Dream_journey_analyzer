import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Crown, Zap, Sparkles, CheckCircle, ArrowRight, QrCode, Upload, AlertCircle, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { fetchActiveSubscription } from '@/services/payments';

// UPI Configuration
const UPI_ID = '6361698728@slc';
const MERCHANT_NAME = 'DreamVision';
const USD_TO_INR = 83;

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceINR: 0,
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
    price: 5,
    priceINR: 5 * USD_TO_INR,
    features: [
      'Unlimited dream analyses',
      'Advanced analytics',
      'Priority support',
      'Export to PDF',
      'Video duration: up to 10s'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 10,
    priceINR: 10 * USD_TO_INR,
    features: [
      'Everything in Pro',
      '1:1 dream coaching session',
      'Custom dream interpretations',
      'Early access to new features',
      'Video duration: up to 15s',
      'Full HD quality (1080p)'
    ],
    buttonText: 'Get Premium',
    popular: false,
    icon: <Crown className="w-5 h-5" />
  }
];

export default function Subscription() {
  const { user, loading } = useAuth();
  const [sub, setSub] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upiData, setUpiData] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);

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

  const handlePlanSelect = (plan) => {
    if (plan.id === currentPlan) return;
    setSelectedPlan(plan);
    
    // For paid plans, generate UPI data and show payment screen
    if (plan.id !== 'free') {
      const amount = Math.round(plan.priceINR);
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${plan.name} Plan - ${plan.price}USD - User: ${user?.id}`)}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}`;
      
      setUpiData({
        upiUrl,
        qrCodeUrl,
        upiId: UPI_ID,
        amount,
        amountUSD: plan.price,
        currency: 'INR'
      });
      
      setShowPayment(true);
    } else {
      // For free plan, show confirmation
      setShowConfirmDialog(true);
    }
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot({
          file,
          preview: reader.result,
          name: file.name
        });
        toast.success('Screenshot uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPlanChange = async () => {
    if (!selectedPlan) return;
    
    setChangingPlan(true);
    
    try {
      // For free plan, just change it
      if (selectedPlan.id === 'free') {
        const response = await axios.post('/api/subscription/change-plan', {
          plan: selectedPlan.id
        });
        
        toast.success(`Successfully changed to ${selectedPlan.name} plan`);
        await fetchActiveSubscription(user.id).then(setSub);
        setShowConfirmDialog(false);
      } else {
        // For paid plans, verify payment
        if (!screenshot) {
          toast.error('Please upload payment screenshot');
          setChangingPlan(false);
          return;
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com';
        
        const response = await fetch(`${BACKEND_URL}/api/verify-upi-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            plan: selectedPlan.id,
            amount: upiData.amount,
            amountUSD: selectedPlan.price,
            upiId: UPI_ID,
            screenshotName: screenshot.name,
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        const result = await response.json();

        if (result.success && result.status === 'active') {
          toast.success('🎉 Payment confirmed! Your subscription is now active.');
          await fetchActiveSubscription(user.id).then(setSub);
          setShowPayment(false);
          setScreenshot(null);
        } else {
          throw new Error(result.message || 'Payment verification failed');
        }
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to change plan');
    } finally {
      setChangingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Payment Screen
  if (showPayment && selectedPlan && upiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => {
              setShowPayment(false);
              setScreenshot(null);
            }}
            variant="ghost"
            className="mb-4"
          >
            ← Back to Plans
          </Button>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-3xl text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Complete Your Payment
              </CardTitle>
              <CardDescription className="text-center text-lg">
                {selectedPlan.name} Plan - ${selectedPlan.price} USD (₹{upiData.amount}) per month
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* UPI QR Code */}
              <div className="bg-white dark:bg-gray-100 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Scan QR Code to Pay
                </h3>
                <img
                  src={upiData.qrCodeUrl}
                  alt="UPI QR Code"
                  className="mx-auto w-80 h-80 rounded-xl shadow-2xl"
                />
                <p className="mt-4 text-gray-600 font-medium">
                  UPI ID: <span className="text-primary font-mono">{upiData.upiId}</span>
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  Amount: ₹{upiData.amount}
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
                <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Payment Instructions
                </h4>
                <ol className="space-y-2 text-muted-foreground text-sm">
                  <li>1. Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                  <li>2. Scan the QR code above</li>
                  <li>3. Pay exactly ₹{upiData.amount} (${selectedPlan.price} USD)</li>
                  <li>4. Take a screenshot of the payment confirmation</li>
                  <li>5. Upload the screenshot below to activate your plan</li>
                </ol>
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-4">
                <h4 className="font-semibold">Upload Payment Screenshot</h4>
                
                <div className="border-2 border-dashed border-primary/50 rounded-xl p-8 text-center bg-muted/50 hover:border-primary/70 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    {screenshot ? (
                      <>
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="text-green-600 font-medium">{screenshot.name}</p>
                        <img
                          src={screenshot.preview}
                          alt="Payment Screenshot"
                          className="mt-4 max-w-full h-auto rounded-lg border-2 border-green-500"
                        />
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-primary" />
                        <p className="text-foreground">Click to upload screenshot</p>
                        <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                onClick={confirmPlanChange}
                disabled={!screenshot || changingPlan}
                className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
              >
                {changingPlan ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Payment & Activate Subscription
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Your subscription will be activated automatically after confirmation
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <Card className="border-2 border-border bg-card shadow-cosmic">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-highlight">Plan Benefits</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
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
                            <span className="text-muted-foreground"> USD/month</span>
                            <div className="text-sm text-muted-foreground mt-1">
                              (₹{Math.round(plan.priceINR)} INR)
                            </div>
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
                    disabled={plan.id === currentPlan || changingPlan}
                    className={`w-full ${
                      plan.id === currentPlan
                        ? 'bg-gray-200 dark:bg-gray-800 text-foreground'
                        : plan.popular
                          ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                          : ''
                    }`}
                  >
                    {plan.id === currentPlan ? 'Current Plan' : plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

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