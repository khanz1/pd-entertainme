# Fix Google OAuth Redirect URI Mismatch

## Changes Made

Fixed the `redirect_uri_mismatch` error in Google OAuth authentication by correcting the redirect URI configuration to match the actual ports where the client and server applications are running.

### Updated Files

1. **Client Environment** (`.env`)

   - Changed `VITE_GOOGLE_REDIRECT_URI` from `http://localhost:3000` to `http://localhost:5173`

2. **Server Environment** (`.env.development`)
   - Changed `GOOGLE_REDIRECT_URI` from `http://localhost:3000` to `http://localhost:5173`

## Technical Details

### Root Cause

The application was configured with mismatched ports:

- Server (API) runs on port **3000**
- Client (Vite React app) runs on port **5173**
- Both redirect URIs were incorrectly set to `http://localhost:3000`

### Solution

Updated redirect URIs to point to `http://localhost:5173` where the client application is actually running. In Google OAuth auth-code flow with `@react-oauth/google`, the redirect URI must point to the client application, not the server API.

### Changes Applied

- Client redirect URI: `http://localhost:3000` → `http://localhost:5173`
- Server redirect URI: `http://localhost:3000` → `http://localhost:5173`
- Triggered server restart to apply new environment variables

## Pros and Cons

### Pros

- Resolves `redirect_uri_mismatch` error in Google OAuth flow
- Aligns redirect URI with actual client application URL
- Maintains consistent configuration between client and server
- No code changes required, only environment configuration

### Cons

- Requires Google Cloud Console configuration to be updated
- Development-specific configuration (production URLs will be different)

## Google Cloud Console Update Required

**Critical Step**: You must update your Google Cloud Console OAuth 2.0 configuration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Credentials** > **Credentials**
3. Find your OAuth 2.0 Client ID: `1024585727592-heovt1gc1na6arq32tpsc2evcffp471j.apps.googleusercontent.com`
4. Add `http://localhost:5173` to the **Authorized redirect URIs**
5. Remove `http://localhost:3000` if it's not needed for other purposes

## Testing

After updating the Google Cloud Console configuration:

1. Access your app at `http://localhost:5173`
2. Click "Continue with Google"
3. Verify the OAuth flow completes successfully without redirect URI errors

## Future Considerations

- Update redirect URIs for production environment to use actual production URLs
- Consider using environment-specific Google OAuth clients for better security
- Document the redirect URI requirements for different environments

## Git Commit Message

```
fix(auth): resolve Google OAuth redirect_uri_mismatch error

• Update client redirect URI from localhost:3000 to localhost:5173
• Update server redirect URI to match client configuration
• Fix port mismatch between client (5173) and server (3000)
• Trigger server restart to apply new environment variables

BREAKING CHANGE: Google Cloud Console redirect URI configuration must be updated to include http://localhost:5173
```
