# 🎯 MASTER IMPLEMENTATION PLAN
## Discovery Assistant - Complete Unification & Enhancement

**Version:** 2.0
**Date:** 2025-10-03
**Status:** READY FOR APPROVAL
**Total Duration:** 14 weeks (70 working days)

---

## 📋 EXECUTIVE SUMMARY

This master plan consolidates:
1. **Wizard-Module Data Unification** - Ensuring wizard and module views share the same data source
2. **Critical Bug Fixes** - LeadsAndSalesModule crash fix
3. **Phase Workflow Enhancement** - Clear progression through all phases
4. **Requirements Gathering** - Structured service requirement collection
5. **Client Approval Flow** - Professional proposal presentation and approval
6. **All Original Enhancements** - From IMPLEMENTATION_PLAN.md

---

## 🚨 CRITICAL ISSUES TO ADDRESS IMMEDIATELY

### **Issue #1: LeadsAndSalesModule Crash** (Priority: CRITICAL)
**Error:** `TypeError: d.map is not a function at LeadsAndSalesModule.tsx:301`

**Root Cause:**
- Line 44: `const [leadSources, setLeadSources] = useState<LeadSource[]>(moduleData.leadSources || []);`
- `moduleData.leadSources` can be:
  - An **array** (LeadSource[]) - from module direct entry
  - An **object** with properties like `channels`, `centralSystem`, `commonIssues`, etc. - from wizard data structure
  - `undefined`

**The Problem:**
```typescript
// TypeScript interface expects:
export interface LeadsAndSalesModule {
  leadSources: LeadSource[];  // ❌ But wizard uses different structure
  speedToLead: SpeedToLead;
  leadRouting: LeadRouting;
  // ...
}

// Wizard actually stores:
leadsAndSales: {
  leadSources: {
    channels: string[];        // ⚠️ Structure mismatch!
    centralSystem: string;
    commonIssues: string[];
    // ...
  }
}
```

**Solution:**
1. **Immediate Fix** (Day 1):
   - Add safe array check: `const [leadSources, setLeadSources] = useState<LeadSource[]>(Array.isArray(moduleData.leadSources) ? moduleData.leadSources : []);`
   - Add migration logic to convert old wizard structure to new structure

2. **Proper Fix** (During Sprint 1):
   - Update TypeScript interface to match reality
   - Unify data structures between wizard and module
   - See full unification plan below

---

## 📊 CURRENT APPLICATION STATE AUDIT

### **What We Have:**

#### **Phase 1 - Discovery (COMPLETE):**
✅ **Wizard Mode**: 34 steps across 9 modules
✅ **Module View**: Direct module access with advanced features
✅ **9 Core Modules**: Overview, Leads, Customer Service, Operations, Reporting, AI Agents, Systems, ROI, Proposal
✅ **Advanced Components**:
- AIAgentUseCaseBuilder.tsx (500 lines)
- AIModelSelector.tsx (450 lines)
- DetailedSystemCard.tsx (484 lines)
- ROIVisualization.tsx (charts)
- IntegrationVisualizer.tsx

✅ **Config Databases**:
- systemsDatabase.ts (500+ systems)
- servicesDatabase.ts (complete service catalog)
- serviceRequirementsTemplates.ts (requirement forms)

#### **Phase 2 - Implementation Spec (COMPLETE):**
✅ **Components**: 5 components (157KB total code)
- ImplementationSpecDashboard.tsx
- SystemDeepDive.tsx
- IntegrationFlowBuilder.tsx
- AIAgentDetailedSpec.tsx
- AcceptanceCriteriaBuilder.tsx

✅ **Types**: phase2.ts (complete type system)

#### **Phase 3 - Development (COMPLETE):**
✅ **Components**: 6 components (118KB total code)
- DeveloperDashboard.tsx (bilingual English/Hebrew)
- SprintView.tsx
- SystemView.tsx
- ProgressTracking.tsx
- BlockerManagement.tsx
- TaskDetail.tsx

✅ **Types**: phase3.ts (complete type system)
✅ **Task Generator**: taskGenerator.ts (auto-generates tasks from Phase 2)

