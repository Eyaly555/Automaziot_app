# Phase 2 Complete Implementation Plan

## Executive Summary

This document outlines the complete implementation plan for Phase 2 (Implementation Specification). Phase 2 currently implements only **20% of desired functionality**. This plan covers the missing **80%**.

---

## Current State Analysis

### What Exists ✅

1. **Requirements Collection - Partial (23/100+ services)**
   - File: `src/utils/requirementsPrefillEngine.ts` (820 lines)
   - Component: `src/components/Requirements/RequirementsNavigator.tsx`
   - **Works for**: 23 services (CRM, AI Chatbot, Lead Workflow, WhatsApp, System Integration, etc.)
   - **Missing**: 70+ services without requirement templates

2. **Systems Deep Dive - UI Only**
   - File: `src/components/Phase2/SystemDeepDive.tsx`
   - **Problem**: Starts from scratch, doesn't read from Phase 1
   - **Missing**: Logic to populate from `meeting.modules.systems.detailedSystems[]`

3. **Integration Flow Builder - Generic**
   - File: `src/components/Phase2/IntegrationFlowBuilder.tsx`
   - **Problem**: Generic builder, doesn't read from Phase 1
   - **Missing**: Logic to read `meeting.modules.systems.*.integrationNeeds[]`

4. **AI Agent Detailed Spec - Generic**
   - File: `src/components/Phase2/AIAgentDetailedSpec.tsx`
   - **Problem**: Generic builder, doesn't read from Phase 1
   - **Missing**: Logic to read `meeting.modules.aiAgents` and expand to detailed specs

5. **Acceptance Criteria - Minimal**
   - Location: `ImplementationSpecDashboard.tsx` (lines 524-568)
   - **Problem**: Manual entry only, no smart generation
   - **Missing**: Logic to generate criteria based on services/systems/integrations

### What's Missing ❌

| Component | Status | Missing Functionality |
|-----------|--------|----------------------|
| Requirements Collection | 🟡 Partial (23/100+) | 70+ service templates |
| Systems Deep Dive | 🔴 Empty | Read Phase 1 data, collect credentials |
| Integration Flows | 🔴 Empty | Read Phase 1 integration needs |
| AI Agents Detailed Spec | 🔴 Empty | Read Phase 1 AI agents, expand specs |
| Acceptance Criteria | 🔴 Empty | Smart generation from services/systems |

---

## Implementation Roadmap

### Phase 2 Readiness Checklist

Before diving into the feature work, confirm these prerequisites so Phase 2 upgrades do not break existing meetings:

1. **Phase 1 data audit**
   - Verify `meeting.modules.systems.detailedSystems` is populated for the meetings you plan to use in QA.
   - When the array is empty, capture at least one entry via `SystemsModuleEnhanced` or plan for the empty-state fallback described in Task 2.1.
   - Confirm `meeting.modules.systems.detailedSystems[].integrationNeeds` exists where integrations were collected.
   - Review `meeting.modules.aiAgents` to ensure the use cases you expect to expand are present.
2. **Single source of truth**
   - Reuse `SERVICE_REQUIREMENTS_TEMPLATES` and `systemsDatabase.ts`; extend them instead of creating duplicate configuration files.
   - Make sure every purchased service (`modules.proposal.selectedServices/purchasedServices`) is either backed by a template or explicitly documented as intentionally unsupported.
3. **Migration strategy**
   - Identify meetings already stored in localStorage/Supabase that rely on the old structures.
   - Plan the v4 migration (see Task 6) so no data is lost when Phase 2 schemas change.

### Task 1: Complete Requirements Collection
**Priority**: HIGH
**Estimated Time**: 8 hours
**Dependencies**: None

#### 1.1 Extend `requirementsPrefillEngine.ts`
**File**: `src/utils/requirementsPrefillEngine.ts`

Add pre-fill functions for missing services:

