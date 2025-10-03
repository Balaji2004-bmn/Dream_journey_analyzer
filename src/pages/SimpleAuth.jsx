import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SimpleAuth() {
  const { user, signIn, signUp, sendVerificationEmail, verifyEmailCode } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const hcaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITEKEY || '';
  const [captchaTokenSignIn, setCaptchaTokenSignIn] = useState('');
  const [captchaTokenSignUp, setCaptchaTokenSignUp] = useState('');
  
  // Form states
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [verificationCode, setVerificationCode] = useState('');
  
  // Error states
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Redirect if already authenticated
  if (user) {
    const isAdminUser = user?.isAdmin || (user?.email && ['bmn636169@gmail.com','b80003365@gmail.com'].includes(user.email.toLowerCase()));
    return <Navigate to={isAdminUser ? '/admin' : '/'} replace />;
  }

  // hCaptcha callbacks
  useEffect(() => {
    if (hcaptchaSiteKey) {
      window.onHCaptchaSimpleSignIn = (token) => setCaptchaTokenSignIn(token);
      window.onHCaptchaSimpleSignUp = (token) => setCaptchaTokenSignUp(token);
    }
    return () => {
      if (hcaptchaSiteKey) {
        try { delete window.onHCaptchaSimpleSignIn; delete window.onHCaptchaSimpleSignUp; } catch (_) {}
      }
    };
  }, [hcaptchaSiteKey]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSignInError('');

    try {
      if (hcaptchaSiteKey && !captchaTokenSignIn) {
        setSignInError('Please complete the hCaptcha challenge.');
        return;
      }
      const { data, error } = await signIn(signInForm.email, signInForm.password, captchaTokenSignIn);
      
      if (error) {
        if (error.needsVerification) {
          setVerificationEmail(signInForm.email);
          setShowVerification(true);
          setSignInError('');
        } else {
          setSignInError(error.message);
        }
      } else {
        toast.success('Signed in successfully!');
        const isAdminUser = data?.user?.isAdmin || (data?.user?.email && ['bmn636169@gmail.com','b80003365@gmail.com'].includes(data.user.email.toLowerCase()));
        navigate(isAdminUser ? '/admin' : '/');
      }
    } catch (error) {
      setSignInError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSignUpError('');

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setSignUpError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (hcaptchaSiteKey && !captchaTokenSignUp) {
        setSignUpError('Please complete the hCaptcha challenge.');
        setLoading(false);
        return;
      }
      const { data, error, needsVerification } = await signUp(signUpForm.email, signUpForm.password, captchaTokenSignUp);
      
      if (error) {
        setSignUpError(error.message);
      } else {
        toast.success('Account created successfully!');
        if (needsVerification) {
          setVerificationEmail(signUpForm.email);
          setShowVerification(true);
          // Automatically send verification email
          await sendVerificationEmail(signUpForm.email);
        }
      }
    } catch (error) {
      setSignUpError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setLoading(true);
    try {
      const result = await sendVerificationEmail(verificationEmail);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationError('');

    try {
      const result = await verifyEmailCode(verificationCode, verificationEmail);
      
      if (result.success) {
        toast.success(result.message);
        setShowVerification(false);
        setActiveTab('signin');
        setVerificationCode('');
      } else {
        setVerificationError(result.message);
      }
    } catch (error) {
      setVerificationError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Confirm Your Email</CardTitle>
            <CardDescription>
              We've sent a confirmation email to <strong>{verificationEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button 
                className="w-full"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const result = await verifyEmailCode('000000', verificationEmail);
                    if (result.success) {
                      toast.success(result.message);
                      setShowVerification(false);
                      setActiveTab('signin');
                    } else {
                      setVerificationError(result.message);
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                I've confirmed my email
              </Button>
              <Button variant="outline" onClick={handleSendVerification} disabled={loading}>
                Resend Confirmation Email
              </Button>
              <Button variant="ghost" onClick={() => setShowVerification(false)}>
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dream Journey
          </CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value={"signin"} className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    required
                  />
                </div>

                {signInError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{signInError}</AlertDescription>
                  </Alert>
                )}

                {hcaptchaSiteKey && (
                  <div className="mt-2">
                    <div className="h-captcha" data-sitekey={hcaptchaSiteKey} data-callback="onHCaptchaSimpleSignIn"></div>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  Sign In
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Are you an admin? <button type="button" className="text-purple-600 hover:underline" onClick={() => navigate('/admin-auth')}>Admin Sign In</button>
              </div>
            </TabsContent>

            <TabsContent value={"signup"} className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signUpForm.confirmPassword}
                    onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                {signUpError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{signUpError}</AlertDescription>
                  </Alert>
                )}

                {hcaptchaSiteKey && (
                  <div className="mt-2">
                    <div className="h-captcha" data-sitekey={hcaptchaSiteKey} data-callback="onHCaptchaSimpleSignUp"></div>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
                  Create Account
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                <p>Password must be 8+ characters with uppercase, lowercase, number, and special character.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