#### **Requirements Gathering System (COMPLETE):**
✅ **Components**: 4 components
- RequirementsNavigator.tsx
- RequirementsGathering.tsx
- RequirementSection.tsx
- RequirementField.tsx

✅ **Types**: serviceRequirements.ts

### **What's MISSING or BROKEN:**

❌ **Wizard-Module Data Sync**: Different data structures
❌ **LeadsAndSales Module**: Crashes on load (critical bug)
❌ **Missing Wizard Fields**: 56 fields not in wizard
❌ **Phase Workflow UI**: No clear phase progression indicators
❌ **Service Selection Flow**: Proposal → Requirements → Client Approval not clear
❌ **Phase Transition Guards**: Can transition without completing prerequisites
❌ **Requirements Integration**: Requirements Navigator exists but not integrated into main flow
❌ **Client Approval UI**: No dedicated client approval/signature component

---

## 🎯 COMPLETE MASTER PLAN

---

# **PHASE 0: CRITICAL FIXES** (Week 0 - Days 1-3)

## **Goals:**
1. Fix LeadsAndSalesModule crash immediately
2. Add data migration for existing meetings
3. Verify all modules load without errors

## **Tasks:**

### **Day 1: Emergency Bug Fix**
- [x] **Fix LeadsAndSalesModule.tsx line 44:**
  ```typescript
  // BEFORE (crashes):
  const [leadSources, setLeadSources] = useState<LeadSource[]>(moduleData.leadSources || []);

  // AFTER (safe):
  const [leadSources, setLeadSources] = useState<LeadSource[]>(() => {
    if (Array.isArray(moduleData.leadSources)) {
      return moduleData.leadSources;
    }
    // Migration: Convert old wizard structure to new structure
    if (moduleData.leadSources && typeof moduleData.leadSources === 'object') {
      const oldData = moduleData.leadSources as any;
      if (oldData.channels && Array.isArray(oldData.channels)) {
        return oldData.channels.map((channel: string) => ({
          channel,
          volumePerMonth: 0,
          quality: 3
        }));
      }
    }
    return [];
  });
  ```

- [x] **Test Fix:**
  - Load existing meetings with old data structure
  - Create new meeting with module entry
  - Create new meeting with wizard entry
  - Verify no crashes

### **Day 2: Audit All Modules**
- [ ] Check all other modules for similar issues
- [ ] Test CustomerServiceModule (has similar structure)
- [ ] Test OperationsModule
- [ ] Test all module loads
- [ ] Document any other structural mismatches

### **Day 3: Quick Data Migration Script**
- [ ] Create `utils/dataMigration.ts`
- [ ] Add migration for LeadsAndSales structure
- [ ] Add migration for CustomerService structure
- [ ] Run migration on app load for existing localStorage data
- [ ] Test with real data

**Deliverables:**
✅ LeadsAndSalesModule loads without errors
✅ All modules tested and working
✅ Data migration in place for backward compatibility

---

# **SPRINT 1: WIZARD-MODULE UNIFICATION** (Week 1-2, Days 4-13)

## **Goals:**
1. Unify data structures between wizard and modules
2. Add all missing fields to wizard (56 fields)
3. Preserve all advanced module components
4. Ensure single source of truth: `currentMeeting.modules.*`

## **Background: The Two-Tier System**

**Philosophy**: Keep wizard simple for quick entry, modules offer advanced features.

```
currentMeeting.modules.{moduleName}
         ↓
    ┌────┴────┐
    │         │
    ▼         ▼
WizardMode  ModuleComponent
(basic)     (basic + advanced)
```

### **Strategy:**
- **Wizard**: Add all basic fields (56 missing fields)
- **Modules**: Keep ALL advanced components (AIUseCaseBuilder, DetailedSystemCard, ROIVisualization, etc.)
- **TypeScript Interfaces**: Include both basic and advanced fields
- **Result**: Wizard = simplified entry, Modules = power user features

## **Tasks:**

### **Day 4-5: TypeScript Interface Updates**
- [ ] Update `types/index.ts`:
  ```typescript
  export interface LeadsAndSalesModule {
    // Root-level structure (NOT nested)
    leadSources: LeadSource[];  // Array at root level
    speedToLead: SpeedToLead;
    leadRouting: LeadRouting;
    followUp: FollowUpStrategy;
    appointments: AppointmentManagement;
  }

  export interface LeadSource {
    channel: string;
    volumePerMonth?: number;
    quality?: 1 | 2 | 3 | 4 | 5;
  }
  ```
