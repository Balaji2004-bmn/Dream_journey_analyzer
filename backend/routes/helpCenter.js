const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateAdmin, requirePermission, auditLog } = require('../middleware/adminAuth');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

const router = express.Router();

// Initialize Supabase client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configure email transporter
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

// 🆘 USER HELP CENTER ENDPOINTS

// Submit feedback/support request
router.post('/feedback', authenticateUser, async (req, res) => {
  try {
    const { type, subject, message, priority = 'medium' } = req.body;

    if (!type || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Type, subject, and message are required'
      });
    }

    const validTypes = ['bug_report', 'feature_request', 'general_feedback', 'technical_support', 'account_issue'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Invalid type',
        message: `Type must be one of: ${validTypes.join(', ')}`
      });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority',
        message: `Priority must be one of: ${validPriorities.join(', ')}`
      });
    }

    // Store feedback in database strictly
    const { data: feedback, error } = await supabaseAdmin
      .from('user_feedback')
      .insert({
        user_id: req.user.id,
        type,
        subject,
        message,
        priority,
        status: 'open',
        user_email: req.user.email
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Send email notification to admins
    const transporter = createEmailTransporter();
    if (transporter) {
      const priorityEmoji = {
        low: '🟢',
        medium: '🟡', 
        high: '🟠',
        urgent: '🔴'
      };

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `${priorityEmoji[priority]} New ${type.replace('_', ' ')} - ${subject}`,
        html: `
          <h2>New User Feedback</h2>
          <p><strong>Type:</strong> ${type.replace('_', ' ')}</p>
          <p><strong>Priority:</strong> ${priority}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>User:</strong> ${req.user.email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p><strong>Feedback ID:</strong> ${feedback.id}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback_id: feedback.id,
      status: 'open'
    });

  } catch (error) {
    logger.error('Error submitting feedback:', error);
    res.status(500).json({
      error: 'Failed to submit feedback',
      message: error.message
    });
  }
});

// Get user's feedback history
router.get('/feedback/my', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: feedback, error, count } = await supabaseAdmin
      .from('user_feedback')
      .select('id, type, subject, message, priority, status, created_at, admin_response, responded_at', { count: 'exact' })
      .eq('user_id', req.user.id)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      feedback: feedback || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching user feedback:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback',
      message: error.message
    });
  }
});

// Report inappropriate content
router.post('/report', authenticateUser, async (req, res) => {
  try {
    const { dream_id, reason, description } = req.body;

    if (!dream_id || !reason) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Dream ID and reason are required'
      });
    }

    const validReasons = [
      'inappropriate_content',
      'spam',
      'harassment',
      'copyright_violation',
      'privacy_violation',
      'other'
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        error: 'Invalid reason',
        message: `Reason must be one of: ${validReasons.join(', ')}`
      });
    }

    // Check if dream exists
    const { data: dream, error: dreamError } = await supabaseAdmin
      .from('dreams')
      .select('id, title, user_id')
      .eq('id', dream_id)
      .single();

    if (dreamError || !dream) {
      return res.status(404).json({
        error: 'Dream not found',
        message: 'The specified dream does not exist'
      });
    }

    // Prevent self-reporting
    if (dream.user_id === req.user.id) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot report your own content'
      });
    }

    // Create content flag
    const { data: flag, error } = await supabaseAdmin
      .from('content_flags')
      .insert({
        dream_id,
        flagged_by: req.user.id,
        reason,
        description: description || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Send notification to admins
    const transporter = createEmailTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `🚩 Content Reported - ${dream.title}`,
        html: `
          <h2>Content Report</h2>
          <p><strong>Dream:</strong> ${dream.title}</p>
          <p><strong>Reason:</strong> ${reason.replace('_', ' ')}</p>
          <p><strong>Description:</strong> ${description || 'None provided'}</p>
          <p><strong>Reported by:</strong> ${req.user.email}</p>
          <p><strong>Flag ID:</strong> ${flag.id}</p>
          <p><strong>Reported at:</strong> ${new Date().toLocaleString()}</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Content reported successfully. Our team will review it shortly.',
      report_id: flag.id
    });

  } catch (error) {
    logger.error('Error reporting content:', error);
    res.status(500).json({
      error: 'Failed to report content',
      message: error.message
    });
  }
});

