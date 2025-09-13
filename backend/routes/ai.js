const express = require('express');
const OpenAI = require('openai');
const { validateDreamAnalysis } = require('../middleware/validation');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze dream content with AI
router.post('/analyze-dream', authenticateUser, validateDreamAnalysis, async (req, res) => {
  try {
    const { content, title } = req.body;

    // Create AI prompt for dream analysis
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
      model: "gpt-4",
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
    logger.info(`Dream analysis completed for user ${req.user.id}`);

    res.json({
      success: true,
      analysis,
      metadata: {
        model: "gpt-4",
        timestamp: new Date().toISOString(),
        tokens_used: completion.usage?.total_tokens || 0
      }
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

// Extract keywords from dream content
router.post('/extract-keywords', authenticateUser, async (req, res) => {
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
      keywords: keywords.slice(0, 8) // Ensure max 8 keywords
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

// Emotion analysis endpoint
router.post('/analyze-emotions', authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;

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
      emotions: emotions.slice(0, 5)
    });

  } catch (error) {
    logger.error('Emotion analysis error:', error);
    res.status(500).json({
      error: 'Analysis Failed',
      message: 'Failed to analyze emotions in dream content.'
    });
  }
});

module.exports = router;
