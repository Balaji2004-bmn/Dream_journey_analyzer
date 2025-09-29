import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const NewAuthContext = createContext(undefined);

export const NewAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    const bootstrapSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setUser(currentSession.user);
        setSession(currentSession);

        // Re-check admin status on bootstrap
        const res = await fetch(`${backendUrl}/auth/verify`, { 
          headers: { 'Authorization': `Bearer ${currentSession.access_token}` }
        });
        if(res.ok) {
            const data = await res.json();
            if (data.isAdmin) {
                currentSession.isAdmin = true;
                setSession({...currentSession});
            }
        }
      }
      setLoading(false);
    };

    bootstrapSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const apiFetch = async (endpoint, options = {}) => {
    const res = await fetch(`${backendUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  };

  const signUp = async (email, password) => {
    // Use Supabase client directly for sign-up
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { error };
    }
    // Supabase will automatically send a confirmation email if SMTP is configured.
    // The custom backend call has been removed.
    return { data };
  };

  const signIn = async (email, password) => {
    // Use Supabase client directly for sign-in
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error };
    }

    // Post-signin: verify admin status with our backend
    if (data.session) {
      const { ok, data: verifyData } = await apiFetch('/auth/verify', {
        headers: { 'Authorization': `Bearer ${data.session.access_token}` }
      });

      if (ok && verifyData.isAdmin) {
        // Mutate session object to include isAdmin flag for client-side checks
        data.session.isAdmin = true;
        // Update state with the modified session
        setSession(data.session);
      }
    }
    return { data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const sendVerificationEmail = async (email) => {
    const { ok, data } = await apiFetch('/email/send-confirmation', { method: 'POST', body: JSON.stringify({ email }) });
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
      const { ok, data } = await apiFetch('/auth/verify', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
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

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
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
