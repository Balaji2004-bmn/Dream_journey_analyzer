const express = require('express');
const axios = require('axios');
const { authenticateUser } = require('../middleware/auth');
const { validateVideoGeneration } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// RunwayML API integration
class RunwayMLClient {
  constructor() {
    this.apiKey = process.env.RUNWAY_API_KEY;
    this.baseURL = 'https://api.runwayml.com/v1';
  }

  async generateVideo(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/generate`, {
        prompt,
        model: options.model || 'gen3a_turbo',
        duration: options.duration || 10,
        resolution: options.resolution || '1280x768',
        seed: options.seed || Math.floor(Math.random() * 1000000)
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('RunwayML API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getGenerationStatus(taskId) {
    try {
      const response = await axios.get(`${this.baseURL}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      logger.error('RunwayML status check error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Pika Labs API integration
class PikaClient {
  constructor() {
    this.apiKey = process.env.PIKA_API_KEY;
    this.baseURL = 'https://api.pika.art/v1';
  }

  async generateVideo(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/generate`, {
        prompt,
        style: options.style || 'cinematic',
        duration: options.duration || 3,
        aspect_ratio: options.aspectRatio || '16:9',
        motion: options.motion || 'medium'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Pika API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getGenerationStatus(jobId) {
    try {
      const response = await axios.get(`${this.baseURL}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Pika status check error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Kaiber API integration
class KaiberClient {
  constructor() {
    this.apiKey = process.env.KAIBER_API_KEY;
    this.baseURL = 'https://api.kaiber.ai/v1';
  }

  async generateVideo(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/create`, {
        prompt,
        style: options.style || 'anime',
        duration: options.duration || 8,
        camera_movement: options.cameraMovement || 'zoom',
        evolve: options.evolve || 0.5
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Kaiber API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getGenerationStatus(videoId) {
    try {
      const response = await axios.get(`${this.baseURL}/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Kaiber status check error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Initialize clients
const runwayClient = new RunwayMLClient();
const pikaClient = new PikaClient();
const kaiberClient = new KaiberClient();

// Enhanced video generation with multiple providers
router.post('/generate-advanced', authenticateUser, validateVideoGeneration, async (req, res) => {
  try {
    const { dreamContent, title, style = 'cinematic', duration = 10, provider = 'runway' } = req.body;

    // Create enhanced prompt from dream content
    const enhancedPrompt = createVideoPrompt(dreamContent, style);

    let generationResult;
    let providerUsed = provider;

    // Try different providers based on preference and availability
    try {
      switch (provider.toLowerCase()) {
        case 'runway':
          if (!process.env.RUNWAY_API_KEY) throw new Error('RunwayML API key not configured');
          generationResult = await runwayClient.generateVideo(enhancedPrompt, {
            duration,
            model: style === 'realistic' ? 'gen3a' : 'gen3a_turbo'
          });
          break;

        case 'pika':
          if (!process.env.PIKA_API_KEY) throw new Error('Pika API key not configured');
          generationResult = await pikaClient.generateVideo(enhancedPrompt, {
            style,
            duration: Math.min(duration, 4), // Pika has shorter limits
            motion: duration > 5 ? 'high' : 'medium'
          });
          break;

        case 'kaiber':
          if (!process.env.KAIBER_API_KEY) throw new Error('Kaiber API key not configured');
          generationResult = await kaiberClient.generateVideo(enhancedPrompt, {
            style: style === 'animated' ? 'anime' : 'photorealistic',
            duration: Math.min(duration, 16),
            cameraMovement: 'dynamic'
          });
          break;

        default:
          throw new Error('Invalid video generation provider');
      }
    } catch (providerError) {
      logger.warn(`${provider} failed, trying fallback: ${providerError.message}`);
      
      // Fallback to other providers
      if (provider !== 'runway' && process.env.RUNWAY_API_KEY) {
        generationResult = await runwayClient.generateVideo(enhancedPrompt, { duration });
        providerUsed = 'runway';
      } else if (provider !== 'pika' && process.env.PIKA_API_KEY) {
        generationResult = await pikaClient.generateVideo(enhancedPrompt, { style, duration: 3 });
        providerUsed = 'pika';
      } else {
        throw providerError;
      }
    }

    const videoData = {
      id: generationResult.id || generationResult.job_id || generationResult.video_id,
      status: 'processing',
      title,
      dreamContent,
      style,
      duration,
      provider: providerUsed,
      created_at: new Date().toISOString(),
      user_id: req.user.id,
      prompt: enhancedPrompt
    };

    logger.info(`Video generation started for user ${req.user.id} using ${providerUsed}: ${videoData.id}`);

    res.json({
      success: true,
      video: {
        ...videoData,
        estimated_completion: new Date(Date.now() + (duration * 1000 * 60)).toISOString(), // Estimate based on duration
        message: `Video generation started using ${providerUsed}. Processing time: ${duration * 60} seconds estimated.`
      }
    });

  } catch (error) {
    logger.error('Advanced video generation error:', error);
    res.status(500).json({
      error: 'Generation Failed',
      message: error.message || 'Failed to start video generation process.'
    });
  }
});

// Enhanced status check with provider-specific handling
router.get('/status-advanced/:videoId', authenticateUser, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { provider = 'runway' } = req.query;

    let statusResult;

    switch (provider.toLowerCase()) {
      case 'runway':
        statusResult = await runwayClient.getGenerationStatus(videoId);
        break;
      case 'pika':
        statusResult = await pikaClient.getGenerationStatus(videoId);
        break;
      case 'kaiber':
        statusResult = await kaiberClient.getGenerationStatus(videoId);
        break;
      default:
        throw new Error('Invalid provider for status check');
    }

    // Normalize response format across providers
    const normalizedStatus = normalizeStatusResponse(statusResult, provider);

    res.json({
      success: true,
      video: normalizedStatus
    });

  } catch (error) {
    logger.error('Advanced video status check error:', error);
    res.status(500).json({
      error: 'Status Check Failed',
      message: 'Failed to check video generation status.'
    });
  }
});

// Get available providers and their capabilities
router.get('/providers', (req, res) => {
  const providers = [
    {
      id: 'runway',
      name: 'RunwayML Gen-3',
      description: 'High-quality, realistic video generation',
      maxDuration: 10,
      styles: ['realistic', 'cinematic', 'artistic'],
      available: !!process.env.RUNWAY_API_KEY,
      pricing: 'Premium'
    },
    {
      id: 'pika',
      name: 'Pika Labs',
      description: 'Fast, creative video generation',
      maxDuration: 4,
      styles: ['cinematic', 'anime', 'cartoon'],
      available: !!process.env.PIKA_API_KEY,
      pricing: 'Standard'
    },
    {
      id: 'kaiber',
      name: 'Kaiber AI',
      description: 'Artistic and animated video creation',
      maxDuration: 16,
      styles: ['anime', 'artistic', 'photorealistic'],
      available: !!process.env.KAIBER_API_KEY,
      pricing: 'Budget'
    }
  ];

  res.json({
    success: true,
    providers: providers.filter(p => p.available)
  });
});

// Helper functions
function createVideoPrompt(dreamContent, style) {
  const stylePrompts = {
    cinematic: 'Cinematic, dramatic lighting, film grain, professional cinematography',
    dreamy: 'Ethereal, soft focus, pastel colors, floating elements, dreamlike atmosphere',
    surreal: 'Surreal, impossible geometry, vibrant colors, abstract elements',
    realistic: 'Photorealistic, natural lighting, high detail, documentary style',
    animated: 'Animated, cartoon style, vibrant colors, smooth motion'
  };

  const basePrompt = dreamContent.length > 200 ? 
    dreamContent.substring(0, 200) + '...' : 
    dreamContent;

  return `${basePrompt}. ${stylePrompts[style] || stylePrompts.cinematic}. High quality, smooth motion, engaging visuals.`;
}

function normalizeStatusResponse(response, provider) {
  switch (provider) {
    case 'runway':
      return {
        id: response.id,
        status: response.status,
        progress: response.progress || 0,
        video_url: response.output?.[0]?.url || null,
        thumbnail_url: response.thumbnail || null,
        created_at: response.createdAt,
        completed_at: response.status === 'SUCCEEDED' ? new Date().toISOString() : null
      };

    case 'pika':
      return {
        id: response.job_id,
        status: response.status === 'finished' ? 'completed' : response.status,
        progress: response.status === 'finished' ? 100 : (response.progress || 0),
        video_url: response.result_url || null,
        thumbnail_url: response.thumbnail_url || null,
        created_at: response.created_at,
        completed_at: response.status === 'finished' ? response.finished_at : null
      };

    case 'kaiber':
      return {
        id: response.video_id,
        status: response.status === 'completed' ? 'completed' : response.status,
        progress: response.progress_percentage || 0,
        video_url: response.video_url || null,
        thumbnail_url: response.preview_image || null,
        created_at: response.created_at,
        completed_at: response.status === 'completed' ? response.completed_at : null
      };

    default:
      return response;
  }
}

module.exports = router;
