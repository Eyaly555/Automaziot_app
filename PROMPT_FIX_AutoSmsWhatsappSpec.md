# Fix Service Component: SMS/WhatsApp Automation

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `auto-sms-whatsapp`
- **Service Number:** #2
- **Service Name (Hebrew):** SMS/WhatsApp אוטומטי ללידים
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** 14% (9 out of 65 fields)
- **Target Coverage:** 95%+ (60+ fields)

## Files To Read

### 1. TypeScript Interface (Defines What to Collect)
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** 1747
**Search for:** `export interface AutoSmsWhatsappRequirements`

**Action:** Read lines 1747-1834 completely. This interface defines ALL 65 technical fields you need to collect from the client.

**Key sections in the interface:**
- `metaBusinessAccess` - WhatsApp Business API setup (15+ fields)
- `twilioAccess` - Alternative Twilio integration (12+ fields)
- `messageTemplates` - Template management (8+ fields)
- `crmAccess` - CRM integration (8+ fields)
- `n8nWorkflow` - Workflow configuration (7+ fields)
- `prerequisites` - Setup checklist (6 boolean fields)

### 2. Current Component (To Replace)
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoSmsWhatsappSpec.tsx`

**Current problem:** Component defines custom simplified interface (lines 5-15) with only 9 fields instead of using the full 65-field interface.

**Action:** Read the current component to understand the save/load pattern, then replace it completely.

### 3. Reference Examples (Study These First!)
**If interface is complex (30+ fields), look at these for UI organization patterns:**

**Example 1: AutoApprovalWorkflowSpec.tsx** (1,405 lines, uses tabs)
- Shows multi-tab UI organization
- Tab navigation pattern for complex forms
- Array field management with add/remove buttons

**Example 2: AILeadQualifierSpec.tsx** (1,082 lines, uses tabs)
- Shows nested object state management
- Conditional field rendering
- Proper defensive coding patterns

## The Implementation Pattern

```typescript
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoSmsWhatsappRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2 } from 'lucide-react';

