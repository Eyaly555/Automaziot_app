# Webhook API for External Transcription Processing

This directory contains webhook endpoints that allow external systems to send transcription data and automatically process it through the Discovery Assistant's analysis pipeline.

## Endpoints

### 1. `/api/webhook/external-transcription` ⭐ **COMPLETE AUTOMATED FLOW**

**Purpose**: Analyzes external transcription, automatically processes fields for the client, creates Zoho notes, and sends summary to external webhook - ALL IN ONE STEP!

**Method**: POST

**Request Body**:
```json
{
  "transcript": "הטקסט של התמלול...",
  "clientId": "unique-client-identifier",
  "language": "he" // optional, defaults to Hebrew
}
```

**⚠️ שים לב**: לא צריך לשלוח `zohoIntegration` - המערכת תשתמש אוטומטית ב-`clientId` כ-`recordId` ו-`"Potentials1"` כ-module.

**Response**:
```json
{
  "success": true,
  "message": "Transcript analyzed and processed successfully",
  "data": {
    "clientId": "unique-client-identifier",
    "transcript": "הטקסט של התמלול...",
    "analysis": {
      "summary": "סיכום השיחה",
      "confidence": "high|medium|low",
      "extractedFields": {
        "overview": { ... },
        "leadsAndSales": { ... },
        "customerService": { ... },
        "aiAgents": { ... },
        "roi": { ... }
      },
      "nextSteps": ["צעד 1", "צעד 2"],
      "rawAnalysis": "..."
    },
  "fieldProcessingResult": {
    "updatedModules": { ... },
    "mergeSummary": {
      "totalFieldsFilled": 5,
      "totalFieldsSkipped": 2,
      "moduleResults": [...]
    },
    "totalFieldsFilled": 5,
    "totalFieldsSkipped": 0,
    "modulesAffected": 2,
    "meetingCreated": false
  },
    "timestamp": "2024-01-01T00:00:00.000Z",
    "source": "external-webhook"
  },
  "extractedFields": { ... },
  "summary": "סיכום השיחה",
  "confidence": "high|medium|low",
  "nextSteps": ["צעד 1", "צעד 2"],
  "fieldProcessingResult": { ... },
  "totalFieldsFilled": 5,
  "modulesAffected": 2,
  "zohoNoteCreated": true,
  "zohoError": null,
  "externalWebhookSent": true,
  "externalWebhookError": null,
  "processingComplete": true,
  "fieldsProcessed": true,
  "zohoIntegrationAttempted": true
}
```

### 2. `/api/webhook/process-client-fields`

**Purpose**: Processes extracted fields for a specific client, merging them with existing data.

**Method**: POST

**Request Body**:
```json
{
  "clientId": "unique-client-identifier",
  "extractedFields": {
    "overview": {
      "businessType": "b2b",
      "employees": "1-10",
      "mainChallenge": "אתגר מרכזי",
      "budget": "50000"
    },
    "leadsAndSales": {
      "leadCaptureChannels": ["website", "phone"],
      "leadStorageMethod": "excel"
    }
  },
  "summary": "סיכום השיחה",
  "confidence": "high",
  "nextSteps": ["צעד 1", "צעד 2"],
  "transcript": "הטקסט המלא של התמלול",
  "zohoIntegration": {
    "recordId": "zoho-record-id",
    "module": "Potentials1"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Client fields processed successfully",
  "data": {
    "clientId": "unique-client-identifier",
    "extractedFields": { ... },
    "summary": "סיכום השיחה",
    "confidence": "high",
    "nextSteps": ["צעד 1", "צעד 2"],
    "mergeSummary": {
      "totalFieldsFilled": 5,
      "totalFieldsSkipped": 2,
      "moduleResults": [...]
    },
    "updatedModules": { ... },
    "processedAt": "2024-01-01T00:00:00.000Z",
    "zohoNoteCreated": true,
    "zohoError": null
  },
  "fieldsSummary": {
    "overview": 3,
    "leadsAndSales": 2,
    "customerService": 0,
    "aiAgents": 0,
    "roi": 0
  },
  "mergeSummary": {
    "totalFieldsFilled": 5,
    "totalFieldsSkipped": 2,
    "modulesAffected": 2
  }
}
```

## Usage Flow

### ⭐ **RECOMMENDED: Complete Automated Process**

**Single API call does EVERYTHING** - analysis, field processing, Zoho notes, and external webhook:

