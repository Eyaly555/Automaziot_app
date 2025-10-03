# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive **Discovery Assistant** application for automating business discovery meetings and implementation planning. It's a sophisticated multi-phase React/TypeScript application (110+ source files) that guides users through the entire project lifecycle:

1. **Phase 1 (Discovery)**: Client requirements gathering with wizard-based interface across 9 business modules
2. **Phase 2 (Implementation Spec)**: Detailed technical specifications, system integrations, and acceptance criteria after client approval
3. **Phase 3 (Development)**: Task management, sprint planning, and progress tracking for developers

The application features deep integration with **Zoho CRM** for client data synchronization and **Supabase** for persistent storage, authentication, and real-time collaboration. It includes an intelligent proposal engine, ROI calculator, and automated task generation system.

**Tech Stack**: React 19, TypeScript, Zustand, Vite, Tailwind CSS, React Router, Supabase, Chart.js, React Flow, jsPDF, XLSX

## Development Commands

```bash
# Development
npm run dev                    # Start dev server on port 5176

# Building
npm run build                  # Build for production (Vite only)
npm run build:typecheck        # Build with TypeScript type checking
npm run preview                # Preview production build

# Testing
npm test                       # Run unit tests (Vitest)
npm run test:ui                # Run tests with UI
npm run test:e2e               # Run end-to-end tests (Playwright)
npm run test:all               # Run all tests (unit + e2e)

# Linting
npm run lint                   # Lint with ESLint
```

## Architecture

### State Management

The application uses **Zustand** for state management with local storage persistence:

- **Primary store**: `src/store/useMeetingStore.ts` - Central meeting and application state
- Handles all meeting data, wizard state, phase transitions, task management
- Persists to localStorage with automatic sync capabilities
- Includes Zoho and Supabase sync integration

### Three-Phase Architecture

**Phase 1 - Discovery (`MeetingPhase = 'discovery'`)**
- **Wizard-based UI**: [/wizard](/src/components/Wizard/WizardMode.tsx) - Guided step-by-step data collection
- **Module-based UI**: [/dashboard](/src/components/Dashboard/Dashboard.tsx) - Direct module access
- **9 Core Business Modules**:
  1. **Overview**: Business type, employees, challenges, goals
  2. **LeadsAndSales**: Lead sources, speed-to-lead, routing, follow-up, appointments
  3. **CustomerService**: Support channels, auto-response, proactive communication, onboarding
  4. **Operations**: Inventory, suppliers, workflows, quality control
  5. **Reporting**: Current reports, BI tools, data sources, decision-making
  6. **AIAgents**: Use cases for AI in sales, service, and operations
  7. **Systems**: Current systems inventory with detailed specs (5,900+ lines of system database)
  8. **ROI**: Cost analysis, time savings, ROI scenarios (conservative/realistic/optimistic)
  9. **Proposal**: AI-generated service proposals based on collected data
- **Wizard Configuration**: [src/config/wizardSteps.ts](/src/config/wizardSteps.ts) - Comprehensive field definitions
- **Module data stored**: `meeting.modules[moduleName]`
- **Pain Points Tracking**: Each module can flag pain points with severity and potential savings

**Phase 2 - Implementation Spec (`MeetingPhase = 'implementation_spec'`)**
- **Activation**: After client approval via `transitionPhase('implementation_spec')`
- **Requirements Collection**: Detailed specifications for each selected service
- **Components**:
  - **System Deep Dive** ([SystemDeepDive.tsx](/src/components/Phase2/SystemDeepDive.tsx)): Authentication, modules, fields, data migration
  - **Integration Flow Builder** ([IntegrationFlowBuilder.tsx](/src/components/Phase2/IntegrationFlowBuilder.tsx)): Visual flow design, data mapping
  - **AI Agent Spec** ([AIAgentDetailedSpec.tsx](/src/components/Phase2/AIAgentDetailedSpec.tsx)): Training data, knowledge base, capabilities
  - **Acceptance Criteria** ([AcceptanceCriteriaBuilder.tsx](/src/components/Phase2/AcceptanceCriteriaBuilder.tsx)): Functional, performance, security, usability