```typescript
// Services needing templates:
- auto-meeting-scheduler ✅ (exists)
- auto-approval-workflow ✅ (exists)
- auto-notifications ✅ (exists)
- auto-lead-workflow ✅ (exists)
- auto-smart-followup ✅ (exists)
- impl-crm ✅ (exists)
- impl-marketing-automation ✅ (exists)
- impl-project-management ✅ (exists)
- reports-automated ✅ (exists)
- data-cleanup ✅ (exists)

// NEW services needing pre-fill (70+ services):
- auto-task-creation
- auto-invoice-generation
- auto-contract-management
- auto-inventory-sync
- auto-customer-onboarding
- auto-employee-onboarding
- auto-social-media-posting
- auto-lead-nurturing
- auto-abandoned-cart
- auto-review-requests
- auto-feedback-collection
- auto-ticket-routing
- auto-escalation
- auto-status-updates
- auto-reporting-daily
- auto-reporting-weekly
- auto-kpi-tracking
- auto-sales-pipeline-update
- auto-deal-stage-progression
- auto-quote-generation
... (see servicesDatabase.ts for full list)
```

**Action Items**:
1. Review `servicesDatabase.ts` - identify all 100+ services
2. For each service, create a `prefill[ServiceName]Requirements()` function
3. Map Phase 1 data to service requirements
4. Test with sample data

#### 1.2 Create Missing Service Requirement Templates
**File**: `src/config/serviceRequirementsTemplates.ts`

Add templates for services that don't have them:

```typescript
// Template structure example:
export const AUTO_TASK_CREATION_TEMPLATE: ServiceRequirementsTemplate = {
  serviceId: 'auto-task-creation',
  serviceName: 'Automatic Task Creation',
  serviceNameHe: 'יצירת משימות אוטומטית',
  sections: [
    {
      id: 'sources',
      titleHe: 'מקורות המשימות',
      fields: [
        {
          id: 'task_sources',
          type: 'multiselect',
          labelHe: 'מאיפה להקים משימות?',
          required: true,
          options: [
            { value: 'email', labelHe: 'מיילים' },
            { value: 'crm', labelHe: 'רשומות CRM' },
            { value: 'forms', labelHe: 'טפסים' },
            { value: 'meetings', labelHe: 'פגישות' }
          ]
        }
      ]
    },
    {
      id: 'assignment',
      titleHe: 'הקצאת משימות',
      fields: [...]
    }
  ],
  estimatedTimeMinutes: 10
};
```

**Action Items**:
1. Create 70+ service templates
2. Use consistent field naming conventions
3. Add Hebrew translations for all fields
4. Test each template in RequirementsNavigator

---

### Task 2: Systems Deep Dive - Read from Phase 1
**Priority**: CRITICAL
**Estimated Time**: 12 hours
**Dependencies**: None

#### 2.1 Refactor `SystemDeepDive.tsx`
**File**: `src/components/Phase2/SystemDeepDive.tsx`

**Current Problem**: Component starts from scratch, doesn't read Phase 1 data

**Solution**:
1. Read `meeting.modules.systems.detailedSystems[]` from Phase 1. If the array is empty, surface a helpful empty-state that links back to `/module/systems` or lets the user create a temporary placeholder (flagged as `incomplete`) so the Phase 2 flow is not blocked.
2. Display a list of systems to "deep dive" into with status indicators (not started / in progress / completed) and quick actions.
3. When a system is missing from Phase 1, direct the user to capture it there first or synchronise a new placeholder back into Phase 1 so both phases remain consistent.
4. For each system, pre-fill everything available from Phase 1 (name, category, recordCount, integrationNeeds) and collect the new Phase 2 details (authentication, credentials, rate limits, migration plan).

**New Component Flow**:

