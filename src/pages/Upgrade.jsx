import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Upload, CheckCircle, AlertCircle, ArrowLeft, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { fetchActiveSubscription } from '@/services/payments';

const Upgrade = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiData, setUpiData] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  // UPI Configuration
  const UPI_ID = '6361698728@slc';
  const MERCHANT_NAME = 'DreamVision';
  
  // USD to INR conversion rate (approximate)
  const USD_TO_INR = 83;

  const plans = [
    {
      id: 'free',
      name: 'Free',
      priceUSD: 0,
      priceINR: 0,
      duration: 'forever',
      features: [
        'AI dream analysis',
        'Dream gallery & saving',
        'Video: up to 5s',
        'Basic support'
      ],
      color: 'from-gray-500 to-slate-500',
      disabled: true
    },
    {
      id: 'pro',
      name: 'Pro',
      priceUSD: 5,
      priceINR: 5 * USD_TO_INR,
      duration: 'month',
      features: [
        'Everything in Free',
        'Priority video generation',
        'Video duration: up to 10s',
        'HD thumbnails',
        'Email support',
        'No watermark'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'premium',
      name: 'Premium',
      priceUSD: 10,
      priceINR: 10 * USD_TO_INR,
      duration: 'month',
      features: [
        'Everything in Pro',
        'Priority support 24/7',
        'Video duration: up to 15s',
        'Full HD quality (1080p)',
        'Advanced analytics',
        'Early access to features',
        'Custom dream themes'
      ],
      color: 'from-purple-500 to-pink-500',
      popular: true
    }
  ];

  // Load current subscription
  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) return;
      try {
        const sub = await fetchActiveSubscription(user.id);
        setCurrentSubscription(sub);
      } catch (error) {
        console.error('Failed to load subscription:', error);
      }
    };
    loadSubscription();
  }, [user]);

  // Auto-select plan from URL params
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && !showPayment) {
      const plan = plans.find(p => p.id === planParam);
      if (plan && !plan.disabled) {
        handleSelectPlan(plan);
      }
    }
  }, [searchParams]);

  const handleSelectPlan = async (plan) => {
    if (!user) {
      toast.error('Please login to upgrade');
      navigate('/auth');
      return;
    }

    setSelectedPlan(plan);
    
    // Generate UPI payment details with INR amount
    const amount = Math.round(plan.priceINR); // Round to nearest rupee
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${plan.name} Plan - ${plan.priceUSD}USD - User: ${user.id}`)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}`;

    setUpiData({
      upiUrl,
      qrCodeUrl,
      upiId: UPI_ID,
      amount,
      amountUSD: plan.priceUSD,
      currency: 'INR'
    });

    setShowPayment(true);
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

  const handleConfirmPayment = async () => {
    if (!screenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setIsProcessing(true);

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com';
      
      // Send payment verification request to backend
      const response = await fetch(`${BACKEND_URL}/api/verify-upi-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          plan: selectedPlan.id,
          amount: upiData.amount,
          amountUSD: selectedPlan.priceUSD,
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
        
        setTimeout(() => {
          navigate('/subscription');
        }, 2000);
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }

    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error('Failed to confirm payment. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showPayment && selectedPlan && upiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => {
              setShowPayment(false);
              setScreenshot(null);
            }}
            variant="ghost"
            className="mb-4 text-white hover:text-blue-300"
          >
            ← Back to Plans
          </Button>

          <Card className="border-blue-500/30 bg-slate-900/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-3xl text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Complete Your Payment
              </CardTitle>
              <CardDescription className="text-center text-lg text-gray-300">
                {selectedPlan.name} Plan - ${selectedPlan.priceUSD} USD (₹{upiData.amount}) per {selectedPlan.duration}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* UPI QR Code */}
              <div className="bg-white rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Scan QR Code to Pay
                </h3>
                <img
                  src={upiData.qrCodeUrl}
                  alt="UPI QR Code"
                  className="mx-auto w-80 h-80 rounded-xl shadow-2xl"
                />
                <p className="mt-4 text-gray-600 font-medium">
                  UPI ID: <span className="text-blue-600 font-mono">{upiData.upiId}</span>
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  Amount: ₹{upiData.amount}
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
                <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Payment Instructions
                </h4>
                <ol className="space-y-2 text-gray-300 text-sm">
                  <li>1. Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                  <li>2. Scan the QR code above</li>
                  <li>3. Pay exactly ₹{upiData.amount} (${selectedPlan.priceUSD} USD)</li>
                  <li>4. Take a screenshot of the payment confirmation</li>
                  <li>5. Upload the screenshot below to activate your plan</li>
                </ol>
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Upload Payment Screenshot</h4>
                
                <div className="border-2 border-dashed border-blue-500/50 rounded-xl p-8 text-center bg-slate-800/50 hover:border-blue-400/70 transition-colors">
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
                        <CheckCircle className="w-12 h-12 text-green-400" />
                        <p className="text-green-400 font-medium">{screenshot.name}</p>
                        <img
                          src={screenshot.preview}
                          alt="Payment Screenshot"
                          className="mt-4 max-w-full h-auto rounded-lg border-2 border-green-500"
                        />
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-blue-400" />
                        <p className="text-gray-300">Click to upload screenshot</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handleConfirmPayment}
                disabled={!screenshot || isProcessing}
                className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Payment & Activate Subscription
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-400 text-center">
                Your subscription will be activated automatically after confirmation
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentPlanId = currentSubscription?.plan || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/subscription')}
          variant="ghost"
          className="mb-6 text-white hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subscription
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300">
            Unlock the full power of AI dream generation
          </p>
          {currentSubscription && (
            <p className="text-sm text-blue-300 mt-2">
              Current Plan: <span className="font-bold uppercase">{currentPlanId}</span>
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlanId;
            const isDowngrade = (currentPlanId === 'premium' && plan.id === 'pro') || 
                               (currentPlanId === 'pro' && plan.id === 'free');
            
            return (
              <Card
                key={plan.id}
                className={`relative border-2 ${
                  plan.popular ? 'border-purple-500' : 'border-blue-500/30'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''} bg-slate-900/90 backdrop-blur hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Current Plan
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className={`text-3xl bg-gradient-to-r ${plan.color} bg-clip-text text-transparent flex items-center gap-2`}>
                    {plan.id === 'premium' && <Crown className="w-6 h-6 text-purple-400" />}
                    {plan.id === 'pro' && <Zap className="w-6 h-6 text-blue-400" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    {plan.priceUSD > 0 ? (
                      <>
                        <span className="text-4xl font-bold text-white">${plan.priceUSD}</span>
                        <span className="text-gray-400"> USD</span>
                        <div className="text-sm text-gray-400 mt-1">
                          (₹{Math.round(plan.priceINR)} INR per {plan.duration})
                        </div>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-white">Free</span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={plan.disabled || isCurrentPlan}
                    className={`w-full h-12 text-lg bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isCurrentPlan ? 'Current Plan' : isDowngrade ? 'Contact Support' : plan.priceUSD > 0 ? 'Upgrade Now' : 'Free Plan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center space-y-4">
          <div className="flex justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Secure UPI Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Instant Activation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;