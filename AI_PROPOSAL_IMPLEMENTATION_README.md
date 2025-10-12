# AI-Driven Proposal Generation Implementation Guide

## Overview

This implementation adds AI-driven proposal generation using OpenAI's GPT-5 Responses API with structured output. The system generates professional Hebrew proposals with executive summaries, service details, financial summaries, terms, and next steps.

## Key Features Implemented

✅ **PM Note Integration**: Project manager notes are included in AI generation for customization
✅ **GPT-5 Responses API**: Uses structured output with JSON Schema for deterministic results
✅ **Regeneration Flow**: Additional instructions can refine AI-generated proposals
✅ **Preview Modal**: Interactive preview with Send/Download actions
✅ **PDF Integration**: AI content is used in PDF generation when available
✅ **Fallback Logic**: Graceful fallback to static content if AI is unavailable

## Environment Variables Required

### Client-Side (.env)
```bash
# AI Configuration
VITE_OPENAI_MODEL=gpt-5
VITE_OPENAI_TEMPERATURE=0.4
VITE_OPENAI_MAX_OUTPUT_TOKENS=1800

# AI Provider (for fallback)
VITE_AI_PROVIDER=openai
VITE_AI_API_KEY=your-api-key-here  # Used only if proxy fails
VITE_ENABLE_AI_FEATURES=true
```

### Server-Side (for OpenAI proxy)
```bash
# OpenAI API Key (server-only, never expose to client)
OPENAI_API_KEY=sk-your-actual-openai-api-key

# Optional: Rate limiting
OPENAI_RATE_LIMIT_PER_MINUTE=10

# Optional: Model override
OPENAI_MODEL=gpt-5
```

## Server Proxy Setup

### Express.js Server (Node.js)

Create `server/openaiProxy.js`:

```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI Responses API Proxy
app.post('/api/openai/responses', async (req, res) => {
  try {
    const { model, messages, seed, max_output_tokens, temperature, response_format } = req.body;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        input: messages,
        seed,
        max_output_tokens,
        temperature,
        response_format
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint
app.post('/api/openai/test', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: req.body.message }],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'OpenAI test failed' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Test connection failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OpenAI proxy server running on port ${PORT}`);
});
```

### Vercel/Netlify Functions

Create `api/openai/responses.js`:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, messages, seed, max_output_tokens, temperature, response_format } = req.body;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        input: messages,
        seed,
        max_output_tokens,
        temperature,
        response_format
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Usage Instructions

### 1. Configure Environment Variables

Set up your `.env` files with the required variables listed above.

### 2. Start the Application

```bash
# Install dependencies
npm install

# Start development server (includes server proxy)
npm run dev

# Or run server separately
node server/openaiProxy.js
```

### 3. Use the Proposal Module

1. Navigate to the Proposal page
2. Add a PM note (optional but recommended)
3. Select services for the proposal
4. Click "ייצר הצעת מחיר" to generate AI proposal
5. Review the generated proposal in the preview modal
6. Use "שפר הצעה" to regenerate with additional instructions
7. Send via WhatsApp/Email or download PDF

## Security Considerations

### API Key Protection
- **Never expose OpenAI API keys to the browser**
- Use server-side proxy for all OpenAI API calls
- Store API keys in server environment variables only

### Rate Limiting
- Implement rate limiting on the proxy (10 requests/minute default)
- Consider user-based quotas for production

### Input Validation
- Validate all user inputs before sending to AI
- Sanitize PM notes and additional instructions
- Implement content filtering for inappropriate content

## Error Handling

The system includes comprehensive error handling:

- **Network errors**: Automatic retry with exponential backoff
- **API errors**: Fallback to local generation if AI fails
- **Validation errors**: JSON schema validation of AI responses
- **Rate limiting**: Graceful degradation when limits are exceeded

## JSON Schema Structure

The AI proposal follows this structured format:

```typescript
interface AiProposalDoc {
  executiveSummary: string[];           // 3-4 paragraphs
  services: Array<{                     // Service details
    serviceId: string;
    titleHe: string;
    whyRelevantHe: string;
    whatIncludedHe: string;
  }>;
  financialSummary: {                   // Financial overview
    totalPrice: number;
    totalDays: number;
    monthlySavings?: number;
    expectedROIMonths?: number;
  };
  terms: string[];                      // Contract terms
  nextSteps: string[];                  // Next steps for client
}
```

## Testing

### Manual Testing Checklist

- [ ] PM note integration works correctly
- [ ] AI proposal generation completes successfully
- [ ] Regeneration with additional instructions works
- [ ] PDF generation uses AI content when available
- [ ] Fallback to static content works when AI fails
- [ ] Error handling displays appropriate messages
- [ ] All UI elements are responsive and accessible

### Automated Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test aiProposalGenerator.test.ts
npm test proposalModule.test.tsx
```

