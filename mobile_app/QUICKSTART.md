# 🚀 Mobile App Quick Start (3 Steps)

## Prerequisites
- Node.js installed
- Backend running on port 3001
- Smartphone with Expo Go app

## Step 1: Install & Configure (2 minutes)

```powershell
cd mobile_app
npm install
copy .env.example .env
```

Edit `.env`:
```env
# Find your IP: run 'ipconfig' and look for IPv4 Address
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.X:3001/api

# Copy from your web app's .env or backend/.env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 2: Start the App (30 seconds)

```powershell
npm start
```

## Step 3: Open on Your Phone (1 minute)

1. Install **Expo Go** from:
   - iOS: App Store
   - Android: Google Play
   
2. Open Expo Go and scan the QR code

3. App loads automatically! 🎉

## Test It

1. **Signup**: Create an account (same as web app)
2. **Login**: Sign in with your credentials
3. **New Dream**: Enter a dream and analyze it
4. **My Dreams**: View all your dreams (synced with web)

## Common Issues

### "Network request failed"
```powershell
# Check backend is running
curl http://localhost:3001/health

# Make sure you're using your actual IP, not localhost
# Windows: ipconfig
# Look for "IPv4 Address" like 192.168.1.100
```

### "Cannot find module"
```powershell
rm -rf node_modules
npm install
```

### "Expo Go won't connect"
- Ensure phone and computer on same WiFi
- Try restarting Expo: `expo start -c`

## Development Tips

- **Fast Refresh**: Changes appear instantly
- **Shake device**: Open developer menu
- **Console logs**: Appear in terminal where you ran `npm start`

## Next Steps

- See `README.md` for full documentation
- See `SETUP_GUIDE.md` for detailed setup
- See `../MOBILE_APP_INTEGRATION.md` for architecture overview

---

**That's it!** You now have a mobile version of Dream Journey Analyzer running on your phone. 📱✨
