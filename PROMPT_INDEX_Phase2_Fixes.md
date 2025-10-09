# Phase 2 Service Component Fix Prompts - Index

## Overview

This directory contains individualized prompts for fixing incomplete Phase 2 service requirement components. Each prompt is designed to be used in a separate Claude Code chat session.

**Current Status:** 6 critical services identified with ~10-15% field coverage
**Target:** 95%+ field coverage for all services
**Estimated Time Per Service:** 1-2 hours per component (depending on complexity)

---

## Critical Priority Services (Fix These First)

These 6 services have the lowest field coverage and are most critical for production:

| # | Service | File | Coverage | Fields Missing | Time Est | Prompt File |
|---|---------|------|----------|----------------|----------|-------------|
| 1 | **SMS/WhatsApp Automation** | AutoSmsWhatsappSpec.tsx | 14% | ~56 fields | 2 hours | [PROMPT_FIX_AutoSmsWhatsappSpec.md](PROMPT_FIX_AutoSmsWhatsappSpec.md) |
| 2 | **CRM Update** | AutoCRMUpdateSpec.tsx | 10% | ~60 fields | 2 hours | [PROMPT_FIX_AutoCRMUpdateSpec.md](PROMPT_FIX_AutoCRMUpdateSpec.md) |
| 3 | **Notifications** | AutoNotificationsSpec.tsx | 8% | ~75 fields | 2.5 hours | [PROMPT_FIX_AutoNotificationsSpec.md](PROMPT_FIX_AutoNotificationsSpec.md) |
| 4 | **Email Templates** | AutoEmailTemplatesSpec.tsx | 8% | ~80 fields | 2.5 hours | [PROMPT_FIX_AutoEmailTemplatesSpec.md](PROMPT_FIX_AutoEmailTemplatesSpec.md) |
| 5 | **Multi-System Integration** | AutoMultiSystemSpec.tsx | 7% | ~85 fields | 3 hours | [PROMPT_FIX_AutoMultiSystemSpec.md](PROMPT_FIX_AutoMultiSystemSpec.md) |
| 6 | **System Sync** | AutoSystemSyncSpec.tsx | 8% | ~75 fields | 2.5 hours | [PROMPT_FIX_AutoSystemSyncSpec.md](PROMPT_FIX_AutoSystemSyncSpec.md) |

**Total for Critical Services:** ~14.5 hours

---

## How to Use These Prompts

### Step 1: Choose a Service
Start with Service #1 (SMS/WhatsApp) and work sequentially through the list.

### Step 2: Open New Claude Code Chat
**IMPORTANT:** Use a separate chat session for each service. This prevents context mixing and ensures focused implementation.

### Step 3: Copy-Paste the Prompt
Open the prompt file (e.g., `PROMPT_FIX_AutoSmsWhatsappSpec.md`) and copy the entire contents into the new chat.

### Step 4: Let Claude Implement
Claude will:
1. Read the TypeScript interface completely
2. Read the current component
3. Study reference examples
4. Implement ALL fields from the interface
5. Organize in tabs if complex (20+ fields)
6. Add array management for dynamic fields
7. Test TypeScript compilation

### Step 5: Review and Test
1. Check TypeScript compilation: `npm run build:typecheck`
2. Start dev server: `npm run dev`
3. Navigate to the service in Phase 2
4. Test all form fields
5. Save and verify data persists
6. Check localStorage in browser DevTools

### Step 6: Commit
```bash
git add discovery-assistant/src/components/Phase2/ServiceRequirements/[Category]/[ComponentName].tsx
git commit -m "Phase 2: Complete [ServiceName] implementation

- Implemented full [InterfaceName]Requirements interface
- Field coverage: X% → 95%+
- Added [N] tabs for organization
- All array fields with add/remove functionality
- TypeScript compilation passes (0 errors)"
```

### Step 7: Move to Next Service
Repeat steps 1-6 for the next service in the priority list.