// 👨‍💼 ADMIN HELP CENTER ENDPOINTS

// Get all feedback for admin review
router.get('/admin/feedback', 
  authenticateAdmin, 
  requirePermission('content_moderation'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status = 'all', type = 'all', priority = 'all' } = req.query;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from('user_feedback')
        .select(`
          id,
          user_id,
          user_email,
          type,
          subject,
          message,
          priority,
          status,
          created_at,
          admin_response,
          responded_at,
          responded_by
        `)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }
      if (type !== 'all') {
        query = query.eq('type', type);
      }
      if (priority !== 'all') {
        query = query.eq('priority', priority);
      }

      const { data: feedback, error, count } = await query;

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        feedback,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });

    } catch (error) {
      logger.error('Error fetching admin feedback:', error);
      res.status(500).json({
        error: 'Failed to fetch feedback',
        message: error.message
      });
    }
  }
);

// Respond to user feedback
router.patch('/admin/feedback/:feedbackId/respond', 
  authenticateAdmin, 
  requirePermission('content_moderation'),
  auditLog('respond_to_feedback'),
  async (req, res) => {
    try {
      const { feedbackId } = req.params;
      const { response, status = 'resolved' } = req.body;

      if (!response) {
        return res.status(400).json({
          error: 'Missing response',
          message: 'Response message is required'
        });
      }

      // Update feedback with admin response
      const { data: feedback, error } = await supabaseAdmin
        .from('user_feedback')
        .update({
          admin_response: response,
          status,
          responded_at: new Date().toISOString(),
          responded_by: req.user.id
        })
        .eq('id', feedbackId)
        .select('user_email, subject, type')
        .single();

      if (error) {
        throw error;
      }

      // Send response email to user
      const transporter = createEmailTransporter();
      if (transporter && feedback.user_email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: feedback.user_email,
          subject: `Re: ${feedback.subject} - Dream Journey Analyzer Support`,
          html: `
            <h2>Response to Your ${feedback.type.replace('_', ' ')}</h2>
            <p>Thank you for contacting Dream Journey Analyzer support.</p>
            <p><strong>Your original subject:</strong> ${feedback.subject}</p>
            <p><strong>Our response:</strong></p>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50;">
              ${response.replace(/\n/g, '<br>')}
            </div>
            <p>If you need further assistance, please don't hesitate to contact us again.</p>
            <p>Best regards,<br>Dream Journey Analyzer Support Team</p>
          `
        });
      }

      res.json({
        success: true,
        message: 'Response sent successfully',
        status
      });

    } catch (error) {
      logger.error('Error responding to feedback:', error);
      res.status(500).json({
        error: 'Failed to respond to feedback',
        message: error.message
      });
    }
  }
);

// Get feedback statistics
router.get('/admin/feedback/stats', 
  authenticateAdmin, 
  requirePermission('content_moderation'),
  async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;
      
      const now = new Date();
      const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      const { data: feedback } = await supabaseAdmin
        .from('user_feedback')
        .select('type, priority, status, created_at')
        .gte('created_at', startDate.toISOString());

      // Calculate statistics
      const stats = {
        total: feedback?.length || 0,
        by_type: {},
        by_priority: {},
        by_status: {},
        response_rate: 0
      };

      feedback?.forEach(item => {
        stats.by_type[item.type] = (stats.by_type[item.type] || 0) + 1;
        stats.by_priority[item.priority] = (stats.by_priority[item.priority] || 0) + 1;
        stats.by_status[item.status] = (stats.by_status[item.status] || 0) + 1;
      });

      const responded = (stats.by_status.resolved || 0) + (stats.by_status.closed || 0);
      stats.response_rate = stats.total > 0 ? Math.round((responded / stats.total) * 100) : 0;

      res.json({
        success: true,
        timeframe,
        stats
      });

    } catch (error) {
      logger.error('Error fetching feedback stats:', error);
      res.status(500).json({
        error: 'Failed to fetch feedback statistics',
        message: error.message
      });
    }
  }
);

module.exports = router;