- [ ] Fix CustomerServiceModule interface (same issue with `channels`)
- [ ] Verify all module interfaces are correct
- [ ] Add JSDoc comments explaining structure

### **Day 6-8: Update wizardSteps.ts**

**Add 56 missing fields across all modules:**

#### **Overview Module** (+2 fields):
- [ ] Add `processes: string[]` checkbox group
- [ ] Add `currentSystems: string[]` checkbox group

#### **Leads & Sales Module** (+21 fields):
Update wizard to use LeadSource[] structure:
- [ ] Change `leadSources.channels` to dynamic LeadSource[] array builder
- [ ] Add field: `leadSources[].volumePerMonth` (number)
- [ ] Add field: `leadSources[].quality` (rating 1-5)
- [ ] Add `speedToLead.responseTimeUnit` (select: minutes/hours/days)
- [ ] Add `speedToLead.urgentHandling` (textarea)
- [ ] Add `speedToLead.opportunity` (textarea)
- [ ] Add `leadRouting.methodDetails` (textarea)
- [ ] Add `leadRouting.customHotLeadCriteria` (textarea)
- [ ] Add `leadRouting.hotLeadPriority` (select)
- [ ] Add `leadRouting.aiPotential` (textarea)
- [ ] Add `followUp.day1Interval` (number)
- [ ] Add `followUp.day3Interval` (number)
- [ ] Add `followUp.day7Interval` (number)
- [ ] Add `followUp.notNowHandling` (textarea)
- [ ] Add `followUp.nurturingDescription` (textarea)
- [ ] Add `followUp.customerJourneyOpportunity` (textarea)
- [ ] Add `appointments.messagesPerScheduling` (number)
- [ ] Add `appointments.multipleParticipants` (checkbox)
- [ ] Add `appointments.changesPerWeek` (number)
- [ ] Add `appointments.reminders.customTime` (text)
- [ ] Add `appointments.criticalPain` (textarea)

#### **Customer Service Module** (+13 fields):
Update wizard to use ServiceChannel[] structure:
- [ ] Change `channels.active` to ServiceChannel[] array builder
- [ ] Add `channels[].volumePerDay` (number)
- [ ] Add `channels[].responseTime` (text)
- [ ] Add `channels[].availability` (text)
- [ ] Add `channels.multiChannelIssue` (textarea)
- [ ] Add `autoResponse.topQuestions` (FAQ[] array with question + frequencyPerDay)
- [ ] Add `proactiveCommunication.updateChannelMapping` (textarea)
- [ ] Add `proactiveCommunication.whatMattersToCustomers` (textarea)
- [ ] Add `communityManagement.eventsPerMonth` (number)
- [ ] Add `communityManagement.registrationMethod` (text)
- [ ] Add `communityManagement.actualAttendanceRate` (number)
- [ ] Add `reputationManagement.whatDoWithFeedback` (textarea)
- [ ] Add complete `onboarding` section (OnboardingStep[] array)

#### **Operations Module** (+7 fields):
- [ ] Add missing `systemSync` fields
- [ ] Add missing `documentManagement` fields
- [ ] Add missing `projectManagement.delayImpact`
- [ ] Add missing `financialProcesses.errors`
- [ ] Add missing `hr.onboarding.systemsToUpdate`
- [ ] Add missing `crossDepartment.statusChecks`
- [ ] Add missing ROI calculation fields

#### **Reporting Module** (+4 fields):
- [ ] Add `kpis[].measured` (select: excel/system/manual/not)
- [ ] Add `dashboards.anomalyDetection` (select)
- [ ] Add missing report distribution fields
- [ ] Add missing alert configuration fields

#### **AI Agents Module** (+4 basic fields):
- [ ] Add `priority` field (sales/service/operations)
- [ ] Add `naturalLanguageImportance` (critical/important/less_important)
- [ ] Keep wizard simple - NO Use Case Builder or Model Selector in wizard
- [ ] Advanced features (agentSpecs, selectedModels) remain module-only

