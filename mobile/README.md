# 📱 Project CURA Mobile

The mobile companion app for Project CURA - Community-Unified Response Application.  
**Status:** ✅ Complete Hackathon Edition (May 2026)  
**Platform:** React Native with Expo for iOS & Android

## Features

- **Interactive Map Dashboard** - View active emergencies with color-coded markers
- **Emergency Reporting** - Report incidents with camera integration for AI verification
- **Real-time Status** - Track incident status and response units
- **Corporate White & Green Design** - Professional, clean UI matching the web dashboard

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo Go app on your mobile device (iOS/Android)

## Installation

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device:**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator / `i` for iOS simulator

## Project Structure

```
mobile/
├── App.js                    # Main entry point with navigation
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── babel.config.js           # Babel configuration
├── assets/                   # App icons and splash images
├── constants/
│   └── theme.js              # Colors, shadows, spacing
├── screens/
│   ├── SplashScreen.js       # Landing/splash with auto-navigation
│   ├── DashboardScreen.js    # Main map view with markers
│   └── CameraScreen.js       # Camera for incident reporting
└── components/
    └── IncidentModal.js      # Bottom sheet for incident details
```

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| White | `#FFFFFF` | Backgrounds |
| Ultra Light Slate | `#F8FAFC` | Secondary backgrounds |
| Deep Forest | `#065F46` | Headers, nav |
| Emerald | `#10B981` | Primary actions, buttons |
| Slate 200 | `#E2E8F0` | Borders, dividers |

## 🔐 Mobile Login Credentials

**Demo accounts for testing different user roles:**

| Role | Email | Password |
|------|-------|----------|
| Citizen Reporter | `citizen@gmail.com` | `citizen123` |
| Field Responder | `responder@gmail.com` | `responder123` |

Use these credentials to test incident reporting as a citizen or respond to emergencies as a field responder.

---

## API Keys (Required for Maps)

For full map functionality, you'll need to add Google Maps API keys:

1. Get API keys from [Google Cloud Console](https://console.cloud.google.com/)
2. Update `app.json`:
   - iOS: `expo.ios.config.googleMapsApiKey`
   - Android: `expo.android.config.googleMaps.apiKey`

## Dependencies

- `expo` - Expo SDK
- `expo-camera` - Camera access
- `react-native-maps` - Interactive maps
- `@react-navigation/native` - Navigation
- `@expo/vector-icons` - Ionicons

## Screens

### 1. Splash Screen
- Animated CURA logo
- Auto-navigates to Dashboard after 2.5 seconds
- Clean white background with emerald accents

### 2. Dashboard Screen
- Full-screen interactive map
- Emergency markers with custom icons
- Stats bar showing active incidents
- Floating "REPORT" action button
- Bottom sheet modal for incident details

### 3. Camera Screen
- Camera permission handling
- Real-time incident documentation
- AI verification of scene imagery

---

## 📱 Latest Updates

**Current Version:** 1.0.0 (Hackathon Release)  
✅ Full mobile dashboard with map integration  
✅ Emergency incident reporting system  
✅ Real-time status tracking  
✅ Voice & image-based incident verification  
✅ Field responder communication  
✅ Offline capability for core features  

**Mobile-Specific Features:**
- GPS-based location auto-fill
- Camera integration for scene documentation
- Push notifications for incident alerts
- Voice command support for incident reporting
- Optimized touch interfaces for field use
- Battery-efficient background syncing
- Viewfinder overlay
- Capture button with animations
- Photo preview (simulated)

## Authors

**VERPTO**
- Jashmine Verdida - Founder & Chief QA
- Eijay Pepito - Co-Founder & Creative Director
