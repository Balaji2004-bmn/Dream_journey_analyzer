# Dream Journey Mobile App

React Native mobile application for the Dream Journey Analyzer platform.

## Features

- 🔐 **Supabase Authentication** - Login and signup with same credentials as web app
- 💭 **Dream Input** - Text-based dream entry
- 🤖 **AI Analysis** - Powered by Gemini AI (via backend)
- 🎬 **Video Generation** - AI-generated dream videos
- 📱 **My Dreams** - View and manage your dream collection
- 🔄 **Real-time Sync** - Shares same database as web application

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- For iOS development: Xcode (macOS only)
- For Android development: Android Studio

## Setup Instructions

### 1. Install Dependencies

```bash
cd mobile_app
npm install
```

### 2. Configure Environment Variables

Create `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Use your computer's local IP for testing on physical devices
# Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
EXPO_PUBLIC_BACKEND_URL=http://YOUR_LOCAL_IP:3001/api

# Same Supabase credentials as web app
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Important Network Configuration:**
- **Android Emulator**: Use `http://10.0.2.2:3001/api`
- **iOS Simulator**: Use `http://localhost:3001/api`
- **Physical Device**: Use `http://YOUR_LOCAL_IP:3001/api` (e.g., `http://192.168.1.100:3001/api`)

### 3. Ensure Backend is Running

The mobile app connects to the same backend as the web app:

```bash
# In a separate terminal, from project root
cd backend
npm run dev
```

Backend should be running on `http://localhost:3001`

### 4. Start the Mobile App

```bash
npm start
```

This opens the Expo DevTools in your browser.

### 5. Run on Device/Emulator

**Option A: Physical Device (Recommended for Testing)**
1. Install **Expo Go** app from App Store (iOS) or Google Play (Android)
2. Scan the QR code shown in terminal/browser
3. App will load on your device

**Option B: iOS Simulator** (macOS only)
```bash
npm run ios
```

**Option C: Android Emulator**
```bash
npm run android
```

## Project Structure

```
mobile_app/
├── App.js                    # Main app entry point
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── .env.example              # Environment variables template
└── src/
    ├── config/
    │   ├── api.js           # Axios API client
    │   └── supabase.js      # Supabase client
    ├── contexts/
    │   └── AuthContext.js   # Authentication context
    ├── screens/
    │   ├── LoginScreen.js   # Login page
    │   ├── SignupScreen.js  # Signup page
    │   ├── HomeScreen.js    # Home dashboard
    │   ├── DreamInputScreen.js    # Dream entry
    │   ├── ResultsScreen.js       # Analysis results
    │   ├── MyDreamsScreen.js      # Dreams list
    │   └── DreamDetailScreen.js   # Dream detail view
    └── theme/
        └── index.js         # App theme and styling
```

## API Integration

The mobile app uses the same backend endpoints as the web app:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/dreams/generate` - Analyze dream and generate content
- `GET /api/dreams` - Get user's dreams
- `POST /api/dreams` - Create new dream

All API calls include authentication token from Supabase session.

## Troubleshooting

### Cannot Connect to Backend

**Problem:** App shows network errors or "Failed to analyze dream"

**Solutions:**
1. Check backend is running: `curl http://localhost:3001/health`
2. Verify `.env` has correct `EXPO_PUBLIC_BACKEND_URL`
3. For physical devices, use your computer's local IP address
4. Ensure phone and computer are on same WiFi network
5. Check firewall isn't blocking port 3001

### Authentication Issues

**Problem:** Login/signup not working

**Solutions:**
1. Verify Supabase credentials in `.env`
2. Check backend `.env` has same Supabase configuration
3. Clear app cache: Close app, run `expo start -c`
4. Check backend logs for auth errors

### Expo Go App Crashes

**Problem:** App crashes on device

**Solutions:**
1. Update Expo Go to latest version
2. Clear Metro bundler cache: `expo start -c`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check for syntax errors in console

## Development Tips

### Hot Reload
- Shake device to open developer menu
- Enable "Fast Refresh" for instant updates
- Press 'r' in terminal to reload manually

### Debugging
- Use `console.log()` - outputs appear in terminal
- Shake device → "Debug Remote JS" for Chrome DevTools
- React Native Debugger for advanced debugging

### Testing on Multiple Devices
- Expo Go allows testing on multiple devices simultaneously
- Same QR code works for iOS and Android
- All devices see live updates

## Building for Production

### Android APK/AAB

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build APK (for testing)
eas build --platform android --profile preview

# Build AAB (for Play Store)
eas build --platform android --profile production
```

### iOS IPA

```bash
# Build for TestFlight/App Store
eas build --platform ios --profile production
```

## Environment-Specific Builds

**Development:**
```bash
npm start
```

**Preview (Internal Testing):**
```bash
eas build --platform all --profile preview
```

**Production:**
```bash
eas build --platform all --profile production
```

## Key Differences from Web App

| Feature | Web App | Mobile App |
|---------|---------|------------|
| Framework | React + Vite | React Native + Expo |
| Routing | React Router | React Navigation |
| Storage | localStorage | AsyncStorage |
| Styling | Tailwind CSS | React Native Paper |
| Authentication | Same (Supabase) | Same (Supabase) |
| Backend API | Same | Same |
| Database | Same (Supabase) | Same (Supabase) |

## Support

For issues:
1. Check backend is running and accessible
2. Verify environment variables are correct
3. Review console logs in terminal
4. Ensure Supabase configuration matches web app

## Next Steps

- [ ] Add voice input for dreams (using `expo-speech`)
- [ ] Add photo attachment (using `expo-image-picker`)
- [ ] Implement video playback (using `expo-av`)
- [ ] Add push notifications for analysis completion
- [ ] Offline mode with local storage
- [ ] Dark mode support

---

**Note:** This mobile app is designed to work seamlessly with your existing web application and backend. No changes to the web app or backend are required.
