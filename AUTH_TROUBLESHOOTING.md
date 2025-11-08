# Authentication Troubleshooting Guide

## 🔴 **Issue: Manual Signup/Signin Not Working**

Only Google Sign-In is working. Manual email/password authentication is failing.

---

## 🔍 **Diagnosis Steps**

### 1. **Check Backend Server Status**

```bash
cd backend
npm run dev
```

**Look for:**
- ✅ Server started on port 3001
- ✅ Supabase connection established
- ❌ Any errors in console

### 2. **Check Environment Variables**

**Backend `.env` file:**
```bash
# Required for authentication
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Email configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Admin emails (optional)
ADMIN_EMAILS=admin@example.com

# JWT Secret
JWT_SECRET=your_secret_here
```

**Frontend `.env` file:**
```bash
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=http://localhost:3001/api
```

### 3. **Check Supabase Configuration**

**In Supabase Dashboard:**

1. Go to **Authentication > Providers**
2. **Email provider** should be ENABLED
3. **Confirm email** should be ENABLED (or DISABLED for testing)
4. **Bot Protection (hCaptcha)** - Should be DISABLED for local testing

**If Bot Protection is ON:**
- You need to add hCaptcha keys
- Or disable it temporarily

---

## 🛠️ **Common Fixes**

### Fix 1: Email Confirmation Requirement

The system requires email confirmation before signin. This is the most common issue.

**Check if this is the problem:**
```javascript
// In backend/routes/auth.js line 408-412
if (!user.email_confirmed_at) {
  return res.status(401).json({ 
    error: 'Email Not Verified', 
    message: 'Please verify your email before signing in.' 
  });
}
```

**Quick Fix for Testing:**

**Option A: Disable email confirmation requirement**

Edit `backend/routes/auth.js` line 407-413:

```javascript
// COMMENT OUT THIS CHECK FOR TESTING:
/*
if (!user.email_confirmed_at) {
  return res.status(401).json({ 
    error: 'Email Not Verified', 
    message: 'Please verify your email before signing in.' 
  });
}
*/

// OR change to warning instead:
if (!user.email_confirmed_at) {
  logger.warn(`User ${normalizedEmail} signing in without email confirmation (dev mode)`);
  // Allow signin anyway
}
```

**Option B: Auto-confirm emails during signup**

Edit `backend/routes/auth.js` line 100-110:

```javascript
const userId = crypto.randomUUID();
const confirmationToken = crypto.randomBytes(32).toString('hex');
const user = {
  id: userId,
  email: normalizedEmail,
  password: password,
  email_confirmed_at: new Date().toISOString(), // ✅ AUTO-CONFIRM
  created_at: new Date().toISOString(),
  user_metadata: { signup_method: 'web_app' },
  confirmation_token: confirmationToken
};
```

---

### Fix 2: Supabase Not Configured (Demo Mode)

If Supabase credentials are not set, the system runs in "demo mode" with in-memory storage.

**Check if in demo mode:**

```bash
cd backend
grep SUPABASE_URL .env
```

**If output shows placeholders:**
```env
SUPABASE_URL=your_supabase_project_url  ❌
```

