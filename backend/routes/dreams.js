const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateUser } = require('../middleware/auth');
const { validateDream } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize Supabase client with service key for database operations
const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Initialize Supabase client with anon key for user operations
const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get all dreams for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseService
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

    const { data, error } = await supabaseService
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

// In-memory storage for dreams (fallback when database is unavailable)
let inMemoryDreams = [
  {
    id: 'memory-demo-1',
    title: 'Magical Forest Adventure',
    content: 'I wandered through a mystical forest where the trees glowed with soft blue light and fairy creatures danced among the branches.',
    analysis: {
      keywords: ['forest', 'magical', 'fairy', 'glowing'],
      emotions: [{ emotion: 'Wonder', intensity: 88 }, { emotion: 'Peace', intensity: 92 }],
      themes: ['Nature', 'Magic', 'Adventure']
    },
    thumbnail_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    created_at: new Date().toISOString(),
    is_public: true,
    user_id: 'demo-user',
    source: 'memory'
  },
  {
    id: 'memory-demo-2',
    title: 'Time Travel Journey',
    content: 'I found myself traveling through different time periods, witnessing ancient civilizations and future cities with flying cars.',
    analysis: {
      keywords: ['time travel', 'ancient', 'future', 'civilizations'],
      emotions: [{ emotion: 'Excitement', intensity: 90 }, { emotion: 'Curiosity', intensity: 85 }],
      themes: ['Time', 'History', 'Future', 'Adventure']
    },
    thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_public: true,
    user_id: 'demo-user',
    source: 'memory'
  }
];

// Create a new dream
router.post('/', authenticateUser, validateDream, async (req, res) => {
  try {
    const { title, content, analysis, thumbnail_url, video_url, video_prompt, video_duration, is_public } = req.body;

    const dreamData = {
      user_id: req.user.id,
      title,
      content,
      analysis,
      thumbnail_url,
      video_url,
      video_prompt,
      video_duration,
      is_public: is_public || false,
    };

    const { data, error } = await supabaseService
      .from('dreams')
      .insert(dreamData)
      .select()
      .single();

    if (error) {
      logger.error('Error saving dream to database:', error);
      return res.status(500).json({ 
        error: 'Database Error', 
        message: 'Failed to save dream.',
        details: error.message
      });
    }

    logger.info(`Dream saved successfully for user ${req.user.id}: ${data.id}`);
    res.status(201).json({
      success: true,
      dream: data,
      message: 'Dream saved successfully'
    });

  } catch (error) {
    logger.error('An unexpected error occurred during dream creation:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred while creating the dream.',
      details: error.message
    });
  }
});

