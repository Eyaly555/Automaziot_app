# Fix Service Component: Auto CRM Update

## What You Need To Do

**Simple job:** Replace the current implementation with FULL TypeScript interface coverage from the codebase.

## Service Details
- **Service ID:** `auto-crm-update`
- **Service Number:** #3
- **Service Name (Hebrew):** עדכון אוטומטי ל-CRM
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** ~10%
- **Target Coverage:** 95%+ (all interface fields)

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** 254
**Search for:** `export interface AutoCRMUpdateRequirements`

**Action:** Read lines 254-350 completely. This interface defines all technical fields needed.

**Key sections:**
- `crmAccess` - CRM system credentials (Zoho/Salesforce/HubSpot specific)
- `formPlatformAccess` - Form integration setup
- `n8nWorkflow` - Workflow configuration
- `fieldMappingDocument` - Field mapping between form and CRM
- `duplicateDetection` - Duplicate prevention rules

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoCRMUpdateSpec.tsx`

**Current state:** Component already has good structure but may be missing some interface fields.

**Action:** Read the current component and compare with interface to identify missing fields.

### 3. Reference Example
**AutoApprovalWorkflowSpec.tsx** - Shows tab organization and array field management

## Implementation Instructions

```typescript
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoCRMUpdateRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2 } from 'lucide-react';

export function AutoCRMUpdateSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoCRMUpdateRequirements>({
    crmAccess: {
      system: 'zoho',
      authMethod: 'oauth',
      rateLimits: {
        daily: 0,
        batchSupported: false
      },
      targetModule: '',
      customFieldsAvailable: false,
      customFields: []
    },
    formPlatformAccess: {
      platform: '',
      webhookSupport: false,
      formFields: []
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
    fieldMappingDocument: {
      mappings: [],
      lastUpdated: new Date()
    },
    duplicateDetection: {
      enabled: false,
      strategy: '',
      checkFields: []
    }
  });

  const [activeTab, setActiveTab] = useState<'crm' | 'form' | 'mapping' | 'workflow' | 'duplicates'>('crm');

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(item => item.serviceId === 'auto-crm-update');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(item => item.serviceId !== 'auto-crm-update');

    updated.push({
      serviceId: 'auto-crm-update',
      serviceName: 'עדכון אוטומטי ל-CRM',
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
      <Card title="שירות #3: עדכון אוטומטי ל-CRM">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 ${activeTab === 'crm' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            הגדרות CRM
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 ${activeTab === 'form' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            טופס
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`px-4 py-2 ${activeTab === 'mapping' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            מיפוי שדות
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-2 ${activeTab === 'workflow' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            n8n
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-4 py-2 ${activeTab === 'duplicates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            מניעת כפילויות
          </button>
        </div>

        <div className="space-y-4">
          {/* Implement ALL fields from interface in appropriate tabs */}
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

## Key Fields to Implement

**Tab 1 - CRM Access:**
- System selection (Zoho/Salesforce/HubSpot/Pipedrive)
- Auth method (OAuth/API Key/Basic Auth)
- Conditional credential fields based on system:
  - Zoho: clientId, clientSecret, refreshToken, apiDomain, tokenExpiry
  - Salesforce: consumerKey, consumerSecret, username, password, securityToken
  - HubSpot: apiKey or privateAppToken
- Rate limits (daily, concurrent, batchSupported)
- Target module
- Custom fields array with apiName, label, type, required

**Tab 2 - Form Platform:**
- Platform name
- Webhook support checkbox
- Webhook URL if supported
- API integration (method, apiKey, endpoint)
- Form fields array with fieldName, fieldLabel, fieldType, required

**Tab 3 - Field Mapping:**
- Mappings array with:
  - formField
  - crmField
  - transformation (optional)
  - notes (optional)
- Add/remove functionality for mappings
- Last updated timestamp

**Tab 4 - n8n Workflow:**
- Instance URL
- Webhook endpoint
- HTTPS enabled checkbox
- Error handling (retryAttempts, retryDelay, alertEmail, logErrors)

**Tab 5 - Duplicate Detection:**
- Enabled checkbox
- Strategy dropdown
- Check fields array (with add/remove)

## Critical Rules

✅ Import `AutoCRMUpdateRequirements` from types file
✅ Implement ALL fields from interface
✅ Conditional rendering for system-specific credentials
✅ Array management for customFields, formFields, mappings, checkFields
✅ Use tabs to organize 50+ fields
✅ Hebrew labels

## Success Criteria

- [ ] All fields from `AutoCRMUpdateRequirements` implemented
- [ ] Conditional credential fields based on CRM system selected
- [ ] All array fields have add/remove functionality
- [ ] 5 tabs organizing the fields logically
- [ ] TypeScript compiles with 0 errors
- [ ] Data saves/loads correctly

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoCRMUpdateSpec.tsx`
