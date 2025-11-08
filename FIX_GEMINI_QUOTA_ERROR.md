# 🔴 Fix: Gemini API Quota Exceeded (Error 429)

**Error:** `Quota exceeded for quota metric 'Generate Content API requests per minute'`

---

## 🎯 Quick Solution

### **Recommended: Add OpenAI as Fallback**

```env
# In backend/.env

# Your existing Gemini key (keep it)
GEMINI_API_KEY=AIzaSyYourGeminiKeyHere

# Add OpenAI key for automatic fallback
OPENAI_API_KEY=sk-YourOpenAIKeyHere
```

**Why this works:**
- ✅ System tries Gemini first (free)
- ✅ Automatically switches to OpenAI when Gemini fails
- ✅ No code changes needed
- ✅ Reliable fallback

**Get OpenAI Key:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or login
3. Click "Create new secret key"
4. Copy key (starts with `sk-`)
5. Add to `backend/.env`

**Cost:** ~$0.002 per request (GPT-3.5-turbo)

---

## 🔍 Why Gemini is Failing

Your error shows:
```json
"quota_limit_value": "0"
"quota_location": "asia-southeast1"
"status": "RESOURCE_EXHAUSTED"
```

**This means:**
1. ❌ You have **0 requests per minute** allowed
2. ❌ Your project is in `asia-southeast1` region with quota restrictions
3. ❌ Free tier has very low limits or API not properly enabled

---

## 🔧 Alternative Solutions

### **Option 1: Fix Gemini API Setup**

#### **A. Check if API is Enabled**

1. Go to https://console.cloud.google.com/apis/dashboard
2. Search for "Generative Language API"
3. Make sure it's **ENABLED**
4. If not, click **ENABLE**

#### **B. Create New API Key**

Your current key might be restricted:

1. Go to https://makersuite.google.com/app/apikey
2. **Delete your current API key**
3. Click **"Create API Key"**
4. Select or create a project
5. Copy new key
6. Update `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy_NEW_KEY_HERE
   ```

#### **C. Check Billing (For Higher Quota)**

1. Go to https://console.cloud.google.com/billing
2. Make sure billing is enabled for your project
3. Free tier has severe rate limits
4. Paid tier gives much higher quotas

---

### **Option 2: Request Quota Increase**

1. Go to https://console.cloud.google.com/iam-admin/quotas
2. Search for "Generative Language API"
3. Find "GenerateContent requests per minute"
4. Click **"EDIT QUOTAS"**
5. Request increase (e.g., from 0 to 60 per minute)
6. Submit request
7. Wait for Google approval (can take 1-2 days)

---

### **Option 3: Use Different Google Account**

If your account is restricted:

1. Create a new Google account
2. Go to https://makersuite.google.com/app/apikey
3. Create API key with new account
4. Update `backend/.env` with new key

---

## 🚀 Immediate Fix (Works Right Now)

**Add OpenAI key and restart backend:**

```bash
# 1. Edit backend/.env
# Add this line:
OPENAI_API_KEY=sk-proj-your_key_here

# 2. Restart backend
cd backend
npm run dev

# 3. Test - should now work with OpenAI fallback
```

**Backend will now:**
1. Try Gemini first (free but limited)
2. If Gemini fails → automatically use OpenAI
3. User gets response either way ✅

---

## 💰 Cost Comparison

### **Gemini AI:**
- ✅ **Free tier:** 60 requests/minute (but you have 0)
- ✅ **Paid tier:** Much higher limits
- ❌ **Your issue:** Quota set to 0 in your region

### **OpenAI GPT-3.5:**
- 💰 **Cost:** $0.002 per request
- ✅ **Reliable:** No unexpected quota issues
- ✅ **Fast:** Good quality responses
- 💰 **Example:** 1000 requests = $2

### **Recommended Setup:**
```env
# Both keys for best reliability
GEMINI_API_KEY=your_gemini_key     # Primary (free)
OPENAI_API_KEY=your_openai_key     # Fallback (paid)
```

**This gives you:**
- Free Gemini when working
- Reliable OpenAI when Gemini fails
- No downtime

---

## 🧪 Test After Fix

**Method 1: Test HTML**
```bash
# Open in browser:
test-project-assistant.html

# Ask a question, should work now
```

**Method 2: Command Line**
```bash
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"test"}'
```

**Expected:** Response from OpenAI ✅

---

## 📊 Monitor Usage

### **Check Backend Logs**

When working correctly, you'll see:
```
⚠️ Gemini failed, falling back to OpenAI...
✅ OpenAI responded successfully
Assistant responded using OpenAI
```

When Gemini works:
```
Gemini responded using model: gemini-1.5-flash-latest
Assistant responded using Gemini
```

---

## ✅ Summary

**Your Issue:** Gemini API quota = 0 in your region

**Quick Fix:**
1. ✅ Add `OPENAI_API_KEY` to `backend/.env`
2. ✅ Restart backend
3. ✅ Test - works with OpenAI fallback

**Long-term Fix:**
1. ✅ Request Gemini quota increase
2. ✅ Keep OpenAI as backup
3. ✅ Both work together seamlessly

---

## 🔗 Useful Links

- **Get OpenAI Key:** https://platform.openai.com/api-keys
- **Google AI Studio:** https://makersuite.google.com/app/apikey
- **Google Cloud Console:** https://console.cloud.google.com
- **Request Quota Increase:** https://cloud.google.com/docs/quotas/help/request_increase

---

## 📞 Still Not Working?

1. **Check backend console** for detailed errors
2. **Verify both keys** in `backend/.env`
3. **Restart backend** after adding keys
4. **Test with curl** command above
5. **Check OpenAI balance:** https://platform.openai.com/usage

---

**Add OpenAI key now and your assistant will work immediately!** 🚀
