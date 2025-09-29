// Vercel serverless function to test Zoho connection
import { getModules, zohoAPI } from './service.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test with a simple API call that works with ZohoCRM.modules.ALL scope
    // Try to get deals to verify connection
    const result = await zohoAPI('/crm/v6/Deals?per_page=1&fields=Deal_Name,Stage,Amount');

    return res.status(200).json({
      success: true,
      message: 'Zoho connection successful',
      test: 'Successfully connected to Zoho CRM',
      hasDeals: result.data ? true : false,
      info: result.info || {}
    });

  } catch (error) {
    console.error('Zoho Test API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to connect to Zoho',
      message: error.message,
      hint: 'Check that environment variables are set correctly in Vercel'
    });
  }
}