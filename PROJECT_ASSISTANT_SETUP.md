# 🤖 Project Assistant - Setup & Usage Guide

## Overview

The **Project Assistant** is an AI-powered chatbot that helps users understand and navigate your "Adaptive Dream Journey Analyzer" platform. It uses **Google Gemini AI** to answer questions about features, guide users through workflows, and provide support.

---

## ✅ What's Been Added

### Backend (`backend/routes/assistant.js`)
- **Endpoint:** `POST /api/assistant`
- **AI Model:** Google Gemini (`gemini-1.5-flash`)
- **Features:**
  - Conversation history management (in-memory, last 10 exchanges)
  - Auto-cleanup of old conversations (older than 1 hour)
  - System prompt with full project knowledge
  - Clear conversation endpoint: `DELETE /api/assistant/:conversationId`

### Frontend (`src/components/ProjectAssistant.jsx`)
- **UI:** Floating chat button (bottom-right corner)
- **Features:**
  - Clean chat interface with user/assistant message bubbles
  - Real-time typing indicator
  - Clear conversation button
  - Minimize/expand functionality
  - Smooth scrolling to new messages
  - Enter key to send (Shift+Enter for new line)

### Integration
- ✅ Route registered in `backend/server.js`
- ✅ Component added to `src/App.jsx` (global visibility)
- ✅ Uses existing `GEMINI_API_KEY` from `.env`

---

## 📋 Setup Instructions

### 1. **Backend Setup** (Already Done ✓)

The Gemini API key is already configured in your `backend/.env`:

```env
GEMINI_API_KEY=AIzaSyCoipRLT9bbPRTxRoaAx9tNBEwWHjo-ADA
```

No additional backend setup needed! The route is already registered.

### 2. **Test Backend**

Restart your backend server to load the new route:

```powershell
cd backend
npm run dev
```

**Test the endpoint manually:**

```powershell
# Test with curl or Postman
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "What is this platform about?"
  }'
```

**Expected response:**
```json
{
  "assistantMessage": "This platform is called 'Adaptive Dream Journey Analyzer with Story Video Generation'...",
  "conversationId": "conv_1234567890_abc123",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

### 3. **Frontend Setup** (Already Done ✓)

The component is already integrated into `App.jsx` and will appear on all pages.

**Restart frontend:**

```powershell
npm run dev
```

---

## 🎯 How to Use

### For End Users:

1. **Click the floating "Need Help?" button** at the bottom-right corner
2. **Type your question** in the input box
3. **Press Enter** or click the Send button
4. **View the AI response** in the chat bubble
5. **Continue the conversation** - the assistant remembers context
6. **Clear conversation** with the trash icon
7. **Minimize** with the minimize icon

### Example Questions Users Can Ask:

- "How do I analyze my dreams?"
- "What's the difference between Pro and Premium plans?"
- "How do I generate a video from my dream?"
- "How do I upgrade my subscription?"
- "Can I export my dreams?"
- "What payment methods are supported?"
- "How does the AI dream analysis work?"

---

## 🔧 Customization Options

### 1. **Modify System Prompt**

Edit `backend/routes/assistant.js` line 8-50 to change the assistant's knowledge:

```javascript
const SYSTEM_PROMPT = `You are the official AI assistant...`;
```

### 2. **Change AI Model**

Line 57 in `backend/routes/assistant.js`:

```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
// Options: 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'
```

### 3. **Adjust Response Length**

Line 77 in `backend/routes/assistant.js`:

```javascript
generationConfig: {
  maxOutputTokens: 500,  // Increase for longer responses
  temperature: 0.7,       // 0.0 = factual, 1.0 = creative
}
```

### 4. **Change Button Position**

In `src/components/ProjectAssistant.jsx`, line 115:

```jsx
// Change from bottom-right to bottom-left:
className="fixed bottom-6 left-6 z-50..."
```

### 5. **Disable on Specific Pages**

In `src/App.jsx`, conditionally render:

```jsx
{!isAdminPage && <ProjectAssistant />}
```

---

## 🚀 Future Enhancements (Extensibility)

### 1. **Save Conversations to Supabase**

Create a `conversations` table:

```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  conversation_id text UNIQUE,
  messages jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

Update `backend/routes/assistant.js` to save/load from DB instead of memory.

### 2. **Speech-to-Text**

Add voice input using Web Speech API:

```jsx
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
  setInput(event.results[0][0].transcript);
};
```

### 3. **Text-to-Speech**

Read assistant responses aloud:

```jsx
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
};
```

### 4. **User Feedback**

Add thumbs up/down to each response:

```jsx
<Button onClick={() => rateFeedback(msgId, 'positive')}>👍</Button>
<Button onClick={() => rateFeedback(msgId, 'negative')}>👎</Button>
```

### 5. **Restrict to Project Knowledge Only**

Update system prompt to refuse off-topic questions:

```javascript
const SYSTEM_PROMPT = `...
If asked about topics unrelated to the Dream Journey platform, politely say:
"I'm specifically designed to help with Dream Journey Analyzer. For other topics, please consult general resources."
`;
```

### 6. **Analytics**

Track common questions in Supabase:

```sql
CREATE TABLE assistant_analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  question text,
  response_time_ms integer,
  user_satisfied boolean,
  created_at timestamp DEFAULT now()
);
```

---

## 📊 API Reference

### POST `/api/assistant`

**Request:**
```json
{
  "userMessage": "string (required)",
  "conversationId": "string (optional)"
}
```

**Response:**
```json
{
  "assistantMessage": "string",
  "conversationId": "string",
  "timestamp": "ISO 8601 string"
}
```

**Errors:**
- `400` - Missing or invalid `userMessage`
- `500` - Gemini API key not configured or AI error

### DELETE `/api/assistant/:conversationId`

**Response:**
```json
{
  "message": "Conversation cleared successfully"
}
```

---

## 🐛 Troubleshooting

### Issue: "Gemini API key not configured"

**Solution:** Check `backend/.env` has `GEMINI_API_KEY` set.

### Issue: Assistant not responding

**Solution:**
1. Check backend is running: `http://localhost:3001/health`
2. Check browser console for errors
3. Verify API key is valid
4. Check backend logs for errors

### Issue: Button not appearing

**Solution:**
1. Clear browser cache and restart dev server
2. Check `App.jsx` has `<ProjectAssistant />` component
3. Verify no CSS z-index conflicts

### Issue: Conversation not persisting

**Solution:** This is expected - conversations are in-memory and clear after 1 hour or server restart. To persist, implement Supabase storage (see Future Enhancements).

---

## ✅ Verification Checklist

- [ ] Backend server running (`npm run dev` in `backend/`)
- [ ] Frontend dev server running (`npm run dev`)
- [ ] "Need Help?" button visible at bottom-right
- [ ] Can send a message and receive response
- [ ] Messages appear in correct chat bubbles (user/assistant)
- [ ] Clear conversation button works
- [ ] Minimize/expand works
- [ ] No console errors

---

## 📝 Summary

**What You Get:**
- ✅ AI-powered support chatbot
- ✅ Gemini AI integration
- ✅ Clean, professional UI
- ✅ Conversation history
- ✅ Global availability (all pages)
- ✅ Mobile responsive

**Files Created:**
1. `backend/routes/assistant.js` - API endpoint
2. `src/components/ProjectAssistant.jsx` - Chat UI
3. `PROJECT_ASSISTANT_SETUP.md` - This guide

**Files Modified:**
1. `backend/server.js` - Route registration
2. `src/App.jsx` - Component integration

**Ready to use!** 🎉

Visit any page of your app and click "Need Help?" to start chatting with your AI assistant.