#### **Systems Module** (+8 basic fields):
- [ ] Add `customSystems` (text)
- [ ] Add `integrations.level` (select)
- [ ] Add `integrations.issues` (checkbox group)
- [ ] Add `integrations.manualDataTransfer` (textarea)
- [ ] Add `dataQuality.overall` (select)
- [ ] Add `dataQuality.duplicates` (select)
- [ ] Add `dataQuality.completeness` (number)
- [ ] Keep wizard simple - NO Detailed System Cards in wizard
- [ ] Advanced features (detailedSystems) remain module-only

#### **ROI Module** (+8 fields):
- [ ] Add `currentCosts.manualHours` (number)
- [ ] Add `currentCosts.hourlyCost` (number)
- [ ] Add `currentCosts.toolsCost` (number)
- [ ] Add `currentCosts.errorCost` (number)
- [ ] Add `timeSavings.automationPotential` (percentage)
- [ ] Add `investment.range` (select)
- [ ] Add `investment.paybackExpectation` (select)
- [ ] Add `successMetrics` (checkbox group)

### **Day 9-10: Module Updates**
- [ ] Verify all module components read from correct paths
- [ ] Test module → wizard sync
- [ ] Test wizard → module sync
- [ ] Ensure modules don't break with new structure
- [ ] Keep all advanced components (no deletions!)

### **Day 11-12: Integration Testing**
- [ ] Test: Fill field in wizard → appears in module
- [ ] Test: Fill field in module → appears in wizard
- [ ] Test: Use advanced features in module → saves correctly
- [ ] Test: Reload app → all data persists
- [ ] Test: Old meetings migrate correctly
- [ ] Test: Phase 2 & 3 read data correctly

### **Day 13: Documentation**
- [ ] Update CLAUDE.md with unification details
- [ ] Document wizard vs. module feature differences
- [ ] Document data structure in comments
- [ ] Create migration guide for old data

**Deliverables:**
✅ Wizard and modules share same data source
✅ All 56 missing fields added to wizard
✅ All advanced components preserved in modules
✅ No data loss or feature loss
✅ Old meetings migrated successfully

---

# **SPRINT 2: PHASE WORKFLOW ENHANCEMENT** (Week 3-4, Days 14-23)

## **Goals:**
1. Create clear phase progression UI
2. Add phase transition guards and validation
3. Implement Requirements Navigator integration
4. Build Client Approval component
5. Clear visual indicators for each phase

## **Phase Flow Architecture:**

```
PHASE 1: DISCOVERY
├─ Step 1: Data Collection (Wizard or Modules)
├─ Step 2: Proposal Generation (Auto)
└─ Step 3: Service Selection
         ↓
    [SAVE AS CLIENT DECISION]
         ↓
REQUIREMENTS GATHERING (if services need specs)
├─ For each selected service with template:
│  ├─ Display service requirement form
│  ├─ Collect technical details
│  └─ Save to meeting.modules.requirements[]
└─ Complete when all services have requirements
         ↓
CLIENT APPROVAL
├─ Display: Summary + Proposal + Requirements
├─ Client can: Review, Request Changes, Approve
├─ Status: awaiting_client_decision → client_approved
└─ Save approval timestamp + notes
         ↓
PHASE 2: IMPLEMENTATION SPEC
├─ Requirements → Systems, Integrations, AI Agents
├─ Deep technical specifications
├─ Acceptance criteria
└─ Generate developer guide
         ↓
PHASE 3: DEVELOPMENT
├─ Auto-generate tasks from Phase 2
├─ Developer dashboard
├─ Sprint management
└─ Progress tracking
         ↓
COMPLETED
```

## **Tasks:**

### **Day 14-15: Phase Navigator Component**
- [ ] Create `PhaseNavigator.tsx`
- [ ] Visual phases: Discovery → Requirements → Approval → Spec → Dev → Complete
- [ ] Each phase shows:
  - Phase number and name
  - Status icon (🔘 not started, 🔄 in progress, ✅ complete)
  - Completion percentage
  - "Current Phase" indicator
  - Click to view (if completed)
