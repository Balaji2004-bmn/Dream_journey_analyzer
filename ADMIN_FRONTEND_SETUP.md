# 🔐 Admin Frontend Setup Guide

Complete guide to running your Dream Journey Analyzer admin dashboard.

---

## 📋 What is the Admin Frontend?

The admin frontend is a separate dashboard for:
- ✅ **User Management** - View, edit, delete users
- ✅ **Content Moderation** - Review dreams, videos
- ✅ **Analytics** - User stats, engagement metrics
- ✅ **Subscription Management** - View/manage subscriptions
- ✅ **System Settings** - Configure app settings

---

## 🚀 Quick Start

### Step 1: Navigate to Admin Frontend

```bash
cd admin-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

**This installs:**
- React
- Vite
- React Router
- Recharts (for analytics)
- All UI components

### Step 3: Configure Environment Variables

**Create `.env` file in `admin-frontend/` directory:**

```bash
# Copy from example
cp .env.example .env
```

**Edit `admin-frontend/.env`:**

```env
# Backend API
VITE_BACKEND_URL=http://localhost:3001/api
VITE_ADMIN_PORT=5174

# Supabase (same as main app)
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Settings
VITE_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### Step 4: Start Backend Server

**Admin frontend needs backend running:**

```bash
# In separate terminal
cd backend
npm run dev
```

**Wait for:**
```
✅ Server running on port 3001
✅ Admin routes initialized
```

### Step 5: Start Admin Frontend

```bash
cd admin-frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: http://192.168.1.100:5174/
  ➜  press h + enter to show help
```

### Step 6: Access Admin Dashboard

**Open in browser:**
```
http://localhost:5174
```

**Or on network:**
```
http://YOUR_IP:5174
```

### Step 7: Login as Admin

**Use admin credentials configured in backend:**

```
Email: admin@example.com
Password: YOUR_ADMIN_MASTER_PASSWORD
```

**From `backend/.env`:**
```env
ADMIN_EMAILS=admin@example.com
ADMIN_MASTER_PASSWORD=your_secure_admin_password
```

---

## 🔧 Configuration

### Backend Configuration

**File: `backend/.env`**

```env
# Admin Configuration
ADMIN_EMAILS=admin@example.com,another.admin@example.com
ADMIN_MASTER_PASSWORD=SecureAdminPass123!

# Server Ports
PORT=3001
ADMIN_PORT=5174

# Admin Frontend URL (for CORS)
ADMIN_URL=http://localhost:5174
```

### Frontend Configuration

**File: `admin-frontend/.env`**

```env
# Backend API
VITE_BACKEND_URL=http://localhost:3001/api

# Admin Port
VITE_ADMIN_PORT=5174

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Admin Emails (comma-separated)
VITE_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

---

## 🎯 Admin Features

### 1. Dashboard

**URL:** `/admin`

**Features:**
- User statistics
- Dream analytics
- Revenue metrics
- System health

### 2. User Management

**URL:** `/admin/users`

**Features:**
- View all users
- Search/filter users
- Edit user details
- Delete users
- View user activity
- Manage subscriptions

### 3. Content Moderation

**URL:** `/admin/content`

**Features:**
- Review dreams
- Moderate videos
- Flag inappropriate content
- Approve/reject content

### 4. Analytics

**URL:** `/admin/analytics`

**Features:**
- User growth charts
- Engagement metrics
- Revenue analytics
- Dream generation stats

### 5. Settings

**URL:** `/admin/settings`

**Features:**
- System configuration
- API key management
- Email templates
- Feature flags

---

## 🔐 Admin Access Control

### How Admin Authentication Works

1. **Admin Emails** defined in backend `.env`:
   ```env
   ADMIN_EMAILS=admin@example.com
   ```

2. **Master Password** for quick admin access:
   ```env
   ADMIN_MASTER_PASSWORD=YourSecurePassword123!
   ```

3. **Login Flow:**
   - Enter admin email + master password
   - Backend verifies email is in ADMIN_EMAILS list
   - Backend checks password matches ADMIN_MASTER_PASSWORD
   - Returns session with `isAdmin: true` flag

### Creating Admin Users

**Method 1: Master Password (Quickest)**

```env
# In backend/.env
ADMIN_EMAILS=your.email@example.com
ADMIN_MASTER_PASSWORD=SecurePassword123!
```

**Then login with:**
- Email: `your.email@example.com`
- Password: `SecurePassword123!`

**Method 2: Regular Signup + Add to List**

1. Sign up normally at `/auth`
2. Add email to `ADMIN_EMAILS` in backend `.env`
3. Restart backend
4. Login with regular password
5. Admin access granted automatically

---

## 🎨 UI Components

Admin frontend uses:
- **shadcn/ui** - Modern UI components
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Beautiful icons
- **Recharts** - Charts and graphs
- **React Router** - Navigation

---

## 🐛 Troubleshooting

### Issue 1: Admin Dashboard Won't Load

**Error:** `Cannot connect to backend`

**Fix:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check CORS settings in backend:**
   ```javascript
   // backend/server.js
   app.use(cors({
     origin: [
       'http://localhost:5173',
       'http://localhost:5174', // ✅ Admin frontend
     ]
   }));
   ```

3. **Check admin frontend `.env`:**
   ```env
   VITE_BACKEND_URL=http://localhost:3001/api
   ```

### Issue 2: Login Failed

**Error:** `Invalid credentials` or `Not authorized`

**Fix:**

1. **Check email is in ADMIN_EMAILS:**
   ```bash
   cd backend
   grep ADMIN_EMAILS .env
   ```

2. **Check password matches ADMIN_MASTER_PASSWORD:**
   ```bash
   grep ADMIN_MASTER_PASSWORD .env
   ```

3. **Try exact credentials:**
   ```
   Email: admin@example.com
   Password: (exact value from .env)
   ```

4. **Restart backend after changing .env:**
   ```bash
   cd backend
   npm run dev
   ```

### Issue 3: Port Already in Use

**Error:** `Port 5174 is already in use`

**Fix:**

1. **Kill existing process:**
   ```bash
   # Windows
   netstat -ano | findstr :5174
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -ti:5174 | xargs kill -9
   ```

2. **Or use different port:**
   ```env
   # admin-frontend/.env
   VITE_ADMIN_PORT=5175
   ```

### Issue 4: API Calls Failing

**Error:** `401 Unauthorized` on admin routes

**Fix:**

1. **Check admin session is valid:**
   - Look for `isAdmin: true` in session
   - Check browser localStorage/cookies

2. **Verify backend admin routes:**
   ```bash
   curl http://localhost:3001/api/admin/users \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check backend logs** for auth errors

