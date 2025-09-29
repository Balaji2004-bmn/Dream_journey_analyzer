import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Shield, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EmailVerificationModal({ isOpen, onClose, onVerified }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user } = useAuth();

  const handleSendConfirmation = async () => {
    setIsSending(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/email/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token || 'demo-token'}`
        },
        body: JSON.stringify({ email: user?.email })
      });

      const result = await response.json();

      if (result.success) {
        setEmailSent(true);
        if (result.demo) {
          toast.success("✅ Demo mode: Email confirmed automatically! You now have access to all features.");
          setTimeout(() => {
            onVerified();
            onClose();
          }, 1500);
        } else {
          toast.success("📧 Confirmation email sent! Please check your email.");
        }
      } else {
        toast.error(result.message || "Failed to send confirmation email. Please try again.");
      }
    } catch (error) {
      console.error('Email confirmation error:', error);
      toast.error("Failed to send confirmation email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmEmail = async () => {
    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/email/confirm-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token || 'demo-token'}`
        },
        body: JSON.stringify({ email: user?.email })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("✅ Email confirmed! You now have access to all features.");
        onVerified();
        onClose();
      } else {
        toast.error(result.message || "Failed to confirm email. Please try again.");
      }
    } catch (error) {
      console.error('Email confirmation error:', error);
      toast.error("Failed to confirm email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Email Verification Required
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>
                To access private videos and premium features, please verify your email address.
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Email Verification
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              We'll send a confirmation email to <strong>{user?.email}</strong>
            </p>
          </div>

          {!emailSent ? (
            <div className="space-y-3">
              <Button
                onClick={handleSendConfirmation}
                className="w-full"
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Confirmation...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Confirmation Email
                  </>
                )}
              </Button>
              
              <div className="text-xs text-muted-foreground text-center">
                <p>Click the button above to send a confirmation email to your address</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Email Sent Successfully!
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Please check your email and click the confirmation link, or click the button below to confirm manually.
                </p>
              </div>

              <Button
                onClick={handleConfirmEmail}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Email Access
                  </>
                )}
              </Button>

              <Button
                onClick={handleSendConfirmation}
                variant="outline"
                className="w-full"
                disabled={isSending}
              >
                {isSending ? "Resending..." : "Resend Email"}
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            <p>This verification allows you to access private dream videos and premium features</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
