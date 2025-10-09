# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Discovery Assistant** is a bilingual (Hebrew/English) React + TypeScript application for automating customer discovery and implementation tracking. The application guides users through three phases: Discovery (Phase 1), Implementation Specification (Phase 2), and Development Tracking (Phase 3).

**Tech Stack:**
- React 19.1.1 + TypeScript 5.8.3
- Vite 7.1.7 (build tool)
- Zustand (state management with localStorage persistence)
- React Router v7 (routing)
- Tailwind CSS + shadcn/ui patterns (styling)
- Supabase (authentication and data sync)
- Zoho CRM integration (external data sync)
- Vitest (unit tests) + Playwright (E2E tests)

**Production URL:** https://automaziot-app.vercel.app/

## Common Commands

```bash
# Development
npm run dev                 # Start dev server on http://localhost:5176

# Building
npm run build              # Production build
npm run build:typecheck    # Build with TypeScript type checking
npm run preview            # Preview production build locally

# Testing
npm run test               # Run Vitest unit tests (watch mode)
npm run test:ui            # Run Vitest with UI dashboard
npm run test:e2e           # Run Playwright E2E tests
npm run test:all           # Run all tests (Vitest + Playwright)

# Linting
npm run lint               # Run ESLint
```

## Application Architecture

### Three-Phase Workflow

The application manages a linear progression through three phases:

1. **Discovery Phase** (`discovery`): Data collection through wizard or module-based views
2. **Implementation Spec Phase** (`implementation_spec`): Requirements gathering and technical specification
3. **Development Phase** (`development`): Sprint planning, task tracking, and progress monitoring

Phase transitions are controlled by `useMeetingStore` with validation guards. Each phase has associated status values (e.g., `discovery_in_progress`, `discovery_complete`, `client_approved`, `dev_in_progress`).

### State Management (Zustand Store)

**Central store:** `src/store/useMeetingStore.ts` (~2000 lines)

All application state lives in this single Zustand store with localStorage persistence:
- Current meeting and meeting list
- Phase tracking and transitions
- Module data (9 discovery modules)
- Wizard state
- Zoho integration status
- Supabase sync state

**Critical pattern:** Always use `updateModule(moduleName, data)` to update module data - this triggers persistence and sync.

### Data Migration System

**Location:** `src/utils/dataMigration.ts`

Automatic migration system handles schema evolution:
- Current version: `CURRENT_DATA_VERSION = 2`
- Runs automatically on localStorage load in `useMeetingStore`
- Migration v1→v2: Changed nested objects to direct arrays in `LeadsAndSalesModule` and `CustomerServiceModule`

When modifying data structures:
1. Update type definitions in `src/types/`
2. Increment `CURRENT_DATA_VERSION`
3. Add migration function in `dataMigration.ts`
4. Test with old localStorage data

### Dual Data Input System

**Wizard Mode** (`src/components/Wizard/`):
- Step-by-step guided flow
- Configuration: `src/config/wizardSteps.ts` (2000+ lines)
- Hebrew interface
- Progress tracking with skip functionality

**Module-Based View** (`src/components/Modules/`):
- Direct module editing
- 9 modules: Overview, Leads & Sales, Customer Service, Operations, Reporting, AI Agents, Systems, ROI, Proposal
- Bilingual support (primarily Hebrew)

Both systems read/write to the same `meeting.modules` object. Keep them synchronized.

### Type System Structure

**Main types file:** `src/types/index.ts`

Organized into logical files:
- `index.ts` - Core Meeting, Module types, and re-exports
- `design-system.ts` - UI component types
- `forms.ts` - Form field types
- `navigation.ts` - Routing and navigation types
- `feedback.ts` - Toast, loading, error types
- `progress.ts` - Progress tracking types
- `phase2.ts` - Implementation spec types
- `phase3.ts` - Development tracking types
- `database.ts` - Supabase schema types
- `proposal.ts`, `serviceRequirements.ts` - Domain-specific types

