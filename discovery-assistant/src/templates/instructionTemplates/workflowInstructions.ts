/**
 * n8n Workflow Instructions Template Library
 *
 * Generates detailed n8n workflow build instructions
 */

export interface WorkflowInstructionParams {
  workflowName: string;
  description: string;
  trigger: string;
  steps: any[];
  expectedVolume: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export function generateWorkflowInstructions(
  params: WorkflowInstructionParams
): string {
  const {
    workflowName,
    description,
    trigger,
    steps,
    expectedVolume,
    priority,
  } = params;

  return `
## n8n Workflow: ${workflowName}

### Overview
${description}

**Priority:** ${priority.toUpperCase()}
**Expected Volume:** ${expectedVolume} executions/month (~${Math.ceil(expectedVolume / 30)}/day)

### Workflow Structure

**Trigger:** ${trigger}

**Steps (${steps.length} total):**
${steps.map((step, index) => `${index + 1}. ${step.action || step.type} - ${step.description || 'Step description'}`).join('\n')}

### Node-by-Node Implementation

${generateNodeInstructions(steps)}

### n8n Best Practices

**Performance:**
- Use "Set" node to transform data (faster than Function node)
- Batch operations where possible
- Avoid nested workflows (use sub-workflows for complex logic)
- Cache API responses with TTL

**Error Handling:**
- Add Error Trigger node to catch failures
- Use "If" node for conditional logic
- Implement retry logic for transient failures
- Log all errors with context

**Security:**
- Store credentials in n8n Credentials Manager (never in workflow)
- Use environment variables for configuration
- Enable workflow execution logging
- Restrict workflow access to authorized users

**Testing:**
- Test with various input scenarios
- Validate error paths work correctly
- Load test with expected volume (${expectedVolume}/month)
- Monitor execution time (target: <30 seconds)

### Deployment Checklist

- [ ] All credentials configured and tested
- [ ] Workflow tested with sample data
- [ ] Error handling validated
- [ ] Execution logging enabled
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Stakeholders notified of go-live

### Monitoring & Alerting

**Metrics to Track:**
- Execution count (expected: ${expectedVolume}/month)
- Success rate (target: >95%)
- Average execution time (target: <30s)
- Error rate (target: <5%)

**Alerts to Configure:**
- Error rate >10% in 1 hour
- Execution time >60 seconds
- Failed authentication
- ${priority === 'critical' ? 'Immediate SMS/call for critical failures' : 'Email alerts for failures'}

**Dashboard:**
- Real-time execution status
- Success/failure trend chart
- Performance metrics
- Error log viewer
  `.trim();
}

function generateNodeInstructions(steps: any[]): string {
  return steps
    .map((step, index) => {
      const stepNumber = index + 1;
      const action = step.action || step.type || 'action';
      const description = step.description || '';

      return `
#### Step ${stepNumber}: ${action}

${description}

**Node Type:** ${getNodeType(action)}
**Configuration:**
${generateNodeConfiguration(step)}

${step.endpoint ? `**API Endpoint:** \`${step.endpoint}\`` : ''}
${
  step.dataMapping
    ? `**Data Mapping:**\n${Object.entries(step.dataMapping)
        .map(([k, v]) => `- \`${k}\` → \`${v}\``)
        .join('\n')}`
    : ''
}
${step.condition ? `**Condition:** \`${step.condition}\`` : ''}

**Expected Output:** ${step.expectedOutput || 'Processed data ready for next step'}
    `.trim();
    })
    .join('\n\n');
}

function getNodeType(action: string): string {
  const nodeMap: Record<string, string> = {
    get_data: 'HTTP Request (GET)',
    transform_data: 'Set / Function',
    create_record: 'HTTP Request (POST)',
    update_record: 'HTTP Request (PUT/PATCH)',
    delete_record: 'HTTP Request (DELETE)',
    send_email: 'Send Email',
    send_whatsapp: 'WhatsApp Business',
    send_sms: 'Twilio SMS',
    call_api: 'HTTP Request',
    conditional: 'If / Switch',
    loop: 'Loop Over Items',
    delay: 'Wait',
    log: 'Function (console.log)',
    error_handler: 'Error Trigger',
  };

  return nodeMap[action.toLowerCase()] || 'Custom Node';
}

function generateNodeConfiguration(step: any): string {
  const config = step.configuration || {};
  const entries = Object.entries(config);

  if (entries.length === 0) {
    return '- No specific configuration required';
  }

  return entries
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return `- ${key}: ${JSON.stringify(value)}`;
      }
      return `- ${key}: ${value}`;
    })
    .join('\n');
}
