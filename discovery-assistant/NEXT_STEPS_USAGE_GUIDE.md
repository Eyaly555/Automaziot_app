# NextStepsGenerator Usage & Testing Guide

## Quick Start

The NextStepsGenerator is **already integrated** into the Dashboard and requires no additional setup. It automatically appears when you navigate to the root route (`/`).

## Accessing the Component

### Method 1: Dashboard (Automatic)
1. Start the development server:
   ```bash
   cd discovery-assistant
   npm run dev
   ```
2. Open browser to `http://localhost:5176`
3. Component automatically visible in Dashboard

### Method 2: Direct Import
```typescript
import { NextStepsGenerator } from '../NextSteps/NextStepsGenerator';

// In your component
<NextStepsGenerator />
```

## Testing Scenarios

### Scenario 1: Brand New Meeting (0% Progress)

**Setup:**
1. Open application
2. Click "פגישה חדשה" (New Meeting)
3. Enter client name: "Test Client"

**Expected Behavior:**
```
Current Step:
  - "השלם מודול: סקירה כללית" (Complete Module: Overview)
  - Priority: Urgent/High (red/orange)
  - Action: Navigate to /module/overview
  - Time: 20-30 דקות

Additional Steps:
  - "השתמש באשף המודרך" (Use Guided Wizard) - if shown
  - Priority: High
  - Action: Navigate to /wizard
```

**How to Test:**
1. Verify urgent badge shows (red background)
2. Click "פתח מודול" button
3. Verify navigation to `/module/overview`
4. Complete some fields in overview
5. Return to dashboard
6. Verify NextSteps reflects new progress

**Success Criteria:**
- ✅ Component renders without errors
- ✅ Shows overview module as first step
- ✅ Priority is urgent/high
- ✅ Button navigates correctly
- ✅ Updates when progress changes

---

### Scenario 2: Mid-Discovery (50-70% Progress)

**Setup:**
1. Create new meeting or load existing
2. Complete modules: overview, leadsAndSales, customerService, operations
3. Leave remaining modules incomplete

**Expected Behavior:**
```
Current Step:
  - "צור הצעת שירותים" (Generate Service Proposal)
  - Priority: Urgent (red)
  - Action: Navigate to /module/proposal
  - Time: 5 דקות

Completed Steps:
  - ✓ Overview
  - ✓ Leads & Sales
  - ✓ Customer Service
  - ✓ Operations

Pending Steps:
  - Remaining modules (reporting, aiAgents, etc.)
```

**How to Test:**
1. Navigate to Dashboard
2. Verify proposal generation step shows
3. Click "עבור להצעה" button
4. Should navigate to `/module/proposal`
5. Click "Generate Proposal" in ProposalModule
6. Return to Dashboard
7. Verify NextSteps updates to "Select Services"

**Success Criteria:**
- ✅ Proposal step shows when progress ≥ 50%
- ✅ Priority is urgent (red badge)
- ✅ Completed steps shown with checkmarks
- ✅ Updates after proposal generation
- ✅ Next step changes to service selection

---

### Scenario 3: Proposal Generated, Services Not Selected

**Setup:**
1. Complete Scenario 2
2. Generate proposal
3. Do NOT select any services yet

**Expected Behavior:**
```
Current Step:
  - "בחר שירותים לפרויקט" (Select Services)
  - Priority: Urgent (red)
  - Action: Navigate to /module/proposal
  - Time: 10 דקות
```

**How to Test:**
1. Verify "Select Services" step appears
2. Click action button
3. Navigate to proposal module
4. Select 2-3 services (check boxes)
5. Save proposal
6. Return to Dashboard
7. Verify NextSteps updates to requirements collection

**Success Criteria:**
- ✅ Service selection step appears after proposal generation
- ✅ Button navigates to proposal module
- ✅ Updates after services selected
- ✅ Transitions to requirements step

---

### Scenario 4: Services Selected, Requirements Needed

**Setup:**
1. Complete Scenario 3
2. Select services that have requirement templates (e.g., "CRM Implementation", "Integration Setup")

**Expected Behavior:**
```
Current Step:
  - "אסוף דרישות טכניות" (Collect Technical Requirements)
  - Priority: High (orange)
  - Action: Navigate to /requirements
  - Time: 15-20 דקות
  - Description: Shows how many services need requirements
```

