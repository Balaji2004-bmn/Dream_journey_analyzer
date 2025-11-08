const axios = require('axios');
const logger = require('../utils/logger');

// Configure retry settings for student account (more conservative)
const MAX_RETRIES = 2;  // Reduced from 3 to 2
const INITIAL_RETRY_DELAY = 2000; // Increased from 1s to 2s

/**
 * Sleep helper function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate structured dream analysis using Google Gemini Pro via REST API
 * @param {string} dreamText
 * @param {number} [retryCount=0] - Current retry attempt
 * @returns {Promise<{ title: string, story: string, video_prompt: string, keywords: string[], emotions: Array<{emotion: string, intensity: number}> }>} 
 */
async function generateDreamAnalysis(dreamText, retryCount = 0) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  if (!dreamText?.trim()) throw new Error('dreamText is required');

  // Try different models in order of preference (prioritizing free tier models)
  const models = [
    'gemini-1.5-flash-latest',  // Best for free tier
    'gemini-1.0-pro',           // Fallback
    'gemini-pro'                // Most compatible fallback
  ];

  const model = models[Math.min(retryCount, models.length - 1)];
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `You are an expert story writer and cinematic prompt engineer.
Return STRICT JSON only, no prose. Keys: title, story, video_prompt, keywords, emotions.
- title: short, 3-6 words, evocative
- story: 3-6 sentences, second person, emotional, coherent
- video_prompt: One paragraph, cinematic visual description for an AI video model (characters, environment, mood, style, camera movement, lighting). Max 480 chars.
- keywords: 5-8 thematic keywords as an array of strings (e.g., ["forest","flying"]).
- emotions: 3-6 items as an array of objects with fields {"emotion": string, "intensity": 0-100} (e.g., [{"emotion":"Wonder","intensity":88}]).
Dream text: ${dreamText}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,  // Reduced from 1024 to be more conservative
      topP: 0.9,
      topK: 40,
      stopSequences: []
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ]
  };

  try {
    logger.info(`Calling Gemini API with model: ${model}`);
    const { data } = await axios.post(endpoint, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 45000, // Increased timeout for slower models
      validateStatus: status => status < 500 // Don't throw on 4xx errors
    });

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      const error = new Error('Empty response from Gemini');
      error.retryable = true;
      throw error;
    }

    // Try direct parse, fallback to extracting first JSON object
    let jsonStr = text.trim();
    if (!jsonStr.startsWith('{')) {
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        jsonStr = jsonStr.substring(start, end + 1);
      } else {
        const error = new Error('Could not find valid JSON in response');
        error.retryable = true;
        throw error;
      }
    }

    try {
      const result = JSON.parse(jsonStr);
      logger.info(`Successfully parsed Gemini response`);
      return result;
    } catch (e) {
      logger.error('Error parsing Gemini response', { error: e.message, response: jsonStr });
      const error = new Error('Failed to parse Gemini response');
      error.retryable = true;
      throw error;
    }
  } catch (error) {
    // Handle rate limiting and retries
    const isRateLimit = error.response?.status === 429 || 
                       error.response?.data?.error?.status === 'RESOURCE_EXHAUSTED' ||
                       error.message?.includes('429') ||
                       error.message?.includes('quota') ||
                       error.message?.includes('rate limit');

    const isRetryable = error.retryable !== false && 
                       error.response?.status !== 400 && 
                       error.response?.status !== 401 && 
                       error.response?.status !== 403;

    if (isRateLimit) {
      const retryAfter = error.response?.headers?.['retry-after'] || 
                        error.response?.headers?.['x-ratelimit-reset'] || 
                        (2 ** retryCount) * 1000; // Exponential backoff
      
      logger.warn(`Rate limited by Gemini API. Retrying after ${retryAfter}ms`, { 
        retryCount,
        model,
        status: error.response?.status,
        error: error.message 
      });
      
      if (retryCount < MAX_RETRIES) {
        await sleep(parseInt(retryAfter) || (2 ** retryCount) * 1000);
        return generateDreamAnalysis(dreamText, retryCount + 1);
      }
    } else if (isRetryable && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * (2 ** retryCount);
      logger.warn(`Retryable error from Gemini API. Retrying in ${delay}ms`, { 
        retryCount,
        model,
        status: error.response?.status,
        error: error.message 
      });
      
      await sleep(delay);
      return generateDreamAnalysis(dreamText, retryCount + 1);
    }

    // Log the final error if all retries failed
    logger.error('Gemini API request failed after retries', { 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
      retryCount
    });
    
    throw error;
  }
}

module.exports = { generateDreamAnalysis };
