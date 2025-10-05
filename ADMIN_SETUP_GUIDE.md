# Admin Setup and Troubleshooting Guide

## 🔧 Admin Sign-In Configuration

### Step 1: Configure Environment Variables

Add these to your `backend/.env` file:

```env
# Admin Configuration
ADMIN_EMAILS=your_email@gmail.com,another_admin@gmail.com
ADMIN_MASTER_PASSWORD=YourSecureAdminPassword123!

# Make sure these are also set:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Step 2: Admin Login URLs

- **Main App Admin**: Navigate to `http://localhost:5173/admin/auth`
- **Admin Frontend**: Navigate to `http://localhost:5174/auth` (if running admin-frontend separately)

### Step 3: Admin Login Process

1. **Email**: Use one of the emails listed in `ADMIN_EMAILS`
2. **Password**: Use the `ADMIN_MASTER_PASSWORD` you configured
3. The system will bypass normal authentication and grant admin access

## 🔍 Troubleshooting Admin Sign-In

### Issue: "Admin sign-in not working"

**Check these common issues:**

1. **Environment Variables Not Loaded**
   ```bash
   # Restart your backend server after adding ADMIN_EMAILS and ADMIN_MASTER_PASSWORD
   cd backend
   npm run dev
   ```

2. **Wrong Email Format**
   - Email must match EXACTLY what's in `ADMIN_EMAILS` (case-insensitive)
   - Remove any extra spaces
   - Use commas to separate multiple emails

3. **Wrong Password**
   - Password must match EXACTLY what's in `ADMIN_MASTER_PASSWORD`
   - It's case-sensitive

4. **Backend Not Running**
   ```bash
   # Make sure backend is running on port 3001
   cd backend
   npm run dev
   ```

5. **Check Backend Logs**
   - Look for: "Admin sign-in check for [email]"
   - Look for: "isAdminEmail=true, isMasterPassword=true"
   - If both are true, admin login should work

## ✅ Admin Feature Checklist

### User Management Features

#### 1. **View All Users**
- ✅ Active users displayed with green "Active" badge
- ✅ Inactive users displayed with orange "Inactive" badge  
- ✅ Banned users displayed with red "Banned" badge
- ✅ Admin users displayed with purple "Admin/Super Admin/Moderator" badge

#### 2. **Filter Users**
- ✅ All Users - Shows everyone
- ✅ Active - Shows only active users (`is_active = true`)
- ✅ Inactive - Shows only inactive users (`is_active = false`)
- ✅ Banned - Shows only banned users (`is_banned = true`)
- ✅ Admins - Shows users with role: admin, super_admin, or moderator

#### 3. **User Actions**
- ✅ **Activate/Deactivate**: Changes `is_active` status
- ✅ **Ban/Unban**: Sets `banned_until` date (bans for 7 days by default)
- ✅ **Change Role**: user, moderator, admin, super_admin
- ✅ **Reset Password**: Sends password reset email to user

### System Insights Features

#### 1. **Statistics Dashboard**
- ✅ Total users count
- ✅ Email confirmation rate
- ✅ Total dreams count  
- ✅ Public/Private dream ratio
- ✅ Top keywords analysis

#### 2. **Sentiment Analysis**
- ✅ Top emotions detected across all dreams
- ✅ Daily emotion trends
- ✅ Total dreams analyzed

## 🔐 Admin Roles & Permissions

### **Roles (in order of power)**

1. **super_admin** - Full access to everything
2. **admin** - Can manage users and content
3. **moderator** - Can view and moderate content
4. **user** - Regular user (no admin access)

### **Permissions**

| Permission | Super Admin | Admin | Moderator | User |
|-----------|-------------|-------|-----------|------|
| View Users | ✅ | ✅ | ✅ | ❌ |
| Activate/Deactivate Users | ✅ | ✅ | ❌ | ❌ |
| Ban/Unban Users | ✅ | ✅ | ❌ | ❌ |
| Change Roles | ✅ | ✅ | ❌ | ❌ |
| Reset Passwords | ✅ | ✅ | ❌ | ❌ |
| View System Insights | ✅ | ✅ | ✅ | ❌ |
| Moderate Content | ✅ | ✅ | ✅ | ❌ |

