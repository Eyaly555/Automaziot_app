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

## Common Issues & Solutions

1. **Module data not persisting**: Check localStorage debounce timing and store middleware
2. **ROI calculations showing NaN**: Ensure all dependent modules have valid numeric data
3. **PDF export cutting off content**: Adjust html2canvas scale and jsPDF page dimensions
4. **Blank screen on load**: Check for import errors in browser console, verify all module exports