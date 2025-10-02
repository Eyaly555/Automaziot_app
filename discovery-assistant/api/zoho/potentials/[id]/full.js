// GET /api/zoho/potentials/:recordId/full
// Returns full client data including all phases (Discovery, Phase2, Phase3)
// Used when loading a specific client into the application

import { zohoAPI } from '../../service.js';

/**
 * Parse JSON field safely
 */
function parseJSONField(fieldValue, fieldName, recordId) {
  if (!fieldValue) return null;

  try {
    return JSON.parse(fieldValue);
  } catch (e) {
    console.warn(`Failed to parse ${fieldName} for record ${recordId}:`, e.message);
    return null;
  }
}

/**
 * Transform Zoho record to full meeting data structure
 */
function transformToFullMeeting(record) {
  // Parse all JSON fields
  const meetingData = parseJSONField(record.Meeting_Data_JS, 'Meeting_Data_JS', record.id);
  const phase2Data = parseJSONField(record.Implementation_Spec_Data, 'Implementation_Spec_Data', record.id);
  const phase3Data = parseJSONField(record.Development_Tracking_Data, 'Development_Tracking_Data', record.id);

  // Build the full meeting structure matching the frontend types
  const meeting = {
    meetingId: `zoho-${record.id}`,
    phase: record.Current_Phase || 'discovery',
    status: record.Status || 'not_started',

    // Meeting info from meeting data
    meetingInfo: meetingData?.meetingInfo || {
      companyName: record.Company_s_Name || '',
      contactName: record.Name || '',
      contactRole: '',
      meetingDate: record.Discovery_Date || new Date().toISOString(),
      industry: '',
      companySize: '',
      email: record.Email || '',
      phone: record.Phone || ''
    },

    // Discovery phase data
    characterization: meetingData?.characterization || {
      businessGoals: { content: '', isComplete: false },
      currentProcesses: { content: '', isComplete: false },
      painPoints: { content: '', isComplete: false },
      stakeholders: { content: '', isComplete: false },
      successMetrics: { content: '', isComplete: false },
      constraints: { content: '', isComplete: false }
    },

    // Phase 2 data
    phase2: phase2Data || {
      systemRequirements: {
        functionalRequirements: [],
        technicalRequirements: [],
        integrationNeeds: [],
        securityRequirements: []
      },
      processFlows: [],
      dataModels: [],
      userStories: [],
      acceptanceCriteria: {}
    },

    // Phase 3 data
    phase3: phase3Data || {
      technicalSpec: {
        architecture: '',
        technologies: [],
        infrastructure: '',
        scalability: ''
      },
      developmentPlan: {
        milestones: [],
        sprints: [],
        dependencies: []
      },
      testingStrategy: {
        unitTests: [],
        integrationTests: [],
        e2eTests: [],
        performanceTests: []
      },
      deploymentPlan: {
        environments: [],
        cicd: '',
        monitoring: '',
        rollback: ''
      }
    },

    // Zoho integration info
    zohoIntegration: {
      recordId: record.id,
      syncEnabled: true,
      lastSync: record.Last_Sync_Timestamp || new Date().toISOString(),
      syncStatus: record.Sync_Stat || 'synced',
      moduleName: 'Potentials1'
    },

    // Additional metadata
    metadata: {
      createdAt: record.Created_Time,
      modifiedAt: record.Modified_Time,
      owner: record.Owner?.name || null,
      dealName: record.Name,
      overallProgress: parseFloat(record.Overall_Progress_Percent) || 0,
      phase2Progress: parseFloat(record.Phase2_Progress_Percent) || 0,
      phase3Progress: parseFloat(record.Phase3_Progress_Percent) || 0
    }
  };

  return meeting;
}

/**
 * Main handler for GET /api/zoho/potentials/:recordId/full
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
    // Extract record ID from query parameters or URL path
    // Support both /api/zoho/potentials/full?recordId=123 and /api/zoho/potentials/123/full
    const recordId = req.query.recordId || req.query.id;

    if (!recordId) {
      return res.status(400).json({
        success: false,
        error: 'Missing recordId parameter'
      });
    }

    console.log(`[Potentials Full] Fetching full data for record: ${recordId}`);

    // Build endpoint with all required fields
    const fields = [
      'id',
      'Name',
      'Company_s_Name',
      'Email',
      'Phone',
      'Owner',
      'Created_Time',
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
    ].join(',');

    const endpoint = `/crm/v8/Potentials1/${recordId}?fields=${fields}`;

    // Make the API call
    const response = await zohoAPI(endpoint);

    // Check if we got data
    if (!response || !response.data || response.data.length === 0) {
      console.log(`[Potentials Full] Record not found: ${recordId}`);
      return res.status(404).json({
        success: false,
        error: 'Record not found',
        recordId
      });
    }

    // Transform the record
    const record = response.data[0];
    const meeting = transformToFullMeeting(record);

    console.log(`[Potentials Full] Successfully fetched full data for: ${record.Name}`);

    // Return success response
    return res.status(200).json({
      success: true,
      meetingData: meeting,
      recordId: record.id
    });

  } catch (error) {
    console.error('[Potentials Full] Error:', error);

    // Handle specific Zoho errors
    if (error.message.includes('404')) {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
        message: error.message
      });
    }

    if (error.message.includes('401')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Please check Zoho credentials'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch full potential data',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
