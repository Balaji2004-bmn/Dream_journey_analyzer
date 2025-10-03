const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompts for dual-mode assistant
const PROJECT_SYSTEM_PROMPT = `You are the official assistant for the "Adaptive Dream Journey Analyzer with Story Video Generation" platform.

**About the Platform:**
- **Name:** Adaptive Dream Journey Analyzer with Story Video Generation
- **Purpose:** Users can record their dreams, get AI-powered analysis, and generate cinematic story videos from their dreams
- **Tagline:** Transform your dreams into visual stories

**Key Features:**
1. **Dream Journal**: Users can write down their dreams with date, mood, and tags
2. **AI Dream Analysis**: Uses advanced AI to interpret symbols, themes, emotions, and meanings in dreams
3. **Video Generation**: Creates beautiful, cinematic story videos from dream narratives using AI
4. **Dream Gallery**: Browse and manage past dreams with search and filtering
5. **Analytics Dashboard**: Track dream patterns, moods, and insights over time
6. **Subscription Plans**: Free, Pro ($5/month), and Premium ($10/month) tiers
7. **UPI Payment Integration**: Easy payment for Indian users with QR code scanning
8. **Email & SMS Notifications**: Get reminders and updates about your dreams
9. **Dark/Light Mode**: Professional slate blue theme with theme switching
10. **Multi-language Support**: Support for multiple languages in the interface

**Subscription Plans:**
- **Free Plan:** Basic dream journaling, limited AI analysis (up to 5 dreams/month)
- **Pro Plan ($5/month - ₹415):** Priority video generation, up to 10s videos, HD thumbnails, unlimited dreams, email export, advanced analytics
- **Premium Plan ($10/month - ₹830):** Everything in Pro + up to 15s videos, early access features, priority support, custom video styles, API access

**Payment Process:**
Users can upgrade via UPI: scan QR code → pay exact amount → upload screenshot → plan auto-activates within minutes

**Technical Stack:**
- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui components
- **Backend:** Node.js + Express + OpenAI API
- **Database:** Supabase (PostgreSQL)
- **AI Services:** OpenAI GPT for analysis, various video generation APIs (RunwayML, Pika, Stability AI)
- **Payments:** UPI integration + Razorpay
- **Authentication:** Supabase Auth with email verification
- **Deployment:** Ready for Vercel/Netlify frontend, Railway/Render backend

**How Users Can Use the Platform:**
1. **Sign Up:** Create account with email verification
2. **Record Dreams:** Write dream descriptions with mood and tags
3. **Get Analysis:** AI analyzes symbols, emotions, and meanings
4. **Generate Videos:** Choose from multiple AI video generators
5. **View Gallery:** Browse past dreams and videos
6. **Upgrade Plans:** Use UPI payments for premium features
7. **Settings:** Customize notifications, themes, and preferences

**Common User Questions & Answers:**
- **How to start?** Sign up → Add your first dream → Get AI analysis → Generate video
- **Video quality?** Pro: HD thumbnails, Premium: Full HD videos up to 15s
- **Payment security?** UPI payments are secure, no card details stored
- **Data privacy?** Dreams are encrypted, only you can access your data
- **Video generation time?** 2-5 minutes for Pro, 1-3 minutes for Premium
- **Supported languages?** English primary, Hindi and other Indian languages planned

**Troubleshooting:**
- **Video generation failed?** Check internet connection, try again, or contact support
- **Payment not reflecting?** Wait 5-10 minutes, or contact support with transaction ID
- **Can't access account?** Use forgot password, check spam folder for verification emails

Only answer project-related questions. If user asks about how to use the project, features, pricing, or issues, guide them step by step with detailed, helpful answers. Be friendly, concise, and actionable.`;

const GENERAL_SYSTEM_PROMPT = "You are a general AI assistant (like ChatGPT). Answer the user's question normally and helpfully.";

// Keywords that trigger project mode
const PROJECT_KEYWORDS = ['dream', 'video', 'story', 'analyzer', 'project', 'journey'];

// In-memory conversation storage (temporary - can be moved to DB later)
const conversations = new Map();

/**
 * POST /api/assistant
 * Send a message to the AI assistant and get a response
 * Body: { userMessage: string, conversationId?: string }
 */
router.post('/', async (req, res) => {
  try {
    const { userMessage, conversationId } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required and must be a string' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Please add OPENAI_API_KEY to your .env file'
      });
    }

    // Determine mode based on keywords
    const isProjectMode = PROJECT_KEYWORDS.some(keyword =>
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    );
    const systemPrompt = isProjectMode ? PROJECT_SYSTEM_PROMPT : GENERAL_SYSTEM_PROMPT;

    // Get or create conversation history
    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let history = conversations.get(convId) || [];

    // Convert history to OpenAI format
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Add the new user message
    messages.push({ role: 'user', content: userMessage });

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message.content;

    // Update conversation history
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage }
    );

    // Keep only last 10 exchanges (20 messages) to prevent memory issues
    if (history.length > 20) {
      history = history.slice(-20);
    }
    conversations.set(convId, history);

    // Auto-cleanup old conversations (older than 1 hour)
    const oneHourAgo = Date.now() - 3600000;
    for (const [id, _] of conversations.entries()) {
      const timestamp = parseInt(id.split('_')[1]);
      if (timestamp < oneHourAgo) {
        conversations.delete(id);
      }
    }

    res.json({
      assistantMessage,
      conversationId: convId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Assistant API error:', error);
    res.status(500).json({
      error: 'Failed to get assistant response',
      message: error.message || 'An error occurred while processing your request'
    });
  }
});

/**
 * DELETE /api/assistant/:conversationId
 * Clear a conversation history
 */
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
