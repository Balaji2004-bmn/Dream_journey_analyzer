import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const { toast } = useToast();
  const { user, session, signUp, signIn, checkVerificationStatus, sendVerificationEmail } = useAuth();
  const location = useLocation();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

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

  const validatePassword = (pwd) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);
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

    setIsLoading(true);
    const result = await signUp(email.trim().toLowerCase(), password);
    setIsLoading(false);

    if (result.error) {
      toast({ title: "Sign Up Failed", description: result.error.message, variant: "destructive" });
    } else {
      toast({ title: "Account Created!", description: "Your account is ready! You can now sign in." });
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

    setIsLoading(true);
    const result = await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);

    if (result.error) {
      if (result.error.message.includes('Email not confirmed')) {
        setNeedsVerification(true);
      }
      toast({ title: "Sign In Failed", description: result.error.message, variant: "destructive" });
    } else {
      const isAdmin = result.data.session?.isAdmin;
      toast({ title: isAdmin ? "Admin Login Successful!" : "Welcome Back!", description: "Redirecting..." });
      setTimeout(() => {
        window.location.href = isAdmin ? '/admin' : '/';
      }, 1000);
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Dream Journey</CardTitle>
          </div>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email and Password Inputs */}
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required /></div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</Button>
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
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Email, Password, Confirm Password Inputs */}
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required /></div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required minLength={8} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                {password && (!validatePassword(password) ? <p className="text-xs text-orange-500"><AlertCircle className="inline w-3 h-3 mr-1"/>8+ chars, upper, lower, number, special</p> : <p className="text-xs text-green-500"><CheckCircle className="inline w-3 h-3 mr-1"/>Strong password</p>)}
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10" required minLength={8} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                {confirmPassword && (password !== confirmPassword ? <p className="text-xs text-red-500">Passwords do not match</p> : <p className="text-xs text-green-500">Passwords match</p>)}
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600" disabled={isLoading || (password && confirmPassword && password !== confirmPassword) || !validatePassword(password)}>{isLoading ? "Creating account..." : "Sign Up"}</Button>
              </form>
            </TabsContent>


          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
