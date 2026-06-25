# Quick Reference: Google Maps Setup

## 🚀 One-Minute Setup

### 1️⃣ Get API Key
- Go to: https://console.cloud.google.com/apis/credentials
- Click "Create Credentials" → "API Key"
- Copy the key

### 2️⃣ Create `.env` File
In project root, create file named `.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
```

### 3️⃣ Restrict to Localhost (Security)
In Google Cloud Console, edit your API key:
- **Application restrictions** → "HTTP referrers"
- Add:
  ```
  http://localhost:3000/*
  http://localhost:5173/*
  ```
- **API restrictions** → Select "Maps JavaScript API"
- Click Save

### 4️⃣ Start Dev Server
```bash
npm run dev
```

Visit http://localhost:3000 — map should load! ✅

---

## ❌ If Maps Still Don't Load

| Error | Fix |
|-------|-----|
| "Do you own this website?" | Check localhost URL in Google Cloud referrer restrictions |
| "API key missing" | Verify `.env` file exists with your key |
| "Failed to load Maps" | Try creating a NEW API key instead |
| "Invalid API key" | Go to Google Cloud → enable "Maps JavaScript API" |
| "Module not found" | Run `npm install` |

---

## 🔐 Important: Never Commit `.env`
The `.env` file is **NEVER** committed to git. Each developer has their own local copy.

- ✅ `.env.example` → Committed (template)
- ❌ `.env` → NOT committed (personal keys)

---

## 📝 Full Guide
See `SETUP_GOOGLE_MAPS.md` for detailed instructions
