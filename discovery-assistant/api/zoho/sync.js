// Vercel serverless function for syncing meeting data with Zoho CRM
import { zohoAPI, updateRecord } from './service.js';

/**
 * Calculate overall progress percentage based on module completion
 * Matches the frontend getOverallProgress() logic
 */
function calculateProgress(meeting) {
  if (!meeting?.modules) return 0;

  const moduleWeights = {
    overview: 6,
    leadsAndSales: 5,
    customerService: 6,
    operations: 6,
    reporting: 4,
    aiAgents: 3,
    systems: 3,
    roi: 2,
    planning: 4
  };

  let totalFields = 0;
  let completedFields = 0;

  for (const [moduleName, weight] of Object.entries(moduleWeights)) {
    totalFields += weight;
    const moduleData = meeting.modules[moduleName];
    if (moduleData && typeof moduleData === 'object') {
      const filledFields = Object.values(moduleData).filter(value => {
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') return Object.keys(value).length > 0;
        return true;
      }).length;
      completedFields += Math.min(filledFields, weight);
    }
  }

  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
}

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

  // Extract variables outside try block so they're accessible in catch
  const { meeting, recordId, module = 'Potentials1' } = req.body || {};

  try {
    if (!meeting) {
      return res.status(400).json({ error: 'Meeting data is required' });
    }

    // Calculate progress
    const progressPercentage = calculateProgress(meeting);

    // Prepare Zoho-compatible data from meeting - matching beacon-sync.js structure
    const now = new Date();
    const zohoData = {
      Name: meeting.clientName || meeting.companyName || 'Discovery Meeting',
      Stage: 'Qualification',
      // Custom fields for Discovery data - this is what we save to Zoho
      Discovery_Progress: JSON.stringify(meeting), // Full meeting data as JSON
      Discovery_Last_Update: now.toISOString().replace('Z', '+00:00'), // Zoho datetime format
      Discovery_Completion: `${progressPercentage}%`,
      Discovery_Status: progressPercentage === 100 ? 'Completed' : 'In Progress',
      Discovery_Date: now.toISOString().split('T')[0],
      Discovery_Modules_Completed: Object.keys(meeting.modules || {}).length,
      Discovery_Notes: JSON.stringify({
        contactName: meeting.contactName,
        clientName: meeting.clientName,
        role: meeting.role,
        industry: meeting.industry,
        employeeCount: meeting.employeeCount
      })
    };

    // ROI fields removed - only add if you create these fields in Zoho:
    // Expected_Revenue, ROI_Annual_Savings, ROI_Implementation_Cost, ROI_Payback_Months
    // Uncomment below if you add those fields to Potentials1:
    /*
    if (meeting.modules?.roi?.summary) {
      const roi = meeting.modules.roi.summary;
      zohoData.Expected_Revenue = roi.totalMonthlySaving || 0;
      zohoData.ROI_Annual_Savings = (roi.totalMonthlySaving || 0) * 12;
      zohoData.ROI_Implementation_Cost = roi.implementationCost || 0;
      zohoData.ROI_Payback_Months = roi.paybackPeriod || 0;
    }
    */

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
    console.error('[Zoho Sync] Error details:', {
      message: error.message,
      stack: error.stack,
      recordId,
      module,
      meetingId: meeting?.meetingId,
      clientName: meeting?.clientName
    });

    // Extract detailed error message from Zoho API response if available
    let errorMessage = error.message || 'Unknown error';
    let errorDetails = null;

    // Try to parse Zoho API error response
    if (error.message && error.message.includes('Zoho API error')) {
      try {
        // Extract JSON from error message if present
        const jsonMatch = error.message.match(/\{.*\}/);
        if (jsonMatch) {
          errorDetails = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('[Zoho Sync] Could not parse error details:', parseError);
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to sync with Zoho',
      message: errorMessage,
      details: errorDetails,
      recordId: recordId || null
    });
  }
}