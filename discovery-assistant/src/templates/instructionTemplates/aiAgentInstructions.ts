/**
 * AI Agent Instructions Template Library
 * 
 * Generates detailed AI agent implementation instructions
 */

export interface AIAgentInstructionParams {
  agentName: string;
  department: 'sales' | 'service' | 'operations';
  model: string;
  provider: string;
  knowledgeBaseSources: number;
  conversationSteps: number;
  integrationsCrm: boolean;
  integrationsEmail: boolean;
  integrationsCalendar: boolean;
  language: 'he' | 'en' | 'both';
  tone: string;
}

export function generateAIAgentInstructions(params: AIAgentInstructionParams): string {
  const {
    agentName,
    department,
    model,
    provider,
    knowledgeBaseSources,
    conversationSteps,
    integrationsCrm,
    integrationsEmail,
    integrationsCalendar,
    language,
    tone
  } = params;

  return `
## AI Agent Implementation: ${agentName}

### Agent Profile
- **Department:** ${department.toUpperCase()}
- **AI Model:** ${model} (${provider})
- **Language:** ${language === 'both' ? 'Hebrew + English (Bilingual)' : language === 'he' ? 'Hebrew' : 'English'}
- **Tone:** ${tone}
- **Knowledge Base:** ${knowledgeBaseSources} sources configured
- **Conversation Flow:** ${conversationSteps} steps defined

### Technical Architecture

\`\`\`
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Customer   │────▶│  AI Agent    │────▶│  Knowledge   │
│   (Chat/SMS) │     │  (${model}) │     │  Base        │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
            ┌────────────────────────────────┐
            │      System Integrations       │
            ├────────────────────────────────┤
            ${integrationsCrm ? '│ • CRM (Read/Write)           │' : ''}
            ${integrationsEmail ? '│ • Email (Send)               │' : ''}
            ${integrationsCalendar ? '│ • Calendar (Schedule)        │' : ''}
            └────────────────────────────────┘
\`\`\`

### Implementation Steps

#### 1. Knowledge Base Setup

**Objective:** Configure ${knowledgeBaseSources} knowledge sources for agent training

**Steps:**
1. Collect all knowledge source documents
2. Process and chunk documents (max 512 tokens per chunk)
3. Generate embeddings using ${getEmbeddingModel(provider)}
4. Store in vector database (recommended: Pinecone or Weaviate)
5. Test similarity search queries

**Quality Checks:**
- All sources indexed successfully
- Search returns relevant results
- Response latency < 2 seconds
- Coverage of common questions: >80%

#### 2. Conversation Flow Implementation

**Conversation Steps:** ${conversationSteps} defined

**Implementation:**
1. **Greeting & Context Collection**
   - Greet user in ${language === 'he' ? 'Hebrew' : language === 'en' ? 'English' : 'appropriate language (detect)'}
   - Collect user intent and context
   - Identify user (existing customer vs new lead)

2. **Intent Classification**
   - Use ${model} for intent detection
   - Handle ${conversationSteps} different conversation paths
   - Fallback to knowledge base if intent unclear

3. **Knowledge Retrieval**
   - Query vector database with user question
   - Retrieve top 3-5 relevant chunks
   - Use as context for AI response generation

4. **Response Generation**
   - Generate response using ${model}
   - Tone: ${tone}
   - ${language === 'both' ? 'Respond in same language as user query' : `Language: ${language}`}
   - Include sources/citations where applicable

5. **Action Execution**
   ${integrationsCrm ? '- Update CRM with conversation summary' : ''}
   ${integrationsEmail ? '- Send follow-up email if requested' : ''}
   ${integrationsCalendar ? '- Schedule appointment if requested' : ''}

6. **Handoff Logic**
   - Detect when human intervention needed
   - Graceful handoff with conversation context
   - Notify human agent

#### 3. System Integrations

${integrationsCrm ? `
**CRM Integration:**
- Read customer data (name, history, status)
- Write conversation logs
- Update customer record (last contact, sentiment)
- Create follow-up tasks
` : ''}

${integrationsEmail ? `
**Email Integration:**
- Send automated responses
- Send conversation transcripts
- Send follow-up sequences
- Track email delivery status
` : ''}

${integrationsCalendar ? `
**Calendar Integration:**
- Check availability
- Book appointments
- Send calendar invites
- Handle rescheduling
` : ''}

#### 4. Training & Fine-tuning

**Training Data:**
- Use sample conversations provided in Phase 2
- Include edge cases and prohibited topics
- Add company-specific terminology
- Include product/service information

**Testing:**
- Test with at least 50 sample conversations
- Edge case coverage: 100%
- Prohibited topics: Agent refuses correctly
- Accuracy target: >90% correct responses

#### 5. Deployment & Monitoring

**Deployment Checklist:**
- [ ] All knowledge sources indexed
- [ ] Conversation flow tested end-to-end
- [ ] Integrations working (CRM, Email, Calendar)
- [ ] Fallback/handoff logic works
- [ ] Rate limiting configured
- [ ] Monitoring dashboards set up

**Monitoring Metrics:**
- Conversations handled per day
- Average conversation length
- Handoff rate (should be <20%)
- User satisfaction (collect feedback)
- Response accuracy
- System latency (target: <3s per message)

### Cost Estimation

**Model:** ${model}
**Provider:** ${provider}

**Estimated Monthly Costs:**
- Input tokens: ~${estimateMonthlyTokens('input')} tokens
- Output tokens: ~${estimateMonthlyTokens('output')} tokens
- Embeddings: ~${knowledgeBaseSources * 10000} tokens (one-time)
- Vector DB: $50-200/month (depending on volume)

**Total Estimated:** $${estimateMonthlyCost(model, provider, department)}/month

### Security & Compliance

**Data Privacy:**
- Customer data encrypted in transit and at rest
- PII handled according to GDPR/privacy laws
- Conversation logs stored securely
- Data retention policy: [Define with client]

**Access Control:**
- Agent has read-only access to customer data
- Write operations require validation
- Audit logs for all system modifications

**Content Filtering:**
- Prohibited topics configured
- Offensive language filtered
- Sensitive information redaction
  `.trim();
}