```typescript
// Step 1: System Selection Screen
const SystemDeepDiveSelection: React.FC = () => {
  // Read systems from Phase 1
  const phase1Systems = currentMeeting?.modules?.systems?.detailedSystems || [];

  // Show list of systems needing deep dive
  return (
    <div>
      <h2>מערכות מ-Phase 1 הדורשות פירוט טכני</h2>
      {phase1Systems.map(system => (
        <SystemCard
          system={system}
          onClick={() => navigate(`/phase2/systems/${system.id}/dive`)}
          status={getSystemDeepDiveStatus(system.id)}
        />
      ))}
    </div>
  );
};

// Step 2: Deep Dive Form
const SystemDeepDiveForm: React.FC<{ systemId: string }> = ({ systemId }) => {
  // Load system from Phase 1
  const phase1System = currentMeeting?.modules?.systems?.detailedSystems.find(
    s => s.id === systemId
  );

  // Pre-fill from Phase 1
  const [deepDive, setDeepDive] = useState<DetailedSystemSpec>({
    id: generateId(),
    systemId: phase1System.id,
    systemName: phase1System.specificSystem, // e.g., "Zoho CRM"

    // NEW: Authentication details (not in Phase 1)
    authentication: {
      method: 'api_key', // Ask user
      credentialsProvided: false, // Ask user
      apiEndpoint: '', // Ask user
      rateLimits: '', // Ask user
      testAccountAvailable: false // Ask user
    },

    // NEW: Modules and Fields (not in Phase 1)
    modules: [], // Ask user to define modules

    // NEW: Data Migration (not in Phase 1)
    dataMigration: {
      required: phase1System.recordCount > 0, // Infer from Phase 1
      recordCount: phase1System.recordCount || 0, // From Phase 1
      cleanupNeeded: false, // Ask user
      historicalDataYears: 0, // Ask user
      migrationMethod: 'api', // Ask user
      dataSanitizationNeeded: false, // Ask user
      testMigrationFirst: true, // Default
      rollbackPlan: '' // Ask user
    }
  });

  // UI to collect missing details...
};
```

**Action Items**:
1. Create `SystemDeepDiveSelection` component - list systems from Phase 1 and show an informative empty-state when none exist.
2. Refactor `SystemDeepDive.tsx` to receive `systemId` param and load Phase 1 data (fall back to placeholder workflow if missing).
3. Add pre-fill logic for known system types (Zoho CRM, Salesforce, etc.) using data from `systemsDatabase.ts`.
4. Add validation - ensure credentials are collected. When information is pending, mark the record with `credentialsProvided = false` and capture the reason.
5. Save to `meeting.implementationSpec.systems[]` and keep Phase 1 data in sync for fields that should stay aligned (e.g., corrected system names).
6. Provide a CTA to navigate back to `/module/systems` when the user needs to add a system before continuing.

#### 2.2 Add System-Specific Templates
**File**: `src/config/systemsDatabase.ts`

Extend the existing system catalog with authentication defaults (do not create a parallel file):

```typescript
export const SYSTEM_AUTH_TEMPLATES = {
  'zoho-crm': {
    method: 'oauth',
    apiEndpoint: 'https://www.zohoapis.com/crm/v2',
    rateLimits: '5000 credits/day',
    requiredScopes: ['ZohoCRM.modules.ALL', 'ZohoCRM.settings.ALL'],
    authGuide: 'הנחיות לקבלת OAuth token...'
  },
  'salesforce': {
    method: 'oauth',
    apiEndpoint: 'https://[instance].my.salesforce.com/services/data/v58.0',
    rateLimits: '15000 calls/24h',
    authGuide: 'הנחיות לקבלת Connected App...'
  },
  'hubspot': {
    method: 'api_key',
    apiEndpoint: 'https://api.hubapi.com',
    rateLimits: '100 requests/10s',
    authGuide: 'הנחיות לקבלת API Key...'
  }
  // ... add templates for all common systems
};
```

**Action Items**:
1. Research auth methods for top 20 systems
2. Add auth templates to the existing `systemsDatabase.ts` (or, if it becomes too large, split into a clearly named companion file and keep a single source of truth)
3. Add to pre-fill logic in `SystemDeepDive.tsx`
4. Surface template hints inside `DetailedSystemCard` so interviewers collect the right fields.

---

### Task 3: Integration Flows - Read from Phase 1
**Priority**: CRITICAL
**Estimated Time**: 10 hours
**Dependencies**: Task 2 (Systems Deep Dive)

