import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import api from '../config/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.access_token) {
          await AsyncStorage.setItem(
            'supabase.auth.token',
            JSON.stringify(session)
          );
        } else {
          await AsyncStorage.removeItem('supabase.auth.token');
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    try {
      // Use backend API for signup (to maintain consistency with web app)
      const response = await api.post('/auth/signup', {
        email: email.toLowerCase().trim(),
        password,
      });

      return { data: response.data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        data: null,
        error: error.response?.data || { message: 'Signup failed' },
      };
    }
  };

  const signIn = async (email, password) => {
    try {
      // Use backend API for signin
      const response = await api.post('/auth/signin', {
        email: email.toLowerCase().trim(),
        password,
      });

      if (response.data.session) {
        // Store session
        await AsyncStorage.setItem(
          'supabase.auth.token',
          JSON.stringify(response.data.session)
        );
        setSession(response.data.session);
        setUser(response.data.user);
      }

      return { data: response.data, error: null };
    } catch (error) {
      console.error('Signin error:', error);
      return {
        data: null,
        error: error.response?.data || { message: 'Signin failed' },
      };
    }
  };

  const signOut = async () => {
    try {
      await api.post('/auth/signout');
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('supabase.auth.token');
      setSession(null);
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error('Signout error:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
