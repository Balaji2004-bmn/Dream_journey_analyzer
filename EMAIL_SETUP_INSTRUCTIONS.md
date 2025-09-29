# Email Configuration Setup Instructions

## Overview
The Dream Journey Analyzer requires real email configuration to send verification codes and password reset emails. Demo mode has been removed to ensure proper security.

## Required Setup

### 1. Gmail App Password Setup
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification (enable if not already)
3. Go to Security → App passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character app password (spaces will be removed automatically)

### 2. Backend Environment Configuration
Create or update `backend/.env` file with:

```env
# Email Configuration (REQUIRED)
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASSWORD=your_16_character_app_password

# Admin Configuration (REQUIRED for admin access)
ADMIN_EMAILS=your_admin_email@gmail.com,another_admin@gmail.com

# Other required variables
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Admin Access Setup
- Add your email address to the `ADMIN_EMAILS` environment variable
- Multiple emails can be separated by commas
- These emails will have super admin privileges

## Testing Email Configuration

### Test Email Sending
1. Start the backend server: `cd backend && npm start`
2. Try signing up with a new account
3. Check if verification email is received
4. If you get "Email Not Configured" error, verify your EMAIL_USER and EMAIL_PASSWORD

### Test Admin Access
1. Sign up with an email listed in ADMIN_EMAILS
2. Go to `/admin-auth` and sign in
3. You should be able to access the admin dashboard

## Common Issues

### "Email Not Configured" Error
- Verify EMAIL_USER is set to your actual Gmail address
- Verify EMAIL_PASSWORD is set to your app password (not regular password)
- Restart the backend server after changing .env

### "Admin access required" Error
- Ensure your email is listed in ADMIN_EMAILS environment variable
- Check that there are no typos in the email address
- Restart the backend server after changing .env

### Gmail Authentication Errors
- Ensure 2-Step Verification is enabled on your Google account
- Use App Password, not your regular Gmail password
- Check that the app password is exactly 16 characters

## Security Notes
- Never commit the `.env` file to version control
- Use strong, unique app passwords
- Regularly rotate app passwords
- Monitor admin access logs

## Next Steps
1. Configure email credentials in backend/.env
2. Add admin emails to ADMIN_EMAILS
3. Restart backend server
4. Test complete authentication flow
