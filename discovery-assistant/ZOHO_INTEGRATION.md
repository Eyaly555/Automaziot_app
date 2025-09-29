# Zoho CRM Integration Setup Guide

## Overview
This guide will help you integrate the Discovery Assistant application with Zoho CRM, allowing you to:
- Launch the app directly from Zoho CRM records
- Pre-populate meeting data from Zoho
- Sync meeting progress back to Zoho
- Generate reports and attach them to CRM records

## Prerequisites
1. Zoho CRM account with API access
2. Custom module "Potentials1" created in Zoho
3. HTTPS-enabled hosting for production (localhost works for development)

## Step 1: Zoho CRM Configuration

### 1.1 Create Custom Fields in Potentials1 Module
Add the following fields to your Potentials1 module:

| Field Label | API Name | Field Type |
|------------|----------|------------|
| Company's Name | Company_s_Name | Single Line |
| Email | Email | Email |
| Phone | Phone | Phone |
| Budget Range | Budget_Range | Single Line |
| Requested Services | Requested_Services | Multi Line (Small) |
| Additional Notes | Additional_Notes | Multi Line (Small) |
| Discovery Progress | Discovery_Progress | Multi Line (Large) |
| Discovery Last Update | Discovery_Last_Update | Date/Time |
| Discovery Completion | Discovery_Completion | Single Line |

### 1.2 Create Zoho OAuth App
1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Click "Add Client"
3. Choose "Server-based Applications"
4. Fill in:
   - Client Name: Discovery Assistant
   - Homepage URL: Your app URL
   - Authorized Redirect URIs: `http://localhost:5173/zoho/callback` (for development)
5. Note down your Client ID and Client Secret

### 1.3 Generate Access Token
```bash
# Get authorization code (replace with your values)
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=http://localhost:5173/zoho/callback

# Exchange code for tokens
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=http://localhost:5173/zoho/callback" \
  -d "code=YOUR_AUTH_CODE"
```

## Step 2: Application Configuration

### 2.1 Environment Variables
Update your `.env` file with Zoho credentials:

```env
VITE_ZOHO_API_BASE=https://www.zohoapis.com/crm/v2
VITE_ZOHO_ACCESS_TOKEN=your_access_token
VITE_ZOHO_CLIENT_ID=your_client_id
VITE_ZOHO_CLIENT_SECRET=your_client_secret
VITE_ZOHO_REDIRECT_URI=http://localhost:5173/zoho/callback
VITE_ZOHO_ORG_ID=your_org_id
```

### 2.2 Deploy the Application
1. Build the application:
```bash
npm run build
```

2. Deploy to your hosting service with HTTPS enabled

## Step 3: Widget Installation

### 3.1 Prepare Widget Files
1. Navigate to `zoho-widget/` directory
2. Update `widget.html` with your app URL:
```javascript
// Line 108 - Replace with your actual app URL
const appUrl = `https://your-app-url.com?${params.toString()}`;
```

### 3.2 Create Widget in Zoho
1. Go to Zoho CRM Settings → Developer Space → Widgets
2. Click "Create New Widget"
3. Upload the widget files:
   - widget.html
   - plugin-manifest.json
   - icon.png (create a 64x64 icon)
4. Choose hosting: External (provide URL) or Zoho (upload ZIP)

### 3.3 Add Widget to Potentials1 Module
1. Go to Setup → Customization → Modules → Potentials1
2. Add Custom Button:
   - Button Name: Launch Discovery Assistant
   - Action: Open Widget
   - Select your widget
3. Position the button in the layout

## Step 4: Testing

### 4.1 Test Widget Launch
1. Open any Potentials1 record in Zoho
2. Click "Launch Discovery Assistant" button
3. Verify data is pre-populated correctly
4. Complete some modules
5. Check if data syncs back to Zoho

### 4.2 Test Data Sync
1. Make changes in Discovery Assistant
2. Wait 30 seconds (or click "סנכרן עכשיו")
3. Refresh Zoho record
4. Check Discovery_Progress field for updated data

## Usage Flow

### For New Meetings
1. Create/Open a Potentials1 record in Zoho CRM
2. Click "Launch Discovery Assistant"
3. App opens with client data pre-filled
4. User approves Zoho sync (first time only)
5. Complete discovery modules
6. Data auto-saves locally and syncs to Zoho

### For Continuing Meetings
1. Open the same Potentials1 record
2. Click "Launch Discovery Assistant"
3. App loads previous progress automatically
4. Continue from where you left off
5. Changes sync automatically

## Features

### Automatic Data Sync
- Every change saves to localStorage immediately
- Syncs to Zoho every 30 seconds (if enabled)
- Manual sync available via "סנכרן עכשיו" button

### Summary View
- Click "סיכום" button in dashboard
- Shows aggregated data from all modules
- Displays pain points and ROI calculations
- Includes Zoho sync status

### Export Options
- PDF reports can be attached to Zoho records
- JSON export for backup
- Excel export for analysis

## Troubleshooting

### Widget Not Loading
- Check if widget files are properly uploaded
- Verify HTTPS is enabled for production
- Check browser console for errors

### Data Not Syncing
- Verify access token is valid
- Check if Discovery_Progress field exists
- Ensure sync consent was granted
- Check browser console for API errors

### Access Token Expired
Tokens expire after 1 hour. For production, implement refresh token flow:
```javascript
// In zohoSyncService.ts
async refreshToken() {
  const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    body: new URLSearchParams({
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token'
    })
  });
  const data = await response.json();
  // Update access token
}
```

## Security Considerations

1. **Never commit credentials**: Keep `.env` out of version control
2. **Use HTTPS**: Required for production Zoho widgets
3. **Implement token refresh**: Don't rely on static access tokens
4. **Validate data**: Sanitize all data from/to Zoho
5. **Rate limiting**: Implement throttling for API calls

## Support

For issues or questions:
- Check Zoho CRM API documentation: https://www.zoho.com/crm/developer/docs/
- Review widget SDK docs: https://www.zoho.com/crm/developer/docs/widgets/
- Contact support with error logs and screenshots