#### 3.1 Create Integration Flow Suggester
**File**: `src/utils/integrationFlowSuggester.ts` (NEW)

Logic to suggest integration flows based on Phase 1 data:

```typescript
/**
 * Analyzes Phase 1 data and suggests integration flows
 */
export const suggestIntegrationFlows = (meeting: Meeting): IntegrationFlow[] => {
  const systems = meeting.modules?.systems?.detailedSystems || [];
  const flows: IntegrationFlow[] = [];

  // For each system with integration needs
  systems.forEach(system => {
    system.integrationNeeds?.forEach(need => {
      // Find target system
      const targetSystem = systems.find(s => s.id === need.targetSystemId);

      if (targetSystem) {
        flows.push({
          id: generateId(),
          name: `${system.specificSystem} → ${targetSystem.specificSystem}`,
          description: need.specificNeeds || `סנכרון נתונים בין המערכות`,
          sourceSystem: system.id,
          targetSystem: targetSystem.id,

          // Map from Phase 1 data
          trigger: mapFrequencyToTrigger(need.frequency),
          frequency: need.frequency,
          direction: need.dataFlow === 'bidirectional' ? 'bidirectional' : 'one_way',

          // Empty - need to collect in Phase 2
          steps: [],
          errorHandling: getDefaultErrorHandling(),
          testCases: [],

          // From Phase 1
          priority: mapCriticalityToPriority(need.criticalityLevel),
          estimatedSetupTime: estimateSetupTime(need.integrationType, need.frequency)
        });
      }
    });
  });

  return flows;
};

const mapFrequencyToTrigger = (frequency: string): FlowTrigger => {
  switch (frequency) {
    case 'realtime':
      return { type: 'webhook', configuration: {} };
    case 'hourly':
    case 'daily':
    case 'weekly':
      return { type: 'schedule', configuration: {}, scheduleExpression: getSchedule(frequency) };
    default:
      return { type: 'manual', configuration: {} };
  }
};
```

**Action Items**:
1. Create integrationFlowSuggester.ts.
2. Implement logic to map Phase 1 integration needs and Phase 2 flows. If Deep Dive data is missing for a system, queue the suggestion and prompt the user to complete the system deep dive first.
3. Add estimators for setup time based on integration type.
4. Watch for changes in Phase 1 integration needs and flag any auto-generated flows that become stale.
#### 3.2 Update `IntegrationFlowBuilder.tsx`
**File**: `src/components/Phase2/IntegrationFlowBuilder.tsx`

**Changes**:
1. On first load, check if flows have been suggested
2. If not, run `suggestIntegrationFlows()` and populate
3. Allow editing suggested flows
4. Allow adding NEW flows (not just suggested ones)

```typescript
const IntegrationFlowBuilder: React.FC = () => {
  // Check if flows were suggested from Phase 1
  useEffect(() => {
    if (!currentMeeting?.implementationSpec?.integrations ||
        currentMeeting.implementationSpec.integrations.length === 0) {

      // Suggest flows from Phase 1 data
      const suggestedFlows = suggestIntegrationFlows(currentMeeting);

      if (suggestedFlows.length > 0) {
        updateMeeting({
          implementationSpec: {
            ...currentMeeting.implementationSpec!,
            integrations: suggestedFlows
          }
        });
      }
    }
  }, []);

  // Rest of component...
};
```

**Action Items**:
1. Add auto-suggestion logic to `IntegrationFlowBuilder.tsx`
2. Create UI to show "Suggested from Phase 1" badge
3. Allow marking flows as "completed" or "not needed"

---

### Task 4: AI Agents Detailed Spec - Read from Phase 1
**Priority**: HIGH
**Estimated Time**: 10 hours
**Dependencies**: None

#### 4.1 Create AI Agent Expander
**File**: `src/utils/aiAgentExpander.ts` (NEW)

Logic to expand basic AI agent use cases from Phase 1 into detailed specs:

