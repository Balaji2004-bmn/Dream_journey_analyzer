# 📱 Mobile App Setup Guide

Complete guide to running your Dream Journey Analyzer mobile app.

---

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (will be installed with dependencies)
- **Expo Go App** on your phone (Download from App Store/Play Store)
- **Backend server** running

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd mobile_app
npm install
```

**This will install:**
- React Native
- Expo SDK
- React Navigation
- Supabase Client
- All other dependencies

### Step 2: Configure Environment Variables

**Create `.env` file in `mobile_app/` directory:**

```bash
# Copy from example
cp .env.example .env

# Or create manually
```

**Edit `mobile_app/.env`:**

```env
# Backend API
EXPO_PUBLIC_BACKEND_URL=http://YOUR_COMPUTER_IP:3001/api

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Sign-In (Optional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**⚠️ Important: Use your computer's IP address, not `localhost`**

**To find your IP:**

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network
# Example: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig
# Look for "inet" under your active network
# Example: 192.168.1.100
```

**Then use:**
```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001/api
```

### Step 3: Start Backend Server

**In a separate terminal:**

```bash
cd backend
npm run dev
```

**Wait for:**
```
✅ Server running on port 3001
✅ Supabase connected
```

### Step 4: Start Mobile App

**Two options:**

#### Option A: Standard Mode (Recommended)
```bash
cd mobile_app
npm start
```

#### Option B: With Tunnel (For firewall issues)
```bash
cd mobile_app
npm start -- --tunnel
```

**What happens:**
- Expo Dev Server starts
- QR code appears in terminal
- Metro bundler starts

### Step 5: Open on Your Phone

1. **Install Expo Go** from App Store (iOS) or Play Store (Android)

2. **Scan QR Code:**
   - **iOS**: Open Camera app, scan QR code
   - **Android**: Open Expo Go app, tap "Scan QR Code"

3. **Wait for app to load** (first time takes 1-2 minutes)

4. **App opens!** 🎉

---

## 🔧 Configuration Details

### Backend Connection

Your mobile app needs to connect to your backend server.

**File: `mobile_app/.env`**

```env
# Local network (same WiFi)
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001/api

# OR with ngrok/tunnel
EXPO_PUBLIC_BACKEND_URL=https://abc123.ngrok.io/api

# OR with Expo tunnel
EXPO_PUBLIC_BACKEND_URL=https://abc123.exp.direct/api
```

### Google Sign-In Setup

**1. Get Google OAuth Credentials:**

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create/Select project
- Enable "Google+ API"
- Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
- Application type: **Android** (for Expo Go)
- Package name: `host.exp.exponent`
- SHA-1: Get from Expo with `expo credentials:manager`

**2. Add to `.env`:**

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

**3. Configure in Supabase:**

- Go to **Authentication** → **Providers**
- Enable **Google**
- Add your Client ID and Secret

---

## 📱 Running on Different Devices

### iOS Simulator (Mac only)

```bash
npm run ios
```

### Android Emulator

```bash
npm run android
```

### Physical Device (Recommended)

Use Expo Go app as described in Quick Start.

---

## 🐛 Troubleshooting

### Issue 1: Can't Connect to Backend

**Error:** `Network request failed` or `Unable to connect`

**Fix:**

1. **Check your IP address** in `.env`:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. **Make sure both devices are on same WiFi**

3. **Check firewall settings:**
   ```bash
   # Windows: Allow Node.js through firewall
   # Mac: System Preferences → Security → Firewall → Allow Node
   ```

4. **Try tunnel mode:**
   ```bash
   npm start -- --tunnel
   ```

### Issue 2: QR Code Won't Scan

**Fix:**

- Make sure Expo Go is installed
- Try typing URL manually in Expo Go
- Use `npm start -- --tunnel`
- Check network connection

### Issue 3: App Crashes on Launch

**Fix:**

1. **Clear cache:**
   ```bash
   npm start -- --clear
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Check backend is running:**
   ```bash
   curl http://YOUR_IP:3001/api/health
   ```

### Issue 4: Google Sign-In Not Working

**Fix:**

- Check Google Client ID in `.env`
- Verify Supabase Google provider is enabled
- Make sure redirect URI is configured
- Check Expo app.json has correct package name

### Issue 5: "Uncaught Error: Could not find module"

**Fix:**

```bash
# Clear metro cache
npm start -- --clear

# Or manually:
rm -rf node_modules/.cache
```

---

## 📂 Project Structure

```
mobile_app/
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── .env                  # Environment variables (create this!)
├── .env.example          # Example env file
├── App.js               # Main app entry
├── src/
│   ├── screens/         # App screens
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   └── ...
│   ├── contexts/        # React contexts
│   │   └── AuthContext.js
│   ├── components/      # Reusable components
│   └── services/        # API services
└── assets/              # Images, fonts, etc.
```

---

## 🎯 Features

Your mobile app includes:

- ✅ **Email/Password Authentication**
- ✅ **Google Sign-In**
- ✅ **Dream Analysis**
- ✅ **Video Generation**
- ✅ **Dream Gallery**
- ✅ **Subscription Management**
- ✅ **Profile Settings**

---

## 🔄 Development Workflow

### Making Changes

1. **Edit code** in your IDE
2. **Save file** → App auto-reloads
3. **Shake device** → Open dev menu
4. **Reload app** if needed

### Dev Menu Options

- **Reload** - Refresh the app
- **Debug** - Open Chrome DevTools
- **Show Perf Monitor** - FPS/Memory
- **Toggle Inspector** - Inspect elements

### Logging

**View logs:**

```bash
# In terminal where you ran npm start
# Logs appear automatically
```

**Or use React Native Debugger:**

```bash
# Install
npm install -g react-native-debugger

# Run
react-native-debugger
```

---

## 📦 Building for Production

### iOS (TestFlight/App Store)

```bash
# Build iOS app
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android (Play Store)

```bash
# Build Android app
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

**Note:** Requires EAS (Expo Application Services) account

---

## ✅ Checklist

Before running mobile app:

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with correct IP
- [ ] Backend server running on port 3001
- [ ] Both devices on same WiFi network
- [ ] Expo Go app installed on phone
- [ ] Firewall allows Node.js connections

---

## 🎓 Useful Commands

```bash
# Start app (standard)
npm start

# Start with tunnel (for network issues)
npm start -- --tunnel

# Clear cache
npm start -- --clear

# Start on iOS simulator
npm run ios

# Start on Android emulator
npm run android

# Run tests
npm test

# Check for updates
expo upgrade

# Doctor (check setup)
expo doctor
```

---

## 📱 App URLs

When running, your app will be available at:

```
exp://192.168.1.100:8081  # Local network
exp://abc123.exp.direct   # Tunnel mode
```

---

## 🆘 Need Help?

1. **Check logs** in terminal
2. **Shake device** → Open dev menu
3. **View errors** in Expo Go app
4. **Check backend logs** in backend terminal
5. **Read error messages** carefully
6. **Google the error** + "expo react native"

---

## 🚀 Quick Commands Reference

```bash
# Setup
cd mobile_app
npm install

# Configure
cp .env.example .env
# Edit .env with your settings

# Run
npm start

# Scan QR code with Expo Go on your phone
```

---

**That's it! Your mobile app should now be running.** 📱✨

**Questions? Check the troubleshooting section or backend logs!**
