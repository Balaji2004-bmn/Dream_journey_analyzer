# 🚀 DeepSeek API Setup - Best Value AI!

DeepSeek is an excellent AI provider - **cheaper than OpenAI** with often **better quality**!

---

## ✅ Why DeepSeek?

### **Pricing Comparison:**
- 💰 **DeepSeek:** $0.14 per 1M input tokens, $0.28 per 1M output tokens
- 💰 **OpenAI GPT-3.5:** $0.50 per 1M input tokens, $1.50 per 1M output tokens  
- 💰 **OpenAI GPT-4:** $30 per 1M input tokens, $60 per 1M output tokens

**DeepSeek is ~70% cheaper than GPT-3.5 and ~99% cheaper than GPT-4!**

### **Quality:**
- ✅ Comparable to GPT-3.5-turbo
- ✅ Better than GPT-3.5 in many tasks
- ✅ Fast response times
- ✅ Good multilingual support
- ✅ Excellent for coding and technical questions

---

## 🔑 Get DeepSeek API Key

### **Step 1: Sign Up**

1. Go to https://platform.deepseek.com
2. Click "Sign Up" or "Register"
3. Complete registration (email/phone)

### **Step 2: Get API Key**

1. Go to https://platform.deepseek.com/api_keys
2. Click "Create API Key"
3. Copy the key (starts with `sk-`)
4. Save it securely

### **Step 3: Add to Backend**

```env
# In backend/.env

# Add DeepSeek API key
DEEPSEEK_API_KEY=sk-your_deepseek_key_here

# Keep your other keys for fallback
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=sk-your_openai_key
```

### **Step 4: Restart Backend**

```bash
cd backend
npm run dev
```

**You'll see:**
```
✅ Server running on port 3001
✅ DeepSeek API configured
```

---

## 🎯 How It Works Now

### **AI Provider Priority:**

```
User asks question
    ↓
1. Try Gemini (free but has quota issues) ❌
    ↓
2. Try DeepSeek (~70% cheaper than OpenAI) ✅
    ↓
3. Try OpenAI (most expensive but reliable) 💰
    ↓
User gets response!
```

**Your code now tries in this order:**
1. **Gemini** (free, if quota available)
2. **DeepSeek** (cheap, great quality) ← NEW!
3. **OpenAI** (fallback, more expensive)

---

## 💰 Cost Comparison

### **1000 Questions:**

| Provider | Cost | Quality |
|----------|------|---------|
| Gemini | $0.00 (if quota available) | ⭐⭐⭐⭐ |
| DeepSeek | **$0.40** | ⭐⭐⭐⭐ |
| OpenAI GPT-3.5 | $2.00 | ⭐⭐⭐⭐ |
| OpenAI GPT-4 | $60.00 | ⭐⭐⭐⭐⭐ |

**DeepSeek gives you 5x more questions for the same price as OpenAI GPT-3.5!**

---

## 🧪 Test DeepSeek

### **Method 1: Test HTML**

```bash
# 1. Make sure backend has DEEPSEEK_API_KEY
# 2. Start backend
cd backend
npm run dev

# 3. Open test page
Open: test-project-assistant.html in browser

# 4. Ask a question
```

**Backend logs will show:**
```
🤖 Trying Gemini models in order: ...
❌ Gemini failed (quota = 0)
⚠️ Gemini failed, trying DeepSeek...
✅ DeepSeek responded successfully
```

### **Method 2: Command Line**

```bash
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"What is Dream Journey Analyzer?"}'
```

**Check response uses DeepSeek!**

---

## 📊 DeepSeek Models

### **deepseek-chat (Recommended)**
- **Use:** General conversation
- **Quality:** Excellent
- **Speed:** Fast
- **Cost:** $0.14/$0.28 per 1M tokens

### **deepseek-coder**
- **Use:** Coding questions
- **Quality:** Excellent for code
- **Speed:** Fast
- **Cost:** $0.14/$0.28 per 1M tokens

---

## 🔧 Advanced Configuration

### **Force DeepSeek Only**

If you want to use ONLY DeepSeek (skip Gemini):

```javascript
// In backend/routes/assistant.js

// Comment out Gemini section, go straight to DeepSeek:
if (!geminiSucceeded) {
  if (process.env.DEEPSEEK_API_KEY) {
    provider = 'DeepSeek';
    // ... DeepSeek code
  }
}
```

### **Use DeepSeek Coder for Technical Questions**

```javascript
// Detect if question is technical
const isTechnical = /code|programming|function|api|bug/.test(userMessage.toLowerCase());

const model = isTechnical ? 'deepseek-coder' : 'deepseek-chat';

const completion = await deepseek.chat.completions.create({
  model: model,
  // ... rest of config
});
```

### **Adjust Max Tokens**

