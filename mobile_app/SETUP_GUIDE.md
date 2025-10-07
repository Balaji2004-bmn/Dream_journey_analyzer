# Complete Setup Guide - Dream Journey Mobile App

## 📱 Quick Start (5 Minutes)

### Step 1: Install Expo CLI
```powershell
npm install -g expo-cli
```

### Step 2: Install Dependencies
```powershell
cd mobile_app
npm install
```

### Step 3: Configure Environment
```powershell
# Copy the example file
copy .env.example .env

# Edit .env with your actual values
notepad .env
```

Add your configuration:
```env
EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP:3001/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Start Backend (if not running)
```powershell
# In a new terminal, from project root
cd backend
npm run dev
```

### Step 5: Start Mobile App
```powershell
# From mobile_app directory
npm start
```

### Step 6: Test on Device
1. Install **Expo Go** from App Store or Google Play
2. Scan QR code shown in terminal
3. App loads automatically

## 🌐 Network Configuration

### Finding Your Local IP

**Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

### Environment URL Examples

```env
# For Android Emulator
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:3001/api

# For iOS Simulator
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001/api

# For Physical Device (use your actual IP)
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001/api
```

## 🔧 Detailed Setup

### Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Expo CLI installed globally
- [ ] Backend server running
- [ ] Supabase project configured
- [ ] Mobile device or emulator ready

### Backend Configuration

Ensure your backend allows mobile connections. Check `backend/server.js`:

```javascript
// CORS should allow your IP
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.100:8081', // Add your IP
  // ...
];
```

If needed, update CORS to allow all local IPs during development:

```javascript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(localhost|192\.168\.|10\.)/.test(origin)) {
      return callback(null, true);
    }
    // ...
  }
}));
```

### Supabase Configuration

Use the **same** Supabase credentials as your web app:

1. Go to Supabase Dashboard → Settings → API
2. Copy:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - Anon/Public key (starts with `eyJ...`)
3. Add to mobile app's `.env`

## 📲 Running on Different Platforms

### Physical Device (Recommended)

**Advantages:**
- Real device performance
- Test actual user experience
- Test device features (camera, etc.)

**Steps:**
1. Install Expo Go app
2. Connect to same WiFi as your computer
3. Scan QR code from terminal
4. App loads automatically

### Android Emulator

**Setup:**
1. Install Android Studio
2. Open AVD Manager
3. Create/start virtual device
4. Run `npm run android`

**Backend URL:**
```env
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:3001/api
```

### iOS Simulator (Mac Only)

**Setup:**
1. Install Xcode from App Store
2. Open Xcode → Preferences → Components
3. Install iOS simulator
4. Run `npm run ios`

**Backend URL:**
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001/api
```

## 🔐 Authentication Flow

The mobile app uses the **same authentication** as your web app:

1. **Signup Flow:**
   - User enters email/password
   - Backend creates Supabase account
   - Email confirmation sent
   - User must confirm before login

2. **Login Flow:**
   - User enters credentials
   - Backend validates with Supabase
   - Session token stored in AsyncStorage
   - Token included in all API requests

3. **Session Management:**
   - Auto-refresh tokens
   - Persistent sessions
   - Logout clears local storage

## 🧪 Testing the App

### Test Signup
1. Open app
2. Tap "Sign Up"
3. Enter email and strong password
4. Tap "Sign Up"
5. Check email for confirmation
6. Confirm email
7. Return to app and login

### Test Dream Analysis
1. Login to app
2. Tap "New Dream" from home
3. Enter dream text
4. Tap "Analyze Dream"
5. Wait for analysis (may take 10-30 seconds)
6. View results page

### Test Dream List
1. From home, tap "View Dreams"
2. See all your dreams (same as web app)
3. Tap a dream to view details

## 🐛 Common Issues & Solutions

### Issue: "Network request failed"

**Causes:**
- Backend not running
- Wrong IP address in .env
- Firewall blocking port

**Solutions:**
```powershell
# 1. Check backend is running
curl http://localhost:3001/health

# 2. Test from mobile device (use your IP)
# Open browser on phone and visit:
http://192.168.1.100:3001/health

# 3. Allow Node.js through Windows Firewall
# Search "Windows Defender Firewall" → Allow an app
```

### Issue: "Supabase auth error"

**Causes:**
- Wrong Supabase credentials
- Environment variables not loaded

**Solutions:**
```powershell
# 1. Verify .env file exists
ls .env

# 2. Check values are correct
cat .env

# 3. Restart with cache clear
expo start -c
```

### Issue: "Cannot find module"

**Causes:**
- Dependencies not installed
- node_modules corrupted

**Solutions:**
```powershell
# Clean install
rm -rf node_modules
npm install
```

### Issue: App crashes on launch

**Causes:**
- Outdated Expo Go
- Syntax errors
- Missing dependencies

**Solutions:**
1. Update Expo Go app on device
2. Check terminal for error messages
3. Run `npm install` again
4. Try `expo start -c`

## 📦 Building Production App

### Android APK (for testing)

```powershell
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

Download APK and install on Android devices.

### Google Play Store

```powershell
# Build AAB
eas build --platform android --profile production

# Follow Expo docs to submit:
# https://docs.expo.dev/submit/android/
```

### iOS App Store

```powershell
# Build IPA
eas build --platform ios --profile production

# Submit to TestFlight/App Store
eas submit --platform ios
```

## 🔄 Syncing with Web App

The mobile app shares:
- ✅ Same database (Supabase)
- ✅ Same authentication system
- ✅ Same backend API
- ✅ Same user accounts

**This means:**
- Dreams created on mobile appear on web
- Dreams created on web appear on mobile
- Login works with same credentials
- Real-time synchronization

## 📊 Architecture Overview

```
Mobile App (React Native)
    ↓
AsyncStorage (Session)
    ↓
Supabase Client ←→ Axios API Client
    ↓                    ↓
Supabase Auth        Backend API (Express)
    ↓                    ↓
PostgreSQL DB      Gemini AI + Pika Video
```

## 🚀 Performance Tips

1. **Use physical device** for realistic performance testing
2. **Enable Fast Refresh** for instant code updates
3. **Minimize re-renders** with React.memo and useCallback
4. **Optimize images** before including in app
5. **Test on slower devices** to catch performance issues

## 🎨 Customization

### Change Colors
Edit `src/theme/index.js`:

```javascript
colors: {
  primary: '#your-color',
  secondary: '#your-color',
  // ...
}
```

### Add New Screens
1. Create screen in `src/screens/`
2. Import in `App.js`
3. Add to Stack.Navigator

### Modify API Calls
Edit `src/config/api.js` to add new endpoints.

## 📝 Development Workflow

1. Make changes to code
2. Save file (Fast Refresh auto-updates)
3. Test on device
4. Check terminal for errors
5. Repeat

**Pro Tip:** Keep terminal visible to catch errors immediately.

## 🔒 Security Best Practices

1. **Never commit `.env`** file
2. **Use environment variables** for all secrets
3. **Validate user input** before API calls
4. **Use HTTPS** in production
5. **Keep dependencies updated**

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Supabase Docs](https://supabase.com/docs)

## 🆘 Getting Help

1. Check this guide
2. Review console errors
3. Check backend logs
4. Verify environment variables
5. Test backend endpoints with curl/Postman

---

**You're all set!** The mobile app is now ready to use. 🎉
