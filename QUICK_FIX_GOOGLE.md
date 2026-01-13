# Quick Fix for Google OAuth Error

The error you're seeing is because Google OAuth credentials aren't configured yet. 

## Option 1: Hide Google Sign-In (Temporary Fix)

The Google Sign-In button is already hidden when credentials aren't configured. However, the hook still initializes and causes the error on web.

To completely remove the error **temporarily**, you can comment out the Google OAuth code in `mobile/src/screens/SignIn.tsx`:

1. Find the Google OAuth hook initialization (around line 47-90)
2. Comment out the `Google.useAuthRequest` call
3. Make sure `hasGoogleConfig` is always `false`

## Option 2: Set Up Google OAuth (Recommended)

Follow the instructions in `GOOGLE_OAUTH_SETUP.md` to:
1. Create Google OAuth credentials in Google Cloud Console
2. Add them to your `.env` file

**Minimum for web:**
```bash
# In mobile/.env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

After adding the env variable, restart your Expo dev server.

## Option 3: Quick Test (Use Placeholder)

For testing only, you can add a placeholder in `mobile/.env`:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=placeholder.apps.googleusercontent.com
```

This will stop the error, but Google Sign-In won't actually work until you use real credentials.

---

**For now, the email/password sign-in should still work fine!** The Google OAuth is optional.
