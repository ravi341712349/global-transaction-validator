# Railway Deployment Guide

This backend is now fully configured for **Railway.com** deployment with one-click simplicity.

## 📋 Prerequisites

- GitHub account with your repository
- Railway account (sign up at https://railway.app)

## 🚀 One-Click Deployment to Railway

### Method 1: Using Railway Dashboard (Recommended - Easiest)

1. **Commit and Push** your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare backend for Railway deployment"
   git push
   ```

2. **Go to Railway Dashboard**: https://railway.app/dashboard

3. **Click "+ New Project"**

4. **Select "Deploy from GitHub"**

5. **Select your repository** from the list

6. **Railway will auto-detect** your `railway.toml` configuration

7. **Click "Deploy"** - that's it!

### Method 2: Deploy Using Railway CLI (Even Faster)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   # or on Windows with Chocolatey:
   choco install railway
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize and Deploy**:
   ```bash
   cd backend
   railway init
   # Select "Create a new project"
   # Select "Backend" or "API"
   railway up
   ```

4. **Done!** Your app is live in seconds ⚡

## ✅ What's Been Configured

- ✅ `railway.toml` - Railway-specific configuration
- ✅ `Procfile` - Start command for Railway
- ✅ `requirements.txt` - Python dependencies
- ✅ `runtime.txt` - Python version specification
- ✅ Environment variables handled (PORT auto-set by Railway)
- ✅ Health check endpoint (`/health`) for monitoring
- ✅ Production-mode configuration
- ✅ `main.py` configured to listen on all interfaces

## 🌐 Your API URL

After deployment, your backend will be accessible at:
```
https://xeno-transaction-validator-api.up.railway.app
# (Railway generates a unique URL for you)
```

You'll see the exact URL in your Railway dashboard.

## 📊 Deployment Features

| Feature | Status |
|---------|--------|
| Auto-restart on crashes | ✅ Enabled |
| Health checks | ✅ `/health` endpoint |
| Port management | ✅ Auto-handled by Railway |
| Python version pinned | ✅ 3.13.1 |
| Production optimized | ✅ No reload |
| CORS configured | ✅ Ready |

## 🔗 Update Your Frontend

In `frontend/src/api.ts`, add the Railway URL:

```typescript
const API_BASE_URL = process.env.VITE_API_URL || "https://xeno-transaction-validator-api.up.railway.app";
```

Or set environment variable in your frontend hosting:
```
VITE_API_URL=https://xeno-transaction-validator-api.up.railway.app
```

## 📝 Available API Endpoints

- `GET /health` - Health check
- `POST /upload` - Upload CSV file
- `POST /validate` - Validate uploaded file
- `POST /clean` - Clean and process file
- `POST /split` - Split file into chunks
- `GET /sample-csv` - Download sample CSV
- `GET /settings` - Get validation settings
- `POST /settings` - Update validation settings
- `GET /history` - Get processing history
- `GET /download/{file}` - Download processed files

## 📊 Monitor Your Deployment

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Click your project**
3. **View in real-time**:
   - 📋 Logs - See what your app is doing
   - 📈 Metrics - CPU, Memory, Network
   - 🔄 Deployments - View deployment history
   - ⚙️ Settings - Configure environment variables

## 🔧 Environment Variables (Optional)

Add in Railway Dashboard → Variables:

| Key | Value | Purpose |
|-----|-------|---------|
| `PYTHONUNBUFFERED` | `true` | Real-time logging |
| `LOG_LEVEL` | `info` | Logging level |

## ⚡ Railway Advantages

- **Blazing fast deployments** - Deploy in seconds
- **Zero cold starts** - Always warm
- **Generous free tier** - $5 free credit monthly
- **Pay as you go** - Only pay for what you use
- **Native GitHub integration** - Auto-deploy on push
- **Built-in observability** - Logs, metrics, alerts included

## 🎯 Pricing Estimates

- **Free Tier**: $5/month credit (excellent for testing)
- **Small API**: ~$5-10/month
- **Medium API**: ~$15-25/month
- **Production**: Depends on traffic

## 🔑 Key Features

✨ **Auto-Scaling** - Scales based on demand  
✨ **Zero Downtime Deploys** - Update without interruption  
✨ **Database Ready** - Easy to add PostgreSQL, Redis, MySQL  
✨ **Environment Isolation** - Dev, staging, production environments  
✨ **Custom Domains** - Add your own domain name  

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Logs tab - usually missing dependency |
| Port error | Already handled - Railway sets PORT env var |
| Module not found | Verify all imports match file names |
| Deployment slow | First deploy takes longer, subsequent ones are faster |
| CORS errors | Add frontend domain to cors_origins in main.py |
| Files disappearing | Normal - ephemeral storage. Use Railway's file system or S3 |

## 🚀 Auto-Deploy from GitHub

For automatic deployment on every push:

1. Connect your GitHub repo in Railway Dashboard
2. Railway automatically deploys on `main` branch changes
3. View deployment in real-time in the Logs tab

## 📚 Railway Documentation

- Main Docs: https://docs.railway.app
- Python Support: https://docs.railway.app/guides/native-environments#python
- Environment Variables: https://docs.railway.app/basics/environment-variables

## ✨ Next Steps

1. ✅ Push code to GitHub
2. ✅ Go to Railway Dashboard
3. ✅ Deploy your repository
4. ✅ Copy the generated API URL
5. ✅ Update frontend with the API URL
6. ✅ Test endpoints

**Your backend is ready for Railway!** 🎉

---

**Pro Tip**: Once deployed, Railway automatically updates your service whenever you push to GitHub. No manual deployments needed!
