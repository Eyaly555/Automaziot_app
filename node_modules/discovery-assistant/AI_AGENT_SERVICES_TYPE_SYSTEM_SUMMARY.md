# AI Agent Services Type System - Summary

**Created:** 2025-10-09
**File:** `src/types/aiAgentServices.ts` (1,992 lines)

## Overview

Created comprehensive TypeScript type definitions for all 10 AI Agent services (Services #21-30) based on `AI_AGENTS_TECHNICAL_REQUIREMENTS.md`.

## File Structure

### Common Types & Enums

```typescript
- AIProvider: 'openai' | 'anthropic' | 'google' | 'azure_openai'
- PriorityLevel: 'urgent' | 'high' | 'medium' | 'low'
- VectorDatabaseProvider: supabase_pgvector | pinecone_* | qdrant | weaviate | chromadb
- MessagingChannel: whatsapp | website | facebook | instagram | email | sms | chat | web_form
- CRMSystem: zoho | salesforce | hubspot | pipedrive | monday | other
```

### All 10 Service Interfaces

#### 1. **AIFaqBotRequirements** (Service #21)
- AI provider & model selection
- Vector database configuration (RAG)
- Knowledge base (50-200 FAQs)
- Message templates (greeting, fallback, handoff, privacy)
- Escalation config
- RAG config (hybrid approach, top-k, confidence)
- Website integration (chat widget)
- GDPR compliance (retention, encryption, deletion rights)
- Rate limits & performance
- Cost estimation (~$5-10/month for 100 conversations/day)

#### 2. **AILeadQualifierRequirements** (Service #22)
- BANT qualification framework (Budget, Authority, Need, Timeline)
- Each BANT dimension: questions, score weight (0-25)
- Conversation flow (max questions, structured/conversational)
- Lead scoring (0-100 threshold, predictive analytics)
- Follow-up automation (thank you emails, retry attempts)
- Multi-channel support
- Performance tracking (qualification rate, completion rate)

**Impact:** 40% more qualified opportunities, 30% conversion increase, 25% CAC reduction

#### 3. **AISalesAgentRequirements** (Service #23)
- Vector database for product knowledge
- Product knowledge base (catalog, pricing, case studies, competitors, specs)
- Sales playbook (objection handling, pricing strategies, handoff criteria)
- Calendar integration (Google/Calendly/Outlook)
  - Business hours, buffer times, meeting types
- CRM integration (real-time updates, webhooks)
- Multi-channel deployment
- Conversation limits (max messages, timeout)
- Performance targets (conversation→lead, lead→meeting conversion)

**Cost:** ~$20-30/day for 200 conversations (GPT-4o output 4x more expensive than input)

#### 4. **AIServiceAgentRequirements** (Service #24)
- Function calling support (must support tool use)
- Vector database for help documentation
- Help docs (troubleshooting, how-to, policies, FAQ)
- Ticketing system integration (Zendesk, Freshdesk, Jira, etc.)
  - Auto-create tickets, field mapping
- Order management integration
  - Functions: getOrderStatus, getTrackingNumber, processRefund, updateShipping
- Tool/function definitions (name, description, parameters)
- Sentiment analysis (escalation threshold, detect frustration/anger/disappointment)
- Escalation rules (negative sentiment, keywords, failed attempts)
- Multi-channel support (including WhatsApp Business API)
- SLA targets (first response, AI resolution, human resolution)

**Targets:** >60% resolution rate (AI without human), <40% escalation rate

#### 5. **AIActionAgentRequirements** (Service #25)
- Action definitions across systems (CRM, PM, email, docs, calendar)
  - Action name, target system, endpoint, HTTP method, parameters
  - Requires human approval flag
- Permission model (RBAC)
  - Role-based allowed actions
  - Approval thresholds (budget, bulk operations, critical actions)
- Validation layer
  - Check permissions, validate parameters
  - Critical actions: delete, payment, contract, bulk operations
- Audit logging
  - Log all actions: user, action, parameters, result, timestamp
  - Storage system, retention period
- Error handling
  - Retry logic (max retries)
  - Rollback on failure
- Rate limiting (actions per minute, per conversation)
- Sandbox testing environment

**Security:** Never allow unrestricted actions, critical actions MUST require approval

#### 6. **AIComplexWorkflowRequirements** (Service #26)
- Workflow orchestration (LangGraph, n8n, custom, Zapier)
- State management (Supabase, Redis, database)
  - Checkpoint enabled (durable execution)
  - Resume on failure
- Workflow definition
  - Steps: id, name, type (automated, human_approval, conditional, parallel)
  - Timeout per step
  - Next steps (conditional logic)
  - Triggers (form, email, CRM event, webhook, schedule)
- Decision logic (if/then rules)
- Multi-agent coordination (optional)
  - Patterns: network, supervisor, hierarchical, custom
  - Agent roles and responsibilities
- Human-in-the-loop
  - Approval checkpoints
  - Timeout and escalation
- SLA definitions per step
- Error handling (retry, skip, manual intervention, alternative path)

**Architecture:** Network (full mesh), Supervisor (central), Hierarchical (supervisors of supervisors)

#### 7. **AITriageRequirements** (Service #27)
- Model settings (temperature, max tokens, confidence threshold)
- Category taxonomy (5-10 categories)
  - TriageCategory: id, name (EN/HE), keywords, auto-assign
- Priority rules
  - PriorityRule: conditions, result priority, escalate flag
- Routing matrix
  - RoutingRule: category + priority → team/person
  - Notification method (email, SMS, WhatsApp, Slack, Teams)
  - SLA (minutes), auto-assign
- Sentiment analysis
  - Thresholds (very negative to very positive)
  - Emotion detection (frustration, anger, urgency, excitement, disappointment)
  - Escalation rules based on sentiment
- VIP handling
  - Identification methods: CRM field, customer tier, email domain, manual list
  - Auto priority boost, VIP priority level
  - Notification methods: immediate alert, dedicated queue, auto-assign senior
- Training data (historical inquiries, manual review first 2 weeks)
- Performance targets (processing time <5s, accuracy >90%)
- Error handling (low confidence action, fallback priority)

**Cost:** ~$0.30/day for 1,000 inquiries (GPT-4o Mini)

#### 8. **AIPredictiveRequirements** (Service #28)
- Prediction types: churn, demand forecasting, lead scoring, revenue prediction
- Data warehouse integration (Supabase, BigQuery, Snowflake, Redshift)
  - Historical data (6-12 months minimum)
- Feature engineering (20-50 features)
  - Categories: demographics, transactions, website behavior, email engagement, support, product usage
  - Custom features
- Target variable definition (binary, multiclass, continuous)
- Model training
  - Train/test split ratio (e.g., 70/30)
  - Algorithms: linear/logistic regression, random forest, gradient boosting, neural network
  - Baseline accuracy, target accuracy
- Real-time inference API
  - API endpoint, max latency (ms)
- CRM integration (write predictions to fields)
- Alerting rules (high churn risk, low lead score, anomaly detection)
- Model monitoring
  - Track drift, retraining schedule (weekly/monthly/quarterly/on-drift)
  - Accuracy degradation threshold
- Explainability (SHAP values, top N features)
- GDPR compliance (legal basis for profiling, opt-out, explanation requests)

**Impact:** 25% CAC reduction, 30% conversion increase

#### 9. **AIFullIntegrationRequirements** (Service #29)
- Multi-system integrations (8-12 systems)
  - System type: CRM, ERP, PM, Finance, HR, Email, Calendar, Document Storage
  - API configured, real-time sync, sync method (webhooks/polling)
  - Data access level (read_only, read_write, full_control)
- Unified data layer
  - Type: Supabase, custom warehouse, data lake
  - Aggregates all systems, update frequency
- Data mapping (cross-system field mappings)
- Permissions & security
  - RBAC enabled
  - AI respects user permissions in each system
  - Validate before query
- Audit trail (log all queries, systems accessed, data returned)
- Error handling (graceful degradation, cached data, fallback strategy)
- Performance optimization (cache frequent data, rate limit coordination)
- Query capabilities (max systems per query, timeout)
- Cost management (monitor by system, daily budget, alert on high usage)

**Complexity:** Prompt caching essential (90% cost savings), ~$100-200/day for enterprise

#### 10. **AIMultiAgentRequirements** (Service #30)
- Architecture pattern (network, supervisor, hierarchical, custom)
- Agent definitions (3-5 specialized agents)
  - Name, role (sales, support, data_analysis, action_execution, routing, custom)
  - Specialization, responsibilities
  - System access per agent
  - Per-agent model settings
- Supervisor configuration (if using supervisor pattern)
  - Routing algorithm: intent-based, skill-based, round-robin, load-balanced
  - Delegation rules
- Shared memory (Redis, Supabase)
  - Shared customer context
  - Session TTL
- Agent communication protocol (JSON messages, structured handoff, API calls)
- Coordination layer (supervisor agent, orchestrator service, rule-based)
- Durable execution (checkpoint, resume on failure)
- Error handling (retry, fallback agent, human escalation)
- Performance tracking (by agent, handoff latency, targets)
- Cost management (3-5x cost multiplier, daily budget, disable unused)

**Impact:** 35-45% increase in resolution rates vs single agent

## Union Types & Utilities

```typescript
// Union of all service configs
export type AIAgentServiceConfig =
  | AIFaqBotRequirements
  | AILeadQualifierRequirements
  | AISalesAgentRequirements
  | AIServiceAgentRequirements
  | AIActionAgentRequirements
  | AIComplexWorkflowRequirements
  | AITriageRequirements
  | AIPredictiveRequirements
  | AIFullIntegrationRequirements
  | AIMultiAgentRequirements;

// Service entry container
export interface AIAgentServiceEntry {
  serviceId: string;
  serviceName: string;
  requirements: AIAgentServiceConfig;
  status: 'not_started' | 'configuring' | 'configured' | 'testing' | 'deployed';
  completedAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Service ID type
export type AIAgentServiceId =
  | 'ai-faq-bot' | 'ai-lead-qualifier' | 'ai-sales-agent'
  | 'ai-service-agent' | 'ai-action-agent' | 'ai-complex-workflow'
  | 'ai-triage' | 'ai-predictive' | 'ai-full-integration' | 'ai-multi-agent';

// Service metadata for UI
export interface AIAgentServiceMetadata {
  id: AIAgentServiceId;
  nameEn: string;
  nameHe: string;
  description: string;
  complexity: 'simple' | 'medium' | 'complex' | 'advanced';
  estimatedImplementationDays: number;
  priority: 'quick_win' | 'high_value' | 'advanced';
}

// Array of all metadata
export const AI_AGENT_SERVICES_METADATA: AIAgentServiceMetadata[];
```

## Implementation Prioritization

### Quick Wins (Start Here)
1. **ai-faq-bot** (#21) - 3-5 days - Simple, high ROI
2. **ai-lead-qualifier** (#22) - 4-7 days - Immediate sales impact
3. **ai-triage** (#27) - 3-5 days - Reduces manual work instantly

### High Value (Medium Priority)
4. **ai-sales-agent** (#23) - 7-10 days - After lead qualifier success
5. **ai-service-agent** (#24) - 8-12 days - Measurable support cost reduction
6. **ai-action-agent** (#25) - 9-12 days - Enables automation workflows

### Advanced (Complex, High Impact)
7. **ai-complex-workflow** (#26) - 10-15 days - Requires solid foundation
8. **ai-predictive** (#28) - 15-20 days - Needs historical data
9. **ai-full-integration** (#29) - 18-25 days - Enterprise-grade
10. **ai-multi-agent** (#30) - 15-20 days - Most complex, highest capability

## Relationship to Existing Types

### automationServices.ts (Existing)
Contains **Config** types used by UI components:
- `AIFAQBotConfig` - UI configuration for service #21
- `AITriageConfig` - UI configuration for service #27
- Plus other automation services (auto-lead-response, auto-email-templates, etc.)

### aiAgentServices.ts (New)
Contains **Requirements** types for technical documentation:
- `AIFaqBotRequirements` - Complete technical requirements for #21
- `AITriageRequirements` - Complete technical requirements for #27
- Plus 8 more services (#22-#26, #28-#30)

**These are complementary, not duplicates:**
- Config types = UI state management
- Requirements types = Technical specification documentation

## Usage Example

```typescript
import {
  AIAgentServiceEntry,
  AILeadQualifierRequirements,
  AI_AGENT_SERVICES_METADATA
} from '../types/aiAgentServices';

// Get service metadata
const leadQualifierMeta = AI_AGENT_SERVICES_METADATA.find(s => s.id === 'ai-lead-qualifier');

// Create service entry
const leadQualifierService: AIAgentServiceEntry = {
  serviceId: 'ai-lead-qualifier',
  serviceName: 'AI Lead Qualifier',
  requirements: {
    aiProvider: 'openai',
    model: 'gpt-4o',
    crmSystem: 'zoho',
    bantCriteria: {
      budget: {
        minimumBudget: 10000,
        questions: ['What is your budget range?'],
        scoreWeight: 25
      },
      // ... more BANT config
    },
    // ... full requirements
  } as AILeadQualifierRequirements,
  status: 'configuring',
  updatedAt: new Date().toISOString()
};
```

## Key Design Principles

1. **Comprehensive Documentation**: Every interface includes full JSDoc with:
   - Service description (Hebrew & English)
   - Key features
   - Cost estimation
   - Performance targets
   - Implementation notes

2. **Type Safety**: Strong typing throughout with:
   - No `any` types
   - Union types for enums
   - Optional properties marked with `?:`
   - Nested interfaces for complex structures

3. **Practical Implementation**: Based on real technical requirements:
   - API configurations
   - Integration specifications
   - Performance targets
   - Cost estimations
   - GDPR compliance

4. **Framework Agnostic**: Compatible with:
   - React components (already used in AIFAQBotSpec.tsx, AITriageSpec.tsx)
   - n8n workflows
   - LangGraph orchestration
   - Supabase storage

## Next Steps

1. ✅ Type definitions created (aiAgentServices.ts)
2. Create React components for remaining 8 services (#22-#26, #28-#30)
3. Integrate with Phase 2 Implementation Spec Dashboard
4. Add validation schemas (Zod/Yup)
5. Create service selection wizard
6. Implement cost calculator utilities
7. Add test fixtures for each service type

## Files Created

- **Main Type File**: `src/types/aiAgentServices.ts` (1,992 lines)
- **Summary Document**: `AI_AGENT_SERVICES_TYPE_SYSTEM_SUMMARY.md` (this file)

## Technical Highlights

- **Total Interfaces**: 10 main service interfaces + 3 supporting interfaces (TriageCategory, PriorityRule, RoutingRule)
- **Common Types**: 5 shared type definitions (AIProvider, PriorityLevel, VectorDatabaseProvider, MessagingChannel, CRMSystem)
- **Metadata Array**: 10 service metadata entries for UI rendering
- **Union Types**: Complete type safety with discriminated unions
- **Documentation**: 200+ JSDoc comments with implementation notes
