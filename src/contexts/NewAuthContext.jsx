import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const NewAuthContext = createContext(undefined);

// Local persistence for development/demo sessions returned by backend when Supabase login fails
const DEMO_STORAGE_KEY = 'dja_demo_session';
const getStoredDemo = () => {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};
const saveStoredDemo = (payload) => {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {}
};
const clearStoredDemo = () => {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch (_) {}
};

export const NewAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  const requireVerified = String(import.meta.env.VITE_REQUIRE_EMAIL_VERIFIED ?? 'true').toLowerCase() === 'true';

  useEffect(() => {
    const bootstrapSession = async () => {
      // In development, prioritize demo sessions over Supabase sessions
      if ((import.meta.env.DEV || import.meta.env.MODE === 'development')) {
        const stored = getStoredDemo();
        if (stored?.session && (!stored.session.expires_at || stored.session.expires_at > Date.now())) {
          const provider = stored.user?.app_metadata?.provider || 'email';
          const emailConfirmedAt = stored.user?.email_confirmed_at || stored.user?.confirmed_at || null;
          if (requireVerified && provider === 'email' && !emailConfirmedAt) {
            clearStoredDemo();
          } else {
            setUser(stored.user || null);
            // For demo sessions, preserve the isAdmin flag if it was set during signin
            const sessionWithAdmin = stored.session.isAdmin ? { ...stored.session, isAdmin: true } : stored.session;
            setSession(sessionWithAdmin);
            setLoading(false);
            return;
          }
        }
      }

      // Check Supabase session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        const provider = currentSession.user?.app_metadata?.provider || 'email';
        const emailConfirmedAt = currentSession.user?.email_confirmed_at || currentSession.user?.confirmed_at || null;
        if (requireVerified && provider === 'email' && !emailConfirmedAt) {
          try { await supabase.auth.signOut(); } catch (_) {}
          clearStoredDemo();
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        setUser(currentSession.user);
        setSession(currentSession);

        // Re-check admin status on bootstrap
        try {
          const res = await fetch(`${backendUrl}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentSession.access_token })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.isAdmin) {
              currentSession.isAdmin = true;
              setSession({ ...currentSession });
            }
          }
        } catch (_) {
          // ignore bootstrap errors
        }
      } else {
        clearStoredDemo();
      }
      setLoading(false);
    };

    bootstrapSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, supaSession) => {
      // In development, don't let Supabase auth changes interfere with demo sessions
      if ((import.meta.env.DEV || import.meta.env.MODE === 'development')) {
        const stored = getStoredDemo();
        if (stored?.session && !supaSession) {
          // Keep demo session active
          return;
        }
      }

      if (supaSession) {
        const provider = supaSession.user?.app_metadata?.provider || 'email';
        const emailConfirmedAt = supaSession.user?.email_confirmed_at || supaSession.user?.confirmed_at || null;
        if (requireVerified && provider === 'email' && !emailConfirmedAt) {
          try { await supabase.auth.signOut(); } catch (_) {}
          clearStoredDemo();
          setSession(null);
          setUser(null);
          return;
        }
      } else {
        // Clear demo session only if Supabase also has no session
        clearStoredDemo();
      }
      setSession(supaSession);
      setUser(supaSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const apiFetch = async (endpoint, options = {}) => {
    // Attach Authorization from Supabase session or stored demo session
    const stored = getStoredDemo();
    const authToken = (session?.access_token) || (stored?.session?.access_token);
    const res = await fetch(`${backendUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  };

  const signUp = async (email, password, hcaptchaToken) => {
    // In development, use backend API to avoid Supabase hCaptcha issues
    if ((import.meta.env.DEV || import.meta.env.MODE === 'development')) {
      try {
        const res = await fetch(`${backendUrl}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, hcaptchaToken })
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: { message: data.message || 'Failed to sign up' } };
        }

        // Update state from backend response
        if (data.user) {
          // For demo mode, create a mock session
          if (data.demo) {
            const mockSession = {
              access_token: 'demo-' + Math.random().toString(36).substr(2, 9),
              refresh_token: 'demo-' + Math.random().toString(36).substr(2, 9),
              expires_at: Date.now() + (60 * 60 * 1000), // 1 hour
              user: data.user
            };
            saveStoredDemo({ user: data.user, session: mockSession });
            setUser(data.user);
            setSession(mockSession);
          }
        }

        return { data: { user: data.user, session: data.session } };
      } catch (e) {
        return { error: { message: e?.message || 'Unexpected error during sign up' } };
      }
    }

    // Production: Use Supabase client directly
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password || '',
        options: hcaptchaToken ? { captchaToken: hcaptchaToken } : undefined,
      });

      if (authError) {
        let msg = authError.message || 'Failed to sign up';
        return { error: { message: msg } };
      }

      // Update state from Supabase session if auto-confirmed
      if (authData?.session) {
        setUser(authData.session.user || null);
        setSession(authData.session || null);
        clearStoredDemo();
      }

      return { data: { user: authData.user, session: authData.session } };
    } catch (e) {
      return { error: { message: e?.message || 'Unexpected error during sign up' } };
    }
  };

  const signIn = async (email, password, hcaptchaToken) => {
    // In development, use backend API to avoid Supabase hCaptcha issues
    if ((import.meta.env.DEV || import.meta.env.MODE === 'development')) {
      try {
        const res = await fetch(`${backendUrl}/api/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, hcaptchaToken })
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: { message: data.message || 'Failed to sign in' } };
        }

        // Update state from backend response
        if (data.user && data.session) {
          if (data.demo) {
            // For demo sessions, save to localStorage
            saveStoredDemo({ user: data.user, session: data.session });
          }
          setUser(data.user);
          setSession(data.session);
        }

        return { data: { user: data.user, session: data.session } };
      } catch (e) {
        return { error: { message: e?.message || 'Unexpected error during sign in' } };
      }
    }

    // Production: Use Supabase client directly
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password || '',
        options: hcaptchaToken ? { captchaToken: hcaptchaToken } : undefined,
      });

      if (authError) {
        let msg = authError.message || 'Failed to sign in';
        if (/invalid/.test(msg.toLowerCase())) msg = 'Invalid email or password';
        if (msg.includes('captcha') || msg.includes('bot protection')) {
          msg = 'Bot Protection is enabled. Please complete the captcha challenge or disable Bot Protection in Supabase settings.';
        }
        return { error: { message: msg } };
      }

      // Update state from Supabase session
      const { data: sess } = await supabase.auth.getSession();
      setUser(sess?.session?.user || null);
      setSession(sess?.session || null);
      clearStoredDemo();

      // Verify admin status via backend (JSON header included by apiFetch)
      if (sess?.session?.access_token) {
        const { ok: vOk, data: verifyData } = await apiFetch('/api/auth/verify', {
          method: 'POST',
          body: JSON.stringify({ token: sess.session.access_token })
        });
        if (vOk && verifyData.isAdmin) {
          setSession(prev => ({ ...(prev || sess.session), isAdmin: true }));
        }
      }

      return { data: { user: sess?.session?.user, session: sess?.session } };
    } catch (e) {
      return { error: { message: e?.message || 'Unexpected error during sign in' } };
    }
  };

  const signOut = async () => {
    // In development, just clear demo session
    if ((import.meta.env.DEV || import.meta.env.MODE === 'development')) {
      clearStoredDemo();
      setUser(null);
      setSession(null);
      return;
    }

    // In production, sign out from Supabase
    await supabase.auth.signOut();
    clearStoredDemo();
    setUser(null);
    setSession(null);
  };

  const sendVerificationEmail = async (email) => {
    const { ok, data } = await apiFetch('/api/email/send-confirmation', { method: 'POST', body: JSON.stringify({ email }) });
    return { success: ok, message: data.message || (ok ? 'Email sent!' : 'Failed to send email.') };
  };

  const checkVerificationStatus = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) return { isVerified: false, message: 'Could not refresh session.' };
    const isVerified = !!data.user?.email_confirmed_at;
    return { isVerified, message: isVerified ? 'Email is verified.' : 'Email is not yet verified.' };
  };

  const checkAdminAccess = async () => {
    if (!session?.access_token) {
      return { isAdmin: false, error: 'No session' };
    }

    try {
      const { ok, data } = await apiFetch('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token: session.access_token })
      });

      if (ok && data.isAdmin) {
        return { isAdmin: true };
      } else {
        return { isAdmin: false, error: data.message || 'Not an admin' };
      }
    } catch (error) {
      return { isAdmin: false, error: 'Failed to verify admin status' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { data };
    } catch (e) {
      return { error: { message: e?.message || 'Google sign-in failed' } };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    sendVerificationEmail,
    checkVerificationStatus,
    checkAdminAccess,
  };

  return <NewAuthContext.Provider value={value}>{children}</NewAuthContext.Provider>;
};

export const useNewAuth = () => {
  const context = useContext(NewAuthContext);
  if (context === undefined) {
    throw new Error('useNewAuth must be used within a NewAuthProvider');
  }
  return context;
};
