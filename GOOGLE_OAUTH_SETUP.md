# Google OAuth Setup Guide

This guide will help you set up Google OAuth for login/registration in your Promise Tracker app.

## Prerequisites

1. Google Cloud Console account
2. Backend and mobile apps set up

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - Choose "External" (unless you have a Google Workspace)
     - Fill in required fields (App name, User support email, Developer contact)
     - Add scopes: `email`, `profile`, `openid`
     - Add test users (if needed)

5. Create OAuth Client IDs for each platform:
   - **Web application** (for Expo web):
     - Name: "Promise Tracker Web"
     - Authorized JavaScript origins: `http://localhost:8081`, `https://your-domain.com`
     - Authorized redirect URIs: `https://auth.expo.io/@your-expo-username/promise-tracker-mobile`, `http://localhost:8081`
     - **Save the Client ID** (you'll need this)
   
   - **iOS** (if deploying to iOS):
     - Name: "Promise Tracker iOS"
     - Bundle ID: `com.promisetracker.mobile` (or your bundle ID from app.json)
     - **Save the Client ID**
   
   - **Android** (if deploying to Android):
     - Name: "Promise Tracker Android"
     - Package name: `com.promisetracker.mobile` (or your package from app.json)
     - SHA-1 certificate fingerprint (get this from Expo/EAS build)
     - **Save the Client ID**

## Step 2: Update Backend Environment Variables

Add to your `backend/.env` file:

```env
GOOGLE_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-web-client-secret-here
```

**Important**: Use the **Web application** client ID and secret for the backend.

## Step 3: Update Mobile App Environment Variables

Add to your `mobile/.env` file (create if doesn't exist):

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id-here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id-here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
```

Or you can also set these in `mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "googleClientId": "your-web-client-id-here.apps.googleusercontent.com",
      "googleIosClientId": "your-ios-client-id-here.apps.googleusercontent.com",
      "googleAndroidClientId": "your-android-client-id-here.apps.googleusercontent.com",
      "googleWebClientId": "your-web-client-id-here.apps.googleusercontent.com"
    }
  }
}
```

## Step 4: Install Required Packages

### Backend:
```bash
cd backend
npm install google-auth-library
```

### Mobile:
```bash
cd mobile
npm install expo-auth-session expo-web-browser
```

## Step 5: Update Database Schema

The code already includes the database migration, but if you need to run it manually:

```sql
-- Make password_hash nullable
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add google_id column
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;

-- Add index for google_id
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
```

Or simply restart your backend server - it will automatically update the schema on startup.

## Step 6: Test the Implementation

1. **Start your backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start your mobile app**:
   ```bash
   cd mobile
   npm start
   ```

3. **Test Google Sign-In**:
   - Open the app
   - Click "Continue with Google"
   - Sign in with your Google account
   - You should be logged in and redirected to the promises page

## Troubleshooting

### "Invalid Google token" error
- Check that `GOOGLE_CLIENT_ID` in backend matches the Web Client ID
- Verify the ID token is being sent correctly from the mobile app

### "OAuth client not found"
- Double-check your Client IDs are correct
- Make sure you're using the right Client ID for each platform
- For Expo Go, use the Web Client ID

### Google Sign-In button doesn't work
- Check that `expo-auth-session` and `expo-web-browser` are installed
- Verify environment variables are set correctly
- Check browser console/React Native logs for errors

### Database errors
- Make sure the database schema has been updated
- Check that `password_hash` is nullable
- Verify `google_id` column exists

## Security Notes

1. **Never commit** `.env` files to version control
2. Keep your `GOOGLE_CLIENT_SECRET` secure - it should only be on the backend
3. Use different Client IDs for development and production
4. Regularly rotate your OAuth credentials
5. Set up proper redirect URIs for production domains

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession Documentation](https://docs.expo.dev/guides/authentication/#google)
- [Google Cloud Console](https://console.cloud.google.com/)