- **Routes**: [/phase2/*](/src/components/Phase2/)
- **Types**: [src/types/phase2.ts](/src/types/phase2.ts)
- **Storage**: `meeting.implementationSpec` (not phase2Data)
- **Service Requirements**: [src/config/serviceRequirementsTemplates.ts](/src/config/serviceRequirementsTemplates.ts)

**Phase 3 - Development (`MeetingPhase = 'development'`)**
- **Purpose**: Developer task management and sprint execution
- **Components**:
  - **Developer Dashboard** ([DeveloperDashboard.tsx](/src/components/Phase3/DeveloperDashboard.tsx)): Multi-view task management (Kanban, List, Sprint, System, Team)
  - **Sprint View**: Sprint planning and tracking
  - **System View**: Tasks organized by system
  - **Blocker Management**: Track and resolve blockers
  - **Progress Tracking**: Hours, completion, velocity
- **Task Generation**: [src/utils/taskGenerator.ts](/src/utils/taskGenerator.ts) - Auto-generates tasks from Phase 2 specs
- **Bilingual Support**: English UI for developers (Phase 3 only), Hebrew for business users
- **Routes**: [/phase3/*](/src/components/Phase3/)
- **Types**: [src/types/phase3.ts](/src/types/phase3.ts)
- **Storage**: `meeting.developmentTracking` (not phase3Data)

### Routing Structure

[src/components/AppContent.tsx](/src/components/AppContent.tsx) defines all routes:

```
/                              → Dashboard
/wizard                        → Wizard mode (Phase 1)
/module/{moduleName}           → Individual module views
/phase2                        → Implementation spec dashboard
/phase2/systems/:systemId      → System deep dive
/phase2/integrations/:flowId   → Integration flow builder
/phase2/agents/:agentId        → AI agent spec
/phase3                        → Developer dashboard
/phase3/sprints                → Sprint view
/phase3/systems                → System view
/phase3/blockers               → Blocker management
```

### Zoho Integration

The application features comprehensive Zoho CRM integration for client data synchronization:

- **Backend API**: Calls to `/api/zoho/*` endpoints (backend API not in this repo)
- **Frontend Services**:
  - [src/services/zohoAPI.ts](/src/services/zohoAPI.ts) - Main API client
  - [src/services/zohoSyncService.ts](/src/services/zohoSyncService.ts) - Sync operations
  - [src/services/zohoClientsService.ts](/src/services/zohoClientsService.ts) - Client list management
  - [src/services/autoSyncService.ts](/src/services/autoSyncService.ts) - Auto-sync every 5 minutes
  - [src/services/zohoRetryQueue.ts](/src/services/zohoRetryQueue.ts) - Retry failed syncs
- **Components**:
  - [src/components/ZohoIntegrationWrapper.tsx](/src/components/ZohoIntegrationWrapper.tsx) - Initialization
  - [src/components/ZohoModeIndicator.tsx](/src/components/ZohoModeIndicator.tsx) - Visual indicator
  - [src/components/ZohoNotifications.tsx](/src/components/ZohoNotifications.tsx) - Sync status notifications
  - [src/components/Clients/ClientsListView.tsx](/src/components/Clients/ClientsListView.tsx) - Browse Zoho clients
- **URL Parsing**: [src/integrations/zoho/paramParser.ts](/src/integrations/zoho/paramParser.ts) - Parses Zoho iframe params
- **Helpers**: [src/utils/zohoHelpers.ts](/src/utils/zohoHelpers.ts)
- **Meeting Integration**: `meeting.zohoIntegration` object with `recordId`, `module`, `syncEnabled`, `lastSync`, `contactInfo`
- **Client Cache**: Stores Zoho client list with last fetch time for performance

### Supabase Integration

Optional persistent storage, authentication, and real-time collaboration:

- **Client**: [src/lib/supabase.ts](/src/lib/supabase.ts) - Comprehensive wrapper with helpers
- **Services**:
  - [src/services/syncService.ts](/src/services/syncService.ts) - Optimistic updates, conflict resolution, sync queue
  - [src/services/autoSyncService.ts](/src/services/autoSyncService.ts) - Automatic background sync
- **Hooks**:
  - [src/hooks/useCollaboration.ts](/src/hooks/useCollaboration.ts) - Real-time collaboration with presence
- **Context**: [src/contexts/AuthContext.tsx](/src/contexts/AuthContext.tsx)
- **Database Schema**: [src/types/database.ts](/src/types/database.ts) - Full TypeScript types for Supabase tables
- **Tables**: `profiles`, `meetings`, `meeting_collaborators`, `meeting_activities`, `meeting_comments`, `custom_field_values`
- **Features**:
  - Authentication with PKCE flow
  - Realtime presence and cursors
  - Optimistic updates with rollback
  - Conflict resolution strategies
  - File upload/storage
  - Activity logging
- **Degraded Mode**: Works with localStorage only if not configured
- **Check Config**: Use `isSupabaseConfigured()` before operations

## Key Concepts

### Data Structure Unification (Wizard-Module Sync)

The application features a sophisticated **two-tier architecture** for data collection that was unified in Sprint 1 (March 2025):

#### Two Collection Modes, One Data Source

1. **Wizard Mode** (`/wizard`): Guided step-by-step data collection
   - Linear progression through 9 business modules
   - Field-by-field validation and guidance
   - Progress tracking with skip capability
   - Ideal for first-time users
   - Configured in [wizardSteps.ts](/src/config/wizardSteps.ts)

2. **Module Mode** (`/dashboard`, `/module/*`): Direct module access
   - Non-linear navigation
   - Complete module views with all fields
   - Expert-friendly interface
   - Flexible data entry

**Critical Principle**: Both modes read from and write to the **same underlying data structure**: `meeting.modules[moduleName]`

This ensures:
- Data entered in wizard appears immediately in modules
- Module changes reflect in wizard progress
- No data duplication or sync conflicts
- Single source of truth for all module data

#### Data Flow Pattern

```
User Input (Wizard or Module)
         ↓
updateModule('moduleName', data)
         ↓
meeting.modules[moduleName]  ← Single source of truth
         ↓
Auto-save to localStorage
         ↓
Optional sync to Supabase/Zoho
```

### Data Migration System

The application includes an automatic data migration system that runs transparently on app load. This system handles schema evolution while ensuring **zero data loss**.

#### Why Migration Matters

As the application evolves, data structures change. The migration system:
- Automatically detects old data formats
- Converts them to current schema
- Preserves all user data
- Logs all migrations for audit trail
- Handles edge cases gracefully

#### Migration Architecture

**Location**: [src/utils/dataMigration.ts](/src/utils/dataMigration.ts)

**Integration Point**: [src/store/useMeetingStore.ts](/src/store/useMeetingStore.ts) - `onRehydrateStorage` callback

**When It Runs**:
- Automatically on app load (via Zustand rehydration)
- Before any meeting data is used
- Transparent to users

**How It Works**:
1. App loads → Zustand loads data from localStorage
2. Migration check: `needsMigration(meeting)`
3. If needed: `migrateMeetingData(meeting)` runs
4. Updated data replaces old data in store
5. Migration logged to localStorage
6. App continues normally

**Performance**: < 5ms per meeting, minimal startup impact

#### Version History

**v1 (Legacy - Pre-Sprint 1)**:
```typescript
// LeadsAndSales - OLD structure
{
  leadSources: {
    sources: LeadSource[],      // Array nested in object
    centralSystem?: string,
    commonIssues?: string[]
  }
}

// CustomerService - OLD structure
{
  channels: {
    list: ServiceChannel[],     // Array nested in object
    multiChannelIssue?: string,
    unificationMethod?: string
  }
}
```

**v2 (Current - March 2025)**:
```typescript
// LeadsAndSales - NEW structure
{
  leadSources: LeadSource[],    // Direct array (flat)
  centralSystem?: string,       // Top-level property
  commonIssues?: string[],      // Top-level property
  leadSourcesMetadata?: any     // Preserved legacy data
}

// CustomerService - NEW structure
{
  channels: ServiceChannel[],   // Direct array (flat)
  multiChannelIssue?: string,   // Top-level property
  unificationMethod?: string,   // Top-level property
  channelsMetadata?: any        // Preserved legacy data
}
```

**Benefits of v2**:
- Better TypeScript type safety
- Simpler component logic (no nested access)
- Easier Array.isArray() checks
- Consistent with wizard field structure
- Aligns with other modules (Operations, Reporting, etc.)

#### Migration Guarantees

1. **Non-Destructive**: Original data deep-cloned before modification
2. **Idempotent**: Safe to run multiple times
3. **Error Handling**: Try-catch per module with detailed logging
4. **Data Preservation**: Metadata saved to separate fields if present
5. **Validation**: Post-migration checks ensure structure correctness
6. **Audit Trail**: All migrations logged with timestamps

#### Accessing Migration Logs

Migration logs are stored in localStorage under `discovery_migration_log`:

```typescript
import { getMigrationLogs, generateMigrationReport } from './utils/dataMigration';

// Get all logs
const logs = getMigrationLogs();
console.log(logs);

// Get formatted report
const report = generateMigrationReport();
console.log(report);
```

#### Adding New Migrations (For Future Development)

When adding v2→v3 migrations:

1. Update version constant:
   ```typescript
   export const CURRENT_DATA_VERSION = 3;
   ```

2. Create migration function:
   ```typescript
   function migrateV2ToV3(result: MigrationResult): void {
     // Your migration logic
     if (/* migration successful */) {
       result.migrationsApplied.push('migration_description');
     }
   }
   ```

3. Call in `migrateMeetingData`:
   ```typescript
   if (currentVersion < 3) {
     migrateV2ToV3(result);
   }
   ```

4. Update TypeScript interfaces in [src/types/index.ts](/src/types/index.ts)

5. Write comprehensive tests in [src/utils/__tests__/dataMigration.test.ts](/src/utils/__tests__/dataMigration.test.ts)

6. Update this documentation

**Reference**: See [DATA_MIGRATION_GUIDE.md](/discovery-assistant/DATA_MIGRATION_GUIDE.md) for complete migration documentation

### Data Format Versions

The application tracks data versions in `meeting.dataVersion`:

| Version | Date | Changes | Migration Function |
|---------|------|---------|-------------------|
| 1 | Legacy | Original nested object structures | N/A |
| 2 | March 2025 | LeadsAndSales and CustomerService flattened to arrays | `migrateV1ToV2()` |
| 3+ | Future | TBD | TBD |

All new meetings created are automatically set to `dataVersion: 2` (current).

### Meeting Object Structure

The `Meeting` type ([src/types/index.ts](/src/types/index.ts)) is the root data structure:

```typescript
interface Meeting {
  meetingId: string;
  clientName: string;
  date: Date;
  timer?: number;
  notes?: string;
  totalROI?: number;