```javascript
const completion = await deepseek.chat.completions.create({
  model: 'deepseek-chat',
  messages: [...],
  max_tokens: 1000,  // Increased for longer responses
  temperature: 0.7
});
```

---

## 🎯 Recommended Setup

### **Best Configuration:**

```env
# backend/.env

# Option 1: Use all three for maximum reliability
GEMINI_API_KEY=your_gemini_key        # Free (if quota works)
DEEPSEEK_API_KEY=sk-your_deepseek_key  # Cheap backup
OPENAI_API_KEY=sk-your_openai_key      # Expensive fallback

# Option 2: Skip Gemini, use DeepSeek + OpenAI
# (Don't set GEMINI_API_KEY)
DEEPSEEK_API_KEY=sk-your_deepseek_key  # Primary
OPENAI_API_KEY=sk-your_openai_key      # Fallback
```

**Option 2 is recommended** since your Gemini has 0 quota anyway.

---

## 💡 Why DeepSeek is Great for You

### **Advantages:**
1. ✅ **Much cheaper** than OpenAI (~70% savings)
2. ✅ **Better quality** than many expect
3. ✅ **Fast responses**
4. ✅ **No quota issues** like Gemini
5. ✅ **OpenAI-compatible API** (easy integration)
6. ✅ **Good for students** (low cost)

### **Best Use Cases:**
- ✅ Project assistant (answering user questions)
- ✅ Dream analysis
- ✅ Content generation
- ✅ Coding help
- ✅ General knowledge

---

## 🔍 Monitor Usage

### **Check DeepSeek Dashboard:**

1. Go to https://platform.deepseek.com
2. Navigate to **Usage** or **Dashboard**
3. View API usage and costs
4. Set spending limits if needed

### **Backend Logs:**

Every DeepSeek request shows:
```bash
⚠️ Gemini failed, trying DeepSeek...
✅ DeepSeek responded successfully
Assistant responded using DeepSeek
```

---

## 📈 Cost Tracking

### **Estimate Your Costs:**

**Assistant Questions:**
- Average question: ~100 input tokens
- Average response: ~300 output tokens

**Per 1000 questions:**
- Input: 100K tokens = $0.014
- Output: 300K tokens = $0.084
- **Total: ~$0.10 per 1000 questions**

**vs OpenAI:**
- GPT-3.5: ~$0.80 per 1000 questions
- **DeepSeek saves you $0.70 per 1000 questions!**

---

## ✅ Success Verification

### **Check Backend Logs:**

When backend starts:
```
✅ Server running on port 3001
✅ AI providers configured: DeepSeek
```

When user asks question:
```
🤖 Trying Gemini models in order: ...
⚠️ Gemini failed, trying DeepSeek...
✅ DeepSeek responded successfully
Assistant responded using DeepSeek
```

### **Test in App:**

1. Open http://localhost:5173
2. Click "Need Help?" button
3. Ask: "What is Dream Journey Analyzer?"
4. Check backend console - should see "✅ DeepSeek responded successfully"

---

## 🐛 Troubleshooting

### **Issue 1: DeepSeek Key Invalid**

**Error:** `Invalid API key`

**Fix:**
1. Get fresh key from https://platform.deepseek.com/api_keys
2. Update `backend/.env`:
   ```env
   DEEPSEEK_API_KEY=sk-your_new_key_here
   ```
3. Restart backend

### **Issue 2: DeepSeek Not Being Used**

**Check:**
1. Is key in `backend/.env`?
2. Did you restart backend?
3. Check backend logs for "trying DeepSeek"

**If Gemini working:** DeepSeek won't be tried (Gemini is first priority)
**If want to force DeepSeek:** Remove GEMINI_API_KEY temporarily

### **Issue 3: Slow Responses**

**DeepSeek is usually fast, but if slow:**
1. Check your internet connection
2. Check DeepSeek status: https://platform.deepseek.com/status
3. Increase timeout in code if needed

---

## 🎯 Summary

### **What Changed:**
✅ Added DeepSeek as AI provider
✅ Priority: Gemini → **DeepSeek** → OpenAI
✅ ~70% cheaper than OpenAI
✅ Great quality responses
✅ OpenAI-compatible API

### **To Use:**
1. Get key: https://platform.deepseek.com
2. Add to `backend/.env`:
   ```env
   DEEPSEEK_API_KEY=sk-your_key_here
   ```
3. Restart backend
4. Test - works automatically!

### **Cost:**
- **DeepSeek:** ~$0.10 per 1000 questions
- **OpenAI:** ~$0.80 per 1000 questions
- **Savings:** $0.70 per 1000 questions (87% cheaper!)

---

**DeepSeek is now your primary AI provider! Cheap, fast, and high-quality!** 🚀💰

**Get your API key at: https://platform.deepseek.com/api_keys**