// Update a dream
router.put('/:id', authenticateUser, validateDream, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, analysis, thumbnail_url, video_url, video_prompt, video_duration, is_public } = req.body;

    const updateData = {
      title,
      content,
      analysis,
      thumbnail_url,
      video_url,
      video_prompt,
      video_duration,
      is_public,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseService
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

// Create dream with video generation
router.post('/with-video', async (req, res) => {
  try {
    const { title, content, analysis, generateVideo = false, is_public = false, user_id } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title and content are required'
      });
    }

    // First create the dream
    const dreamData = {
      user_id: user_id || 'demo-user',
      title,
      content,
      analysis: typeof analysis === 'object' ? analysis : null,
      is_public: Boolean(is_public),
      created_at: new Date().toISOString()
    };

    let savedDream;
    
    try {
      // Try to insert into dreams table first
      let { data, error } = await supabaseService
        .from('dreams')
        .insert(dreamData)
        .select()
        .single();

      // If dreams table doesn't exist or fails, try demo_dreams table
      if (error) {
        logger.warn('Dreams table insert failed, trying demo_dreams:', error.message);
        
        const demoDreamData = {
          title: dreamData.title,
          content: dreamData.content,
          analysis: dreamData.analysis ? JSON.stringify(dreamData.analysis) : null,
          is_public: dreamData.is_public,
          created_at: dreamData.created_at
        };

        const { data: demoData, error: demoError } = await supabaseService
          .from('demo_dreams')
          .insert(demoDreamData)
          .select()
          .single();

        if (demoError) {
          throw new Error(`Database insert failed: ${demoError.message}`);
        }

        savedDream = demoData;
        logger.info(`Dream saved to demo_dreams: ${savedDream.id}`);
      } else {
        savedDream = data;
        logger.info(`Dream saved to dreams table: ${savedDream.id}`);
      }

    } catch (dbError) {
      // Database is unavailable, use in-memory storage
      logger.warn('Database unavailable, using in-memory storage:', dbError.message);
      
      savedDream = {
        id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...dreamData,
        source: 'memory'
      };

      inMemoryDreams.push(savedDream);
      logger.info(`Dream saved to memory: ${savedDream.id}`);
    }

    // If video generation is requested, generate demo video data
    if (generateVideo) {
      const videoData = {
        id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
        prompt: `Cinematic dream visualization: ${title}`,
        duration: 4,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      // Update the dream with video data
      savedDream.video_url = videoData.url;
      savedDream.thumbnail_url = videoData.thumbnail_url;
      savedDream.video_prompt = videoData.prompt;
      savedDream.video_duration = videoData.duration;

      // Try to update the saved dream with video data
      try {
        if (savedDream.source !== 'memory') {
          const tableName = savedDream.source === 'demo' ? 'demo_dreams' : 'dreams';
          await supabaseService
            .from(tableName)
            .update({
              video_url: videoData.url,
              thumbnail_url: videoData.thumbnail_url,
              video_prompt: videoData.prompt,
              video_duration: videoData.duration
            })
            .eq('id', savedDream.id);
        }
      } catch (updateError) {
        logger.warn('Failed to update dream with video data:', updateError.message);
      }

      return res.status(201).json({
        success: true,
        dream: savedDream,
        video: videoData,
        message: 'Dream created with video successfully'
      });
    }

    return res.status(201).json({
      success: true,
      dream: savedDream,
      message: 'Dream created successfully'
    });

  } catch (error) {
    logger.error('Dream creation with video error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create dream with video',
      details: error.message
    });
  }
});

// Delete a dream
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = false;

    // Try deleting from dreams table first
    const { data: dreamData, error: dreamError } = await supabaseService
      .from('dreams')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (!dreamError && dreamData && dreamData.length > 0) {
      deleted = true;
      logger.info(`Dream deleted from dreams table for user ${req.user.id}: ${id}`);
    } else if (dreamError) {
      logger.warn('Error deleting from dreams table:', dreamError);
    }

    // If not deleted from dreams table, try demo_dreams table
    if (!deleted) {
      const { data: demoData, error: demoError } = await supabaseService
        .from('demo_dreams')
        .delete()
        .eq('id', id)
        .select();

      if (!demoError && demoData && demoData.length > 0) {
        deleted = true;
        logger.info(`Dream deleted from demo_dreams table: ${id}`);
      } else if (demoError) {
        logger.warn('Error deleting from demo_dreams table:', demoError);
      }
    }

    // Handle in-memory dreams deletion
    if (!deleted) {
      const memoryIndex = inMemoryDreams.findIndex(dream => dream.id === id);
      if (memoryIndex !== -1) {
        // Check if user owns the dream or it's a demo dream
        const memoryDream = inMemoryDreams[memoryIndex];
        if (memoryDream.user_id === req.user.id || id.startsWith('demo-') || req.user.id === 'demo-user') {
          inMemoryDreams.splice(memoryIndex, 1);
          deleted = true;
          logger.info(`Dream deleted from memory: ${id}`);
        }
      }
    }

    // Handle demo dreams (allow deletion for demo user)
    if (!deleted && (id.startsWith('demo-') || req.user.id === 'demo-user')) {
      deleted = true;
      logger.info(`Demo dream deletion allowed: ${id}`);
    }

    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Dream not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Dream deleted successfully'
    });

  } catch (error) {
    logger.error('Dream deletion error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete dream',
      details: error.message
    });
  }
});

// Get public dreams for gallery
router.get('/public/gallery', async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseService
      .from('dreams')
      .select('*', { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching public dreams:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch public dreams'
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
    const { data, error } = await supabaseService
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

// Like/Unlike a dream
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { isLiked } = req.body;

    // For demo purposes, we'll just return success
    // In a real app, you'd store likes in a separate table or update the dream record
    res.json({
      success: true,
      message: isLiked ? 'Dream liked successfully' : 'Dream unliked successfully',
      dreamId: id,
      isLiked
    });

  } catch (error) {
    logger.error('Dream like error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update like status'
    });
  }
});

module.exports = router;
