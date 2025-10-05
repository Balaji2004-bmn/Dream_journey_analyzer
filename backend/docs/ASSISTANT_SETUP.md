# Assistant API - Quick Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Active API keys for Gemini and/or OpenAI

---

## Step 1: Install Dependencies

The required dependencies are already included in `package.json`:

```bash
cd backend
npm install
```

**Dependencies used:**
- `express` - Web server framework
- `axios` - HTTP client for Gemini API
- `openai` - Official OpenAI SDK
- `dotenv` - Environment variable management

---

## Step 2: Configure Environment Variables

Create or update your `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Google Gemini API (Primary)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# OpenAI API (Fallback)
OPENAI_API_KEY=your_actual_openai_api_key_here

# Other existing environment variables...
```

### Getting API Keys

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the key and add it to your `.env` file

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add it to your `.env` file

**Important:** Keep your API keys secret! Never commit `.env` to version control.

---

## Step 3: Verify Setup

The assistant route is already registered in `server.js`:

```javascript
// Line 24
const assistantRoutes = require('./routes/assistant');

// Line 112
app.use('/api/assistant', assistantRoutes);
```

No additional setup needed!

---

## Step 4: Start the Server

```bash
cd backend
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:
```
Dream Journey Backend running on port 3001
Environment: development
Frontend URL: http://localhost:5173
```

---

## Step 5: Test the API

### Quick Test (using curl)

```bash
# Test project-related question
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "How do I upgrade to Pro plan?"}'

# Test unrelated question (should be rejected)
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "What is the weather today?"}'
```

### Automated Test Suite

Run the comprehensive test suite:

```bash
cd backend
node tests/test-assistant.js
```

This will run 6 tests covering:
- ✓ Project-related questions
- ✓ Conversation continuity
- ✓ Unrelated question rejection
- ✓ Technical questions
- ✓ Conversation clearing
- ✓ Error handling

---

## Step 6: Integration with Frontend

### Example React Integration

```javascript
// src/services/assistantService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const askAssistant = async (message, conversationId = null) => {
  try {
    const response = await axios.post(`${API_URL}/api/assistant`, {
      userMessage: message,
      conversationId: conversationId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get response');
  }
};

export const clearConversation = async (conversationId) => {
  try {
    await axios.delete(`${API_URL}/api/assistant/${conversationId}`);
  } catch (error) {
    console.error('Failed to clear conversation:', error);
  }
};
```

### Example React Component

```jsx
import { useState } from 'react';
import { askAssistant } from './services/assistantService';

function AssistantChat() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await askAssistant(message, conversationId);
      
      setConversation([
        ...conversation,
        { role: 'user', content: message },
        { role: 'assistant', content: response.assistantMessage }
      ]);
      
      setConversationId(response.conversationId);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant-chat">
      <div className="messages">
        {conversation.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about the Dream Journey platform..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default AssistantChat;
```

---

## Troubleshooting

### Error: "API keys not configured"

**Problem:** Neither Gemini nor OpenAI API keys are set.

**Solution:**
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.GEMINI_API_KEY ? 'Gemini key found' : 'Missing')"
```

### Error: "CORS not allowed"

**Problem:** Frontend URL is not in allowed origins.

**Solution:** Update `server.js` to include your frontend URL:
```javascript
const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174', // Add your frontend port
]);
```

### Gemini API always fails

**Problem:** Invalid or expired Gemini API key.

**Solution:**
1. Verify key in Google AI Studio
2. Check API quotas and limits
3. Ensure billing is enabled (if required)
4. Test with curl:
```bash
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### OpenAI fallback not working

**Problem:** OpenAI API key is invalid or has no credits.

**Solution:**
1. Verify key in OpenAI dashboard
2. Check account credits/billing
3. Test with curl:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}]}'
```

---

## Production Deployment

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com

GEMINI_API_KEY=your_production_gemini_key
OPENAI_API_KEY=your_production_openai_key
```

### Security Checklist

- [ ] API keys are set in secure environment variables (not in code)
- [ ] Rate limiting is configured properly
- [ ] CORS origins are restricted to your domains
- [ ] HTTPS is enabled for all requests
- [ ] Error messages don't expose sensitive information
- [ ] Logging is configured for monitoring

### Deployment Platforms

**Recommended:**
- Railway
- Render
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run

All support Node.js and environment variables out of the box.

---

## Monitoring

### Track API Usage

Add logging to monitor which provider is being used:

```javascript
// In server.js, add custom logging middleware
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (req.path === '/api/assistant' && data.provider) {
      logger.info(`Assistant used provider: ${data.provider}`);
    }
    originalJson.call(this, data);
  };
  next();
});
```

### Cost Tracking

Monitor your API usage:
- **Gemini**: Check [Google AI Studio](https://makersuite.google.com) usage dashboard
- **OpenAI**: Check [OpenAI Usage Dashboard](https://platform.openai.com/usage)

---

## Next Steps

1. ✅ Setup complete
2. ✅ Test locally
3. ✅ Integrate with frontend
4. ⏳ Deploy to production
5. ⏳ Monitor usage and costs
6. ⏳ Gather user feedback

---

## Support & Documentation

- Full API Documentation: `docs/ASSISTANT_API.md`
- Test Suite: `tests/test-assistant.js`
- Main Server: `server.js`
- Assistant Route: `routes/assistant.js`

---

**Happy Coding! 🚀**
