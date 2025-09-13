const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Verify token endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Missing Token',
        message: 'Authentication token is required'
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Authentication token is invalid or expired'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      }
    });

  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: 'Failed to verify authentication token'
    });
  }
});

// Get user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    // Get additional user stats
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

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile Fetch Failed',
      message: 'Failed to fetch user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { display_name, bio, avatar_url, location, phone } = req.body;

    const updates = {
      display_name,
      bio,
      avatar_url,
      location,
      phone,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) {
      logger.error('Profile update error:', error);
      return res.status(500).json({
        error: 'Update Failed',
        message: 'Failed to update user profile'
      });
    }

    logger.info(`Profile updated for user ${req.user.id}`);

    res.json({
      success: true,
      user: data.user
    });

  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Failed to update user profile'
    });
  }
});

// Refresh session
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Missing Refresh Token',
        message: 'Refresh token is required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({
        error: 'Refresh Failed',
        message: 'Failed to refresh authentication session'
      });
    }

    res.json({
      success: true,
      session: data.session
    });

  } catch (error) {
    logger.error('Session refresh error:', error);
    res.status(500).json({
      error: 'Refresh Failed',
      message: 'Failed to refresh authentication session'
    });
  }
});

module.exports = router;
