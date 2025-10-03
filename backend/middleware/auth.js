const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const { demoSessions } = require('../utils/demoSessions');

// Initialize Supabase client for user authentication (Anon key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Strict Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is required'
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT token with Supabase first
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      // Optionally require verified email to access APIs
      const requireVerified = String(process.env.REQUIRE_EMAIL_VERIFIED || 'false').toLowerCase() === 'true';
      const emailConfirmedAt = user.email_confirmed_at || user.confirmed_at || null;
      const provider = user.app_metadata?.provider || 'email';

      if (requireVerified && provider === 'email' && !emailConfirmedAt) {
        return res.status(403).json({
          error: 'EmailNotVerified',
          message: 'Please verify your email address to continue.'
        });
      }

      // Ensure user profile exists in database
      try {
        const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .select('is_active, role')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          logger.info(`Creating user profile for ${user.email} (${user.id}) via middleware`);
          const { error: insertError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
              user_id: user.id,
              role: 'user',
              is_active: true
            });

          if (insertError) {
            logger.warn(`Failed to create user profile for ${user.email}:`, insertError);
          }
        } else if (profile && !profile.is_active) {
          return res.status(403).json({
            error: 'Account Disabled',
            message: 'Your account has been disabled.'
          });
        }
      } catch (profileException) {
        logger.warn(`Exception handling user profile for ${user.email}:`, profileException);
      }

      // Attach user to request
      req.user = user;
      req.isDemoSession = false;
      return next();
    }

    // Development fallback: accept demo session tokens
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      const session = demoSessions.get(token);
      if (session && (!session.expires_at || Date.now() <= session.expires_at)) {
        // Enforce email verification for demo sessions when required
        const requireVerified = String(process.env.REQUIRE_EMAIL_VERIFIED || 'false').toLowerCase() === 'true';
        const emailConfirmedAt = session.user?.email_confirmed_at || session.user?.confirmed_at || null;
        const provider = session.user?.app_metadata?.provider || 'email';

        if (requireVerified && provider === 'email' && !emailConfirmedAt) {
          return res.status(403).json({
            error: 'EmailNotVerified',
            message: 'Please verify your email address to continue.'
          });
        }

        req.user = session.user;
        req.isDemoSession = true;
        logger.info('Authenticated via demo session (dev fallback)');
        return next();
      }
    }

    logger.warn('Authentication failed:', error?.message || 'Invalid token');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token'
    });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Authentication Error',
      message: 'Failed to authenticate user'
    });
  }
};

// Optional authentication
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        // Ensure user profile exists in database
        try {
          const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .select('is_active, role')
            .eq('user_id', user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            logger.info(`Creating user profile for ${user.email} (${user.id}) via optional auth`);
            const { error: insertError } = await supabaseAdmin
              .from('user_profiles')
              .insert({
                user_id: user.id,
                role: 'user',
                is_active: true
              });

            if (insertError) {
              logger.warn(`Failed to create user profile for ${user.email}:`, insertError);
            }
          }
        } catch (profileException) {
          logger.warn(`Exception handling user profile for ${user.email}:`, profileException);
        }

        req.user = user;
        req.isDemoSession = false;
      } else if ((process.env.NODE_ENV || 'development') !== 'production') {
        const session = demoSessions.get(token);
        if (session && (!session.expires_at || Date.now() <= session.expires_at)) {
          req.user = session.user;
          req.isDemoSession = true;
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  authenticateUser,
  optionalAuth
};
