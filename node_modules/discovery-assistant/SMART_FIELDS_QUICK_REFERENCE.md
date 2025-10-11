# Smart Fields - Quick Reference Card

## 🚀 Quick Start (30 seconds)

### 1. Check if Field Exists
```bash
grep -i "your_field" src/config/fieldRegistry.ts
```

### 2. Use Smart Field
```tsx
import { useSmartField } from '../../../../hooks/useSmartField';

const crmSystem = useSmartField({
  fieldId: 'crm_system',
  localPath: 'crmSystem',
  serviceId: 'your-service-id'
});
```

### 3. Render with Widget
```tsx
import { SmartFieldWidget } from '../../../Common/FormFields/SmartFieldWidget';

<SmartFieldWidget
  smartField={crmSystem}
  fieldType="select"
  options={[...]}
/>
```

### 4. Save
```tsx
const completeConfig = {
  ...config,
  crmSystem: crmSystem.value
};
```

## 📋 Available Fields (Quick List)

### Business Fields
- `company_industry` - Auto-filled from Phase 1
- `company_size` - Auto-filled from Phase 1  
- `company_website` - Auto-filled from Phase 1
- `monthly_lead_volume` - Auto-filled from Phase 1
- `current_response_time` - Auto-filled from Phase 1

### CRM Fields
- `crm_system` - Auto-filled from Phase 1 ⭐
- `crm_auth_method` - Manual entry
- `crm_module` - Manual entry

### Email Fields
- `email_provider` - Auto-synced across services ⭐
- `email_daily_limit` - Manual entry
- `smtp_host` - Auto-synced
- `smtp_port` - Auto-synced
- `alert_email` - Auto-filled from Phase 1 contact ⭐

### Integration Fields
- `form_platform` - Auto-filled from lead sources ⭐
- `form_webhook_capability` - Manual entry
- `whatsapp_api_provider` - Auto-synced ⭐
- `whatsapp_phone_number` - Auto-filled from Phase 1
- `calendar_system` - Auto-synced ⭐
- `sync_frequency` - Manual entry

### n8n Fields
- `n8n_instance_url` - Auto-synced across ALL services ⭐⭐⭐
- `n8n_webhook_endpoint` - Per-service (unique)
- `retry_attempts` - Auto-synced ⭐

### AI Fields
- `ai_agent_department` - Auto-filled from Phase 1
- `ai_model_preference` - Manual entry

### Other Fields
- `business_hours_start` - Auto-filled from Phase 1
- `business_hours_end` - Auto-filled from Phase 1
- `primary_lead_source` - Auto-filled from Phase 1
- `default_assignee` - Manual entry
- `duplicate_detection_field` - Manual entry

⭐ = High value (auto-fills from Phase 1)  
⭐⭐⭐ = Critical (used by 5+ services)

## 🎨 UI Patterns

### Pattern 1: Simple Smart Field
```tsx
<SmartFieldWidget smartField={crmSystem} fieldType="select" options={[...]} />
```

### Pattern 2: With Custom Styling
```tsx
<div>
  <label>{crmSystem.metadata.label.he}</label>
  {crmSystem.isAutoPopulated && <Badge>Auto-filled</Badge>}
  <select value={crmSystem.value} onChange={(e) => crmSystem.setValue(e.target.value)} />
</div>
```

### Pattern 3: Business Context Display
```tsx
const businessContext = extractBusinessContext(currentMeeting);

<div className="p-4 bg-blue-50 rounded-lg">
  <h4>📊 Business Context</h4>
  <div>CRM: {businessContext.crmSystem}</div>
  <div>Leads: {businessContext.monthlyLeadVolume}/month</div>
</div>
```

## ⚡ Common Use Cases

### Use Case 1: CRM Integration Service

```tsx
const crmSystem = useSmartField({ fieldId: 'crm_system', ... });
const crmAuthMethod = useSmartField({ fieldId: 'crm_auth_method', ... });
const crmModule = useSmartField({ fieldId: 'crm_module', ... });
```

### Use Case 2: Email Automation Service

```tsx
const emailProvider = useSmartField({ fieldId: 'email_provider', ... });
const emailDailyLimit = useSmartField({ fieldId: 'email_daily_limit', ... });
const alertEmail = useSmartField({ fieldId: 'alert_email', ... });
```

### Use Case 3: WhatsApp Service

```tsx
const whatsappProvider = useSmartField({ fieldId: 'whatsapp_api_provider', ... });
const whatsappPhone = useSmartField({ fieldId: 'whatsapp_phone_number', ... });
```

### Use Case 4: n8n Workflow Service

```tsx
const n8nInstance = useSmartField({ fieldId: 'n8n_instance_url', ... });
const webhookEndpoint = useSmartField({ fieldId: 'n8n_webhook_endpoint', ... });
const retryAttempts = useSmartField({ fieldId: 'retry_attempts', ... });
const alertEmail = useSmartField({ fieldId: 'alert_email', ... });
```

## 🔧 Troubleshooting

### Issue: Field Not Auto-Filling

**Check:**
1. Field exists in registry? `getFieldById('your_field')`
2. `autoPopulate: true` in registry?
3. Phase 1 data exists? `console.log(currentMeeting.modules.overview.crmName)`
4. Path correct? Match exact structure

**Debug:**
```tsx
const result = prePopulateField(currentMeeting, 'crm_system');
console.log(result); // Check populated, value, confidence
```

### Issue: Conflict Warning

**Cause:** Different values in different locations

**Fix:**
1. Review all shown values
2. Choose correct one
3. Edit field (will update all if `syncBidirectional: true`)

### Issue: TypeScript Error

**Common Fixes:**
```tsx
// ❌ Wrong type
const crmSystem = useSmartField<number>({ ... })

// ✅ Correct type
const crmSystem = useSmartField<string>({ ... })
```

## 📚 Examples

### Full Component Example

See: `src/components/Phase2/ServiceRequirements/Automations/AutoFormToCrmSpec.tsx`

### Smart Field Hook Example

See: `src/hooks/useSmartField.ts` (documentation at top)

### Field Registry Example

See: `src/config/fieldRegistry.ts` (check `crm_system` definition)

## 💡 Tips

1. **Always check registry first** - Don't reinvent fields
2. **Use SmartFieldWidget** - Consistent UX for free
3. **Show business context** - Helps users understand
4. **Add to registry if shared** - Field used by 2+ services? Add it!
5. **Test auto-fill** - Create meeting with Phase 1 data and verify

## 🎯 Goals

- [ ] 70%+ auto-fill rate
- [ ] Zero duplicate questions
- [ ] Green badges on all auto-filled fields
- [ ] Complete business context display
- [ ] Detailed developer instructions

---

**Keep this card handy while migrating components!** 📌

Last Updated: October 9, 2025




