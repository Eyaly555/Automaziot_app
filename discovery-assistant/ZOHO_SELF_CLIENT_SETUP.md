# Zoho Self Client Authentication Setup

This application uses Zoho's **Self Client** OAuth authentication for server-to-server communication. This means the app connects to YOUR Zoho CRM account without requiring users to authenticate.

## How It Works

1. **One-time Setup**: You authenticate once to get a permanent refresh token
2. **Server-side Only**: All Zoho API calls happen on the backend (Vercel serverless functions)
3. **Automatic Token Refresh**: Access tokens are refreshed automatically with a 5-minute buffer before expiry
4. **No User Login**: End users don't need to authenticate with Zoho

## Initial Setup (One Time Only)

### Step 1: Create Self Client in Zoho

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Click **GET STARTED**
3. Hover over **Self Client** and click **CREATE NOW**
4. Click **CREATE**, then **OK**
5. Save your Client ID and Client Secret

### Step 2: Generate Authorization Code

1. In your Self Client, click on **Generate Code** tab
2. Enter the required scopes: `ZohoCRM.modules.ALL`
3. Set expiry time (default 10 minutes is fine)
4. Enter a description
5. Click **CREATE**
6. Copy the generated authorization code immediately

### Step 3: Exchange Code for Refresh Token

Run this command immediately (code expires in 10 minutes):

```bash
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTHORIZATION_CODE"
```

You'll receive a response like:
```json
{
  "access_token": "1000.xxx...",
  "refresh_token": "1000.yyy...",  // THIS IS PERMANENT - SAVE IT!
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Step 4: Configure Vercel Environment Variables

In your Vercel project settings, add these environment variables:

```
ZOHO_REFRESH_TOKEN=1000.yyy... (the refresh_token from step 3)
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_API_DOMAIN=https://www.zohoapis.com
```

## Architecture

### Backend (api/zoho/)
- `service.js` - Core service with token management and API calls
- `test.js` - Test endpoint to verify connection
- `sync.js` - Sync meeting data with Zoho CRM
- `deals.js` - CRUD operations for Zoho Deals

### Frontend
- `src/services/zohoAPI.ts` - Frontend service that calls backend endpoints
- No token handling in frontend code
- No authentication UI needed

## Token Management

The backend service automatically:
- Caches access tokens during request lifecycle
- Refreshes tokens 5 minutes before expiry
- Retries on 401 errors (token expired)
- Uses module-level caching (no external dependencies)

## Testing

Test your connection:

```bash
# For deployed app
curl https://your-app.vercel.app/api/zoho/test

# For local development (with Vercel dev)
curl http://localhost:3000/api/zoho/test
```

## Security Notes

1. **NEVER** expose these in client code:
   - Refresh token
   - Client secret
   - Access tokens

2. **ALWAYS** keep these server-side only:
   - All token management
   - Direct Zoho API calls

3. The refresh token is **permanent** until revoked - treat it like a password

## Troubleshooting

### "Failed to authenticate with Zoho"
- Check environment variables in Vercel dashboard
- Verify refresh token is valid
- Ensure client ID and secret match

### "Token refresh failed"
- Refresh token may be revoked
- Generate a new authorization code and repeat setup

### Testing Locally
For local development, create a `.env.local` file:
```
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_API_DOMAIN=https://www.zohoapis.com
```

Then run:
```bash
vercel dev
```

## Why This Approach?

This is exactly how integration platforms like n8n, Zapier, and Make work:
- Single account authentication
- Server-side token management
- No user authentication required
- Permanent connection until revoked

## Comparison with Previous Implementation

### Old (Client-side OAuth):
- Every user had to authenticate
- Complex token storage management
- Client-side security risks
- Temporary connections

### New (Self Client):
- One-time setup
- Server-side only
- Secure by design
- Permanent connection