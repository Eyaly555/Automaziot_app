/**
 * Integration Instructions Template Library
 * 
 * Generates detailed integration setup instructions
 */

export interface IntegrationInstructionParams {
  integrationName: string;
  sourceSystem: string;
  targetSystem: string;
  trigger: string;
  frequency: string;
  dataMapping: Record<string, string>;
  errorHandling: any;
  bidirectional: boolean;
}

export function generateIntegrationInstructions(params: IntegrationInstructionParams): string {
  const {
    integrationName,
    sourceSystem,
    targetSystem,
    trigger,
    frequency,
    dataMapping,
    errorHandling,
    bidirectional
  } = params;

  return `
## Integration: ${integrationName}

### Overview
**Data Flow:** ${sourceSystem} → ${targetSystem} ${bidirectional ? '(Bidirectional)' : '(One-way)'}
**Trigger:** ${trigger}
**Frequency:** ${frequency}

### Architecture

\`\`\`
┌─────────────────┐       ┌─────────────┐       ┌─────────────────┐
│  ${sourceSystem.padEnd(15)}│  ───→  │     n8n     │  ───→  │  ${targetSystem.padEnd(15)}│
│  (Source)       │       │  Workflow   │       │  (Destination)  │
└─────────────────┘       └─────────────┘       └─────────────────┘
       ${trigger.padEnd(15)}         ${frequency.padEnd(12)}        
\`\`\`

### Implementation Steps

#### 1. Source System Setup (${sourceSystem})

${generateSourceSystemSetup(sourceSystem, trigger)}

#### 2. n8n Workflow Configuration

**Workflow Name:** \`${integrationName.toLowerCase().replace(/\s+/g, '-')}\`

**Nodes Required:**
1. **Trigger Node:** ${getTriggerNodeType(trigger)}
2. **${sourceSystem} Node:** Fetch data
3. **Data Transform Node:** Map fields
4. **${targetSystem} Node:** Create/Update record
5. **Error Handler Node:** Handle failures

**Field Mapping:**
${Object.entries(dataMapping).map(([source, target]) => 
  `- \`${source}\` → \`${target}\``
).join('\n')}

#### 3. Error Handling

${generateErrorHandlingInstructions(errorHandling)}

#### 4. Testing

**Test Scenarios:**
1. **Happy Path:** Normal data flow end-to-end
2. **Missing Fields:** Test with incomplete data
3. **Duplicates:** Test duplicate record handling
4. **API Failures:** Simulate ${sourceSystem} or ${targetSystem} downtime
5. **Rate Limits:** Test high-volume scenarios

**Validation Checklist:**
- [ ] Data arrives in ${targetSystem} within expected timeframe
- [ ] All fields mapped correctly
- [ ] No data loss or corruption
- [ ] Error handling works (retry logic, alerts)
- [ ] Logs capture all executions

${bidirectional ? `
#### 5. Reverse Flow (${targetSystem} → ${sourceSystem})

**Note:** This is a bidirectional integration. Set up reverse flow with same quality standards.

**Considerations:**
- Prevent infinite loops (A → B → A → B...)
- Add sync timestamps to avoid re-processing
- Consider conflict resolution if same record updated in both systems
` : ''}

### Monitoring & Maintenance

**Health Checks:**
- Monitor execution success rate (should be >95%)
- Track average execution time
- Alert on failed executions
- Weekly review of error logs

**Performance Optimization:**
- Batch operations where possible (${frequency === 'realtime' ? 'Not applicable for realtime' : 'Use batching'})
- Cache lookups to reduce API calls
- Implement request throttling
  `.trim();
}

function generateSourceSystemSetup(system: string, trigger: string): string {
  switch (trigger.toLowerCase()) {
    case 'webhook':
      return `
**Webhook Configuration:**
- Set webhook URL in ${system} settings
- Configure webhook to trigger on: [Record Created/Updated/Deleted]
- Copy webhook secret for signature validation
- Test webhook delivery
      `;
    
    case 'schedule':
    case 'polling':
      return `
**Polling Configuration:**
- Authenticate to ${system} API
- Query endpoint: [Specify endpoint]
- Filter: Records modified since last sync
- Store last sync timestamp
      `;
    
    default:
      return `
**Configuration:**
- Set up ${trigger} trigger in ${system}
- Ensure n8n has necessary API access
- Test trigger activation
      `;
  }
}

function getTriggerNodeType(trigger: string): string {
  switch (trigger.toLowerCase()) {
    case 'webhook':
      return 'Webhook Trigger (wait for incoming webhook)';
    case 'schedule':
      return 'Schedule Trigger (CRON: based on frequency)';
    case 'manual':
      return 'Manual Trigger (run on demand)';
    case 'watch':
      return 'Watch Trigger (poll for changes)';
    default:
      return `${trigger} Trigger`;
  }
}

function generateErrorHandlingInstructions(errorHandling: any): string {
  const onError = errorHandling?.onError || 'retry';
  const retryCount = errorHandling?.retryCount || errorHandling?.retryAttempts || 3;
  const retryDelay = errorHandling?.retryDelay || 60;
  const alertRecipients = errorHandling?.alertRecipients || [];

  return `
**Strategy:** ${onError.toUpperCase()}

**Configuration:**
- Retry attempts: ${retryCount}
- Retry delay: ${retryDelay} seconds
- Alert recipients: ${alertRecipients.join(', ') || 'Not configured'}

**Error Types & Handling:**
1. **Network Errors (timeout, connection refused)**
   - Action: Retry ${retryCount} times with exponential backoff
   - If all retries fail: Log error and alert ${alertRecipients.join(', ')}

2. **Authentication Errors (401, 403)**
   - Action: Alert immediately (credentials may be expired)
   - Do NOT retry (credentials need to be refreshed)

3. **Validation Errors (400)**
   - Action: Log error details
   - Skip record (data is invalid, won't succeed on retry)
   - Alert for review

4. **Rate Limit Errors (429)**
   - Action: Wait for rate limit reset
   - Retry after delay specified in response header
   - Consider implementing queue for high-volume scenarios

5. **Server Errors (500, 503)**
   - Action: Retry ${retryCount} times
   - Delay increases: ${retryDelay}s, ${retryDelay * 2}s, ${retryDelay * 4}s

**Logging:**
- Log all error types with full context
- Include request/response for debugging
- Track error patterns for optimization
  `.trim();
}

