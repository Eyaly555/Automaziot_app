// Vercel serverless function for beacon sync (critical saves on page unload)
export default async function handler(req, res) {
  // Handle both POST and OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { meeting, token } = req.body;

    if (!meeting || !token) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Quick sync to Zoho - simplified for beacon
    const zohoApiBase = process.env.ZOHO_API_BASE || 'https://www.zohoapis.com/crm/v8';
    const recordId = meeting.zohoIntegration?.recordId;

    if (!recordId) {
      return res.status(400).json({ error: 'No Zoho record ID' });
    }

    // Prepare minimal update
    const requestBody = {
      data: [{
        id: recordId,
        Discovery_Progress: JSON.stringify(meeting),
        Discovery_Last_Update: new Date().toISOString(),
        Discovery_Completion: `${meeting.progress || 0}%`
      }]
    };

    // Send to Zoho
    const response = await fetch(
      `${zohoApiBase}/Potentials1/${recordId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      console.error('Beacon sync failed:', await response.text());
      return res.status(response.status).json({ error: 'Sync failed' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Beacon sync error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}