- [ ] Responsive horizontal stepper design
- [ ] Add to Dashboard header
- [ ] Add to all phase-specific views

### **Day 16-17: Phase Transition Logic**
Update `useMeetingStore.ts`:

- [ ] **Add transition validation:**
  ```typescript
  canTransitionTo(phase: MeetingPhase): boolean {
    const meeting = this.currentMeeting;
    if (!meeting) return false;

    switch (phase) {
      case 'requirements_gathering':
        // Can transition if proposal has selected services
        return meeting.modules.proposal?.selectedServices?.length > 0;

      case 'awaiting_approval':
        // Can transition if all required requirements collected
        const selectedServices = meeting.modules.proposal?.selectedServices || [];
        const servicesWithTemplates = selectedServices.filter(sid =>
          getRequirementsTemplate(sid) !== null
        );
        const collectedRequirements = meeting.modules.requirements || [];
        return collectedRequirements.length >= servicesWithTemplates.length;

      case 'implementation_spec':
        // Can transition only if client approved
        return meeting.status === 'client_approved';

      case 'development':
        // Can transition if Phase 2 is complete
        return meeting.implementationSpec?.completionPercentage === 100;

      case 'completed':
        // Can transition if Phase 3 tasks all done
        const tasks = meeting.developmentTracking?.tasks || [];
        return tasks.every(t => t.status === 'done');

      default:
        return true;
    }
  }
  ```

- [ ] **Add phase-specific statuses:**
  ```typescript
  export type MeetingStatus =
    | 'discovery_in_progress'
    | 'discovery_complete'
    | 'requirements_gathering'      // NEW
    | 'awaiting_client_decision'    // NEW
    | 'client_approved'
    | 'client_requested_changes'    // NEW
    | 'spec_in_progress'
    | 'spec_complete'
    | 'dev_not_started'
    | 'dev_in_progress'
    | 'dev_testing'
    | 'dev_ready_for_deployment'
    | 'deployed'
    | 'completed';
  ```

- [ ] **Add transition with notes:**
  ```typescript
  transitionPhase(toPhase: MeetingPhase, notes?: string) {
    if (!this.canTransitionTo(toPhase)) {
      throw new Error(`Cannot transition to ${toPhase}. Prerequisites not met.`);
    }

    const meeting = this.currentMeeting;
    const transition: PhaseTransition = {
      fromPhase: meeting.phase,
      toPhase,
      timestamp: new Date(),
      transitionedBy: 'user', // TODO: Add user context
      notes
    };

    this.updateMeeting({
      phase: toPhase,
      phaseHistory: [...(meeting.phaseHistory || []), transition],
      status: this.getInitialStatusForPhase(toPhase)
    });
  }
  ```

### **Day 18-19: Requirements Integration**
- [ ] Update `ProposalModule.tsx`:
  - Add "Next: Collect Requirements" button
  - Only show if selected services have templates
  - Transition to requirements_gathering status
  - Navigate to `/requirements`

- [ ] Create route in `AppContent.tsx`:
  ```typescript
  <Route path="/requirements" element={<RequirementsFlow />} />
  ```

- [ ] Create `RequirementsFlow.tsx`:
  - Wraps RequirementsNavigator
  - Shows progress bar
  - "Back to Proposal" button
  - "Complete & Request Approval" button
  - Saves requirements to `meeting.modules.requirements[]`
  - Transitions to `awaiting_client_decision`

### **Day 20-22: Client Approval Component**
- [ ] Create `ClientApprovalView.tsx`:
  - **Header**: Client name, company, date
  - **Summary Section**:
    - Business overview
    - Main challenges identified
    - Key pain points with severity
    - Total ROI projection
  - **Proposed Services Section**:
    - List all selected services
    - Each service shows: name, description, price, estimated days
    - Total price and timeline
  - **Requirements Section** (if any):
    - Display collected requirements per service
    - Formatted for client readability
  - **Next Steps Section**:
    - Clear explanation of implementation phases
    - Timeline estimate
  - **Client Decision Section**:
    - Three buttons:
      - ✅ "Approve & Proceed" → status: client_approved
      - 📝 "Request Changes" → status: client_requested_changes + notes field
      - ❌ "Decline" → status: declined + notes field
    - Date picker: "Approved on"
    - Text area: "Client notes"
    - Signature field (optional): Client name + digital signature
  - **Action Buttons**:
    - Export as PDF
    - Email to client
    - Save decision