```bash
curl -X POST https://automaziot-app.vercel.app/api/webhook/external-transcription \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "שיחה עם הלקוח על הצרכים שלו...",
    "clientId": "client-123"
  }'
```

**This single call will**:
1. ✅ Analyze the transcript with Claude AI
2. ✅ Create/load client meeting automatically
3. ✅ Extract business fields automatically
4. ✅ Merge fields into client modules (only empty fields)
5. ✅ Save everything to Supabase
6. ✅ Create Zoho note (recordId = clientId, module = "Potentials1")
7. ✅ Send complete summary to your n8n webhook
8. ✅ Return detailed results

### Option 2: Two-Step Process (Legacy)

If you prefer the old two-step process:

1. **Send transcription for analysis only**:
   ```bash
   curl -X POST https://your-domain.com/api/webhook/external-transcription \
     -H "Content-Type: application/json" \
     -d '{
       "transcript": "שיחה עם הלקוח על הצרכים שלו...",
       "clientId": "client-123"
     }'
   ```

2. **Process the extracted fields separately**:
   ```bash
   curl -X POST https://your-domain.com/api/webhook/process-client-fields \
     -H "Content-Type: application/json" \
     -d '{
       "clientId": "client-123",
       "extractedFields": { ... },
       "summary": "...",
       "confidence": "high",
       "nextSteps": [...]
     }'
   ```

## Integration with n8n or External Systems

### n8n Flow Example

1. **HTTP Request Node** → Call `/api/webhook/external-transcription`
2. **Function Node** → Extract the analysis data
3. **HTTP Request Node** → Call `/api/webhook/process-client-fields` with the extracted data

### Example n8n Function Node Code

```javascript
// Extract data from the transcription analysis response
const analysisData = $json.data.analysis;

// Prepare data for field processing
return {
  clientId: $json.data.clientId,
  extractedFields: analysisData.extractedFields,
  summary: analysisData.summary,
  confidence: analysisData.confidence,
  nextSteps: analysisData.nextSteps,
  transcript: $json.data.transcript,
  zohoIntegration: {
    recordId: $('Zoho Record ID').first().json.recordId, // From previous node
    module: 'Potentials1'
  }
};
```

## Environment Variables Required

- `ANTHROPIC_API_KEY`: Required for Claude AI analysis
- Optional: Database connection variables for persisting client data

## Error Handling

Both endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing required fields)
- `405`: Method Not Allowed (non-POST requests)
- `500`: Internal Server Error

Error responses include details:
```json
{
  "error": "Error description",
  "message": "Additional error details"
}
```

## Automatic External Webhook Integration

**NEW FEATURE**: All transcription analysis (both internal and external) automatically sends a summary to your external n8n webhook at:
`https://eyaly555.app.n8n.cloud/webhook/8ae16e96-0ef0-4a7c-b46c-3d0978898b6a`

### What gets sent automatically:

1. **Internal Conversation Analyzer**: When users upload audio files through the UI
2. **External Transcription Webhook**: When external systems send transcripts
3. **Process Client Fields**: When field processing is completed

### Webhook payload structure:

```json
{
  "clientId": "unique-client-identifier",
  "transcript": "Full transcript text",
  "summary": "Conversation summary in Hebrew",
  "confidence": "high|medium|low",
  "nextSteps": ["Recommended next steps"],
  "extractedFields": {
    "overview": { ... },
    "leadsAndSales": { ... },
    "customerService": { ... },
    "aiAgents": { ... },
    "roi": { ... }
  },
  "mergeSummary": {
    "totalFieldsFilled": 5,
    "totalFieldsSkipped": 2,
    "moduleResults": [...]
  },
  "fieldsSummary": {
    "overview": 3,
    "leadsAndSales": 2,
    "customerService": 0,
    "aiAgents": 0,
    "roi": 0
  },
  "processedAt": "2024-01-01T00:00:00.000Z",
  "source": "internal-conversation-analyzer|external-transcription-webhook|process-client-fields",
  "zohoNoteCreated": true
}
```

### Response includes webhook status:

All API responses now include:
```json
{
  "externalWebhookSent": true,
  "externalWebhookError": null
}
```

## Notes

- The webhook endpoints use the same analysis logic as the internal conversation analyzer
- Field merging only fills empty fields, preserving existing data
- Zoho integration is optional and requires the `zohoIntegration` object in the request
- **All transcription analysis automatically triggers your external webhook**
- External webhook failures don't affect the main processing (non-blocking)
- All timestamps are in ISO format
- Text content is primarily in Hebrew as per the system's language preference
