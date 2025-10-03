import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function MockPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const handleMockPayment = async () => {
    setIsProcessing(true);
    setLastResponse(null);

    try {
      const response = await fetch('http://localhost:3001/api/create-payment', {
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

      // Add to history
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

      setPaymentHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10

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
        return <XCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'error':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Mock Payment Testing
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Test your payment integration with our mock payment system
          </p>
          <Badge variant="outline" className="text-sm">
            70% Success Rate • ₹500 INR • Production Ready
          </Badge>
        </div>

        {/* Payment Button */}
        <Card className="bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-500" />
              Mock Payment
            </CardTitle>
            <CardDescription>
              Click the button below to simulate a payment transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Button
                onClick={handleMockPayment}
                disabled={isProcessing}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg"
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
              <div className="mt-6 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(lastResponse.status)}
                  <h3 className="font-semibold">Last Response</h3>
                  {getStatusBadge(lastResponse.status)}
                </div>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(lastResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-6 h-6 text-green-500" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  Recent mock payment attempts (last 10)
                </CardDescription>
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
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No payment attempts yet</p>
                <p className="text-sm">Click "Pay ₹500 (Mock)" to test the payment system</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <div className="font-medium">
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
        <Card className="bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-purple-500" />
              API Information
            </CardTitle>
            <CardDescription>
              Technical details about the mock payment system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Endpoint</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  POST /api/create-payment
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Success Rate</h4>
                <p className="text-sm text-muted-foreground">70% (randomized)</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Response Time</h4>
                <p className="text-sm text-muted-foreground">1-3 seconds</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Production Ready</h4>
                <p className="text-sm text-muted-foreground">Replace with Razorpay/Stripe</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Request:</h4>
              <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
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