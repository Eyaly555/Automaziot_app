// GET /api/zoho/potentials/list
// Returns a list of all clients from Zoho Potentials1 module
// Supports filtering by phase, status, and pagination

import { zohoAPI } from '../service.js';

/**
 * Parse and transform Zoho record to client list item format
 */
function transformToClientListItem(record) {
  // Parse JSON fields safely
  let meetingData = null;
  let phase2Data = null;
  let phase3Data = null;

  try {
    meetingData = record.Meeting_Data_JS ? JSON.parse(record.Meeting_Data_JS) : null;
  } catch (e) {
    console.warn(`Failed to parse Meeting_Data_JS for record ${record.id}:`, e.message);
  }

  try {
    phase2Data = record.Implementation_Spec_Data ? JSON.parse(record.Implementation_Spec_Data) : null;
  } catch (e) {
    console.warn(`Failed to parse Implementation_Spec_Data for record ${record.id}:`, e.message);
  }

  try {
    phase3Data = record.Development_Tracking_Data ? JSON.parse(record.Development_Tracking_Data) : null;
  } catch (e) {
    console.warn(`Failed to parse Development_Tracking_Data for record ${record.id}:`, e.message);
  }

  // Count discovery modules completed
  let discoveryModulesCompleted = 0;
  if (meetingData?.characterization) {
    const modules = meetingData.characterization;
    const moduleKeys = ['businessGoals', 'currentProcesses', 'painPoints', 'stakeholders', 'successMetrics', 'constraints'];
    discoveryModulesCompleted = moduleKeys.filter(key => modules[key]?.isComplete).length;
  }

  // Extract client name from various sources, prioritizing structured data
  let clientName = 'Unnamed Client';

  // First try: Discovery_Progress JSON (legacy format)
  let discoveryProgress = null;
  try {
    discoveryProgress = record.Discovery_Progress ? JSON.parse(record.Discovery_Progress) : null;
    if (discoveryProgress?.clientName) {
      clientName = discoveryProgress.clientName;
    }
  } catch (e) {
    // Ignore parse errors
  }

  // If not found in Discovery_Progress, try other fields
  if (clientName === 'Unnamed Client') {
    clientName = record.Potentials_Name ||
                 record.Companys_Name ||
                 meetingData?.meetingInfo?.companyName ||
                 meetingData?.meetingInfo?.contactName ||
                 record.Phone ||
                 record.Email ||
                 'Unnamed Client';
  }

  return {
    recordId: record.id,
    clientName: clientName,
    companyName: record.Companys_Name || meetingData?.meetingInfo?.companyName || null,
    phase: record.Current_Phase || 'discovery',
    status: record.Status || 'not_started',
    overallProgress: parseFloat(record.Overall_Progress_Percent) || 0,
    phase2Progress: parseFloat(record.Phase2_Progress_Percent) || 0,
    phase3Progress: parseFloat(record.Phase3_Progress_Percent) || 0,
    lastModified: record.Modified_Time,
    lastSync: record.Last_Sync_Timestamp || null,
    syncStatus: record.Sync_Stat || 'synced',
    owner: record.Potentials_Owner?.name || null,
    email: record.Email || null,
    phone: record.Phone || null,
    discoveryDate: meetingData?.meetingInfo?.meetingDate || record.Discovery_Date || null,
    discoveryModulesCompleted
  };
}

/**
 * Main handler for GET /api/zoho/potentials/list
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Extract query parameters
    const {
      phase,
      status,
      page = '1',
      per_page = '200',
      sort_by = 'Modified_Time',
      sort_order = 'desc'
    } = req.query;

    // Build Zoho API request parameters
    const params = {
      page: parseInt(page),
      per_page: Math.min(parseInt(per_page), 200), // Zoho max is 200
      sort_by,
      sort_order,
      // Request all fields we need
      fields: [
        'id',
        'Potentials_Name',
        'Companys_Name',
        'Email',
        'Phone',
        'Potentials_Owner',
        'Modified_Time',
        'Current_Phase',
        'Status',
        'Overall_Progress_Percent',
        'Phase2_Progress_Percent',
        'Phase3_Progress_Percent',
        'Last_Sync_Timestamp',
        'Sync_Stat',
        'Meeting_Data_JS',
        'Implementation_Spec_Data',
        'Development_Tracking_Data',
        'Discovery_Date',
        'Discovery_Progress'
      ].join(',')
    };

    // Add filters if provided
    const criteria = [];
    if (phase) {
      criteria.push(`(Current_Phase:equals:${phase})`);
    }
    if (status) {
      criteria.push(`(Status:equals:${status})`);
    }

    // Build query string
    const queryString = new URLSearchParams(params).toString();
    let endpoint = `/crm/v8/Potentials1?${queryString}`;

    // Add criteria if exists
    if (criteria.length > 0) {
      endpoint += `&criteria=${encodeURIComponent(criteria.join('and'))}`;
    }

    console.log('[Potentials List] Fetching from Zoho:', endpoint);

    // Make the API call
    const response = await zohoAPI(endpoint);

    // Check if we got data
    if (!response || !response.data) {
      console.log('[Potentials List] No data returned from Zoho');
      return res.status(200).json({
        success: true,
        potentials: [],
        total: 0,
        page: parseInt(page),
        per_page: parseInt(per_page),
        more_records: false
      });
    }

    // Transform records
    const potentials = response.data.map(transformToClientListItem);

    console.log(`[Potentials List] Successfully fetched ${potentials.length} records`);

    // Return success response
    return res.status(200).json({
      success: true,
      potentials,
      total: response.info?.count || potentials.length,
      page: parseInt(page),
      per_page: parseInt(per_page),
      more_records: response.info?.more_records || false
    });

  } catch (error) {
    console.error('[Potentials List] Error:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch potentials list',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
