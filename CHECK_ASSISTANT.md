# Quick Assistant Check ✅

If the assistant is not responding, follow these steps:

## Step 1: Check if API Key Exists

Open `backend/.env` file and look for one of these lines:

```env
GEMINI_API_KEY=your-key-here
```
OR
```env
OPENAI_API_KEY=sk-your-key-here
```

**✅ If you see your API key there, go to Step 2.**  
**❌ If NO key or it's empty, you need to add one!**

### How to Get Gemini API Key (FREE)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
5. Paste in `backend/.env` like this:
   ```env
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

## Step 2: Restart Backend

After adding or changing the API key, you MUST restart the backend:

```bash
# Stop the backend (Ctrl+C if it's running)
# Then start it again:
cd backend
npm run dev
```

You should see:
```
Dream Journey Backend running on port 3001
```

## Step 3: Test the Assistant

1. Open your app in browser (usually http://localhost:5173)
2. Click the "Need Help?" button (bottom-right corner)
3. Type: "What is this platform about?"
4. You should get a response about Dream Journey Analyzer!

## Step 4: Check Backend Logs

If still not working, look at your backend terminal for errors:

**Good signs** ✅:
- `Assistant responded using Gemini`
- No error messages

**Bad signs** ❌:
- `API keys not configured`
- `403 Forbidden` or `401 Unauthorized` (invalid key)
- `400 Bad Request` (check API key format)

## Common Issues

### Issue: "API keys not configured"
**Fix**: Add GEMINI_API_KEY to backend/.env, then restart backend

### Issue: Gemini returns 400 error
**Fix**: Your API key might be invalid. Get a new one from Google AI Studio

### Issue: Assistant shows loading forever
**Fix**: Check backend is running on port 3001. Check browser console (F12) for errors.

### Issue: No response at all
**Fix**: 
1. Make sure backend is running
2. Check frontend can reach backend: http://localhost:3001/health
3. Check CORS settings in backend/server.js

## Priority Settings

✅ **Gemini is now tried FIRST** (as requested)  
✅ **Always gives project-related answers**  
✅ **No troubleshooting errors shown to users**

The assistant will automatically answer questions about:
- Platform features
- Subscription plans
- How to use the app
- Payment process
- Dream analysis
- Video generation
- And any general questions!

## Still Not Working?

Check the backend terminal output when you send a message. Copy any error messages and we can debug further.
