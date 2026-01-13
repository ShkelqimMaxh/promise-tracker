# Local Setup Guide - Connect to Railway Environment

This guide explains how to configure your local development environment to use the same configuration as your Railway deployment.

## Option 1: Use Railway Database (DATABASE_URL)

If you want to connect to the **same database** as your Railway deployment:

1. **Get DATABASE_URL from Railway:**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click on your **PostgreSQL database service**
   - Go to **"Variables"** tab
   - Copy the `DATABASE_URL` value (it looks like: `postgresql://postgres:password@host:port/railway`)

2. **Get other environment variables from Railway:**
   - Click on your **backend service** (not the database)
   - Go to **"Variables"** tab
   - Copy all the environment variables listed there

3. **Create `.env` file in the `backend/` directory:**

```env
# Server Configuration
PORT=3000

# Database Configuration - Use Railway Database
DATABASE_URL=postgresql://postgres:your_password@your_host:port/railway

# JWT Configuration - Copy from Railway
JWT_SECRET=your-jwt-secret-from-railway
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=*

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id-from-railway
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-railway

# Environment
NODE_ENV=development
```

**Important Notes:**
- When using `DATABASE_URL`, the app will automatically use SSL connections (same as production)
- Your local app will use the **same database** as production - be careful with data!
- Make sure to set `NODE_ENV=development` so SSL is disabled for local connections

## Option 2: Use Local Database with Railway Config

If you want to keep a **local database** but use the same **JWT secrets** and other config:

1. **Get environment variables from Railway** (except DATABASE_URL):
   - Go to Railway Dashboard → Your backend service → Variables tab
   - Copy: `JWT_SECRET`, `CORS_ORIGIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

2. **Create `.env` file:**

```env
# Server Configuration
PORT=3000

# Database Configuration - Use Local Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=promise_tracker
DB_USER=postgres
DB_PASSWORD=your_local_password

# JWT Configuration - Copy from Railway (IMPORTANT: Use same secrets!)
JWT_SECRET=your-jwt-secret-from-railway
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:8081

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id-from-railway
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-railway

# Environment
NODE_ENV=development
```

**Note:** Using the same `JWT_SECRET` means tokens generated locally will work with your online app (and vice versa), which can be useful for testing.

## Switching Between Multiple Railway Environments

If you have **multiple Railway deployments** (e.g., staging and production):

### Method 1: Use Different .env Files

1. Create `.env.production` and `.env.staging` files
2. Use `dotenv-cli` to load specific env file:
   ```bash
   npm install -g dotenv-cli
   dotenv -e .env.production npm run dev
   ```

### Method 2: Use Environment-Specific Variables

1. Create separate `.env` files:
   - `.env.production.local`
   - `.env.staging.local`

2. Update `package.json` scripts:
   ```json
   {
     "scripts": {
       "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
       "dev:prod": "dotenv -e .env.production.local -- ts-node-dev --respawn --transpile-only src/index.ts",
       "dev:staging": "dotenv -e .env.staging.local -- ts-node-dev --respawn --transpile-only src/index.ts"
     }
   }
   ```

3. Run with:
   ```bash
   npm run dev:prod    # Uses production Railway config
   npm run dev:staging # Uses staging Railway config
   ```

## Quick Steps to Set Up

1. **Go to Railway Dashboard:**
   - https://railway.app/dashboard
   - Select your project

2. **Copy Database URL:**
   - Click on PostgreSQL service → Variables → Copy `DATABASE_URL`

3. **Copy Backend Variables:**
   - Click on your backend service → Variables tab
   - Copy all variables (JWT_SECRET, GOOGLE_CLIENT_ID, etc.)

4. **Create `.env` file:**
   ```bash
   cd backend
   touch .env
   ```

5. **Paste variables into `.env`** (use Option 1 or Option 2 above)

6. **Start your local server:**
   ```bash
   npm run dev
   ```

## Security Note

⚠️ **Never commit `.env` files to git!** They contain sensitive secrets.

The `.gitignore` should already exclude `.env` files, but verify it includes:
```
.env
.env.*
!.env.example
```

## Troubleshooting

### "Database connection error"
- Make sure `DATABASE_URL` is correct (copy from Railway exactly)
- If using Railway database, make sure your IP is allowed (Railway databases are usually accessible from anywhere)

### "JWT verification failed"
- Make sure `JWT_SECRET` matches exactly what's in Railway
- Tokens generated with different secrets won't work

### "CORS error"
- Update `CORS_ORIGIN` in Railway to include `http://localhost:3000` (if needed)
- Or set `CORS_ORIGIN=*` in your local `.env`
