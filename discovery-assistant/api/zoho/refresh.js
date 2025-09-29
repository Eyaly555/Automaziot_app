// Vercel serverless function for Zoho OAuth token refresh
export default async function handler(req, res) {
  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get stored refresh token
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

    if (!refreshToken) {
      return res.status(400).json({ error: 'No refresh token available' });
    }

    // Prepare refresh request
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', process.env.ZOHO_CLIENT_ID || '');
    params.append('client_secret', process.env.ZOHO_CLIENT_SECRET || '');
    params.append('refresh_token', refreshToken);

    // Request new access token
    const tokenResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token refresh failed:', errorData);
      return res.status(400).json({ error: 'Token refresh failed', details: errorData });
    }

    const data = await tokenResponse.json();

    // Update refresh token if a new one is provided
    if (data.refresh_token) {
      process.env.ZOHO_REFRESH_TOKEN = data.refresh_token;
      // In production, you should store this securely in a database
      console.log('New refresh token received and stored');
    }

    // Return new access token to client
    return res.status(200).json({
      access_token: data.access_token
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}