**Key types:**
- `Meeting` - Root data structure
- `MeetingPhase` - Phase enum ('discovery' | 'implementation_spec' | 'development' | 'completed')
- `MeetingStatus` - Status enum (10+ values tracking detailed state)
- `Modules` - Container for all 9 discovery modules

### External Integrations

**Zoho CRM Integration:**
- Service: `src/services/zohoAPI.ts`, `src/services/zohoSyncService.ts`
- Auto-sync service: `src/services/autoSyncService.ts`
- Retry queue: `src/services/zohoRetryQueue.ts`
- Uses server-side self-client authentication (refresh token stored server-side)
- Syncs to `Potentials1` module in Zoho
- Environment variables: `ZOHO_REFRESH_TOKEN`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`

**Supabase Integration:**
- Service: `src/services/supabaseService.ts`
- Client setup: `src/lib/supabase.ts`
- Authentication context: `src/contexts/AuthContext.tsx`
- Tables: `meetings`, `profiles`, `sync_queue`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Component Organization

```
src/components/
├── AppContent.tsx           # Main routing component
├── Auth/                    # Login, signup flows
├── Base/                    # Low-level UI primitives
├── Clients/                 # Client list view (Zoho-backed)
├── Common/                  # Shared components (forms, buttons, etc.)
├── Dashboard/               # Main dashboard view
├── Feedback/                # Toast notifications, loading states
├── Layout/                  # AppLayout wrapper
├── Modules/                 # 9 discovery modules (Overview, LeadsAndSales, etc.)
│   └── [ModuleName]/
│       ├── [ModuleName]Module.tsx
│       └── components/      # Module-specific components
├── Phase2/                  # Implementation spec components
│   ├── ImplementationSpecDashboard.tsx
│   ├── SystemDeepDive.tsx
│   ├── IntegrationFlowBuilder.tsx
│   ├── AIAgentDetailedSpec.tsx
│   └── AcceptanceCriteriaBuilder.tsx
├── Phase3/                  # Development tracking components
│   ├── DeveloperDashboard.tsx
│   ├── SprintView.tsx
│   ├── SystemView.tsx
│   ├── ProgressTracking.tsx
│   └── BlockerManagement.tsx
├── PhaseWorkflow/           # Phase navigation and transitions
│   ├── PhaseNavigator.tsx
│   ├── RequirementsFlow.tsx
│   └── ClientApprovalView.tsx
└── Wizard/                  # Wizard mode components
    ├── WizardMode.tsx
    ├── WizardNavigation.tsx
    └── WizardProgress.tsx
```

### Utilities and Services

**Export Utilities** (`src/utils/`):
- `exportExcel.ts` - Excel export with XLSX library
- `exportCSV.ts` - CSV export
- `exportJSON.ts` - JSON export
- `exportTechnicalSpec.ts` - Markdown technical specification

**Smart Engines** (`src/utils/`):
- `smartRecommendationsEngine.ts` - AI-powered recommendations
- `proposalEngine.ts` - Proposal generation
- `requirementsPrefillEngine.ts` - Requirement auto-fill
- `roiCalculator.ts` - ROI calculations
- `taskGenerator.ts` - Phase 3 task generation

**Validation** (`src/utils/`):
- `validation.ts` - Form validation helpers
- `validationGuards.ts` - Phase transition guards and business rule validation

## Bilingual Support

**Primary language:** Hebrew (right-to-left)
**Secondary language:** English (Phase 3 components only)

- Discovery Phase (1): Hebrew UI
- Implementation Spec Phase (2): Hebrew UI
- Development Phase (3): English UI (for developers)
- Type `BilingualText` for components supporting both: `{ he: string; en: string; }`

**RTL handling:** Tailwind CSS with `dir="rtl"` on root element (conditional by phase)

## Key Configuration Files

- `src/config/wizardSteps.ts` - Wizard step definitions (2000+ lines)
- `src/config/servicesDatabase.ts` - Service templates for requirements
- `src/config/systemsDatabase.ts` - System integration templates
- `vite.config.ts` - Build configuration with Vercel environment handling
- `tailwind.config.js` - Tailwind CSS configuration

## Testing Strategy

**Unit Tests (Vitest):**
- Location: `src/utils/__tests__/`
- Run: `npm run test`
- Environment: jsdom
- Setup file: `test-setup.ts`

**E2E Tests (Playwright):**
- Location: `e2e/`
- Run: `npm run test:e2e`
- Config: `playwright.config.ts`
- Base URL: http://localhost:5176

## Environment Variables

Required for full functionality (see `.env.example`):

```bash
# Zoho CRM (server-side only)
ZOHO_REFRESH_TOKEN=
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_API_DOMAIN=https://www.zohoapis.com

# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional AI features
VITE_AI_PROVIDER=
VITE_AI_API_KEY=
VITE_ENABLE_AI_FEATURES=false
```

**Important:** Zoho credentials are server-side only. Client uses `VITE_ENABLE_ZOHO_SYNC` flag.

## Deployment

**Platform:** Vercel
**Build Command:** `npm run build`
**Output Directory:** `dist/`
**Rewrites:** All routes → `/index.html` (SPA mode, see `vercel.json`)

Environment variables are set in Vercel dashboard, not committed to git.

## Development Patterns

### Adding a New Discovery Module Field

1. Update TypeScript interface in `src/types/index.ts`
2. Add field to `src/config/wizardSteps.ts` with appropriate FormField component
3. Update module component in `src/components/Modules/[ModuleName]/`
4. Test wizard ↔ module synchronization
5. If changing data structure, add migration in `dataMigration.ts`

### Phase Transition Logic

Phase transitions require validation:

```typescript
// Check if transition is allowed
const canTransition = useMeetingStore(state => state.canTransitionTo('implementation_spec'));

// Perform transition
const success = useMeetingStore(state => state.transitionPhase('implementation_spec', 'Client approved'));
```

Validation logic in `useMeetingStore.ts` → `canTransitionTo()` method.

### Custom Field Values

Users can add custom options to select fields (e.g., custom lead sources). Managed by:
- Storage: `meeting.customFieldValues`
- Actions: `addCustomValue()`, `removeCustomValue()`, `getCustomValues()`
- Service: `src/services/customValuesService.ts`

### Defensive Programming for Data Migration

Always use defensive patterns when accessing potentially migrated data:

```typescript
// BAD
const sources = meeting.modules.leadsAndSales.leadSources;
sources.map(s => ...)

// GOOD
const sources = Array.isArray(meeting.modules.leadsAndSales.leadSources)
  ? meeting.modules.leadsAndSales.leadSources
  : [];
sources.map(s => ...)
```

## Common Issues

### Module Data Not Persisting

Ensure you're using `updateModule()` from the store, not direct state mutation:

```typescript
// BAD
currentMeeting.modules.overview.businessType = 'b2b';

