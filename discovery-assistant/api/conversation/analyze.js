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

    const { transcript, language = 'he' } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create the analysis prompt
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

    const userPrompt = `Analyze this conversation transcript and extract business information:\n\n${transcript}`;

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

    // Return the analysis result
    res.json({
      summary: analysisResult.summary || 'לא זמין',
      confidence: analysisResult.confidence || 'medium',
      extractedFields: analysisResult.extractedFields,
      nextSteps: analysisResult.nextSteps || [],
      rawAnalysis: responseText
    });

  } catch (error) {
    console.error('Conversation analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
}
