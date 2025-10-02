// POST /api/zoho/potentials/sync-full
// Syncs complete meeting data to Zoho (create or update)
// Handles compression for large JSON fields

import { zohoAPI } from './service.js';

/**
 * Compress JSON data if it exceeds Zoho's field limit
 * Zoho Multi Line field max: 32,000 characters
 */
function compressJSONField(data, fieldName, maxLength = 31000) {
  if (!data) return null;

  const jsonString = JSON.stringify(data);

  // If within limit, return as-is
  if (jsonString.length <= maxLength) {
    return jsonString;
  }

  console.warn(`[Sync Full] ${fieldName} exceeds ${maxLength} chars (${jsonString.length}), compressing...`);

  // Simple compression: remove whitespace and sort keys
  const compressed = JSON.stringify(data, Object.keys(data).sort());

  if (compressed.length > maxLength) {
    console.error(`[Sync Full] ${fieldName} still too large after compression: ${compressed.length} chars`);
    // Truncate with warning marker
    return compressed.substring(0, maxLength - 50) + '..."TRUNCATED_BY_SIZE_LIMIT"}';
  }

  return compressed;
}

/**
 * Calculate overall progress from all phases
 */
function calculateOverallProgress(meeting) {
  // Discovery phase: count completed modules
  const discoveryModules = meeting.characterization || {};
  const moduleKeys = ['businessGoals', 'currentProcesses', 'painPoints', 'stakeholders', 'successMetrics', 'constraints'];
  const completedModules = moduleKeys.filter(key => discoveryModules[key]?.isComplete).length;
  const discoveryProgress = (completedModules / moduleKeys.length) * 100;

  // Phase 2 progress (if exists)
  const phase2Progress = meeting.metadata?.phase2Progress || 0;

  // Phase 3 progress (if exists)
  const phase3Progress = meeting.metadata?.phase3Progress || 0;

  // Weighted average based on current phase
  const phase = meeting.phase || 'discovery';

  if (phase === 'discovery') {
    return discoveryProgress;
  } else if (phase === 'implementation') {
    return (discoveryProgress * 0.3) + (phase2Progress * 0.7);
  } else if (phase === 'development') {
    return (discoveryProgress * 0.2) + (phase2Progress * 0.3) + (phase3Progress * 0.5);
  } else if (phase === 'completed') {
    return 100;
  }

  return discoveryProgress;
}

/**
 * Transform meeting data to Zoho format
 */
function transformToZohoFormat(meeting) {
  // Build meeting data with meetingInfo and characterization
  const meetingData = {
    meetingInfo: meeting.meetingInfo,
    characterization: meeting.characterization
  };

  // Calculate progress values
  const overallProgress = calculateOverallProgress(meeting);
  const phase2Progress = meeting.metadata?.phase2Progress || 0;
  const phase3Progress = meeting.metadata?.phase3Progress || 0;

  // Build Zoho record
  const zohoRecord = {
    // Basic fields
    Potentials_Name: meeting.meetingInfo?.contactName || 'Unnamed Client',
    Companys_Name: meeting.meetingInfo?.companyName,
    Email: meeting.meetingInfo?.email,
    Phone: meeting.meetingInfo?.phone,
    Discovery_Date: meeting.meetingInfo?.meetingDate,

    // Phase and status
    Current_Phase: meeting.phase || 'discovery',
    Status: meeting.status || 'not_started',

    // Progress tracking
    Overall_Progress_Percent: overallProgress,
    Phase2_Progress_Percent: phase2Progress,
    Phase3_Progress_Percent: phase3Progress,

    // Sync metadata
    Last_Sync_Timestamp: new Date().toISOString(),
    Sync_Stat: 'synced',

    // JSON data fields (compressed if needed)
    Meeting_Data_JS: compressJSONField(meetingData, 'Meeting_Data_JS'),
    Implementation_Spec_Data: compressJSONField(meeting.phase2, 'Implementation_Spec_Data'),
    Development_Tracking_Data: compressJSONField(meeting.phase3, 'Development_Tracking_Data')
  };

  return zohoRecord;
}

/**
 * Main handler for POST /api/zoho/potentials/sync-full
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { meeting, recordId, module = 'Potentials1' } = req.body;

    // Validate input
    if (!meeting) {
      return res.status(400).json({
        success: false,
        error: 'Missing meeting data'
      });
    }

    console.log(`[Sync Full] Starting sync for: ${meeting.meetingInfo?.companyName || 'Unknown'}`);

    // Transform to Zoho format
    const zohoRecord = transformToZohoFormat(meeting);

    let response;
    let finalRecordId = recordId;

    // Update existing record or create new one
    if (recordId) {
      console.log(`[Sync Full] Updating existing record: ${recordId}`);

      const endpoint = `/crm/v8/${module}/${recordId}`;
      response = await zohoAPI(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ data: [zohoRecord] })
      });

      // Check for update success
      if (response.data && response.data[0]?.code === 'SUCCESS') {
        console.log(`[Sync Full] Successfully updated record: ${recordId}`);
      } else {
        throw new Error(`Update failed: ${response.data?.[0]?.message || 'Unknown error'}`);
      }

    } else {
      console.log('[Sync Full] Creating new record');

      const endpoint = `/crm/v8/${module}`;
      response = await zohoAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify({ data: [zohoRecord] })
      });

      // Check for creation success
      if (response.data && response.data[0]?.code === 'SUCCESS') {
        finalRecordId = response.data[0].details.id;
        console.log(`[Sync Full] Successfully created record: ${finalRecordId}`);
      } else {
        throw new Error(`Creation failed: ${response.data?.[0]?.message || 'Unknown error'}`);
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      recordId: finalRecordId,
      message: recordId ? 'Record updated successfully' : 'Record created successfully',
      syncTime: new Date().toISOString(),
      overallProgress: zohoRecord.Overall_Progress_Percent
    });

  } catch (error) {
    console.error('[Sync Full] Error:', error);

    // Handle specific Zoho errors
    if (error.message.includes('DUPLICATE_DATA')) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate record',
        message: 'A record with this data already exists'
      });
    }

    if (error.message.includes('MANDATORY_NOT_FOUND')) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
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
      error: 'Failed to sync meeting data',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
