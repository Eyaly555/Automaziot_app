# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Discovery Assistant is a Hebrew-language web application for conducting business discovery meetings. It helps sales teams systematically gather information about potential clients through 9 specialized modules, calculate ROI, and generate PDF reports.

## Essential Commands

```bash
# Development
npm run dev          # Start dev server (uses ports 5173-5177+)
npm run build        # TypeScript check + Vite build
npm run lint         # Run ESLint
npm run preview      # Preview production build

# Clear Vite cache if experiencing issues
rm -rf node_modules/.vite && npm run dev

# Testing modules (custom test scripts)
node test-app.js           # Test app startup
node test-simple-modules.js # Test all module navigation
node test-roi.js           # Test ROI module specifically
```

## Architecture

### State Management Pattern
The app uses Zustand with localStorage persistence. All meeting data flows through `useMeetingStore`:
- Meeting creation/loading/deletion
- Module data updates with 1-second auto-save debounce
- Pain point tracking across modules
- Export to PDF/JSON functionality

### Routing Structure
React Router handles navigation between the dashboard and 9 business analysis modules:
- `/` - Dashboard (meeting selector/creator)
- `/module/overview` - Business overview
- `/module/leadsAndSales` - Lead management processes
- `/module/customerService` - Service channels and automation
- `/module/operations` - Operational workflows
- `/module/reporting` - KPIs and dashboards
- `/module/aiAgents` - AI readiness assessment
- `/module/systems` - System integration analysis
- `/module/roi` - ROI calculations (depends on data from other modules)
- `/module/planning` - Implementation roadmap

### Key Architectural Patterns

1. **Module Data Flow**: Each module component reads/writes to its section in the store's `currentMeeting.modules` object. Updates trigger auto-save to localStorage.

2. **ROI Calculations**: The `roiCalculator.ts` utility aggregates data from all modules to compute savings. Must handle undefined module data gracefully.

3. **Type Safety**: All module interfaces are defined in `src/types/index.ts`. The `Meeting` interface is the root type containing all module data.

4. **Hebrew RTL Support**: All components use `dir="rtl"` and Hebrew labels. The app is designed for Israeli businesses.

## Critical Configuration

### TypeScript
- `verbatimModuleSyntax: false` in tsconfig.app.json (required for proper imports)
- Strict mode enabled with unused variable checking

### Tailwind CSS
- Version 3.x (not 4.x) - v4 causes PostCSS errors
- Standard utilities only, no custom @tailwind/postcss plugin

### Dependencies
- React 19 with React Router 7
- Zustand 5 for state management
- jsPDF + html2canvas for PDF export
- Lucide React for icons

## Known Issues & Solutions

1. **Blank Screen**: Usually caused by import errors. Check browser console for "does not provide an export named" errors.

2. **ROI Module Crash**: Occurs when accessing `/module/roi` directly without meeting data. The `roiCalculator` now handles undefined data.

3. **Port Conflicts**: Dev server auto-increments from 5173. Multiple instances may be running - kill with `KillShell` command.

4. **Vite Cache Issues**: Clear with `rm -rf node_modules/.vite` when HMR stops working.

## Module Dependencies

When modifying modules, be aware of cross-module dependencies:
- ROI module reads data from LeadsAndSales, CustomerService, and Operations
- Dashboard aggregates progress from all modules
- Pain points can be flagged from any module and are displayed globally