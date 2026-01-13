# Railway Deployment Guide - Complete Step-by-Step

This guide will walk you through deploying your Promise Tracker backend to Railway.

## Prerequisites
- GitHub account (to connect your repo)
- Railway account (we'll create this)
- Your backend code ready to deploy

---

## Step 1: Create Railway Account

1. **Go to Railway**: https://railway.app
2. **Click "Start a New Project"** or **"Login"** (if you have an account)
3. **Sign up with GitHub** (recommended) - This allows Railway to access your repositories
   - Click "Login with GitHub"
   - Authorize Railway to access your GitHub account
4. **Choose the $5/month plan** (or start with free trial if available)

---

## Step 2: Prepare Your Backend Code for Railway

### 2.1 Update package.json Scripts

Your `package.json` needs production scripts. We'll update it:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
  }
}
```

### 2.2 Update Database Configuration

Railway provides a `DATABASE_URL` environment variable. We need to update your database config to support this.

### 2.3 Create railway.json (Optional)

Railway auto-detects Node.js projects, but you can create a `railway.json` file for custom configuration.

---

## Step 3: Push Your Code to GitHub (If Not Already)

1. **Go to your project directory**:
   ```bash
   cd /Users/shkelqimmaxharraj/Documents/Projects/Personal/promise-tracker
   ```

2. **Initialize git** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Name it (e.g., "promise-tracker")
   - Don't initialize with README (you already have code)
   - Click "Create repository"

4. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/promise-tracker.git
   git branch -M main
   git push -u origin main
   ```

**OR** if you only want to deploy the backend folder:
```bash
cd backend
git init
git add .
git commit -m "Backend for Railway deployment"
# Create a repo for just the backend
git remote add origin https://github.com/YOUR_USERNAME/promise-tracker-backend.git
git push -u origin main
```

---

## Step 4: Create Railway Project

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository** (promise-tracker or promise-tracker-backend)
5. **Railway will detect it's a Node.js project**

---

## Step 5: Set Up Database on Railway

1. **In your Railway project**, click **"+ New"**
2. **Select "Database"** → **"Add PostgreSQL"**
3. **Railway will create a PostgreSQL database**
4. **Click on the PostgreSQL service** to see connection details
5. **Copy the `DATABASE_URL`** - You'll need this (it looks like: `postgresql://postgres:password@host:port/railway`)

---

## Step 6: Configure Your Backend Service

1. **Click on your backend service** in Railway (should be your GitHub repo)
2. **Go to "Variables" tab**
3. **Add the following environment variables**:

### Required Environment Variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DATABASE_URL` | (Auto-filled by Railway) | Automatically added when you link the database |
| `PORT` | `3000` | Railway will override this, but set it anyway |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | **Generate a random string** (keep this secret!) |
| `CORS_ORIGIN` | `*` or your frontend URL | Use `*` for now, or your mobile app URL |
| `GOOGLE_CLIENT_ID` | (Your Google OAuth Client ID) | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | (Your Google OAuth Client Secret) | From Google Cloud Console |

### How to Generate JWT_SECRET:
Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

### Link Database to Your Service:
1. In your backend service, go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Railway should auto-detect the database and offer to add `DATABASE_URL`
4. Click **"Add"** - This automatically links your database

**OR manually:**
- Click **"+ New Variable"**
- Name: `DATABASE_URL`
- Value: (Copy from PostgreSQL service → Variables tab → `DATABASE_URL`)

---

## Step 7: Configure Build Settings (If Needed)

1. **Click on your backend service**
2. **Go to "Settings" tab**
3. **Check "Root Directory"**:
   - If your backend is in a `backend/` folder: Set to `backend`
   - If backend is the root: Leave empty
4. **Build Command**: Railway auto-detects, but ensure it's: `npm run build`
5. **Start Command**: Should be: `npm start`

---

## Step 8: Deploy!

1. **Railway will automatically deploy** when you:
   - Push code to your GitHub repo
   - Add environment variables
   - Make changes

2. **Go to "Deployments" tab** to see deployment progress

3. **Wait for deployment to complete** (usually 2-5 minutes)

4. **Check logs** if there are errors:
   - Click on your service
   - Go to "Logs" tab
   - Look for any error messages

---

## Step 9: Get Your Backend URL

1. **Click on your backend service**
2. **Go to "Settings" tab**
3. **Scroll down to "Networking"**
4. **Generate Domain** (if not already generated)
5. **Copy the URL** - This is your backend API URL!
   - Example: `https://your-app-name.up.railway.app`

---

## Step 10: Test Your Deployment

1. **Open your browser** or use `curl`:
   ```bash
   curl https://your-app-name.up.railway.app/
   ```

   Should return:
   ```json
   {"message":"Promise Tracker API","version":"1.0.0"}
   ```

2. **Test health endpoint**:
   ```bash
   curl https://your-app-name.up.railway.app/health
   ```

---

## Step 11: Update Your Mobile App

Update your mobile app to use the Railway backend URL:

1. **Open** `mobile/.env` file
2. **Update** `EXPO_PUBLIC_API_URL`:
   ```
   EXPO_PUBLIC_API_URL=https://your-app-name.up.railway.app/api
   ```

3. **Also update** `CORS_ORIGIN` in Railway (if you want to restrict):
   - Go to Railway → Your Service → Variables
   - Update `CORS_ORIGIN` to your frontend URL (or keep `*` for now)

---

## Step 12: Monitor and Troubleshoot

### Check Logs:
- Railway Dashboard → Your Service → "Logs" tab
- See real-time logs of your application

### Common Issues:

1. **Build fails**:
   - Check logs for TypeScript errors
   - Make sure `package.json` has correct build script
   - Ensure all dependencies are in `dependencies` (not `devDependencies`)

2. **Database connection fails**:
   - Verify `DATABASE_URL` is set correctly
   - Check database service is running (green status)
   - Check logs for connection errors

3. **App crashes on start**:
   - Check logs for runtime errors
   - Verify all environment variables are set
   - Check database migrations ran successfully

---

## Step 13: Set Up Custom Domain (Optional)

1. **Go to your service** → **Settings** → **Networking**
2. **Click "Generate Domain"** (if not done)
3. **Custom Domain** (optional):
   - Add your own domain
   - Follow Railway's DNS instructions

---

## Summary Checklist

- [ ] Created Railway account
- [ ] Code pushed to GitHub
- [ ] Created Railway project from GitHub
- [ ] Added PostgreSQL database
- [ ] Added all environment variables
- [ ] Linked database to service
- [ ] Deployment successful
- [ ] Got backend URL
- [ ] Tested API endpoints
- [ ] Updated mobile app with new URL

---

## Cost Estimate

- **Railway Starter Plan**: $5/month
- **PostgreSQL Database**: Included (or ~$5/month if separate)
- **Total**: ~$5-10/month

For 10-15 users, you'll likely stay within the $5/month plan limits.

---

## Next Steps

1. Test your API with your mobile app
2. Monitor logs and performance
3. Set up backups (Railway has automatic backups)
4. Scale up if needed (Railway makes this easy)

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check logs in Railway dashboard for errors

---

**Congratulations! Your backend is now live on Railway! 🚀**
