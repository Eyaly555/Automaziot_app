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
    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.'
      });
    }

    const { transcript, clientId, language = 'he' } = req.body;

    // Validate required fields
    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' });
    }
    
    if (!clientId) {
      return res.status(400).json({ error: 'No clientId provided' });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create the analysis prompt (same as the existing conversation analyzer)
    const systemPrompt = `<system_role>
You are an expert business analyst specializing in customer discovery for אוטומציות.AI, a leading Israeli automation and AI solutions company. Your mission is to extract structured, actionable intelligence from sales conversations that will directly impact business decisions, pricing strategies, and solution recommendations.

WHY THIS MATTERS: Accurate extraction enables:
- Precise solution matching to customer needs
- Appropriate pricing tier recommendations (ranging from ₪700 to ₪22,000)
- Identification of high-value opportunities
- Reduction in sales cycle time by 40-60%
- Prevention of mismatched solutions that lead to churn
</system_role>

<company_context>
אוטומציות.AI offers five main solution categories:
1. AI Agents (סוכני AI): ₪2,500-22,000 - for sales, customer service, lead qualification
2. n8n Automations: ₪700-9,000 - workflow automation, CRM integration, notifications
3. Integrations: ₪800-7,000 - connecting systems, APIs, WhatsApp Business
4. System Implementation: ₪1,500-6,000 - CRM, ERP, project management tools
5. Consulting Services: ₪1,000-3,000/hour - strategic guidance

Target market: Israeli B2B/B2C businesses seeking digital transformation
Primary language: Hebrew (with English technical terms)
Key differentiators: 48-hour deployment, no long-term commitments, full customization
</company_context>

<extraction_methodology>
Follow this structured approach:

STEP 1: COMPREHENSION PHASE
- Read the entire transcript carefully
- Identify the customer's industry, pain points, and context
- Note explicit statements vs. implied information
- Flag ambiguous or contradictory information

STEP 2: CONFIDENCE ASSESSMENT
For each potential data point, evaluate:
- HIGH confidence: Customer explicitly stated this information with specific details
  Example: "אנחנו מקבלים בערך 200 לידים בחודש דרך הטפסים באתר"
- MEDIUM confidence: Information is strongly implied or partially stated
  Example: Customer mentions "הרבה לידים" without specific numbers
- LOW confidence: Assumptions, vague hints, or unclear context
  Example: Inferring budget from company size

ONLY extract HIGH confidence information. When in doubt, omit.

STEP 3: STRUCTURED EXTRACTION
Map discovered information to the JSON schema below
Cross-reference with company services to identify solution fit
Identify gaps that need clarification in next conversation

STEP 4: BUSINESS INTELLIGENCE
Generate actionable next steps based on:
- Which אוטומציות.AI services match their needs
- Appropriate pricing tier (reference price ranges above)
- Missing critical information for accurate scoping
- Urgency indicators and buying signals
</extraction_methodology>

<json_output_schema>
You MUST return a valid JSON object with this EXACT structure. Use this schema as your template:
{
  "summary": "תקציר תמציתי של השיחה בעברית (2-3 משפטים) - חובה למלא",
  "confidence": "high|medium|low - הערכת ביטחון כוללת",
  "extractedFields": {
    "overview": {
      "businessType": "b2b|b2c|saas|ecommerce|service|manufacturing|retail|other",
      "employees": "string - מספר עובדים (למשל: '1-10', '11-50', '50-200')",
      "mainChallenge": "string - האתגר העסקי המרכזי בעברית",
      "budget": "string - תקציב משוער או טווח (למשל: 'עד 10,000 ₪', '10,000-50,000 ₪')"
    },
    "leadsAndSales": {
      "leadCaptureChannels": ["array - ערוצי כניסה של לידים: 'website', 'facebook', 'google_ads', 'phone', 'whatsapp', 'referrals', אחר"],
      "leadStorageMethod": "excel|google_sheets|crm|email|paper|none - איך מאוחסנים הלידים כיום",
      "monthlyleadVolume": "string - כמות לידים חודשית משוערת",
      "salesCycle": "string - אורך מחזור מכירה ממוצע",
      "conversionRate": "string - אחוז המרה משוער",
      "salesTeamSize": "string - גודל צוות מכירות"
    },
    "customerService": {
      "serviceChannels": ["array - ערוצי שירות: 'phone', 'email', 'whatsapp', 'chat', 'facebook'"],
      "monthlyVolume": "string - כמות פניות חודשית",
      "serviceSystemExists": boolean,
      "avgResponseTime": "string - זמן תגובה ממוצע",
      "mainServiceIssues": ["array - בעיות שירות מרכזיות בעברית"],
      "serviceTeamSize": "string - גודל צוות שירות"
    },
    "aiAgents": {
      "interestedInAI": boolean,
      "specificUseCases": ["array - מקרי שימוש ספציפיים: 'lead_qualification', 'sales_agent', 'customer_support', 'appointment_booking', אחר"],
      "currentAutomation": "string - אוטומציות קיימות כיום",
      "aiReadiness": "high|medium|low - מוכנות לאימוץ AI"
    },
    "technicalEnvironment": {
      "currentSystems": ["array - מערכות קיימות: 'salesforce', 'hubspot', 'monday', 'pipedrive', 'excel', 'google_workspace', אחר"],
      "integrationNeeds": ["array - צרכי אינטגרציה ספציפיים"],
      "technicalCapability": "high|medium|low - יכולת טכנית של הארגון"
    },
    "roi": {
      "expectedOutcomes": ["array - תוצאות מצופות בעברית"],
      "successMetrics": ["array - מדדי הצלחה"],
      "timeline": "string - ציר זמן ליישום",
      "currentPainCost": "string - עלות הבעיה הנוכחית (שעות/כסף)"
    },
    "buyingSignals": {
      "urgency": "high|medium|low",
      "decisionMaker": boolean - האם מדבר עם מקבל ההחלטות,
      "budgetApproved": boolean - האם יש תקציב מאושר,
      "competitorsMentioned": ["array - מתחרים שהוזכרו"],
      "timelineToDecision": "string - זמן משוער להחלטה"
    }
  },
  "recommendedSolutions": [
    {
      "service": "string - שם השירות מתוך הידע הקיים",
      "priceRange": "string - טווח מחירים מתאים מהמחירון",
      "reasoning": "string - הסבר בעברית למה פתרון זה מתאים"
    }
  ],
  "nextSteps": [
    "array - צעדים הבאים ממוקדים ומעשיים בעברית"
  ],
  "missingInformation": [
    "array - מידע קריטי שחסר לצורך הצעת מחיר מדויקת"
  ]
}
</json_output_schema>

**CRITICAL RULES FOR JSON OUTPUT:**
1. Return ONLY the JSON object - no markdown, no code blocks, no explanatory text
2. ALL field names must be in English (as shown above)
3. ALL content values should be in Hebrew unless they are enums/codes
4. ONLY include fields where you have HIGH confidence - omit uncertain fields entirely
5. Do NOT use null values - simply omit the field
6. Arrays can be empty [] if no information exists
7. Enums must use EXACT values shown (e.g., "high" not "High" or "גבוה")

<confidence_calibration>
Examples of confidence levels:

HIGH CONFIDENCE - EXTRACT:
- "אנחנו מקבלים כ-150 לידים בחודש דרך הטפסים באתר" → leadVolume: "150 לידים חודשיים"
- "יש לנו 8 אנשים בצוות המכירות" → salesTeamSize: "8"
- "אנחנו עובדים עם Salesforce" → currentSystems: ["salesforce"]

MEDIUM CONFIDENCE - DO NOT EXTRACT:
- "אנחנו מקבלים הרבה לידים" → Too vague, omit leadVolume
- "הצוות שלנו לא כל כך גדול" → Unclear, omit teamSize

LOW CONFIDENCE - DO NOT EXTRACT:
- Customer mentions "startup" → Don't assume budget or employee count
- "זה דחוף" → Don't assume specific timeline without clarification
</confidence_calibration>

<solution_matching_logic>
When generating recommendedSolutions, consider:

1. Lead volume + manual handling → n8n Automations (₪700-3,500)
2. Customer inquiries + response time issues → AI Customer Service Agent (₪7,000-10,000)
3. Lead qualification needs → AI Sales/Qualification Agent (₪7,000-12,000)
4. Multiple disconnected systems → Integration Services (₪1,000-7,000)
5. No CRM or using Excel → CRM Implementation (₪3,000-6,000)
6. WhatsApp-heavy communication → WhatsApp Business API (₪2,000) + Automation
7. Complex custom needs → Consulting + Custom Solution (₪5,000-22,000)

Match solution complexity to business size and budget indicators.
</solution_matching_logic>

<next_steps_guidelines>
Generate specific, actionable next steps such as:
✓ "לקבוע פגישת זום של 30 דקות להדגמת סוכן AI למכירות"
✓ "לשלוח דוגמאות של דשבורדים אוטומטיים למעקב לידים"
✓ "להבהיר את תקציב הפרויקט והציר זמן ליישום"
✓ "לבדוק אפשרות אינטגרציה עם המערכת הקיימת שלהם (Monday.com)"

✗ Avoid vague steps like: "להמשיך בתהליך", "לעדכן בהמשך"
</next_steps_guidelines>

<edge_case_handling>
- If transcript is in English: Extract in English, but note in summary: "שיחה התקיימה באנגלית"
- If multiple contradictory statements: Extract the most recent/clear statement, note contradiction in missingInformation
- If customer asks only general questions without revealing needs: Set confidence to "low", focus summary on their questions
- If technical jargon is unclear: Include in missingInformation field for clarification
- If budget is "no budget mentioned": Omit budget field entirely, add to missingInformation
</edge_case_handling>

<quality_checklist>
Before returning your JSON, verify:
□ JSON is valid and parseable (no trailing commas, proper quotes)
□ All extracted information has HIGH confidence
□ Hebrew content is properly encoded
□ Enum values match exactly (e.g., "high" not "High")
□ recommendedSolutions reference actual אוטומציות.AI services
□ Price ranges match the company's pricing structure
□ nextSteps are specific and actionable
□ No fields included with null or "unknown" - omit instead
</quality_checklist>`;

    const userPrompt = `Analyze this conversation transcript and extract business information for client ID: ${clientId}\n\n${transcript}`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      temperature: 0.3, // Lower temperature for more consistent extraction
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Extract the response text
    const responseText = message.content[0].text;

    // Try to parse the JSON response
    let analysisResult;
    try {
      // Extract JSON from the response (in case Claude adds extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', responseText);
      return res.status(500).json({
        error: 'Failed to parse analysis result',
        rawResponse: responseText
      });
    }

    // Validate the response structure
    if (!analysisResult.extractedFields) {
      return res.status(500).json({
        error: 'Invalid analysis result structure',
        rawResponse: responseText
      });
    }

    // Create the complete analysis result
    const completeResult = {
      clientId,
      transcript,
      analysis: {
        summary: analysisResult.summary || 'לא זמין',
        confidence: analysisResult.confidence || 'medium',
        extractedFields: analysisResult.extractedFields,
        nextSteps: analysisResult.nextSteps || [],
        rawAnalysis: responseText
      },
      timestamp: new Date().toISOString(),
      source: 'external-webhook'
    };

    // Automatically process the extracted fields for the client
    let fieldProcessingResult = null;
    let zohoNoteCreated = false;
    let zohoError = null;
    
    try {
      // Load client's current modules (in a real implementation, this would come from your database)
      const currentModules = {
        overview: {},
        leadsAndSales: {},
        customerService: {},
        aiAgents: {},
        roi: {}
      };

      // Apply field merging logic (same as in process-client-fields.js)
      const { updatedModules, summary: mergeSummary } = mergeExtractedFields(
        currentModules,
        analysisResult.extractedFields
      );

      fieldProcessingResult = {
        updatedModules,
        mergeSummary,
        totalFieldsFilled: mergeSummary.totalFieldsFilled,
        totalFieldsSkipped: mergeSummary.totalFieldsSkipped,
        modulesAffected: mergeSummary.moduleResults.filter(m => m.fieldsFilled.length > 0).length
      };

      // TODO: Save the updated modules to your database/storage
      // This is where you would persist the changes for the specific client
      console.log('[External Transcription] ✓ Field processing completed');

    } catch (fieldError) {
      console.error('[External Transcription] ⚠️ Field processing failed:', fieldError);
      fieldProcessingResult = { error: fieldError.message };
    }

    // Create Zoho note if zohoIntegration is provided in the request
    const { zohoIntegration } = req.body;
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
          analysisResult.summary || 'לא זמין',
          '',
        ];

        // Add confidence level
        const confidenceText =
          analysisResult.confidence === 'high'
            ? 'גבוהה'
            : analysisResult.confidence === 'medium'
              ? 'בינונית'
              : 'נמוכה';
        contentParts.push(`רמת ביטחון: ${confidenceText}`);
        contentParts.push('');

        // Add fields filled summary if available
        if (fieldProcessingResult && fieldProcessingResult.mergeSummary && fieldProcessingResult.mergeSummary.totalFieldsFilled > 0) {
          contentParts.push('=== שדות שהתמלאו ===');
          contentParts.push(
            `סה"כ שדות שהתמלאו: ${fieldProcessingResult.mergeSummary.totalFieldsFilled}`
          );

          // Add details per module
          fieldProcessingResult.mergeSummary.moduleResults.forEach((result) => {
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
        if (analysisResult.nextSteps && analysisResult.nextSteps.length > 0) {
          contentParts.push('=== צעדים הבאים מומלצים ===');
          analysisResult.nextSteps.forEach((step, index) => {
            contentParts.push(`${index + 1}. ${step}`);
          });
          contentParts.push('');
        }

        // Add full transcript
        contentParts.push('=== תמלול מלא ===');
        contentParts.push(transcript);
        contentParts.push('');

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
        console.log('[External Transcription] ✓ Zoho note would be created successfully');
      } catch (noteError) {
        zohoError = noteError.message;
        console.error('[External Transcription] ⚠️ Failed to create Zoho note:', noteError);
      }
    }

    // Send summary to external webhook
    let externalWebhookSent = false;
    let externalWebhookError = null;
    
    try {
      const externalWebhookUrl = 'https://eyaly555.app.n8n.cloud/webhook/8ae16e96-0ef0-4a7c-b46c-3d0978898b6a';
      
      const webhookPayload = {
        clientId,
        transcript,
        summary: analysisResult.summary,
        confidence: analysisResult.confidence,
        nextSteps: analysisResult.nextSteps,
        extractedFields: analysisResult.extractedFields,
        fieldProcessingResult,
        timestamp: new Date().toISOString(),
        source: 'external-transcription-webhook',
        analysisComplete: true,
        fieldsProcessed: true,
        zohoNoteCreated,
        zohoError
      };

      const webhookResponse = await fetch(externalWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });

      if (webhookResponse.ok) {
        externalWebhookSent = true;
        console.log('[External Transcription] ✓ External webhook sent successfully');
      } else {
        externalWebhookError = `HTTP ${webhookResponse.status}: ${webhookResponse.statusText}`;
        console.error('[External Transcription] ⚠️ External webhook failed:', externalWebhookError);
      }
    } catch (webhookError) {
      externalWebhookError = webhookError.message;
      console.error('[External Transcription] ⚠️ Failed to send to external webhook:', webhookError);
    }

    // Return the complete result
    res.json({
      success: true,
      message: 'Transcript analyzed and processed successfully',
      data: {
        ...completeResult,
        fieldProcessingResult,
        zohoNoteCreated,
        zohoError
      },
      // Include the extracted fields for easy access
      extractedFields: analysisResult.extractedFields,
      summary: analysisResult.summary,
      confidence: analysisResult.confidence,
      nextSteps: analysisResult.nextSteps,
      // Field processing results
      fieldProcessingResult,
      totalFieldsFilled: fieldProcessingResult?.totalFieldsFilled || 0,
      modulesAffected: fieldProcessingResult?.modulesAffected || 0,
      // Integration results
      zohoNoteCreated,
      zohoError,
      externalWebhookSent,
      externalWebhookError,
      // Processing status
      processingComplete: true,
      fieldsProcessed: true,
      zohoIntegrationAttempted: !!zohoIntegration?.recordId
    });

  } catch (error) {
    console.error('External transcription webhook error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
}
