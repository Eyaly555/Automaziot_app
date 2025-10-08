# TypeScript Fix Priority Matrix

**Generated:** 2025-10-08
**Purpose:** Quick reference for fixing TypeScript errors in priority order

---

## 🎯 Quick Stats

| Metric | Value |
|--------|-------|
| **Total Errors** | 1,188 |
| **Phase 2 Implementation Errors** | 309 (26%) |
| **Pre-Existing Errors** | 879 (74%) |
| **Files Affected** | 90 |
| **Estimated Fix Time** | 26-38 hours |

---

## 🔴 CRITICAL - Fix First (Week 1)

### 1. Type Definitions - phase2.ts
**File:** `src/types/phase2.ts`
**Errors Fixed:** ~180 (15% of total)
**Time:** 4-6 hours

**Add Missing Properties:**

```typescript
// DetailedConversationFlow
export interface DetailedConversationFlow {
  id: string;
  name: string;
  description: string;
  // ADD THESE:
  intents?: Intent[];
  greeting?: string;
  fallbackResponse?: string;
  maxTurns?: number;
  contextWindow?: number;
}

// Intent (new interface)
export interface Intent {
  name: string;
  examples: string[];
  response: string;
}

// AIAgentTraining
export interface AIAgentTraining {
  // existing fields...
  // ADD THESE:
  faqPairs?: FAQPair[];
  tone?: string;
  language?: string;
}

// FAQPair (new interface)
export interface FAQPair {
  question: string;
  answer: string;
}

// AIAgentIntegrations
export interface AIAgentIntegrations {
  // existing fields...
  // ADD THESE:
  customWebhooks?: Webhook[];
  crmEnabled?: boolean;
  crmSystem?: string;
  emailEnabled?: boolean;
  calendarEnabled?: boolean;
}

// Webhook (new interface)
export interface Webhook {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
}

// AIModelSelection
export interface AIModelSelection {
  // existing fields...
  // ADD THESE:
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

// RequirementField
export interface RequirementField {
  id: string;
  type: string;
  label: string;
  // existing fields...
  // ADD THESE:
  rows?: number;  // For textarea
  itemFields?: RequirementField[];  // For array fields
}

// FlowTrigger
export interface FlowTrigger {
  type: 'manual' | 'webhook' | 'schedule' | 'event';
  // ADD THESE:
  schedule?: string;
  eventName?: string;
}

// FlowStep
export interface FlowStep {
  id: string;
  // ADD THESE:
  type?: 'api_call' | 'transform' | 'condition';
  stepNumber?: number;
  endpoint?: string;
}

// ErrorHandlingStrategy
export interface ErrorHandlingStrategy {
  strategy: 'retry' | 'fail' | 'continue';
  // ADD THESE:
  retryCount?: number;
  notifyOnFailure?: boolean;
  failureEmail?: string;
}

// TestCase
export interface TestCase {
  name: string;
  // ADD THESE:
  scenario?: string;
}

// AcceptanceCriteria (expand with ~20 properties)
export interface FunctionalRequirement {
  id: string;
  description: string;
  // ADD THESE:
  target?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface PerformanceRequirement {
  id: string;
  description: string;
  // ADD THESE:
  metric?: string;
  threshold?: number;
  target?: string;
}

export interface SecurityRequirement {
  id: string;
  description: string;
  // ADD THESE:
  level?: 'critical' | 'high' | 'medium' | 'low';
  compliance?: string[];
}

export interface UsabilityRequirement {
  id: string;
  description: string;
  // ADD THESE:
  userType?: string;
  scenario?: string;
  tested?: boolean;
}
```

---

### 2. Type Definitions - index.ts (Phase 1 Modules)
**File:** `src/types/index.ts`
**Errors Fixed:** ~120 (10% of total)
**Time:** 3-4 hours

**Add Missing Properties:**

```typescript
// OverviewModule
export interface OverviewModule {
  businessType?: string;
  employees?: number;
  // ADD THESE:
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  mainGoals?: string[];
}

// PlanningModule
export interface PlanningModule {
  // ADD ALL THESE:
  primaryGoals?: string[];
  timeframe?: string;
  implementation?: {
    timeline?: string;
    resources?: string;
    budget?: string;
  };
  priorities?: {
    top?: Priority[];
    quickWins?: Priority[];
    longTerm?: Priority[];
  };
  nextSteps?: {
    immediate?: NextStep[];
    followUp?: NextStep[];
    decisionMakers?: NextStep[];
  };
  risks?: string[];
  additionalSupport?: string;
}

// Priority (new interface)
export interface Priority {
  item: string;
  reason: string;
}

// NextStep (new interface)
export interface NextStep {
  action: string;
  owner?: string;
  deadline?: string;
}

// ROIModule
export interface ROIModule {
  automationPotential?: string;
  processes?: string[];
  implementation?: string;
  // ADD THESE:
  estimatedHoursSaved?: number;
  costAnalysis?: {
    currentCost?: number;
    automationCost?: number;
    netSavings?: number;
  };
}

// ReportingModule
export interface ReportingModule {
  // existing fields...
  // ADD THESE:
  criticalAlerts?: string[];
}

// SystemsModule
export interface SystemsModule {
  currentSystems?: string[];
  // existing fields...
  // ADD THESE:
  integrationNeeds?: string[];
  apiAccess?: boolean;
  dataWarehouse?: boolean;
}

// AIAgentsModule
export interface AIAgentsModule {
  useCases?: AIUseCase[];
  // ADD THESE:
  readinessLevel?: 'none' | 'low' | 'medium' | 'high';
  currentAI?: 'none' | 'basic' | 'advanced';
}
```

