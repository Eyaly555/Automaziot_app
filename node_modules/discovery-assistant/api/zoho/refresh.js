// Vercel serverless function for Zoho OAuth token refresh
export default async function handler(req, res) {
  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get refresh token from request
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'No refresh token provided' });
    }

    // Prepare refresh request
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', process.env.ZOHO_CLIENT_ID || '');
    params.append('client_secret', process.env.ZOHO_CLIENT_SECRET || '');
    params.append('refresh_token', refresh_token);

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

    // Return new token data to client
    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in || 3600,
      scope: data.scope || '',
      api_domain: data.api_domain || '',
      token_type: data.token_type || 'Bearer'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}