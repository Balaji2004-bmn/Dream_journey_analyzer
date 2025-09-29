# Email Setup Guide for Dream Journey Analyzer

## Quick Setup Instructions

### 1. Gmail App Password Setup

To send emails from the Dream Journey Analyzer, you need to set up Gmail App Passwords:

1. **Enable 2-Factor Authentication** on your Gmail account (if not already enabled)
2. Go to your Google Account settings: https://myaccount.google.com/
3. Navigate to **Security** → **2-Step Verification**
4. Scroll down to **App passwords**
5. Click **Select app** → Choose **Mail**
6. Click **Select device** → Choose **Other (custom name)**
7. Enter "Dream Journey Analyzer" as the name
8. Click **Generate**
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### 2. Update Backend .env File

Open your `backend/.env` file and update these lines:

```env
# Replace with your actual Gmail address
EMAIL_USER=your_actual_email@gmail.com

# Replace with the 16-character app password from step 1
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Important Notes:**
- Use your actual Gmail address (not a placeholder)
- Use the 16-character app password (not your regular Gmail password)
- Remove any spaces from the app password when copying

### 3. Test the Email System

1. Start your backend server: `npm run dev` (in backend folder)
2. Start your frontend: `npm run dev` (in main folder)
3. Go to the Gallery page
4. Try to access a private video
5. The email verification modal should appear
6. Click "Send Confirmation Email"

### 4. Expected Behavior

**With Proper Gmail Credentials:**
- You'll receive a beautiful confirmation email
- The system will automatically mark your email as verified
- You'll get access to private videos

**Without Proper Gmail Credentials (Demo Mode):**
- The system will show "Demo mode" messages
- Email verification will work automatically without sending real emails
- You'll still get access to all features

### 5. Troubleshooting

**Error: "Email service is not configured"**
- Check that EMAIL_USER and EMAIL_PASSWORD are set in backend/.env
- Make sure you're not using placeholder values like "your_gmail_address@gmail.com"

**Error: "Authentication failed"**
- Make sure you're using an App Password, not your regular Gmail password
- Verify that 2-Factor Authentication is enabled on your Gmail account
- Double-check that the app password is copied correctly (no spaces)

**Error: "Less secure app access"**
- This shouldn't happen with App Passwords, but if it does, use App Passwords instead

### 6. Security Best Practices

- Never commit your .env file to version control
- Use App Passwords instead of your main Gmail password
- Consider using a dedicated Gmail account for the application
- Regularly rotate your app passwords

## Current System Features

✅ **Working Features:**
- Simple email confirmation (no verification codes needed)
- Beautiful HTML email templates
- Demo mode fallback when email isn't configured
- Automatic email verification for private video access
- Error handling and user feedback

✅ **Email Types Supported:**
- Email confirmation for private video access
- Dream video sharing via email
- Dream analysis reports via email

The system is now much simpler and more reliable - no more verification codes to manage!