---

### 3. Type Definitions - proposal.ts
**File:** `src/types/proposal.ts`
**Errors Fixed:** ~30 (2.5% of total)
**Time:** 1 hour

**Add Missing Properties:**

```typescript
export interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  // ADD THESE:
  type?: 'automation' | 'integration' | 'optimization' | 'training';
  estimatedTimeSavings?: number;  // hours per week
  estimatedCostSavings?: number;  // currency per year
  suggestedTools?: string[];  // Note: plural, not suggestedTool
}
```

---

### 4. Type Definitions - phase3.ts
**File:** `src/types/phase3.ts`
**Errors Fixed:** ~50 (4% of total)
**Time:** 2-3 hours

**Add Missing Properties:**

```typescript
// Sprint
export interface Sprint {
  id: string;
  name: string;
  // ADD THESE:
  startDate?: string;
  endDate?: string;
  velocity?: number;
  completedPoints?: number;
  totalPoints?: number;
}

// Task
export interface Task {
  id: string;
  title: string;
  // ADD THESE:
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
}

// Blocker
export interface Blocker {
  id: string;
  description: string;
  // ADD THESE:
  severity?: 'critical' | 'high' | 'medium' | 'low';
  blockedTasks?: string[];
  resolution?: string;
  resolvedDate?: string;
}

// Add other Phase 3 types as needed...
```

---

## 🟡 MEDIUM - Fix Second (Week 2)

### 5. Add Explicit Types to Callbacks
**Files:** 50+ files
**Errors Fixed:** ~256 (21% of total)
**Time:** 6-8 hours

**Pattern to Apply:**

```typescript
// Before (implicit any):
services.map(s => s.id)
items.filter(item => item.active)
agents.find(agent => agent.name === 'sales')

// After (explicit types):
services.map((s: SelectedService) => s.id)
items.filter((item: ServiceItem) => item.active)
agents.find((agent: AIAgent) => agent.name === 'sales')
```

**Priority Files:**
1. AcceptanceCriteriaBuilder.tsx (25 fixes)
2. AIAgentDetailedSpec.tsx (20 fixes)
3. englishExport.ts (30 fixes)
4. IntegrationFlowBuilder.tsx (15 fixes)
5. ImplementationSpecDashboard.tsx (8 fixes)
6. All other Phase 2 files
7. Utility files
8. Module files

**Helper Type Definitions:**

```typescript
// Create in src/types/helpers.ts
export type MapCallback<T, R> = (item: T, index: number, array: T[]) => R;
export type FilterCallback<T> = (item: T, index: number, array: T[]) => boolean;
export type FindCallback<T> = (item: T, index: number, array: T[]) => boolean;
```

---

### 6. Fix Component Prop Types
**Files:** 20+ components
**Errors Fixed:** ~98 (8% of total)
**Time:** 3-4 hours

**Common Fixes:**

#### Button Variant
```typescript
// Before:
<Button variant="outline" />

// After:
<Button variant="secondary" />
```

#### Card Component
```typescript
// Before:
<Card title="Title" subtitle="Subtitle">...</Card>

// After:
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

#### TextField onBlur
```typescript
// Before:
<TextField onBlur={() => validate()} />

// After:
// Remove onBlur or use onChangeEnd prop if available
<TextField onChange={(value) => { setValue(value); validate(); }} />
```

#### NumberField onChange
```typescript
// Before:
<NumberField onChange={setCount} />  // Dispatch<SetStateAction<number>>

// After:
<NumberField onChange={(value) => setCount(value ?? 0)} />  // Handle undefined
```

---

### 7. Add Defensive Checks
**Files:** 15+ files
**Errors Fixed:** ~17 (1.4% of total)
**Time:** 2-3 hours

**Pattern to Apply:**

```typescript
// Before (possibly undefined):
if (leadData.leadSources.length > 3) { ... }
const total = q.frequencyPerDay * 30;

// After (defensive):
if (leadData.leadSources?.length > 3) { ... }
const total = (q.frequencyPerDay ?? 0) * 30;
```

**Files:**
- smartRecommendations.ts (16 fixes)
- LeadsAndSalesModule.tsx (3 fixes)
- CustomerServiceModule.tsx (1 fix)

---

## 🟢 LOW - Fix Last (Week 3)

### 8. Remove Unused Imports/Variables
**Files:** 40+ files
**Errors Fixed:** ~194 (16% of total)
**Time:** 1-2 hours

**Strategy:**

```bash
# Auto-fix most issues
npx eslint --fix src/

