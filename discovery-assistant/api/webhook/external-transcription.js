import Anthropic from '@anthropic-ai/sdk';

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
    const systemPrompt = `You are a business analyst expert in customer discovery. Analyze the conversation transcript and extract structured business information.

Your task:
1. Analyze the conversation to understand the business context
2. Extract relevant information that fits into these categories:
   - Overview: Business type, employees, budget, main challenge
   - Leads & Sales: Lead sources, capture channels, storage methods, sales process
   - Customer Service: Service channels, volume, existing systems
   - AI Agents: Interest in AI automation, specific use cases
   - ROI: Expected outcomes, metrics, timeline

3. Return a JSON object with this exact structure:
{
  "summary": "Brief summary of the conversation in Hebrew",
  "confidence": "high|medium|low",
  "extractedFields": {
    "overview": {
      "businessType": "b2b|b2c|saas|ecommerce|service|manufacturing|retail|other",
      "employees": "string (e.g., '1-10', '11-50')",
      "mainChallenge": "string",
      "budget": "string"
    },
    "leadsAndSales": {
      "leadCaptureChannels": ["array of channels"],
      "leadStorageMethod": "excel|google_sheets|crm|email|paper",
      "salesCycle": "string",
      "conversionRate": "string"
    },
    "customerService": {
      "serviceVolume": "string",
      "serviceSystemExists": boolean,
      "avgResponseTime": "string",
      "mainServiceIssues": ["array of issues"]
    },
    "aiAgents": {
      "interestedInAI": boolean,
      "aiUseCases": ["array of use cases"],
      "currentAutomation": "string"
    },
    "roi": {
      "expectedOutcomes": ["array of outcomes"],
      "successMetrics": ["array of metrics"],
      "timeline": "string",
      "currentCosts": "string"
    }
  },
  "nextSteps": ["array of recommended next steps in Hebrew"]
}

IMPORTANT RULES:
- Only include fields where you have HIGH confidence from the transcript
- If a field is not mentioned or unclear, omit it from the response
- Use Hebrew for text fields when appropriate
- Be conservative - it's better to extract less information with high confidence than guess
- Focus on explicit information, not assumptions
- Return ONLY the JSON object, no additional text`;

    const userPrompt = `Analyze this conversation transcript and extract business information for client ID: ${clientId}\n\n${transcript}`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
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
        timestamp: new Date().toISOString(),
        source: 'external-transcription-webhook',
        analysisComplete: true
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

    // Return the analysis result
    res.json({
      success: true,
      message: 'Transcript analyzed successfully',
      data: completeResult,
      // Include the extracted fields for easy access
      extractedFields: analysisResult.extractedFields,
      summary: analysisResult.summary,
      confidence: analysisResult.confidence,
      nextSteps: analysisResult.nextSteps,
      externalWebhookSent,
      externalWebhookError
    });

  } catch (error) {
    console.error('External transcription webhook error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
}