  // Data migration tracking (v2 current)
  dataVersion?: number; // Current: 2 (auto-migrated on load)

  // Phase tracking
  phase: MeetingPhase; // 'discovery' | 'implementation_spec' | 'development' | 'completed'
  status: MeetingStatus; // Detailed status like 'discovery_in_progress', 'client_approved', etc.
  phaseHistory: PhaseTransition[];

  // Phase 1 - Discovery data (wizard-module unified source)
  modules: {
    overview: OverviewModule;
    leadsAndSales: LeadsAndSalesModule;        // v2: leadSources is direct array
    customerService: CustomerServiceModule;    // v2: channels is direct array
    operations: OperationsModule;
    reporting: ReportingModule;
    aiAgents: AIAgentsModule;
    systems: SystemsModule;
    roi: ROIModule;
    proposal?: ProposalData;
    requirements?: CollectedRequirements[]; // Service requirements
  };
  painPoints: PainPoint[];
  customFieldValues?: CustomFieldValues;
  wizardState?: WizardState;                   // Wizard progress tracking

  // Phase 2 - Implementation Spec data (NOT phase2Data)
  implementationSpec?: {
    systems: DetailedSystemSpec[];
    integrations: IntegrationFlow[];
    aiAgents: DetailedAIAgentSpec[];
    acceptanceCriteria: AcceptanceCriteria;
    totalEstimatedHours: number;
    completionPercentage: number;
  };

