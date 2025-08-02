# Authentication Setup Guide

## Problem Fixed
The issue with email confirmation links redirecting to localhost has been resolved by implementing proper authentication flow with redirect URLs.

## Changes Made

### 1. New Authentication Pages
- **`/auth/confirm`** - Handles email confirmation from signup links
- **`/auth/callback`** - Handles OAuth and email link callbacks
- **`/auth/auth-code-error`** - Error page for failed authentication

### 2. Updated Components
- **Auth component** - Now includes proper `emailRedirectTo` URL for signup
- **Loading states** - Added spinners for all authentication flows

## Supabase Dashboard Configuration

To complete the setup, you need to configure the authentication URLs in your Supabase dashboard:

### 1. Go to Authentication Settings
1. Open your Supabase project: https://app.supabase.com
2. Navigate to **Authentication** → **URL Configuration**

### 2. Configure Site URL
Set your **Site URL** to:
- **Development**: `http://localhost:3001`
- **Production**: `https://your-domain.com`

### 3. Configure Redirect URLs
Add these **Redirect URLs** (one per line):
```
http://localhost:3001/auth/confirm
http://localhost:3001/auth/callback
https://your-domain.com/auth/confirm
https://your-domain.com/auth/callback
```

### 4. Email Templates (Optional)
You can customize email templates in **Authentication** → **Email Templates**:
- **Confirm signup**: Use `{{ .ConfirmationURL }}` for the confirmation link
- **Magic Link**: Use `{{ .ConfirmationURL }}` for the magic link

## How It Works

### Email Signup Flow
1. User signs up with email/password
2. Supabase sends confirmation email with link to `/auth/confirm`
3. User clicks link in email
4. `/auth/confirm` page verifies the token
5. User is redirected to home page with authenticated session

### Error Handling
- Invalid/expired links redirect to `/auth/auth-code-error`
- Network errors show appropriate error messages
- Loading states provide user feedback

## Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test signup flow**:
   - Go to http://localhost:3001
   - Click "Don't have an account? Sign up"
   - Enter email and password
   - Check your email for confirmation link
   - Click the link to confirm

3. **Test with different domains**:
   - The system automatically uses `window.location.origin` for redirect URLs
   - Works in development, staging, and production environments

## Production Deployment

When deploying to production:
1. Update the **Site URL** in Supabase to your production domain
2. Add your production domain to the **Redirect URLs** list
3. The app will automatically use the correct domain for email redirects

## Troubleshooting

- **Link still goes to localhost**: Clear browser cache and check Supabase URL configuration
- **"Invalid redirect URL" error**: Verify the exact URLs are added to Supabase dashboard
- **Email not received**: Check spam folder, verify email template is enabled
- **Token expired**: Links expire after 24 hours by default (configurable in Supabase)
