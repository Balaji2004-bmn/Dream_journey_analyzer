# 🗄️ Database Setup Guide - Supabase

## 📋 **Step-by-Step Database Setup**

### 1. **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `dream-journey-analyzer`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
6. Click "Create new project"
7. Wait for the project to be ready (2-3 minutes)

### 2. **Get Your Project Credentials**
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

### 3. **Update Environment Variables**
Update your `.env` files with the credentials:

**Frontend (.env):**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_BACKEND_URL=http://localhost:3002
```

**Backend (.env):**
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
OPENAI_API_KEY=your-openai-key-here
FRONTEND_URL=http://localhost:5174
PORT=3002
```

### 4. **Create Database Tables**
1. Go to **SQL Editor** in your Supabase dashboard
2. Run each SQL script in this order:

#### **Step 4a: Create Dreams Table**
```sql
-- Copy and paste the entire content of create-dreams-table.sql
-- This creates the main dreams table with RLS policies
```

#### **Step 4b: Create Demo Dreams Table**
```sql
-- Copy and paste the entire content of create-demo-dreams-table.sql
-- This creates the demo dreams table for the gallery
```

#### **Step 4c: Insert Demo Data**
```sql
-- Copy and paste the entire content of insert-demo-data.sql
-- This adds sample dream data to the gallery
```

### 5. **Verify Tables Created**
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - ✅ `dreams` - User-generated dreams
   - ✅ `demo_dreams` - Gallery demo content
   - ✅ `auth.users` - User authentication (auto-created)

### 6. **Test Database Connection**
1. Start your application: `npm run dev:full`
2. Go to http://localhost:5174
3. Try to sign up for a new account
4. Try to analyze a dream
5. Check if data appears in Supabase Table Editor

## 🔧 **Troubleshooting**

### **Issue: Tables Not Creating**
**Possible Causes:**
1. **Wrong SQL Editor**: Make sure you're in the SQL Editor, not Table Editor
2. **Permission Issues**: Ensure you're logged in as project owner
3. **Syntax Errors**: Check for any SQL syntax issues
4. **RLS Conflicts**: Some policies might conflict

**Solutions:**
1. **Clear and Recreate**:
   ```sql
   -- Drop tables if they exist
   DROP TABLE IF EXISTS dreams CASCADE;
   DROP TABLE IF EXISTS demo_dreams CASCADE;
   
   -- Then run the create scripts again
   ```

2. **Check RLS Policies**:
   ```sql
   -- Check existing policies
   SELECT * FROM pg_policies WHERE tablename = 'dreams';
   ```

### **Issue: Authentication Not Working**
**Check:**
1. Environment variables are correct
2. Supabase project is active
3. API keys are valid
4. CORS settings allow your domain

### **Issue: Data Not Saving**
**Check:**
1. RLS policies are correct
2. User is authenticated
3. Table structure matches the code
4. No JavaScript errors in browser console

## 📊 **Database Schema**

### **dreams Table**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- title (TEXT)
- content (TEXT)
- thumbnail_url (TEXT)
- video_url (TEXT)
- analysis (JSONB)
- is_public (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **demo_dreams Table**
```sql
- id (UUID, Primary Key)
- title (TEXT)
- content (TEXT)
- thumbnail_url (TEXT)
- video_url (TEXT)
- analysis (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🚀 **Quick Test Commands**

### **Test Database Connection**
```sql
-- Run this in SQL Editor to test connection
SELECT 'Database connected successfully' as status;
```

### **Check Tables Exist**
```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('dreams', 'demo_dreams');
```

### **Check RLS Policies**
```sql
-- Check RLS policies for dreams table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'dreams';
```

## ✅ **Success Indicators**

You'll know the database is working when:
- ✅ Tables appear in Table Editor
- ✅ You can sign up for new accounts
- ✅ Dreams can be saved and retrieved
- ✅ Gallery shows demo dreams
- ✅ No errors in browser console
- ✅ Data persists after page refresh

## 🆘 **Still Having Issues?**

If tables still aren't creating:
1. **Check Supabase Status**: Visit [status.supabase.com](https://status.supabase.com)
2. **Verify Project**: Make sure your project is active and not paused
3. **Check Logs**: Look at Supabase logs for any errors
4. **Contact Support**: Use Supabase support if needed

The database setup should work with these steps. Let me know if you encounter any specific errors!