  // Phase 3 - Development data (NOT phase3Data)
  developmentTracking?: {
    tasks: DevelopmentTask[];
    sprints: Sprint[];
    blockers: Blocker[];
    teamMembers: TeamMember[];
    velocity: VelocityMetrics;
  };

  // Integrations
  zohoIntegration?: {
    recordId: string;
    module: 'Potentials1';
    lastSyncTime?: string;
    syncEnabled?: boolean;
    contactInfo?: { email?: string; phone?: string; };
  };
  supabaseId?: string;
}
```

**IMPORTANT**:
- Property names are `implementationSpec` and `developmentTracking`, NOT `phase2Data` or `phase3Data`
- `dataVersion` tracks schema version (current: 2)
- Migration runs automatically on app load via `onRehydrateStorage`
- Both wizard and modules use the same `meeting.modules[moduleName]` data source

### Wizard System

The wizard in Phase 1 provides guided data collection:
- **Steps config**: [src/config/wizardSteps.ts](/src/config/wizardSteps.ts) - Comprehensive field definitions for all modules
- **Components**:
  - [src/components/Wizard/WizardMode.tsx](/src/components/Wizard/WizardMode.tsx) - Main wizard container
  - [src/components/Wizard/WizardNavigation.tsx](/src/components/Wizard/WizardNavigation.tsx) - Step navigation
  - [src/components/Wizard/WizardProgress.tsx](/src/components/Wizard/WizardProgress.tsx) - Visual progress
  - [src/components/Wizard/WizardSidebar.tsx](/src/components/Wizard/WizardSidebar.tsx) - Section overview
  - [src/components/Wizard/WizardStepContent.tsx](/src/components/Wizard/WizardStepContent.tsx) - Dynamic field rendering
  - [src/components/Wizard/WizardSummary.tsx](/src/components/Wizard/WizardSummary.tsx) - Completion summary
- **State**: `meeting.wizardState` tracks current step, completed steps, progress
- **Field Types**: TextField, SelectField, CheckboxGroup, RadioGroup, NumberField, TextAreaField, RatingField
- **Features**: Section skipping, validation, auto-save, progress tracking

### Configuration Databases

Extensive configuration databases power the application:

- **Systems Database** ([src/config/systemsDatabase.ts](/src/config/systemsDatabase.ts)):
  - 100+ business systems across 15+ categories
  - CRM, ERP, E-commerce, Marketing, Accounting, HR, etc.
  - System details: versions, API access, market share
  - Used for system inventory in Phase 1

- **Services Database** ([src/config/servicesDatabase.ts](/src/config/servicesDatabase.ts)):
  - Catalog of automation and integration services
  - Categories: Automations, AI Agents, Integrations, System Implementation, Additional Services
  - Each service: pricing, estimated days, complexity, tags
  - Used by proposal engine

- **Service Requirements Templates** ([src/config/serviceRequirementsTemplates.ts](/src/config/serviceRequirementsTemplates.ts)):
  - Detailed requirement templates for each service
  - Multi-section forms with conditional fields
  - Examples: CRM Implementation, Integration Setup, AI Agent Training
  - Used in Phase 2 requirements gathering

### Custom Field Values

Users can dynamically add custom options to select fields:
- **Storage**: `meeting.customFieldValues[moduleId][fieldName][]`
- **Service**: [src/services/customValuesService.ts](/src/services/customValuesService.ts)
- **Components**:
  - [src/components/Common/FormFields/CustomizableSelectField.tsx](/src/components/Common/FormFields/CustomizableSelectField.tsx)
  - [src/components/Common/FormFields/CustomizableCheckboxGroup.tsx](/src/components/Common/FormFields/CustomizableCheckboxGroup.tsx)
- **Synced**: Custom values persist across sessions and sync to Supabase

### Intelligent Proposal Engine

AI-powered analysis and proposal generation:

- **Proposal Engine** ([src/utils/proposalEngine.ts](/src/utils/proposalEngine.ts)):
  - Analyzes all 9 modules to identify automation opportunities
  - Matches pain points to services from services database
  - Scores relevance (1-10) and generates reasons for suggestions
  - Produces `ProposedService[]` with pricing and ROI

- **Smart Recommendations** ([src/utils/smartRecommendationsEngine.ts](/src/utils/smartRecommendationsEngine.ts)):
  - Pattern detection across modules
  - Identifies: missing integrations, manual data entry, high-volume tasks
  - Generates n8n workflow templates
  - Quick wins identification (high impact, low effort)
  - Impact scoring and prioritization

- **ROI Calculator** ([src/utils/roiCalculator.ts](/src/utils/roiCalculator.ts)):
  - Calculates time savings, cost savings, payback period
  - Three scenarios: Conservative, Realistic, Optimistic
  - Factors: hourly rates, deal values, implementation costs, ongoing costs
  - 12/24/36 month projections

### Task Auto-Generation

Automatic task generation from specifications:

- **Task Generator** ([src/utils/taskGenerator.ts](/src/utils/taskGenerator.ts)):
  - Reads Phase 2 implementation specs
  - Generates development tasks for systems, integrations, AI agents
  - Creates test cases, dependencies, blockers
  - Assigns to sprints automatically
  - Task types: integration, ai_agent, workflow, migration, testing, deployment

### Technical Specification Generation

Export detailed technical specifications:

- **Technical Spec Generator** ([src/utils/technicalSpecGenerator.ts](/src/utils/technicalSpecGenerator.ts)):
  - Generates comprehensive technical documentation
  - Includes: system inventory, integration map, automation opportunities
  - n8n workflow templates with nodes and connections
  - Implementation phases with timelines

- **Data Mapping Generator** ([src/utils/dataMappingGenerator.ts](/src/utils/dataMappingGenerator.ts)):
  - Auto-generates field mappings between systems
  - Handles CRM, ERP, E-commerce mappings
  - Includes transformations, validations, examples
  - Triggers and error handling strategies

- **Export Utilities**:
  - [src/utils/exportTechnicalSpec.ts](/src/utils/exportTechnicalSpec.ts) - PDF export with jsPDF
  - [src/utils/englishExport.ts](/src/utils/englishExport.ts) - Plain text/Markdown export
  - Excel export using `xlsx` library

## Data Flow Patterns

### Updating Module Data

Always use the store's `updateModule` function:

```typescript
const { updateModule } = useMeetingStore();

