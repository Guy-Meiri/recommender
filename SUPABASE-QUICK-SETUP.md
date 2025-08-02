# 🚀 Quick Su**Redirect URLs** (add these o1. **Local testing**: http://localhost:3002/test-authe per line in the text area):
```
http://localhost:3002/auth/confirm
http://localhost:3002/auth/callback
https://recommender-eight.vercel.app/auth/confirm
https://recommender-eight.vercel.app/auth/callback
```Setup for Production

## Your App URL: https://recommender-eight.vercel.app

### Step 1: Configure Supabase Dashboard

1. **Go to Supabase**: https://app.supabase.com
2. **Select your project** (the one with your database)
3. **In the left sidebar**, click **"Authentication"**
4. **Click on "URL Configuration"** (it's a tab at the top of the Authentication section)

**Site URL**: `https://recommender-eight.vercel.app`

**Redirect URLs** (add these one per line in the text area):
```
http://localhost:3000/auth/confirm
http://localhost:3000/auth/callback
https://recommender-eight.vercel.app/auth/confirm
https://recommender-eight.vercel.app/auth/callback
```

💡 **Note**: In the Redirect URLs section, you'll see a text area where you can add multiple URLs, one per line.

### Step 2: Enable Email Confirmations

1. **Still in Authentication section**, click **"Settings"** (another tab at the top)
2. **Scroll down** to find **"Enable email confirmations"**
3. **Toggle it ON** ✅ (make sure the switch is enabled/green)

### Step 3: Enable Email Template

1. **Still in Authentication section**, click **"Email Templates"** (another tab at the top)
2. **Find "Confirm signup"** in the list of templates
3. **Make sure it's ENABLED** ✅ (there should be a toggle or checkmark)
4. The default template should work fine, but you can customize it if needed

### Step 4: Test
1. **Local testing**: http://localhost:3000/test-auth
2. **Production testing**: https://recommender-eight.vercel.app (after deployment)

### Step 5: Deploy
Your app is already configured to automatically use the correct domain for email redirects using `window.location.origin`, so it will work correctly in both development and production!
