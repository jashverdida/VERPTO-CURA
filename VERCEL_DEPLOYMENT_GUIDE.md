# 🚀 CURA Vercel Deployment Guide

This guide provides step-by-step instructions to deploy the CURA web application to Vercel.

---

## ✅ Prerequisites

1. **GitHub Account** - Push your code to GitHub (Vercel integrates with GitHub)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables** - Have your API keys ready:
   - `VITE_GOOGLE_MAPS_API_KEY` - Your Google Maps API key

---

## 📋 Step-by-Step Deployment Instructions

### **Step 1: Prepare Your Repository**

1. Ensure all changes are committed:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```

### **Step 2: Connect to Vercel**

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"** button
3. Select **"Import Git Repository"**
4. Find and select the **CURA** repository
5. Click **"Import"**

### **Step 3: Configure Build Settings**

Vercel should auto-detect Vite framework. Verify these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm ci` |

If not auto-detected:
- Click **"Override"** and set the values above
- The `vercel.json` file in your project will assist with this

### **Step 4: Set Environment Variables**

1. Under **"Environment Variables"** section, add:

   **Name:** `VITE_GOOGLE_MAPS_API_KEY`  
   **Value:** `AIzaSyApIoATDwd3dcVx8ZtNSBbzVeh5rBo51cU`  
   **Select all environments** (Production, Preview, Development)

2. Click **"Add"**

*Optional: For better security, move Supabase credentials here as well.*

### **Step 5: Review & Deploy**

1. Review all settings (they should match the `vercel.json` configuration)
2. Click **"Deploy"** button
3. Wait for the deployment to complete (usually 1-2 minutes)
4. Once complete, you'll see your live URL (e.g., `https://cura-project.vercel.app`)

### **Step 6: Test Your Deployment**

1. Click the URL to visit your live site
2. Test key functionality:
   - ✅ Dashboard loads correctly
   - ✅ Maps display properly
   - ✅ Routing works (navigate between pages)
   - ✅ API calls to Supabase work

---

## 🔄 Continuous Deployment

After initial setup, every time you push to GitHub:

```bash
git push origin main
```

Vercel will **automatically:**
- Detect the new push
- Build your project
- Deploy to production (if merged to `main`)

You can monitor deployments at `vercel.com/dashboard`

---

## 🛠️ Troubleshooting

### **Build Fails with "Module not found"**
- Run locally: `npm install && npm run build`
- Ensure all dependencies are listed in `package.json`
- Push changes and redeploy

### **Maps Not Loading**
- Verify `VITE_GOOGLE_MAPS_API_KEY` is set in Vercel environment variables
- Check API key is enabled for Maps JavaScript API in Google Cloud Console

### **Blank Page or 404 Errors**
- This is likely a routing issue
- Verify `vite.config.js` is properly configured
- Check browser console for errors (F12)

### **Environment Variables Not Applied**
- Ensure they're set for the correct environment (Production)
- Redeploy or wait for new deployment to pick up changes
- Vercel dashboard → Project Settings → Environment Variables

### **Need to Rollback?**
- Go to Vercel dashboard → Deployments
- Click on a previous deployment
- Click "Promote to Production"

---

## 📝 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase with Vercel](https://supabase.com/docs/guides/hosting/vercel)

---

## ✨ Post-Deployment

After successful deployment, consider:

1. **Custom Domain** (optional)
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Monitoring & Analytics**
   - Enable Web Analytics in Vercel dashboard
   - Monitor performance and errors

3. **Security Best Practices**
   - Move sensitive API keys to Vercel environment variables
   - Never commit `.env` files to GitHub
   - Use `.env.example` to document required variables

---

**🎉 Your CURA application is now live on Vercel!**