updateModule('systems', {
  currentSystems: [...newSystems],
  integrationNeeds: 'high'
});
```

### Phase Transitions

Use store methods for phase management:

```typescript
const { transitionPhase, canTransitionTo } = useMeetingStore();

// Check if transition is allowed
if (canTransitionTo('implementation_spec')) {
  transitionPhase('implementation_spec', 'Client approved proposal');
}
```

### Syncing with External Systems

```typescript
// Zoho sync
const { syncMeetingWithZoho } = zohoAPI;
await syncMeetingWithZoho(meeting, recordId);

// Supabase sync
const { syncMeeting } = useMeetingStore();
await syncMeeting(meetingId);
```

## Testing

- **Unit tests**: Vitest with React Testing Library
- **E2E tests**: Playwright (see [e2e/full-flow.test.ts](/discovery-assistant/e2e/full-flow.test.ts))
- **Test setup**: [test-setup.ts](/discovery-assistant/test-setup.ts)

## Build Configuration

- **Vite config**: [vite.config.ts](/discovery-assistant/vite.config.ts)
  - Port: 5176
  - Chunk splitting for vendor libraries
  - Terser minification
  - Sourcemaps enabled
- **TypeScript**: Composite project with [tsconfig.json](/discovery-assistant/tsconfig.json)
- **Tailwind**: [tailwind.config.js](/discovery-assistant/tailwind.config.js)

## Environment Variables

Required for full functionality:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The app works in degraded mode without these (localStorage only).

## Important Implementation Notes

### Optional Chaining for Meeting Modules

Always use optional chaining when accessing nested module properties:

```typescript
// Correct
const systemsData = currentMeeting?.modules?.systems;

// Avoid
const systemsData = currentMeeting.modules.systems; // May cause errors
```

### Phase-Specific UI

Check current phase before rendering phase-specific UI:

```typescript
// Correct property name
if (currentMeeting?.phase === 'implementation_spec') {
  // Show Phase 2 UI
}