```typescript
/**
 * Expands basic AI agent use cases from Phase 1 into detailed Phase 2 specs
 */
export const expandAIAgents = (meeting: Meeting): DetailedAIAgentSpec[] => {
  const aiModule = meeting.modules?.aiAgents;
  const detailedAgents: DetailedAIAgentSpec[] = [];

  // Expand sales agents
  if (aiModule?.sales?.useCases && aiModule.sales.useCases.length > 0) {
    aiModule.sales.useCases.forEach(useCase => {
      detailedAgents.push(createDetailedSpec(useCase, 'sales', meeting));
    });
  }

  // Expand service agents
  if (aiModule?.service?.useCases && aiModule.service.useCases.length > 0) {
    aiModule.service.useCases.forEach(useCase => {
      detailedAgents.push(createDetailedSpec(useCase, 'service', meeting));
    });
  }

  // Expand operations agents
  if (aiModule?.operations?.useCases && aiModule.operations.useCases.length > 0) {
    aiModule.operations.useCases.forEach(useCase => {
      detailedAgents.push(createDetailedSpec(useCase, 'operations', meeting));
    });
  }

  return detailedAgents;
};

const createDetailedSpec = (
  useCase: string,
  department: 'sales' | 'service' | 'operations',
  meeting: Meeting
): DetailedAIAgentSpec => {
  return {
    id: generateId(),
    agentId: generateId(),
    name: useCase,
    department,

    // Suggest knowledge base sources from Phase 1
    knowledgeBase: suggestKnowledgeSources(department, meeting),

    // Create basic conversation flow
    conversationFlow: createBasicFlow(useCase, department),

    // Suggest integrations based on Phase 1 systems
    integrations: suggestIntegrations(department, meeting),

    // Pre-fill training from Phase 1 FAQs
    training: prefillTraining(meeting),

    // Suggest model based on use case complexity
    model: suggestModel(useCase)
  };
};

const suggestKnowledgeSources = (
  department: string,
  meeting: Meeting
): KnowledgeBase => {
  const sources: KnowledgeSource[] = [];

  // If they have a website, suggest it
  if (meeting.modules?.overview?.leadCaptureChannels?.includes('website')) {
    sources.push({
      id: generateId(),
      type: 'website',
      name: 'אתר החברה',
      location: '', // User needs to provide
      accessMethod: 'web scraping',
      requiresAuth: false,
      documentCount: 0,
      syncEnabled: true,
      includeInTraining: true
    });
  }

  // If they have customer service FAQs, suggest them
  if (meeting.modules?.customerService?.autoResponse?.topQuestions) {
    sources.push({
      id: generateId(),
      type: 'csv',
      name: 'שאלות ותשובות נפוצות',
      location: '', // Auto-generated from Phase 1 FAQs
      accessMethod: 'direct',
      requiresAuth: false,
      documentCount: meeting.modules.customerService.autoResponse.topQuestions.length,
      syncEnabled: false,
      includeInTraining: true
    });
  }

  return {
    sources,
    updateFrequency: 'manual',
    totalDocuments: sources.length,
    totalTokensEstimated: 0,
    vectorDatabaseUsed: true,
    embeddingModel: 'text-embedding-ada-002'
  };
};
```

**Action Items**:
1. Create `aiAgentExpander.ts`.
2. Map Phase 1 AI use cases to the `DetailedAIAgentSpec` structure so every required field (knowledgeBase, conversationFlow, integrations, training, model) is pre-populated or explicitly marked as pending.
3. Add knowledge source suggestions based on existing Phase 1 data (e.g., customer service FAQs, website channels) and flag anything that still requires manual input.
4. Provide conversation flow templates per department and note the exact fields interviewers must complete (tone, actions, compliance).

#### 4.2 Update `AIAgentDetailedSpec.tsx`
**File**: `src/components/Phase2/AIAgentDetailedSpec.tsx`

**Changes**:
1. On first load, check if agents have been expanded
2. If not, run `expandAIAgents()` and populate
3. Show "Suggested from Phase 1" information