**Fix:**
1. Go to [https://supabase.com](https://supabase.com)
2. Create a project (free tier)
3. Get credentials from **Settings > API**
4. Update `.env` with real values

---

### Fix 3: Email Service Not Configured

Confirmation emails won't send if email service is not configured.

**Check email config:**

```bash
cd backend
grep EMAIL_USER .env
```

**If using Gmail:**
```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

**To get Gmail App Password:**
1. Enable 2FA on your Google account
2. Go to **Google Account > Security > App Passwords**
3. Generate a password for "Mail"
4. Use that password (not your regular password)

---

### Fix 4: Frontend Not Connecting to Backend

**Check frontend environment:**

```javascript
// In browser console:
console.log(import.meta.env.VITE_BACKEND_URL)
// Should show: http://localhost:3001/api
```

**If undefined or wrong:**

Edit `.env` in root directory:
```env
VITE_BACKEND_URL=http://localhost:3001/api
```

**Then restart frontend:**
```bash
npm run dev
```

---

### Fix 5: CORS Issues

**Check backend console for CORS errors:**

```
Access to fetch at 'http://localhost:3001/api/auth/signin' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Fix in `backend/server.js`:**

```javascript
// Around line 20-30
app.use(cors({
  origin: [
    'http://localhost:5173',  // ✅ Add your frontend URL
    'http://localhost:5174',  // Admin frontend
    'http://localhost:3000'   // Any other frontend
  ],
  credentials: true
}));
```

---

## 🧪 **Testing Manual Authentication**

### Test 1: Sign Up

**Using Browser Console:**

```javascript
// Open http://localhost:5173/auth
// Open DevTools Console (F12)

const signup = async () => {
  const response = await fetch('http://localhost:3001/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test@123'
    })
  });
  
  const data = await response.json();
  console.log('Signup response:', data);
  return data;
};

signup();
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "email_confirmed_at": null
  }
}
```

**Common Errors:**
- `Missing Fields` - Email/password not provided
- `User Exists` - Email already registered
- `Invalid Password` - Password too weak
- `CaptchaFailed` - hCaptcha verification failed

### Test 2: Confirm Email (If Required)

If email confirmation is enabled, you need to confirm the email first.

**Check confirmation tokens:**

```bash
cd backend
# The confirmation link is logged in console
# Look for: "Confirmation link: http://localhost:3001/api/auth/confirm?token=..."
```

**Manually confirm in browser:**
```
http://localhost:3001/api/auth/confirm?token=YOUR_TOKEN_HERE
```

### Test 3: Sign In

**Using Browser Console:**

```javascript
const signin = async () => {
  const response = await fetch('http://localhost:3001/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test@123'
    })
  });
  
  const data = await response.json();
  console.log('Signin response:', data);
  return data;
};

signin();
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "email_confirmed_at": "2024-..."
  },
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_at": 1234567890
  }
}
```

**Common Errors:**
- `Invalid Credentials` - Wrong email/password
- `Email Not Verified` - Must confirm email first ⚠️ **MOST COMMON**
- `Missing Fields` - Email/password not provided
- `User Not Found` - Email not registered

---

## 🔧 **Quick Fix Implementation**

### **Recommended: Auto-Confirm Emails in Development**

This is the fastest way to test manual authentication without email setup.

**File**: `backend/routes/auth.js`

**Change 1: Auto-confirm on signup (Line 100-110)**

```javascript
// BEFORE:
const user = {
  id: userId,
  email: normalizedEmail,
  password: password,
  email_confirmed_at: null, // ❌ Requires confirmation
  //...
};

// AFTER:
const user = {
  id: userId,
  email: normalizedEmail,
  password: password,
  email_confirmed_at: new Date().toISOString(), // ✅ Auto-confirmed
  //...
};
```

**Change 2: Remove email confirmation check on signin (Line 407-413)**

```javascript
// BEFORE:
if (!user.email_confirmed_at) {
  return res.status(401).json({ 
    error: 'Email Not Verified', 
    message: 'Please verify your email before signing in.' 
  });
}

// AFTER (comment out for development):
// Email confirmation check disabled for development
// if (!user.email_confirmed_at) {
//   return res.status(401).json({ 
//     error: 'Email Not Verified', 
//     message: 'Please verify your email before signing in.' 
//   });
// }
```

**Change 3: Also in production fallback (Line 474-480)**

```javascript
// BEFORE:
if (!demoUser.email_confirmed_at) {
  return res.status(401).json({ 
    error: 'Email Not Verified', 
    message: 'Please verify your email before signing in.' 
  });
}

// AFTER:
// if (!demoUser.email_confirmed_at) {
//   logger.warn(`Dev mode: allowing unconfirmed email ${normalizedEmail}`);
// }
```

**Restart backend:**
```bash
cd backend
npm run dev
```

---

## ✅ **Verification Checklist**

After implementing fixes, verify:

- [ ] Backend server running on port 3001
- [ ] No console errors in backend
- [ ] Frontend can connect to `http://localhost:3001/api`
- [ ] CORS headers properly configured
- [ ] Environment variables set correctly
- [ ] Email confirmation disabled OR email service configured
- [ ] Supabase credentials valid OR demo mode working
- [ ] Test signup creates user successfully
- [ ] Test signin logs in without errors
- [ ] Google Sign-In still working

---

## 🎯 **Root Cause Analysis**

Based on the code review, the **most likely issue** is:

### **Email Confirmation Requirement**

Your system has **strict email confirmation enabled**:

```javascript
// Line 408 in backend/routes/auth.js
if (!user.email_confirmed_at) {
  return res.status(401).json({ 
    error: 'Email Not Verified', 
    message: 'Please verify your email before signing in.' 
  });
}
```

**Why Google Sign-In works but manual doesn't:**
- ✅ Google Sign-In → Email auto-confirmed by Google
- ❌ Manual Sign-Up → Requires email confirmation link

**Solutions:**
1. **For Testing**: Auto-confirm emails (see Quick Fix above)
2. **For Production**: Configure email service properly
3. **Alternative**: Use magic link authentication instead

---

## 📝 **Summary**

**Problem**: Manual signup/signin not working

**Most Likely Cause**: Email confirmation requirement without email service configured

**Quick Fix**: Auto-confirm emails in development mode (see code changes above)

**Permanent Fix**: Configure Gmail or SMTP email service for confirmation emails

---

## 🚀 **Next Steps**

1. **Apply Quick Fix** (auto-confirm emails for testing)
2. **Restart Backend** server
3. **Test Manual Signup** with new account
4. **Test Manual Signin** immediately after signup
5. **Verify Both Work** before re-enabling email confirmation

---

Need help implementing? Let me know which fix you want to apply!
