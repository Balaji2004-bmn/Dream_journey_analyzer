# 🚀 Complete Setup Guide

Everything you need to run Dream Journey Analyzer - all apps, all features.

---

## 📚 What's Included

Your Dream Journey Analyzer has 4 components:

1. **Backend API** (Node.js/Express) - Port 3001
2. **Main Frontend** (React/Vite) - Port 5173  
3. **Admin Dashboard** (React/Vite) - Port 5174
4. **Mobile App** (React Native/Expo) - Port 8081

---

## ⚡ Quick Start (All Apps)

### 1. Install Dependencies

```bash
# Root project
npm install

# Backend
cd backend
npm install

# Admin Frontend
cd ../admin-frontend
npm install

# Mobile App
cd ../mobile_app
npm install
```

### 2. Configure Environment Variables

**Backend: `backend/.env`**
```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Supabase (REQUIRED)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Email (REQUIRED for confirmation)
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password

# Admin Access
ADMIN_EMAILS=admin@example.com
ADMIN_MASTER_PASSWORD=SecureAdminPass123!

# Optional APIs
OPENAI_API_KEY=
RUNWAY_API_KEY=
GOOGLE_API_KEY=
```

**Frontend: `.env`**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=http://localhost:3001/api
```

**Admin: `admin-frontend/.env`**
```env
VITE_BACKEND_URL=http://localhost:3001/api
VITE_ADMIN_PORT=5174
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Mobile: `mobile_app/.env`**
```env
EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP:3001/api
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Run Everything

**Option A: Separate Terminals (Recommended)**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev

# Terminal 3 - Admin
cd admin-frontend
npm run dev

# Terminal 4 - Mobile (optional)
cd mobile_app
npm start
```

**Option B: Windows Batch Script**

Create `start-all.bat`:
```batch
@echo off
start cmd /k "cd backend && npm run dev"
timeout /t 3
start cmd /k "npm run dev"
timeout /t 3
start cmd /k "cd admin-frontend && npm run dev"
echo All servers started!
```

Run:
```bash
start-all.bat
```

### 4. Access Your Apps

```
Main App:     http://localhost:5173
Admin App:    http://localhost:5174
Backend API:  http://localhost:3001/api
Mobile App:   Scan QR in Expo Go
```

---

## 📖 Detailed Guides

Each component has its own detailed guide:

### 📧 Email Confirmation
**File:** `EMAIL_CONFIRMATION_SETUP.md`

**What:** Setup email confirmation for user signups

**Covers:**
- Gmail app password setup
- Email template customization
- Confirmation flow
- Troubleshooting

**Quick setup:**
```env
# backend/.env
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

### 📱 Mobile App
**File:** `MOBILE_APP_SETUP.md`

**What:** Run React Native mobile app

**Covers:**
- Expo setup
- iOS/Android testing
- Network configuration
- Google Sign-In

**Quick start:**
```bash
cd mobile_app
npm install
npm start
# Scan QR with Expo Go
```

### 🔐 Admin Dashboard
**File:** `ADMIN_FRONTEND_SETUP.md`

**What:** Run admin dashboard

**Covers:**
- Admin authentication
- User management
- Analytics
- System settings

**Quick start:**
```bash
cd admin-frontend
npm install
npm run dev
# Open http://localhost:5174
```

### 🔧 Authentication Troubleshooting
**File:** `AUTH_TROUBLESHOOTING.md`

**What:** Fix authentication issues

**Covers:**
- Manual signup/signin not working
- Email confirmation issues
- Google Sign-In problems
- Session management

### 🎥 Video Generation
**File:** `VIDEO_GENERATION_GUIDE.md`

**What:** Setup AI video generation

**Covers:**
- RunwayML API
- Pika Labs API
- Kaiber AI API
- Seed consistency

---

## 🔑 Authentication Features

Your app supports multiple auth methods:

### 1. Email/Password (Manual)
- ✅ Signup with email verification
- ✅ Confirmation email sent automatically
- ✅ Secure password requirements
- ✅ Session management

**Test:** Go to `/auth` → Sign Up → Verify Email → Sign In

### 2. Google Sign-In (OAuth)
- ✅ One-click authentication
- ✅ Auto-email confirmation
- ✅ Profile sync
- ✅ Works on web & mobile

**Test:** Go to `/auth` → "Continue with Google"

### 3. Admin Master Password
- ✅ Quick admin access
- ✅ Bypass regular auth
- ✅ Full admin privileges
- ✅ Security override

**Test:** Go to `/auth` → Use admin email + master password

### 4. Magic Link (Optional)
- ✅ Passwordless authentication
- ✅ Email-based login
- ✅ One-time use links
- ✅ Secure token

---

## 🔒 Email Confirmation Flow

**Now ENABLED for all users:**

```
1. User Signs Up
   ↓
2. Account Created (Unconfirmed)
   email_confirmed_at: null
   ↓
3. Confirmation Email Sent
   📧 Link expires in 24 hours
   ↓