---

## 📂 Project Structure

```
admin-frontend/
├── package.json          # Dependencies
├── .env                  # Environment variables (create this!)
├── .env.example          # Example env file
├── vite.config.js        # Vite configuration
├── index.html           # HTML entry point
├── src/
│   ├── main.jsx         # App entry
│   ├── App.jsx          # Main app component
│   ├── pages/           # Admin pages
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Analytics.jsx
│   │   └── Settings.jsx
│   ├── components/      # Reusable components
│   │   ├── AdminNav.jsx
│   │   ├── UserTable.jsx
│   │   └── StatCard.jsx
│   ├── hooks/           # Custom hooks
│   │   └── useAdmin.js
│   └── lib/             # Utilities
│       └── api.js
└── public/              # Static assets
```

---

## 🔄 Development Workflow

### Making Changes

1. **Edit code** in your IDE
2. **Save file** → Hot reload
3. **Changes appear** immediately
4. **Check console** for errors

### Building for Production

```bash
# Build
npm run build

# Preview build
npm run preview

# Deploy
# Copy dist/ folder to your server
```

---

## 🚀 Running Both Apps Together

### Option 1: Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Main Frontend:**
```bash
npm run dev
```

**Terminal 3 - Admin Frontend:**
```bash
cd admin-frontend
npm run dev
```

**Terminal 4 - Mobile App (optional):**
```bash
cd mobile_app
npm start
```

### Option 2: Single Command (Using concurrently)

**Install concurrently:**
```bash
npm install -g concurrently
```

**Create script in root `package.json`:**
```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\" \"npm run dev:admin\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "npm run dev",
    "dev:admin": "cd admin-frontend && npm run dev"
  }
}
```

**Run all:**
```bash
npm run dev:all
```

---

## 🌐 Access URLs

When running, your apps will be available at:

```
Main App:     http://localhost:5173
Admin App:    http://localhost:5174
Backend API:  http://localhost:3001/api
Mobile App:   exp://YOUR_IP:8081
```

---

## 🎯 Admin Routes

### Public Routes (No Auth Required)
- `/admin/login` - Admin login page

### Protected Routes (Admin Only)
- `/admin` - Dashboard
- `/admin/users` - User management
- `/admin/content` - Content moderation
- `/admin/analytics` - Analytics dashboard
- `/admin/subscriptions` - Subscription management
- `/admin/settings` - System settings
- `/admin/logs` - System logs

---

## ✅ Checklist

Before running admin frontend:

- [ ] Node.js installed
- [ ] Dependencies installed in `admin-frontend/`
- [ ] `.env` file created in `admin-frontend/`
- [ ] Backend server running on port 3001
- [ ] Admin credentials configured in `backend/.env`
- [ ] Port 5174 is available
- [ ] CORS configured for admin URL

---

## 🎓 Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test
```

---

## 🔒 Security Best Practices

1. **Strong Admin Password:**
   ```env
   ADMIN_MASTER_PASSWORD=Use_A_Very_Strong_Password_123!@#
   ```

2. **Limit Admin Emails:**
   ```env
   # Only add trusted emails
   ADMIN_EMAILS=trusted.admin@company.com
   ```

3. **Use HTTPS in Production:**
   ```env
   VITE_BACKEND_URL=https://your-api.com/api
   ```

4. **Don't commit `.env` files:**
   - Already in `.gitignore`
   - Never push to GitHub

5. **Rotate Admin Passwords Regularly**

6. **Monitor Admin Access Logs**

---

## 📊 Admin Dashboard Features

### User Management
- View all users
- Search by email/name
- Filter by subscription status
- Sort by join date, activity
- View user details
- Edit user profile
- Delete/ban users

### Analytics
- Total users
- Active users (last 7/30 days)
- Dream generation stats
- Video generation stats
- Revenue metrics
- Growth charts

### Content Moderation
- Review flagged content
- Approve/reject dreams
- Delete inappropriate content
- View user reports

### System Health
- Server status
- Database connection
- API health
- Error logs
- Performance metrics

---

## 🆘 Need Help?

1. **Check backend logs** first
2. **Check browser console** for errors
3. **Verify admin credentials** in backend `.env`
4. **Test backend API** with curl/Postman
5. **Check CORS settings** in backend
6. **Restart both servers** after config changes

---

## 🚀 Quick Start Commands

```bash
# Setup Admin Frontend
cd admin-frontend
npm install
cp .env.example .env
# Edit .env with your settings

# Start Backend (in separate terminal)
cd backend
npm run dev

# Start Admin Frontend
cd admin-frontend
npm run dev

# Access
# Open http://localhost:5174
# Login with admin credentials
```

---

**That's it! Your admin dashboard should now be running.** 🔐✨

**Access it at: http://localhost:5174** 

**Login with your admin credentials from backend/.env**
