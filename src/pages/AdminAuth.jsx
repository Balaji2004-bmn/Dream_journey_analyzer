import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminAuth() {
  const { toast } = useToast();
  const { user, session, signIn } = useAuth();
  const location = useLocation();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === '1') {
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified. You can now sign in.",
      });
    }
  }, [location, toast]);

  if (user && session) {
    return <Navigate to={session.isAdmin ? "/admin" : "/"} replace />;
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email || !password) {
      toast({ title: "Missing Fields", description: "Please enter email and password", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // For admin login, call the backend auth endpoint directly
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sign in failed');
      }

      if (!data.isAdmin) {
        toast({ title: "Access Denied", description: "This login is for administrators only.", variant: "destructive" });
        return;
      }

      // Store the session data for the AuthContext
      const sessionData = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: data.user,
        isAdmin: true // Ensure isAdmin flag is set
      };

      // Update the AuthContext with the session
      // Since we're using the backend auth, we need to manually set the session
      localStorage.setItem('dja_demo_session', JSON.stringify({
        session: sessionData,
        user: data.user
      }));

      // Also update the current session in AuthContext if possible
      if (window.location) {
        // Force a page reload to ensure AuthContext picks up the new session
        setTimeout(() => {
          window.location.href = '/admin';
        }, 500);
      }

      toast({ title: "Admin Login Successful!", description: "Redirecting to admin dashboard..." });
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);

    } catch (error) {
      console.error('Admin signin error:', error);
      toast({ title: "Sign In Failed", description: error.message || "An error occurred during sign in", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900 flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md border-red-200 bg-card/80 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <CardTitle className="text-2xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Admin Login</CardTitle>
          </div>
          <CardDescription>Access the administration dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Admin Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in as Admin..." : "Sign In as Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}