## Troubleshooting

### Common Issues

1. **"AI service not configured"**
   - Ensure `VITE_ENABLE_AI_FEATURES=true`
   - Check that API keys are properly set
   - Verify server proxy is running

2. **"OpenAI API error"**
   - Check API key validity
   - Verify rate limits aren't exceeded
   - Check network connectivity to OpenAI

3. **"Invalid response format"**
   - Check JSON schema validation
   - Verify AI model supports structured output
   - Check prompt format

4. **PDF generation fails**
   - Ensure AI proposal data is passed correctly
   - Check that PDF templates handle both AI and static content
   - Verify browser print functionality

## Performance Considerations

- **Token Limits**: Max 1800 tokens for proposal generation
- **Caching**: AI responses are cached for 15 minutes
- **Rate Limiting**: 10 requests per minute default limit
- **Lazy Loading**: AI generation only when requested
- **Progressive Enhancement**: Works without AI if service is down

## Future Enhancements

1. **Multiple AI Models**: Support for different GPT models
2. **Advanced Prompting**: Dynamic prompt engineering based on meeting data
3. **Content Templates**: Pre-built templates for different industries
4. **Analytics**: Track AI proposal usage and success rates
5. **A/B Testing**: Compare AI vs static proposal conversion rates
6. **Multi-language**: Support for English proposals alongside Hebrew

## Support

For issues or questions regarding this implementation:

1. Check the troubleshooting section above
2. Review the error logs in browser console and server logs
3. Verify all environment variables are correctly set
4. Test the OpenAI connection using the test endpoint
5. Ensure the server proxy is running and accessible

## Zoho CRM Integration - Field Update Summary

Based on the analysis of `discovery-assistant/src/services/zohoAPI.ts` and `discovery-assistant/src/utils/zohoHelpers.ts`, the following fields are updated in Zoho CRM:

### Fields updated via `syncMeetingWithZoho` and `syncFullMeetingToZoho` (mapped through `formatForZoho`):

*   `Company_s_Name` (from `meeting.clientName`)
*   `Email` (from `meeting.zohoIntegration.contactInfo.email`)
*   `Phone` (from `meeting.zohoIntegration.contactInfo.phone`)
*   `Budget_Range` (from `meeting.budget`)
*   `Requested_Services` (from `meeting.services`)
*   `Additional_Notes` (from `meeting.notes`)
*   `Discovery_Completion` (calculated from `meeting.phase` as a percentage, e.g., "25%")
*   `Discovery_Last_Update` (timestamp of the last update)
*   `Discovery_Progress` (the full, sanitized `Meeting` object, serialized to JSON)

### Fields updated via `updateZohoPotentialPhase`:

*   `phase` (of the Potential)
*   `status` (of the Potential)
*   `notes` (specific notes for the phase update)

### Fields updated via `updateZohoDeal` and `createZohoDeal`:

The specific fields updated by `updateZohoDeal` and `createZohoDeal` cannot be determined from the current frontend codebase alone, as these functions accept a generic `data: any` object and their usage is not directly exposed or mapped within the analyzed frontend files. It is likely that the specific field mappings for these functions are handled on the backend.