const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Initialize Supabase client with service key for admin operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Admin roles hierarchy
const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// Admin permissions
const ADMIN_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: [
    'user_management',
    'role_management',
    'system_insights',
    'content_moderation',
    'platform_settings'
  ],
  [ADMIN_ROLES.ADMIN]: [
    'user_management',
    'system_insights',
    'content_moderation'
  ],
  [ADMIN_ROLES.MODERATOR]: [
    'content_moderation'
  ]
};

// Check if user has admin role
const checkAdminRole = async (userId) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('role, is_active')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return { isAdmin: false, role: null };
    }

    const isAdmin = Object.values(ADMIN_ROLES).includes(profile.role);
    return { 
      isAdmin, 
      role: profile.role, 
      isActive: profile.is_active,
      permissions: ADMIN_PERMISSIONS[profile.role] || []
    };
  } catch (error) {
    logger.error('Error checking admin role:', error);
    return { isAdmin: false, role: null };
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Admin authentication token is required'
      });
    }

    const token = authHeader.substring(7);

    // Allow demo tokens in development mode
    if (process.env.NODE_ENV !== 'production' && token === 'demo-admin-token') {
      // Demo admin user
      req.user = {
        id: 'demo-admin-id',
        email: 'admin@demo.com',
        role: ADMIN_ROLES.SUPER_ADMIN,
        permissions: ADMIN_PERMISSIONS[ADMIN_ROLES.SUPER_ADMIN]
      };
      return next();
    }

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token'
      });
    }

    // Allow admin via ADMIN_EMAILS env override (comma-separated emails)
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    // Check admin role
    const adminCheck = await checkAdminRole(user.id);
    
    const isEmailElevated = user.email && adminEmails.includes(user.email.toLowerCase());
    if (!adminCheck.isAdmin && !isEmailElevated) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required. Please ensure your email is listed in ADMIN_EMAILS environment variable.'
      });
    }

    // Skip active check for email-elevated admins (they may not have profiles yet)
    if (!isEmailElevated && !adminCheck.isActive) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin account is deactivated'
      });
    }

    // Add admin info to request
    req.user = {
      ...user,
      role: isEmailElevated ? ADMIN_ROLES.SUPER_ADMIN : adminCheck.role,
      permissions: isEmailElevated ? ADMIN_PERMISSIONS[ADMIN_ROLES.SUPER_ADMIN] : adminCheck.permissions
    };

    next();

  } catch (error) {
    logger.error('Admin authentication error:', error);
    res.status(500).json({
      error: 'Authentication Error',
      message: 'Failed to authenticate admin user'
    });
  }
};

// Permission check middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

// Audit log middleware
const auditLog = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log admin action
      logger.info('Admin Action:', {
        admin_id: req.user?.id,
        admin_email: req.user?.email,
        action,
        method: req.method,
        path: req.path,
        body: req.body,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      // Store in database for audit trail
      supabaseAdmin
        .from('admin_audit_logs')
        .insert({
          admin_id: req.user.id,
          action,
          details: {
            method: req.method,
            path: req.path,
            body: req.body,
            ip: req.ip,
            user_agent: req.get('User-Agent')
          }
        })
        .then(({ error }) => {
          if (error) {
            logger.error('Failed to log admin action:', error);
          }
        });

      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  authenticateAdmin,
  requirePermission,
  auditLog,
  ADMIN_ROLES,
  ADMIN_PERMISSIONS,
  checkAdminRole
};
