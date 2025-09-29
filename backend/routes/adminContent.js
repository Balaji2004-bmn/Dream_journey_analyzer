const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateAdmin, requirePermission, auditLog } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize Supabase client with service key for admin operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 📖 CONSENT-BASED DREAM ACCESS

// Get dreams with user consent for research/moderation
router.get('/dreams/consented', 
  authenticateAdmin, 
  requirePermission('content_moderation'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, consent_type = 'research' } = req.query;
      const offset = (page - 1) * limit;

      // Only get dreams where users have given explicit consent
      const { data: dreams, error, count } = await supabaseAdmin
        .from('dreams')
        .select(`
          id,
          title,
          content,
          analysis,
          created_at,
          is_public,
          user_consent_research,
          user_consent_moderation,
          user_profiles!inner(display_name)
        `)
        .eq(consent_type === 'research' ? 'user_consent_research' : 'user_consent_moderation', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedDreams = dreams.map(dream => ({
        id: dream.id,
        title: dream.title,
        content: dream.content,
        analysis: dream.analysis,
        created_at: dream.created_at,
        is_public: dream.is_public,
        user_display_name: dream.user_profiles?.display_name || 'Anonymous',
        consent_type
      }));

      res.json({
        success: true,
        dreams: formattedDreams,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });

    } catch (error) {
      logger.error('Error fetching consented dreams:', error);
      res.status(500).json({
        error: 'Failed to fetch consented dreams',
        message: error.message
      });
    }
  }
);

// Get flagged dreams for review
router.get('/dreams/flagged', 
  authenticateAdmin, 
  requirePermission('content_moderation'),
  auditLog('view_flagged_content'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status = 'pending' } = req.query;
      const offset = (page - 1) * limit;

      const { data: flaggedDreams, error, count } = await supabaseAdmin
        .from('content_flags')
        .select(`
          id,
          reason,
          description,
          status,
          created_at,
          flagged_by,
          reviewed_by,
          reviewed_at,
          dreams!inner(
            id,
            title,
            content,
            user_id,
            user_profiles!inner(display_name)
          )
        `)
        .eq('status', status)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedFlags = flaggedDreams.map(flag => ({
        flag_id: flag.id,
        dream_id: flag.dreams.id,
        dream_title: flag.dreams.title,
        dream_content: flag.dreams.content,
        user_display_name: flag.dreams.user_profiles?.display_name || 'Anonymous',
        flag_reason: flag.reason,
        flag_description: flag.description,
        flagged_at: flag.created_at,
        status: flag.status
      }));

      res.json({
        success: true,
        flagged_dreams: formattedFlags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });

    } catch (error) {
      logger.error('Error fetching flagged dreams:', error);
      res.status(500).json({
        error: 'Failed to fetch flagged dreams',
        message: error.message
      });
    }
  }
);

// Review flagged content
router.patch('/dreams/flagged/:flagId/review', 
  authenticateAdmin, 
  requirePermission('content_moderation'),
  auditLog('review_flagged_content'),
  async (req, res) => {
    try {
      const { flagId } = req.params;
      const { action, reason } = req.body; // action: 'approve', 'remove', 'warn'

      if (!['approve', 'remove', 'warn'].includes(action)) {
        return res.status(400).json({
          error: 'Invalid action',
          message: 'Action must be one of: approve, remove, warn'
        });
      }

      // Update flag status
      const { data: flag, error: flagError } = await supabaseAdmin
        .from('content_flags')
        .update({
          status: 'reviewed',
          reviewed_by: req.user.id,
          reviewed_at: new Date().toISOString(),
          admin_action: action,
          admin_reason: reason
        })
        .eq('id', flagId)
        .select('dreams!inner(id, user_id)')
        .single();

      if (flagError) {
        throw flagError;
      }

      // Take action on the dream based on review
      if (action === 'remove') {
        await supabaseAdmin
          .from('dreams')
          .update({ 
            is_public: false,
            content_status: 'removed',
            admin_notes: reason
          })
          .eq('id', flag.dreams.id);
      } else if (action === 'warn') {
        // Create a warning for the user
        await supabaseAdmin
          .from('user_warnings')
          .insert({
            user_id: flag.dreams.user_id,
            reason: reason || 'Content policy violation',
            admin_id: req.user.id,
            dream_id: flag.dreams.id
          });
      }

      res.json({
        success: true,
        message: `Content review completed with action: ${action}`,
        action,
        flag_id: flagId
      });

    } catch (error) {
      logger.error('Error reviewing flagged content:', error);
      res.status(500).json({
        error: 'Failed to review flagged content',
        message: error.message
      });
    }
  }
);

// Update user consent preferences
router.patch('/users/:userId/consent', 
  authenticateAdmin, 
  requirePermission('content_moderation'),
  auditLog('update_user_consent'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { research_consent, moderation_consent } = req.body;

      // Update all user's dreams with new consent settings
      const updates = {};
      if (typeof research_consent === 'boolean') {
        updates.user_consent_research = research_consent;
      }
      if (typeof moderation_consent === 'boolean') {
        updates.user_consent_moderation = moderation_consent;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No consent updates provided',
          message: 'Provide research_consent and/or moderation_consent'
        });
      }

      const { data, error } = await supabaseAdmin
        .from('dreams')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: 'User consent preferences updated',
        updates
      });

    } catch (error) {
      logger.error('Error updating user consent:', error);
      res.status(500).json({
        error: 'Failed to update user consent',
        message: error.message
      });
    }
  }
);

// Get admin access audit trail
router.get('/audit/dream-access', 
  authenticateAdmin, 
  requirePermission('content_moderation'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, user_id } = req.query;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from('admin_audit_logs')
        .select(`
          id,
          admin_id,
          action,
          details,
          created_at,
          user_profiles!admin_id(display_name, email)
        `)
        .in('action', ['view_flagged_content', 'review_flagged_content', 'access_user_dream'])
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (user_id) {
        query = query.eq('details->>affected_user_id', user_id);
      }

      const { data: auditLogs, error, count } = await query;

      if (error) {
        throw error;
      }

      const formattedLogs = auditLogs.map(log => ({
        id: log.id,
        admin_name: log.user_profiles?.display_name || 'Unknown Admin',
        admin_email: log.user_profiles?.email,
        action: log.action,
        details: log.details,
        timestamp: log.created_at
      }));

      res.json({
        success: true,
        audit_logs: formattedLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });

    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      res.status(500).json({
        error: 'Failed to fetch audit logs',
        message: error.message
      });
    }
  }
);

module.exports = router;
