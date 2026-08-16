# Google Sign-In & Login Setup Guide

This document explains how to set up Google authentication for the Zemam application.

## Prerequisites

- Google Cloud Project with OAuth 2.0 credentials
- Both backend and frontend running locally

## Step 1: Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3000/login`
   - (Add your production domain later)
7. Copy the **Client ID** (you'll need this)

## Step 2: Configure Environment Variables

### Backend (.env)
```
PORT=3001
DB_URL=mongodb://localhost:27017/zemam
JWT_SECRET_KEY=super_secret_key_for_zemam_123
NODE_ENV=development
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

⚠️ **Important:** Make sure to replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Google Client ID

## Step 3: How It Works

### Frontend Flow:
1. User clicks "تسجيل الدخول بواسطة Google" button
2. Google Sign-In SDK renders the official Google button
3. User authenticates with their Google account
4. Google returns an `id_token` (credential)
5. Frontend sends the credential to backend: `POST /api/auth/google`

### Backend Flow:
1. Receives credential token from frontend
2. Verifies the token using Google's OAuth library
3. Extracts user info (email, name, googleId)
4. Checks if user exists in database:
   - If exists: logs them in
   - If new: creates new user with `provider: "google"`
5. Generates JWT token and sets secure cookie
6. Returns user data and token to frontend

### Database:
The User model now supports:
- `googleId` - Unique Google user ID
- `provider` - Either "local" or "google"
- `password` - Optional (not used for Google accounts)

## Step 4: Testing

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:3000/login`
4. Click the Google Sign-In button
5. Complete Google authentication
6. You should be redirected to the dashboard

## Step 5: Account Linking (Optional Enhancement)

The current implementation supports account linking:
- If a user signs up locally with email `user@example.com`
- Then tries to login with Google using the same email
- The system will link the Google account to their existing account
- They can then use either method to login

## Security Notes

✅ All tokens are:
- Verified using Google's official library
- Stored in HTTP-only, secure cookies
- Signed with your JWT_SECRET_KEY
- Set to expire after 10 days

✅ Production checklist:
- [ ] Use HTTPS only (secure: true in cookies)
- [ ] Update GOOGLE_CLIENT_ID with production credentials
- [ ] Add production domain to Google OAuth authorized URIs
- [ ] Set proper CORS origin
- [ ] Use strong JWT_SECRET_KEY
- [ ] Set NODE_ENV=production

## Troubleshooting

### Issue: "Google credential is required" error
- Check if Google Client ID is set in `.env`
- Verify Google SDK script is loaded in frontend

### Issue: "Invalid credential" error
- Ensure GOOGLE_CLIENT_ID is the same in frontend and backend
- Check if Google Client ID matches your Google Cloud project

### Issue: Button not rendering
- Verify `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- Check browser console for errors
- Make sure Google SDK script loaded: check Network tab for `accounts.google.com/gsi/client`

### Issue: CORS errors
- Update CORS origin in backend/index.js if needed
- Ensure credentials: true is set in CORS config

## API Endpoints

### Traditional Login
```
POST /api/auth/login
Body: { email: string, password: string }
```

### Google Login
```
POST /api/auth/google
Body: { credential: string }  // JWT from Google
```

### Signup
```
POST /api/auth/signup
Body: { email: string, password: string, name: string }
```

### Logout
```
POST /api/auth/logout
```

## Files Modified

### Backend:
- ✅ `config/googleAuth.js` - Google OAuth2 client setup
- ✅ `controllers/auth.controller.js` - Google login handler
- ✅ `models/user.model.js` - Added googleId and provider fields
- ✅ `routes/auth.route.js` - Google endpoint configured
- ✅ `.env` - Added GOOGLE_CLIENT_ID

### Frontend:
- ✅ `app/layout.tsx` - Added Google SDK script
- ✅ `shared/ui/GoogleButton.tsx` - Implemented Google Sign-In button
- ✅ `features/auth/login/services/login.service.ts` - Added googleLogin service
- ✅ `features/auth/login/hooks/useLogin.ts` - Added handleGoogleLogin
- ✅ `features/auth/login/components/LoginForm.tsx` - Integrated Google button
- ✅ `.env.local` - Added NEXT_PUBLIC_GOOGLE_CLIENT_ID

## Next Steps

1. ✅ Set your Google Client ID in environment files
2. ✅ Test the login flow
3. Consider adding Google login to signup page as well
4. Add user profile picture from Google (optional)
5. Implement social login for other providers (GitHub, etc.)
