// Vercel serverless function for syncing meeting data with Zoho CRM
import { zohoAPI, updateRecord } from './service.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { meeting, recordId, module = 'Potentials1' } = req.body;

    if (!meeting) {
      return res.status(400).json({ error: 'Meeting data is required' });
    }

    // Prepare Zoho-compatible data from meeting - matching beacon-sync.js structure
    const zohoData = {
      Name: meeting.companyName || meeting.contactName || 'Discovery Meeting',
      Stage: 'Qualification',
      // Custom fields for Discovery data - this is what we save to Zoho
      Discovery_Progress: JSON.stringify(meeting), // Full meeting data as JSON
      Discovery_Last_Update: new Date().toISOString(),
      Discovery_Completion: `${meeting.progress || 0}%`,
      Discovery_Status: 'In Progress',
      Discovery_Date: new Date().toISOString().split('T')[0],
      Discovery_Modules_Completed: Object.keys(meeting.modules || {}).length,
      Discovery_Notes: JSON.stringify({
        contactName: meeting.contactName,
        role: meeting.role,
        industry: meeting.industry,
        employeeCount: meeting.employeeCount
      })
    };

    // Add ROI data if available
    if (meeting.modules?.roi) {
      const roi = meeting.modules.roi;
      zohoData.Expected_Revenue = roi.totalMonthlySavings || 0;
      zohoData.ROI_Annual_Savings = (roi.totalMonthlySavings || 0) * 12;
      zohoData.ROI_Implementation_Cost = roi.implementationCost || 0;
      zohoData.ROI_Payback_Months = roi.paybackMonths || 0;
    }

    let result;

    if (recordId) {
      // Update existing record
      console.log(`[Sync] Updating ${module} record ${recordId}`);
      result = await updateRecord(module, recordId, zohoData);
      result.recordId = recordId;
    } else {
      // Create new record (or search for existing one by company name)
      console.log(`[Sync] Creating new ${module} record for ${meeting.companyName}`);

      // First, try to find existing record
      const searchCriteria = `(Name:equals:${meeting.companyName})`;
      const searchResult = await zohoAPI(`/crm/v8/${module}/search?criteria=${encodeURIComponent(searchCriteria)}&fields=Name,Discovery_Status`);

      if (searchResult.data && searchResult.data.length > 0) {
        // Update existing record
        const existingRecordId = searchResult.data[0].id;
        console.log(`[Sync] Found existing ${module} record ${existingRecordId}, updating...`);
        result = await updateRecord(module, existingRecordId, zohoData);
        result.recordId = existingRecordId;
      } else {
        // Create new record in Potentials1
        result = await zohoAPI(`/crm/v8/${module}`, {
          method: 'POST',
          body: JSON.stringify({ data: [zohoData] })
        });
        if (result.data && result.data.length > 0) {
          result.recordId = result.data[0].details.id;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Meeting synced successfully',
      recordId: result.recordId || recordId,
      result
    });

  } catch (error) {
    console.error('Zoho Sync API error:', error);
    return res.status(500).json({
      error: 'Failed to sync with Zoho',
      message: error.message
    });
  }
}