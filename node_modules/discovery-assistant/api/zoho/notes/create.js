// POST /api/zoho/notes/create
// Creates a note in Zoho CRM and attaches it to a record

import { zohoAPI } from '../service.js';

/**
 * Create a note in Zoho CRM
 * 
 * Request body:
 * {
 *   recordId: string - The parent record ID
 *   title: string - Note title
 *   content: string - Note content
 *   module: string - The module name (default: 'Potentials1')
 * }
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
    const { recordId, title, content, module = 'Potentials1' } = req.body;

    // Validate input
    if (!recordId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: recordId'
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: title'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: content'
      });
    }

    console.log(`[Create Note] Adding note to ${module} record: ${recordId}`);
    console.log(`[Create Note] Title: ${title}`);
    console.log(`[Create Note] Content length: ${content.length} characters`);

    // Call Zoho Notes API to create note
    const response = await zohoAPI('/crm/v8/Notes', {
      method: 'POST',
      body: JSON.stringify({
        data: [{
          Note_Title: title,
          Note_Content: content,
          Parent_Id: recordId,
          se_module: module
        }]
      })
    });

    // Check for success
    if (response.data && response.data[0]?.code === 'SUCCESS') {
      const noteId = response.data[0].details.id;
      console.log(`[Create Note] ✓ Successfully created note: ${noteId}`);

      return res.status(200).json({
        success: true,
        noteId,
        message: 'Note created successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      // Handle Zoho API error response
      const errorMessage = response.data?.[0]?.message || 'Unknown error';
      const errorCode = response.data?.[0]?.code;
      
      console.error(`[Create Note] ✗ Note creation failed:`, {
        code: errorCode,
        message: errorMessage
      });

      throw new Error(`Note creation failed: ${errorMessage}`);
    }

  } catch (error) {
    console.error('[Create Note] Error:', error);

    // Use the detailed error if available
    const errorMessage = error.details?.message || error.message;
    const errorStatus = error.status || 500;

    // Handle specific Zoho errors
    if (errorMessage.includes('INVALID_DATA')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data provided',
        message: errorMessage
      });
    }

    if (errorMessage.includes('MANDATORY_NOT_FOUND')) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: errorMessage
      });
    }

    if (errorStatus === 401) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Please check Zoho credentials'
      });
    }

    return res.status(errorStatus).json({
      success: false,
      error: 'Failed to create note',
      message: errorMessage,
      details: error.details || (process.env.NODE_ENV === 'development' ? error.stack : undefined)
    });
  }
}

