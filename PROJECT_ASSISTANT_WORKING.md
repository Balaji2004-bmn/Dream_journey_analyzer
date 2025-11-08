# 🤖 Project Assistant - Complete Guide

Your Dream Journey Analyzer has a powerful AI assistant to help users with any questions!

---

## ✅ What is Project Assistant?

An AI-powered chatbot that helps users with:
- **Platform features** - How to use dream analysis, video generation, etc.
- **Subscriptions** - Plan details, pricing, upgrades
- **Technical help** - Troubleshooting, setup guides
- **General questions** - Can answer any question, not just project-related

---

## 🎯 Key Features

### 1. **Dual AI Support**
- ✅ **Primary:** Google Gemini AI (fast, free, accurate)
- ✅ **Fallback:** OpenAI GPT-3.5 (if Gemini fails)
- ✅ **Auto-switching:** Tries Gemini first, switches to OpenAI if needed

### 2. **Project Knowledge**
The assistant knows EVERYTHING about your project:
- All features and how they work
- Subscription plans and pricing (₹415 Pro, ₹830 Premium)
- UPI payment process with screenshot upload
- Technical stack (React, Node.js, Supabase, etc.)
- Common troubleshooting steps
- Setup instructions for mobile app and admin dashboard

### 3. **Conversation Memory**
- ✅ Remembers context within a conversation
- ✅ Can answer follow-up questions
- ✅ Auto-cleans old conversations after 1 hour

### 4. **Always Available**
- Appears as a floating button in bottom-right corner
- Click "Need Help?" to open chat
- Works on all pages of your app

---

## 🔧 Configuration

### Backend Setup

**1. Add API Keys to `backend/.env`:**

```env
# Google Gemini AI (Primary - RECOMMENDED)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI (Fallback - Optional but recommended)
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**How to get API keys:**

#### **Gemini AI (Free!):**
1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select your Google Cloud project (or create new one)
4. Copy the API key
5. Add to backend/.env as `GEMINI_API_KEY=...`

#### **OpenAI (Paid):**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Add to backend/.env as `OPENAI_API_KEY=...`

**2. Restart Backend:**
```bash
cd backend
npm run dev
```

**3. Verify in logs:**
```
✅ Server running on port 3001
✅ Assistant route registered
```

---

## 🧪 Testing the Assistant

### Method 1: Use Test HTML

1. **Open test file:**
   ```
   Open: test-project-assistant.html in your browser
   ```

2. **Check status:**
   - Should show "Backend Connected"
   - Shows if APIs are configured

3. **Ask questions:**
   - Type question or click quick question buttons
   - See response from AI
   - Test both project and general questions

### Method 2: Use Frontend

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Open app:** `http://localhost:5173`

3. **Look for floating button:** Bottom-right corner says "Need Help?"

4. **Click and ask questions:**
   - "What is Dream Journey Analyzer?"
   - "What are the subscription plans?"
   - "How does video generation work?"
   - "How do I pay with UPI?"
   - "Explain quantum computing" (general question)

---

## 📊 How It Works

### Architecture

```
User clicks "Need Help?"
    ↓
Frontend (ProjectAssistant.jsx)
    ↓
POST /api/assistant
    ↓
Backend (routes/assistant.js)
    ↓
Try Gemini API first
    ↓
If fails → Try OpenAI API
    ↓
Return response to user
```

### AI Provider Logic

```javascript
// Priority order:
1. Try Gemini AI (if GEMINI_API_KEY exists)
   - Tries multiple models
   - Falls back to v1beta if v1 fails
   
2. If Gemini fails → Try OpenAI (if OPENAI_API_KEY exists)
   - Uses GPT-3.5-turbo
   
3. If both fail → Return error with helpful message
```

### Response Flow

```
User: "What are the subscription plans?"
    ↓
Assistant: "Dream Journey Analyzer offers three subscription plans:

**Free Plan:**
- 5 dreams per month
- Basic AI analysis
- Standard video quality

**Pro Plan ($5/month = ₹415):**
- Unlimited dreams
- Priority video generation
- HD thumbnails
- Advanced analytics

**Premium Plan ($10/month = ₹830):**
- Everything in Pro
- Longer videos (up to 30 seconds)
- Priority support
- Custom dream themes
- API access

To upgrade: Click 'Upgrade' → Scan UPI QR code → Pay → Upload screenshot → Plan activates instantly!"
```

---

## 🎨 Frontend Component

**File:** `src/components/ProjectAssistant.jsx`

**Features:**
- Floating button UI
- Chat interface with message history
- Typing indicator
- Clear conversation button
- Minimize button
- Enter key to send
- Auto-scroll to latest message

**Customization:**

```jsx
// Change assistant colors
bg-green-500 text-white  // Assistant messages
bg-primary text-primary-foreground  // User messages

// Change button position
className="fixed bottom-6 right-6"  // Bottom-right
// Change to: top-6 right-6 for top-right
```

---

## 🔍 What Questions Can It Answer?

### Platform Questions

✅ **Features:**
- "What features does Dream Journey Analyzer have?"
- "How does dream analysis work?"
- "Can I generate videos from my dreams?"
- "What is the dream gallery?"

✅ **Subscriptions:**
- "What are the subscription plans?"
- "How much does Pro cost?"
- "What's included in Premium?"
- "How do I upgrade my plan?"

✅ **Payments:**
- "How do I pay with UPI?"
- "What payment methods do you accept?"
- "How much is ₹415 in USD?"
- "Can I pay with credit card?"

✅ **Technical:**
- "How do I run the mobile app?"
- "How do I access the admin dashboard?"
- "My video generation failed, what should I do?"
- "Email confirmation not working"

### General Questions

