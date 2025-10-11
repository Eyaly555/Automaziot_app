// Vercel serverless function to fetch Discovery data from Zoho record
import { zohoAPI } from './service.js';

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
    const { recordId } = req.query;

    if (!recordId) {
      return res.status(400).json({ error: 'Record ID is required' });
    }

    // Fetch the Potentials1 record with Discovery fields
    const result = await zohoAPI(
      `/crm/v8/Potentials1/${recordId}?fields=Name,Discovery_Progress,Discovery_Status,Discovery_Date,Discovery_Completion,Discovery_Last_Update,Discovery_Notes,Discovery_Modules_Completed`
    );

    if (!result.data || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    const record = result.data[0];

    // Parse Discovery_Progress if it exists
    let meetingData = null;
    if (record.Discovery_Progress) {
      try {
        meetingData = JSON.parse(record.Discovery_Progress);
      } catch (e) {
        console.error('Failed to parse Discovery_Progress:', e);
      }
    }

    return res.status(200).json({
      success: true,
      recordId: record.id,
      name: record.Name,
      discoveryData: {
        meetingData,
        status: record.Discovery_Status,
        lastUpdate: record.Discovery_Last_Update,
        completion: record.Discovery_Completion,
        date: record.Discovery_Date,
        modulesCompleted: record.Discovery_Modules_Completed,
        notes: record.Discovery_Notes
      }
    });

  } catch (error) {
    console.error('Zoho Get Discovery error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch Discovery data',
      message: error.message
    });
  }
}