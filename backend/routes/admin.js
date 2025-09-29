const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateAdmin, requirePermission, auditLog, ADMIN_ROLES } = require('../middleware/adminAuth');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

const router = express.Router();

// Initialize Supabase client with service key for admin operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configure email transporter for admin notifications
const createEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
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

// 👥 USER MANAGEMENT ENDPOINTS

// Get all users (paginated)
router.get('/users', 
  authenticateAdmin, 
  requirePermission('user_management'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
      const offset = (page - 1) * limit;

      // Demo mode fallback
      if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'your_supabase_project_url') {
        const demoUsers = [
          {
            id: 'demo-user-1',
            email: 'demo@example.com',
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            role: 'admin',
            is_active: true,
            banned_until: null,
            ban_reason: null
          },
          {
            id: 'demo-user-2',
            email: 'user@example.com',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 3600000).toISOString(),
            email_confirmed_at: new Date(Date.now() - 86400000).toISOString(),
            role: 'user',
            is_active: true,
            banned_until: null,
            ban_reason: null
          }
        ];

        return res.json({
          success: true,
          users: demoUsers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: demoUsers.length,
            pages: 1
          }
        });
      }

      // Try to use the RPC function, fallback to basic query if it doesn't exist
      let data, totalCount;
      try {
        const result = await supabaseAdmin.rpc('get_dashboard_users', {
          page_number: parseInt(page),
          page_limit: parseInt(limit),
          search_query: search || null,
          status_filter: status || 'all'
        });

        if (result.error) {
          throw result.error;
        }

        data = result.data;
        totalCount = data.length > 0 ? data[0].total_count : 0;
      } catch (rpcError) {
        // Fallback: basic user query
        logger.warn('RPC function not available, using fallback query:', rpcError.message);

        const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers({
          page: parseInt(page),
          perPage: parseInt(limit)
        });

        if (userError) {
          throw userError;
        }

        data = users.users.map(user => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          role: 'user',
          is_active: true,
          banned_until: null,
          total_count: users.users.length
        }));

        totalCount = users.total || users.users.length;
      }

      const enrichedUsers = data.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        role: user.role || 'user',
        is_active: user.is_active !== false,
        is_banned: !!user.banned_until,
        banned_until: user.banned_until,
        ban_reason: user.ban_reason || null,
        total_dreams: 0 // Placeholder
      }));

      res.json({
        success: true,
        users: enrichedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      });

    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({
        error: 'Failed to fetch users',
        message: error.message
      });
    }
  }
);

// Activate/Deactivate user account
router.patch('/users/:userId/status', 
  authenticateAdmin, 
  requirePermission('user_management'),
  auditLog('change_user_status'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { is_active, reason } = req.body;

      if (typeof is_active !== 'boolean') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'is_active must be a boolean value'
        });
      }

      // Update user profile
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update({ 
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Send notification email to user
      const transporter = createEmailTransporter();
      if (transporter) {
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (user?.user?.email) {
          const status = is_active ? 'activated' : 'deactivated';
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.user.email,
            subject: `Account ${status} - Dream Journey Analyzer`,
            html: `
              <h2>Account Status Update</h2>
              <p>Your Dream Journey Analyzer account has been ${status}.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>If you have questions, please contact support.</p>
            `
          });
        }
      }

      res.json({
        success: true,
        message: `User account ${is_active ? 'activated' : 'deactivated'} successfully`,
        user: data
      });

    } catch (error) {
      logger.error('Error updating user status:', error);
      res.status(500).json({
        error: 'Failed to update user status',
        message: error.message
      });
    }
  }
);

// Change user role
router.patch('/users/:userId/role', 
  authenticateAdmin, 
  requirePermission('role_management'),
  auditLog('change_user_role'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role, reason } = req.body;

      if (!Object.values(ADMIN_ROLES).includes(role) && role !== 'user') {
        return res.status(400).json({
          error: 'Invalid role',
          message: 'Role must be one of: user, moderator, admin, super_admin'
        });
      }

      // Prevent self-demotion for super admins
      if (req.user.id === userId && req.user.role === ADMIN_ROLES.SUPER_ADMIN && role !== ADMIN_ROLES.SUPER_ADMIN) {
        return res.status(400).json({
          error: 'Invalid operation',
          message: 'Super admins cannot demote themselves'
        });
      }

      // Update user role
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: `User role updated to ${role} successfully`,
        user: data
      });

    } catch (error) {
      logger.error('Error updating user role:', error);
      res.status(500).json({
        error: 'Failed to update user role',
        message: error.message
      });
    }
  }
);

