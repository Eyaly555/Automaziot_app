# Fix Service Component: End-to-End Business Process Automation

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `auto-end-to-end`
- **Service Number:** #19
- **Service Name (Hebrew):** תהליך עסקי מלא מקצה לקצה
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** ~10% (8 out of 80+ fields)
- **Target Coverage:** 95%+ (75+ fields)

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** 4357
**Search for:** `export interface AutoEndToEndRequirements`
**Action:** Read lines 4357-4550+ completely. Complex interface with 80+ fields.

**Key sections:**
- `processDefinition` - Process name, stages, stakeholders
- `systemsInvolved` - Array of systems (CRM, ERP, Payment, etc.)
- `dataFlow` - Data flow between systems
- `approvalWorkflows` - Multi-stage approval process
- `notifications` - Email/SMS/WhatsApp notifications
- `businessRules` - Business logic and conditions
- `slaTracking` - SLA monitoring
- `n8nWorkflow` - n8n configuration
- `monitoring` - Process monitoring and alerts

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoEndToEndSpec.tsx`
**Current problem:** Simplified implementation

### 3. Reference Example
**AutoLeadWorkflowSpec.tsx** (from previous prompts) - Complex multi-stage workflow

## Tab Organization (8 tabs)

1. **הגדרת תהליך** (`process`):
   - Process name
   - Process description
   - Process stages array (stage name, duration hours, owner)
   - Stakeholders array (role, name, email, permissions)

2. **מערכות מעורבות** (`systems`):
   - Systems involved array:
     - System name
     - Type (CRM/ERP/Payment/Inventory/etc.)
     - Role in process
     - Auth method and credentials
     - API endpoints
   - Add/remove systems

3. **זרימת נתונים** (`dataFlow`):
   - Data flow steps array:
     - Step number
     - Source system
     - Target system
     - Data type
     - Transformation required
     - Validation rules
   - Add/remove steps

4. **תהליכי אישור** (`approvals`):
   - Approval workflows array:
     - Stage name
     - Approver role
     - Approver email
     - Timeout hours
     - Auto-approve conditions
     - Escalation path
   - Add/remove approval stages

5. **התראות** (`notifications`):
   - Email notifications:
     - Enabled checkbox
     - Provider
     - Templates array (stage, recipient, subject, body)
   - SMS notifications:
     - Enabled checkbox
     - Provider
     - Templates array
   - WhatsApp notifications:
     - Enabled checkbox
     - Provider
     - Templates array

6. **כללים עסקיים** (`businessRules`):
   - Business rules array:
     - Rule name
     - Condition (if/then)
     - Action
     - Priority
   - Add/remove rules

7. **מעקב SLA** (`sla`):
   - SLA tracking enabled checkbox
   - SLA definitions array:
     - Stage name
     - Target hours
     - Warning threshold (%)
     - Escalation email
   - Alert on breach checkbox

8. **n8n וניטור** (`monitoring`):
   - n8n workflow config
   - Monitoring enabled checkbox
   - Metrics to track (completion rate, avg duration, error rate)
   - Dashboard URL
   - Alert webhooks

## Success Criteria

- [ ] All 80+ fields from interface implemented
- [ ] 8 tabs organizing fields logically
- [ ] Complex arrays (process stages, systems, data flow, approvals, business rules, SLAs)
- [ ] Multi-channel notifications (email/SMS/WhatsApp)
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoEndToEndSpec.tsx`

**Expected size:** ~1,200-1,400 lines
