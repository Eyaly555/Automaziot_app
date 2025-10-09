# Fix Service Component: Auto Notifications

## What You Need To Do

**Simple job:** Replace the current implementation with FULL TypeScript interface coverage.

## Service Details
- **Service ID:** `auto-notifications`
- **Service Number:** #9
- **Service Name (Hebrew):** התראות אוטומטיות
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** ~8%
- **Target Coverage:** 95%+

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** 2742
**Search for:** `export interface AutoNotificationsRequirements`

**Action:** Read lines 2742-2918 completely.

**Key sections (75+ fields total):**
- `triggerEvents` - Array of event triggers
- `notificationChannels` - Multi-channel setup (email, SMS, push, Slack, Teams, WhatsApp)
- `recipientRules` - Who gets notified and when
- `notificationTemplates` - Template array for each channel
- `deliverySettings` - Timing, batching, rate limiting
- `priorityRules` - Priority-based routing
- `escalation` - Escalation workflow
- `trackingAndAnalytics` - Delivery tracking
- `n8nWorkflow` - Workflow integration

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoNotificationsSpec.tsx`

**Current problem:** Likely using simplified interface instead of comprehensive 75+ field structure.

### 3. Reference Example
**AutoApprovalWorkflowSpec.tsx** - Multi-tab UI with arrays

## Implementation Structure

```typescript
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoNotificationsRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2 } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function AutoNotificationsSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoNotificationsRequirements>({
    triggerEvents: [],
    notificationChannels: {
      email: { enabled: false, provider: 'sendgrid', templates: [] },
      sms: { enabled: false, provider: 'twilio', templates: [] },
      pushNotification: { enabled: false, provider: 'firebase', templates: [] },
      slack: { enabled: false, webhookUrl: '', templates: [] },
      microsoftTeams: { enabled: false, webhookUrl: '', templates: [] },
      whatsapp: { enabled: false, provider: 'twilio', templates: [] }
    },
    recipientRules: {
      staticRecipients: [],
      dynamicRules: [],
      escalationChain: []
    },
    notificationTemplates: [],
    deliverySettings: {
      immediateDelivery: true,
      scheduledDelivery: false,
      batchingEnabled: false,
      rateLimiting: { enabled: false }
    },
    priorityRules: {
      usePriority: false,
      levels: []
    },
    escalation: {
      enabled: false,
      rules: []
    },
    trackingAndAnalytics: {
      deliveryTracking: true,
      openTracking: false,
      clickTracking: false,
      responseTracking: false
    },
    n8nWorkflow: {
      instanceUrl: '',
      webhookEndpoint: '',
      httpsEnabled: false,
      errorHandling: {
        retryAttempts: 3,
        alertEmail: '',
        logErrors: true
      }
    }
  });

  const [activeTab, setActiveTab] = useState<'triggers' | 'channels' | 'recipients' | 'templates' | 'delivery' | 'priority' | 'escalation' | 'tracking' | 'workflow'>('triggers');

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(item => item.serviceId === 'auto-notifications');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(item => item.serviceId !== 'auto-notifications');

    updated.push({
      serviceId: 'auto-notifications',
      serviceName: 'התראות אוטומטיות',
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

  // Helper functions for array management
  const addTriggerEvent = () => {
    setConfig({
      ...config,
      triggerEvents: [
        ...(config.triggerEvents || []),
        {
          eventId: generateId(),
          eventName: '',
          eventType: 'system',
          conditions: [],
          channelsToUse: []
        }
      ]
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #9: התראות אוטומטיות">
        {/* 9 Tabs for organizing 75+ fields */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('triggers')} className={`px-4 py-2 ${activeTab === 'triggers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            טריגרים
          </button>
          <button onClick={() => setActiveTab('channels')} className={`px-4 py-2 ${activeTab === 'channels' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            ערוצי תקשורת
          </button>
          <button onClick={() => setActiveTab('recipients')} className={`px-4 py-2 ${activeTab === 'recipients' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            נמענים
          </button>
          <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 ${activeTab === 'templates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            תבניות
          </button>
          <button onClick={() => setActiveTab('delivery')} className={`px-4 py-2 ${activeTab === 'delivery' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            הגדרות שליחה
          </button>
          <button onClick={() => setActiveTab('priority')} className={`px-4 py-2 ${activeTab === 'priority' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            עדיפויות
          </button>
          <button onClick={() => setActiveTab('escalation')} className={`px-4 py-2 ${activeTab === 'escalation' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            הסלמה
          </button>
          <button onClick={() => setActiveTab('tracking')} className={`px-4 py-2 ${activeTab === 'tracking' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            מעקב
          </button>
          <button onClick={() => setActiveTab('workflow')} className={`px-4 py-2 ${activeTab === 'workflow' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            n8n
          </button>
        </div>

        <div className="space-y-4">
          {/* Implement ALL fields in appropriate tabs */}
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

## Tab Organization (75+ fields)

**Tab 1 - Triggers:** `triggerEvents` array
**Tab 2 - Channels:** Email, SMS, Push, Slack, Teams, WhatsApp configs
**Tab 3 - Recipients:** Static recipients, dynamic rules, escalation chain
**Tab 4 - Templates:** Notification templates array
**Tab 5 - Delivery:** Timing, batching, rate limiting
**Tab 6 - Priority:** Priority levels and routing
**Tab 7 - Escalation:** Escalation rules array
**Tab 8 - Tracking:** Delivery, open, click, response tracking
**Tab 9 - Workflow:** n8n integration

## Array Fields Requiring Add/Remove

- `triggerEvents` array
- `notificationChannels.email.templates` array
- `notificationChannels.sms.templates` array
- `recipientRules.staticRecipients` array
- `recipientRules.dynamicRules` array
- `recipientRules.escalationChain` array
- `notificationTemplates` array
- `priorityRules.levels` array
- `escalation.rules` array

## Success Criteria

- [ ] All 75+ fields from interface implemented
- [ ] 9 tabs organizing fields
- [ ] All array fields have add/remove functionality
- [ ] Each notification channel fully configured
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoNotificationsSpec.tsx`