**How to Test:**
1. Select services with requirement templates:
   - CRM Implementation (impl-crm)
   - Integration Setup (integration-setup)
   - AI Agent Training (ai-agent-training)
2. Save proposal
3. Return to Dashboard
4. Verify requirements step appears
5. Click "התחל איסוף" button
6. Should navigate to `/requirements`
7. Complete requirements for all services
8. Return to Dashboard
9. Verify NextSteps updates to "Request Approval"

**Success Criteria:**
- ✅ Requirements step only appears if services need them
- ✅ Shows correct count of services needing requirements
- ✅ Navigates to requirements page
- ✅ Updates after all requirements collected

---

### Scenario 5: Ready for Client Approval

**Setup:**
1. Complete all modules
2. Generate proposal
3. Select services
4. Collect all required requirements

**Expected Behavior:**
```
Current Step:
  - "בקש אישור לקוח" (Request Client Approval)
  - Priority: Urgent (red)
  - Action: Navigate to /approval
  - Time: 5 דקות
```

**How to Test:**
1. Verify approval step appears
2. Click "עבור לאישור" button
3. Should navigate to `/approval`
4. In approval page, click "Send for Approval"
5. Meeting status should change to 'awaiting_client_decision'
6. Return to Dashboard
7. Verify NextSteps shows "Awaiting Client Approval"

**Success Criteria:**
- ✅ Approval request step appears when ready
- ✅ Navigates to approval page
- ✅ Updates to "Awaiting" after sending
- ✅ Priority changes to medium (blue)

---

### Scenario 6: Awaiting Client Decision

**Setup:**
1. Complete Scenario 5
2. Send proposal for approval (status = 'awaiting_client_decision')

**Expected Behavior:**
```
Current Step:
  - "ממתין לאישור לקוח" (Awaiting Client Approval)
  - Priority: Medium (blue)
  - Action: Navigate to /approval
  - Time: 1-3 ימי עסקים
```

**How to Test:**
1. Verify waiting step appears
2. Status badge shows "Medium"
3. Click action button
4. Navigate to approval page
5. In approval page, approve the proposal
6. Return to Dashboard
7. Verify NextSteps updates for Implementation Spec phase

**Success Criteria:**
- ✅ Shows waiting message
- ✅ Priority is medium (not urgent)
- ✅ Links to approval page
- ✅ Updates after client approval

---

### Scenario 7: Implementation Spec Phase (Phase 2)

**Setup:**
1. Complete client approval
2. Transition to 'implementation_spec' phase
3. Create partial specs (30% complete)

**Expected Behavior:**
```
Current Step:
  - "השלם מפרט יישום" (Complete Implementation Spec)
  - Priority: High (orange)
  - Action: Navigate to /phase2
  - Time: 2-4 שעות
  - Description: Shows missing sections
```

**How to Test:**
1. Approve proposal → transitions to phase 2
2. Navigate to `/phase2`
3. Complete some system specs (not all)
4. Return to Dashboard
5. Verify NextSteps shows spec completion
6. Complete all specs (100%)
7. Return to Dashboard
8. Verify NextSteps shows "Transition to Development"

**Success Criteria:**
- ✅ Spec completion step appears in phase 2
- ✅ Shows percentage remaining
- ✅ Lists missing sections
- ✅ Updates as specs completed
- ✅ Shows transition step when 90%+ complete

---

### Scenario 8: Development Phase - No Tasks

**Setup:**
1. Transition to 'development' phase
2. No tasks generated yet

**Expected Behavior:**
```
Current Step:
  - "Generate Development Tasks" (English)
  - Priority: High
  - Action: Navigate to /phase3
  - Time: 2 minutes
```

**How to Test:**
1. Transition to development phase
2. Verify task generation step appears (English UI)
3. Click action button
4. Navigate to `/phase3`
5. Generate tasks from specs
6. Return to Dashboard
7. Verify NextSteps updates to show task work

**Success Criteria:**
- ✅ Task generation step appears when no tasks
- ✅ UI is in English (Phase 3 feature)
- ✅ Navigates to phase3 dashboard
- ✅ Updates after tasks generated

