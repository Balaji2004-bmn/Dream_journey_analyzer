# Admin Server Setup - Dream Journey Analyzer

## 🚀 Separate Admin Port Configuration

The Dream Journey Analyzer now supports a **separate admin server** running on a different port for enhanced security and organization.

## 📋 Server Configuration

### Main Application Server
- **Port**: 3001
- **URL**: http://localhost:3001
- **Purpose**: Main API endpoints, user authentication, dream management

### Admin Server
- **Port**: 3002  
- **URL**: http://localhost:3002
- **Purpose**: Admin-only endpoints, user management, system insights

### Frontend
- **Port**: 5173
- **URL**: http://localhost:5173
- **Admin Login**: http://localhost:5173/admin-auth
- **Admin Dashboard**: http://localhost:5173/admin

## 🔧 Environment Configuration

### Backend (.env)
```bash
# Server Configuration
PORT=3001
ADMIN_PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_PUBLIC_URL=http://localhost:3001
ADMIN_URL=http://localhost:3002

# Admin Configuration
ADMIN_EMAILS=your-email@example.com,another-admin@example.com
ADMIN_MASTER_PASSWORD=your_secure_password
```

### Frontend (.env)
```bash
# Backend URLs
VITE_BACKEND_URL="http://localhost:3001"
VITE_ADMIN_BACKEND_URL="http://localhost:3002"
VITE_FRONTEND_URL="http://localhost:5173"
```

## 🚀 Starting the Servers

### Option 1: Automated Script (Recommended)
```bash
# Windows Batch
.\start-servers.bat

# PowerShell
.\start-servers.ps1
```

### Option 2: Manual Start
```bash
# Terminal 1: Main Backend
cd backend
node server.js

# Terminal 2: Admin Server
cd backend
node admin-server.js

# Terminal 3: Frontend
npm run dev
```

### Option 3: NPM Scripts
```bash
# Terminal 1: Main Backend
cd backend
npm start

# Terminal 2: Admin Server
cd backend
npm run admin

# Terminal 3: Frontend
npm run dev
```

## 🔐 Admin Access Methods

### 1. Environment Variable Method (Recommended)
Add your email to `ADMIN_EMAILS` in backend `.env`:
```bash
ADMIN_EMAILS=your-email@example.com,admin2@example.com
```

### 2. Master Password Method
Set `ADMIN_MASTER_PASSWORD` in backend `.env`:
```bash
ADMIN_MASTER_PASSWORD=your_secure_password
```
Then use any email with this password to login as admin.

### 3. Demo Mode (Development Only)
Use demo credentials:
- **Email**: admin@demo.com
- **Token**: demo-admin-token

## 🌐 Admin Endpoints

### User Management
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/status` - Activate/deactivate user
- `PATCH /api/admin/users/:id/role` - Change user role
- `DELETE /api/admin/users/:id` - Delete user

### System Insights
- `GET /api/admin/insights/stats` - System statistics
- `GET /api/admin/insights/analytics` - Usage analytics

### Content Moderation
- `GET /api/admin/content/dreams/flagged` - Flagged content
- `PATCH /api/admin/content/dreams/flagged/:id/review` - Review content

## 🛡️ Security Features

### Admin Server Security
- **Helmet**: Security headers
- **Rate Limiting**: Prevents abuse
- **CORS**: Restricted origins
- **JWT Authentication**: Secure token validation
- **Audit Logging**: All admin actions logged

### Access Control
- **Role-based permissions**: Super Admin, Admin, Moderator
- **Email verification**: Admin emails must be verified
- **Session management**: Secure token handling

## 🔍 Health Checks

### Main Server Health
```bash
curl http://localhost:3001/health
```

### Admin Server Health
```bash
curl http://localhost:3002/health
```

## 📊 Admin Dashboard Features

### User Management
- View all users with pagination
- Activate/deactivate accounts
- Change user roles
- Delete users (with confirmation)

### System Insights
- User registration trends
- Dream creation statistics
- System performance metrics
- Error monitoring

### Content Moderation
- Review flagged dreams
- Approve/reject content
- User feedback management

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
taskkill /f /im node.exe

# Or check specific port
netstat -ano | findstr :3002
```

### CORS Issues
Ensure frontend URL is in admin server CORS configuration:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];
```

### Admin Access Denied
1. Check `ADMIN_EMAILS` in backend `.env`
2. Verify email is lowercase
3. Ensure user is signed in with admin email
4. Check backend logs for authentication errors

## 📝 Logs and Monitoring

### Admin Actions
All admin actions are logged with:
- Admin user ID and email
- Action performed
- Timestamp
- IP address
- User agent

### Log Files
- Console output for development
- File logging in production
- Audit trail in database

## 🔄 Updates and Maintenance

### Restarting Servers
```bash
# Restart all servers
taskkill /f /im node.exe
.\start-servers.bat
```

### Environment Changes
After updating `.env` files, restart the respective servers for changes to take effect.

---

## 📞 Support

For issues or questions about the admin setup:
1. Check the logs in terminal windows
2. Verify environment configuration
3. Test health endpoints
4. Review CORS and authentication settings
