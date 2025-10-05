# 🚀 Dream Journey Analyzer - Deployment Checklist

## ✅ Pre-Deployment Tasks

### 1. **Authentication & Email Configuration** ⚠️ CRITICAL

#### Backend Environment Variables (backend/.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_PUBLIC_URL=https://your-backend-domain.com

# Supabase (REQUIRED)
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Email (REQUIRED for sign-up confirmation)
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Admin Configuration
ADMIN_EMAILS=admin@yourdomain.com
ADMIN_MASTER_PASSWORD=SecurePassword123!

# JWT Secret (REQUIRED)
JWT_SECRET=generate_a_long_random_secret_minimum_32_chars

# API Keys (Optional but recommended)
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
RUNWAY_API_KEY=your_runway_key
PIKA_API_KEY=your_pika_key
```

#### Frontend Environment Variables (.env)
```env
# Supabase
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Backend URL (NO /api suffix in development, but API calls add it)
VITE_BACKEND_URL=http://localhost:3001

# For production:
VITE_BACKEND_URL=https://your-backend-domain.com

# Frontend URL
VITE_FRONTEND_URL=http://localhost:5173

# Optional
VITE_HCAPTCHA_SITEKEY=your_hcaptcha_sitekey
```

### 2. **Email Setup** 📧

#### Gmail Configuration (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create password for "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. Set in backend/.env:
   ```env
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

#### Test Email Configuration
Run this test after setup:
```bash
cd backend
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.sendMail({
  from: 'your-email@gmail.com',
  to: 'your-email@gmail.com',
  subject: 'Test Email',
  text: 'Email configuration works!'
}, (err, info) => {
  if (err) console.error('Error:', err);
  else console.log('Success:', info);
});
"
```

### 3. **Database Setup** 🗄️

#### Supabase Configuration
1. Create tables using SQL scripts in `/supabase` folder
2. Enable Row Level Security (RLS)
3. Disable email confirmation in Supabase Auth (we handle it custom):
   - Go to Authentication → Settings
   - Disable "Enable email confirmations"
4. Configure redirect URLs:
   - Add `https://your-frontend-domain.com/**` to allowed redirect URLs
   - Add `http://localhost:5173/**` for development

### 4. **Security Checklist** 🔐

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (minimum 32 characters)
- [ ] Set strong ADMIN_MASTER_PASSWORD
- [ ] Enable HTTPS on production domains
- [ ] Configure CORS properly (only allow your frontend domain)
- [ ] Review and update `.gitignore` to exclude .env files
- [ ] Never commit API keys or secrets to Git
- [ ] Enable rate limiting in production
- [ ] Set up monitoring and logging

### 5. **Feature Testing** 🧪

#### Authentication Flow
- [ ] Sign up with email confirmation works
- [ ] Email confirmation link redirects correctly
- [ ] Sign in works after email confirmation
- [ ] Sign in blocked before email confirmation
- [ ] Password reset flow works
- [ ] Admin login with master password works
- [ ] Google OAuth sign-in works (if enabled)

#### Core Features
- [ ] Dream submission works
- [ ] AI analysis generates properly
- [ ] Video generation integrates correctly
- [ ] Image uploads work
- [ ] Voice input functions
- [ ] Email sending works
- [ ] Gallery displays dreams
- [ ] User dashboard shows correct data

#### Admin Features
- [ ] Admin login works
- [ ] User management accessible
- [ ] Content management works
- [ ] Analytics display correctly

### 6. **Performance Optimization** ⚡

- [ ] Enable production build: `npm run build`
- [ ] Optimize images and assets
- [ ] Configure CDN for static assets
- [ ] Enable compression middleware
- [ ] Set up caching headers
- [ ] Minify CSS and JavaScript

---

## 🌐 Deployment Platforms

### **Frontend Deployment (Vercel/Netlify)**

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

**Environment Variables to Set:**
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_BACKEND_URL
- VITE_FRONTEND_URL
- VITE_HCAPTCHA_SITEKEY (optional)

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

### **Backend Deployment (Railway/Render/Heroku)**

#### Railway
1. Connect GitHub repository
2. Select backend folder as root
3. Add environment variables
4. Deploy automatically

#### Render
1. Create new Web Service
2. Connect repository
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

#### Heroku
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Deploy backend
cd backend
git subtree push --prefix backend heroku main
```

### **Database (Supabase)**
- Already hosted on Supabase cloud
- Ensure production RLS policies are enabled
- Set up backups
- Monitor usage and quotas

---

## 📱 Mobile App Development Guide

### **Option 1: React Native (Recommended)**

#### Why React Native?
- Reuse existing React codebase (~60-70% code sharing)
- Single codebase for iOS and Android
- Access to native device features
- Large community and ecosystem

#### Setup
```bash
# Install React Native CLI
npm install -g react-native-cli

