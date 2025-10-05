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

## Related Documentation

- Original documentation was cleaned up (many .md files deleted in recent commits)
- For Zoho integration details, see `src/integrations/zoho/`
- For phase workflow, see `src/components/PhaseWorkflow/`
- For testing examples, see `e2e/full-flow.test.ts`
