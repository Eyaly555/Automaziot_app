# Smart Fields Migration Guide

## Quick Start - Migrating a Service Component to Smart Fields

### Before You Start

1. Read `INTELLIGENT_DATA_FLOW_GUIDE.md` for system overview
2. Check `fieldRegistry.ts` for available fields
3. Look at examples: `AutoFormToCrmSpec.tsx`, `AutoLeadResponseSpec.tsx`

### 5-Step Migration Process

#### Step 1: Identify Fields That Can Be Smart

**Open your service component**, for example `AutoCRMUpdateSpec.tsx`

Look for fields that might already exist in Phase 1:
- CRM system name
- Email provider
- Form platform
- Calendar system
- WhatsApp provider
- n8n instance URL
- Alert email
- Business hours
- Lead volume

**Check the registry:**
```bash
grep -i "crm_system" src/config/fieldRegistry.ts
```

If field exists in registry → **Use smart field!**  
If not → **Consider adding to registry** if used by 2+ services

#### Step 2: Import Required Dependencies

Add to top of your component:

```tsx
import { useSmartField } from '../../../../hooks/useSmartField';
import { SmartFieldWidget } from '../../../Common/FormFields/SmartFieldWidget';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { extractBusinessContext } from '../../../../utils/fieldMapper';
```

#### Step 3: Replace useState with useSmartField

**Before:**
```tsx
const [config, setConfig] = useState<YourConfigType>({
  crmSystem: 'zoho',
  emailProvider: '',
  // ... other fields
});
```

**After:**
```tsx
// Smart fields
const crmSystem = useSmartField<string>({
  fieldId: 'crm_system',
  localPath: 'crmSystem',
  serviceId: 'your-service-id',
  autoSave: false
});

const emailProvider = useSmartField<string>({
  fieldId: 'email_provider',
  localPath: 'emailProvider',
  serviceId: 'your-service-id',
  autoSave: false
});

// Regular state for non-registry fields
const [config, setConfig] = useState({
  // ... other fields not in registry
});
```

#### Step 4: Add Business Context Display (Optional but Recommended)

```tsx
// Get business context from Phase 1
const businessContext = currentMeeting ? extractBusinessContext(currentMeeting) : {};

// In JSX, add after title:
{businessContext.monthlyLeadVolume && (
  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h4 className="font-semibold text-blue-900 mb-2">📊 הקשר עסקי (מתוך שלב 1)</h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <span className="text-gray-600">נפח לידים:</span>
        <div className="font-semibold text-blue-900">
          {businessContext.monthlyLeadVolume}/חודש
        </div>
      </div>
      <div>
        <span className="text-gray-600">מערכת CRM:</span>
        <div className="font-semibold text-blue-900">
          {businessContext.crmSystem}
        </div>
      </div>
    </div>
  </div>
)}
```

#### Step 5: Update Field Rendering

**Before:**
```tsx
<div>
  <label>מערכת CRM</label>
  <select 
    value={config.crmSystem} 
    onChange={(e) => setConfig({...config, crmSystem: e.target.value})}
  >
    <option value="zoho">Zoho</option>
    <option value="salesforce">Salesforce</option>
  </select>
</div>
```

**After (Option A - Use SmartFieldWidget):**
```tsx
<SmartFieldWidget
  smartField={crmSystem}
  fieldType="select"
  options={[
    { value: 'zoho', label: 'Zoho CRM' },
    { value: 'salesforce', label: 'Salesforce' }
  ]}
/>
```

**After (Option B - Manual rendering with indicators):**
```tsx
<div>
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700">
      {crmSystem.metadata.label.he}
    </label>
    {crmSystem.isAutoPopulated && (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
        <CheckCircle className="w-3 h-3" />
        מולא אוטומטית
      </span>
    )}
  </div>
  <select 
    value={crmSystem.value || ''} 
    onChange={(e) => crmSystem.setValue(e.target.value)}
    className={crmSystem.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'}
  >
    <option value="zoho">Zoho</option>
    <option value="salesforce">Salesforce</option>
  </select>
  {crmSystem.isAutoPopulated && crmSystem.source && (
    <p className="text-xs text-gray-500 mt-1">
      מקור: {crmSystem.source.description}
    </p>
  )}
</div>
```

#### Step 6: Update Save Handler

**Before:**
```tsx
const handleSave = () => {
  updated.push({
    serviceId: 'your-service-id',
    requirements: config,
    completedAt: new Date().toISOString()
  });
};
```

**After:**
```tsx
const handleSave = () => {
  // Merge smart field values into config
  const completeConfig = {
    ...config,
    crmSystem: crmSystem.value,
    emailProvider: emailProvider.value,
    // ... other smart fields
  };

  updated.push({
    serviceId: 'your-service-id',
    serviceName: 'Your Service Name',
    serviceNameHe: 'שם השירות',
    category: 'lead_management', // or appropriate category
    requirements: completeConfig,
    completedAt: new Date().toISOString()
  });
};
```

### Complete Example

