# Fix Service Component: Form to CRM Automation

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `auto-form-to-crm`
- **Service Number:** #7
- **Service Name (Hebrew):** חיבור טפסים ל-CRM
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** ~10% (6 out of 60+ fields)
- **Target Coverage:** 95%+ (60+ fields)

## Files To Read

### 1. TypeScript Interface (Defines What to Collect)
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** ~650 (search for `export interface AutoFormToCrmRequirements`)
**Action:** Read the complete interface - defines ALL technical fields needed.

**Key sections in the interface:**
- `formPlatformAccess` - Form platform integration setup
- `crmAccess` - CRM system credentials and configuration
- `fieldMapping` - Field mapping between form and CRM
- `duplicateDetection` - Duplicate prevention rules
- `dataValidation` - Validation rules
- `n8nWorkflow` - Workflow configuration
- `autoAssignment` - Auto-assignment logic

### 2. Current Component (To Replace)
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoFormToCrmSpec.tsx`

**Current problem:** Component defines custom simplified interface (lines 5-16) with only 6 fields instead of using the full 60+ field interface.

**Action:** Read the current component to understand the save/load pattern, then replace it completely.

### 3. Reference Examples (Study These First!)
**Example 1: AutoApprovalWorkflowSpec.tsx** (1,405 lines, uses tabs)
- Shows multi-tab UI organization
- Tab navigation pattern for complex forms
- Array field management with add/remove buttons

**Example 2: AutoCRMUpdateSpec.tsx** (from your previous prompts)
- Similar service (form → CRM)
- Good reference for field mapping arrays
- Conditional credential rendering

## The Implementation Pattern

```typescript
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoFormToCrmRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2 } from 'lucide-react';

export function AutoFormToCrmSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // 1. Use the FULL TypeScript interface from automationServices.ts
  const [config, setConfig] = useState<AutoFormToCrmRequirements>({
    // Initialize ALL fields from the interface with sensible defaults
    formPlatformAccess: {
      platform: '',
      webhookSupport: false,
      apiIntegration: {
        enabled: false,
        method: 'rest',
        apiKey: '',
        endpoint: ''
      },
      formFields: []
    },
    crmAccess: {
      system: 'zoho',
      authMethod: 'oauth',
      credentials: {},
      targetModule: '',
      customFieldsAvailable: false,
      customFields: []
    },
    fieldMapping: {
      mappings: [],
      lastUpdated: new Date()
    },
    duplicateDetection: {
      enabled: false,
      strategy: '',
      checkFields: []
    },
    dataValidation: {
      enabled: false,
      rules: []
    },
    n8nWorkflow: {
      instanceUrl: '',
      webhookEndpoint: '',
      httpsEnabled: false,
      errorHandling: {
        retryAttempts: 3,
        retryDelay: 1000,
        alertEmail: '',
        logErrors: true
      }
    },
    autoAssignment: {
      enabled: false,
      logic: '',
      defaultOwner: ''
    }
  });

  // 2. Tab state
  const [activeTab, setActiveTab] = useState<'form' | 'crm' | 'mapping' | 'validation' | 'workflow'>('form');

  // 3. Load existing data (defensive coding)
  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(item => item.serviceId === 'auto-form-to-crm');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // 4. Save handler (keep existing pattern)
  const handleSave = () => {
    if (!currentMeeting) return;

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(item => item.serviceId !== 'auto-form-to-crm');

    updated.push({
      serviceId: 'auto-form-to-crm',
      serviceName: 'חיבור טפסים ל-CRM',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #7: חיבור טפסים ל-CRM">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 ${activeTab === 'form' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            הגדרות טופס
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 ${activeTab === 'crm' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            הגדרות CRM
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`px-4 py-2 ${activeTab === 'mapping' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            מיפוי שדות
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-4 py-2 ${activeTab === 'validation' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            אימות נתונים
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-2 ${activeTab === 'workflow' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Workflow
          </button>
        </div>

        <div className="space-y-4">
          {/* Implement ALL fields from interface in appropriate tabs */}
          {activeTab === 'form' && (
            <div className="space-y-4">
              {/* Form platform fields */}
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="space-y-4">
              {/* CRM access fields */}
            </div>
          )}

          {activeTab === 'mapping' && (
            <div className="space-y-4">
              {/* Field mapping array with add/remove */}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-4">
              {/* Data validation rules */}
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-4">
              {/* n8n workflow and auto-assignment */}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            שמור הגדרות
          </button>
        </div>
      </Card>
    </div>
  );
}
```

## Tab Organization

Organize the 60+ fields into these 5 tabs:

1. **Tab "הגדרות טופס"** (`form`):
   - Platform selection (Wix/WordPress/Elementor/Google Forms/Typeform/Custom)
   - Webhook support checkbox
   - Webhook URL (if supported)
   - API integration (enabled, method, apiKey, endpoint)
   - Form fields array (fieldName, fieldLabel, fieldType, required) with add/remove

2. **Tab "הגדרות CRM"** (`crm`):
   - CRM system selection (Zoho/Salesforce/HubSpot/Pipedrive/Other)
   - Auth method (OAuth/API Key/Basic Auth)
   - Conditional credential fields based on system
   - Target module (e.g., "Leads", "Contacts")
   - Custom fields available checkbox
   - Custom fields array (apiName, label, type, required) with add/remove

3. **Tab "מיפוי שדות"** (`mapping`):
   - Mappings array with:
     - Form field dropdown
     - CRM field dropdown
     - Transformation (optional)
     - Notes (optional)
   - Add/remove functionality
   - Last updated timestamp (auto-filled)

4. **Tab "אימות נתונים"** (`validation`):
   - Validation enabled checkbox
   - Validation rules array with:
     - Field name
     - Rule type (required/email/phone/regex/custom)
     - Rule value
     - Error message (Hebrew)
   - Add/remove functionality
   - Duplicate detection section:
     - Enabled checkbox
     - Strategy dropdown
     - Check fields array with add/remove

5. **Tab "Workflow"** (`workflow`):
   - n8n workflow section (instance URL, webhook endpoint, HTTPS enabled)
   - Error handling (retry attempts, retry delay, alert email, log errors)
   - Auto-assignment section (enabled, logic, default owner)

## Critical Rules

✅ **DO:**
1. Import `AutoFormToCrmRequirements` from types file (NOT custom interface)
2. Use that interface type for useState
3. Create form fields for ALL 60+ fields organized in 5 tabs
4. Use Hebrew labels describing what you're collecting from client
5. Use defensive coding: `config.field?.subfield || ''`
6. Keep existing save/load pattern
7. Test: `npm run build:typecheck` should pass

❌ **DON'T:**
1. Create custom simplified interface (lines 5-16 in current file)
2. Skip any fields from the TypeScript interface
3. Use single-page form (too many fields - needs tabs)

## Success Criteria

- [ ] TypeScript compilation passes (0 errors)
- [ ] Component uses full `AutoFormToCrmRequirements` interface (NOT custom interface)
- [ ] Form has 5 tabs organizing all 60+ fields
- [ ] All nested objects handled with optional chaining (`?.`)
- [ ] Hebrew labels clearly describe what's being collected
- [ ] Data saves and loads correctly
- [ ] All array fields have add/remove functionality (formFields, customFields, mappings, validation rules)

## Output

Provide the complete rewritten component code (expected ~700-900 lines).

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoFormToCrmSpec.tsx`

---

**Start by reading the TypeScript interface completely, then implement all 60+ fields organized in tabs.**