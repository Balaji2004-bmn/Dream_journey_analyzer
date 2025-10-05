# 🚀 Deploy to Netlify - Complete Guide

## ✨ Easiest Method: Deploy via Netlify Website (Recommended)

### Step 1: Create Netlify Account

1. Go to **https://app.netlify.com/signup**
2. Sign up with GitHub (recommended for easy integration)
3. Authorize Netlify to access your GitHub repositories

---

### Step 2: Deploy from GitHub

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Find and select your repository: `Balaji2004-bmn/Dream_journey_analyzer`
5. Configure build settings:

```
Build command: npm run build
Publish directory: dist
```

6. Click **"Deploy site"**

---

### Step 3: Configure Environment Variables

After deployment starts, configure your environment variables:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** for each:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# Backend URL (IMPORTANT - Update after backend deployment)
VITE_BACKEND_URL=http://localhost:3001

# Frontend URL (Update with your Netlify URL after first deploy)
VITE_FRONTEND_URL=https://your-site-name.netlify.app

# Optional
VITE_HCAPTCHA_SITEKEY=your_hcaptcha_key_if_you_have_one
```

3. Click **"Save"**
4. Go to **Deploys** → Click **"Trigger deploy"** → **"Deploy site"**

---

### Step 4: Update Backend URL (After Backend Deployment)

Once you deploy your backend (see below), update:

```env
VITE_BACKEND_URL=https://your-backend-url.up.railway.app
```

Then trigger a new deploy.

---

## 🎯 Quick Deploy Button Method (Alternative)

You can also add a deploy button to your README:

```markdown
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Balaji2004-bmn/Dream_journey_analyzer)
```

---

## 📦 Backend Deployment (Required)

Your frontend needs a backend. Deploy it to **Railway** or **Render**:

### Option A: Deploy Backend to Railway (Recommended)

1. Go to **https://railway.app**
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select: `Balaji2004-bmn/Dream_journey_analyzer`
5. Set **Root Directory**: `backend`
6. Railway will auto-detect Node.js

**Configure Environment Variables in Railway:**

```env
# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-site-name.netlify.app
BACKEND_PUBLIC_URL=https://your-backend.up.railway.app

# Supabase (REQUIRED)
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Email (REQUIRED for sign-up confirmation)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password

# Security (REQUIRED)
JWT_SECRET=your_random_secret_at_least_32_characters

# Admin
ADMIN_EMAILS=your-admin-email@example.com
ADMIN_MASTER_PASSWORD=SecurePassword123!

# Optional API Keys
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
RUNWAY_API_KEY=your_runway_key
```

7. Deploy and copy the generated URL
8. Go back to Netlify and update `VITE_BACKEND_URL`

---

### Option B: Deploy Backend to Render

1. Go to **https://render.com**
2. Sign up with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your repository
5. Configure:
   - **Name**: dream-journey-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add all environment variables (same as Railway above)
7. Deploy

---

## 🔧 Configure netlify.toml (Optional but Recommended)

Create this file in your project root for better Netlify configuration:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 🎨 Custom Domain (Optional)

After deployment:

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `dreamjourney.com`)
4. Follow DNS configuration instructions
5. Netlify automatically provisions SSL certificate

---

## ✅ Post-Deployment Checklist

### Frontend (Netlify):
- [ ] Deployment successful
- [ ] All environment variables configured
- [ ] `VITE_BACKEND_URL` points to backend
- [ ] Site loads correctly
- [ ] Can navigate to auth page

### Backend (Railway/Render):
- [ ] Deployment successful
- [ ] All environment variables configured
- [ ] Email service configured (Gmail App Password)
- [ ] Supabase credentials correct
- [ ] Health check endpoint works: `https://your-backend.com/api/health`

### Test Complete Flow:
- [ ] Sign up with new email
- [ ] Receive confirmation email
- [ ] Click confirmation link (redirects to your Netlify frontend)
- [ ] Sign in successfully
- [ ] Submit a dream
- [ ] View dreams in gallery

---

## 🐛 Common Issues & Fixes

### Issue 1: "Build failed"
**Solution**: Check build logs in Netlify. Usually missing environment variables.

### Issue 2: "Cannot connect to backend"
**Solution**: 
1. Check `VITE_BACKEND_URL` is correct
2. Make sure backend is deployed and running
3. Check backend CORS allows your Netlify domain

### Issue 3: "Environment variables not working"
**Solution**: 
1. All frontend variables must start with `VITE_`
2. Trigger new deploy after adding variables
3. Clear browser cache

### Issue 4: "404 on page refresh"
**Solution**: Add `netlify.toml` file with redirects (see above)

---

## 📊 Monitor Your Deployment

### Netlify Analytics:
1. Go to **Analytics** tab
2. View page views, unique visitors
3. Monitor performance

### Check Logs:
1. **Netlify**: Go to **Deploys** → Click on deploy → **Deploy log**
2. **Railway**: Go to your service → **Deployments** → Click on deployment → **View logs**

---

## 🔄 Continuous Deployment

**Automatic deployments are now enabled!**

Every time you push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push
```

Netlify will automatically:
1. Detect the push
2. Build your app
3. Deploy the new version
4. Your site updates in ~2 minutes

---

## 🚀 Alternative: CLI Deployment (Manual)

If you prefer CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy (from project root)
netlify deploy

# Deploy to production
netlify deploy --prod
```

---

## 📝 URLs After Deployment

Save these for reference:

- **Frontend**: `https://your-site-name.netlify.app`
- **Backend**: `https://your-backend.up.railway.app` or `https://your-backend.onrender.com`
- **Supabase Dashboard**: `https://app.supabase.com`
- **Admin Dashboard**: `https://your-site-name.netlify.app/admin`

---

## 🎉 You're Live!

Once deployed, share your app:
- Share the Netlify URL with users
- Test all features in production
- Monitor errors and performance
- Set up custom domain if desired

---

## 📞 Need Help?

- **Netlify Docs**: https://docs.netlify.com
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs

**Good luck with your deployment! 🚀**
