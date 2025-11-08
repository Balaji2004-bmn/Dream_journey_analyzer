# 🎯 Your Gemini API Models & Quota

Based on your actual API quota limits.

---

## ✅ Available Models (With Quota)

### **1. gemini-2.5-flash** ⭐ RECOMMENDED
- **RPM:** 2 requests per minute
- **TPM:** 35.64K tokens per minute  
- **RPD:** 6 requests per day
- **Best for:** General use, fast responses
- **Status:** ✅ This is your PRIMARY model

### **2. gemini-2.5-pro**
- **RPM:** 5 requests per minute
- **TPM:** 108.32K tokens per minute
- **RPD:** 22 requests per day
- **Best for:** High-quality responses, complex queries
- **Status:** ✅ Available as alternative

### **3. gemini-2.0-flash**
- **RPM:** 1 request per minute
- **TPM:** 2K tokens per minute
- **RPD:** 1 request per day
- **Best for:** Backup only (very limited)
- **Status:** ⚠️ Very limited, use sparingly

### **4. gemini-2.0-flash-exp**
- **RPM:** 1 request per minute
- **TPM:** 5K tokens per minute
- **RPD:** 1 request per day
- **Best for:** Testing experimental features
- **Status:** ⚠️ Experimental

### **5. gemini-2.5-flash-lite**
- **RPM:** 1 request per minute
- **TPM:** 5K tokens per minute
- **RPD:** 2 requests per day
- **Best for:** Simple queries, ultra-fast responses
- **Status:** ⚠️ Very limited

---

## ❌ Not Available (0 Quota)

These models have **0 quota** - don't use them:
- ❌ gemini-2.0-flash-lite
- ❌ gemini-2.0-flash-preview-image-generation
- ❌ gemini-2.5-flash-tts
- ❌ gemini-robotics-er-1.5-preview
- ❌ learnlm-2.0-flash-experimental

---

## 🚀 Your Code Now Uses

**Priority order:**
1. **gemini-2.5-flash** ← Tries this FIRST (2 RPM available)
2. **gemini-2.5-pro** ← Fallback (5 RPM available)
3. **gemini-2.0-flash** ← Last resort (1 RPM only)

**Backend will log:**
```bash
🤖 Trying Gemini models in order: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash
Gemini responded using model: gemini-2.5-flash
Assistant responded using Gemini
```

---

## 📊 Understanding the Limits

### **RPM (Requests Per Minute)**
- How many API calls you can make per minute
- **gemini-2.5-flash: 2 RPM** = Max 2 questions per minute

### **TPM (Tokens Per Minute)**
- How many tokens (words) you can process per minute
- Tokens = roughly 4 characters or 0.75 words

### **RPD (Requests Per Day)**
- How many API calls you can make per day
- **gemini-2.5-flash: 6 RPD** = Max 6 questions per day

---

## ⚠️ Important Warnings

### **Daily Limits are LOW**

Your quota shows:
- **gemini-2.5-flash: 6 requests per day** ⚠️
- **gemini-2.5-pro: 22 requests per day** ✅
- **gemini-2.0-flash: 1 request per day** ❌

**This means:**
- You can only ask ~6 questions per day with gemini-2.5-flash
- After 6 questions, you'll hit quota
- Need OpenAI as fallback!

### **Recommended Solution**

**Add OpenAI as fallback:**

```env
# In backend/.env

# Gemini for first 6 requests/day
GEMINI_API_KEY=your_gemini_key

# OpenAI takes over after quota exceeded
OPENAI_API_KEY=sk-your_openai_key
```

**With this setup:**
1. First 6 questions/day → Free with Gemini ✅
2. After 6 questions → OpenAI (~$0.002 per question) 💰
3. No downtime, seamless switching 🚀

---

## 🧪 Test Your Setup

### **Start Backend and Watch Logs:**

```bash
cd backend
npm run dev
```

**Ask a question via test HTML or app, you'll see:**
```
🤖 Trying Gemini models in order: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash
Gemini responded using model: gemini-2.5-flash
```

**After 6 questions today, you'll see:**
```
❌ AI API error: Quota exceeded
⚠️ Gemini failed, falling back to OpenAI...
✅ OpenAI responded successfully
```

---

## 💡 Optimization Tips

### **1. Use gemini-2.5-pro for Better Daily Limit**

```env
# In backend/.env
GEMINI_MODEL=gemini-2.5-pro
```

**Why:**
- gemini-2.5-pro: 22 requests/day (vs 6 for flash)
- Still fast and good quality
- Better for daily use

### **2. Add Request Tracking**

Track how many requests you've made:

```javascript
// Simple counter
let requestCount = 0;
const resetTime = new Date().setHours(24, 0, 0, 0); // Midnight

if (Date.now() > resetTime) {
  requestCount = 0;
}

requestCount++;
console.log(`Daily requests: ${requestCount}/6`);
```

### **3. Cache Common Questions**

```javascript
const cache = new Map();

// Before API call
if (cache.has(userMessage)) {
  return cache.get(userMessage); // No API call needed!
}

// After API call
cache.set(userMessage, assistantMessage);
```

---

## 🎯 Recommended Configuration

### **Best Setup for Your Quota:**

```env
# backend/.env

# Use Pro for better daily limit (22/day vs 6/day)
GEMINI_MODEL=gemini-2.5-pro

# Or let it auto-select (tries flash first)
GEMINI_API_KEY=your_gemini_key

# Add OpenAI as backup (IMPORTANT!)
OPENAI_API_KEY=sk-your_openai_key
```

**This gives you:**
- ✅ ~22 free requests/day (with gemini-2.5-pro)
- ✅ Unlimited paid requests after that (OpenAI)
- ✅ No service interruption
- ✅ Best quality responses

---

## 📈 Monitor Your Usage

### **Check Current Usage:**

1. Go to https://console.cloud.google.com
2. Navigate to **APIs & Services** → **Quotas**
3. Search for "Generative Language API"
4. View current usage

### **Backend Logs:**

Every request shows:
```bash
Gemini responded using model: gemini-2.5-flash
```

Count requests per day:
```bash
grep "Gemini responded" backend.log | wc -l
```

---

## ✅ Summary

**Your Available Models:**
- ✅ gemini-2.5-flash (2 RPM, 6 RPD) - Auto-selected
- ✅ gemini-2.5-pro (5 RPM, 22 RPD) - Better for daily use
- ⚠️ Others have 1 RPD (not useful)

**Current Setup:**
- Code tries gemini-2.5-flash first
- Falls back to gemini-2.5-pro
- Then tries gemini-2.0-flash

**Recommendation:**
```env
# Use Pro for better daily limit
GEMINI_MODEL=gemini-2.5-pro

# Add OpenAI as backup
OPENAI_API_KEY=sk-your_key
```

**Daily Limits:**
- gemini-2.5-flash: 6 questions/day
- gemini-2.5-pro: 22 questions/day ← BETTER!
- After quota: OpenAI takes over

---

**Your code is now optimized for your actual API quota!** 🎯

**For daily use, consider forcing gemini-2.5-pro (22 requests/day) instead of flash (6 requests/day).**
