const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// DeepSeek API client
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

// Project system prompt — always gives detailed project info
const PROJECT_SYSTEM_PROMPT = `
You are the official AI assistant for the "Dream Journey Analyzer" platform.

**About the Platform:**
- **Name:** Dream Journey Analyzer with Story Video Generation
- **Purpose:** Users can record their dreams, get AI-powered emotional analysis with detailed insights, and generate cinematic story videos from their dream descriptions
- **Tagline:** Transform your dreams into visual stories
- **Creator:** Built by a team passionate about dream psychology and AI technology

**Key Features:**
1. **Dream Journal** - Record dreams with text, voice, or images
2. **AI Dream Analysis** - Deep emotional analysis with:
   - Emotion detection (joy, fear, wonder, etc.)
   - Dream interpretation and symbolism
   - Psychological insights
   - Keyword extraction
   - Sentiment scoring
3. **Video Generation** - Turn dreams into cinematic videos using:
   - RunwayML Gen-3 (premium quality)
   - Pika Labs (fast generation)
   - Kaiber AI (artistic styles)
4. **Dream Gallery** - Browse, search, and filter your dream collection
5. **Analytics Dashboard** - Track dream patterns over time
6. **Subscription Plans** - Free, Pro ($5/month), Premium ($10/month)
7. **UPI Payment** - Easy payment with QR code scanning
8. **Mobile App** - React Native app with Expo
9. **Admin Dashboard** - Comprehensive admin panel
10. **Project Assistant** - This AI helper (you!) powered by Gemini AI & OpenAI

**Subscription Plans:**
- **Free:** 5 dreams/month, basic AI analysis, standard video quality
- **Pro ($5/month):** Unlimited dreams, priority video generation, HD thumbnails, advanced analytics
- **Premium ($10/month):** Everything in Pro + longer videos (up to 30s), priority support, custom dream themes, API access

**Payment Process:**
1. User clicks "Upgrade" and selects plan
2. UPI QR code displayed with exact amount (₹415 for Pro, ₹830 for Premium)
3. User scans QR with any UPI app (Google Pay, PhonePe, Paytm, etc.)
4. User uploads payment screenshot
5. Backend verifies payment
6. Plan auto-activates instantly

**Technical Stack:**
- **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui components
- **Backend:** Node.js + Express + Gemini AI API + OpenAI API
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Authentication:** Supabase Auth (email/password + Google OAuth)
- **AI Analysis:** Google Gemini AI (primary), OpenAI (fallback)
- **Video APIs:** RunwayML, Pika Labs, Kaiber AI
- **Payments:** UPI with screenshot verification
- **Mobile:** React Native + Expo
- **Admin:** Separate admin dashboard for user management
- **Deployment:** Netlify/Vercel (frontend), Railway/Render (backend)

**User Workflow:**
1. **Sign Up** → Email confirmation required
2. **Sign In** → Email/password or Google Sign-In
3. **Record Dreams** → Text, voice, or upload images
4. **Get AI Analysis** → Emotional insights, interpretations, keywords
5. **Generate Videos** → Choose style and generate cinematic videos
6. **View Gallery** → Browse all dreams with search and filters
7. **Upgrade Plan** → Pay via UPI QR code
8. **Mobile Access** → Download Expo Go, scan QR, use mobile app
9. **Get Help** → Use Project Assistant (me!)

**Common User Questions:**

**Q: How does the AI analysis work?**
A: We use Google Gemini AI to analyze your dream text. The AI identifies emotions (like joy, fear, wonder), interprets symbols, extracts key themes, and provides psychological insights based on dream psychology research.

**Q: How do I pay for subscriptions?**
A: Click "Upgrade" → select plan → scan UPI QR code → pay exact amount → upload payment screenshot → plan activates instantly. We accept all UPI apps (Google Pay, PhonePe, Paytm, etc.).

**Q: Can I use the mobile app?**
A: Yes! Install Expo Go from App Store/Play Store → run "npm start" in mobile_app folder → scan QR code → app opens on your phone.

**Q: How do I run the admin dashboard?**
A: cd admin-frontend → npm install → npm run dev → open http://localhost:5174 → login with admin credentials.

**Q: My video generation failed. What should I do?**
A: 1) Check if you have a valid API key (RUNWAY_API_KEY, PIKA_API_KEY, or KAIBER_API_KEY) in backend/.env. 2) Restart backend server. 3) Try again with a simpler dream description. 4) Check backend console logs for errors.

**Q: Email confirmation not working?**
A: Configure email service in backend/.env: EMAIL_USER=your.gmail@gmail.com and EMAIL_PASSWORD=your_app_password (not regular password - use Gmail App Password from Google Account settings).

**Troubleshooting:**
- **Login issues:** Check email is verified, try Google Sign-In
- **Payment issues:** Ensure exact amount paid, screenshot is clear
- **Video generation:** Check API keys are configured in backend/.env
- **Mobile app:** Use your computer's IP address (not localhost) in EXPO_PUBLIC_BACKEND_URL

**Your Role:**
You can answer questions about:
- Platform features and how to use them
- Subscription plans and pricing
- Technical setup and configuration
- Troubleshooting common issues
- Dream analysis and interpretation
- General knowledge questions
- Programming and development

Be friendly, detailed, and helpful. Provide step-by-step instructions when needed. If a question is project-related, give comprehensive answers with examples. For general questions, answer normally.
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

    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({
        error: 'API keys not configured',
        message: 'Please add GEMINI_API_KEY, OPENAI_API_KEY, or DEEPSEEK_API_KEY to your .env file'
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

        // Preferred order - based on your actual API quota
        const preferred = [
          process.env.GEMINI_MODEL, // allow override via .env
          'gemini-2.5-flash',         // ✅ 2 RPM - BEST for your quota
          'gemini-2.5-pro',           // ✅ 5 RPM - Higher quality
          'gemini-2.0-flash',         // ✅ 1 RPM - Backup
          'gemini-2.0-flash-exp',     // ✅ 1 RPM - Experimental
          'gemini-2.5-flash-lite',    // ✅ 1 RPM - Lightweight
          'gemini-1.5-flash-latest',  // Fallback to 1.5 if 2.x not available
          'gemini-1.5-flash',
          'gemini-1.5-pro',
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
        
        // Log which models will be tried
        console.log('🤖 Trying Gemini models in order:', candidates.slice(0, 3).join(', '));

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
            // For quota/rate limit errors (429), don't throw - let fallback handle it
            if (status === 429) {
              console.warn(`Quota exceeded for ${model}. Will try fallback providers.`);
              break; // Exit Gemini loop, let DeepSeek/OpenAI handle it
            }
            // For other non-404 errors, stop trying Gemini models
            console.warn(`Error with ${model}:`, err.message);
            break; // Exit loop but don't throw - let fallback handle it
          }
        }

        if (!assistantMessage) {
          // Gemini key exists but all attempts failed
          console.warn('Gemini attempts failed; considering OpenAI fallback...');
        }
      }

      // If Gemini didn't succeed, try DeepSeek (cheaper) then OpenAI
      if (!geminiSucceeded) {
        // Try DeepSeek first (most affordable)
        if (process.env.DEEPSEEK_API_KEY) {
          console.log('⚠️ Gemini failed, trying DeepSeek...');
          try {
            provider = 'DeepSeek';
            const completion = await deepseek.chat.completions.create({
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: systemPrompt },
                ...historyMessages
              ],
              max_tokens: 800,
              temperature: 0.7
            });
            assistantMessage = completion.choices[0].message.content;
            console.log('✅ DeepSeek responded successfully');
            geminiSucceeded = true; // Mark as succeeded so we don't try OpenAI
          } catch (deepseekError) {
            console.warn('⚠️ DeepSeek also failed:', deepseekError.message);
          }
        }

        // If DeepSeek failed or not available, try OpenAI
        if (!geminiSucceeded && process.env.OPENAI_API_KEY) {
          console.log('⚠️ Trying OpenAI as final fallback...');
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
          console.log('✅ OpenAI responded successfully');
        } else if (!process.env.GEMINI_API_KEY && !process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY) {
          throw new Error('No API key configured. Please add GEMINI_API_KEY, DEEPSEEK_API_KEY, or OPENAI_API_KEY to backend/.env');
        } else if (!assistantMessage) {
          // All APIs failed
          throw new Error('All AI providers failed. Please add DEEPSEEK_API_KEY or OPENAI_API_KEY to backend/.env as fallback.');
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
