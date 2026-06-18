# Global Transaction Validator API - Render Deployment Guide

This backend is now ready for production deployment on **Render.com**.

## 📋 Prerequisites

- GitHub account with this repository connected
- Render.com account (sign up at https://render.com)

## 🚀 One-Click Deployment to Render

### Method 1: Using render.yaml (Recommended - Easiest)

1. **Commit and Push** your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare backend for Render deployment"
   git push
   ```

2. **Go to Render Dashboard**: https://dashboard.render.com

3. **Click "New +" → "Web Service"**

4. **Select your GitHub repository**

5. **Render will automatically detect `render.yaml`** and configure everything for you

6. **Click "Create Web Service"** and wait for deployment (2-3 minutes)

### Method 2: Manual Configuration

If Method 1 doesn't auto-detect the render.yaml:

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New +" → "Web Service"**

3. **Select your GitHub repository**

4. **Configure these settings:**
   - **Name**: `xeno-transaction-validator-api`
   - **Runtime**: Python 3.13
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free or Starter (as needed)

5. **Click "Create Web Service"** and wait for deployment

## ✅ Deployment Checklist

The following changes have been made to your backend:

- ✅ Added environment variable support for `PORT` (Render's requirement)
- ✅ Configured to listen on `0.0.0.0` (required for cloud deployment)
- ✅ Added `Procfile` for web server configuration
- ✅ Added `render.yaml` for one-click deployment
- ✅ Created `.gitignore` to keep repo size small
- ✅ Updated `requirements.txt` with production dependencies
- ✅ Updated `runtime.txt` with specific Python version
- ✅ Added `/health` endpoint for Render health checks
- ✅ Main entry point configured for production mode

## 🔧 Key Configurations

### Environment Variables (Optional - set in Render Dashboard)

- `PYTHONUNBUFFERED=true` - Ensures Python logs appear in real-time
- `CORS_ORIGINS` - Add your frontend URL for CORS if needed

### Storage Notes

- **Uploaded files** are stored in ephemeral storage (`/storage/uploads/`)
- **Processed files** are stored in ephemeral storage (`/storage/processed/`)
- Files persist **during the current deployment** but are cleared on redeploy
- For persistent storage, consider integrating **AWS S3** or **Cloudinary**

## 🌐 Accessing Your API

After deployment, your API will be accessible at:
```
https://xeno-transaction-validator-api.onrender.com
```

### Available Endpoints

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

1. Go to your service on Render Dashboard
2. Click **"Logs"** tab to see real-time logs
3. Check **"Metrics"** for CPU and memory usage
4. Monitor **"Health"** - should show green if `/health` endpoint is working

## 🔗 Connect with Frontend

Update your frontend's API URL in `api.ts`:

```typescript
const API_BASE_URL = "https://xeno-transaction-validator-api.onrender.com";
```

## ⚠️ Important Notes

1. **Free Tier Limitations**: Render's free tier may spin down after 15 minutes of inactivity
2. **Upload Size Limit**: Currently set to 500MB per file
3. **Ephemeral Storage**: Files are temporary - consider adding persistent storage for production
4. **CORS**: Currently allows all origins (`*`). In production, restrict this to your frontend domain

## 🆘 Troubleshooting

### Deployment fails
- Check **Logs** tab in Render Dashboard
- Ensure all files are committed to Git
- Verify Python version compatibility

### "Port not available" error
- This is already handled in the code
- Render automatically sets the `PORT` environment variable

### "Module not found" error
- Ensure `requirements.txt` is in the same directory as `main.py`
- Check that all imports match your file names

### Files disappearing after redeploy
- This is expected - Render uses ephemeral storage
- Implement S3 integration for persistent storage

## 📝 Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy using Render Dashboard
3. ✅ Test endpoints with curl or Postman
4. ✅ Update frontend API URL
5. ✅ Monitor logs and performance

**Your backend is ready to deploy!** 🎉
