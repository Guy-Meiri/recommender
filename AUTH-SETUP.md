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
- **Development**: `http://localhost:3000` (or whatever port you're using)
- **Production**: `https://recommender-eight.vercel.app`

### 3. Configure Redirect URLs
Add these **Redirect URLs** (one per line):
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
https://recommender-eight.vercel.app/auth/callback
https://recommender-eight.vercel.app/auth/confirm
```

**Note**: Both `/auth/callback` and `/auth/confirm` are included for compatibility. The `/auth/confirm` route will redirect to `/auth/callback` for code-based confirmations.

### 4. **IMPORTANT: Enable Email Confirmation**
1. Go to **Authentication** → **Settings**
2. Find **"Enable email confirmations"** setting
3. **Make sure it's ENABLED** (toggle should be ON)
4. Set **"Email confirm change"** to **24 hours** (or your preferred duration)

### 5. **Configure Email Templates**
1. Go to **Authentication** → **Email Templates**
2. Find **"Confirm Signup"** template
3. Make sure it's **ENABLED**
4. The default template should work, but you can customize it:
   ```html
   <h2>Confirm your signup</h2>
   <p>Follow this link to confirm your user:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
   ```

### 6. **Check SMTP Settings (Important!)**
1. Go to **Settings** → **Authentication**
2. Scroll down to **"SMTP Settings"**
3. **If using default Supabase SMTP**: Make sure it's enabled
4. **If using custom SMTP**: Verify your settings are correct

### 7. **Verify Email Provider Settings**
1. Go to **Authentication** → **Providers**
2. Make sure **"Email"** provider is **ENABLED**
3. Check that **"Confirm email"** is **ENABLED**

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
   - Go to http://localhost:3000
   - Click "Don't have an account? Sign up"
   - Enter email and password
   - Check your email for confirmation link
   - Click the link to confirm

3. **Test with different domains**:
   - The system automatically uses `window.location.origin` for redirect URLs
   - Works in development, staging, and production environments

## Production Deployment

When deploying to production:
1. Update the **Site URL** in Supabase to `https://recommender-eight.vercel.app`
2. Add your production domain to the **Redirect URLs** list:
   - `https://recommender-eight.vercel.app/auth/confirm`
   - `https://recommender-eight.vercel.app/auth/callback`
3. The app will automatically use the correct domain for email redirects

## Troubleshooting

### No Confirmation Email Received
1. **Check Supabase Settings**:
   - ✅ Email confirmations are ENABLED in Authentication → Settings
   - ✅ "Confirm Signup" email template is ENABLED
   - ✅ Email provider is ENABLED in Authentication → Providers
   - ✅ SMTP settings are configured (or using default Supabase SMTP)

2. **Check Email Issues**:
   - 📧 Check spam/junk folder
   - 📧 Try a different email address
   - 📧 Make sure the email address is valid

3. **Check Console Logs**:
   - Open browser DevTools → Console
   - Look for any signup errors
   - Check Network tab for failed requests

4. **Test with Different User**:
   - Try signing up with a completely new email
   - Users can only receive confirmation emails once

5. **Verify Environment Variables**:
   ```bash
   # Check your .env.local file has correct values
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Common Issues and Solutions

**Issue**: "Invalid redirect URL" error
- **Solution**: Make sure the exact URLs are added to Supabase redirect URLs list

**Issue**: Link goes to wrong domain
- **Solution**: Update Site URL in Supabase to match your current domain

**Issue**: "Token expired" error  
- **Solution**: Confirmation links expire after 24 hours by default

**Issue**: Email template not working
- **Solution**: Make sure the template includes `{{ .ConfirmationURL }}` placeholder

### Testing the Email Flow

1. **Enable Debug Mode** (temporary):
   ```tsx
   // Add this to your Auth component temporarily
   console.log('Signup attempt with:', { email, redirectTo: `${window.location.origin}/auth/confirm` });
   ```

2. **Check Supabase Logs**:
   - Go to your Supabase project
   - Navigate to **Logs** → **Auth Logs**
   - Look for signup events and any errors

3. **Test Email Delivery**:
   - Try with Gmail, Yahoo, Outlook to rule out email provider issues
   - Use a temporary email service like 10minutemail.com for testing

- **Link still goes to localhost**: Clear browser cache and check Supabase URL configuration
- **"Invalid redirect URL" error**: Verify the exact URLs are added to Supabase dashboard
- **Email not received**: Check spam folder, verify email template is enabled
- **Token expired**: Links expire after 24 hours by default (configurable in Supabase)
