const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// Check if we should use demo mode (when Supabase keys are not configured)
const isDemoMode = !process.env.SUPABASE_URL ||
                   process.env.SUPABASE_URL === 'your_supabase_project_url' ||
                   !process.env.SUPABASE_ANON_KEY ||
                   process.env.SUPABASE_ANON_KEY === 'your_supabase_anon_key';

// Initialize Supabase client only if not in demo mode
let supabase = null;
if (!isDemoMode) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}

// Admin override config
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
const adminPassword = process.env.ADMIN_MASTER_PASSWORD;

// Demo mode storage
const demoUsers = new Map();
const demoSessions = new Map();
const emailConfirmations = new Map();

// Email transporter for demo mode
const createEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD ||
      process.env.EMAIL_USER === 'your_gmail_address@gmail.com' ||
      process.env.EMAIL_PASSWORD === 'your_app_specific_password') {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Helper: strong password policy
const isStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password);

// Sign up endpoint with demo mode fallback
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request received:', { body: req.body, headers: req.headers });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing fields:', { email: !!email, password: !!password });
      return res.status(400).json({ error: 'Missing Fields', message: 'Email and password are required' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: 'Invalid Password', message: 'Password must be 8+ chars with upper, lower, number, and special character.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDemoMode) {
      // Demo mode: Create user in memory
      if (demoUsers.has(normalizedEmail)) {
        return res.status(409).json({ error: 'User Exists', message: 'An account with this email already exists' });
      }

      const userId = crypto.randomUUID();
      const confirmationToken = crypto.randomBytes(32).toString('hex');

      const user = {
        id: userId,
        email: normalizedEmail,
        password: password, // In production, hash this!
        email_confirmed_at: null,
        created_at: new Date().toISOString(),
        user_metadata: { signup_method: 'web_app' },
        confirmation_token: confirmationToken
      };

      demoUsers.set(normalizedEmail, user);
      emailConfirmations.set(confirmationToken, { email: normalizedEmail, expiresAt: Date.now() + (24 * 60 * 60 * 1000) }); // 24 hours

      // Send confirmation email in demo mode
      const transporter = createEmailTransporter();
      if (transporter) {
        const confirmUrl = `${process.env.BACKEND_PUBLIC_URL || 'http://localhost:3001'}/api/email/confirm-email?email=${encodeURIComponent(normalizedEmail)}`;
        const mailOptions = {
          from: `"Dream Journey Analyzer" <${process.env.EMAIL_USER}>`,
          to: normalizedEmail,
          subject: 'Please confirm your email - Dream Journey Analyzer',
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 40px;">
              <h1 style="color: #333;">Welcome to Dream Journey Analyzer!</h1>
              <p>Please confirm your email address by clicking the button below.</p>
              <a href="${confirmUrl}" style="background-color: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Confirm Email</a>
              <p style="margin-top: 20px; font-size: 12px; color: #777;">If you cannot click the button, please copy and paste this link into your browser:</p>
              <p style="font-size: 12px; color: #777;">${confirmUrl}</p>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          logger.info(`Confirmation email sent to ${normalizedEmail} in demo mode`);
        } catch (emailError) {
          logger.error('Email sending failed in demo mode:', emailError);
        }
      } else {
        // No email configured, auto-confirm for demo
        user.email_confirmed_at = new Date().toISOString();
        logger.info(`Demo mode: Auto-confirmed email for ${normalizedEmail} (no email service)`);
      }

      logger.info(`Demo user signed up: ${normalizedEmail}`);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Please check your email to confirm your account.',
        user: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          user_metadata: user.user_metadata
        },
        demo: true
      });
    } else {
      // Production mode: Use Supabase with custom email confirmation
      const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // Disable Supabase's email confirmation, use our own
        user_metadata: {
          signup_method: 'web_app'
        }
      });

      if (error) {
        logger.error('Sign up error:', error);
        if (error.message && error.message.includes('User already registered')) {
          return res.status(409).json({ error: 'User Exists', message: 'An account with this email already exists' });
        }
        return res.status(400).json({ error: 'Sign Up Failed', message: error.message });
      }

      // Send confirmation email using our system
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      emailConfirmations.set(confirmationToken, { email: normalizedEmail, expiresAt: Date.now() + (24 * 60 * 60 * 1000) }); // 24 hours

      const transporter = createEmailTransporter();
      if (transporter) {
        const confirmUrl = `${process.env.BACKEND_PUBLIC_URL || 'http://localhost:3001'}/api/email/confirm-email?email=${encodeURIComponent(normalizedEmail)}`;
        const mailOptions = {
          from: `"Dream Journey Analyzer" <${process.env.EMAIL_USER}>`,
          to: normalizedEmail,
          subject: 'Please confirm your email - Dream Journey Analyzer',
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 40px;">
              <h1 style="color: #333;">Welcome to Dream Journey Analyzer!</h1>
              <p>Please confirm your email address by clicking the button below.</p>
              <a href="${confirmUrl}" style="background-color: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Confirm Email</a>
              <p style="margin-top: 20px; font-size: 12px; color: #777;">If you cannot click the button, please copy and paste this link into your browser:</p>
              <p style="font-size: 12px; color: #777;">${confirmUrl}</p>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          logger.info(`Confirmation email sent to ${normalizedEmail} in production mode`);
        } catch (emailError) {
          logger.error('Email sending failed in production mode:', emailError);
        }
      } else {
        // No email configured, auto-confirm for production (same as demo)
        try {
          await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
            email_confirmed_at: new Date().toISOString(),
          });
          logger.info(`Production mode: Auto-confirmed email for ${normalizedEmail} (no email service)`);
        } catch (updateError) {
          logger.error('Failed to auto-confirm email:', updateError);
        }
      }

      logger.info(`New user signed up: ${email}`);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Please check your email to confirm your account.',
        user: data.user
      });
    }
  } catch (error) {
    logger.error('Sign up exception:', error);
    return res.status(500).json({ error: 'Sign Up Failed', message: 'Failed to create account' });
  }
});

