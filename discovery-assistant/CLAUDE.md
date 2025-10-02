# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Discovery Assistant is a Hebrew-language business analysis web application designed for conducting discovery meetings with potential clients. It systematically guides users through 9 specialized modules to gather comprehensive business information, calculate ROI metrics, and generate professional PDF reports.

## Essential Commands

```bash
# Navigate to project directory first
cd discovery-assistant

# Development
npm run dev              # Start Vite dev server (port 5173+)
npm run build            # Production build with TypeScript check
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Testing
npm test                 # Run Vitest in watch mode
npm run test:ui          # Vitest with UI interface
npm run test:e2e         # Run Playwright E2E tests
npm run test:all         # Run all tests (Vitest + Playwright)

# Troubleshooting
rm -rf node_modules/.vite  # Clear Vite cache if HMR issues
```

## Architecture

### State Management
The application uses Zustand with localStorage persistence via `useMeetingStore` (src/store/useMeetingStore.ts):
- **Meeting lifecycle**: Create, load, update, delete meetings
- **Auto-save**: 1-second debounced saves to localStorage on module data changes
- **Module data**: Each module's data stored in `currentMeeting.modules[moduleName]`
- **Pain points**: Cross-module pain point tracking and aggregation
- **Progress tracking**: Real-time calculation of module and overall completion percentages

### Data Flow Pattern
1. User interactions in module components trigger store updates via `updateModule()`
2. Store middleware debounces and persists changes to localStorage
3. ROI calculations pull data from multiple modules to compute metrics
4. Export functions aggregate all module data for PDF/JSON generation

### Routing & Navigation
React Router v7 manages navigation between dashboard and 9 business modules:
- `/` - Dashboard for meeting management
- `/module/[name]` - Individual module routes
- Module order: overview → leadsAndSales → customerService → operations → reporting → aiAgents → systems → roi → planning

### Module Dependencies
- **ROI Module** (src/components/Modules/ROI/ROIModule.tsx): Depends on data from leadsAndSales, customerService, and operations modules. Uses `roiCalculator.ts` to compute savings.
- **Planning Module**: Synthesizes findings from all previous modules to generate implementation roadmap
- **Dashboard**: Aggregates progress data from all modules for overview display

### Key Services & Utilities
- `roiCalculator.ts`: Aggregates module data to calculate hourly/monetary savings, handles undefined data gracefully
- `syncService.ts`: Optional Supabase integration for cloud sync (disabled by default)
- `customValuesService.ts`: Manages custom field definitions and values across modules

## Hebrew RTL Support

All UI components are configured for Hebrew right-to-left display:
- Root components use `dir="rtl"` attribute
- All labels and text content in Hebrew
- Tailwind utilities handle RTL layout adjustments
- Number inputs remain LTR for proper numeric display

## Module Data Structure

Each module stores its data in the meeting store following consistent patterns:
```typescript
meeting.modules[moduleName] = {
  // Module-specific fields
  painPoints: PainPoint[],     // Issues identified in this module
  customFields?: CustomField[], // Optional dynamic fields
  // Module-specific data structures
}
```

## Testing Strategy

- **Unit Tests** (`__tests__/`): Test store actions, ROI calculations, module data flow
- **E2E Tests** (`e2e/`): Full user flows from meeting creation through report generation
- **Manual Test Scripts**: Various test-*.mjs files for specific scenario testing

## Critical Dependencies

- **React 19** + **React Router 7**: Latest versions, ensure compatibility
- **Zustand 5**: State management with middleware support
- **Vite 7**: Build tool with HMR
- **Tailwind CSS 3**: Styling (v4 causes PostCSS errors)
- **jsPDF + html2canvas**: PDF generation from DOM elements

## Multi-Phase Architecture

The application now supports a 3-phase project lifecycle:

### Phase 1: Discovery (Default)
- 9 business analysis modules in Hebrew UI
- ROI calculations and pain point tracking
- Dashboard and wizard mode for data collection

### Phase 2: Implementation Specification (`/phase2/*`)
- Detailed system specs with authentication, modules, fields
- Integration flow builder for system-to-system data flows
- AI agent specifications with prompts, tools, guardrails
- Acceptance criteria definitions
- Data in `meeting.implementationSpec` (types in [phase2.ts](src/types/phase2.ts))

### Phase 3: Development Tracking (`/phase3/*`)
- Developer dashboard with task management
- Sprint planning and progress tracking
- System-focused views linking tasks to specs
- Blocker management
- English UI for technical team
- Data in `meeting.developmentTracking` (types in [phase3.ts](src/types/phase3.ts))

### Phase Transitions
- Managed via `transitionPhase()` in useMeetingStore
- Phase history tracked in `meeting.phaseHistory`
- Status field tracks sub-states: discovery_in_progress → discovery_complete → client_approved → spec_in_progress → dev_in_progress → deployed

## Zoho CRM Integration

Optional integration available when `VITE_ENABLE_ZOHO_SYNC=true`:
- Automatically syncs meetings to Zoho CRM Potentials module
- URL parameters `Entity` and `EntityId` trigger Zoho context detection
- Backend API handles OAuth refresh tokens (server-side only)
- Client uses [zohoSyncService.ts](src/services/zohoSyncService.ts) to call backend API
- Retry queue for failed syncs: [zohoRetryQueue.ts](src/services/zohoRetryQueue.ts)

**Important**: Zoho credentials must be server-side only; never expose in client bundle.

## Export Functionality

Multiple export formats supported:
- **PDF**: Full Hebrew report with charts using jsPDF + html2canvas
- **Excel**: XLSX export with multiple sheets using xlsx library
- **JSON**: Complete meeting data for backup/import
- **English PDF**: Technical specification export (Phase 2) via [englishExport.ts](src/utils/englishExport.ts)
- **Task Generation**: Automated task list generation from Phase 2 specs via [taskGenerator.ts](src/utils/taskGenerator.ts)

## Environment Variables

Critical variables (see [.env.example](.env.example)):
- `VITE_ENABLE_ZOHO_SYNC`: Enable/disable Zoho integration
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: Optional cloud sync
- `VITE_AI_PROVIDER`, `VITE_AI_API_KEY`: AI-powered recommendations (optional)
- `VITE_FEATURE_WIZARD_MODE`: Enable guided wizard flow
- `ZOHO_REFRESH_TOKEN`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`: Backend only

## Data Persistence Strategy

1. **Primary**: localStorage with auto-save (1s debounce)
2. **Optional**: Supabase for cloud sync when configured
3. **Optional**: Zoho CRM for customer-facing integration
4. **Conflict Resolution**: Manual resolution UI when sync conflicts occur
5. **Storage Keys**: Different keys for Zoho mode vs. standalone mode

## Common Issues & Solutions

1. **Module data not persisting**: Check localStorage debounce timing and store middleware
2. **ROI calculations showing NaN**: Ensure all dependent modules have valid numeric data in [roiCalculator.ts](src/utils/roiCalculator.ts)
3. **PDF export cutting off content**: Adjust html2canvas scale and jsPDF page dimensions
4. **Blank screen on load**: Check for import errors in browser console, verify all module exports
5. **localStorage QuotaExceededError**: Meeting data exceeds 5-10MB limit; implement data compression or pagination
6. **Zoho sync failing**: Verify backend API is running and refresh token is valid