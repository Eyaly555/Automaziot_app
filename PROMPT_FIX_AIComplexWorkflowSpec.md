# Fix Service Component: AI Complex Workflow Agent

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `ai-complex-workflow`
- **Service Number:** #26
- **Service Name (Hebrew):** אוטומציית תהליכים מורכבים עם AI
- **Category:** AIAgents → saves to `implementationSpec.aiAgentServices`
- **Current Coverage:** ~12% (8 out of 70+ fields)
- **Target Coverage:** 95%+ (65+ fields)

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/aiAgentServices.ts`
**Line:** 912
**Search for:** `export interface AIComplexWorkflowRequirements`
**Action:** Read lines 912-1050+ completely. Complex AI workflow interface with 70+ fields.

**Key sections:**
- `aiProvider` - AI provider and model (OpenAI/Anthropic/etc.)
- `orchestration` - Framework (LangGraph/n8n/Custom/Zapier)
- `stateManagement` - Storage and checkpointing
- `workflowDefinition` - Workflow steps and triggers (complex)
- `decisionLogic` - Business rules
- `multiAgent` - Multi-agent coordination (optional)
- `humanInTheLoop` - Approval checkpoints
- `systemIntegrations` - Connected systems
- `knowledgeBase` - RAG and context
- `monitoring` - Performance tracking

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/AIAgents/AIComplexWorkflowSpec.tsx`
**Current problem:** Simplified implementation (~67 lines)

### 3. Reference Example
**AILeadQualifierSpec.tsx** - Shows AI agent patterns and complex state management

## Tab Organization (7 tabs)

1. **AI וסביבה** (`ai`):
   - AI provider (OpenAI/Anthropic/Google/Azure/Other)
   - Model (must support 200K+ tokens)
   - API key
   - Orchestration framework (LangGraph/n8n/Custom/Zapier)
   - Configured checkbox
   - State management:
     - Storage system (Supabase/Redis/Database)
     - Checkpoint enabled
     - Resume on failure

2. **הגדרת Workflow** (`workflow`):
   - Workflow name
   - Workflow description
   - Steps array:
     - Step ID, name
     - Type (automated/human_approval/conditional/parallel)
     - Target system
     - Timeout minutes
     - Next steps (array with conditional routing)
   - Triggers array:
     - Type (form_submission/email/crm_event/webhook/schedule)
     - Config (key-value pairs)
   - Add/remove steps and triggers

3. **לוגיקה עסקית** (`logic`):
   - Decision rules array:
     - Rule description
     - Condition (if/then logic)
     - Action to take
   - Add/remove rules

4. **תיאום מולטי-אגנטים** (`multiAgent`):
   - Enabled checkbox (optional section)
   - Architecture pattern (network/supervisor/hierarchical/custom)
   - Agents array:
     - Agent name
     - Role
     - Responsibilities array
   - Add/remove agents

5. **אישורים ידניים** (`humanLoop`):
   - Approval checkpoints array (stage names)
   - Approval timeout hours
   - Notification method (email/slack/webhook)
   - Escalation policy

6. **אינטגרציות ומקורות ידע** (`integrations`):
   - System integrations array:
     - System name
     - Purpose
     - Auth method
     - Credentials
   - Knowledge base:
     - RAG enabled checkbox
     - Vector database (Pinecone/Weaviate/Supabase)
     - Embedding model
     - Document sources array
   - Add/remove integrations and sources

7. **ניטור וביצועים** (`monitoring`):
   - Monitoring enabled checkbox
   - Metrics to track (success rate, avg duration, AI cost per run, error rate)
   - Alert thresholds (error rate %, cost per day)
   - Logging level (debug/info/warning/error)
   - Dashboard URL

## Success Criteria

- [ ] All 70+ fields from interface implemented
- [ ] 7 tabs organizing fields logically
- [ ] Complex workflow definition with conditional routing
- [ ] Optional multi-agent section toggles properly
- [ ] Knowledge base (RAG) configuration complete
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/AIAgents/AIComplexWorkflowSpec.tsx`

**Expected size:** ~1,000-1,200 lines