```typescript
const AIAgentDetailedSpec: React.FC = () => {
  // Auto-expand AI agents from Phase 1
  useEffect(() => {
    if (!currentMeeting?.implementationSpec?.aiAgents ||
        currentMeeting.implementationSpec.aiAgents.length === 0) {

      // Expand from Phase 1
      const expandedAgents = expandAIAgents(currentMeeting);

      if (expandedAgents.length > 0) {
        updateMeeting({
          implementationSpec: {
            ...currentMeeting.implementationSpec!,
            aiAgents: expandedAgents
          }
        });
      }
    }
  }, []);

  // Rest of component...
};
```

**Action Items**:
1. Add auto-expansion logic
2. Show which fields were pre-filled from Phase 1
3. Add guidance text for completing missing fields

---

### Task 5: Acceptance Criteria - Smart Generation
**Priority**: MEDIUM
**Estimated Time**: 8 hours
**Dependencies**: Tasks 1-4

#### 5.1 Create Acceptance Criteria Generator
**File**: `src/utils/acceptanceCriteriaGenerator.ts` (NEW)

Logic to generate acceptance criteria based on services, systems, and integrations:

```typescript
/**
 * Generates acceptance criteria from implementation spec
 */
export const generateAcceptanceCriteria = (
  meeting: Meeting
): AcceptanceCriteria => {
  return {
    functional: generateFunctionalRequirements(meeting),
    performance: generatePerformanceRequirements(meeting),
    security: generateSecurityRequirements(meeting),
    usability: generateUsabilityRequirements(meeting)
  };
};

const generateFunctionalRequirements = (
  meeting: Meeting
): FunctionalRequirement[] => {
  const requirements: FunctionalRequirement[] = [];
  const services = meeting.modules?.proposal?.selectedServices || [];

  // For each service, generate functional requirements
  services.forEach(serviceId => {
    const service = getServiceById(serviceId);
    if (!service) return;

    // Example: CRM Implementation
    if (serviceId === 'impl-crm') {
      requirements.push({
        id: generateId(),
        category: 'CRM',
        description: 'המערכת מאפשרת יצירת לידים חדשים ידנית ומטפסים',
        priority: 'must_have',
        testScenario: 'יצירת ליד חדש דרך טופס אתר + בדיקה ב-CRM',
        acceptanceCriteria: 'הליד מופיע ב-CRM תוך 60 שניות עם כל השדות המתאימים',
        status: 'pending'
      });

      requirements.push({
        id: generateId(),
        category: 'CRM',
        description: 'המערכת מבצעת הקצאה אוטומטית של לידים לנציגים',
        priority: 'must_have',
        testScenario: 'הכנסת 10 לידים ובדיקת ההקצאה',
        acceptanceCriteria: 'כל ליד מוקצה לנציג על בסיס round-robin או טריטוריה',
        status: 'pending'
      });
    }

    // Add more service-specific requirements...
  });

  // For each integration, generate functional requirements
  const integrations = meeting.implementationSpec?.integrations || [];
  integrations.forEach(integration => {
    requirements.push({
      id: generateId(),
      category: 'אינטגרציה',
      description: `${integration.name} - סנכרון נתונים`,
      priority: integration.priority === 'critical' ? 'must_have' : 'should_have',
      testScenario: `יצירת רשומה במערכת המקור ובדיקת העברה למערכת היעד`,
      acceptanceCriteria: `הנתונים עוברים תוך ${getExpectedSyncTime(integration.frequency)}`,
      status: 'pending'
    });
  });

  return requirements;
};

const generatePerformanceRequirements = (
  meeting: Meeting
): PerformanceRequirement[] => {
  const requirements: PerformanceRequirement[] = [];

  // API response times
  const systems = meeting.implementationSpec?.systems || [];
  systems.forEach(system => {
    requirements.push({
      id: generateId(),
      metric: `${system.systemName} - זמן תגובת API`,
      target: '< 500ms',
      testMethod: 'בדיקה עם 100 בקשות רצופות',
      status: 'pending'
    });
  });

  // Integration sync times
  const integrations = meeting.implementationSpec?.integrations || [];
  integrations.forEach(integration => {
    if (integration.frequency === 'realtime') {
      requirements.push({
        id: generateId(),
        metric: `${integration.name} - זמן סנכרון`,
        target: '< 2 minutes',
        testMethod: 'מדידת זמן מיצירת רשומה עד הופעתה במערכת היעד',
        status: 'pending'
      });
    }
  });

  return requirements;
};
```