// GOOD
updateModule('overview', { businessType: 'b2b' });
```

### Wizard-Module Sync Issues

Run `syncWizardToModules()` or `syncModulesToWizard()` explicitly if data appears out of sync. Both are called automatically on wizard navigation and module saves.

### TypeScript Errors After Schema Changes

1. Update type definitions in `src/types/`
2. Run `npm run build:typecheck` to catch all type errors
3. Update all affected components
4. Add data migration if needed

## Phase 2: Service Requirements Collection System

**Overview:**
Phase 2 includes a comprehensive system for collecting detailed technical requirements for all 59 services purchased by the client in Phase 1. This system ensures complete specification before development begins.

### Type System (59 Services)

**TypeScript Interfaces (5 Files - ~12,500 lines total):**
- `src/types/automationServices.ts` - Services 1-20 (5,035 lines)
- `src/types/aiAgentServices.ts` - Services 21-30 (1,992 lines)
- `src/types/integrationServices.ts` - Services 31-40 (1,882 lines)
- `src/types/systemImplementationServices.ts` - Services 41-49 (1,971 lines)
- `src/types/additionalServices.ts` - Services 50-59 (1,635 lines)

Each service has a dedicated `[ServiceName]Requirements` interface defining all technical fields needed for implementation.

**Example Type Structure:**
```typescript
// From automationServices.ts
export interface AutoLeadResponseRequirements {
  formPlatform: 'wix' | 'wordpress' | 'elementor' | 'google_forms' | 'typeform' | 'custom';
  formFields: string[];
  emailService: 'sendgrid' | 'mailgun' | 'smtp' | 'gmail' | 'outlook';
  crmSystem: 'zoho' | 'salesforce' | 'hubspot' | 'monday' | 'pipedrive';
  responseTime: 'immediate' | '5min' | '15min' | 'business_hours';
  // ... 20+ more fields
}
```

### React Components (55 Components)

**Component Structure:**
```
src/components/Phase2/ServiceRequirements/
├── Automations/ (18 components - Services 1-20)
│   ├── AutoLeadResponseSpec.tsx
│   ├── AutoSmsWhatsappSpec.tsx
│   ├── AutoCRMUpdateSpec.tsx
│   └── ... (15 more)
├── AIAgents/ (8 components - Services 21-30)
│   ├── AIFAQBotSpec.tsx
│   ├── AILeadQualifierSpec.tsx
│   └── ... (6 more)
├── Integrations/ (10 components - Services 31-40)
│   ├── IntegrationSimpleSpec.tsx
│   ├── WhatsappApiSetupSpec.tsx
│   └── ... (8 more)
├── SystemImplementations/ (9 components - Services 41-49)
│   ├── ImplCrmSpec.tsx
│   ├── ImplProjectManagementSpec.tsx
│   └── ... (7 more)
└── AdditionalServices/ (10 components - Services 50-59)
    ├── DataCleanupSpec.tsx
    ├── TrainingWorkshopsSpec.tsx
    └── ... (8 more)
```

**Component Pattern:**
Each component follows this structure:
- Loads existing data from `currentMeeting.implementationSpec.[category]`
- Provides form fields with validation
- Saves to appropriate category array with `serviceId` and `completedAt` timestamp
- Hebrew UI (RTL) with Tailwind CSS styling
- Defensive data access patterns

### Service Router

**ServiceRequirementsRouter** (`src/components/Phase2/ServiceRequirementsRouter.tsx`):
- **Purpose**: Central routing component for all 59 service requirement forms
- **Data Source**: Reads `purchasedServices` from Phase 1 client approval (`meeting.modules.proposal.purchasedServices`)
- **Features**:
  - Sidebar navigation with all purchased services
  - Completion status indicators (checkmarks)
  - Progress tracking (X of Y completed)
  - Category breakdown display
  - Dynamic component rendering based on selected service
- **Important**: Uses `purchasedServices` (NOT `selectedServices`) to show only client-approved services

**Service Mapping Configuration** (`src/config/serviceComponentMapping.ts`):

Two critical mappings:
1. **SERVICE_COMPONENT_MAP**: Maps service IDs to React components
2. **SERVICE_CATEGORY_MAP**: Maps service IDs to storage categories

```typescript
// Example mappings
SERVICE_COMPONENT_MAP = {
  'auto-lead-response': AutoLeadResponseSpec,
  'ai-faq-bot': AIFAQBotSpec,
  'integration-simple': IntegrationSimpleSpec,
  // ... all 59 services
};

