const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Project system prompt — always gives detailed project info
const PROJECT_SYSTEM_PROMPT = `
You are the official assistant for the "Adaptive Dream Journey Analyzer with Story Video Generation" platform.

**About the Platform:**
- **Name:** Adaptive Dream Journey Analyzer with Story Video Generation
- **Purpose:** Users can record their dreams, get AI-powered analysis, and generate cinematic story videos from their dreams
- **Tagline:** Transform your dreams into visual stories

**Key Features:**
1. Dream Journal
2. AI Dream Analysis
3. Video Generation
4. Dream Gallery
5. Analytics Dashboard
6. Subscription Plans: Free, Pro, Premium
7. UPI Payment Integration
8. Email & SMS Notifications
9. Dark/Light Mode
10. Multi-language Support

**Subscription Plans:**
- Free: Basic journaling, limited AI analysis (5 dreams/month)
- Pro ($5/month): Priority video gen, HD thumbnails, unlimited dreams
- Premium ($10/month): Everything in Pro + longer videos, priority support

**Payment:** Users scan UPI QR → pay exact amount → upload screenshot → plan auto-activates

**Technical Stack:**
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- Backend: Node.js + Express + Gemini API
- Database: Supabase (PostgreSQL)
- AI: Gemini for analysis + video APIs
- Payments: UPI + Razorpay
- Auth: Supabase Auth
- Deployment: Vercel/Netlify frontend, Railway/Render backend

**User Workflow:**
1. Sign Up → verify email
2. Record Dreams
3. Get AI Analysis
4. Generate Videos
5. View Gallery
6. Upgrade Plans via UPI
7. Customize Settings

**Troubleshooting:** Provide step-by-step guidance on failed videos, payment issues, login problems.

Only answer project-related questions. Be friendly, concise, actionable, and detailed for feature, pricing, and troubleshooting questions.
`;

const GENERAL_SYSTEM_PROMPT = "You are a general AI assistant. Answer questions helpfully.";

const PROJECT_KEYWORDS = ['dream', 'video', 'story', 'analyzer', 'project', 'journey'];

const conversations = new Map();

