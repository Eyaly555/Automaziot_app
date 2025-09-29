// Vercel serverless function for Zoho OAuth token exchange
export default async function handler(req, res) {
  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, verifier } = req.body;

    if (!code || !verifier) {
      return res.status(400).json({ error: 'Missing code or verifier' });
    }

    // Prepare token exchange request
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.ZOHO_CLIENT_ID || '');
    params.append('client_secret', process.env.ZOHO_CLIENT_SECRET || '');
    params.append('redirect_uri', process.env.VITE_ZOHO_REDIRECT_URI || '');
    params.append('code', code);
    params.append('code_verifier', verifier);

    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      return res.status(400).json({ error: 'Token exchange failed', details: errorData });
    }

    const data = await tokenResponse.json();

    // Store refresh token if provided (only on first authorization)
    if (data.refresh_token) {
      process.env.ZOHO_REFRESH_TOKEN = data.refresh_token;
      // In production, you should store this securely in a database
      console.log('Refresh token received and stored');
    }

    // Return access token to client
    return res.status(200).json({
      access_token: data.access_token
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}