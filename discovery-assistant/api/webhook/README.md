# Webhook API for External Transcription Processing

This directory contains webhook endpoints that allow external systems to send transcription data and automatically process it through the Discovery Assistant's analysis pipeline.

## Endpoints

### 1. `/api/webhook/external-transcription`

**Purpose**: Analyzes external transcription using Claude AI and extracts business information.

**Method**: POST

**Request Body**:
```json
{
  "transcript": "הטקסט של התמלול...",
  "clientId": "unique-client-identifier",
  "language": "he" // optional, defaults to Hebrew
}
```

**Response**:
```json
{
  "success": true,
  "message": "Transcript analyzed successfully",
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
    "timestamp": "2024-01-01T00:00:00.000Z",
    "source": "external-webhook"
  },
  "extractedFields": { ... },
  "summary": "סיכום השיחה",
  "confidence": "high|medium|low",
  "nextSteps": ["צעד 1", "צעד 2"]
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

### Option 1: Two-Step Process

1. **Send transcription for analysis**:
   ```bash
   curl -X POST https://your-domain.com/api/webhook/external-transcription \
     -H "Content-Type: application/json" \
     -d '{
       "transcript": "שיחה עם הלקוח על הצרכים שלו...",
       "clientId": "client-123"
     }'
   ```

2. **Process the extracted fields**:
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

### Option 2: Single-Step Process (Recommended)

Use the external-transcription endpoint and then immediately call process-client-fields with the response data.

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

## Notes

- The webhook endpoints use the same analysis logic as the internal conversation analyzer
- Field merging only fills empty fields, preserving existing data
- Zoho integration is optional and requires the `zohoIntegration` object in the request
- All timestamps are in ISO format
- Text content is primarily in Hebrew as per the system's language preference