// POST /api/assistant
router.post('/', async (req, res) => {
  try {
    const { userMessage, conversationId } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required and must be a string' });
    }

    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'API keys not configured',
        message: 'Please add GEMINI_API_KEY or OPENAI_API_KEY to your .env file'
      });
    }

    // Always use project system prompt for better context
    const systemPrompt = PROJECT_SYSTEM_PROMPT;

    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let history = conversations.get(convId) || [];

    // Prepare history for API
    const historyMessages = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current user message
    historyMessages.push({ role: 'user', content: userMessage });

    let assistantMessage;
    let provider = 'Gemini';

    // --- Try GEMINI FIRST, then OpenAI as fallback ---
    try {
      let geminiSucceeded = false;
      if (process.env.GEMINI_API_KEY) {
        provider = 'Gemini';

        // Helper: list models from v1, fallback to v1beta
        const listModels = async () => {
          const results = [];
          try {
            const { data } = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`, { timeout: 15000 });
            results.push(...(data.models || []));
          } catch (_) {}
          if (results.length === 0) {
            try {
              const { data } = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`, { timeout: 15000 });
              results.push(...(data.models || []));
            } catch (_) {}
          }
          return results;
        };

        // Preferred order
        const preferred = [
          process.env.GEMINI_MODEL, // allow override
          'gemini-1.5-flash-latest',
          'gemini-1.5-pro-latest',
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-1.0-pro',
          'gemini-pro',
        ].filter(Boolean);

        // Discover available models
        const available = await listModels();
        const genModels = available
          .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => (m.name || '').replace(/^models\//, ''));

        // Merge candidates: preferred first, then discovered
        const seen = new Set();
        const candidates = [];
        for (const m of [...preferred, ...genModels]) {
          if (m && !seen.has(m)) { seen.add(m); candidates.push(m); }
        }
        if (candidates.length === 0) {
          candidates.push('gemini-1.5-flash-latest');
        }

        // Build conversation for Gemini - simpler approach
        const contents = [];
        if (history.length === 0) {
          contents.push({ role: 'user', parts: [{ text: systemPrompt + '\n\nUser: ' + userMessage }] });
        } else {
          contents.push({ role: 'user', parts: [{ text: systemPrompt + '\n\nUser: ' + history[0].content }] });
          for (let i = 1; i < history.length; i++) {
            contents.push({
              role: history[i].role === 'assistant' ? 'model' : 'user',
              parts: [{ text: history[i].content }]
            });
          }
          contents.push({ role: 'user', parts: [{ text: userMessage }] });
        }

        let lastErr;
        for (const model of candidates) {
          // Try v1 first
          const v1 = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
          const v1beta = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

          const tryEndpoint = async (endpoint) => {
            return axios.post(
              endpoint,
              {
                contents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 800,
                  topP: 0.95,
                  topK: 40
                },
                safetySettings: [
                  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                ]
              },
              { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
            );
          };

          try {
            let resp;
            try {
              resp = await tryEndpoint(v1);
            } catch (e1) {
              const status = e1?.response?.status;
              if (status === 404) {
                // fallback to v1beta
                resp = await tryEndpoint(v1beta);
              } else {
                throw e1;
              }
            }

            const data = resp.data;
            assistantMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (assistantMessage) {
              console.log(`Gemini responded using model: ${model}`);
              geminiSucceeded = true;
              break;
            }
            lastErr = new Error('Empty response from Gemini');
          } catch (err) {
            lastErr = err;
            const status = err?.response?.status;
            if (status === 404) {
              console.warn(`Model not found or unsupported: ${model}. Trying next.`);
              continue;
            }
            // For non-404 errors, stop trying
            throw err;
          }
        }

        if (!assistantMessage) {
          // Gemini key exists but all attempts failed
          console.warn('Gemini attempts failed; considering OpenAI fallback...');
        }
      }

      // If Gemini didn't succeed, and OpenAI key is present, fallback to OpenAI
      if (!geminiSucceeded) {
        if (process.env.OPENAI_API_KEY) {
          provider = 'OpenAI';
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              ...historyMessages
            ],
            max_tokens: 800,
            temperature: 0.7
          });
          assistantMessage = completion.choices[0].message.content;
        } else if (!process.env.GEMINI_API_KEY) {
          throw new Error('No API key configured');
        } else if (!assistantMessage) {
          // Gemini key exists but failed, and no OpenAI fallback
          throw new Error('Failed to get response from Gemini');
        }
      }
    } catch (error) {
      console.error('❌ AI API error:', error.message);
      if (error.response?.data) {
        console.error('API Error details:', JSON.stringify(error.response.data, null, 2));
      }
      
      // User-friendly error message
      throw new Error('Unable to get response from AI assistant. Please check the backend logs and verify your API key is valid.');
    }

    console.log(`Assistant responded using ${provider}`);

    // Update conversation
    history.push({ role: 'user', content: userMessage }, { role: 'assistant', content: assistantMessage });
    if (history.length > 20) history = history.slice(-20);
    conversations.set(convId, history);

    // Auto-cleanup old conversations
    const oneHourAgo = Date.now() - 3600000;
    for (const [id, _] of conversations.entries()) {
      const timestamp = parseInt(id.split('_')[1]);
      if (timestamp < oneHourAgo) conversations.delete(id);
    }

    res.json({ assistantMessage, conversationId: convId, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Assistant API error:', error);
    res.status(500).json({ error: 'Failed to get assistant response', message: error.message });
  }
});

// DELETE /api/assistant/:conversationId
router.delete('/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  if (conversations.has(conversationId)) {
    conversations.delete(conversationId);
    res.json({ message: 'Conversation cleared successfully' });
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

module.exports = router;