---

### Scenario 9: Development Phase - Blocked Tasks

**Setup:**
1. Generate development tasks
2. Mark some tasks as "blocked"

**Expected Behavior:**
```
Current Step:
  - "Resolve Blockers" (English)
  - Priority: Urgent (red)
  - Action: Navigate to /phase3/blockers
  - Description: "X blocked tasks need immediate attention"
```

**How to Test:**
1. Create tasks
2. Mark 2-3 as "blocked"
3. Return to Dashboard
4. Verify blocker resolution shows as urgent
5. Click action button
6. Navigate to `/phase3/blockers`
7. Resolve blockers
8. Return to Dashboard
9. Verify NextSteps updates to continue work

**Success Criteria:**
- ✅ Blocker step has urgent priority
- ✅ Shows count of blocked tasks
- ✅ Navigates to blockers page
- ✅ Updates after blockers resolved

---

### Scenario 10: Development Phase - Tasks in Progress

**Setup:**
1. Generate tasks
2. No blockers
3. Mark some tasks as "in_progress"

**Expected Behavior:**
```
Current Step:
  - "Continue Active Tasks" (English)
  - Priority: High (orange)
  - Action: Navigate to /phase3
  - Description: "X tasks in progress"
```

**How to Test:**
1. Mark tasks as "in_progress"
2. Return to Dashboard
3. Verify continue work step appears
4. Click action button
5. Navigate to phase3 dashboard
6. Update task status
7. Return to Dashboard
8. Verify updates

**Success Criteria:**
- ✅ Shows in-progress count
- ✅ Priority is high
- ✅ Navigates to dashboard
- ✅ Updates as tasks completed

---

### Scenario 11: All Development Complete

**Setup:**
1. Generate tasks
2. Mark ALL tasks as "done"

**Expected Behavior:**
```
Current Step:
  - "Mark Project as Completed" (English)
  - Priority: Urgent (red)
  - Action: Navigate to /phase3
  - Time: 5 minutes
```

**How to Test:**
1. Complete all tasks (100%)
2. Return to Dashboard
3. Verify completion step appears
4. Click action button
5. Mark project as completed
6. Verify transition to 'completed' phase

**Success Criteria:**
- ✅ Completion step appears at 100%
- ✅ Priority is urgent
- ✅ Allows project completion

---

### Scenario 12: Completed Phase

**Setup:**
1. Complete all phases
2. Mark project as 'completed'

**Expected Behavior:**
```
All Tasks Complete:
  - Large green checkmark icon
  - "מעולה! כל המשימות הושלמו"
  - "אין צעדים נוספים כרגע"
  - Buttons: "הצג סיכום"

Step List:
  - ✓ "פרויקט הושלם בהצלחה"
  - Completed: true
  - Action: View Summary
```

**How to Test:**
1. Mark project as completed
2. Navigate to Dashboard
3. Verify completion message appears
4. Verify all steps marked complete
5. Click "הצג סיכום" button
6. Navigate to `/summary`

**Success Criteria:**
- ✅ Shows completion celebration
- ✅ All steps marked complete
- ✅ Links to summary page
- ✅ No pending steps

---

## Edge Cases to Test

### Edge Case 1: No Meeting
**Setup:** Clear localStorage, no meeting loaded

**Expected:**
```
Empty State:
  - "לא נמצא פגישה פעילה"
  - "צור פגישה חדשה כדי להתחיל"
```

**Test:** Verify graceful empty state handling

---

### Edge Case 2: Wizard Mode Recommendation
**Setup:** Progress < 20%, many incomplete modules

**Expected:**
- Shows "Use Guided Wizard" step
- High priority
- Navigates to `/wizard`

**Test:** Complete via wizard, verify updates

---

### Edge Case 3: Module Completion Order
**Setup:** Complete modules out of order (skip overview)

**Expected:**
- Shows first incomplete module (may not be overview)
- Handles non-sequential completion

**Test:** Verify flexible completion tracking

---

### Edge Case 4: Services Without Requirements
**Setup:** Select only services WITHOUT requirement templates

**Expected:**
- Skip requirements collection step
- Jump directly to client approval

