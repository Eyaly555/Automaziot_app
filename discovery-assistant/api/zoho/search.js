// GET /api/zoho/potentials/search
// Search for clients by name, company, email, or phone
// Returns matching clients in list format

import { zohoAPI } from './service.js';

/**
 * Parse and transform Zoho record to client list item format
 * (Reused from potentials-list.js)
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

  return {
    recordId: record.id,
    clientName: record.Potentials_Name || 'Unnamed Client',
    companyName: record.Companys_Name || null,
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
 * Build search criteria for Zoho API
 */
function buildSearchCriteria(query) {
  // Zoho search criteria: (field:operator:value)
  // We'll search across multiple fields with OR
  const searchFields = [
    `(Potentials_Name:contains:${query})`,
    `(Companys_Name:contains:${query})`,
    `(Email:contains:${query})`,
    `(Phone:contains:${query})`
  ];

  // Join with 'or' operator
  return searchFields.join('or');
}

/**
 * Main handler for GET /api/zoho/potentials/search
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
    // Extract search query
    const { q, query, page = '1', per_page = '50' } = req.query;
    const searchQuery = q || query;

    // Validate search query
    if (!searchQuery || searchQuery.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Missing search query parameter (q or query)'
      });
    }

    if (searchQuery.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    console.log(`[Search] Searching for: "${searchQuery}"`);

    // Build search criteria
    const criteria = buildSearchCriteria(searchQuery.trim());

    // Build API parameters
    const params = {
      page: parseInt(page),
      per_page: Math.min(parseInt(per_page), 200), // Zoho max is 200
      fields: [
        'id',
        'Potentials_Name',
        'Companys_Name',
        'Email',
        'Phone',
        'Potentials_Owner',
        'Modified_Time',
        'Discovery_Date',
        'Current_Phase',
        'Status',
        'Overall_Progress_Percent',
        'Phase2_Progress_Percent',
        'Phase3_Progress_Percent',
        'Last_Sync_Timestamp',
        'Sync_Stat',
        'Meeting_Data_JS',
        'Implementation_Spec_Data',
        'Development_Tracking_Data'
      ].join(',')
    };

    // Build endpoint
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/crm/v8/Potentials1/search?${queryString}&criteria=${encodeURIComponent(criteria)}`;

    console.log('[Search] Zoho endpoint:', endpoint);

    // Make the API call
    const response = await zohoAPI(endpoint);

    // Check if we got data
    if (!response || !response.data) {
      console.log('[Search] No results found');
      return res.status(200).json({
        success: true,
        results: [],
        total: 0,
        query: searchQuery
      });
    }

    // Transform records
    const results = response.data.map(transformToClientListItem);

    console.log(`[Search] Found ${results.length} results for: "${searchQuery}"`);

    // Return success response
    return res.status(200).json({
      success: true,
      results,
      total: response.info?.count || results.length,
      query: searchQuery,
      page: parseInt(page),
      per_page: parseInt(per_page)
    });

  } catch (error) {
    console.error('[Search] Error:', error);

    // Zoho search API returns 204 when no results found
    if (error.message.includes('204')) {
      return res.status(200).json({
        success: true,
        results: [],
        total: 0,
        query: req.query.q || req.query.query
      });
    }

    // Handle other errors
    if (error.message.includes('401')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Please check Zoho credentials'
      });
    }

    if (error.message.includes('INVALID_REQUEST')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search query',
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to search potentials',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
