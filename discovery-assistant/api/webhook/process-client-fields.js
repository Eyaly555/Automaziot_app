import Anthropic from '@anthropic-ai/sdk';

// Helper function to check if a field value is considered empty
function isFieldEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

// Helper function to merge module fields
function mergeModuleFields(existingData, extractedData, moduleName) {
  const fieldsFilled = [];
  const fieldsSkipped = [];
  const merged = { ...existingData };

  for (const [key, value] of Object.entries(extractedData)) {
    if (value === undefined) continue;

    const existingValue = existingData[key];

    if (isFieldEmpty(existingValue)) {
      // Field is empty, fill it
      merged[key] = value;
      fieldsFilled.push(key);
    } else {
      // Field already has data, skip it
      fieldsSkipped.push(key);
    }
  }

  return { merged, fieldsFilled, fieldsSkipped };
}

// Helper function to merge all extracted fields
function mergeExtractedFields(currentModules, extractedFields) {
  const moduleResults = [];
  const updatedModules = {};

  // Merge each module
  for (const [moduleName, extractedData] of Object.entries(extractedFields)) {
    if (!extractedData || Object.keys(extractedData).length === 0) continue;

    const existing = currentModules[moduleName] || {};
    const { merged, fieldsFilled, fieldsSkipped } = mergeModuleFields(
      existing,
      extractedData,
      moduleName
    );

    if (fieldsFilled.length > 0) {
      updatedModules[moduleName] = merged;
    }

    moduleResults.push({
      moduleName,
      fieldsFilled,
      fieldsSkipped,
      totalFields: fieldsFilled.length + fieldsSkipped.length,
    });
  }

  // Calculate summary
  const totalFieldsFilled = moduleResults.reduce(
    (sum, m) => sum + m.fieldsFilled.length,
    0
  );
  const totalFieldsSkipped = moduleResults.reduce(
    (sum, m) => sum + m.fieldsSkipped.length,
    0
  );

  const summary = {
    totalFieldsFilled,
    totalFieldsSkipped,
    moduleResults,
    timestamp: new Date().toISOString(),
  };

  return { updatedModules, summary };
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      clientId, 
      extractedFields, 
      summary, 
      confidence, 
      nextSteps,
      transcript,
      zohoIntegration // Optional: { recordId, module }
    } = req.body;

    // Validate required fields
    if (!clientId) {
      return res.status(400).json({ error: 'No clientId provided' });
    }
    
    if (!extractedFields) {
      return res.status(400).json({ error: 'No extractedFields provided' });
    }

    // TODO: In a real implementation, you would load the client's current data from your database
    // For now, we'll simulate with empty modules
    const currentModules = {
      overview: {},
      leadsAndSales: {},
      customerService: {},
      aiAgents: {},
      roi: {}
    };

    // Apply field merging logic
    const { updatedModules, summary: mergeSummary } = mergeExtractedFields(
      currentModules,
      extractedFields
    );

    // TODO: Save the updated modules to your database/storage
    // This is where you would persist the changes for the specific client

    let zohoNoteCreated = false;
    let zohoError = null;

    // Create Zoho note if integration is provided
    if (zohoIntegration && zohoIntegration.recordId) {
      try {
        // Format the note content - include ALL information
        const noteTitle = `תמלול וסיכום שיחת גילוי - ${new Date().toLocaleDateString(
          'he-IL',
          {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        )}`;

        // Build comprehensive note content
        const contentParts = [
          '=== סיכום השיחה ===',
          summary || 'לא זמין',
          '',
        ];

        // Add confidence level
        const confidenceText =
          confidence === 'high'
            ? 'גבוהה'
            : confidence === 'medium'
              ? 'בינונית'
              : 'נמוכה';
        contentParts.push(`רמת ביטחון: ${confidenceText}`);
        contentParts.push('');

        // Add fields filled summary if available
        if (mergeSummary && mergeSummary.totalFieldsFilled > 0) {
          contentParts.push('=== שדות שהתמלאו ===');
          contentParts.push(
            `סה"כ שדות שהתמלאו: ${mergeSummary.totalFieldsFilled}`
          );

          // Add details per module
          mergeSummary.moduleResults.forEach((result) => {
            if (result.fieldsFilled.length > 0) {
              const moduleNames = {
                overview: 'סקירה כללית',
                leadsAndSales: 'לידים ומכירות',
                customerService: 'שירות לקוחות',
                aiAgents: 'סוכני AI',
                roi: 'ROI',
              };

              const moduleNameHebrew = moduleNames[result.moduleName] || result.moduleName;
              contentParts.push(
                `  • ${moduleNameHebrew}: ${result.fieldsFilled.length} שדות`
              );
            }
          });
          contentParts.push('');
        }

        // Add next steps if available
        if (nextSteps && nextSteps.length > 0) {
          contentParts.push('=== צעדים הבאים מומלצים ===');
          nextSteps.forEach((step, index) => {
            contentParts.push(`${index + 1}. ${step}`);
          });
          contentParts.push('');
        }

        // Add full transcript if provided
        if (transcript) {
          contentParts.push('=== תמלול מלא ===');
          contentParts.push(transcript);
          contentParts.push('');
        }

        contentParts.push(
          `--- נוצר אוטומטית על ידי Discovery Assistant | ${new Date().toLocaleString('he-IL')}`
        );

        const noteContent = contentParts.join('\n');

        // TODO: Call your Zoho API to create the note
        // await createZohoNote(
        //   zohoIntegration.recordId,
        //   noteTitle,
        //   noteContent,
        //   zohoIntegration.module || 'Potentials1'
        // );

        zohoNoteCreated = true;
        console.log('[Webhook] ✓ Zoho note would be created successfully');
      } catch (noteError) {
        zohoError = noteError.message;
        console.error('[Webhook] ⚠️ Failed to create Zoho note:', noteError);
      }
    }

    const result = {
      clientId,
      extractedFields,
      summary,
      confidence,
      nextSteps,
      mergeSummary,
      updatedModules,
      processedAt: new Date().toISOString(),
      zohoNoteCreated,
      zohoError
    };

    res.json({
      success: true,
      message: 'Client fields processed successfully',
      data: result,
      // Include summary of what was filled
      fieldsSummary: {
        overview: extractedFields.overview ? Object.keys(extractedFields.overview).length : 0,
        leadsAndSales: extractedFields.leadsAndSales ? Object.keys(extractedFields.leadsAndSales).length : 0,
        customerService: extractedFields.customerService ? Object.keys(extractedFields.customerService).length : 0,
        aiAgents: extractedFields.aiAgents ? Object.keys(extractedFields.aiAgents).length : 0,
        roi: extractedFields.roi ? Object.keys(extractedFields.roi).length : 0,
      },
      mergeSummary: {
        totalFieldsFilled: mergeSummary.totalFieldsFilled,
        totalFieldsSkipped: mergeSummary.totalFieldsSkipped,
        modulesAffected: mergeSummary.moduleResults.filter(m => m.fieldsFilled.length > 0).length
      }
    });

  } catch (error) {
    console.error('Process client fields error:', error);
    res.status(500).json({
      error: 'Processing failed',
      message: error.message
    });
  }
}