// Check status for more granular control
if (currentMeeting?.status === 'client_approved') {
  // Show approval-specific UI
}
```

### Phase Transition Rules

Use store methods to check and perform transitions:

```typescript
const { canTransitionTo, transitionPhase, updatePhaseStatus } = useMeetingStore();

// Check if transition is allowed (validates prerequisites)
if (canTransitionTo('implementation_spec')) {
  transitionPhase('implementation_spec', 'Client approved proposal');
}

// Update status within current phase
updatePhaseStatus('spec_in_progress');
```

**Phase Transition Requirements**:
- `discovery` → `implementation_spec`: Requires proposal module completion
- `implementation_spec` → `development`: Requires implementation spec completion
- Transitions are logged in `phaseHistory` with timestamp and notes

### Sync Handling

The app uses sophisticated optimistic updates with conflict resolution:

- **Optimistic Updates**: Local changes happen immediately, UI updates instantly
- **Background Sync**: Changes queued and synced to Supabase/Zoho in background
- **Sync Queue**: Failed syncs retry with exponential backoff
- **Conflict Resolution**:
  - Strategies: `local`, `remote`, `merge`, `ask`
  - Default: `merge` strategy
  - User can resolve conflicts manually via UI
- **Offline Support**: Works fully offline, syncs when connection restored
- **Activity Logging**: All changes tracked in `meeting_activities` table

## Common Patterns

### Form Fields

Use standardized form components from [src/components/Common/FormFields/](/src/components/Common/FormFields/):
- `TextField`, `TextAreaField`, `NumberField`
- `SelectField`, `CustomizableSelectField`
- `CheckboxGroup`, `CustomizableCheckboxGroup`
- `RadioGroup`, `RatingField`

### Module Components

Module components follow a consistent pattern with **defensive programming** for data migration compatibility:

**Location**: [src/components/Modules/{ModuleName}/](/src/components/Modules/)

**Standard Pattern**:
```typescript
export const ModuleNameModule: React.FC = () => {
  const { currentMeeting, updateModule } = useMeetingStore();
  const moduleData = currentMeeting?.modules?.moduleName || {};

  // Initialize state with optional chaining and defaults
  const [fieldArray, setFieldArray] = useState<Type[]>(
    moduleData?.fieldArray || []
  );

  // Save changes to store
  const handleSave = () => {
    updateModule('moduleName', {
      fieldArray,
      otherField
    });
  };
};
```

**Key Principles**:

1. **Optional Chaining**: Always use `?.` when accessing nested properties
   ```typescript
   const data = currentMeeting?.modules?.leadsAndSales?.leadSources;
   ```

2. **Array.isArray() Checks**: Before using `.map()`, `.filter()`, etc.
   ```typescript
   if (Array.isArray(leadSources)) {
     leadSources.map(source => { /* safe */ });
   }
   ```

3. **Default Values**: Use `||` or `??` for safe defaults
   ```typescript
   const sources = moduleData?.leadSources || [];
   const channels = moduleData?.channels ?? [];
   ```

4. **Initialization Helpers**: For complex initializations
   ```typescript
   // Example from LeadsAndSalesModule.tsx
   function initializeLeadSources(data: any): LeadSource[] {
     if (!data) return [];
     if (Array.isArray(data)) return data;
     if (data.sources && Array.isArray(data.sources)) return data.sources;
     return [];
   }
   ```

5. **Pain Point Flagging**: All modules include pain point capability
   ```typescript
   import { PainPointFlag } from '../../Common/PainPointFlag/PainPointFlag';

   <PainPointFlag
     module="moduleName"
     subModule="sectionName"
     description="User-provided pain point description"
   />
   ```

**Data Migration Compatibility**:

Modules are designed to work with both v1 (legacy) and v2 (current) data formats:

```typescript
// This works for both formats:
const leadSources = moduleData?.leadSources || [];

// v1: moduleData.leadSources might be {sources: [...]}
// v2: moduleData.leadSources is direct array [...]
// Migration converts v1→v2 on load, but components are defensive
```

**Example: LeadsAndSalesModule**

[src/components/Modules/LeadsAndSales/LeadsAndSalesModule.tsx](/src/components/Modules/LeadsAndSales/LeadsAndSalesModule.tsx):

```typescript
// Line 43-45: Direct array format (v2)
const [leadSources, setLeadSources] = useState<LeadSource[]>(
  moduleData.leadSources || []  // Handles undefined gracefully
);

// Line 50-57: Top-level properties (v2)
const [centralSystem, setCentralSystem] = useState(moduleData.centralSystem || '');
const [commonIssues, setCommonIssues] = useState<string[]>(moduleData.commonIssues || []);

// Array.isArray() check before rendering
{Array.isArray(leadSources) && leadSources.map(source => (
  <div key={source.channel}>{source.channel}</div>
))}
```

**Example: CustomerServiceModule**

[src/components/Modules/CustomerService/CustomerServiceModule.tsx](/src/components/Modules/CustomerService/CustomerServiceModule.tsx):

```typescript
// Line 51-53: Direct array format (v2)
const [channels, setChannels] = useState<ServiceChannel[]>(
  moduleData?.channels || []  // Optional chaining + default
);

