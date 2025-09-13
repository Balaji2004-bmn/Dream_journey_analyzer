const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateUser } = require('../middleware/auth');
const { validateDream } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get all dreams for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('dreams')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching dreams:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch dreams'
      });
    }

    res.json({
      success: true,
      dreams: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    logger.error('Dreams fetch error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch dreams'
    });
  }
});

// Get a specific dream
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('dreams')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Dream not found'
        });
      }
      logger.error('Error fetching dream:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch dream'
      });
    }

    res.json({
      success: true,
      dream: data
    });

  } catch (error) {
    logger.error('Dream fetch error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch dream'
    });
  }
});

// Create a new dream
router.post('/', authenticateUser, validateDream, async (req, res) => {
  try {
    const { title, content, analysis, thumbnail_url, video_url, is_public = false } = req.body;

    const dreamData = {
      user_id: req.user.id,
      title,
      content,
      analysis,
      thumbnail_url,
      video_url,
      is_public
    };

    const { data, error } = await supabase
      .from('dreams')
      .insert(dreamData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating dream:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to create dream'
      });
    }

    logger.info(`Dream created for user ${req.user.id}: ${data.id}`);

    res.status(201).json({
      success: true,
      dream: data
    });

  } catch (error) {
    logger.error('Dream creation error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create dream'
    });
  }
});

// Update a dream
router.put('/:id', authenticateUser, validateDream, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, analysis, thumbnail_url, video_url, is_public } = req.body;

    const updateData = {
      title,
      content,
      analysis,
      thumbnail_url,
      video_url,
      is_public,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('dreams')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Dream not found'
        });
      }
      logger.error('Error updating dream:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to update dream'
      });
    }

    logger.info(`Dream updated for user ${req.user.id}: ${id}`);

    res.json({
      success: true,
      dream: data
    });

  } catch (error) {
    logger.error('Dream update error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update dream'
    });
  }
});

// Delete a dream
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('dreams')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      logger.error('Error deleting dream:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to delete dream'
      });
    }

    logger.info(`Dream deleted for user ${req.user.id}: ${id}`);

    res.json({
      success: true,
      message: 'Dream deleted successfully'
    });

  } catch (error) {
    logger.error('Dream deletion error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete dream'
    });
  }
});

// Get public dreams for gallery
router.get('/public/gallery', async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    // Fetch both demo dreams and public user dreams
    const [demoDreamsResult, userDreamsResult] = await Promise.all([
      supabase
        .from('demo_dreams')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('dreams')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
    ]);

    if (demoDreamsResult.error || userDreamsResult.error) {
      logger.error('Error fetching public dreams:', demoDreamsResult.error || userDreamsResult.error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch public dreams'
      });
    }

    // Combine and sort all dreams
    let allDreams = [
      ...demoDreamsResult.data.map(dream => ({ ...dream, source: 'demo' })),
      ...userDreamsResult.data.map(dream => ({ ...dream, source: 'user' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      allDreams = allDreams.filter(dream => 
        dream.title.toLowerCase().includes(searchLower) ||
        dream.content.toLowerCase().includes(searchLower) ||
        (dream.analysis?.keywords && dream.analysis.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        ))
      );
    }

    // Apply category filter
    if (category) {
      allDreams = allDreams.filter(dream => 
        dream.analysis?.themes && dream.analysis.themes.some(theme => 
          theme.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Apply pagination
    const total = allDreams.length;
    const paginatedDreams = allDreams.slice(offset, offset + limit);

    res.json({
      success: true,
      dreams: paginatedDreams,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Public dreams fetch error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch public dreams'
    });
  }
});

// Get dream statistics for dashboard
router.get('/stats/dashboard', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dreams')
      .select('id, created_at, analysis')
      .eq('user_id', req.user.id);

    if (error) {
      logger.error('Error fetching dream stats:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch dream statistics'
      });
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      totalDreams: data.length,
      weeklyDreams: data.filter(dream => new Date(dream.created_at) >= weekAgo).length,
      monthlyDreams: data.filter(dream => new Date(dream.created_at) >= monthAgo).length,
      analyzedDreams: data.filter(dream => dream.analysis).length,
      weeklyGoal: 7,
      weeklyProgress: data.filter(dream => new Date(dream.created_at) >= weekAgo).length
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Dream stats error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch dream statistics'
    });
  }
});

module.exports = router;