- [ ] Add route: `<Route path="/approval" element={<ClientApprovalView />} />`

- [ ] Update Dashboard to show "Pending Approval" banner when status is `awaiting_client_decision`

### **Day 23: Phase Guards in UI**
- [ ] Add guards to all navigation:
  - Show "Complete Discovery First" if accessing Phase 2 too early
  - Show "Requires Client Approval" if accessing Phase 2 without approval
  - Show "Complete Implementation Spec First" if accessing Phase 3 too early
  - Disable navigation buttons if can't transition

- [ ] Add visual indicators:
  - 🔒 Locked phases
  - 🔓 Unlocked phases
  - ⚠️ Incomplete phases
  - ✅ Complete phases

- [ ] Add tooltips explaining why phase is locked

**Deliverables:**
✅ Clear phase progression UI
✅ Phase transition validation working
✅ Requirements Navigator integrated
✅ Client Approval component functional
✅ Can't skip phases inappropriately

---

# **SPRINT 3: PROPOSAL & SUMMARY ENHANCEMENTS** (Week 5, Days 24-28)

## **Goals:**
1. Enhance ProposalModule with better service selection UI
2. Improve summary generation
3. Add "Next Steps" section
4. Better export formats

## **Tasks:**

### **Day 24-25: Enhanced Proposal UI**
- [ ] Update `ProposalModule.tsx`:
  - **Summary Cards** at top:
    - Total selected services
    - Total estimated cost
    - Total estimated days
    - Potential ROI
  - **Service Categories** (accordion):
    - Automations
    - AI Agents
    - Integrations
    - System Implementations
    - Additional Services
  - **Each Service Card**:
    - Service name (bilingual)
    - Description (expandable)
    - Why recommended (from proposal engine)
    - Relevance score (visual bar)
    - Base price (editable)
    - Custom price field
    - Estimated days
    - Checkbox: Selected
    - "More Details" button → opens modal with full service details
  - **Totals Section**:
    - Selected services count by category
    - Total investment
    - Payment terms selector (one-time / monthly / hybrid)
    - Timeline estimate
  - **Action Buttons**:
    - "Save Selection"
    - "Next: Collect Requirements" (if needed)
    - "Next: Request Client Approval" (if no requirements needed)
    - "Export Proposal" (PDF)

### **Day 26: Summary Tab Enhancement**
- [ ] Update `SummaryTab.tsx`:
  - Add phase-aware summary
  - Show different content based on current phase
  - **Discovery Phase Summary**:
    - Business overview
    - All module summaries (9 modules)
    - Total pain points identified
    - Key automation opportunities
    - ROI summary
  - **Requirements Phase Summary**:
    - Collected requirements per service
    - Technical specifications summary
  - **Phase 2 Summary**:
    - Systems inventory
    - Integration map
    - AI agents planned
    - Acceptance criteria count
  - **Phase 3 Summary**:
    - Total tasks
    - Sprint breakdown
    - Progress percentage
    - Blockers
    - Timeline projection

### **Day 27: Next Steps Generator**
- [ ] Create `NextStepsGenerator.tsx`:
  - Analyzes current phase and status
  - Generates smart next steps:
    - If discovery incomplete: "Complete modules: X, Y, Z"
    - If proposal not generated: "Generate proposal"
    - If services not selected: "Select services from proposal"
    - If requirements needed: "Collect technical requirements"
    - If awaiting approval: "Request client approval"
    - If approved: "Begin implementation specification"
    - If spec complete: "Generate development tasks"
    - If development started: "Track progress in developer dashboard"
  - Each next step shows:
    - Step number
    - Description
    - Action button
    - Estimated time
    - Priority level

- [ ] Add to Dashboard as "Next Steps" card

### **Day 28: Export Improvements**
- [ ] **PDF Export Enhancements**:
  - Phase-aware exports
  - Professional formatting
  - Include charts and graphs
  - Client-ready proposals
  - Developer guides in English
  - Manager reports

