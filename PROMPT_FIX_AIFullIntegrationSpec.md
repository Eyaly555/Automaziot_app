# Fix Service Component: AI Full Integration Agent

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `ai-full-integration`
- **Service Number:** #30
- **Service Name (Hebrew):** אינטגרציה מלאה של AI
- **Category:** AIAgents → saves to `implementationSpec.aiAgentServices`
- **Current Coverage:** ~10% (7 out of 75+ fields)
- **Target Coverage:** 95%+ (70+ fields)

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/aiAgentServices.ts`
**Line:** 1511
**Search for:** `export interface AIFullIntegrationRequirements`
**Action:** Read lines 1511-1680+ completely. Comprehensive AI integration interface.

**Key sections:**
- `aiProvider` - AI provider, model, API key
- `systemIntegrations` - Array of all connected systems
- `dataSync` - Real-time data sync configuration
- `workflowAutomation` - Automated workflows array
- `knowledgeBase` - RAG setup with vector database
- `customInstructions` - System prompts and behaviors
- `fallbackBehavior` - Error handling and human handoff
- `monitoring` - Comprehensive monitoring setup

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/AIAgents/AIFullIntegrationSpec.tsx`
**Current problem:** Simplified implementation (~71 lines)

### 3. Reference Example
**AIComplexWorkflowSpec.tsx** (from previous prompt) - Similar comprehensive AI service

## Tab Organization (6 tabs)

1. **AI וספקים** (`ai`):
   - AI provider (OpenAI/Anthropic/Google/Azure)
   - Model (GPT-4/Claude/Gemini)
   - API key
   - Max tokens per request
   - Temperature setting
   - Top-p setting
   - Backup provider (optional)
   - Backup model

2. **אינטגרציות מערכות** (`systems`):
   - System integrations array:
     - System name
     - Type (CRM/ERP/Email/Calendar/Database/Custom)
     - Purpose/use case
     - Auth method (OAuth/API Key/Basic Auth)
     - Credentials (conditional based on auth method)
     - API endpoints (read, write, webhook)
     - Sync frequency (real-time/hourly/daily)
   - Add/remove integrations

3. **סנכרון נתונים** (`dataSync`):
   - Real-time sync enabled checkbox
   - Sync direction (one-way/bi-directional)
   - Data entities to sync array (entity name, source system, target system)
   - Conflict resolution strategy (AI decides/manual review/newest wins)
   - Sync state database config (provider, connection string)

4. **Workflows אוטומטיים** (`workflows`):
   - Automated workflows array:
     - Workflow name
     - Trigger (event type, source system)
     - AI processing enabled
     - Actions array (action type, target system, parameters)
     - Success criteria
   - Add/remove workflows

5. **בסיס ידע וקונטקסט** (`knowledge`):
   - RAG enabled checkbox
   - Vector database (Pinecone/Weaviate/Supabase/ChromaDB)
   - Connection details (API key, index name)
   - Embedding model (OpenAI/Cohere/HuggingFace)
   - Document sources array (source type, location, update frequency)
   - Custom instructions (system prompt)
   - Context window size
   - Add/remove document sources

6. **Fallback וניטור** (`monitoring`):
   - Fallback behavior:
     - Human handoff enabled
     - Escalation triggers (confidence threshold, error count)
     - Notification method (email/slack/webhook)
     - Escalation contacts array
   - Monitoring:
     - Enabled checkbox
     - Metrics (success rate, response time, AI cost, error rate)
     - Alert thresholds
     - Dashboard URL
     - Logging level

## Success Criteria

- [ ] All 75+ fields from interface implemented
- [ ] 6 tabs organizing fields logically
- [ ] Complex system integrations array with conditional credentials
- [ ] Data sync and conflict resolution fully configured
- [ ] RAG/knowledge base setup complete
- [ ] Fallback and monitoring comprehensive
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/AIAgents/AIFullIntegrationSpec.tsx`

**Expected size:** ~1,000-1,200 lines
