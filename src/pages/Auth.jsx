import { useState, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const { toast } = useToast();
  const { user, session, signUp, signIn, signInWithGoogle, checkVerificationStatus, sendVerificationEmail } = useAuth();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  const hcaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITEKEY || '';

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  // Password reset state
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isResetEmailSending, setIsResetEmailSending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [captchaTokenSignIn, setCaptchaTokenSignIn] = useState('');
  const [captchaTokenSignUp, setCaptchaTokenSignUp] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const signInCaptchaRef = useRef(null);
  const signUpCaptchaRef = useRef(null);
  const [signInWidgetId, setSignInWidgetId] = useState(null);
  const [signUpWidgetId, setSignUpWidgetId] = useState(null);

  // Reset hCaptcha widgets
  const resetCaptcha = () => {
    if (window.hcaptcha) {
      try {
        if (signInWidgetId !== null) {
          window.hcaptcha.reset(signInWidgetId);
          setCaptchaTokenSignIn('');
        }
        if (signUpWidgetId !== null) {
          window.hcaptcha.reset(signUpWidgetId);
          setCaptchaTokenSignUp('');
        }
      } catch (e) {
        console.warn('hCaptcha reset error:', e);
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === '1') {
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified. You can now sign in.",
      });
    }
  }, [location, toast]);

  // Debug hCaptcha loading
  useEffect(() => {
    if (hcaptchaSiteKey) {
      console.log('hCaptcha site key configured:', hcaptchaSiteKey);
      console.log('window.hcaptcha available:', !!window.hcaptcha);
      console.log('Active tab:', activeTab);
      console.log('signInCaptchaRef.current:', !!signInCaptchaRef.current);
      console.log('signUpCaptchaRef.current:', !!signUpCaptchaRef.current);
    }
  }, [hcaptchaSiteKey, activeTab]);

  // Ensure hCaptcha script is loaded and render widgets
  const loadHCaptcha = () =>
    new Promise((resolve) => {
      if (window.hcaptcha) return resolve(window.hcaptcha);
      const existing = document.querySelector('script[src*="js.hcaptcha.com/1/api.js"]');
      if (existing) {
        // Script exists, wait for it to load
        const checkLoaded = () => {
          if (window.hcaptcha) {
            resolve(window.hcaptcha);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }
      // Create new script
      const s = document.createElement('script');
      s.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
      s.async = true;
      s.onload = () => {
        // Wait a bit for hcaptcha to be available
        setTimeout(() => resolve(window.hcaptcha), 100);
      };
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });

  // Explicitly render hCaptcha widgets for SPA (including first navigation without full refresh)
  useEffect(() => {
    if (!hcaptchaSiteKey) return;

    // Ensure callbacks exist
    window.onHCaptchaSignIn = (token) => setCaptchaTokenSignIn(token);
    window.onHCaptchaSignUp = (token) => setCaptchaTokenSignUp(token);

    let cancelled = false;
    let interval;

    loadHCaptcha().then((hc) => {
      if (cancelled || !hc) return;
      
      // Try to render immediately
      const tryRender = () => {
        try {
          if (signInCaptchaRef.current && signInWidgetId == null && activeTab === 'signin') {
            console.log('Rendering sign-in hCaptcha widget');
            const id = hc.render(signInCaptchaRef.current, {
              sitekey: hcaptchaSiteKey,
              callback: window.onHCaptchaSignIn,
            });
            setSignInWidgetId(id);
          }
          if (signUpCaptchaRef.current && signUpWidgetId == null && activeTab === 'signup') {
            console.log('Rendering sign-up hCaptcha widget');
            const id2 = hc.render(signUpCaptchaRef.current, {
              sitekey: hcaptchaSiteKey,
              callback: window.onHCaptchaSignUp,
            });
            setSignUpWidgetId(id2);
          }
        } catch (e) {
          console.warn('hCaptcha render error:', e);
        }
      };

      // Try immediately and then with a small delay
      tryRender();
      setTimeout(tryRender, 200);
    });

    return () => { cancelled = true; if (interval) clearInterval(interval); };
  }, [hcaptchaSiteKey, signInWidgetId, signUpWidgetId, activeTab]);

  // Render widget when tab becomes active (handles lazy-mounting)
  useEffect(() => {
    if (!hcaptchaSiteKey) return;
    let cancelled = false;
    const run = async () => {
      const hc = window.hcaptcha || (await loadHCaptcha());
      if (cancelled || !hc) return;
      if (activeTab === 'signin' && signInCaptchaRef.current && signInWidgetId == null) {
        try {
          console.log('Rendering sign-in hCaptcha on tab switch');
          const id = hc.render(signInCaptchaRef.current, { sitekey: hcaptchaSiteKey, callback: window.onHCaptchaSignIn });
          setSignInWidgetId(id);
        } catch (e) {
          console.warn('Sign-in hCaptcha render error:', e);
        }
      }
      if (activeTab === 'signup' && signUpCaptchaRef.current && signUpWidgetId == null) {
        try {
          console.log('Rendering sign-up hCaptcha on tab switch');
          const id2 = hc.render(signUpCaptchaRef.current, { sitekey: hcaptchaSiteKey, callback: window.onHCaptchaSignUp });
          setSignUpWidgetId(id2);
        } catch (e) {
          console.warn('Sign-up hCaptcha render error:', e);
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [activeTab, hcaptchaSiteKey, signInWidgetId, signUpWidgetId]);

  // Detect Supabase recovery redirect and enable reset form
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setIsResetMode(true);
      toast({ title: 'Password reset link verified', description: 'Please set a new password now.' });
    }
  }, [toast]);

  if (user && session) {
    return <Navigate to={session.isAdmin ? "/admin" : "/"} replace />;
  }

  const validatePassword = (pwd) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast({ title: 'Email Required', description: 'Enter your email above, then click Send magic link.', variant: 'destructive' });
      return;
    }
    const now = Date.now();
    if (now < cooldownUntil) {
      const secs = Math.ceil((cooldownUntil - now) / 1000);
      toast({ title: 'Please wait', description: `You can request another magic link in ${secs}s to avoid rate limits.`, variant: 'destructive' });
      return;
    }
    try {
      setIsResetEmailSending(true);
      const res = await fetch(`${backendUrl}/api/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send magic link');
      toast({ title: 'Magic link sent', description: 'Check your inbox and click the link to sign in.' });
      setCooldownUntil(Date.now() + 60_000);
    } catch (err) {
      toast({ title: 'Failed to send magic link', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsResetEmailSending(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    console.log('Form submission:', { email, password: password ? '***' : '', confirmPassword: confirmPassword ? '***' : '' });

    if (!email || !password || !confirmPassword) {
      toast({ title: "Missing Fields", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (!validatePassword(password)) {
      toast({ title: "Weak Password", description: "Password must be 8+ chars with upper, lower, number, and special character", variant: "destructive" });
      return;
    }

    // Only require captcha if Bot Protection is enabled in Supabase
    // If no site key is configured, proceed without captcha
    if (hcaptchaSiteKey && !captchaTokenSignUp) {
      toast({ title: 'hCaptcha required', description: 'Please complete the hCaptcha challenge to continue.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const result = await signUp(email.trim().toLowerCase(), password, captchaTokenSignUp);
    setIsLoading(false);

    if (result.error) {
      toast({ title: "Sign Up Failed", description: result.error.message, variant: "destructive" });
    } else {
      toast({ title: "Account Created!", description: "Please verify your email, then sign in." });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    console.log('Signin form submission:', { email, password: password ? '***' : '' });

    if (!email || !password) {
      toast({ title: "Missing Fields", description: "Please enter email and password", variant: "destructive" });
      return;
    }

    // Only require captcha if Bot Protection is enabled in Supabase
    // If no site key is configured, proceed without captcha
    if (hcaptchaSiteKey && !captchaTokenSignIn) {
      toast({ title: 'hCaptcha required', description: 'Please complete the hCaptcha challenge to continue.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const result = await signIn(email.trim().toLowerCase(), password, captchaTokenSignIn);
    setIsLoading(false);

    if (result.error) {
      const lower = (result.error.message || '').toLowerCase();
      if (lower.includes('email not confirmed') || lower.includes('email not verified')) {
        setNeedsVerification(true);
      }
      const msg = result.error.message || 'Sign in failed. If you enabled Bot Protection (hCaptcha) in Supabase, disable it for local testing or integrate captcha.';
      toast({ title: "Sign In Failed", description: msg, variant: "destructive" });
    } else {
      const isAdmin = result.data.session?.isAdmin;
      toast({ title: isAdmin ? "Admin Login Successful!" : "Welcome Back!", description: "Redirecting..." });
      setTimeout(() => {
        window.location.href = isAdmin ? '/admin' : '/';
      }, 1000);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: 'Email Required', description: 'Enter your email above, then click Forgot password.', variant: 'destructive' });
      return;
    }
    const now = Date.now();
    if (now < cooldownUntil) {
      const secs = Math.ceil((cooldownUntil - now) / 1000);
      toast({ title: 'Please wait', description: `You can request another reset in ${secs}s to avoid rate limits.`, variant: 'destructive' });
      return;
    }
    try {
      setIsResetEmailSending(true);
      const res = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email');
      toast({ title: 'Password reset email sent', description: 'Check your inbox for the reset link.' });
      setCooldownUntil(Date.now() + 60_000);
    } catch (err) {
      toast({ title: 'Failed to send reset email', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsResetEmailSending(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (isResetting) return;
    if (!newPassword || !confirmNewPassword) {
      toast({ title: 'Missing Fields', description: 'Enter and confirm your new password.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: 'Password Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(newPassword)) {
      toast({ title: 'Weak Password', description: 'Use 8+ chars with upper, lower, number, and special character.', variant: 'destructive' });
      return;
    }
    try {
      setIsResetting(true);
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      // Clear hash and exit reset mode
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      setIsResetMode(false);
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      toast({ title: 'Failed to update password', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email to check its status.", variant: "destructive" });
      return;
    }
    const result = await checkVerificationStatus();
    toast({ title: result.isVerified ? "Verification Confirmed!" : "Verification Pending", description: result.message, variant: result.isVerified ? "default" : "destructive" });
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email to resend the verification link.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const result = await sendVerificationEmail(email);
    setIsLoading(false);
    toast({ title: result.success ? "Email Sent!" : "Error", description: result.message, variant: result.success ? "default" : "destructive" });
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        toast({ title: "Google Sign In Failed", description: result.error.message, variant: "destructive" });
      }
      // OAuth redirect will happen automatically if successful
    } catch (error) {
      toast({ title: "Google Sign In Failed", description: "An unexpected error occurred", variant: "destructive" });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-highlight flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
            <CardTitle className="text-2xl text-highlight">Dream Journey</CardTitle>
          </div>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          {isResetMode && (
            <div className="space-y-4 mb-6 p-4 border rounded-lg">
              <h3 className="text-lg font-medium">Reset Password</h3>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 pr-10" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="Confirm New Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="pl-10 pr-10" />
              </div>
              <Button onClick={handlePasswordReset} className="w-full" disabled={isResetting}>{isResetting ? 'Updating...' : 'Update Password'}</Button>
            </div>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4 mt-6">
              {/* Google Sign In Button */}
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-3"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email and Password Inputs */}
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required /></div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                {hcaptchaSiteKey && (
                  <div className="mt-2">
                    <div ref={signInCaptchaRef} id="signin-hcaptcha" style={{ minHeight: '78px' }} />
                  </div>
                )}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</Button>
                <div className="text-center">
                  <Button type="button" variant="link" onClick={handleForgotPassword} disabled={isResetEmailSending} className="h-auto p-0">
                    {isResetEmailSending ? 'Sending reset link...' : 'Forgot password?'}
                  </Button>
                  <span className="mx-2">|</span>
                  <Button type="button" variant="link" onClick={handleMagicLink} disabled={isResetEmailSending} className="h-auto p-0">
                    {isResetEmailSending ? 'Sending magic link...' : 'Send magic link'}
                  </Button>
                </div>
              </form>
              {needsVerification && (
                <div className="mt-4 text-center text-sm p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-muted-foreground mb-2">Your email needs to be verified.</p>
                  <Button variant="link" type="button" className="text-purple-600 h-auto p-0" onClick={handleResendVerification} disabled={isLoading}>{isLoading ? "Sending..." : "Resend verification email"}</Button>
                  <span className="mx-2">|</span>
                  <Button variant="link" type="button" className="text-purple-600 h-auto p-0" onClick={handleCheckVerification}>I've verified, check again</Button>
                </div>
              )}
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-4 mt-6">
              {/* Google Sign In Button */}
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-3"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Email, Password, Confirm Password Inputs */}
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required /></div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required minLength={8} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                {password && (!validatePassword(password) ? <p className="text-xs text-primary"><AlertCircle className="inline w-3 h-3 mr-1"/>8+ chars, upper, lower, number, special</p> : <p className="text-xs text-green-500"><CheckCircle className="inline w-3 h-3 mr-1"/>Strong password</p>)}
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10" required minLength={8} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                {confirmPassword && (password !== confirmPassword ? <p className="text-xs text-red-500">Passwords do not match</p> : <p className="text-xs text-green-500">Passwords match</p>)}
                {hcaptchaSiteKey && (
                  <div className="mt-2">
                    <div ref={signUpCaptchaRef} id="signup-hcaptcha" style={{ minHeight: '78px' }} />
                  </div>
                )}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || (password && confirmPassword && password !== confirmPassword) || !validatePassword(password)}>{isLoading ? "Creating account..." : "Sign Up"}</Button>
              </form>
            </TabsContent>


          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