## 🧪 Testing Admin Features

### Test 1: Admin Sign-In
```bash
# 1. Set in backend/.env:
ADMIN_EMAILS=test@example.com
ADMIN_MASTER_PASSWORD=TestAdmin123!

# 2. Restart backend
# 3. Go to http://localhost:5173/admin/auth or http://localhost:5174/auth
# 4. Login with:
Email: test@example.com
Password: TestAdmin123!

# Expected: Redirect to admin dashboard
```

### Test 2: User Status Management
```
1. Login as admin
2. Go to Users tab
3. Find a user
4. Click "Manage" 
5. Click "Deactivate" - should show "Inactive" badge
6. Click "Activate" - should show "Active" badge
```

### Test 3: Ban/Unban Users
```
1. Login as admin
2. Find a user
3. Click "Ban" - should show "Banned" badge
4. Filter by "Banned" - user should appear
5. Click "Unban" - "Banned" badge should disappear
```

### Test 4: Role Management
```
1. Login as admin
2. Find a regular user
3. Change role to "admin"
4. Filter by "Admins" - user should appear with admin badge
```

## 🐛 Common Errors & Solutions

### Error: "Admin access required"
**Solution**: Make sure your email is in `ADMIN_EMAILS` environment variable

### Error: "Invalid credentials"
**Solution**: Check that password matches `ADMIN_MASTER_PASSWORD` exactly

### Error: "Failed to fetch users"
**Solution**: 
1. Check Supabase connection
2. Run database migration to create `user_profiles` table
3. Backend will auto-fallback to demo users if DB unavailable

### Error: Users not showing correct status
**Solution**: The system stores user status in two places:
1. `user_profiles` table (primary)
2. `auth.users.user_metadata` (fallback)

If `user_profiles` table doesn't exist, status is stored in metadata.

## 📋 Quick Fix Commands

### Fix 1: Restart Everything
```bash
# Stop all processes
# Then:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Main Frontend  
cd Dream_journey_analyzer
npm run dev

# Terminal 3 - Admin Frontend (optional)
cd admin-frontend
npm run dev
```

### Fix 2: Check Environment Variables
```bash
# In backend directory
cat .env | grep ADMIN

# Should show:
# ADMIN_EMAILS=your_email@gmail.com
# ADMIN_MASTER_PASSWORD=YourPassword123!
```

### Fix 3: Test Admin Auth Endpoint
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_admin_email@gmail.com",
    "password": "YourAdminPassword123!"
  }'

# Expected response:
# {
#   "success": true,
#   "isAdmin": true,
#   "user": {...},
#   "session": {...}
# }
```

## 🎯 Expected Behavior

### When Admin Signs In:
1. Backend checks if email is in `ADMIN_EMAILS` ✅
2. Backend checks if password matches `ADMIN_MASTER_PASSWORD` ✅
3. Creates session with `isAdmin: true` flag ✅
4. Redirects to `/admin` dashboard ✅
5. Admin can see user management UI ✅

### User List Should Show:
- **Green Badge** = Active user (can sign in)
- **Orange Badge** = Inactive user (cannot sign in, account disabled)
- **Red Badge** = Banned user (banned until specific date)
- **Purple Badge** = Admin role (admin/super_admin/moderator)

All badges can appear together (e.g., Active + Admin user will have both green and purple badges)

## 📞 Support

If admin features still not working after following this guide:
1. Check backend console logs for error messages
2. Verify `.env` file has all required variables
3. Ensure backend is running on port 3001
4. Clear browser cache and localStorage
5. Try incognito/private window

## 🔄 Database Schema (Reference)

The `user_profiles` table should have:
```sql
- user_id (uuid, primary key)
- role (text: 'user', 'moderator', 'admin', 'super_admin')
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

Ban status is stored in `auth.users.banned_until` field.