SERVICE_CATEGORY_MAP = {
  'auto-lead-response': 'automations',
  'ai-faq-bot': 'aiAgentServices',
  'integration-simple': 'integrationServices',
  // ... all 59 services
};
```

**Helper Functions:**
- `getServiceCategory(serviceId)` - Returns category for a service
- `getServiceComponent(serviceId)` - Returns React component for a service
- `hasServiceComponent(serviceId)` - Checks if service has a component

### Data Storage Structure

Phase 2 service requirements are stored in `meeting.implementationSpec` with separate arrays per category:

```typescript
meeting.implementationSpec = {
  automations: AutomationServiceEntry[],
  aiAgentServices: AIAgentServiceEntry[],
  integrationServices: IntegrationServiceEntry[],
  systemImplementations: SystemImplementationServiceEntry[],
  additionalServices: AdditionalServiceEntry[]
}
```

**Entry Structure:**
```typescript
interface AutomationServiceEntry {
  serviceId: string;           // e.g., 'auto-lead-response'
  serviceName: string;          // Hebrew name
  requirements: AutoLeadResponseRequirements;
  completedAt: string;          // ISO timestamp
}
```

### Validation System

**Purpose**: Prevents Phase 2 → Phase 3 transition until all purchased services have completed requirement forms.

**Files:**
- `src/utils/serviceRequirementsValidation.ts` - Core validation logic
- `src/components/Phase2/IncompleteServicesAlert.tsx` - UI alert component

**Key Functions:**

```typescript
/**
 * Validates that all purchased services have completed forms
 */
validateServiceRequirements(
  purchasedServices: SelectedService[],
  implementationSpec: ImplementationSpec
): ServiceValidationResult

/**
 * Checks if Phase 2 is complete and ready for Phase 3
 */
isPhase2Complete(meeting: Meeting): boolean

/**
 * Gets detailed completion status breakdown
 */
getServiceCompletionStatus(meeting: Meeting): ServiceValidationResult
```

**Integration with useMeetingStore:**
```typescript
// In canTransitionTo() method
if (targetPhase === 'development') {
  const purchasedServices = currentMeeting?.modules?.proposal?.purchasedServices || [];

  if (purchasedServices.length > 0) {
    const validation = validateServiceRequirements(
      purchasedServices,
      currentMeeting.implementationSpec || {}
    );

    if (!validation.isValid) {
      console.warn('Cannot transition: incomplete service requirements');
      return false;
    }
  }
}
```

### UI Components

**IncompleteServicesAlert** (`src/components/Phase2/IncompleteServicesAlert.tsx`):
- Displays warning when services are incomplete
- Lists missing services by Hebrew name
- Shows completion progress (X of Y completed)
- Automatically hides when all services complete

**CompletionProgressBar**:
- Visual progress bar for service completion
- Shows percentage and count
- Changes color based on completion status (orange → green)

### Data Flow

**Phase 1 → Phase 2 Handoff:**
1. Client approves services in Phase 1 proposal
2. Services stored in `meeting.modules.proposal.purchasedServices[]`
3. Phase transitions to `implementation_spec`
4. User navigates to Service Requirements Router

**Phase 2 Data Collection:**
1. ServiceRequirementsRouter displays all purchased services
2. User selects a service from sidebar
3. Appropriate Spec component loads (e.g., `AutoLeadResponseSpec`)
4. User fills form fields
5. On save, data stored in `meeting.implementationSpec.[category][]` with:
   - `serviceId`: matches service ID from purchasedServices
   - `serviceName`: Hebrew display name
   - `requirements`: full technical specification object
   - `completedAt`: ISO timestamp

**Phase 2 → Phase 3 Validation:**
1. User attempts to transition to development phase
2. `useMeetingStore.canTransitionTo('development')` called
3. Validation checks all purchased services have matching entries in implementationSpec
4. If incomplete: transition blocked, alert shown with missing services
5. If complete: transition allowed

### Key Features

- **Type-Safe**: Full TypeScript coverage for all 59 services with detailed interfaces
- **Defensive**: Handles missing data gracefully with null checks and default values
- **Progressive**: Real-time completion tracking with visual feedback
- **Bilingual**: Hebrew UI (RTL) with technical field names in English where appropriate
- **Validated**: Hard gate preventing incomplete Phase 2 → Phase 3 transitions
- **Persistent**: Automatic localStorage persistence via Zustand store
- **Scalable**: Easy to add new services by creating interface, component, and mapping

### Adding a New Service Component

**Step-by-Step Process:**

1. **Create TypeScript Interface** in appropriate type file:
```typescript
// src/types/automationServices.ts
export interface MyNewServiceRequirements {
  fieldOne: string;
  fieldTwo: 'option1' | 'option2';
  // ... all required fields
}
```

2. **Create React Component**:
```typescript
// src/components/Phase2/ServiceRequirements/Automations/MyNewServiceSpec.tsx
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { MyNewServiceRequirements } from '../../../../types/automationServices';

