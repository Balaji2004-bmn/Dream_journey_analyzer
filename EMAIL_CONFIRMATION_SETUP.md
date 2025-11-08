# 📧 Email Confirmation Setup Guide

Complete guide to setting up email confirmation for user signups.

---

## ✅ What Changed

Email confirmation is now **REQUIRED** for all users:
- ✅ Users must verify email before signing in
- ✅ Confirmation email sent automatically on signup
- ✅ Secure token-based verification
- ✅ 24-hour expiration for confirmation links

---

## 🔧 Configuration Required

### Step 1: Configure Email Service

You need to set up an email service to send confirmation emails.

**Recommended: Gmail with App Password**

#### Get Gmail App Password:

1. **Enable 2-Factor Authentication** on your Google account
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Create App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to Backend `.env`:**

```env
# Email Configuration (REQUIRED)
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16-char app password (with spaces)
```

---

### Step 2: Configure Backend Environment

**File: `backend/.env`**

```env
# Email Service (REQUIRED)
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Backend URL (for confirmation links)
BACKEND_PUBLIC_URL=http://localhost:3001

# Frontend URL (for redirects after confirmation)
FRONTEND_URL=http://localhost:5173

# Optional: Email confirmation settings
EMAIL_CONFIRMATION_EXPIRY=24  # Hours (default: 24)
```

---

### Step 3: Restart Backend

```bash
cd backend
npm run dev
```

**Check logs for:**
```
✅ Email service configured
✅ Confirmation emails will be sent
```

---

## 📬 How Email Confirmation Works

### User Flow:

1. **User Signs Up**
   - Enters email and password
   - Clicks "Sign Up"

2. **Account Created (Unconfirmed)**
   - User record created in database
   - `email_confirmed_at: null`
   - Confirmation token generated

3. **Email Sent**
   - Confirmation email sent to user
   - Contains unique verification link
   - Link expires in 24 hours

4. **User Clicks Link**
   - Opens email
   - Clicks confirmation link
   - Redirected to backend endpoint

5. **Email Verified**
   - Backend validates token
   - Sets `email_confirmed_at` timestamp
   - Redirects to frontend with success message

6. **User Can Sign In**
   - Now able to log in
   - Access granted to app

---

## 📧 Email Template

The confirmation email looks like this:

```
Subject: Confirm Your Email - Dream Journey Analyzer

Hi there!

Thank you for signing up for Dream Journey Analyzer!

Please confirm your email address by clicking the link below:

[Confirm Email]
http://localhost:3001/api/auth/confirm?token=abc123...

This link will expire in 24 hours.

If you didn't create this account, you can safely ignore this email.

Best regards,
Dream Journey Analyzer Team
```

---

## 🔗 Confirmation Endpoint

**Backend endpoint:**
```
GET /api/auth/confirm?token=CONFIRMATION_TOKEN
```

**What it does:**
1. Validates token
2. Checks expiration (24 hours)
3. Marks email as confirmed
4. Redirects to frontend

**Frontend redirect:**
```
http://localhost:5173/auth?verified=1
```

---

## 🧪 Testing Email Confirmation

### Test Flow:

1. **Start Backend:**
```bash
cd backend
npm run dev
```

2. **Start Frontend:**
```bash
npm run dev
```

3. **Sign Up:**
   - Go to `http://localhost:5173/auth`
   - Click "Sign Up" tab
   - Enter: `test@example.com` / `Test@123`
   - Click "Sign Up"

4. **Check Backend Console:**
```
✅ Confirmation email sent to test@example.com
📧 Confirmation link: http://localhost:3001/api/auth/confirm?token=abc123...
```

5. **Click Link in Console:**
   - Copy the confirmation link from console
   - Paste in browser
   - Should redirect to frontend with success message

6. **Sign In:**
   - Go back to `/auth`
   - Click "Sign In" tab
   - Enter same credentials
   - ✅ Should work!

---

## 🔍 Troubleshooting

### Issue 1: Email Not Sent

**Check backend console for:**
```
❌ Email service not configured
❌ Failed to send confirmation email
```

**Fix:**

1. **Verify `.env` configuration:**
```bash
cd backend
grep EMAIL .env
```

