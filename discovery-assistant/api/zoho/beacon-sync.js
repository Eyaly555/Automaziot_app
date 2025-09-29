// Vercel serverless function for beacon sync (critical saves on page unload)
// Uses server-side authentication for security
import { updateRecord } from './service.js';

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
    const { meeting } = req.body;

    if (!meeting) {
      return res.status(400).json({ error: 'Meeting data is required' });
    }

    const recordId = meeting.zohoIntegration?.recordId;

    if (!recordId) {
      return res.status(400).json({ error: 'No Zoho record ID' });
    }

    // Calculate simple progress (beacon sync should be fast)
    const calculateQuickProgress = (meeting) => {
      if (!meeting?.modules) return 0;
      const modules = Object.values(meeting.modules || {});
      const nonEmpty = modules.filter(m => m && typeof m === 'object' && Object.keys(m).length > 0).length;
      return Math.round((nonEmpty / 9) * 100);
    };

    const progress = calculateQuickProgress(meeting);

    // Prepare minimal update for speed
    const zohoData = {
      Discovery_Progress: JSON.stringify(meeting),
      Discovery_Last_Update: new Date().toISOString(),
      Discovery_Completion: `${progress}%`,
      Discovery_Status: progress === 100 ? 'Completed' : 'In Progress'
    };

    console.log(`[Beacon Sync] Saving record ${recordId} (${progress}% complete)`);

    // Use service.js for authenticated update
    await updateRecord('Potentials1', recordId, zohoData);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('[Beacon Sync] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}