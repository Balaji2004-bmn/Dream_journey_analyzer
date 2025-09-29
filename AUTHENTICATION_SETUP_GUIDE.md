# Authentication Setup Guide

## 🔧 Setup Instructions

### 1. Create Backend Environment File

**Copy the content from `BACKEND_ENV_CONTENT.txt` to `backend/.env`:**

```bash
# Navigate to backend directory
cd backend

# Create .env file and copy the content from BACKEND_ENV_CONTENT.txt
# The file should contain all your Supabase credentials, email settings, and admin configuration
```

### 2. Verify Email Configuration

Your Gmail credentials are configured:
- **EMAIL_USER**: `b80003365@gmail.com`
- **EMAIL_PASSWORD**: `njqr mhxp usgh zokw` (App Password)

### 3. Admin Configuration

Admin email is set to: `bmn636169@gmail.com`

## 🔍 Fixed Authentication Issues

### ✅ Password Confirmation
- Added "Confirm Password" field to signup form
- Real-time password matching validation
- Visual feedback (green/red indicators)
- Prevents signup if passwords don't match

### ✅ Strong Password Validation
- Requires 8+ characters
- Must include: uppercase, lowercase, number, special character
- Clear error messages explaining requirements
- Client-side and server-side validation

### ✅ Email Verification System
- Proper backend configuration checking
- Real email sending with your Gmail credentials
- 6-digit verification codes stored in database
- 10-minute expiration time
- No more demo mode fallbacks

### ✅ Admin Authentication
- Proper admin email validation against ADMIN_EMAILS environment variable
- Two-step admin login: Supabase auth + backend admin verification
- Clear error messages for access denied scenarios
- Admin dashboard access control

### ✅ Signin Improvements
- Better error handling for invalid credentials
- Email verification prompts for unverified accounts
- Clear feedback for different error scenarios
- Proper session management

## 🚀 How to Test

### 1. Start the Backend
```bash
cd backend
npm start
# Should run on http://localhost:3001
```

### 2. Start the Frontend
```bash
npm run dev
# Should run on http://localhost:5173
```

### 3. Test Signup Flow
1. Go to `/auth`
2. Click "Sign Up" tab
3. Enter email and password (must meet requirements)
4. Confirm password (must match)
5. Submit form
6. Check email for verification code
7. Enter verification code in modal

### 4. Test Signin Flow
1. Use registered email and password
2. If email not verified, you'll be prompted to verify
3. Successful signin redirects to dashboard

### 5. Test Admin Login
1. Go to `/admin-auth`
2. Use admin email: `bmn636169@gmail.com`
3. Use the same password as regular account
4. System verifies admin permissions
5. Redirects to admin dashboard

## 🔧 Environment Variables Required

### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://lfrdehertkpypwuydcgn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Backend (.env)
```
PORT=3001
SUPABASE_URL=https://lfrdehertkpypwuydcgn.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
EMAIL_USER=b80003365@gmail.com
EMAIL_PASSWORD=njqr mhxp usgh zokw
ADMIN_EMAILS=bmn636169@gmail.com
```

## 🐛 Troubleshooting

### Email Not Sending
- Verify Gmail App Password is correct
- Check backend/.env file exists and has EMAIL_USER/EMAIL_PASSWORD
- Restart backend server after adding .env

### Admin Login Failed
- Ensure ADMIN_EMAILS includes your email
- Verify backend/.env file exists
- Check backend server is running on port 3001

### Password Issues
- Must be 8+ characters
- Must include: A-Z, a-z, 0-9, special character
- Confirm password must match exactly

### Database Connection
- Verify Supabase credentials in backend/.env
- Check SUPABASE_SERVICE_KEY is the service_role key (not anon key)