// Sign in endpoint with demo mode fallback
router.post('/signin', async (req, res) => {
  try {
    console.log('Signin request received:', { body: req.body, headers: req.headers });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing fields:', { email: !!email, password: !!password });
      return res.status(400).json({ error: 'Missing Fields', message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check for Admin Override first (works in both modes)
    const isAdminEmail = adminEmails.includes(normalizedEmail);
    const isMasterPassword = adminPassword && password === adminPassword;
    logger.info(`Admin sign-in check for ${normalizedEmail}: isAdminEmail=${isAdminEmail}, isMasterPassword=${isMasterPassword}`);

    if (isAdminEmail && isMasterPassword) {
      logger.info(`Attempting admin override for ${normalizedEmail}`);

      if (isDemoMode) {
        // Demo mode admin login
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const session = {
          access_token: sessionToken,
          refresh_token: crypto.randomBytes(32).toString('hex'),
          expires_at: Date.now() + (60 * 60 * 1000), // 1 hour
          user: {
            id: 'admin-' + crypto.randomUUID(),
            email: normalizedEmail,
            email_confirmed_at: new Date().toISOString(),
            user_metadata: { role: 'admin' }
          }
        };

        demoSessions.set(sessionToken, session);

        logger.info(`Demo admin ${normalizedEmail} signed in successfully`);
        return res.status(200).json({
          success: true,
          message: 'Admin signed in successfully',
          user: session.user,
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          },
          isAdmin: true,
          demo: true
        });
      } else {
        // Production mode admin login
        try {
          const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

          const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
          if (listErr) {
            logger.error('Admin user list failed:', listErr);
            return res.status(500).json({ message: 'Admin lookup failed' });
          }

          let authUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

          if (!authUser) {
            logger.info(`Admin user ${normalizedEmail} not found, creating...`);
            const { data, error } = await supabaseAdmin.auth.admin.createUser({ email: normalizedEmail, password, email_confirm: true });
            if (error) {
              logger.error('Admin user creation failed:', error);
              return res.status(500).json({ message: 'Admin user creation failed' });
            }
            authUser = data.user;
          } else {
            logger.info(`Admin user ${normalizedEmail} found, updating password to master password.`);
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, { password });
            if (updateError) {
               logger.error('Admin password update failed:', updateError);
               // Don't block login if update fails, just log it.
             }
          }

          const { data: adminSessionData, error: adminSessionError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
          if (adminSessionError) {
            logger.error('Admin session creation failed after override:', adminSessionError);
            return res.status(401).json({ message: 'Admin session creation failed: ' + adminSessionError.message });
          }

          logger.info(`Admin ${normalizedEmail} signed in successfully via override`);
          return res.status(200).json({
            success: true,
            message: 'Admin signed in successfully',
            user: authUser,
            session: adminSessionData.session,
            isAdmin: true
          });
        } catch(e) {
          logger.error('Catastrophic error in admin override block:', e);
          return res.status(500).json({ message: 'An unexpected error occurred during admin sign-in.' });
        }
      }
    }

    if (isDemoMode) {
      // Demo mode standard login
      const user = demoUsers.get(normalizedEmail);

      if (!user) {
        return res.status(401).json({ error: 'Invalid Credentials', message: 'Invalid email or password' });
      }

      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid Credentials', message: 'Invalid email or password' });
      }

      if (!user.email_confirmed_at) {
        return res.status(401).json({ error: 'Email Not Verified', message: 'Please verify your email before signing in.' });
      }

      // Create session
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const session = {
        access_token: sessionToken,
        refresh_token: crypto.randomBytes(32).toString('hex'),
        expires_at: Date.now() + (60 * 60 * 1000), // 1 hour
        user: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          user_metadata: user.user_metadata
        }
      };

      demoSessions.set(sessionToken, session);

      logger.info(`Demo user ${normalizedEmail} signed in successfully`);
      return res.status(200).json({
        success: true,
        message: 'Signed in successfully',
        user: session.user,
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        },
        demo: true
      });
    } else {
      // Production mode standard login
      logger.info(`Attempting standard sign-in for ${normalizedEmail}`);
      const { data: standardData, error: standardError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      // 3. If standard sign-in fails, handle errors
      if (standardError) {
        logger.warn(`Standard sign-in failed for ${normalizedEmail}: ${standardError.message}`);
        if (standardError.message.includes('Email not confirmed')) {
          return res.status(401).json({ error: 'Email Not Verified', message: 'Please verify your email before signing in.' });
        }
        // For any other standard error, return invalid credentials
        return res.status(401).json({ error: 'Invalid Credentials', message: 'Invalid email or password' });
      }

      // 4. If standard sign-in is successful, check email confirmation
      const { user, session } = standardData;

      // Refresh user data to get latest confirmation status
      const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const { data: freshUser, error: refreshError } = await supabaseAdmin.auth.admin.getUserById(user.id);

      if (refreshError) {
        logger.warn(`Failed to refresh user data for ${normalizedEmail}:`, refreshError);
        // Fall back to original user data
        if (!user.email_confirmed_at) {
          logger.warn(`Sign-in blocked for ${normalizedEmail}: email not confirmed`);
          return res.status(401).json({ error: 'Email Not Verified', message: 'Please verify your email before signing in.' });
        }
      } else {
        // Check if email is confirmed using fresh data
        if (!freshUser.user?.email_confirmed_at) {
          logger.warn(`Sign-in blocked for ${normalizedEmail}: email not confirmed`);
          return res.status(401).json({ error: 'Email Not Verified', message: 'Please verify your email before signing in.' });
        }
      }

      try {
        // Try to get or create user profile
        const { data: profile, error: profileError } = await supabase.from('user_profiles').select('is_active, role').eq('user_id', user.id).single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile doesn't exist, try to create it
            logger.info(`Creating user profile for ${normalizedEmail} (${user.id})`);
            const { error: insertError } = await supabase.from('user_profiles').insert({
              user_id: user.id,
              role: 'user',
              is_active: true
            });

            if (insertError) {
              logger.warn(`Failed to create user profile for ${normalizedEmail}:`, insertError);
              // Don't fail the login if profile creation fails, just log it
            }
          } else {
            logger.warn(`Error fetching user profile for ${normalizedEmail}:`, profileError);
            // Don't fail the login for profile fetch errors
          }
        } else if (profile && !profile.is_active) {
          return res.status(403).json({ error: 'Account Disabled', message: 'Your account has been disabled.' });
        }
      } catch (profileException) {
        logger.warn(`Exception handling user profile for ${normalizedEmail}:`, profileException);
        // Don't fail the login for profile issues
      }

      logger.info(`User ${normalizedEmail} signed in successfully`);
      return res.status(200).json({ success: true, message: 'Signed in successfully', user, session });
    }

  } catch (error) {
    logger.error('Sign in exception:', error);
    return res.status(500).json({ error: 'Sign In Failed', message: 'An unexpected error occurred' });
  }
});