- [ ] **Export Formats**:
  - PDF (client proposals, developer guides)
  - Markdown (technical specs)
  - JSON (programmatic use)
  - Excel (task lists, ROI calculations)
  - CSV (Jira import, GitHub issues)

**Deliverables:**
✅ Professional proposal presentation
✅ Clear service selection flow
✅ Phase-aware summaries
✅ Smart next steps generator
✅ Multiple export formats

---

# **SPRINT 4-6: CONTINUE WITH ORIGINAL PLAN**

Continue with original IMPLEMENTATION_PLAN.md sprints:
- **Sprint 4**: Phase 2 Foundation (Week 6-7)
- **Sprint 5**: Phase 2 Advanced (Week 8-9)
- **Sprint 6**: Phase 3 Foundation (Week 10-11)
- **Sprint 7**: Phase 3 Advanced (Week 12-13)
- **Sprint 8**: Polish & Deployment (Week 14)

See detailed tasks in IMPLEMENTATION_PLAN.md

---

## 🔄 COMPLETE PHASE FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: DISCOVERY                                              │
│                                                                 │
│ ┌────────────┐     ┌───────────┐     ┌──────────────┐         │
│ │  Wizard    │ OR  │  Module   │ →   │  Proposal    │         │
│ │  34 Steps  │     │  Direct   │     │  Generation  │         │
│ └────────────┘     └───────────┘     └──────────────┘         │
│                                              ↓                  │
│                                   ┌──────────────────┐         │
│                                   │ Service Selection│         │
│                                   └──────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ REQUIREMENTS GATHERING (if needed)                              │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ RequirementsNavigator                                    │   │
│ │ ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│ │ │ Service 1  │→ │ Service 2  │→ │ Service 3  │         │   │
│ │ │ Form       │  │ Form       │  │ Form       │         │   │
│ │ └────────────┘  └────────────┘  └────────────┘         │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT APPROVAL                                                  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ ClientApprovalView                                      │   │
│ │ • Summary + Proposal + Requirements                     │   │
│ │ • Pricing breakdown                                      │   │
│ │ • Timeline estimate                                      │   │
│ │ • Client decision: [Approve] [Changes] [Decline]       │   │
│ │ • Signature + Date                                       │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: IMPLEMENTATION SPEC                                    │
│                                                                 │
│ ┌──────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│ │ System       │  │ Integration     │  │ AI Agent        │   │
│ │ Deep Dive    │  │ Flow Builder    │  │ Detailed Spec   │   │
│ └──────────────┘  └─────────────────┘  └─────────────────┘   │
│         ↓                  ↓                     ↓             │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Acceptance Criteria Builder                             │   │
│ └─────────────────────────────────────────────────────────┘   │
│         ↓                                                       │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Generate Developer Guide (English)                      │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: DEVELOPMENT                                            │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Auto-Generate Tasks from Phase 2                        │   │
│ └─────────────────────────────────────────────────────────┘   │
│         ↓                                                       │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│ │   Kanban     │  │   Sprint     │  │   System     │         │
│ │    View      │  │    View      │  │    View      │         │
│ └──────────────┘  └──────────────┘  └──────────────┘         │
│         ↓                                                       │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Progress Tracking + Blocker Management                   │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ COMPLETED                                                        │
│ • All tasks done                                                │
│ • Final report generated                                        │
│ • Client handoff                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 NEW FILES TO CREATE

```
discovery-assistant/src/
├── components/
│   ├── PhaseNavigation/
│   │   ├── PhaseNavigator.tsx          (NEW - Sprint 2)
│   │   ├── PhaseTransitionModal.tsx    (NEW - Sprint 2)
│   │   └── PhaseStatusBadge.tsx        (NEW - Sprint 2)
│   │
│   ├── Requirements/
│   │   └── RequirementsFlow.tsx        (NEW - Sprint 2)
│   │       (wraps existing RequirementsNavigator)
│   │
│   ├── ClientApproval/
│   │   ├── ClientApprovalView.tsx      (NEW - Sprint 3)
│   │   ├── ApprovalSummary.tsx         (NEW - Sprint 3)
│   │   ├── SignatureField.tsx          (NEW - Sprint 3)
│   │   └── ApprovalTimeline.tsx        (NEW - Sprint 3)
│   │
│   └── NextSteps/
│       └── NextStepsGenerator.tsx      (NEW - Sprint 3)
│
├── utils/
│   ├── dataMigration.ts                (NEW - Phase 0)
│   ├── phaseTransitionValidator.ts     (NEW - Sprint 2)
│   └── nextStepsLogic.ts               (NEW - Sprint 3)
│
└── types/
    └── clientApproval.ts               (NEW - Sprint 3)
```