```tsx
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { SmartFieldWidget } from '../../../Common/FormFields/SmartFieldWidget';
import { extractBusinessContext } from '../../../../utils/fieldMapper';
import { Card } from '../../../Common/Card';
import { CheckCircle, Info } from 'lucide-react';

interface YourServiceConfig {
  // Fields NOT in registry
  customField1: string;
  customField2: number;
}

export function YourServiceSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields (from registry)
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'your-service-id',
    autoSave: false
  });

  const emailProvider = useSmartField<string>({
    fieldId: 'email_provider',
    localPath: 'emailProvider',
    serviceId: 'your-service-id',
    autoSave: false
  });

  // Regular state for non-registry fields
  const [config, setConfig] = useState<YourServiceConfig>({
    customField1: '',
    customField2: 0
  });

  // Business context from Phase 1
  const businessContext = currentMeeting ? extractBusinessContext(currentMeeting) : {};

  const handleSave = () => {
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value,
      emailProvider: emailProvider.value
    };

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter((a: any) => a.serviceId !== 'your-service-id');

    updated.push({
      serviceId: 'your-service-id',
      serviceName: 'Your Service',
      serviceNameHe: 'השירות שלך',
      category: 'lead_management',
      requirements: completeConfig,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated
      }
    });

    alert('✅ נשמר בהצלחה!');
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">שירות: השירות שלך</h2>
        
        {/* Business Context */}
        {businessContext.crmSystem && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📊 הקשר עסקי</h4>
            <div className="text-sm">
              <div>CRM: {businessContext.crmSystem}</div>
              <div>לידים: {businessContext.monthlyLeadVolume}/חודש</div>
            </div>
          </div>
        )}
      </div>

      {/* Smart Fields Info */}
      {(crmSystem.isAutoPopulated || emailProvider.isAutoPopulated) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="font-semibold text-green-900 mb-1">✨ שדות מולאו אוטומטית</h4>
            <p className="text-sm text-green-800">
              חלק מהשדות מולאו אוטומטית משלב 1 - חיסכון בזמן!
            </p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <Card>
        <div className="space-y-6">
          {/* Smart Fields */}
          <SmartFieldWidget
            smartField={crmSystem}
            fieldType="select"
            options={[
              { value: 'zoho', label: 'Zoho CRM' },
              { value: 'salesforce', label: 'Salesforce' }
            ]}
          />

          <SmartFieldWidget
            smartField={emailProvider}
            fieldType="select"
            options={[
              { value: 'sendgrid', label: 'SendGrid' },
              { value: 'mailgun', label: 'Mailgun' }
            ]}
          />

          {/* Regular fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Field 1
            </label>
            <input
              value={config.customField1}
              onChange={(e) => setConfig({...config, customField1: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              שמור הגדרות
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

## Priority List (Generated from Field Registry)

Run this in browser console to see which services to prioritize:

```javascript
import { logFieldAnalysis } from './utils/fieldAnalyzer';
logFieldAnalysis();
```

## Common Fields to Look For

When migrating a component, look for these common patterns:

### CRM Fields
- CRM system name → `crm_system`
- CRM authentication → `crm_auth_method`
- CRM module → `crm_module`

### Email Fields
- Email provider → `email_provider`
- Daily limit → `email_daily_limit`
- SMTP host → `smtp_host`
- SMTP port → `smtp_port`
- Alert email → `alert_email`

### Integration Fields
- WhatsApp provider → `whatsapp_api_provider`
- Calendar system → `calendar_system`
- Form platform → `form_platform`
- Sync frequency → `sync_frequency`

### n8n Fields
- Instance URL → `n8n_instance_url`
- Webhook endpoint → `n8n_webhook_endpoint`
- Retry attempts → `retry_attempts`

### Business Context Fields
- Industry → `company_industry`
- Company size → `company_size`
- Website → `company_website`
- Lead volume → `monthly_lead_volume`
- Response time → `current_response_time`

## Adding a New Field to Registry

**When to add:**
- Field is used by 2+ services
- Field should be consistent across services
- Field can be collected in Phase 1

**Template:**
```typescript
your_new_field: {
  id: 'your_new_field',
  label: { he: 'שדה חדש', en: 'New Field' },
  type: 'text',
  category: 'business', // or technical, integration, etc.
  collectedIn: ['phase2'],
  usedBy: ['service-a', 'service-b'],
  primarySource: {
    path: 'modules.overview.yourField',
    phase: 'phase1',
    description: 'Your field from Overview'
  },
  secondarySources: [],
  autoPopulate: true,
  syncBidirectional: true,
  required: false,
  importance: 'medium'
}
```

## Testing Your Migration

### Test Checklist

1. **Auto-Population Test**
   - Create a meeting with Phase 1 data
   - Fill Overview module with CRM system, email, etc.
   - Go to your migrated service component
   - ✓ Verify fields auto-fill
   - ✓ Verify green badges appear
   - ✓ Verify source info shows

2. **Edit Test**
   - Edit an auto-filled field
   - Save the form
   - ✓ Verify value saves correctly
   - ✓ If `syncBidirectional: true`, check Phase 1 updated too

3. **Conflict Test**
   - Create conflict (different CRM in Phase 1 vs manual entry)
   - ✓ Verify orange conflict warning appears
   - ✓ Verify all conflicting values shown

4. **Validation Test**
   - Enter invalid data (e.g., bad email format)
   - ✓ Verify error message shows
   - ✓ Verify can't save invalid data

## Common Pitfalls

### Pitfall 1: Incorrect localPath

**Problem:**
```tsx
const crmSystem = useSmartField({
  fieldId: 'crm_system',
  localPath: 'crm',  // ❌ Wrong - doesn't match requirements structure
  serviceId: 'auto-form-to-crm'
});
```

**Solution:**
```tsx
const crmSystem = useSmartField({
  fieldId: 'crm_system',
  localPath: 'crmAccess.system',  // ✅ Correct - matches nested structure
  serviceId: 'auto-form-to-crm'
});
```

### Pitfall 2: Forgetting to Merge Smart Fields in Save

**Problem:**
```tsx
const handleSave = () => {
  updated.push({
    requirements: config  // ❌ Missing smart field values!
  });
};
```

**Solution:**
```tsx
const handleSave = () => {
  const completeConfig = {
    ...config,
    crmSystem: crmSystem.value,      // ✅ Include smart field values
    emailProvider: emailProvider.value
  };
  
  updated.push({
    requirements: completeConfig  // ✅ Complete with all values
  });
};
```

### Pitfall 3: Wrong Field Type

**Problem:**
```tsx
const crmSystem = useSmartField<number>({  // ❌ CRM system is string, not number
  fieldId: 'crm_system',
  ...
});
```

**Solution:**
```tsx
const crmSystem = useSmartField<string>({  // ✅ Correct type
  fieldId: 'crm_system',
  ...
});
```

## Remaining Work

### Critical Priority (15 services - 5+ auto-fill fields each)

These services will benefit MOST from smart fields:

1. `AutoCRMUpdateSpec.tsx` - CRM, auth, retry, alert
2. `AutoDataSyncSpec.tsx` - Source system, target, frequency, retry
3. `AutoNotificationsSpec.tsx` - Email, WhatsApp, CRM
4. `AutoSystemSyncSpec.tsx` - Multiple systems, auth, frequency
5. `AutoMultiSystemSpec.tsx` - Multiple systems and integrations
6. `AutoLeadWorkflowSpec.tsx` - CRM, email, routing
7. `AutoServiceWorkflowSpec.tsx` - CRM, ticketing, notifications
8. `AIFullIntegrationSpec.tsx` - CRM, email, calendar, knowledge base
9. `AIComplexWorkflowSpec.tsx` - Multiple integrations
10. `IntComplexSpec.tsx` - Source, target, auth, frequency
11. `IntCrmMarketingSpec.tsx` - CRM, marketing automation
12. `IntCrmAccountingSpec.tsx` - CRM, accounting system
13. `IntCrmSupportSpec.tsx` - CRM, support system
14. `ImplCrmSpec.tsx` - CRM platform, modules, users
15. `WhatsappApiSetupSpec.tsx` - Provider, phone, authentication

**Estimated:** 7.5 hours (30min each)  
**Time Savings:** ~75 minutes per client meeting

### High Priority (20 services - 3-4 auto-fill fields each)

**Estimated:** 10 hours (30min each)  
**Time Savings:** ~40 minutes per client meeting

### Medium Priority (28 services - 1-2 auto-fill fields each)

**Estimated:** 14 hours (30min each)  
**Time Savings:** ~20 minutes per client meeting

### Total Remaining Work

- **Services:** 63 components
- **Estimated Time:** 31.5 hours
- **Benefit:** ~135 minutes saved PER client meeting
- **ROI:** Break-even after ~14 client meetings

## Pro Tips

### Tip 1: Batch Similar Services

Migrate services with similar fields together:
- All CRM services together (share CRM fields)
- All email services together (share email fields)
- All WhatsApp services together

### Tip 2: Test as You Go

Don't migrate all 63 at once. Migrate 3-5, test thoroughly, then continue.

### Tip 3: Use SmartFieldWidget

Don't reinvent the UI - use `SmartFieldWidget` component for consistent UX.

### Tip 4: Add to Registry Liberally

If you see a field in 2+ services, add it to the registry. Better to have too many than too few.

### Tip 5: Document as You Go

When you add a field to registry, add good descriptions:
- `businessContext`: Why this field matters
- `technicalContext`: How it's used technically

## Validation

After migrating a component:

1. ✓ No TypeScript errors
2. ✓ Component renders without errors
3. ✓ Auto-population works
4. ✓ Badges show correctly
5. ✓ Save works (values persist)
6. ✓ Business context displays (if applicable)

## Questions?

- Check `INTELLIGENT_DATA_FLOW_GUIDE.md`
- Look at examples: `AutoFormToCrmSpec.tsx`, `AutoLeadResponseSpec.tsx`
- Review field registry: `src/config/fieldRegistry.ts`
- Check types: `src/types/fieldRegistry.ts`

---

**Happy Migrating! 🚀**

Remember: Each component you migrate makes the system better for everyone!

