# Phase 2 Service Requirements - Refactoring Quick Reference Guide

This guide provides copy-paste ready code snippets for fixing the most common template violations found in the component audit.

---

## Table of Contents

1. [Add Missing JSDoc Header](#1-add-missing-jsdoc-header)
2. [Replace Inline Interface with Type Import](#2-replace-inline-interface-with-type-import)
3. [Change from Partial<> to Full Interface](#3-change-from-partial-to-full-interface)
4. [Add Validation Function](#4-add-validation-function)
5. [Add try/catch to handleSave](#5-add-trycatch-to-handlesave)
6. [Add Loading State](#6-add-loading-state)
7. [Add Defensive Data Loading](#7-add-defensive-data-loading)
8. [Ensure Card Component Usage](#8-ensure-card-component-usage)
9. [Fix updateMeeting Call](#9-fix-updatemeeting-call)
10. [Complete Example Transformation](#10-complete-example-transformation)

---

## 1. Add Missing JSDoc Header

### BEFORE
```typescript
export function AutoSmsWhatsappSpec() {
  // component code
}
```

### AFTER
```typescript
/**
 * Service #2: SMS/WhatsApp אוטומטיים
 * Automated SMS and WhatsApp messaging for new leads
 *
 * @component
 * @category Automations
 */
export function AutoSmsWhatsappSpec() {
  // component code
}
```

### Template
```typescript
/**
 * Service #[NUMBER]: [Hebrew Service Name]
 * [Brief English description of what this service does]
 *
 * @component
 * @category [Automations|AIAgents|Integrations|SystemImplementations|AdditionalServices]
 */
export function [ServiceName]Spec() {
```

---

## 2. Replace Inline Interface with Type Import

### BEFORE
```typescript
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoSmsWhatsappConfig {
  messagingPlatform: 'whatsapp_business_api' | 'twilio' | 'vonage';
  crmSystem: 'zoho' | 'salesforce' | 'hubspot';
  phoneNumberVerified: boolean;
  // ... more fields
}

export function AutoSmsWhatsappSpec() {
  const [config, setConfig] = useState<AutoSmsWhatsappConfig>({
```

### AFTER
```typescript
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoSmsWhatsappRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';

export function AutoSmsWhatsappSpec() {
  const [config, setConfig] = useState<AutoSmsWhatsappRequirements>({
```

### Steps
1. Remove inline interface definition
2. Add type import from appropriate type file:
   - Automations → `automationServices.ts`
   - AI Agents → `aiAgentServices.ts`
   - Integrations → `integrationServices.ts`
   - System Implementations → `systemImplementationServices.ts`
   - Additional Services → `additionalServices.ts`
3. Use imported type name with `Requirements` suffix

---

## 3. Change from Partial<> to Full Interface

### BEFORE
```typescript
const [config, setConfig] = useState<Partial<AutoSmsWhatsappRequirements>>({
  messagingPlatform: 'whatsapp_business_api',
  crmSystem: 'zoho',
});
```

### AFTER
```typescript
const [config, setConfig] = useState<AutoSmsWhatsappRequirements>({
  messagingPlatform: 'whatsapp_business_api',
  crmSystem: 'zoho',
  phoneNumberVerified: false,
  apiCredentialsReady: false,
  webhookSupport: true,
  messageTemplatesApproved: false,
  consentManagement: true,
  optOutMechanism: true,
  deliveryReportsEnabled: true
});
```

### Steps
1. Remove `Partial<>` wrapper
2. Initialize ALL required fields from the interface
3. Use sensible defaults:
   - Booleans: `false` or `true` (based on common case)
   - Strings: `''` (empty string)
   - Numbers: `0`
   - Arrays: `[]`
   - Objects: `{}` (or specific defaults)

---

## 4. Add Validation Function

### BEFORE
```typescript
const handleSave = () => {
  if (!currentMeeting) return;
  // save logic
};
```

### AFTER
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!config.platform) {
    newErrors.platform = 'יש לבחור פלטפורמה';
  }

  if (!config.subscriptionTier) {
    newErrors.tier = 'יש לבחור רמת מנוי';
  }

  if (config.userCount < 1) {
    newErrors.users = 'יש להזין מספר משתמשים';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSave = async () => {
  if (!validateForm()) {
    alert('נא למלא את כל השדות הנדרשים');
    return;
  }

  if (!currentMeeting) return;
  // save logic
};
```

### Template
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  // Add validation rules for each required field
  if (!config.requiredField) {
    newErrors.requiredField = 'Hebrew error message';
  }

  if (config.numericField < 1) {
    newErrors.numericField = 'Hebrew validation message';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Display Errors in JSX
```typescript
<input
  type="text"
  value={config.platform || ''}
  onChange={(e) => setConfig({ ...config, platform: e.target.value })}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
/>
{errors.platform && (
  <p className="text-red-500 text-sm mt-1">{errors.platform}</p>
)}
```

---

## 5. Add try/catch to handleSave

### BEFORE
```typescript
const handleSave = () => {
  if (!currentMeeting) return;

  const automations = currentMeeting?.implementationSpec?.automations || [];
  const updated = automations.filter(a => a.serviceId !== 'auto-sms-whatsapp');

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
```

### AFTER
```typescript
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  if (!validateForm()) {
    alert('נא למלא את כל השדות הנדרשים');
    return;
  }

  if (!currentMeeting) return;

  setIsSaving(true);
  try {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(a => a.serviceId !== 'auto-sms-whatsapp');

    updated.push({
      serviceId: 'auto-sms-whatsapp',
      serviceName: 'SMS/WhatsApp אוטומטי ללידים',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    await updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });

    alert('הגדרות נשמרו בהצלחה!');
  } catch (error) {
    console.error('Error saving auto-sms-whatsapp config:', error);
    alert('שגיאה בשמירת הגדרות');
  } finally {
    setIsSaving(false);
  }
};
```

### Key Changes
1. Add `isSaving` state
2. Make handler `async`
3. Wrap in try/catch/finally
4. Set `isSaving` to true at start
5. Set `isSaving` to false in finally
6. Add success and error alerts
7. Log errors to console

---

## 6. Add Loading State

### BEFORE
```typescript
<button
  onClick={handleSave}
  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  שמור הגדרות
</button>
```

### AFTER
```typescript
<button
  onClick={handleSave}
  disabled={isSaving}
  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
>
  {isSaving ? 'שומר...' : 'שמור הגדרות'}
</button>
```

### With Spinner (Advanced)
```typescript
import { Loader } from 'lucide-react';

<button
  onClick={handleSave}
  disabled={isSaving}
  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
>
  {isSaving && <Loader className="w-4 h-4 animate-spin" />}
  {isSaving ? 'שומר...' : 'שמור הגדרות'}
</button>
```

---

## 7. Add Defensive Data Loading

### BEFORE
```typescript
useEffect(() => {
  const automations = currentMeeting?.implementationSpec?.automations || [];
  const existing = automations.find(a => a.serviceId === 'auto-sms-whatsapp');
  if (existing?.requirements) {
    setConfig(existing.requirements);
  }
}, [currentMeeting]);
```

### AFTER
```typescript
useEffect(() => {
  const category = currentMeeting?.implementationSpec?.automations;
  const existing = Array.isArray(category)
    ? category.find(item => item.serviceId === 'auto-sms-whatsapp')
    : undefined;

  if (existing?.requirements) {
    setConfig(existing.requirements);
  }
}, [currentMeeting]);
```

### Key Changes
1. Store category reference separately
2. Use `Array.isArray()` check before `find()`
3. Return `undefined` if not array
4. Only set config if requirements exist

### Category Names by Service Type
```typescript
// Automations (Services 1-20)
const category = currentMeeting?.implementationSpec?.automations;

// AI Agents (Services 21-30)
const category = currentMeeting?.implementationSpec?.aiAgentServices;

// Integrations (Services 31-40)
const category = currentMeeting?.implementationSpec?.integrationServices;

// System Implementations (Services 41-49)
const category = currentMeeting?.implementationSpec?.systemImplementations;

// Additional Services (Services 50-59)
const category = currentMeeting?.implementationSpec?.additionalServices;
```

---

## 8. Ensure Card Component Usage

### BEFORE (Header outside Card)
```typescript
return (
  <div className="space-y-6 p-8" dir="rtl">
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">שירות #1: מענה אוטומטי</h2>
      <p className="text-gray-600 mt-2">הגדרת מענה אוטומטי ללידים</p>
    </div>

    <Card className="p-6">
      {/* form fields */}
    </Card>
  </div>
);
```

### AFTER (Proper Card usage)
```typescript
return (
  <div className="space-y-6 p-8" dir="rtl">
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">שירות #1: מענה אוטומטי</h2>
        <p className="text-gray-600 mt-2">הגדרת מענה אוטומטי ללידים</p>
      </div>

      <div className="space-y-6">
        {/* form fields */}
      </div>

      <div className="flex justify-end pt-4 border-t mt-6">
        <button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'שומר...' : 'שמור הגדרות'}
        </button>
      </div>
    </Card>
  </div>
);
```

### Alternative: Card with Title Prop
```typescript
<Card title="שירות #1: מענה אוטומטי ללידים">
  <div className="space-y-4">
    {/* form fields */}
  </div>

  <div className="flex justify-end pt-4 border-t">
    <button onClick={handleSave}>שמור הגדרות</button>
  </div>
</Card>
```

---

## 9. Fix updateMeeting Call

### IMPORTANT NOTE
The `updateMeeting` function signature is:
```typescript
updateMeeting: (updates: Partial<Meeting>) => void;
```

It does **NOT** take a meetingId parameter. It automatically updates the current meeting.

### CORRECT USAGE
```typescript
updateMeeting({
  implementationSpec: {
    ...currentMeeting.implementationSpec,
    automations: updated
  }
});
```

### WRONG (Don't do this)
```typescript
// ❌ This is INCORRECT - updateMeeting doesn't take an ID
updateMeeting(currentMeeting.id, {
  implementationSpec: {
    ...currentMeeting.implementationSpec,
    automations: updated
  }
});
```

---

## 10. Complete Example Transformation

### BEFORE (Non-compliant component)
```typescript
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoSmsWhatsappConfig {
  messagingPlatform: 'whatsapp_business_api' | 'twilio';
  crmSystem: 'zoho' | 'salesforce';
  phoneNumberVerified: boolean;
}

export function AutoSmsWhatsappSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<Partial<AutoSmsWhatsappConfig>>({
    messagingPlatform: 'whatsapp_business_api',
    crmSystem: 'zoho',
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-sms-whatsapp');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(a => a.serviceId !== 'auto-sms-whatsapp');

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
        <div className="space-y-4">
          <div>
            <label>פלטפורמת הודעות</label>
            <select
              value={config.messagingPlatform}
              onChange={(e) => setConfig({ ...config, messagingPlatform: e.target.value as any })}
            >
              <option value="whatsapp_business_api">WhatsApp Business API</option>
              <option value="twilio">Twilio</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave}>
              שמור הגדרות
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### AFTER (Fully compliant component)
```typescript
/**
 * Service #2: SMS/WhatsApp אוטומטיים
 * Automated SMS and WhatsApp messaging for new leads
 *
 * @component
 * @category Automations
 */
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoSmsWhatsappRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';

export function AutoSmsWhatsappSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // State initialization with full interface
  const [config, setConfig] = useState<AutoSmsWhatsappRequirements>({
    messagingPlatform: 'whatsapp_business_api',
    crmSystem: 'zoho',
    phoneNumberVerified: false,
    apiCredentialsReady: false,
    webhookSupport: true,
    messageTemplatesApproved: false,
    consentManagement: true,
    optOutMechanism: true,
    deliveryReportsEnabled: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Defensive data loading
  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.automations;
    const existing = Array.isArray(category)
      ? category.find(item => item.serviceId === 'auto-sms-whatsapp')
      : undefined;

    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.messagingPlatform) {
      newErrors.platform = 'יש לבחור פלטפורמת הודעות';
    }

    if (!config.crmSystem) {
      newErrors.crm = 'יש לבחור מערכת CRM';
    }

    if (!config.phoneNumberVerified) {
      newErrors.phone = 'יש לאמת מספר טלפון';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler with error handling
  const handleSave = async () => {
    if (!validateForm()) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    if (!currentMeeting) return;

    setIsSaving(true);
    try {
      const category = currentMeeting?.implementationSpec?.automations || [];
      const updated = category.filter(item => item.serviceId !== 'auto-sms-whatsapp');

      updated.push({
        serviceId: 'auto-sms-whatsapp',
        serviceName: 'SMS/WhatsApp אוטומטי ללידים',
        requirements: config,
        completedAt: new Date().toISOString()
      });

      await updateMeeting({
        implementationSpec: {
          ...currentMeeting.implementationSpec,
          automations: updated
        }
      });

      alert('הגדרות נשמרו בהצלחה!');
    } catch (error) {
      console.error('Error saving auto-sms-whatsapp config:', error);
      alert('שגיאה בשמירת הגדרות');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          שירות #2: SMS/WhatsApp אוטומטיים
        </h2>
        <p className="text-gray-600 mt-2">
          שליחת הודעות SMS ו-WhatsApp אוטומטיות ללידים חדשים
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Messaging Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              פלטפורמת הודעות <span className="text-red-500">*</span>
            </label>
            <select
              value={config.messagingPlatform || ''}
              onChange={(e) => setConfig({
                ...config,
                messagingPlatform: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">בחר פלטפורמה</option>
              <option value="whatsapp_business_api">WhatsApp Business API</option>
              <option value="twilio">Twilio</option>
              <option value="vonage">Vonage (Nexmo)</option>
              <option value="clicksend">ClickSend</option>
              <option value="other">אחר</option>
            </select>
            {errors.platform && (
              <p className="text-red-500 text-sm mt-1">{errors.platform}</p>
            )}
          </div>

          {/* CRM System */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מערכת CRM <span className="text-red-500">*</span>
            </label>
            <select
              value={config.crmSystem || ''}
              onChange={(e) => setConfig({
                ...config,
                crmSystem: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">בחר מערכת</option>
              <option value="zoho">Zoho CRM</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
              <option value="pipedrive">Pipedrive</option>
              <option value="other">אחר</option>
            </select>
            {errors.crm && (
              <p className="text-red-500 text-sm mt-1">{errors.crm}</p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.phoneNumberVerified || false}
                onChange={(e) => setConfig({
                  ...config,
                  phoneNumberVerified: e.target.checked
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">מספר טלפון מאומת</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.apiCredentialsReady || false}
                onChange={(e) => setConfig({
                  ...config,
                  apiCredentialsReady: e.target.checked
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">אישורי API מוכנים</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.webhookSupport || false}
                onChange={(e) => setConfig({
                  ...config,
                  webhookSupport: e.target.checked
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">תמיכה ב-Webhook</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.messageTemplatesApproved || false}
                onChange={(e) => setConfig({
                  ...config,
                  messageTemplatesApproved: e.target.checked
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">תבניות הודעות מאושרות</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.consentManagement || false}
                onChange={(e) => setConfig({
                  ...config,
                  consentManagement: e.target.checked
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">ניהול הסכמות</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.optOutMechanism || false}
                onChange={(e) => setConfig({
                  ...config,
                  optOutMechanism: e.target.checked
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">מנגנון הסרה מרשימה</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.deliveryReportsEnabled || false}
                onChange={(e) => setConfig({
                  ...config,
                  deliveryReportsEnabled: e.target.checked
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">דוחות משלוח מופעלים</span>
            </label>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'שומר...' : 'שמור הגדרות'}
        </button>
      </div>
    </div>
  );
}
```

### Summary of Changes
1. ✅ Added JSDoc header with service number and category
2. ✅ Replaced inline interface with type import
3. ✅ Changed from `Partial<>` to full interface initialization
4. ✅ Added all required fields with sensible defaults
5. ✅ Added `errors` and `isSaving` state
6. ✅ Implemented validation function
7. ✅ Added try/catch/finally to handleSave
8. ✅ Added loading state to button
9. ✅ Improved defensive data loading with Array.isArray
10. ✅ Enhanced UI with better spacing and error display
11. ✅ Added proper Hebrew labels with required field markers
12. ✅ Improved accessibility and UX

---

## Quick Checklist for Review

Use this checklist when reviewing or refactoring components:

### Imports
- [ ] `useState`, `useEffect` from React
- [ ] `useMeetingStore` from store
- [ ] Type import from appropriate type file (not inline)
- [ ] `Card` component from Common

### Component Header
- [ ] JSDoc comment with service number
- [ ] Service name in Hebrew
- [ ] Brief English description
- [ ] `@component` tag
- [ ] `@category` tag with correct category

### State Management
- [ ] Full interface initialization (not `Partial<>`)
- [ ] All required fields with defaults
- [ ] `errors` state declared
- [ ] `isSaving` state declared

### Data Loading
- [ ] useEffect present
- [ ] Defensive optional chaining (`?.`)
- [ ] Array.isArray check
- [ ] Proper category name

### Validation
- [ ] Separate `validateForm()` function
- [ ] Returns boolean
- [ ] Sets errors state
- [ ] Hebrew error messages

### Save Handler
- [ ] `async` function
- [ ] Calls validation first
- [ ] Checks for currentMeeting
- [ ] try/catch/finally block
- [ ] Sets isSaving states
- [ ] Defensive filter-then-push
- [ ] Correct updateMeeting signature
- [ ] User feedback (alerts)

### UI
- [ ] `dir="rtl"` on container
- [ ] Card component wrapper
- [ ] Hebrew labels
- [ ] Required field markers (`*`)
- [ ] Error message display
- [ ] Loading state on button
- [ ] Disabled state on button when saving

### Code Quality
- [ ] No `any` types (except select values)
- [ ] Immutable state updates
- [ ] Consistent spacing
- [ ] Proper TypeScript types

---

## Need Help?

**Reference Component**: `ImplCrmSpec.tsx` (Service #41)
- Location: `src/components/Phase2/ServiceRequirements/SystemImplementations/ImplCrmSpec.tsx`
- This component has 98% compliance and follows all best practices

**Type Files Locations**:
- Automations: `src/types/automationServices.ts`
- AI Agents: `src/types/aiAgentServices.ts`
- Integrations: `src/types/integrationServices.ts`
- System Implementations: `src/types/systemImplementationServices.ts`
- Additional Services: `src/types/additionalServices.ts`

**Documentation**:
- Full Audit Report: `PHASE2_COMPONENT_AUDIT_REPORT.md`
- Implementation Plan: `PHASE2_IMPLEMENTATION_PLAN.md`
- Service Guide: `PHASE2_SERVICE_REQUIREMENTS_GUIDE.md`

---

*Guide Version: 1.0*
*Last Updated: 2025-10-09*