// Sign out endpoint
router.post('/signout', async (req, res) => {
  try {
    if (isDemoMode) {
      // In demo mode, invalidate the in-memory session if provided
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (demoSessions.has(token)) {
          demoSessions.delete(token);
        }
      }
      return res.json({ success: true, message: 'Signed out successfully (demo mode)' });
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('Sign out error:', error);
      return res.status(500).json({ error: 'Sign Out Failed', message: 'Failed to sign out' });
    }

    return res.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    logger.error('Sign out exception:', error);
    return res.status(500).json({ error: 'Sign Out Failed', message: 'Failed to sign out' });
  }
});

// Forgot password - send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing Email', message: 'Email is required' });
    }

    const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`;
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      logger.error('Forgot password error:', error);
      return res.status(400).json({ error: 'Reset Failed', message: error.message });
    }

    return res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    logger.error('Forgot password exception:', error);
    return res.status(500).json({ error: 'Reset Failed', message: 'Failed to initiate password reset' });
  }
});

// Reset password - authenticated by Supabase recovery token
router.post('/reset-password', async (req, res) => {
  try {
    const { access_token, new_password } = req.body;
    if (!access_token || !new_password) {
      return res.status(400).json({ error: 'Missing Fields', message: 'Access token and new password are required' });
    }

    if (!isStrongPassword(new_password)) {
      return res.status(400).json({ error: 'Invalid Password', message: 'Password must be 8+ chars with upper, lower, number, and special character.' });
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token: '' });
    if (sessionError) {
      logger.error('Set session with recovery token failed:', sessionError);
      return res.status(401).json({ error: 'Invalid Token', message: 'Invalid or expired recovery token' });
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: new_password });
    if (updateError) {
      logger.error('Password update error:', updateError);
      return res.status(400).json({ error: 'Update Failed', message: updateError.message });
    }

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Reset password exception:', error);
    return res.status(500).json({ error: 'Reset Failed', message: 'Failed to reset password' });
  }
});

// Email confirmation endpoint for demo mode
router.post('/confirm-email', async (req, res) => {
  try {
    const { token, email } = req.body;

    if (isDemoMode) {
      // Demo mode email confirmation
      if (token) {
        // Confirm via token
        const confirmation = emailConfirmations.get(token);
        if (!confirmation || Date.now() > confirmation.expiresAt) {
          return res.status(400).json({ error: 'Invalid Token', message: 'Confirmation token is invalid or expired' });
        }

        const user = demoUsers.get(confirmation.email);
        if (!user) {
          return res.status(404).json({ error: 'User Not Found', message: 'User not found' });
        }

        user.email_confirmed_at = new Date().toISOString();
        emailConfirmations.delete(token);

        logger.info(`Demo email confirmed for ${confirmation.email}`);
        return res.json({
          success: true,
          message: 'Email confirmed successfully! You can now sign in.',
          confirmed: true
        });
      } else if (email) {
        // Confirm via email lookup (for admin purposes)
        const normalizedEmail = email.toLowerCase().trim();
        const user = demoUsers.get(normalizedEmail);
        if (!user) {
          return res.status(404).json({ error: 'User Not Found', message: 'No user found with this email address' });
        }

        user.email_confirmed_at = new Date().toISOString();
        logger.info(`Demo email confirmed via email lookup for ${normalizedEmail}`);
        return res.json({
          success: true,
          message: 'Email confirmed successfully!',
          confirmed: true
        });
      } else {
        return res.status(400).json({ error: 'Missing Parameters', message: 'Token or email is required' });
      }
    } else {
      // Production mode - use existing Supabase logic
      const { email: targetEmail } = req.body;
      const normalizedEmail = (targetEmail || '').trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          error: 'Missing email',
          message: 'Email address is required.'
        });
      }

      try {
        const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

        const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        if (listError) {
          throw listError;
        }
        const users = authData?.users || [];
        const user = users.find(u => (u.email || '').toLowerCase() === normalizedEmail);
        if (!user) {
          logger.warn(`Email confirmation requested but user not found for email: ${normalizedEmail}`);
          return res.status(404).json({
            error: 'User Not Found',
            message: 'No user exists for the provided email address.'
          });
        }

        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email_confirmed_at: new Date().toISOString(),
        });
        logger.info(`Email confirmation updated for user ${user.id} (${normalizedEmail})`);

        return res.json({
          success: true,
          message: 'Email confirmed successfully! You can now sign in.',
          confirmed: true,
        });
      } catch (updateError) {
        logger.error('Email confirmation update error:', updateError);
        return res.status(500).json({
          error: 'Confirmation Failed',
          message: 'Failed to confirm email. Please try again later.'
        });
      }
    }
  } catch (error) {
    logger.error('Email confirmation error:', error);
    res.status(500).json({
      error: 'Confirmation Failed',
      message: 'Failed to confirm email. Please try again.'
    });
  }
});

// GET route for email confirmation links
router.get('/confirm-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send('Missing confirmation token');
    }

    if (isDemoMode) {
      const confirmation = emailConfirmations.get(token);
      if (!confirmation || Date.now() > confirmation.expiresAt) {
        return res.status(400).send('Confirmation token is invalid or expired');
      }

      const user = demoUsers.get(confirmation.email);
      if (!user) {
        return res.status(404).send('User not found');
      }

      user.email_confirmed_at = new Date().toISOString();
      emailConfirmations.delete(token);

      logger.info(`Demo email confirmed via GET for ${confirmation.email}`);

      // Redirect to frontend
      const redirect = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?verified=1`;
      return res.redirect(302, redirect);
    } else {
      // Production mode - handle token confirmation
      const confirmation = emailConfirmations.get(token);
      if (!confirmation || Date.now() > confirmation.expiresAt) {
        return res.status(400).send('Confirmation token is invalid or expired');
      }

      // Confirm the email using admin API
      try {
        const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const user = (authData?.users || []).find(u => (u.email || '').toLowerCase() === confirmation.email.toLowerCase());

        if (user) {
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            email_confirmed_at: new Date().toISOString(),
          });
          emailConfirmations.delete(token);
          logger.info(`Production email confirmed via GET for ${confirmation.email}`);
        }
      } catch (error) {
        logger.error('Error confirming email via GET:', error);
        return res.status(500).send('Failed to confirm email');
      }

      // Redirect to frontend
      const redirect = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?verified=1`;
      return res.redirect(302, redirect);
    }
  } catch (error) {
    logger.error('GET confirm email error:', error);
    return res.status(500).send('Failed to confirm email. Please try again later.');
  }
});

// Verify token endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Missing Token', message: 'Authentication token is required' });
    }

    if (isDemoMode) {
      // Demo mode token verification
      const session = demoSessions.get(token);
      if (!session || Date.now() > session.expires_at) {
        return res.status(401).json({ error: 'Invalid Token', message: 'Authentication token is invalid or expired' });
      }

      const adminEmailsList = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
      const isAdmin = session.user.email && adminEmailsList.includes(session.user.email.toLowerCase());

      return res.json({
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata
        },
        isAdmin,
        demo: true
      });
    } else {
      // Production mode
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid Token', message: 'Authentication token is invalid or expired' });
      }

      const adminEmailsList = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
      const isAdmin = user.email && adminEmailsList.includes(user.email.toLowerCase());

      return res.json({
        success: true,
        user: { id: user.id, email: user.email, metadata: user.user_metadata },
        isAdmin
      });
    }
  } catch (error) {
    logger.error('Token verification exception:', error);
    return res.status(500).json({ error: 'Verification Failed', message: 'Failed to verify authentication token' });
  }
});

// Get user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    const { data: dreams, error: dreamsError } = await supabase
      .from('dreams')
      .select('id, created_at')
      .eq('user_id', user.id);

    if (dreamsError) {
      logger.error('Error fetching user dreams for profile:', dreamsError);
    }

    const profile = {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata || {},
      stats: {
        totalDreams: dreams ? dreams.length : 0,
        joinDate: user.created_at,
        lastActive: new Date().toISOString()
      }
    };

    return res.json({ success: true, profile });
  } catch (error) {
    logger.error('Profile fetch exception:', error);
    return res.status(500).json({ error: 'Profile Fetch Failed', message: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { display_name, bio, avatar_url, location, phone } = req.body;

    const updates = { display_name, bio, avatar_url, location, phone, updated_at: new Date().toISOString() };
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const { data, error } = await supabase.auth.updateUser({ data: updates });
    if (error) {
      logger.error('Profile update error:', error);
      return res.status(500).json({ error: 'Update Failed', message: 'Failed to update user profile' });
    }

    logger.info(`Profile updated for user ${req.user.id}`);
    return res.json({ success: true, user: data.user });
  } catch (error) {
    logger.error('Profile update exception:', error);
    return res.status(500).json({ error: 'Update Failed', message: 'Failed to update user profile' });
  }
});

// Refresh session
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: 'Missing Refresh Token', message: 'Refresh token is required' });
    }

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) {
      return res.status(401).json({ error: 'Refresh Failed', message: 'Failed to refresh authentication session' });
    }

    return res.json({ success: true, session: data.session });
  } catch (error) {
    logger.error('Session refresh exception:', error);
    return res.status(500).json({ error: 'Refresh Failed', message: 'Failed to refresh authentication session' });
  }
});

// GET token verification endpoint to support Authorization header usage
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ error: 'Missing Token', message: 'Authorization Bearer token is required' });
    }
    const token = authHeader.substring(7);

    if (isDemoMode) {
      const session = demoSessions.get(token);
      if (!session || Date.now() > session.expires_at) {
        return res.status(401).json({ error: 'Invalid Token', message: 'Authentication token is invalid or expired' });
      }
      const adminEmailsList = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
      const isAdmin = session.user.email && adminEmailsList.includes(session.user.email.toLowerCase());
      return res.json({ success: true, user: { id: session.user.id, email: session.user.email, metadata: session.user.user_metadata }, isAdmin, demo: true });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Token', message: 'Authentication token is invalid or expired' });
    }

    const adminEmailsList = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const isAdmin = user.email && adminEmailsList.includes(user.email.toLowerCase());

    return res.json({ success: true, user: { id: user.id, email: user.email, metadata: user.user_metadata }, isAdmin });
  } catch (error) {
    logger.error('Token verification exception (GET):', error);
    return res.status(500).json({ error: 'Verification Failed', message: 'Failed to verify authentication token' });
  }
});

module.exports = router;