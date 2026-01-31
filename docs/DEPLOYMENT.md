# 🚀 HalalTrade Pro - Deployment Guide

## Architecture Overview

This app has two parts that need separate deployment:
1. **Frontend** (React + Vite) → **Vercel** (free tier)
2. **Backend** (FastAPI + WebSocket) → **Railway** (free tier with $5 credit)

---

## 📦 Step 1: Deploy Backend to Railway

### Option A: Using Railway Dashboard (Recommended)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account and select your repository

3. **Configure Service**
   - Railway will auto-detect the Python app
   - Set the root directory to `backend`
   - Add these environment variables in Settings → Variables:
   
   ```
   PORT=8000
   CORS_ORIGINS=https://your-app.vercel.app
   TELEGRAM_BOT_TOKEN=your_bot_token (optional)
   TELEGRAM_CHAT_ID=your_chat_id (optional)
   GEMINI_API_KEY=your_gemini_key (optional)
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your app URL (e.g., `https://halaltrade-api-production.up.railway.app`)

### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend folder
cd backend

# Initialize and deploy
railway init
railway up
```

---

## 🌐 Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`

3. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-railway-app.railway.app
   VITE_WS_URL=wss://your-railway-app.railway.app
   ```
   ⚠️ Replace with your actual Railway URL from Step 1!

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live! 🎉

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set root directory: ./
# - Confirm framework: Vite
```

---

## 🔄 Step 3: Update CORS (Important!)

After frontend is deployed, go back to Railway and update the `CORS_ORIGINS` environment variable:

```
CORS_ORIGINS=https://your-app.vercel.app,https://halaltrade-pro.vercel.app
```

Railway will auto-redeploy with the new settings.

---

## ✅ Verify Deployment

1. **Check Backend Health**
   ```
   https://your-railway-app.railway.app/api/health
   ```
   Should return: `{"status":"healthy","websocket_clients":0}`

2. **Check Frontend**
   - Open your Vercel URL
   - Dashboard should load
   - Stock data should populate
   - WebSocket icon should show connected (green)

---

## 🔧 Troubleshooting

### WebSocket Not Connecting
- Ensure `VITE_WS_URL` uses `wss://` (not `ws://`)
- Check Railway logs for WebSocket errors

### CORS Errors
- Add your Vercel domain to `CORS_ORIGINS` in Railway
- Format: `https://your-app.vercel.app`

### API Errors
- Check Railway logs: `railway logs`
- Ensure all environment variables are set

### Build Failures
- Check that `requirements.txt` has all dependencies
- Ensure Python version is 3.10+

---

## 🔐 Environment Variables Summary

### Backend (Railway)
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | ✅ Auto-set by Railway |
| `CORS_ORIGINS` | Allowed frontend URLs | ✅ |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | ❌ Optional |
| `TELEGRAM_CHAT_ID` | Telegram chat ID | ❌ Optional |
| `GEMINI_API_KEY` | Google Gemini API key | ❌ Optional |

### Frontend (Vercel)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | ✅ |
| `VITE_WS_URL` | Backend WebSocket URL | ✅ |

---

## 🆓 Free Tier Limits

### Railway
- $5 free credit/month
- ~500 hours of runtime
- 1GB RAM, 1 vCPU

### Vercel
- Unlimited static hosting
- 100GB bandwidth/month
- Automatic HTTPS

---

## 🔄 Continuous Deployment

Both Railway and Vercel support auto-deploy on git push:

1. Push changes to your GitHub repo
2. Both services auto-build and deploy
3. Zero downtime deployments

---

## 📱 PWA Installation

After deployment, users can install the app:
1. Open the Vercel URL in Chrome/Edge
2. Click the "Install" button in the browser bar
3. Or use the in-app install prompt

---

## 🎉 You're Live!

Your HalalTrade Pro app is now deployed and accessible worldwide!

Frontend: `https://your-app.vercel.app`
Backend API: `https://your-api.railway.app`