// Line 58-59: Top-level properties (v2)
const [multiChannelIssue, setMultiChannelIssue] = useState(moduleData?.multiChannelIssue || '');
```

**Common Module Features**:
- Accordion/expandable sections for better UX
- Real-time auto-save via `updateModule`
- Progress indicators
- Validation feedback
- Pain point flagging
- Tooltip help text
- Custom field value support

### Export Functionality

Multiple export formats available:
- **Technical Spec**: [src/utils/exportTechnicalSpec.ts](/src/utils/exportTechnicalSpec.ts) - PDF export with jsPDF
- **Excel Export**: Uses `xlsx` library for spreadsheet generation
- **Plain Text/Markdown**: [src/utils/englishExport.ts](/src/utils/englishExport.ts) - English summaries
- **Clipboard**: Copy formatted text to clipboard
- **Screenshots**: html2canvas for visual exports

## AI Integration

Optional AI features for enhanced recommendations:

- **AI Service** ([src/services/AIService.ts](/src/services/AIService.ts)):
  - Singleton service supporting multiple providers
  - Providers: OpenAI, Anthropic, Cohere, HuggingFace, Local
  - Features: caching, request queuing, rate limiting
  - Fallback to local analysis if API unavailable

- **Environment Variables**:
  ```bash
  VITE_AI_PROVIDER=openai           # AI provider
  VITE_AI_API_KEY=your-key          # API key
  VITE_AI_MODEL=gpt-4               # Model name
  VITE_ENABLE_AI_FEATURES=true      # Enable/disable
  VITE_AI_MAX_TOKENS=4000           # Max tokens
  VITE_AI_TEMPERATURE=0.7           # Temperature
  ```

- **Capabilities**:
  - Analyze meeting data for insights
  - Generate recommendations
  - Identify pain points
  - Suggest optimizations
  - Works offline with local analysis fallback

## Visualization Components

Advanced visualization for integration flows:

- **Integration Visualizer** ([src/components/Visualizations/IntegrationVisualizer.tsx](/src/components/Visualizations/IntegrationVisualizer.tsx)):
  - Uses React Flow for visual flow design
  - Node types: Trigger, Action, Condition, Transform, API
  - Interactive drag-and-drop
  - Connection validation
  - Export to n8n format

- **ROI Visualization** ([src/components/Modules/ROI/ROIVisualization.tsx](/src/components/Modules/ROI/ROIVisualization.tsx)):
  - Chart.js for financial charts
  - Scenario comparison charts
  - Time-to-ROI visualization
  - Cost breakdown

## Accessibility & Localization

The application is primarily in Hebrew with bilingual support:

- **Primary Language**: Hebrew (RTL layout)
- **Phase 3 Language**: English (for developers)
- **Accessibility Hook** ([src/hooks/useAccessibility.ts](/src/hooks/useAccessibility.ts)):
  - Keyboard navigation
  - Screen reader support
  - Focus management
  - Skip to content

## Performance Optimizations

- **Code Splitting**: Vendor chunks for React, UI libraries, export tools
- **Lazy Loading**: Route-based code splitting
- **Optimized Dependencies**: Vite optimizeDeps configuration
- **Caching**: AI responses cached for 15 minutes
- **Debouncing**: Form inputs debounced to reduce updates
- **Memoization**: React.memo on expensive components

## Troubleshooting Data Issues

### Problem: Module crashes with ".map is not a function" error

**Cause**: Array field is actually an object (v1 format) or undefined

**Solution**:
1. Data migration should automatically fix this on app load
2. Check browser console for migration logs
3. Check localStorage `discovery_migration_log` for audit trail
4. If migration didn't run, try clearing cache and reloading

**Manual Check**:
```typescript
import { validateMigration } from './utils/dataMigration';

const meeting = useMeetingStore.getState().currentMeeting;
const result = validateMigration(meeting);
console.log(result); // { valid: boolean, issues: string[] }
```

**Prevention**: Always use `Array.isArray()` checks before `.map()` operations

### Problem: Old data not appearing after update

**Cause**: Data might be in v1 format and migration didn't preserve it

**Solution**:
1. Check migration logs in localStorage
2. Look for `leadSourcesMetadata` or `channelsMetadata` fields
3. Legacy data is preserved but needs manual review
4. Migration runs automatically on first load

**Check Migration Status**:
```typescript
import { getMigrationLogs, generateMigrationReport } from './utils/dataMigration';

const logs = getMigrationLogs();
console.log(logs);

