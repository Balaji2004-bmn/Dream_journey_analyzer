# AI Assistant Setup Guide

The Project Assistant feature requires an AI API key to function. This guide will help you configure it.

## Quick Setup

1. **Choose an AI Provider**
   - **OpenAI** (Recommended): More reliable, better responses
   - **Google Gemini**: Free tier available, good alternative

2. **Get Your API Key**

### Option 1: OpenAI (Recommended)
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. Add to `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

### Option 2: Google Gemini
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Add to `backend/.env`:
   ```env
   GEMINI_API_KEY=your-actual-key-here
   ```

## Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. If you don't have a `.env` file, copy from the example:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add your API key:
   ```env
   # Add ONE of these (OpenAI is preferred):
   OPENAI_API_KEY=sk-your-key-here
   # OR
   GEMINI_API_KEY=your-key-here
   ```

4. Restart the backend server:
   ```bash
   npm run dev
   ```

## Testing the Assistant

1. Open your application in the browser
2. Click the "Need Help?" button in the bottom-right corner
3. Try asking: "What features does this platform have?"
4. You should get a response about the Dream Journey Analyzer

## Troubleshooting

### "API keys not configured" error
- Make sure you added the API key to `backend/.env`
- Restart the backend server after adding the key
- Check that the key is valid and not expired

### Assistant not responding
- Check backend console for errors
- Verify your API key is correct
- Check if you have API credits/quota remaining
- For OpenAI: Check https://platform.openai.com/account/usage
- For Gemini: Check https://makersuite.google.com/app/apikey

### Connection errors
- Ensure backend is running on port 3001
- Check that `VITE_BACKEND_URL` in frontend `.env` is correct
- Verify CORS settings in `backend/server.js`

## Cost Information

### OpenAI
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Most queries cost less than $0.01
- Check pricing: https://openai.com/pricing

### Google Gemini
- Free tier: 60 requests per minute
- Good for development and testing
- Check limits: https://ai.google.dev/pricing

## Security Notes

- ⚠️ Never commit `.env` files to git
- ⚠️ Keep API keys private
- ⚠️ Rotate keys if exposed
- ✅ Use environment variables only
- ✅ Add `.env` to `.gitignore` (already done)

## Support

If you continue to have issues:
1. Check the backend console logs
2. Check browser developer console
3. Verify all environment variables are set correctly
4. Ensure the backend server is running