function getEmbeddingModel(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'openai':
      return 'text-embedding-ada-002';
    case 'anthropic':
      return 'Voyage AI embeddings';
    case 'google':
      return 'text-embedding-gecko';
    default:
      return 'Provider-specific embedding model';
  }
}

function estimateMonthlyTokens(type: 'input' | 'output'): number {
  // Rough estimates
  if (type === 'input') {
    return 1000000; // 1M tokens/month for average chatbot
  } else {
    return 500000; // 500K tokens/month output
  }
}

function estimateMonthlyCost(model: string, provider: string, department: string): number {
  // Rough cost estimates
  const baseMultiplier = department === 'sales' ? 1.5 : department === 'service' ? 2.0 : 1.0;
  
  if (model.includes('gpt-4')) {
    return Math.round(150 * baseMultiplier);
  } else if (model.includes('gpt-3.5')) {
    return Math.round(50 * baseMultiplier);
  } else if (model.includes('claude-3-opus')) {
    return Math.round(200 * baseMultiplier);
  } else if (model.includes('claude-3-sonnet')) {
    return Math.round(100 * baseMultiplier);
  } else {
    return Math.round(100 * baseMultiplier);
  }
}

function generateSourceSystemSetup(system: string, trigger: string): string {
  if (trigger.toLowerCase() === 'webhook') {
    return `
**Configure Webhook:**
1. Access ${system} API/webhook settings
2. Create new webhook for relevant events
3. Set webhook URL: \`https://n8n.your-domain.com/webhook/[unique-id]\`
4. Select events to trigger webhook
5. Copy webhook secret for signature validation
6. Test webhook delivery
    `.trim();
  } else if (trigger.toLowerCase() === 'schedule') {
    return `
**Configure API Access:**
1. Authenticate to ${system} API
2. Set up scheduled polling
3. Query for records modified since last run
4. Store sync cursor/timestamp
    `.trim();
  } else {
    return `
**Configure ${trigger} Trigger:**
1. Set up trigger in ${system}
2. Configure trigger conditions
3. Test trigger activation
    `.trim();
  }
}

function generateErrorHandlingInstructions(errorHandling: any): string {
  const strategy = errorHandling?.onError || 'retry';
  const retryCount = errorHandling?.retryCount || errorHandling?.retryAttempts || 3;
  const alertRecipients = errorHandling?.alertRecipients || [];

  return `
**Strategy:** ${strategy.toUpperCase()}

**Retry Logic:**
- Attempts: ${retryCount}
- Delay: Exponential backoff (5s, 15s, 45s)
- Alert after final failure

**Notification:**
${alertRecipients.length > 0 ? `- Email alerts to: ${alertRecipients.join(', ')}` : '- No alerts configured (RECOMMENDED: Add alert email)'}
- Include error details and affected record ID
- Provide manual intervention link

**Recovery:**
- Failed records logged to error table
- Manual retry available via UI
- Automatic retry queue for transient failures
  `.trim();
}