// Ban/Unban user
router.patch('/users/:userId/ban', 
  authenticateAdmin, 
  requirePermission('user_management'),
  auditLog('ban_user'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { ban_duration_days, reason, unban = false } = req.body;

      let banned_until = null;
      if (!unban && ban_duration_days) {
        const banDate = new Date();
        banDate.setDate(banDate.getDate() + ban_duration_days);
        banned_until = banDate.toISOString();
      }

      // Update user ban status
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        banned_until
      });

      if (error) {
        throw error;
      }

      // Send notification email
      const transporter = createEmailTransporter();
      if (transporter && data.user?.email) {
        const action = unban ? 'unbanned' : 'banned';
        const subject = unban ? 'Account Unbanned' : 'Account Banned';
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: data.user.email,
          subject: `${subject} - Dream Journey Analyzer`,
          html: `
            <h2>Account ${action.charAt(0).toUpperCase() + action.slice(1)}</h2>
            <p>Your Dream Journey Analyzer account has been ${action}.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            ${banned_until ? `<p><strong>Ban expires:</strong> ${new Date(banned_until).toLocaleDateString()}</p>` : ''}
            <p>If you believe this is an error, please contact support.</p>
          `
        });
      }

      res.json({
        success: true,
        message: `User ${unban ? 'unbanned' : 'banned'} successfully`,
        banned_until
      });

    } catch (error) {
      logger.error('Error updating ban status:', error);
      res.status(500).json({
        error: 'Failed to update ban status',
        message: error.message
      });
    }
  }
);

// Reset user password
router.post('/users/:userId/reset-password', 
  authenticateAdmin, 
  requirePermission('user_management'),
  auditLog('reset_user_password'),
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Get user email
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (userError || !user?.user?.email) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Could not find user or email address'
        });
      }

      // Send password reset email
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(user.user.email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: `Password reset email sent to ${user.user.email}`
      });

    } catch (error) {
      logger.error('Error resetting password:', error);
      res.status(500).json({
        error: 'Failed to reset password',
        message: error.message
      });
    }
  }
);

// 📊 SYSTEM INSIGHTS ENDPOINTS

// Get aggregated platform statistics
router.get('/insights/stats', 
  authenticateAdmin, 
  requirePermission('system_insights'),
  async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;
      
      // Calculate date range
      const now = new Date();
      const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Perform all database queries in parallel
      const [
        { data: userStats, error: userError },
        { data: dreamStats, error: dreamError },
        { data: keywordsData, error: keywordError }
      ] = await Promise.all([
        supabaseAdmin.from('user_profiles').select('id, is_active', { count: 'exact' }),
        supabaseAdmin.from('dreams').select('id, is_public', { count: 'exact' }),
        supabaseAdmin.rpc('get_top_keywords', { limit_count: 10 })
      ]);

      if (userError || dreamError || keywordError) {
        logger.error('Error fetching insights:', { userError, dreamError, keywordError });
        throw new Error('Failed to fetch all required statistics.');
      }

      // Process statistics
      const totalUsers = userStats.length;
      const confirmedUsers = userStats.filter(u => u.email_confirmed_at).length;
      const totalDreams = dreamStats.length;
      const publicDreams = dreamStats.filter(d => d.is_public).length;

      res.json({
        success: true,
        timeframe,
        stats: {
          users: {
            total: totalUsers,
            confirmed: confirmedUsers,
            confirmation_rate: totalUsers > 0 ? Math.round((confirmedUsers / totalUsers) * 100) : 0
          },
          dreams: {
            total: totalDreams,
            public: publicDreams,
            private: totalDreams - publicDreams,
            public_rate: totalDreams > 0 ? Math.round((publicDreams / totalDreams) * 100) : 0
          },
          keywords: keywordsData || []
        }
      });

    } catch (error) {
      logger.error('Error fetching insights:', error);
      res.status(500).json({
        error: 'Failed to fetch insights',
        message: error.message
      });
    }
  }
);

// Get sentiment trends
router.get('/insights/sentiment', 
  authenticateAdmin, 
  requirePermission('system_insights'),
  async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;
      
      const now = new Date();
      const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      const { data: dreams } = await supabaseAdmin
        .from('dreams')
        .select('analysis, created_at')
        .gte('created_at', startDate.toISOString());

      // Process emotion data
      const emotionCounts = {};
      const dailyEmotions = {};

      dreams?.forEach(dream => {
        if (dream.analysis) {
          try {
            const analysis = typeof dream.analysis === 'string' ? JSON.parse(dream.analysis) : dream.analysis;
            const date = new Date(dream.created_at).toDateString();
            
            if (!dailyEmotions[date]) {
              dailyEmotions[date] = {};
            }

            if (analysis.emotions && Array.isArray(analysis.emotions)) {
              analysis.emotions.forEach(emotion => {
                // Overall counts
                emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
                
                // Daily counts
                dailyEmotions[date][emotion.emotion] = (dailyEmotions[date][emotion.emotion] || 0) + 1;
              });
            }
          } catch (e) {
            // Skip invalid analysis
          }
        }
      });

      const topEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([emotion, count]) => ({ emotion, count }));

      res.json({
        success: true,
        timeframe,
        sentiment: {
          top_emotions: topEmotions,
          daily_trends: dailyEmotions,
          total_analyzed: dreams?.length || 0
        }
      });

    } catch (error) {
      logger.error('Error fetching sentiment data:', error);
      res.status(500).json({
        error: 'Failed to fetch sentiment data',
        message: error.message
      });
    }
  }
);

module.exports = router;