✅ **Can answer ANY question:**
- "What is quantum computing?"
- "Explain machine learning"
- "How do I learn React?"
- "What's the weather like?" (but won't have real-time data)

---

## 🐛 Troubleshooting

### Issue 1: Assistant Button Not Showing

**Check:**
1. Is ProjectAssistant imported in App.jsx?
   ```jsx
   import ProjectAssistant from './components/ProjectAssistant';
   ```

2. Is it rendered in App.jsx?
   ```jsx
   <ProjectAssistant />
   ```

3. Restart frontend:
   ```bash
   npm run dev
   ```

### Issue 2: No Response from Assistant

**Error:** "Unable to get response"

**Fix:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check API keys in backend/.env:**
   ```bash
   cd backend
   grep GEMINI_API_KEY .env
   grep OPENAI_API_KEY .env
   ```

3. **At least ONE key must be set:**
   ```env
   GEMINI_API_KEY=your_key_here
   # OR
   OPENAI_API_KEY=sk-your_key_here
   ```

4. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

5. **Check backend console for errors**

### Issue 3: "API keys not configured" Error

**Fix:**

1. **Add at least one API key to backend/.env:**
   ```env
   GEMINI_API_KEY=your_gemini_key
   ```

2. **Restart backend**

3. **Test with test-project-assistant.html**

### Issue 4: Gemini API Errors

**Common errors:**

- **"Model not found"** → Gemini tries different models automatically
- **"API key invalid"** → Get new key from Google AI Studio
- **"Quota exceeded"** → Wait or upgrade Gemini quota

**Solution:** Add OpenAI key as fallback:
```env
OPENAI_API_KEY=sk-your_openai_key
```

### Issue 5: CORS Errors

**Error:** "Access blocked by CORS policy"

**Fix:** Check backend/server.js has correct CORS config:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',  // ✅ Frontend URL
    'http://localhost:5174',  // Admin
  ],
  credentials: true
}));
```

---

## 📊 API Endpoint Details

### POST /api/assistant

**Request:**
```json
{
  "userMessage": "What are the subscription plans?",
  "conversationId": "conv_1234567890_abc123"  // optional
}
```

**Response (Success):**
```json
{
  "assistantMessage": "Dream Journey Analyzer offers three plans: Free, Pro ($5/month), and Premium ($10/month)...",
  "conversationId": "conv_1234567890_abc123",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response (Error):**
```json
{
  "error": "Failed to get assistant response",
  "message": "API keys not configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to your .env file"
}
```

### DELETE /api/assistant/:conversationId

Clears conversation history.

**Request:**
```
DELETE /api/assistant/conv_1234567890_abc123
```

**Response:**
```json
{
  "message": "Conversation cleared successfully"
}
```

---

## 🎯 Best Practices

### For Users

1. **Be specific** - "How do I upgrade to Pro?" is better than "How do I upgrade?"
2. **Ask follow-ups** - Assistant remembers context
3. **Clear conversation** - Use trash icon to start fresh
4. **Try examples** - Use quick question buttons

### For Developers

1. **Set both API keys** - Gemini (free) + OpenAI (fallback)
2. **Monitor logs** - Check backend console for issues
3. **Update prompt** - Edit PROJECT_SYSTEM_PROMPT for more context
4. **Test regularly** - Use test-project-assistant.html
5. **Keep updated** - Update assistant knowledge when you add features

---

## 📈 Analytics

Track assistant usage:

```javascript
// In backend/routes/assistant.js
console.log(`Assistant responded using ${provider}`);
// Logs: "Assistant responded using Gemini"
// Or: "Assistant responded using OpenAI"
```

Add to your analytics:
- Total questions asked
- Response time
- Provider used (Gemini vs OpenAI)
- Most common questions
- Error rate

---

## 🚀 Advanced Features

### Add Custom Knowledge

Edit `backend/routes/assistant.js` line 11-113:

```javascript
const PROJECT_SYSTEM_PROMPT = `
You are the official AI assistant for Dream Journey Analyzer.

// Add more information here:
**New Feature:**
- Description
- How to use
- Benefits
`;
```

### Change AI Model

```javascript
// For Gemini - preferred models (line 124)
const preferred = [
  'gemini-1.5-flash-latest',  // Fast, good quality
  'gemini-1.5-pro-latest',    // Best quality, slower
];

// For OpenAI (line 238)
model: 'gpt-3.5-turbo',  // Fast, cheap
// Or: 'gpt-4' for better quality (more expensive)
```

### Add Conversation Persistence

Currently conversations are in-memory (lost on restart).

To persist:
1. Save to database (Supabase)
2. Load on restart
3. Implement user-specific histories

---

## ✅ Verification Checklist

- [ ] Backend running on port 3001
- [ ] At least one API key configured (Gemini or OpenAI)
- [ ] Backend logs show no errors
- [ ] Frontend shows "Need Help?" button
- [ ] Clicking button opens chat
- [ ] Can send messages
- [ ] Receives responses
- [ ] Both project and general questions work
- [ ] Conversation history works
- [ ] Clear conversation works

---

## 📚 Files Reference

**Backend:**
- `backend/routes/assistant.js` - Main assistant logic
- `backend/server.js` - Route registration (line 24, 112)

**Frontend:**
- `src/components/ProjectAssistant.jsx` - Chat UI component
- `src/App.jsx` - Component integration (line 27, 66)

**Testing:**
- `test-project-assistant.html` - Standalone test page

**Documentation:**
- `PROJECT_ASSISTANT_WORKING.md` - This file
- `PROJECT_ASSISTANT_SETUP.md` - Setup guide (if exists)

---

## 🎉 Success!

When working correctly, users will see:

```
User: "What is Dream Journey Analyzer?"
