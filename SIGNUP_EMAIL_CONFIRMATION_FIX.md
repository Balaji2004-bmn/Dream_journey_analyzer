# Signup & Email Confirmation Fix

## 🐛 Issue Fixed

**Problem**: Users with existing unconfirmed accounts couldn't sign up again, and the system was allowing sign-in without email confirmation in development mode.

**Error Message**:
```
error: Sign up error: A user with this email address has already been registered
```

## ✅ Solution Implemented

### 1. **Smart Signup Flow**

#### Before:
- ❌ If user exists → show error
- ❌ Email confirmation only enforced in production
- ❌ Auto-creates users on sign-in (captcha fallback)

#### After:
- ✅ **If user exists AND confirmed** → Show "Please sign in instead"
- ✅ **If user exists BUT not confirmed** → Resend confirmation email
- ✅ **If user is new** → Create account and send confirmation email
- ✅ **Email confirmation enforced in ALL environments** (dev + production)
- ✅ **No auto-creation** on sign-in - users must sign up first

### 2. **Email Confirmation System**

#### Confirmation Endpoints Updated:
- **GET `/api/email/confirm-email?email=...`** - Click link in email
- **POST `/api/email/confirm-email`** - Manual confirmation

Both now support:
- ✅ Supabase users
- ✅ Demo/fallback users (in-memory)
- ✅ Automatic redirection to sign-in page with success message

### 3. **Sign-In Protection**

#### All sign-in paths now require email confirmation:
1. **Demo mode sign-in** → Checks `email_confirmed_at`
2. **Supabase sign-in** → Checks `email_confirmed_at`
3. **Fallback sign-in** (dev only) → Checks `email_confirmed_at`
4. **Captcha bypass** (dev only) → Checks `email_confirmed_at`

**Error message when not confirmed**:
```
"Please verify your email before signing in. Check your inbox for the confirmation link."
```

## 📧 Email Confirmation Flow

### New User Signup:
```
1. User signs up with email + password
2. Backend creates user (unconfirmed)
3. Backend sends confirmation email
4. User receives email with link: 
   http://localhost:3001/api/email/confirm-email?email=user@example.com
5. User clicks link
6. Backend confirms email (sets email_confirmed_at timestamp)
7. User redirected to: http://localhost:5173/auth?verified=1
8. User can now sign in
```

### Existing Unconfirmed User:
```
1. User tries to sign up again
2. Backend detects existing unconfirmed user
3. Backend resends confirmation email
4. Returns message: "Account already exists but not confirmed. 
   We've resent the confirmation email."
5. User completes confirmation flow (steps 4-8 above)
```

## 🔧 Files Modified

### Backend Changes:

1. **`backend/routes/auth.js`**
   - Added existing user check before signup
   - Resends confirmation email for unconfirmed users
   - Enforces email confirmation in ALL modes (removed production-only checks)
   - Prevents auto-user creation on sign-in
   - Sends confirmation email in fallback mode
   - Exports `demoUsers`, `demoSessions`, `emailConfirmations` for cross-module use

2. **`backend/routes/email.js`**
   - GET `/confirm-email` now handles demo users
   - POST `/confirm-email` now handles demo users
   - Both redirect to frontend with `?verified=1` parameter

## 🧪 Testing the Fix

### Test 1: New User Signup
```bash
# 1. Sign up new user
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Test@1234"}'

# Expected: 201 Created
# Response: "Account created successfully! Please check your email..."

# 2. Try to sign in BEFORE confirming
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Test@1234"}'

# Expected: 401 Unauthorized
# Response: "Please verify your email before signing in..."

# 3. Check email and click confirmation link
# OR manually confirm:
curl http://localhost:3001/api/email/confirm-email?email=newuser@test.com

# Expected: Redirect to http://localhost:5173/auth?verified=1

# 4. Now sign in
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Test@1234"}'

# Expected: 200 OK with session token
```

### Test 2: Existing Unconfirmed User
```bash
# 1. Try to sign up again with same email
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Test@1234"}'

# Expected: 200 OK (not 409 Conflict)
# Response: "Account already exists but not confirmed. We've resent the confirmation email."

# 2. Email is resent automatically
# 3. User can click new confirmation link
```

### Test 3: Existing Confirmed User
```bash
# After user is confirmed, try signing up again:
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Test@1234"}'

# Expected: 409 Conflict
# Response: "An account with this email already exists. Please sign in instead."
```

## 🎯 Expected Behavior Now

### ✅ Signup Process:
1. **New user** → Creates account → Sends confirmation email → "Check your email"
2. **Unconfirmed user** → Resends confirmation email → "We've resent the confirmation"
3. **Confirmed user** → Error → "Please sign in instead"

### ✅ Sign-In Process:
1. **Unconfirmed user** → Blocked → "Please verify your email"
2. **Confirmed user** → Allowed → Returns session token
3. **Admin with master password** → Always allowed (bypasses confirmation)

### ✅ Email Confirmation:
1. **Click link in email** → Confirms → Redirects to `/auth?verified=1`
2. **User can sign in** → Success

## 🔐 Email Configuration

Make sure these are set in `backend/.env`:

```env
# Required for sending emails
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Backend URL (for email links)
BACKEND_PUBLIC_URL=http://localhost:3001

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

## 📝 Frontend Integration

The frontend should handle the `?verified=1` parameter:

```javascript
// In Auth.jsx or similar
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('verified') === '1') {
    toast.success('Email confirmed! You can now sign in.');
    // Clear the parameter
    window.history.replaceState({}, '', '/auth');
  }
}, []);
```

## 🚀 Summary

**The complete signup → email confirmation → sign-in flow now works correctly:**

1. ✅ Users must confirm email before signing in
2. ✅ Existing unconfirmed users get email resent
3. ✅ Confirmed users are told to sign in
4. ✅ Works in both Supabase and fallback/demo modes
5. ✅ Email confirmation enforced in ALL environments
6. ✅ Clear error messages guide users
7. ✅ Admin override still works (bypasses confirmation)

**Try it now**: Sign up → Check email → Click link → Sign in ✨