# Create new project
npx react-native init DreamJourneyMobile

# Or use Expo (easier for beginners)
npx create-expo-app DreamJourneyMobile
```

#### Code Sharing Strategy
1. **Shared Code** (create `/shared` folder):
   - API service functions
   - Business logic
   - Data models
   - Utility functions
   
2. **Platform-Specific**:
   - UI components (use React Native components)
   - Navigation (React Navigation)
   - Storage (AsyncStorage instead of localStorage)

3. **API Integration**:
   ```javascript
   // Same API endpoints, just change base URL
   const API_BASE = 'https://your-backend-domain.com/api';
   
   // Reuse your existing API service
   import { supabase } from '@/integrations/supabase/client';
   ```

#### Key Differences Web → Mobile
```javascript
// Web: localStorage
localStorage.setItem('key', 'value');

// Mobile: AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('key', 'value');

// Web: <div>, <button>
<div><button>Click</button></div>

// Mobile: <View>, <TouchableOpacity>
<View><TouchableOpacity><Text>Click</Text></TouchableOpacity></View>
```

### **Option 2: Progressive Web App (PWA)**

#### Easiest Option - Convert Existing Web App
1. Add PWA configuration to `vite.config.js`:
```javascript
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Dream Journey Analyzer',
        short_name: 'DreamJourney',
        description: 'AI-powered dream analysis',
        theme_color: '#6366f1',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
};
```

2. Install PWA plugin:
```bash
npm install vite-plugin-pwa -D
```

3. Users can "Add to Home Screen" on mobile browsers

**Pros:**
- No additional development
- Works on all platforms
- Automatic updates
- Smaller download size

**Cons:**
- Limited native features
- Requires browser support
- Less "app-like" feel

### **Option 3: Flutter (if you want to learn new tech)**
- Beautiful UI out of the box
- Excellent performance
- Need to rewrite app from scratch
- Learning curve for Dart language

---

## 🐛 Common Deployment Issues & Fixes

### Issue 1: Email Confirmation Not Working
**Symptoms:** Users don't receive confirmation emails
**Fix:**
1. Check EMAIL_USER and EMAIL_PASSWORD in backend/.env
2. Verify Gmail app password is correct
3. Check backend logs: `heroku logs --tail` or Railway logs
4. Test email transporter locally

### Issue 2: CORS Errors
**Symptoms:** "CORS policy: No 'Access-Control-Allow-Origin' header"
**Fix:**
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue 3: Environment Variables Not Working
**Symptoms:** "undefined" or "your_supabase_url" in production
**Fix:**
1. Verify variables are set in deployment platform
2. Restart deployment after adding variables
3. Check variable names match exactly (case-sensitive)
4. For Vite: Must start with `VITE_`

### Issue 4: Authentication Redirects Failing
**Symptoms:** Email confirmation link goes to 404
**Fix:**
1. Set correct FRONTEND_URL in backend/.env
2. Add redirect URL to Supabase allowed list
3. Verify BACKEND_PUBLIC_URL is correct

### Issue 5: Database Connection Errors
**Symptoms:** "Failed to connect to database"
**Fix:**
1. Check Supabase URL and keys
2. Verify RLS policies allow access
3. Check Supabase project is active (not paused)

---

## 📊 Post-Deployment Monitoring

### Essential Metrics to Track
1. **User Authentication**: Sign-up success rate
2. **Email Delivery**: Confirmation email delivery rate
3. **API Response Times**: Backend endpoint performance
4. **Error Rates**: 4xx and 5xx errors
5. **Database Performance**: Query times and connection pool
6. **Video Generation**: Success rate and processing time

### Monitoring Tools
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and debugging
- **Supabase Dashboard**: Database metrics
- **Google Analytics**: User behavior
- **Uptime Robot**: Service availability

---

## 🎯 Final Verification

Before going live, test this complete flow:
1. ✅ Sign up with new email
2. ✅ Receive confirmation email within 1 minute
3. ✅ Click confirmation link → redirects to login page
4. ✅ Sign in with confirmed email
5. ✅ Submit a new dream
6. ✅ AI analysis generates
7. ✅ Video generation works
8. ✅ Email dream to self
9. ✅ View in gallery
10. ✅ Admin login works

---

## 🚀 Go-Live Checklist

- [ ] All environment variables set correctly
- [ ] Email sending tested and working
- [ ] SSL certificates installed (HTTPS)
- [ ] Custom domain configured
- [ ] Database backups enabled
- [ ] Error monitoring set up
- [ ] Performance optimized
- [ ] Security review completed
- [ ] All features tested
- [ ] Documentation updated
- [ ] Support email configured
- [ ] Terms of service and privacy policy added

---

## 📞 Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Railway Docs**: https://docs.railway.app

**Good luck with your deployment! 🎉**