const report = generateMigrationReport();
console.log(report);
```

### Problem: Wizard and module showing different data

**Cause**: Both should read from same source but state might be stale

**Solution**:
1. Both wizard and modules read from `meeting.modules[moduleName]`
2. Ensure component is using `useMeetingStore` hook
3. Check that `updateModule` is being called on changes
4. Verify no local state holding stale data

**Debug Pattern**:
```typescript
const { currentMeeting } = useMeetingStore();
console.log('Module data:', currentMeeting?.modules?.leadsAndSales);
console.log('DataVersion:', currentMeeting?.dataVersion); // Should be 2
```

### Problem: Data migration not running

**Cause**: onRehydrateStorage callback not being triggered

**Solution**:
1. Ensure Zustand persist middleware is configured
2. Check that `needsMigration()` returns true for old data
3. Verify `CURRENT_DATA_VERSION` is set correctly
4. Look for errors in browser console during app load

**Manual Migration** (as fallback):
```typescript
import { migrateMeetingData } from './utils/dataMigration';

const meeting = useMeetingStore.getState().currentMeeting;
const result = migrateMeetingData(meeting);

if (result.migrated) {
  console.log('Migrated successfully:', result.migrationsApplied);
  // Manually update store if needed
  useMeetingStore.setState({ currentMeeting: result.meeting });
}
```

### Problem: TypeError when accessing nested module properties

**Cause**: Module data structure undefined or malformed

**Solution**:
1. Always use optional chaining: `meeting?.modules?.leadsAndSales?.leadSources`
2. Provide default values: `moduleData?.leadSources || []`
3. Add initialization helpers for complex structures
4. Use TypeScript for compile-time safety

### Problem: Performance issues on app load

**Cause**: Migration running on many meetings

**Solution**:
1. Migration is < 5ms per meeting, minimal impact
2. Check if too many meetings in localStorage (> 100)
3. Consider implementing pagination or archiving old meetings
4. Migration logs limited to 50 entries to prevent bloat

## Important Gotchas

1. **Property Names**:
   - Use `meeting.phase` not `meeting.currentPhase`
   - Use `meeting.implementationSpec` not `meeting.phase2Data`
   - Use `meeting.developmentTracking` not `meeting.phase3Data`
   - Use `meeting.dataVersion` to track schema version (current: 2)

2. **Optional Chaining**:
   - Always use `?.` when accessing nested properties
   - Example: `meeting?.modules?.systems?.currentSystems`
   - Required for migration compatibility

3. **Array Checks**:
   - Always use `Array.isArray(data)` before `.map()`, `.filter()`, etc.
   - Never assume arrays are arrays (could be objects in v1 data)
   - Use defaults: `const items = data || []`

4. **Initialization Helpers**:
   - Create helper functions for complex data initialization
   - Example: `initializeLeadSources(data)` in LeadsAndSalesModule
   - Handles both v1 (nested object) and v2 (direct array) formats
   - Defensive against undefined/null/malformed data

5. **Data Migration**:
   - Migration runs automatically on app load - don't manually convert data
   - Check `meeting.dataVersion` to verify migration status
   - All new meetings start at `dataVersion: 2`
   - Migration logs stored in localStorage for debugging

6. **Zoho Integration**:
   - Backend API must be running for Zoho features
   - Check `meeting.zohoIntegration?.syncEnabled` before syncing
   - URL params parsed on mount via paramParser

7. **Supabase**:
   - Always check `isSupabaseConfigured()` before Supabase operations
   - App works in degraded mode without Supabase
   - Use optimistic updates for better UX

8. **Module Updates**:
   - Use `updateModule()` not direct state mutation
   - Module names are camelCase: `leadsAndSales`, `customerService`
   - Updates trigger auto-save and sync
   - Both wizard and modules update same data source

9. **Phase Transitions**:
   - Validate with `canTransitionTo()` before transitioning
   - Transitions are one-way (no backwards transitions)
   - All transitions logged in `phaseHistory`

10. **Custom Field Values**:
    - Stored per-module, per-field
    - Persist across sessions
    - Sync to Supabase if configured

11. **Wizard-Module Sync**:
    - Both modes share `meeting.modules[moduleName]` as single source
    - No separate wizard data structure
    - `wizardState` tracks progress, not data
    - Changes in either mode immediately visible in the other

## Development Workflow

1. **Starting Development**:
   ```bash
   npm run dev  # Starts on http://localhost:5176
   ```

2. **Making Changes**:
   - Edit component files in `src/components/`
   - Update types in `src/types/`
   - Modify business logic in `src/utils/`
   - Update store in `src/store/useMeetingStore.ts`

3. **Testing**:
   ```bash
   npm test        # Unit tests
   npm run test:ui # Interactive test UI
   npm run test:e2e # Full E2E tests
   ```

4. **Building**:
   ```bash
   npm run build:typecheck  # Build with type checking
   npm run preview          # Preview build
   ```

## Useful Commands for Discovery

```bash
# Find all module components
find src/components/Modules -name "*.tsx"

# Find all types
find src/types -name "*.ts"

# Find all services
find src/services -name "*.ts"

# Search for specific patterns
grep -r "updateModule" src/
grep -r "transitionPhase" src/
```