Should show:
```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

2. **Test email credentials:**
```bash
# Backend will log on startup:
✅ Email service configured
# OR
❌ Email service not configured - using console logging
```

3. **Check Gmail settings:**
   - 2FA enabled
   - App password created
   - Less secure app access NOT needed (app password bypasses this)

### Issue 2: Confirmation Link Not Working

**Error:** `Invalid or expired token`

**Possible causes:**

1. **Token expired (24 hours):**
   - Sign up again to get new token

2. **Token already used:**
   - Can only confirm once
   - Try signing in

3. **Token not found:**
   - Check backend logs
   - Verify token in database

**Fix:**

Resend confirmation email:
```bash
# Use resend endpoint
POST /api/email/send-confirmation
{
  "email": "user@example.com"
}
```

### Issue 3: User Can't Sign In After Confirming

**Error:** `Email Not Verified`

**Fix:**

1. **Check if confirmation actually worked:**
```bash
# Check backend logs after clicking link:
✅ Email confirmed for: user@example.com
```

2. **Verify in database:**
   - Check `email_confirmed_at` field is not null

3. **Try clicking confirmation link again**

4. **As last resort, manually confirm in database:**
```sql
-- In Supabase SQL editor
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'user@example.com';
```

### Issue 4: Emails Go to Spam

**Fix:**

1. **Use proper FROM address:**
```javascript
// In backend email config
from: '"Dream Journey" <noreply@yourdomain.com>'
```

2. **Add SPF/DKIM records** (for production)

3. **Ask users to check spam folder**

4. **Use transactional email service:**
   - SendGrid
   - AWS SES
   - Mailgun

---

## 🚀 Alternative Email Services

### Using SendGrid

```bash
npm install @sendgrid/mail
```

```env
# backend/.env
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

```javascript
// backend/routes/auth.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: email,
  from: process.env.EMAIL_FROM,
  subject: 'Confirm Your Email',
  html: confirmationEmailHTML
};

await sgMail.send(msg);
```

### Using AWS SES

```bash
npm install aws-sdk
```

```env
# backend/.env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
EMAIL_FROM=noreply@yourdomain.com
```

### Using Mailgun

```bash
npm install mailgun-js
```

```env
# backend/.env
MAILGUN_API_KEY=your_api_key
MAILGUN_DOMAIN=mg.yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
```

---

## 📝 Email Templates

### Customize Confirmation Email

**File: `backend/routes/auth.js`** (around line 120-140)

```javascript
const confirmationURL = `${process.env.BACKEND_PUBLIC_URL}/api/auth/confirm?token=${confirmationToken}`;

const mailOptions = {
  from: '"Dream Journey" <noreply@yourdomain.com>',
  to: email,
  subject: 'Confirm Your Email - Dream Journey Analyzer',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; 
                  background: #667eea; color: white; text-decoration: none; 
                  border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Dream Journey Analyzer</h1>
        </div>
        <div class="content">
          <h2>Confirm Your Email</h2>
          <p>Hi there!</p>
          <p>Thank you for signing up for Dream Journey Analyzer!</p>
          <p>Please confirm your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${confirmationURL}" class="button">Confirm Email Address</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; font-size: 12px; color: #666;">
            ${confirmationURL}
          </p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 Dream Journey Analyzer. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
};
```

---

## 🔄 Resend Confirmation Email

### Endpoint

```
POST /api/email/send-confirmation
{
  "email": "user@example.com"
}
```

### Frontend Implementation

```javascript
const resendConfirmation = async (email) => {
  try {
    const response = await fetch('/api/email/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (response.ok) {
      toast.success('Confirmation email sent! Check your inbox.');
    }
  } catch (error) {
    toast.error('Failed to send confirmation email');
  }
};
```

---

## ✅ Production Checklist

Before going live:

- [ ] Email service configured (Gmail/SendGrid/SES)
- [ ] Email credentials in backend `.env`
- [ ] Test confirmation flow end-to-end
- [ ] Customize email template with your branding
- [ ] Set proper FROM address (noreply@yourdomain.com)
- [ ] Configure SPF/DKIM records for domain
- [ ] Test emails don't go to spam
- [ ] Set appropriate `BACKEND_PUBLIC_URL`
- [ ] Set appropriate `FRONTEND_URL`
- [ ] Monitor email delivery rates
- [ ] Set up resend functionality

---

## 📊 Monitoring

### Check Email Status

**Backend logs will show:**
```
✅ Confirmation email sent to: user@example.com
✅ Email confirmed for: user@example.com
❌ Failed to send email: Error message
⚠️ Confirmation token expired for: user@example.com
```

### Database Queries

```sql
-- Users awaiting confirmation
SELECT email, created_at 
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- Recently confirmed users
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email_confirmed_at > NOW() - INTERVAL '24 hours';

-- Expired confirmations (>24 hours, not confirmed)
SELECT email, created_at 
FROM auth.users 
WHERE email_confirmed_at IS NULL 
  AND created_at < NOW() - INTERVAL '24 hours';
```

---

## 🎯 Summary

**Email confirmation is now enabled:**

1. ✅ **Setup:** Configure Gmail app password in `backend/.env`
2. ✅ **Signup:** Users receive confirmation email
3. ✅ **Verify:** Users click link to confirm email
4. ✅ **Signin:** Users can then sign in successfully

**Quick test:**
```bash
# 1. Start backend
cd backend && npm run dev

# 2. Sign up at /auth
# 3. Check backend console for confirmation link
# 4. Click link
# 5. Sign in ✅
```

---

**Need help? Check the troubleshooting section or backend logs!** 📧✨
