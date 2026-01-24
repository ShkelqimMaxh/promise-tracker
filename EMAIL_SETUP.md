# Email Setup Guide for MyPromises

## Overview

The application now supports sending emails to promisees and mentors, even if they don't have an account yet. When a user makes a promise to someone or sets them as a mentor, an email invitation will be sent automatically.

## Environment Variables Required

Add these environment variables to your backend `.env` file and Railway deployment:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Email Configuration
FROM_EMAIL=noreply@mypromises.app

# App URL (for email links)
APP_URL=https://mypromises.app
# Or for development:
# APP_URL=http://localhost:8081
```

## SendGrid Setup

1. **Get your SendGrid API Key:**
   - Log in to your SendGrid account
   - Go to Settings → API Keys
   - Create a new API key with "Full Access" or at least "Mail Send" permissions
   - Copy the API key and add it to your environment variables

2. **Verify your domain (mypromises.app):**
   - In SendGrid, go to Settings → Sender Authentication
   - Add and verify your domain (mypromises.app)
   - This ensures emails are sent from your domain and improves deliverability

3. **Configure DNS records in Porkbun:**
   - Follow SendGrid's instructions to add the required DNS records (SPF, DKIM, etc.)
   - This is important for email deliverability

## Installation

Make sure to install the SendGrid package:

```bash
cd backend
npm install @sendgrid/mail
```

## How It Works

1. **Promise Creation:**
   - When creating a promise, you can provide either:
     - `promisee_id` / `mentor_id` (if user exists)
     - `promisee_email` / `mentor_email` (if user doesn't exist)
   - The system will automatically:
     - Try to find users by email
     - If found, use their user ID
     - If not found, store the email address
     - Send an email invitation to the promisee/mentor

2. **Email Linking:**
   - When a user registers or logs in with an email that matches a stored `promisee_email` or `mentor_email`, the system automatically links the promise to their user account
   - This happens automatically in the background

3. **Email Templates:**
   - Promise invitations include:
     - The promiser's name
     - The promise title and description
     - A link to sign up/join MyPromises
   - Mentorship invitations include similar information plus details about the mentor role

## Testing

To test the email functionality:

1. Create a promise with an email address that doesn't exist in the system
2. Check the email inbox for the invitation
3. Register with that email address
4. The promise should automatically appear in the new user's dashboard

## Troubleshooting

- **Emails not sending:** Check that `SENDGRID_API_KEY` is set correctly
- **Emails going to spam:** Ensure your domain is verified in SendGrid and DNS records are correct
- **Email links not working:** Verify `APP_URL` is set to your production domain
