# Email Production Setup Guide

## Overview
This guide explains how to configure real email sending for the Dream Journey Analyzer application.

## Gmail App Password Setup

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled

### 2. Generate App Password
1. Go to Security → 2-Step Verification → App passwords
2. Select "Mail" as the app
3. Select "Other" as the device and name it "Dream Journey Analyzer"
4. Copy the 16-character app password (format: xxxx xxxx xxxx xxxx)

### 3. Configure Backend Environment
Create or update `backend/.env` file:

```env
# Email Configuration
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
```

**Important**: Use the app password, NOT your regular Gmail password.

## Email Features

### 1. Dream Video Sharing
- **Endpoint**: `POST /api/email/send-dream-video`
- **Authentication**: Required (user must be logged in)
- **Usage**: Sends dream video and analysis to user's email or specified email
- **Demo Mode**: Works without configuration for testing

### 2. Email Verification for Private Videos
- **Send Code**: `POST /api/email/send-verification`
- **Verify Code**: `POST /api/email/verify-code`
- **Authentication**: Required
- **Demo Code**: "123456" or any 6-digit number works in demo mode

## Testing

### Demo Mode (No Configuration Required)
- All email endpoints return success responses
- No actual emails are sent
- Use verification code "123456" for testing
- Perfect for development and testing

### Production Mode (With Gmail Configuration)
- Real emails are sent to users
- Verification codes are randomly generated
- Professional HTML email templates
- Proper error handling and logging

## Security Notes

1. **Never commit email credentials to version control**
2. **Use environment variables for all sensitive data**
3. **App passwords are safer than regular passwords**
4. **Monitor email usage to avoid Gmail limits**

## Troubleshooting

### Common Issues

1. **"Email Configuration Error"**
   - Check EMAIL_USER and EMAIL_PASSWORD in .env
   - Verify app password is correct (16 characters)
   - Ensure 2FA is enabled on Gmail account

2. **"Authentication failed"**
   - Regenerate app password
   - Check for typos in email address
   - Verify Gmail account is accessible

3. **Emails not received**
   - Check spam/junk folder
   - Verify recipient email address
   - Check Gmail sending limits

### Gmail Limits
- **Daily limit**: 500 emails per day
- **Rate limit**: 100 emails per hour
- **Recipients**: 500 unique recipients per day

## Email Templates

The application includes beautiful HTML email templates for:
- Dream video sharing with analysis
- Email verification codes
- Dream analysis summaries

All templates are responsive and include:
- Professional styling
- Dream content and analysis
- Video links and thumbnails
- Verification codes with instructions