# Manual cleanup for remaining
# Remove unused imports
# Remove unused state variables
# Remove unused functions
```

**Top Files:**
- Dashboard.tsx (17 unused)
- englishExport.ts (20 unused)
- Proposal Module (10 unused)
- AIAgentDetailedSpec.tsx (7 unused)
- IntegrationFlowBuilder.tsx (3 unused)

---

### 9. Fix Type Comparisons
**Files:** 10+ files
**Errors Fixed:** ~12 (1% of total)
**Time:** 1 hour

**Common Fixes:**

```typescript
// Before (comparing incompatible types):
if (priority === 'high') { ... }  // priority is number

// After (fix type or comparison):
if (priority === 3) { ... }  // high = 3
// OR
if (priorityLabel === 'high') { ... }  // use string version
```

---

### 10. Fix Test Files
**Files:** 5 test files
**Errors Fixed:** ~26 (2% of total)
**Time:** 2-3 hours

**Files:**
- smartRecommendationsEngine.test.ts
- dataMigration.test.ts
- Other test files

**Strategy:**
- Update mock types to match real types
- Fix test assertions
- Add proper type imports

---

## 📊 Cumulative Impact

| Phase | Tasks | Files | Errors Fixed | Time | Cumulative Errors Fixed |
|-------|-------|-------|--------------|------|------------------------|
| **Week 1** | Type Definitions (4 tasks) | 4 | ~380 | 10-14h | 380 (32%) |
| **Week 2** | Explicit Types & Props (3 tasks) | 70 | ~371 | 11-15h | 751 (63%) |
| **Week 3** | Cleanup (3 tasks) | 55 | ~232 | 4-6h | 983 (83%) |
| **Remaining** | Edge cases | 20 | ~205 | 1-3h | 1,188 (100%) |

---

## 🚀 Quick Start Guide

### Day 1: Phase 2 Types
1. Open `src/types/phase2.ts`
2. Copy the interfaces from Section 1 above
3. Add all missing properties
4. Run `npm run build:typecheck`
5. Verify ~180 errors are gone

### Day 2: Phase 1 Module Types
1. Open `src/types/index.ts`
2. Copy the interfaces from Section 2 above
3. Add all missing properties
4. Run `npm run build:typecheck`
5. Verify ~120 more errors are gone

### Day 3: Proposal & Phase 3 Types
1. Open `src/types/proposal.ts` and `src/types/phase3.ts`
2. Add missing properties from Sections 3 & 4
3. Run `npm run build:typecheck`
4. Verify ~80 more errors are gone

### Day 4-5: Explicit Types
1. Start with AcceptanceCriteriaBuilder.tsx
2. Add explicit types to all .map(), .filter(), .find() callbacks
3. Move to next file
4. Run type check frequently

### Day 6-7: Component Props & Defensive Checks
1. Fix Button variants (outline → secondary)
2. Fix Card components (add proper structure)
3. Fix NumberField onChange signatures
4. Add optional chaining (?.  and ??)

### Day 8: Cleanup
1. Run ESLint auto-fix
2. Remove unused imports/variables
3. Fix remaining edge cases
4. Final validation

---

## ✅ Validation Checklist

After each fix phase, verify:

- [ ] `npm run build:typecheck` - No new errors
- [ ] Error count decreased by expected amount
- [ ] `npm run build` - Build succeeds
- [ ] `npm run dev` - Dev server starts
- [ ] Manual testing of affected features
- [ ] Git commit with clear message

---

## 📋 Error Code Quick Reference

| Code | Description | Fix Strategy |
|------|-------------|--------------|
| **TS2339** | Property does not exist | Add to type definition |
| **TS7006** | Implicit any parameter | Add explicit type |
| **TS6133** | Unused variable | Remove or use |
| **TS2353** | Unknown object property | Add to type definition |
| **TS2322** | Type not assignable | Fix type or cast |
| **TS2345** | Argument type mismatch | Fix argument type |
| **TS18048** | Possibly undefined | Add defensive check |
| **TS2367** | Unintentional comparison | Fix types being compared |
| **TS2551** | Property typo | Fix property name |

---

## 🎯 Success Criteria

**Phase 2 Deployment Ready:**
- ✅ 0 errors in Phase 2 files
- ✅ All type definitions complete
- ✅ Build passes
- ✅ No runtime type errors

**Full Production Ready:**
- ✅ 0 TypeScript errors globally
- ✅ All tests pass
- ✅ Build optimization enabled
- ✅ No console warnings

---

## 📞 Need Help?

**Common Issues:**

1. **"I added the property but still get error"**
   - Restart TypeScript server in VS Code
   - Clear node_modules/.cache
   - Restart dev server

2. **"Type is too complex"**
   - Break into smaller interfaces
   - Use type aliases for complex unions
   - Consider using utility types (Pick, Omit, Partial)

3. **"Circular dependency error"**
   - Move shared types to separate file
   - Use type-only imports: `import type { ... }`

4. **"Build passes but IDE shows errors"**
   - Reload VS Code window
   - Check tsconfig.json paths
   - Verify correct TypeScript version

---

**End of Priority Matrix**
