# Google Maps Setup for CURA Developers

This guide helps you get Google Maps working locally for development.

## ⚠️ Why Teams Are Seeing "Do you own this website?"

The `.env` file containing the API key is **not committed to git** (it's in `.gitignore`). When you clone the repo, you get `.env.example` but not the actual `.env` file. Without a valid API key, Google Maps fails to load and shows this error.

---

## 🚀 Setup Steps (5 minutes)

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a **new project** (or use existing one)
4. Go to **APIs & Services → Enabled APIs**
5. Click **Enable APIs and Services**
6. Search for **"Maps JavaScript API"** and click **Enable**
7. Go to **Credentials** in the left menu
8. Click **Create Credentials → API Key**
9. Copy the generated API key

### Step 2: Restrict the API Key to Localhost

To prevent your key from being abused, restrict it to your development environment:

1. In **Google Cloud Console → Credentials**, click your API key
2. Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**
3. Click **Add HTTP referrer** and add these patterns:
   ```
   http://localhost:3000/*
   http://localhost:5173/*
   http://127.0.0.1:3000/*
   http://127.0.0.1:5173/*
   ```
4. Under **"API restrictions"**, select **"Maps JavaScript API"** (and Maps Embed if needed)
5. Click **Save** and wait 5 minutes for changes to take effect

### Step 3: Create Your Local `.env` File

1. In the project root, create a file named `.env` (note: this file is **NOT** committed to git)
2. Copy this content:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```
3. Replace `YOUR_API_KEY_HERE` with the key from Step 1
4. **Do NOT commit this file** — it's already in `.gitignore`

### Step 4: Restart Your Dev Server

```bash
npm run dev
```

Then visit `http://localhost:3000` and the map should load correctly!

---

## 🔧 Troubleshooting

### ❌ Map still shows "Do you own this website?"

1. **Check API key is set**: Open browser DevTools (F12) → Console. Should NOT show `❌ VITE_GOOGLE_MAPS_API_KEY is not set`
2. **Check domain restrictions**: Go to Google Cloud Console → Credentials → Your API Key → Check HTTP referrer restrictions include `http://localhost:3000/*`
3. **Restart dev server**: `npm run dev` and refresh browser
4. **Clear browser cache**: Press Ctrl+Shift+Delete and clear cache, then refresh

### ❌ API key is invalid or doesn't work

1. Go to [Google Cloud Console → APIs & Services → Enabled APIs](https://console.cloud.google.com/apis/enabled-apis)
2. Make sure **"Maps JavaScript API"** shows as enabled (blue checkmark)
3. Create a **new API key** if the old one doesn't work
4. Update your `.env` file with the new key

### ❌ "Module '@react-google-maps/api' not found"

Run `npm install` to ensure all dependencies are installed:
```bash
npm install
```

---

## 🏢 For Production / Vercel Deployment

1. In **Vercel dashboard**, go to your project → **Settings → Environment Variables**
2. Add a new variable:
   - **Name**: `VITE_GOOGLE_MAPS_API_KEY`
   - **Value**: Your API key (use a production-only key with domain restrictions pointing to your Vercel domain)
3. For the production key, restrict it to your actual domain:
   - `https://your-domain.com/*`
   - `https://cura-project.vercel.app/*` (if using Vercel's default domain)

---

## 🔐 Security Best Practices

- **Never commit `.env` files** — they're in `.gitignore` for a reason
- **Use different keys for development and production**
- **Restrict each key** to specific domains/referrers
- **Rotate keys periodically** if compromised
- **Use Vercel environment variables** for production, not hardcoded values

---

## ✅ Quick Verification Checklist

After setup, verify:

- [ ] `.env` file exists in project root
- [ ] `VITE_GOOGLE_MAPS_API_KEY` is set in your `.env`
- [ ] Google Cloud Console shows "Maps JavaScript API" as **Enabled**
- [ ] API key has HTTP referrer restrictions for localhost
- [ ] Dev server is running (`npm run dev`)
- [ ] Browser console (F12) shows no errors about missing API key
- [ ] Map renders on dashboard and incident pages

---

## 🆘 Still Having Issues?

1. Check the browser console (F12) for detailed error messages
2. Verify your API key in `.env` file matches what's in Google Cloud Console
3. Try creating a **completely new API key** instead of reusing an old one
4. Make sure you're using `http://` (not `https://`) for localhost referrers
5. Contact the team lead with a screenshot of:
   - Your `.env` file (with the key obscured if needed)
   - Browser console errors
   - Google Cloud Console API restrictions

---

**Questions?** Check `GoogleMapContainer.jsx` to see how the API key is loaded, or review `vite.config.js` for Vite environment variable handling.