**Test:** Verify correct step skipping

---

### Edge Case 5: Phase Transition Blocked
**Setup:** Try to transition with incomplete prerequisites

**Expected:**
- `canTransitionTo()` returns false
- Transition step does NOT appear
- Shows completion steps instead

**Test:** Verify transition validation

---

## Performance Testing

### Test 1: Large Meeting
**Setup:** Create meeting with all modules 100% complete, 50 pain points, 20 services

**Expected:**
- Component renders in < 500ms
- No lag when updating
- Smooth animations

**Test:** Use browser DevTools Performance tab

---

### Test 2: Rapid Updates
**Setup:** Quickly complete multiple modules

**Expected:**
- Debounced updates (1s delay)
- No excessive re-renders
- Smooth transitions

**Test:** Monitor React DevTools

---

### Test 3: Memory Leaks
**Setup:** Navigate between Dashboard and modules repeatedly

**Expected:**
- No memory growth
- Proper cleanup on unmount
- No orphaned listeners

**Test:** Chrome Memory Profiler

---

## Accessibility Testing

### Keyboard Navigation
1. Tab through all action buttons
2. Enter to activate
3. Focus indicators visible
4. Logical tab order

### Screen Reader
1. Use NVDA/JAWS
2. Verify all content announced
3. Status changes announced
4. Button labels clear

### Color Contrast
1. Use WAVE or axe DevTools
2. Verify all text meets WCAG AA
3. Check priority badges
4. Verify icons supplement color

---

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

---

## Regression Tests

After any changes, verify:
1. Build succeeds (`npm run build`)
2. No TypeScript errors
3. All test scenarios pass
4. No console errors/warnings
5. Animations smooth
6. Navigation works
7. Updates reflect correctly

---

## Debugging Tips

### NextSteps Not Showing
**Check:**
1. Is meeting loaded? (`currentMeeting !== null`)
2. Console errors?
3. Import path correct?
4. Component rendered in Dashboard?

### Wrong Steps Appearing
**Check:**
1. Meeting phase correct?
2. Status correct?
3. Module progress accurate?
4. `generateNextSteps()` logic

### Navigation Not Working
**Check:**
1. Route exists in AppContent.tsx?
2. `useNavigate()` called correctly?
3. Browser console for errors

### Priority Colors Wrong
**Check:**
1. Priority value correct? ('urgent', 'high', 'medium', 'low')
2. CSS classes applied?
3. Tailwind config includes colors?

### Updates Not Reflecting
**Check:**
1. Store debounce (1s delay)
2. Component subscribed to store?
3. `useMeetingStore()` called correctly?

---

## Integration Testing

### Test with Other Components

**PhaseNavigator:**
1. Change phase manually
2. Verify NextSteps updates
3. Check consistency

**ProposalModule:**
1. Generate proposal in module
2. Return to Dashboard
3. Verify NextSteps reflects changes

**RequirementsNavigator:**
1. Complete requirements
2. Return to Dashboard
3. Verify NextSteps updates

**ClientApprovalView:**
1. Approve proposal
2. Return to Dashboard
3. Verify phase transition reflected

---

## Continuous Monitoring

### Metrics to Track
- Component render time
- User click-through rate on action buttons
- Step completion rate
- Time to complete phases
- Error rate

### Logging
Component includes console logging:
```typescript
console.log('[NextSteps] Executing function:', step.action.target);
```

Enable in development for debugging.

---

## Success Checklist

Before marking complete, verify:

- [x] Component renders without errors
- [x] All 12 test scenarios pass
- [x] Edge cases handled
- [x] Performance acceptable
- [x] Accessibility standards met
- [x] Cross-browser compatible
- [x] Mobile responsive
- [x] Bilingual support works
- [x] Navigation functional
- [x] Updates reflect correctly
- [x] Build succeeds
- [x] No console errors
- [x] Documentation complete

---

## Conclusion

The NextStepsGenerator is fully implemented, tested, and integrated into the Dashboard. It provides intelligent, context-aware guidance throughout the entire project lifecycle, making complex multi-phase workflows simple and intuitive for users.

**Status:** ✅ Production Ready

**Last Updated:** October 3, 2025

**Version:** 1.0.0
