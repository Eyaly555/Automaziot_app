# Fix Service Component: Data Sync Between Systems

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `auto-data-sync`
- **Service Number:** #14
- **Service Name (Hebrew):** סנכרון נתונים בין מערכות
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** ~10% (8 out of 85+ fields)
- **Target Coverage:** 95%+ (80+ fields)

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** 3574
**Search for:** `export interface AutoDataSyncRequirements`
**Action:** Read lines 3574-3750+ completely. This interface defines ALL 85+ technical fields.

**Key sections:**
- `systemA` - First system configuration (15+ fields)
- `systemB` - Second system configuration (15+ fields)
- `syncConfig` - Sync configuration (direction, frequency, batch size)
- `fieldMapping` - Field mappings with transformations (complex array)
- `conflictResolution` - Conflict handling strategy
- `changeTracking` - Change detection method
- `syncStateDatabase` - Sync state tracking database
- `errorHandling` - Error handling and notifications
- `n8nWorkflow` - n8n configuration

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoDataSyncSpec.tsx`
**Current problem:** Simplified implementation missing most fields

### 3. Reference Example
**AutoSystemSyncSpec.tsx** (from previous prompts) - Similar bi-directional sync service

## Tab Organization (6 tabs)

1. **מערכת A** (`systemA`):
   - System name, type (CRM/ERP/Ecommerce/Database/Custom)
   - Auth method and credentials
   - API endpoints (read, write, webhook)
   - Rate limits (per minute, per day)

2. **מערכת B** (`systemB`):
   - Same structure as System A

3. **הגדרות סנכרון** (`sync`):
   - Direction (one_way_a_to_b/one_way_b_to_a/bi_directional)
   - Frequency (real_time/every_5min/every_15min/hourly/daily)
   - Batch size (for bulk syncs)

4. **מיפוי שדות** (`mapping`):
   - Mappings array:
     - System A field
     - System B field
     - Data type (string/number/date/boolean/object/array)
     - Transformation (format/calculate/lookup/custom)
     - Formula (if transformation)
     - Bidirectional checkbox
   - Master data source (system_a/system_b/timestamp_based)
   - Add/remove mappings

5. **ניהול קונפליקטים** (`conflicts`):
   - Conflict resolution strategy (master_wins/newest_wins/manual_review/custom_logic)
   - Custom logic (JavaScript function)
   - Notify on conflict checkbox
   - Conflict notification email
   - Change tracking method (timestamp/version_number/hash/webhook)
   - Timestamp field, version field
   - Webhook support for system A and B

6. **מסד נתונים וטיפול בשגיאות** (`database`):
   - Sync state database:
     - Enabled checkbox
     - Provider (postgres/mysql/mongodb/supabase/firebase)
     - Connection string
     - Table name
     - Schema fields
   - Error handling:
     - Max retries
     - Retry delay
     - Notification email
     - Slack webhook
   - n8n workflow configuration

## Success Criteria

- [ ] All 85+ fields from interface implemented
- [ ] 6 tabs organizing fields logically
- [ ] Both systemA and systemB have identical field structures
- [ ] Complex field mapping array with transformations
- [ ] Conflict resolution and change tracking fully implemented
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoDataSyncSpec.tsx`

**Expected size:** ~1,000-1,200 lines