4. User Clicks Link
   GET /api/auth/confirm?token=xxx
   ↓
5. Email Verified
   email_confirmed_at: timestamp
   ↓
6. User Can Sign In ✅
```

**Configure in:** `backend/.env`
```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**Test:**
1. Sign up → Check backend console for link
2. Click link → Email confirmed
3. Sign in → Success!

---

## 🎯 Features by Platform

### Main Frontend (Port 5173)
- ✅ User authentication
- ✅ Dream analysis
- ✅ Video generation
- ✅ Dream gallery
- ✅ Subscription management
- ✅ Profile settings

### Admin Dashboard (Port 5174)
- ✅ User management
- ✅ Content moderation
- ✅ Analytics dashboard
- ✅ System settings
- ✅ Subscription management
- ✅ Email templates

### Mobile App
- ✅ All main app features
- ✅ Native mobile UI
- ✅ Push notifications
- ✅ Offline support
- ✅ Google Sign-In

### Backend API (Port 3001)
- ✅ RESTful API
- ✅ Authentication
- ✅ Dream processing
- ✅ Video generation
- ✅ Email service
- ✅ Admin routes

---

## 🧪 Testing Checklist

### Backend
- [ ] Server starts on port 3001
- [ ] Supabase connected
- [ ] Email service configured
- [ ] Health check: `GET /api/health`

### Frontend
- [ ] App opens on port 5173
- [ ] Can access auth page
- [ ] Signup works
- [ ] Email confirmation works
- [ ] Signin works
- [ ] Google Sign-In works

### Admin
- [ ] Dashboard opens on port 5174
- [ ] Admin login works
- [ ] User list loads
- [ ] Analytics display

### Mobile
- [ ] Expo starts successfully
- [ ] QR code displays
- [ ] App loads on phone
- [ ] Can login
- [ ] Features work

---

## 🐛 Common Issues

### Backend Won't Start
```bash
# Check if port is in use
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

### Frontend Won't Build
```bash
# Clear cache
rm -rf node_modules/.vite
npm run dev
```

### Can't Connect to Backend
```bash
# Check CORS settings in backend/server.js
# Add your frontend URL to allowed origins
```

### Email Not Sending
```bash
# Check backend/.env
grep EMAIL backend/.env

# Test credentials
# Try sending test email
```

### Mobile Can't Connect
```bash
# Use your computer's IP, not localhost
ipconfig  # Windows
ifconfig  # Mac/Linux

# Update mobile_app/.env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001/api
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Users/Devices                     │
└──────┬───────────┬──────────────┬──────────────────┘
       │           │              │
       │           │              │
    Browser    Admin Panel    Mobile App
  (Port 5173) (Port 5174)   (Expo Go)
       │           │              │
       └───────────┴──────────────┘
                   │
            ┌──────▼──────┐
            │   Backend   │
            │  (Port 3001)│
            └──────┬──────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
    ┌───▼───┐  ┌──▼───┐  ┌──▼────┐
    │Supabase│ │Email │  │AI APIs│
    │Database│ │Gmail │  │Runway │
    └────────┘ └──────┘  └───────┘
```

---

## 💡 Pro Tips

### Development
- Use `nodemon` for auto-restart (backend)
- Use Vite HMR for instant updates (frontend)
- Check browser console for errors
- Monitor backend logs
- Use React DevTools

### Production
- Set `NODE_ENV=production`
- Use environment-specific `.env` files
- Enable HTTPS
- Use PM2 for backend
- Build static frontend
- Configure CDN

### Security
- Never commit `.env` files
- Use strong admin passwords
- Rotate API keys regularly
- Enable rate limiting
- Monitor authentication logs
- Use HTTPS in production

---

## 📚 Additional Resources

### Documentation
- `EMAIL_CONFIRMATION_SETUP.md` - Email setup
- `MOBILE_APP_SETUP.md` - Mobile guide
- `ADMIN_FRONTEND_SETUP.md` - Admin guide
- `AUTH_TROUBLESHOOTING.md` - Auth fixes
- `VIDEO_GENERATION_GUIDE.md` - Video APIs

### External Docs
- [Supabase Docs](https://supabase.com/docs)
- [Expo Docs](https://docs.expo.dev)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)

---

## 🆘 Getting Help

1. **Check logs** (backend console, browser console)
2. **Read error messages** carefully
3. **Check environment variables** are correct
4. **Verify ports** aren't already in use
5. **Review setup guides** for your component
6. **Test with curl/Postman** (API issues)
7. **Check network** (mobile connection issues)

---

## ✅ Success!

When everything is running:

```
✅ Backend:  http://localhost:3001
✅ Frontend: http://localhost:5173
✅ Admin:    http://localhost:5174
✅ Mobile:   Scanned QR code
✅ Email:    Confirmation working
✅ Auth:     All methods working
✅ Ready:    Start building!
```

---

**🎉 You're all set! Start building amazing dream experiences!** ✨

**Need help? Check the individual setup guides for detailed instructions!**