**Action Items**:
1. Create `acceptanceCriteriaGenerator.ts`
2. Add service-specific requirement templates
3. Add integration-specific requirement templates
4. Add AI agent-specific quality criteria

#### 5.2 Update Dashboard to Show Generated Criteria
**File**: `src/components/Phase2/ImplementationSpecDashboard.tsx`

Add button to auto-generate acceptance criteria:

```typescript
const handleGenerateCriteria = () => {
  const generated = generateAcceptanceCriteria(currentMeeting);

  updateMeeting({
    implementationSpec: {
      ...currentMeeting.implementationSpec!,
      acceptanceCriteria: {
        functional: [
          ...currentMeeting.implementationSpec!.acceptanceCriteria.functional,
          ...generated.functional
        ],
        performance: [
          ...currentMeeting.implementationSpec!.acceptanceCriteria.performance,
          ...generated.performance
        ],
        security: [
          ...currentMeeting.implementationSpec!.acceptanceCriteria.security,
          ...generated.security
        ],
        usability: [
          ...currentMeeting.implementationSpec!.acceptanceCriteria.usability,
          ...generated.usability
        ]
      }
    }
  });
};
```

**Action Items**:
1. Add "Generate Acceptance Criteria" button
2. Show preview before applying
3. Allow editing generated criteria

---

### Task 6: Data Migration & Backward Compatibility
**Priority**: CRITICAL  
**Estimated Time**: 6 hours  
**Dependencies**: Tasks 2-5

#### 6.1 Introduce Data Version v4
**Files**: `src/utils/dataMigration.ts`, `src/store/useMeetingStore.ts`

1. Bump `CURRENT_DATA_VERSION` to 4 and document the new schema contract (Phase 2 fields now required).
2. Add migration steps that:
   - Initialises `implementationSpec.systems`, `.integrations`, `.aiAgents`, and `.acceptanceCriteria` if missing.
   - Normalises IDs so any auto-generated Phase 2 record keeps a stable reference back to Phase 1 (`systemId`, `targetSystemId`, etc.).
   - Converts legacy free-form system entries into `detailedSystems` where possible (fallback: mark them as `legacy` and surface a reminder in Phase 2).
3. Persist migration logs (reuse `MIGRATION_LOG_KEY`) so we can audit upgrades in the field.

#### 6.2 Supabase + LocalStorage Compatibility
1. Add a one-time upgrade routine in `useMeetingStore` that runs the migration for every meeting before Phase 2 routes mount.
2. Ensure the sync pipeline (Supabase + Zoho) writes/reads the new Phase 2 structures; add null checks where data can legitimately be absent.
3. Provide downgrade guards—if the plan is loaded with older Phase 2 data, display a banner instructing the user to finish the migration.

#### 6.3 Verification
1. Capture fixtures (pre-v4 meeting JSON) and assert post-migration structure in automated tests (`test/phase2/migration.test.ts`).
2. Smoke-test existing meetings saved in Supabase to ensure no key fields disappear.
3. Update documentation (`CLAUDE.md` / runbooks) with the new version number and recovery steps.

---

## Testing Strategy

### Phase 1 → Phase 2 Data Flow Testing

Create test cases to verify data flows correctly:

