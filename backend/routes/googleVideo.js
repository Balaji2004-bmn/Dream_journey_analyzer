const express = require('express');
const logger = require('../utils/logger');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// POST /api/generate-video
// Body: { prompt: string, attachedPhoto?: string }
// Returns: { success: true, fileId: string, operationName?: string }
router.post('/generate-video', authenticateUser, async (req, res) => {
  try {
    const prompt = (req.body?.prompt || '').toString();
    const attachedPhoto = req.body?.attachedPhoto;

    // Validate prompt
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'prompt is required' });
    }
    if (prompt.length > 300) {
      return res.status(400).json({ error: 'ValidationError', message: 'prompt must be at most 300 characters' });
    }

    // Accept GOOGLE_API_KEY or fallback to GEMINI_API_KEY
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error('GOOGLE_API_KEY or GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'ConfigurationError', message: 'Server is not configured for Google GenAI (missing GOOGLE_API_KEY/GEMINI_API_KEY)' });
    }

    // Dynamic import to avoid exposing ESM at top-level in CommonJS
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    // Enhance prompt with photo information if available
    let enhancedPrompt = prompt.trim();
    if (attachedPhoto) {
      // Since Veo 3 is text-to-video, we enhance the prompt to describe incorporating the photo
      enhancedPrompt = `${prompt.trim()}. The video should prominently feature and integrate the user's personal photo as a central visual element, using it as inspiration for the dream sequence and character representation.`;
    }

    // Start video generation operation
    let operation = await ai.models.generateVideos({
      model: 'veo-3.0-generate-001',
      prompt: enhancedPrompt,
    });

    // Poll every 10 seconds until done
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const timeoutMs = 15 * 60 * 1000; // safety timeout: 15 minutes
    const start = Date.now();

    // Prefer polling by name if available
    const opName = operation?.name;

    while (!operation?.done) {
      if (Date.now() - start > timeoutMs) {
        return res.status(504).json({ error: 'Timeout', message: 'Video generation timed out', operationName: opName });
      }
      await sleep(10_000);
      try {
        if (opName) {
          operation = await ai.operations.getVideosOperation({ name: opName });
        } else {
          operation = await ai.operations.getVideosOperation({ operation });
        }
      } catch (pollErr) {
        logger.warn('Polling error for Veo operation:', pollErr?.message || pollErr);
      }
    }

    const response = operation?.response || {};

    // Try to extract a file id from common shapes
    let fileId = null;
    if (Array.isArray(response.videos) && response.videos.length > 0) {
      const v = response.videos[0];
      fileId = v.fileId || v.id || v?.file?.id || v?.file?.name || null;
      if (!fileId && v?.file?.uri) {
        try {
          const parts = String(v.file.uri).split('/').filter(Boolean);
          fileId = parts[parts.length - 1] || null;
        } catch (_) {}
      }
    }

    if (!fileId) {
      logger.warn('Veo generation completed but no fileId found', { operationName: opName, keys: Object.keys(response || {}) });
      return res.status(502).json({ error: 'GenerationCompletedButNoFile', message: 'Video generated but file id not returned', operationName: opName });
    }

    return res.json({ success: true, fileId, operationName: opName });
  } catch (error) {
    logger.error('Google GenAI (Veo) generation error:', error?.response?.data || error?.message || error);
    const status = error?.response?.status || 500;
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: 'GenerationFailed', message: error?.message || 'Failed to generate video' });
  }
});

module.exports = router;
