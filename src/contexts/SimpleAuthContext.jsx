import React, { createContext, useContext, useEffect, useState } from 'react';

const SimpleAuthContext = createContext(undefined);

export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo users for testing
  const demoUsers = [
    { 
      id: 'demo-user-1', 
      email: 'demo@example.com', 
      password: 'demo123', 
      isAdmin: false,
      emailConfirmed: true 
    },
    { 
      id: 'demo-user-2', 
      email: 'test@example.com', 
      password: 'test123', 
      isAdmin: false,
      emailConfirmed: true 
    },
    { 
      id: 'demo-admin-1', 
      email: 'bmn636169@gmail.com', 
      password: 'admin123', 
      isAdmin: true,
      emailConfirmed: true 
    },
    { 
      id: 'demo-admin-2', 
      email: 'b80003365@gmail.com', 
      password: 'admin123', 
      isAdmin: true,
      emailConfirmed: true 
    }
  ];

  // Check for existing session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('dreamjourney_user');
    const savedSession = localStorage.getItem('dreamjourney_session');
    
    if (savedUser && savedSession) {
      try {
        setUser(JSON.parse(savedUser));
        setSession(JSON.parse(savedSession));
      } catch (error) {
        console.error('Error loading saved session:', error);
        localStorage.removeItem('dreamjourney_user');
        localStorage.removeItem('dreamjourney_session');
      }
    }
    setLoading(false);
  }, []);

  // Sign Up
  const signUp = async (email, password) => {
    try {
      // Strong password validation
      const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
      if (!strongPwd.test(password)) {
        return { 
          error: { 
            message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character.' 
          } 
        };
      }

      // Check if user already exists
      const existingUser = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return { 
          error: { 
            message: 'An account with this email already exists. Please sign in instead.' 
          } 
        };
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        password: password,
        isAdmin: false,
        emailConfirmed: false,
        created_at: new Date().toISOString()
      };

      // Save to localStorage for demo
      const savedUsers = JSON.parse(localStorage.getItem('dreamjourney_users') || '[]');
      savedUsers.push(newUser);
      localStorage.setItem('dreamjourney_users', JSON.stringify(savedUsers));

      console.log('Sign up successful:', email);
      return { 
        data: { user: { email: newUser.email, id: newUser.id } }, 
        error: null,
        needsVerification: true
      };
    } catch (err) {
      console.error('Signup exception:', err);
      return {
        error: {
          message: 'Network error occurred. Please check your connection and try again.'
        }
      };
    }
  };

  // Sign In
  const signIn = async (email, password) => {
    try {
      console.log(`Attempting sign in for: ${email}`);
      
      // Check demo users first
      const demoUser = demoUsers.find(user => 
        user.email.toLowerCase() === email.toLowerCase() && user.password === password
      );
      
      if (demoUser) {
        console.log(`✅ Demo user authenticated: ${email}`);
        
        const userData = {
          id: demoUser.id,
          email: demoUser.email,
          isAdmin: demoUser.isAdmin,
          emailConfirmed: demoUser.emailConfirmed,
          email_confirmed_at: new Date().toISOString()
        };

        const sessionData = {
          access_token: demoUser.isAdmin ? 'demo-admin-token' : `demo-token-${Date.now()}`,
          refresh_token: 'demo-refresh-token',
          user: userData
        };

        setUser(userData);
        setSession(sessionData);
        
        // Save to localStorage
        localStorage.setItem('dreamjourney_user', JSON.stringify(userData));
        localStorage.setItem('dreamjourney_session', JSON.stringify(sessionData));

        return { 
          data: { user: userData, session: sessionData }, 
          error: null 
        };
      }

      // Check saved users
      const savedUsers = JSON.parse(localStorage.getItem('dreamjourney_users') || '[]');
      const savedUser = savedUsers.find(user => 
        user.email.toLowerCase() === email.toLowerCase() && user.password === password
      );

      if (savedUser) {
        if (!savedUser.emailConfirmed) {
          return {
            error: {
              message: 'Please verify your email address before signing in.',
              needsVerification: true
            }
          };
        }

        console.log(`✅ Saved user authenticated: ${email}`);
        
        const userData = {
          id: savedUser.id,
          email: savedUser.email,
          isAdmin: savedUser.isAdmin || false,
          emailConfirmed: savedUser.emailConfirmed,
          email_confirmed_at: savedUser.email_confirmed_at || new Date().toISOString()
        };

        const sessionData = {
          access_token: `user-token-${Date.now()}`,
          refresh_token: 'user-refresh-token',
          user: userData
        };

        setUser(userData);
        setSession(sessionData);
        
        // Save to localStorage
        localStorage.setItem('dreamjourney_user', JSON.stringify(userData));
        localStorage.setItem('dreamjourney_session', JSON.stringify(sessionData));

        return { 
          data: { user: userData, session: sessionData }, 
          error: null 
        };
      }

      console.log(`❌ No user found for: ${email}`);
      return {
        error: {
          message: 'Invalid email or password. Please check your credentials and try again.'
        }
      };
    } catch (err) {
      console.error('Signin exception:', err);
      return {
        error: {
          message: 'Network error occurred. Please check your connection and try again.'
        }
      };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      localStorage.removeItem('dreamjourney_user');
      localStorage.removeItem('dreamjourney_session');
      console.log('Signout successful');
      return { error: null };
    } catch (err) {
      console.error('Signout exception:', err);
      return {
        error: {
          message: 'Failed to sign out. Please try again.'
        }
      };
    }
  };

  // Send verification email
  const sendVerificationEmail = async (email) => {
    try {
      console.log(`Sending verification email to: ${email}`);
      
      // Simulate email sending
      setTimeout(() => {
        console.log(`✅ Verification email sent to: ${email}`);
      }, 1000);

      return { 
        success: true, 
        message: 'Verification email sent! Please check your inbox and use code: 123456' 
      };
    } catch (error) {
      console.error('Send verification email error:', error);
      return {
        success: false,
        message: 'Failed to send verification email. Please try again.'
      };
    }
  };

  // Verify email code
  const verifyEmailCode = async (code, email) => {
    try {
      console.log(`Verifying code ${code} for email: ${email}`);
      
      // Accept demo code or any 6-digit code for testing
      if (code === '123456' || /^\d{6}$/.test(code)) {
        // Update user's email confirmation status
        const savedUsers = JSON.parse(localStorage.getItem('dreamjourney_users') || '[]');
        const userIndex = savedUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (userIndex !== -1) {
          savedUsers[userIndex].emailConfirmed = true;
          savedUsers[userIndex].email_confirmed_at = new Date().toISOString();
          localStorage.setItem('dreamjourney_users', JSON.stringify(savedUsers));
        }

        console.log(`✅ Email verified for: ${email}`);
        return {
          success: true,
          message: 'Email verification completed successfully! You can now sign in.'
        };
      } else {
        return {
          success: false,
          message: 'Invalid verification code. Please try again or use: 123456'
        };
      }
    } catch (error) {
      console.error('Verify email code error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please try again.'
      };
    }
  };

  // Check if user is admin
  const checkAdminAccess = async () => {
    if (!user) {
      return { isAdmin: false, error: 'No authenticated user' };
    }

    // Check admin emails
    const adminEmails = ['bmn636169@gmail.com', 'b80003365@gmail.com'];
    const isEmailAdmin = user.email && adminEmails.includes(user.email.toLowerCase());
    
    if (isEmailAdmin || user.isAdmin) {
      console.log('Admin access granted:', user.email);
      return { isAdmin: true };
    }

    return { 
      isAdmin: false, 
      error: 'Admin access denied. Please sign in with an admin account.' 
    };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    sendVerificationEmail,
    verifyEmailCode,
    checkAdminAccess
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
