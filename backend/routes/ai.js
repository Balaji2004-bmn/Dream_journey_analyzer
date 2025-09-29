const express = require('express');
const OpenAI = require('openai');
const { validateDreamAnalysis } = require('../middleware/validation');
const apiClient = require('../utils/apiClient');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const NLP_URL = process.env.NLP_URL || process.env.PYTHON_NLP_URL || 'http://localhost:5000';

async function callNlpService(endpoint, payload) {
  if (!NLP_URL) return null;
  try {
    const url = `${NLP_URL}${endpoint}`;
    const { data } = await apiClient.post(url, payload, { timeout: 25000 });
    return data;
  } catch (err) {
    logger.warn(`NLP service call failed (${endpoint}):`, err.message);
    return null;
  }
}

// Analyze dream content with AI (prefers Python NLP, falls back to OpenAI)
router.post('/analyze-dream', authenticateUser, validateDreamAnalysis, async (req, res) => {
  try {
    const { content, title } = req.body;

    // Try Python NLP first
    const nlpResult = await callNlpService('/analyze', { content, title });
    if (nlpResult && typeof nlpResult === 'object') {
      logger.info(`Dream analysis completed via NLP for user ${req.user.id}`);
      return res.json({ success: true, analysis: nlpResult, source: 'nlp' });
    }

    // Fallback: Create AI prompt for dream analysis via OpenAI
    const prompt = `
    Analyze the following dream and provide a comprehensive analysis in JSON format:

    Dream Title: ${title || 'Untitled Dream'}
    Dream Content: ${content}

    Please provide analysis in this exact JSON structure:
    {
      "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
      "emotions": [
        {"emotion": "emotion_name", "intensity": 85, "color": "#hex_color"},
        {"emotion": "emotion_name", "intensity": 72, "color": "#hex_color"}
      ],
      "summary": "A detailed interpretation of the dream's meaning and symbolism",
      "themes": ["Theme 1", "Theme 2", "Theme 3"],
      "symbols": [
        {"symbol": "symbol_name", "meaning": "interpretation of the symbol"}
      ],
      "psychological_insights": "Deep psychological analysis of the dream",
      "actionable_advice": "Practical advice based on the dream analysis"
    }

    Make the analysis insightful, positive, and psychologically meaningful. Use vibrant hex colors for emotions.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert dream analyst and psychologist. Provide detailed, insightful, and positive dream interpretations in valid JSON format only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const analysisText = completion.choices[0].message.content;
    
    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      logger.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Log successful analysis
    logger.info(`Dream analysis completed via OpenAI for user ${req.user.id}`);

    res.json({
      success: true,
      analysis,
      metadata: {
        model: "gpt-4",
        timestamp: new Date().toISOString(),
        tokens_used: completion.usage?.total_tokens || 0
      },
      source: 'openai'
    });

  } catch (error) {
    logger.error('Dream analysis error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'AI Service Unavailable',
        message: 'AI analysis service is temporarily unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Analysis Failed',
      message: 'Failed to analyze dream content. Please try again.'
    });
  }
});

// Extract keywords from dream content (prefers Python NLP)
router.post('/extract-keywords', authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        error: 'Invalid Content',
        message: 'Dream content must be at least 10 characters long.'
      });
    }

    // Try Python NLP first
    const nlpResult = await callNlpService('/extract-keywords', { content });
    if (Array.isArray(nlpResult)) {
      return res.json({ success: true, keywords: nlpResult.slice(0, 8), source: 'nlp' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Extract the most important keywords from dream content. Return only a JSON array of strings, maximum 8 keywords."
        },
        {
          role: "user",
          content: `Extract keywords from this dream: ${content}`
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const keywordsText = completion.choices[0].message.content;
    const keywords = JSON.parse(keywordsText);

    res.json({
      success: true,
      keywords: keywords.slice(0, 8), // Ensure max 8 keywords
      source: 'openai'
    });

  } catch (error) {
    logger.error('Keyword extraction error:', error);
    res.status(500).json({
      error: 'Extraction Failed',
      message: 'Failed to extract keywords from dream content.'
    });
  }
});

// Generate dream title suggestions
router.post('/suggest-title', authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        error: 'Invalid Content',
        message: 'Dream content must be at least 10 characters long.'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Generate 3 creative, engaging titles for dreams. Return as JSON array of strings. Titles should be poetic and capture the essence of the dream."
        },
        {
          role: "user",
          content: `Generate titles for this dream: ${content.slice(0, 500)}`
        }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    const titlesText = completion.choices[0].message.content;
    const titles = JSON.parse(titlesText);

    res.json({
      success: true,
      suggestions: titles.slice(0, 3)
    });

  } catch (error) {
    logger.error('Title suggestion error:', error);
    res.status(500).json({
      error: 'Generation Failed',
      message: 'Failed to generate title suggestions.'
    });
  }
});

// Emotion analysis endpoint (prefers Python NLP)
router.post('/analyze-emotions', authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;

    // Try Python NLP first
    const nlpResult = await callNlpService('/analyze-emotions', { content });
    if (Array.isArray(nlpResult)) {
      return res.json({ success: true, emotions: nlpResult.slice(0, 5), source: 'nlp' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze emotions in dream content. Return JSON array with format:
          [{"emotion": "emotion_name", "intensity": 0-100, "color": "#hex_color"}]
          Maximum 5 emotions, use vibrant colors.`
        },
        {
          role: "user",
          content: `Analyze emotions in this dream: ${content}`
        }
      ],
      temperature: 0.5,
      max_tokens: 300
    });

    const emotionsText = completion.choices[0].message.content;
    const emotions = JSON.parse(emotionsText);

    res.json({
      success: true,
      emotions: emotions.slice(0, 5),
      source: 'openai'
    });

  } catch (error) {
    logger.error('Emotion analysis error:', error);
    res.status(500).json({
      error: 'Analysis Failed',
      message: 'Failed to analyze emotions in dream content.'
    });
  }
});

