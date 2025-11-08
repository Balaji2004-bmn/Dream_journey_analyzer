# 📱 Fix: Mobile App Slow Loading / Not Loading

Complete guide to fix mobile app loading issues.

---

## 🔴 Common Issues

1. **App takes forever to load**
2. **App shows blank screen**
3. **Can't connect to backend**
4. **Stuck on splash screen**
5. **Network request failed errors**

---

## 🎯 Main Cause: Backend URL Problem

### **Issue:**
Your `mobile_app/.env` likely has:
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001/api
```

**❌ This DOES NOT work on physical devices!**

`localhost` on your phone refers to the phone itself, not your computer.

---

## ✅ Quick Fix

### **Step 1: Find Your Computer's IP Address**

#### **Windows:**
```bash
ipconfig
```

**Look for "IPv4 Address"** under your active network (WiFi or Ethernet):
```
IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

#### **Mac/Linux:**
```bash
ifconfig
# Or
ip addr show
```

**Look for "inet" under your active network:**
```
inet 192.168.1.100
```

### **Step 2: Update mobile_app/.env**

```env
# WRONG (doesn't work on phone)
# EXPO_PUBLIC_BACKEND_URL=http://localhost:3001/api

# CORRECT (use your computer's IP)
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001/api

# Also update Supabase if needed
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Replace `192.168.1.100` with YOUR actual IP address!**

### **Step 3: Restart Metro Bundler**

```bash
# Stop current Expo (Ctrl+C)
# Then:
cd mobile_app
npm start -- --clear
```

### **Step 4: Reload App on Phone**

- Shake your phone → "Reload"
- Or close and reopen app in Expo Go

---

## 🔧 Additional Fixes

### **Fix 1: Check Firewall**

**Windows:**
1. Open **Windows Defender Firewall**
2. Click **Allow an app through firewall**
3. Find **Node.js** in the list
4. Make sure both **Private** and **Public** are checked ✅
5. Click OK

**Mac:**
1. System Preferences → Security & Privacy → Firewall
2. Click **Firewall Options**
3. Allow Node.js

**Test firewall:**
```bash
# On your phone browser, go to:
http://YOUR_IP:3001/api/health
```

Should show:
```json
{
  "status": "OK",
  "timestamp": "..."
}
```

### **Fix 2: Use Same WiFi Network**

**CRITICAL:** Your phone and computer MUST be on the same WiFi network!

**Check:**
- Phone: Settings → WiFi → Network name
- Computer: Same network name

**If different:** Connect to same WiFi

### **Fix 3: Reduce Bundle Size**

Large bundle = slow loading. Optimize:

#### **A. Clear Metro Cache**
```bash
cd mobile_app
rm -rf node_modules/.cache
npm start -- --clear
```

#### **B. Remove Unused Dependencies**
```bash
cd mobile_app
npm uninstall @some-unused-package
```

#### **C. Enable Hermes Engine**

Edit `mobile_app/app.json`:
```json
{
  "expo": {
    "android": {
      "jsEngine": "hermes"
    },
    "ios": {
      "jsEngine": "hermes"
    }
  }
}
```

### **Fix 4: Use Tunnel Mode** (If Firewall Issues)

```bash
cd mobile_app
npm start -- --tunnel
```

**Pros:**
- ✅ Works through firewall
- ✅ Works on different networks

**Cons:**
- ⚠️ Slower than LAN
- ⚠️ Requires Expo account

### **Fix 5: Increase Timeout**

If app loads but slowly:

Create/edit `mobile_app/src/services/api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
  timeout: 30000, // Increased to 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

---

## 📊 Network Configuration Examples

### **Scenario 1: Physical Device (Most Common)**

```env
# mobile_app/.env

# Use your computer's IP
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001/api

# Supabase (same as web app)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Requirements:**
- ✅ Same WiFi network
- ✅ Firewall allows Node.js
- ✅ Backend running on port 3001

### **Scenario 2: Android Emulator**

```env
# mobile_app/.env

# 10.0.2.2 is Android emulator's special localhost
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:3001/api

EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### **Scenario 3: iOS Simulator**

```env
# mobile_app/.env

# localhost works in iOS simulator
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001/api

EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### **Scenario 4: Tunnel Mode** (Firewall Issues)

```bash
# Start with tunnel
npm start -- --tunnel
```

```env
# mobile_app/.env

# Expo will provide tunnel URL like:
# https://abc123.ngrok.io
# Update after tunnel starts
EXPO_PUBLIC_BACKEND_URL=https://abc123.ngrok.io/api

EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🧪 Test Your Setup

### **Test 1: Backend Reachable**

**On your phone browser:**
```
http://YOUR_IP:3001/api/health
```

**Expected:**
```json
{
  "status": "OK",
  "uptime": 123
}
```

**If fails:** Firewall blocking or wrong IP

### **Test 2: App Network Request**

**In app, open DevTools:**
```javascript
// Check what URL app is using
console.log(process.env.EXPO_PUBLIC_BACKEND_URL);
```

**Should show:** `http://192.168.1.100:3001/api` (your IP)

### **Test 3: Login/Signup**

1. Open app
2. Try to sign up or login
3. Check backend console for requests

**Backend should show:**
```
info: POST /api/auth/signin - 192.168.1.x
```

---

## 📱 Optimize for Faster Loading

### **1. Enable Async Storage**

```bash
cd mobile_app
npm install @react-native-async-storage/async-storage
```

### **2. Lazy Load Screens**

```javascript
// Instead of:
import DreamAnalyzer from './screens/DreamAnalyzer';

// Use:
const DreamAnalyzer = React.lazy(() => import('./screens/DreamAnalyzer'));
```

### **3. Optimize Images**

- Use smaller image sizes
- Compress images before importing
- Use WebP format

### **4. Remove Console Logs**

```javascript
// For production build:
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}
```

### **5. Use Production Build**

```bash
# Build optimized production bundle
cd mobile_app
expo build:android
# or
expo build:ios
```

---

## 🎯 Complete Setup Checklist

- [ ] Found your computer's IP address
- [ ] Updated `mobile_app/.env` with correct IP
- [ ] Backend running on port 3001
- [ ] Phone and computer on same WiFi
- [ ] Firewall allows Node.js
- [ ] Cleared Metro cache: `npm start -- --clear`
- [ ] Tested backend URL in phone browser
- [ ] Reloaded app in Expo Go
- [ ] App connects successfully

---

## 🐛 Still Not Working?

### **Debug Steps:**

1. **Check backend logs:**
   ```bash
   cd backend
   npm run dev
   # Watch for incoming requests
   ```

2. **Check Expo logs:**
   ```bash
   cd mobile_app
   npm start
   # Look for errors in terminal
   ```

3. **Check phone logs:**
   - Shake phone
   - Open DevTools
   - Check Console tab

4. **Try tunnel mode:**
   ```bash
   npm start -- --tunnel
   ```

5. **Check network:**
   ```bash
   # Ping your computer from phone browser:
   http://YOUR_IP:3001/api/health
   ```

---

## 💡 Quick Tips

### **WiFi Network Tips:**
- ✅ Use 2.4GHz WiFi (better range)
- ❌ Avoid public WiFi (often blocks ports)
- ✅ Use home/office WiFi
- ❌ Don't use VPN (blocks local network)

### **Performance Tips:**
- Clear Metro cache regularly
- Use `--clear` flag when starting
- Close unnecessary apps on phone
- Restart Metro if slow

### **Development Tips:**
- Test on emulator first (faster)
- Use tunnel mode for demos
- Build production version for real testing
- Monitor network requests

---

## ✅ Expected Behavior

### **When Working Correctly:**

**Starting app:**
```
1. Expo Go opens
2. Shows splash screen (1-2 seconds)
3. Loads main screen (2-3 seconds)
4. Ready to use!
```

**Total loading time:** ~5 seconds max

**Network requests:**
```
Backend logs show:
GET /api/health - 192.168.1.x
POST /api/auth/signin - 192.168.1.x
```

---

## 📊 Comparison

| Method | Speed | Reliability | Use Case |
|--------|-------|-------------|----------|
| Local IP | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | Development (recommended) |
| Tunnel | ⚡⚡ | ⭐⭐⭐ | Firewall issues |
| localhost | ⚡⚡⚡ | ⭐ | Emulator only |
| Production | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | Real users |

---

## 🎯 Summary

### **Main Issue:**
❌ Using `localhost:3001` in mobile app → doesn't work on physical devices

### **Solution:**
✅ Use your computer's IP:
```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001/api
```

### **Steps:**
1. Get your IP: `ipconfig` (Windows) or `ifconfig` (Mac)
2. Update `mobile_app/.env`
3. Restart Expo: `npm start -- --clear`
4. Reload app on phone

### **Verify:**
- Backend URL accessible in phone browser
- App loads in ~5 seconds
- Can login/signup successfully

---

**Your mobile app should now load quickly!** 📱⚡

**Most common issue: Wrong backend URL. Fix that and 90% of problems solved!**
