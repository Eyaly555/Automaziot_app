# Fix Service Component: Lead Workflow Automation

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `auto-lead-workflow`
- **Service Number:** #10
- **Service Name (Hebrew):** workflow מלא לניהול לידים
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** ~8% (6 out of 80+ fields)
- **Target Coverage:** 95%+ (75+ fields)

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** 2316
**Search for:** `export interface AutoLeadWorkflowRequirements`
**Action:** Read lines 2316-2450+ completely. This is a complex interface with 75+ fields.

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoLeadWorkflowSpec.tsx`
**Current problem:** Simplified interface with only 6 fields

### 3. Reference Example
**AutoApprovalWorkflowSpec.tsx** - Complex workflow with nested arrays

## Tab Organization (7 tabs)

1. **CRM** - System access and lead stages
2. **חלוקת לידים** - Sales team roster and assignment logic
3. **אימייל** - Email provider and templates
4. **SMS/WhatsApp** - Messaging integration
5. **אינטגרציות נוספות** - Calendar, tasks, lead enrichment
6. **שלבי Workflow** - Workflow stages with automation actions
7. **n8n** - Workflow configuration

## Success Criteria

- [ ] All 75+ fields from interface implemented
- [ ] 7 tabs organizing fields logically
- [ ] Complex nested arrays (salesTeamRoster, workflowStages)
- [ ] Optional sections toggle properly
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoLeadWorkflowSpec.tsx`

**Expected size:** ~1,200-1,400 lines