export function AutoSmsWhatsappSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // 1. Use the FULL TypeScript interface from automationServices.ts
  const [config, setConfig] = useState<AutoSmsWhatsappRequirements>({
    // Initialize ALL fields from the interface with sensible defaults
    metaBusinessAccess: {
      businessAccountId: '',
      businessVerificationStatus: 'pending',
      verificationDuration: '3-7 days',
      phoneNumberId: '',
      phoneNumber: '',
      wabaId: '',
      accessToken: '',
      webhookSetup: {
        verificationToken: '',
        callbackUrl: '',
        eventsSubscribed: []
      }
    },
    twilioAccess: {
      accountSid: '',
      authToken: '',
      phoneNumber: '',
      whatsappSandbox: false,
      smsEnabled: false,
      whatsappEnabled: false,
      rateLimits: {
        smsPerHour: 0,
        whatsappPerDay: 0
      },
      pricing: {
        smsPerMessage: 0,
        whatsappPerMessage: 0
      }
    },
    messageTemplates: {
      templatesCreated: false,
      templateApprovalStatus: 'pending',
      approvalTimeline: '24-72 hours',
      templateGuidelines: {
        noLinks: true,
        noPricing: true,
        variablesLimit: 0,
        characterLimit: 0
      }
    },
    crmAccess: {
      system: '',
      authMethod: 'oauth',
      credentials: {},
      phoneNumberField: '',
      phoneNumberFormat: 'international'
    },
    n8nWorkflow: {
      instanceUrl: '',
      webhookEndpoint: '',
      httpsEnabled: false,
      whatsappIntegration: false,
      twilioIntegration: false,
      errorHandling: {
        retryAttempts: 3,
        alertEmail: '',
        logErrors: true
      }
    },
    prerequisites: {
      dedicatedPhoneNumber: false,
      businessVerification: false,
      metaBusinessAccount: false,
      messageTemplatesReady: false,
      optInMechanismReady: false,
      internationalPhoneFormat: false
    }
  });

  // 2. Tab state (this is a complex form with 65 fields - needs tabs)
  const [activeTab, setActiveTab] = useState<'meta' | 'twilio' | 'templates' | 'crm' | 'n8n' | 'prerequisites'>('meta');

  // 3. Load existing data (defensive coding)
  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(item => item.serviceId === 'auto-sms-whatsapp');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // 4. Save handler (keep existing pattern)
  const handleSave = () => {
    if (!currentMeeting) return;

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(item => item.serviceId !== 'auto-sms-whatsapp');

    updated.push({
      serviceId: 'auto-sms-whatsapp',
      serviceName: 'SMS/WhatsApp אוטומטי ללידים',
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
      <Card title="שירות #2: SMS/WhatsApp אוטומטיים">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('meta')}
            className={`px-4 py-2 ${activeTab === 'meta' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            WhatsApp Business API
          </button>
          <button
            onClick={() => setActiveTab('twilio')}
            className={`px-4 py-2 ${activeTab === 'twilio' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Twilio
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 ${activeTab === 'templates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            תבניות הודעות
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 ${activeTab === 'crm' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            אינטגרציית CRM
          </button>
          <button
            onClick={() => setActiveTab('n8n')}
            className={`px-4 py-2 ${activeTab === 'n8n' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            n8n
          </button>
          <button
            onClick={() => setActiveTab('prerequisites')}
            className={`px-4 py-2 ${activeTab === 'prerequisites' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            דרישות מקדימות
          </button>
        </div>

        <div className="space-y-4">
          {/* Tab Content - Create form fields for EVERY field in each section */}
          {activeTab === 'meta' && (
            <div className="space-y-4">
              {/* Meta Business Access fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מזהה חשבון עסקי (Business Account ID)
                </label>
                <input
                  type="text"
                  value={config.metaBusinessAccess?.businessAccountId || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessAccess: {
                      ...config.metaBusinessAccess!,
                      businessAccountId: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="לדוגמה: 123456789"
                />
              </div>

              {/* Add ALL other metaBusinessAccess fields */}
              {/* ... continue for all fields ... */}
            </div>
          )}

          {/* Implement all other tabs similarly */}
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

## Field Patterns (Copy-Paste)

**Text input:**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    [Hebrew Label - e.g., "מספר טלפון"]
  </label>
  <input
    type="text"
    value={config.metaBusinessAccess?.phoneNumber || ''}
    onChange={(e) => setConfig({
      ...config,
      metaBusinessAccess: {
        ...config.metaBusinessAccess!,
        phoneNumber: e.target.value
      }
    })}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
    placeholder="לדוגמה: +972501234567"
  />
</div>
```

**Select dropdown:**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    סטטוס אימות עסקי
  </label>
  <select
    value={config.metaBusinessAccess?.businessVerificationStatus}
    onChange={(e) => setConfig({
      ...config,
      metaBusinessAccess: {
        ...config.metaBusinessAccess!,
        businessVerificationStatus: e.target.value as any
      }
    })}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  >
    <option value="pending">ממתין לאישור</option>
    <option value="verified">מאומת</option>
    <option value="rejected">נדחה</option>
  </select>
</div>
```

**Checkbox:**
```tsx
<label className="flex items-center">
  <input
    type="checkbox"
    checked={config.prerequisites?.dedicatedPhoneNumber || false}
    onChange={(e) => setConfig({
      ...config,
      prerequisites: {
        ...config.prerequisites!,
        dedicatedPhoneNumber: e.target.checked
      }
    })}
    className="mr-2"
  />
  <span className="text-sm">מספר טלפון ייעודי (לא בשימוש באפליקציית WhatsApp)</span>
</label>
```

**Number input:**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    מגבלת תווים לתבנית
  </label>
  <input
    type="number"
    value={config.messageTemplates?.templateGuidelines.characterLimit || 0}
    onChange={(e) => setConfig({
      ...config,
      messageTemplates: {
        ...config.messageTemplates!,
        templateGuidelines: {
          ...config.messageTemplates!.templateGuidelines,
          characterLimit: parseInt(e.target.value) || 0
        }
      }
    })}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
    min="0"
  />
</div>
```

**Array field (for eventsSubscribed):**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    אירועים נרשמים (Events Subscribed)
  </label>
  {config.metaBusinessAccess?.webhookSetup.eventsSubscribed?.map((event, index) => (
    <div key={index} className="flex gap-2 items-center mb-2">
      <input
        value={event}
        onChange={(e) => {
          const updated = [...(config.metaBusinessAccess?.webhookSetup.eventsSubscribed || [])];
          updated[index] = e.target.value;
          setConfig({
            ...config,
            metaBusinessAccess: {
              ...config.metaBusinessAccess!,
              webhookSetup: {
                ...config.metaBusinessAccess!.webhookSetup,
                eventsSubscribed: updated
              }
            }
          });
        }}
        className="flex-1 px-3 py-2 border rounded-md"
        placeholder="לדוגמה: messages"
      />
      <button
        onClick={() => {
          const updated = config.metaBusinessAccess?.webhookSetup.eventsSubscribed?.filter((_, i) => i !== index) || [];
          setConfig({
            ...config,
            metaBusinessAccess: {
              ...config.metaBusinessAccess!,
              webhookSetup: {
                ...config.metaBusinessAccess!.webhookSetup,
                eventsSubscribed: updated
              }
            }
          });
        }}
        className="p-2 text-red-600 hover:bg-red-50 rounded"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  ))}
  <button
    onClick={() => {
      setConfig({
        ...config,
        metaBusinessAccess: {
          ...config.metaBusinessAccess!,
          webhookSetup: {
            ...config.metaBusinessAccess!.webhookSetup,
            eventsSubscribed: [...(config.metaBusinessAccess?.webhookSetup.eventsSubscribed || []), '']
          }
        }
      });
    }}
    className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded"
  >
    <Plus className="w-4 h-4" />
    <span>הוסף אירוע</span>
  </button>
</div>
```

## Critical Rules

✅ **DO:**
1. Import `AutoSmsWhatsappRequirements` from types file (NOT custom interface)
2. Use that interface type for useState
3. Create form fields for ALL 65 fields organized in 6 tabs
4. Use Hebrew labels describing what you're collecting from client
5. Use defensive coding: `config.field?.subfield || ''`
6. Keep existing save/load pattern
7. Test: `npm run build:typecheck` should pass

❌ **DON'T:**
1. Create custom simplified interface (lines 5-15 in current file)
2. Skip any fields from the TypeScript interface
3. Use single-page form (too many fields - needs tabs)

## Tab Organization

Organize the 65 fields into these 6 tabs:

1. **Tab "WhatsApp Business API"** (`meta`):
   - All fields from `metaBusinessAccess` (15 fields)

2. **Tab "Twilio"** (`twilio`):
   - All fields from `twilioAccess` (12 fields)

3. **Tab "תבניות הודעות"** (`templates`):
   - All fields from `messageTemplates` (8 fields)

4. **Tab "אינטגרציית CRM"** (`crm`):
   - All fields from `crmAccess` (8 fields)

5. **Tab "n8n"** (`n8n`):
   - All fields from `n8nWorkflow` (7 fields)

6. **Tab "דרישות מקדימות"** (`prerequisites`):
   - All fields from `prerequisites` (6 checkboxes)

## Success Criteria

- [ ] TypeScript compilation passes (0 errors)
- [ ] Component uses full `AutoSmsWhatsappRequirements` interface (NOT custom interface)
- [ ] Form has 6 tabs organizing all 65 fields
- [ ] All nested objects handled with optional chaining (`?.`)
- [ ] Hebrew labels clearly describe what's being collected
- [ ] Data saves and loads correctly
- [ ] Array field (eventsSubscribed) has add/remove functionality

## Output

Provide the complete rewritten component code (expected ~800-1,000 lines).

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoSmsWhatsappSpec.tsx`

---

**Start by reading the TypeScript interface completely (lines 1747-1834), then implement all 65 fields organized in tabs.**
