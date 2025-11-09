import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, CreditCard, Loader2, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function MockPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const handleMockPayment = async () => {
    setIsProcessing(true);
    setLastResponse(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com'}/api/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 500,
          currency: 'INR'
        })
      });

      const data = await response.json();
      setLastResponse(data);

      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        amount: 500,
        currency: 'INR',
        status: data.status,
        payment_id: data.payment_id || null,
        message: data.message,
        error_code: data.error_code || null
      };

      setPaymentHistory(prev => [historyItem, ...prev.slice(0, 9)]);

      if (data.status === 'success') {
        toast.success('Mock payment successful!');
      } else {
        toast.error('Mock payment failed!');
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorResponse = {
        status: 'error',
        message: 'Network error - unable to connect to payment service',
        timestamp: new Date().toISOString()
      };
      setLastResponse(errorResponse);
      toast.error('Network error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearHistory = () => {
    setPaymentHistory([]);
    setLastResponse(null);
    toast.info('Payment history cleared');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'error':
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const successRate = paymentHistory.length > 0
    ? Math.round((paymentHistory.filter(p => p.status === 'success').length / paymentHistory.length) * 100)
    : 0;

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-background to-card dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Testing Environment</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mock Payment Testing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test your payment integration with our mock payment system
          </p>
          <div className="flex items-center justify-center gap-3">
            <Badge variant="outline" className="border-primary/50">70% Success Rate</Badge>
            <Badge variant="outline" className="border-primary/50">₹500 INR</Badge>
            <Badge className="bg-gradient-to-r from-primary to-accent text-white">Production Ready</Badge>
          </div>
        </div>

        {/* Payment Button Card */}
        <Card className="border-2 border-border bg-card shadow-cosmic">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Test Payment</CardTitle>
                <CardDescription>
                  Click the button below to simulate a payment transaction
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button
                onClick={handleMockPayment}
                disabled={isProcessing}
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6 mr-3" />
                    Pay ₹500 (Mock)
                  </>
                )}
              </Button>
            </div>

            {/* Last Response */}
            {lastResponse && (
              <div className="p-6 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-center gap-3 mb-4">
                  {getStatusIcon(lastResponse.status)}
                  <h3 className="text-lg font-semibold text-foreground">Last Response</h3>
                  {getStatusBadge(lastResponse.status)}
                </div>
                <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto font-mono border border-border">
                  {JSON.stringify(lastResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {paymentHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                    <p className="text-3xl font-bold text-foreground">{paymentHistory.length}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-3xl font-bold text-green-500">{successRate}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-3xl font-bold text-foreground">₹{paymentHistory.length * 500}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment History */}
        <Card className="border-2 border-border bg-card shadow-cosmic">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Payment History</CardTitle>
                  <CardDescription>
                    Recent mock payment attempts (last 10)
                  </CardDescription>
                </div>
              </div>
              {paymentHistory.length > 0 && (
                <Button
                  onClick={clearHistory}
                  variant="outline"
                  size="sm"
                >
                  Clear History
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                  <CreditCard className="w-12 h-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">No payment attempts yet</p>
                <p className="text-sm text-muted-foreground">Click "Pay ₹500 (Mock)" to test the payment system</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <div className="font-semibold text-foreground">
                          ₹{payment.amount} {payment.currency}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(payment.status)}
                      {payment.payment_id && (
                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                          {payment.payment_id}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Information */}
        <Card className="border-2 border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">API Information</CardTitle>
                <CardDescription>
                  Technical details about the mock payment system
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Endpoint</h4>
                <code className="block text-sm bg-muted/50 px-3 py-2 rounded border border-border">
                  POST /api/create-payment
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Success Rate</h4>
                <p className="text-sm text-muted-foreground">70% (randomized)</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Response Time</h4>
                <p className="text-sm text-muted-foreground">1-3 seconds</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Production Ready</h4>
                <p className="text-sm text-muted-foreground">Replace with Razorpay/Stripe</p>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-3">Sample Request:</h4>
              <pre className="text-sm bg-background p-3 rounded border border-border overflow-x-auto font-mono">
{`{
  "amount": 500,
  "currency": "INR"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}