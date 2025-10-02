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

  // Phase tracking
  phase: MeetingPhase; // 'discovery' | 'implementation_spec' | 'development' | 'completed'
  status: MeetingStatus; // Detailed status like 'discovery_in_progress', 'client_approved', etc.
  phaseHistory: PhaseTransition[];

  // Phase 1 - Discovery data
  modules: {
    overview: OverviewModule;
    leadsAndSales: LeadsAndSalesModule;
    customerService: CustomerServiceModule;
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
  wizardState?: WizardState;

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

**IMPORTANT**: The property names are `implementationSpec` and `developmentTracking`, NOT `phase2Data` or `phase3Data`.

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

Module components follow a pattern:
- Located in [src/components/Modules/{ModuleName}/](/src/components/Modules/)
- Accept optional module data prop
- Use `updateModule` to save changes
- Include pain point flagging capability

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

## Important Gotchas

1. **Property Names**:
   - Use `meeting.phase` not `meeting.currentPhase`
   - Use `meeting.implementationSpec` not `meeting.phase2Data`
   - Use `meeting.developmentTracking` not `meeting.phase3Data`

2. **Optional Chaining**:
   - Always use `?.` when accessing nested properties
   - Example: `meeting?.modules?.systems?.currentSystems`

3. **Zoho Integration**:
   - Backend API must be running for Zoho features
   - Check `meeting.zohoIntegration?.syncEnabled` before syncing
   - URL params parsed on mount via paramParser

4. **Supabase**:
   - Always check `isSupabaseConfigured()` before Supabase operations
   - App works in degraded mode without Supabase
   - Use optimistic updates for better UX

5. **Module Updates**:
   - Use `updateModule()` not direct state mutation
   - Module names are camelCase: `leadsAndSales`, `customerService`
   - Updates trigger auto-save and sync

6. **Phase Transitions**:
   - Validate with `canTransitionTo()` before transitioning
   - Transitions are one-way (no backwards transitions)
   - All transitions logged in `phaseHistory`

7. **Custom Field Values**:
   - Stored per-module, per-field
   - Persist across sessions
   - Sync to Supabase if configured

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
