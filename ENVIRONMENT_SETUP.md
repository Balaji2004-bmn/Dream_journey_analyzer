# 🔐 Environment Variables Setup Guide

## 📋 **Required Environment Variables**

### **Frontend (.env)**
Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Backend Configuration
VITE_BACKEND_URL=http://localhost:3002

# RunwayML API Key (for real video generation)
VITE_RUNWAY_API_KEY=your_runway_ml_api_key_here
```

### **Backend (.env)**
Create a `.env` file in the `backend/` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# OpenAI API Key (for AI analysis)
OPENAI_API_KEY=your_openai_api_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5174

# Server Port
PORT=3002

# RunwayML API Key (for video generation)
RUNWAY_API_KEY=your_runway_ml_api_key_here
```

## 🔑 **How to Get API Keys**

### **1. Supabase Keys**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing one
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

### **2. RunwayML API Key**
1. Go to [runwayml.com/api](https://runwayml.com/api)
2. Sign up for an account
3. Navigate to API section
4. Generate a new API key
5. Copy the key → `VITE_RUNWAY_API_KEY` and `RUNWAY_API_KEY`

### **3. OpenAI API Key (Optional)**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up for an account
3. Go to **API Keys** section
4. Create a new secret key
5. Copy the key → `OPENAI_API_KEY`

## 🚀 **Setup Instructions**

### **Step 1: Create Environment Files**

**Frontend (.env):**
```bash
# In the root directory
touch .env
```

**Backend (.env):**
```bash
# In the backend directory
touch backend/.env
```

### **Step 2: Add Your Keys**

**Frontend .env:**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_BACKEND_URL=http://localhost:3002
VITE_RUNWAY_API_KEY=your_actual_runway_api_key_here
```

**Backend .env:**
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-your_openai_key_here
FRONTEND_URL=http://localhost:5174
PORT=3002
RUNWAY_API_KEY=your_actual_runway_api_key_here
```

### **Step 3: Restart the Application**

After adding the environment variables:

```bash
# Stop the current application (Ctrl+C)
# Then restart
npm run dev:full
```

## 🔒 **Security Best Practices**

### **✅ Do:**
- Store API keys in `.env` files
- Add `.env` to `.gitignore` (never commit API keys)
- Use different keys for development and production
- Rotate API keys regularly
- Use environment-specific `.env` files

### **❌ Don't:**
- Hardcode API keys in source code
- Commit `.env` files to version control
- Share API keys in chat/email
- Use production keys in development

## 🛠️ **Troubleshooting**

### **Issue: "RunwayML API key not provided"**
**Solution:** Make sure `VITE_RUNWAY_API_KEY` is set in your `.env` file and restart the application.

### **Issue: "Supabase connection failed"**
**Solution:** Verify your Supabase URL and keys are correct in the `.env` file.

### **Issue: Environment variables not loading**
**Solution:** 
1. Ensure `.env` file is in the correct directory
2. Restart the development server
3. Check for typos in variable names (must start with `VITE_` for frontend)

### **Issue: API key validation fails**
**Solution:**
1. Verify the API key is correct
2. Check if the API key has the required permissions
3. Ensure the API key is not expired

## 📁 **File Structure**

```
Dream_journey_analyzer/
├── .env                    # Frontend environment variables
├── backend/
│   └── .env               # Backend environment variables
├── src/
│   ├── services/
│   │   └── runwayML.js    # Uses VITE_RUNWAY_API_KEY
│   └── components/
│       └── APISettings.jsx # Shows env var setup instructions
└── README.md
```

## 🎯 **Quick Start**

1. **Copy the example:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file:**
   ```bash
   # Replace placeholder values with your actual API keys
   nano .env
   ```

3. **Start the application:**
   ```bash
   npm run dev:full
   ```

4. **Test video generation:**
   - Go to Profile → API Keys
   - Verify your RunwayML API key is detected
   - Try generating a dream video

## 🔍 **Verification**

To verify your environment variables are loaded correctly:

1. **Check in browser console:**
   ```javascript
   console.log(import.meta.env.VITE_RUNWAY_API_KEY);
   ```

2. **Check API Settings page:**
   - Go to Profile → API Keys
   - Should show "API Key Validated" if configured correctly

3. **Test video generation:**
   - Create a dream
   - Try generating a video
   - Should work without errors

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure API keys have proper permissions
4. Restart the application after making changes

---

**Note:** Environment variables starting with `VITE_` are exposed to the frontend, while backend variables are server-side only. This is why we use `VITE_RUNWAY_API_KEY` for frontend access to RunwayML.