---

## ✅ COMPLETE CHECKLIST

### **Phase 0: Critical Fixes** (Days 1-3)
- [ ] Fix LeadsAndSalesModule crash
- [ ] Add data migration for old meetings
- [ ] Test all modules load without errors

### **Sprint 1: Unification** (Days 4-13)
- [ ] Update TypeScript interfaces
- [ ] Add 56 missing fields to wizard
- [ ] Fix data structure mismatches
- [ ] Test wizard ↔ module sync
- [ ] Preserve all advanced components

### **Sprint 2: Phase Workflow** (Days 14-23)
- [ ] Create PhaseNavigator component
- [ ] Add phase transition validation
- [ ] Integrate RequirementsNavigator
- [ ] Build ClientApprovalView
- [ ] Add phase guards in UI

### **Sprint 3: Proposal Enhancement** (Days 24-28)
- [ ] Enhance ProposalModule UI
- [ ] Improve SummaryTab
- [ ] Create NextStepsGenerator
- [ ] Add export improvements

### **Sprint 4-8: Continue Original Plan** (Days 29-70)
- See IMPLEMENTATION_PLAN.md for detailed tasks

---

## 🎯 SUCCESS CRITERIA

### **Immediate Success** (Phase 0):
✅ No module crashes
✅ All existing meetings load correctly
✅ Data migration works seamlessly

### **Sprint 1 Success**:
✅ Wizard and modules share same data
✅ No missing fields
✅ No lost features
✅ All advanced components work

### **Sprint 2 Success**:
✅ Clear phase progression visible
✅ Can't skip phases inappropriately
✅ Requirements collection integrated
✅ Client approval flow functional

### **Sprint 3 Success**:
✅ Professional proposal presentation
✅ Clear next steps at all times
✅ Multiple export formats working

### **Final Success**:
✅ Complete discovery → spec → dev workflow
✅ Zero critical bugs
✅ All documentation complete
✅ Team trained and productive

---

## 📊 TIMELINE SUMMARY

| Week | Sprint | Focus | Deliverable |
|------|--------|-------|-------------|
| 0 | Phase 0 | Critical Fixes | LeadsAndSales working |
| 1-2 | Sprint 1 | Unification | Wizard-module sync complete |
| 3-4 | Sprint 2 | Phase Workflow | Phase transitions working |
| 5 | Sprint 3 | Proposal Enhancement | Professional proposals |
| 6-7 | Sprint 4 | Phase 2 Foundation | System specs working |
| 8-9 | Sprint 5 | Phase 2 Advanced | Integration flows complete |
| 10-11 | Sprint 6 | Phase 3 Foundation | Task generation working |
| 12-13 | Sprint 7 | Phase 3 Advanced | Full dev dashboard |
| 14 | Sprint 8 | Polish & Deploy | Production ready |

**Total Duration**: 14 weeks (70 working days)

---

## 🚀 READY TO IMPLEMENT

**Approval Required For:**
1. ✅ Fix LeadsAndSales crash immediately (Phase 0)
2. ✅ Unify wizard-module data structures (Sprint 1)
3. ✅ Add 56 missing wizard fields (Sprint 1)
4. ✅ Build phase workflow UI (Sprint 2)
5. ✅ Create client approval component (Sprint 2)
6. ✅ Enhance proposal module (Sprint 3)
7. ✅ Continue with original Phase 2 & 3 plan (Sprints 4-8)

**Next Actions:**
1. [ ] Review and approve this master plan
2. [ ] Prioritize Phase 0 fixes (1-3 days max)
3. [ ] Begin Sprint 1 unification work
4. [ ] Track progress daily

---

**LET'S BUILD A COMPLETE, PROFESSIONAL SYSTEM! 🚀**
