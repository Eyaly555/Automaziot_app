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
    // Test getting modules to verify connection
    const modules = await getModules();

    // Also get organization info
    const orgInfo = await zohoAPI('/crm/v6/org');

    return res.status(200).json({
      success: true,
      message: 'Zoho connection successful',
      organization: orgInfo.org?.[0],
      modulesCount: modules.modules?.length || 0,
      modules: modules.modules?.map(m => ({
        api_name: m.api_name,
        module_name: m.module_name,
        singular_label: m.singular_label
      }))
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