export const MyNewServiceSpec: React.FC = () => {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<MyNewServiceRequirements>({ /* defaults */ });

  // Load existing data
  useEffect(() => {
    const existing = currentMeeting?.implementationSpec?.automations?.find(
      a => a.serviceId === 'my-new-service'
    );
    if (existing) setConfig(existing.requirements);
  }, [currentMeeting]);

  // Save handler
  const handleSave = () => {
    if (!currentMeeting) return;

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(a => a.serviceId !== 'my-new-service');
    updated.push({
      serviceId: 'my-new-service',
      serviceName: 'שם השירות בעברית',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated
      }
    });
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      {/* Form fields */}
      <button onClick={handleSave}>שמור</button>
    </div>
  );
};
```

3. **Add to Mapping Configuration**:
```typescript
// src/config/serviceComponentMapping.ts
import { MyNewServiceSpec } from '../components/Phase2/ServiceRequirements/Automations/MyNewServiceSpec';

export const SERVICE_COMPONENT_MAP = {
  'my-new-service': MyNewServiceSpec,
  // ... existing mappings
};

export const SERVICE_CATEGORY_MAP = {
  'my-new-service': 'automations',
  // ... existing mappings
};
```

4. **Test**: Component automatically appears in ServiceRequirementsRouter when service is purchased

### Common Patterns

**Defensive Data Loading:**
```typescript
// Always check for existing data before initializing
useEffect(() => {
  const category = currentMeeting?.implementationSpec?.automations;
  const existing = category?.find(item => item.serviceId === 'service-id');
  if (existing?.requirements) {
    setConfig(existing.requirements);
  }
}, [currentMeeting]);
```

**Defensive Data Saving:**
```typescript
// Filter out existing entry, then add updated entry
const updated = (existing || []).filter(item => item.serviceId !== 'service-id');
updated.push({ serviceId, serviceName, requirements: config, completedAt: new Date().toISOString() });
```

**Array Safety:**
```typescript
// Always default to empty array if category doesn't exist
const automations = currentMeeting?.implementationSpec?.automations || [];
```

### Troubleshooting

**Service form doesn't appear in router:**
- Check `serviceComponentMapping.ts` - ensure service ID exists in both `SERVICE_COMPONENT_MAP` and `SERVICE_CATEGORY_MAP`
- Verify service ID matches exactly (case-sensitive)
- Check component is properly exported

**Data not saving:**
- Ensure `serviceId` in save handler matches service ID from `purchasedServices`
- Verify category name matches one of: `automations`, `aiAgentServices`, `integrationServices`, `systemImplementations`, `additionalServices`
- Check `updateMeeting()` is being called with correct structure

**Validation not working:**
- Ensure `serviceId` field is being saved (required for validation)
- Verify `purchasedServices` array contains services with matching IDs
- Check console for validation warnings

**Component not rendering:**
- Verify component is imported in `serviceComponentMapping.ts`
- Check for TypeScript compilation errors
- Ensure component exports a valid React.FC

## Related Documentation

- Original documentation was cleaned up (many .md files deleted in recent commits)
- For Zoho integration details, see `src/integrations/zoho/`
- For phase workflow, see `src/components/PhaseWorkflow/`
- For testing examples, see `e2e/full-flow.test.ts`
- For Phase 2 Service Requirements developer guide, see `PHASE2_SERVICE_REQUIREMENTS_GUIDE.md`