---

## Validation After Each Fix

After implementing each service, verify:

✅ **TypeScript Compilation**
```bash
npm run build:typecheck
# Should show 0 errors
```

✅ **Field Coverage**
- Open the TypeScript interface file
- Count total fields in interface
- Count implemented form fields in component
- Coverage = (implemented / total) × 100%
- Target: 95%+

✅ **Data Flow**
- Fill out all fields in the form
- Click save
- Refresh page
- Verify data loads correctly
- Check `localStorage` in DevTools
- Look for `implementationSpec.[category]` array
- Find entry with matching `serviceId`

✅ **No Console Errors**
- Open browser DevTools (F12)
- Check Console tab for errors
- Should be clean (no red errors)

---

## Expected Results

### Per Service
- **Before:** 8-14% field coverage, ~10 fields collected
- **After:** 95%+ field coverage, 60-85 fields collected
- **File Size:** 300-1,200 lines (depending on complexity)
- **Tabs:** 4-10 tabs for complex services
- **Arrays:** All dynamic fields with add/remove buttons

### Overall Impact
- **Services Fixed:** 6 critical services
- **Total Fields Added:** ~400+ new fields
- **Data Collection Completeness:** 10% → 95%+
- **Production Readiness:** Sufficient specs for implementation

---

## Troubleshooting

### TypeScript Error: "Type X is not assignable to type Y"
**Cause:** Component state doesn't match interface structure
**Fix:** Ensure `useState<InterfaceName>` uses the exact interface from types file

### Save Not Working
**Cause:** Service ID mismatch or wrong category
**Fix:** Verify `serviceId` in handleSave matches mapping in `serviceComponentMapping.ts`

### Data Not Loading After Refresh
**Cause:** localStorage not persisting or wrong category
**Fix:** Check `useMeetingStore` is calling `updateMeeting` correctly

### Tab Navigation Not Working
**Cause:** State variable type doesn't include all tab names
**Fix:** Ensure `activeTab` state includes all tab string literals

---

## Progress Tracking

Track your progress as you complete each service:

- [ ] **Service #1:** AutoSmsWhatsappSpec _(2 hours)_
- [ ] **Service #2:** AutoCRMUpdateSpec _(2 hours)_
- [ ] **Service #3:** AutoNotificationsSpec _(2.5 hours)_
- [ ] **Service #4:** AutoEmailTemplatesSpec _(2.5 hours)_
- [ ] **Service #5:** AutoMultiSystemSpec _(3 hours)_
- [ ] **Service #6:** AutoSystemSyncSpec _(2.5 hours)_

**Total Estimated Time:** 14.5 hours
**Actual Time Spent:** ___ hours

---

## What About Other Services?

The 6 services listed above are **critical priority** with the worst field coverage.

**Other services may need fixes too**, but they likely have better coverage (30-50% already implemented). After completing these 6, you can:

1. **Run the audit again** to identify next batch of incomplete services
2. **Create additional prompts** using the same template structure
3. **Fix them incrementally** based on business priority

---

## Success Criteria (When Done)

After fixing all 6 services, you should have:

✅ All 6 components using full TypeScript interfaces (no custom simplified interfaces)
✅ All 6 components with 95%+ field coverage
✅ All 6 components organized with tabs (4-10 tabs each)
✅ All array fields with add/remove functionality
✅ TypeScript compilation passes with 0 errors
✅ All data flows work (save/load/persist)
✅ All components follow defensive coding patterns
✅ All UI in Hebrew with clear labels
✅ 6 clean git commits documenting each fix

**Result:** Internal team can now collect complete technical specifications from clients before development starts.

---

## Questions?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the reference components (AutoApprovalWorkflowSpec, AILeadQualifierSpec)
3. Verify the TypeScript interface structure in types file
4. Check CLAUDE.md for Phase 2 architecture details

**Good luck! Start with Service #1 (SMS/WhatsApp) and work your way down the list.**