```typescript
// test/phase2/dataFlow.test.ts

describe('Phase 1 → Phase 2 Data Flow', () => {
  it('should populate systems from Phase 1', () => {
    const meeting = createTestMeeting();
    meeting.modules.systems.detailedSystems = [
      {
        id: 'sys1',
        category: 'crm',
        specificSystem: 'Zoho CRM',
        recordCount: 5000,
        integrationNeeds: [...]
      }
    ];

    // Navigate to Phase 2
    const systemsToDeepDive = getSystemsNeedingDeepDive(meeting);

    expect(systemsToDeepDive).toHaveLength(1);
    expect(systemsToDeepDive[0].systemName).toBe('Zoho CRM');
  });

  it('should suggest integration flows from Phase 1', () => {
    const meeting = createTestMeeting();
    // Add 2 systems with integration needs

    const flows = suggestIntegrationFlows(meeting);

    expect(flows.length).toBeGreaterThan(0);
    expect(flows[0].sourceSystem).toBeDefined();
    expect(flows[0].targetSystem).toBeDefined();
  });

  it('should expand AI agents from Phase 1', () => {
    const meeting = createTestMeeting();
    meeting.modules.aiAgents = {
      sales: {
        useCases: ['סוכן מכירות - תגובה ללידים'],
        potential: 'high',
        readiness: 'ready'
      }
    };

    const expanded = expandAIAgents(meeting);

    expect(expanded).toHaveLength(1);
    expect(expanded[0].department).toBe('sales');
    expect(expanded[0].knowledgeBase.sources.length).toBeGreaterThan(0);
  });
});
```

---

## Success Criteria

Phase 2 is considered complete when:

- ✅ **Requirements Collection**: All 100+ services have requirement templates
- ✅ **Systems Deep Dive**: Reads from Phase 1, collects auth details for ALL systems
- ✅ **Integration Flows**: Auto-suggests flows from Phase 1 integration needs
- ✅ **AI Agents**: Auto-expands AI use cases from Phase 1 into detailed specs
- ✅ **Acceptance Criteria**: Smart generation based on services/systems/integrations
- �o. **Data Migration**: v4 migration runs automatically (localStorage + Supabase) with zero data loss and a persisted audit log
- ✅ **Testing**: All Phase 1 → Phase 2 flows tested with sample data

---

## Timeline Estimate

| Task | Priority | Estimated Hours | Dependencies |
|------|----------|----------------|--------------|
| Task 1: Requirements (70+ services) | HIGH | 8h | None |
| Task 2: Systems Deep Dive | CRITICAL | 12h | None |
| Task 3: Integration Flows | CRITICAL | 10h | Task 2 |
| Task 4: AI Agents Expansion | HIGH | 10h | None |
| Task 5: Acceptance Criteria | MEDIUM | 8h | Tasks 1-4 |
| Task 6: Data Migration & Backward Compatibility | CRITICAL | 6h | Tasks 2-5 |
| Testing & QA | CRITICAL | 8h | All tasks |
| **Total** | | **62 hours** | |

**Estimated Completion**: ~8 working days (8 hours/day)

---

## Questions for Clarification

1. ❓ Should Phase 2 allow adding NEW systems (not from Phase 1)?
   - **My understanding**: No - only "deep dive" into Phase 1 systems
   - **Confirm**: Is this correct?

2. ❓ Should Phase 2 allow adding NEW integration flows (beyond Phase 1 needs)?
   - **My understanding**: Yes - suggest from Phase 1, but allow manual additions
   - **Confirm**: Is this correct?

3. ❓ Should Phase 2 allow creating NEW AI agents (beyond Phase 1 use cases)?
   - **My understanding**: Yes - expand from Phase 1, but allow manual additions
   - **Confirm**: Is this correct?

4. ❓ What happens if a service has NO requirement template?
   - **Option A**: Show generic form with basic questions
   - **Option B**: Skip requirements for that service
   - **Option C**: Block service selection until template exists
   - **Confirm**: Which option?

5. ❓ Should acceptance criteria be editable after generation?
   - **My understanding**: Yes - generate as starting point, allow full editing
   - **Confirm**: Is this correct?

---

## Next Steps

Once you confirm the plan:
1. I'll start with **Task 2 (Systems Deep Dive)** - most critical
2. Then **Task 3 (Integration Flows)**
3. Then **Task 4 (AI Agents)**
4. Then **Task 1 (Remaining Requirements)**
5. Finally **Task 5 (Acceptance Criteria)**

Would you like me to proceed with this plan, or would you like to discuss any modifications?