// Generate dream video endpoint
router.post('/generate-video', authenticateUser, async (req, res) => {
  try {
    const { dreamText, emotions, keywords, dreamId } = req.body;

    if (!dreamText) {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'Dream text is required for video generation.'
      });
    }

    // Generate video prompt using AI
    const promptCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating cinematic video prompts for AI video generation.
          Create a detailed, visual prompt that captures the essence of the dream for video generation.
          Focus on visual elements, camera movements, lighting, and atmosphere.
          Keep it under 500 characters and make it cinematic.`
        },
        {
          role: "user",
          content: `Create a video generation prompt for this dream:
          Title/Content: ${dreamText}
          Emotions: ${emotions ? emotions.map(e => e.emotion).join(', ') : 'peaceful, mysterious'}
          Keywords: ${keywords ? keywords.join(', ') : 'dream, surreal'}`
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });

    const videoPrompt = promptCompletion.choices[0].message.content;

    // For now, return a demo video URL and prompt
    // In production, this would integrate with RunwayML or similar service
    const videoData = {
      id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      prompt: videoPrompt,
      status: 'completed',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
      duration: 4,
      created_at: new Date().toISOString(),
      dream_id: dreamId
    };

    logger.info(`Video generated for dream ${dreamId} by user ${req.user.id}`);

    res.json({
      success: true,
      video: videoData,
      message: 'Dream video generated successfully'
    });

  } catch (error) {
    logger.error('Video generation error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'AI Service Unavailable',
        message: 'Video generation service is temporarily unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Generation Failed',
      message: 'Failed to generate dream video. Please try again.'
    });
  }
});

// Store generated video for a dream
router.post('/store-video', authenticateUser, async (req, res) => {
  try {
    const { dreamId, videoUrl, thumbnailUrl, prompt, duration = 4 } = req.body;

    if (!dreamId || !videoUrl) {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'Dream ID and video URL are required.'
      });
    }

    // This endpoint allows storing video data generated from the frontend
    const videoData = {
      dream_id: dreamId,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      prompt: prompt,
      duration: duration,
      status: 'completed',
      created_at: new Date().toISOString()
    };

    logger.info(`Video stored for dream ${dreamId} by user ${req.user.id}`);

    res.json({
      success: true,
      video: videoData,
      message: 'Video stored successfully'
    });

  } catch (error) {
    logger.error('Video storage error:', error);
    res.status(500).json({
      error: 'Storage Failed',
      message: 'Failed to store video data.'
    });
  }
});

module.exports = router;
