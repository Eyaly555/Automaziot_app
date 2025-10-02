// PUT /api/zoho/potentials/:recordId/phase
// Quick update for phase transitions
// Lightweight endpoint for updating phase/status without full sync

import { zohoAPI } from './service.js';

/**
 * Validate phase value
 */
function validatePhase(phase) {
  const validPhases = ['discovery', 'implementation', 'development', 'completed'];
  return validPhases.includes(phase);
}

/**
 * Validate status value
 */
function validateStatus(status) {
  const validStatuses = ['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'];
  return validStatuses.includes(status);
}

/**
 * Main handler for PUT /api/zoho/potentials/:recordId/phase
 */
export default async function handler(req, res) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Extract record ID from query or body
    const recordId = req.query.recordId || req.query.id || req.body.recordId;
    const { phase, status, notes, module = 'Potentials1' } = req.body;

    // Validate inputs
    if (!recordId) {
      return res.status(400).json({
        success: false,
        error: 'Missing recordId parameter'
      });
    }

    if (!phase && !status) {
      return res.status(400).json({
        success: false,
        error: 'Must provide at least phase or status'
      });
    }

    if (phase && !validatePhase(phase)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phase value',
        validPhases: ['discovery', 'implementation', 'development', 'completed']
      });
    }

    if (status && !validateStatus(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value',
        validStatuses: ['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled']
      });
    }

    console.log(`[Update Phase] Updating record ${recordId}: phase=${phase}, status=${status}`);

    // Build update data
    const updateData = {
      Last_Sync_Timestamp: new Date().toISOString(),
      Sync_Stat: 'synced'
    };

    if (phase) {
      updateData.Current_Phase = phase;
    }

    if (status) {
      updateData.Status = status;
    }

    // Add notes if provided (append to description or a notes field)
    if (notes) {
      // First, fetch the current record to append notes
      try {
        const getEndpoint = `/crm/v8/${module}/${recordId}?fields=Description`;
        const currentRecord = await zohoAPI(getEndpoint);
        const currentDescription = currentRecord.data?.[0]?.Description || '';

        // Append note with timestamp
        const timestamp = new Date().toISOString();
        const noteEntry = `\n[${timestamp}] Phase/Status Update: ${notes}`;
        updateData.Description = currentDescription + noteEntry;
      } catch (noteError) {
        console.warn('[Update Phase] Failed to append notes:', noteError.message);
        // Continue without notes if this fails
      }
    }

    // Make the update API call
    const endpoint = `/crm/v8/${module}/${recordId}`;
    const response = await zohoAPI(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ data: [updateData] })
    });

    // Check for success
    if (!response.data || response.data[0]?.code !== 'SUCCESS') {
      throw new Error(`Update failed: ${response.data?.[0]?.message || 'Unknown error'}`);
    }

    console.log(`[Update Phase] Successfully updated record: ${recordId}`);

    // Return success response
    return res.status(200).json({
      success: true,
      recordId,
      phase: phase || null,
      status: status || null,
      message: 'Phase/status updated successfully',
      syncTime: updateData.Last_Sync_Timestamp
    });

  } catch (error) {
    console.error('[Update Phase] Error:', error);

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

    if (error.message.includes('INVALID_DATA')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data',
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update phase/status',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
