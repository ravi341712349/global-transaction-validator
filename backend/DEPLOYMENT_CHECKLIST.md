# Render Deployment Checklist ✅

## Before Deployment

- [ ] All code committed to GitHub
- [ ] `requirements.txt` updated with all dependencies
- [ ] `Procfile` exists in backend directory
- [ ] `render.yaml` exists in backend directory
- [ ] `.gitignore` configured to exclude storage/data directories
- [ ] `runtime.txt` specifies Python version

## Deployment Steps

### Step 1: Push to GitHub
```bash
cd backend
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### Step 2: Deploy to Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Select your GitHub repository
4. Render will auto-detect `render.yaml` configuration
5. Click "Create Web Service"

### Step 3: Wait for Deployment
- Initial build: 2-3 minutes
- Check Logs tab if there are issues
- Green "Running" status = Success ✅

### Step 4: Test Your API
```bash
# Test health endpoint
curl https://xeno-transaction-validator-api.onrender.com/health

# Response should be:
# {"status":"healthy","service":"Global Transaction Validator API"}
```

## After Deployment

### Update Frontend
In `frontend/src/api.ts`, update the base URL:
```typescript
const API_BASE_URL = process.env.VITE_API_URL || "https://xeno-transaction-validator-api.onrender.com";
```

### Configure Environment Variables (if needed)
In Render Dashboard → Service Settings → Environment:
- `PYTHONUNBUFFERED`: `true`

### Monitor
- Check Logs tab regularly
- Monitor Memory/CPU usage
- Track API response times

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Logs tab, verify requirements.txt syntax |
| Port error | Already handled - PORT env var is set by Render |
| Module not found | Ensure all imports match actual file names |
| CORS errors | Add frontend URL to cors_origins in main.py |
| Files disappear | Normal - use S3 for persistent storage |

## Production Tips

1. **Add error tracking**: Sentry integration
2. **Add persistent storage**: AWS S3 or Cloudinary
3. **Optimize dependencies**: Remove unused packages from requirements.txt
4. **Enable logging**: Already configured to INFO level
5. **Add health checks**: `/health` endpoint created
6. **Set up monitoring**: Render provides built-in metrics

## Cost Estimation
- **Free Tier**: Suitable for testing (spins down after inactivity)
- **Starter**: $7/month - Better for light production use
- **Standard**: $12/month - For regular production use

## One-Click Deployment URL
After first successful deployment, you can redeploy directly from:
```
https://dashboard.render.com/services
```
Just click on your service and select "Manual Deploy" or push to GitHub for auto-deploy.

---
✨ **Your backend is production-ready!** ✨
