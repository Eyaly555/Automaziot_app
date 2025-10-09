# Fix Service Component: Auto Email Templates

## What You Need To Do

**Simple job:** Replace the current implementation with FULL TypeScript interface coverage.

## Service Details
- **Service ID:** `auto-email-templates`
- **Service Number:** #20
- **Service Name (Hebrew):** ניהול תבניות Email אוטומטיות
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** ~8%
- **Target Coverage:** 95%+

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** 574
**Search for:** `export interface AutoEmailTemplatesRequirements`

**Action:** Read lines 574-686 completely (~80 fields).

**Key sections:**
- `emailServiceAccess` - Email provider credentials (SendGrid/Mailgun/SMTP)
- `domainConfiguration` - DNS setup (SPF, DKIM, DMARC)
- `templateLibrary` - Template array with metadata
- `designSystem` - Branding and design config
- `dynamicContent` - Personalization variables
- `testingAndPreview` - Testing environment
- `deliverySettings` - Sending configuration
- `complianceSettings` - GDPR, CAN-SPAM compliance
- `analytics` - Tracking and metrics
- `n8nWorkflow` - Workflow integration

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoEmailTemplatesSpec.tsx`

**Current problem:** Using simplified interface instead of comprehensive 80-field structure.

### 3. Reference Example
**AutoApprovalWorkflowSpec.tsx** - Multi-tab organization

## Implementation Structure

```typescript
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoEmailTemplatesRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2 } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function AutoEmailTemplatesSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoEmailTemplatesRequirements>({
    emailServiceAccess: {
      provider: 'sendgrid',
      apiKey: '',
      senderDomains: [],
      verifiedSenders: [],
      rateLimits: {
        daily: 0,
        monthly: 0
      }
    },
    domainConfiguration: {
      customDomain: '',
      spfRecord: '',
      dkimRecord: '',
      dmarcRecord: '',
      verificationStatus: 'pending'
    },
    templateLibrary: [],
    designSystem: {
      brandColors: {
        primary: '',
        secondary: '',
        accent: ''
      },
      typography: {
        headingFont: '',
        bodyFont: ''
      },
      logo: {
        url: '',
        width: 0,
        height: 0
      },
      footer: {
        companyName: '',
        address: '',
        unsubscribeLink: true,
        socialLinks: []
      }
    },
    dynamicContent: {
      personalizationVariables: [],
      conditionalBlocks: [],
      a_bTestingEnabled: false
    },
    testingAndPreview: {
      testEmailAddresses: [],
      previewDevices: [],
      spamTestingEnabled: false
    },
    deliverySettings: {
      sendingSchedule: 'immediate',
      batchSize: 0,
      throttling: {
        enabled: false,
        perHour: 0
      }
    },
    complianceSettings: {
      gdprCompliant: false,
      canSpamCompliant: false,
      unsubscribeMethod: 'link',
      consentTracking: false
    },
    analytics: {
      openTracking: false,
      clickTracking: false,
      conversionTracking: false,
      dashboardUrl: ''
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

  const [activeTab, setActiveTab] = useState<'service' | 'domain' | 'templates' | 'design' | 'dynamic' | 'testing' | 'delivery' | 'compliance' | 'analytics' | 'workflow'>('service');

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(item => item.serviceId === 'auto-email-templates');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(item => item.serviceId !== 'auto-email-templates');

    updated.push({
      serviceId: 'auto-email-templates',
      serviceName: 'ניהול תבניות Email אוטומטיות',
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
      <Card title="שירות #20: ניהול תבניות Email אוטומטיות">
        {/* 10 Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('service')} className={`px-4 py-2 ${activeTab === 'service' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            שירות Email
          </button>
          <button onClick={() => setActiveTab('domain')} className={`px-4 py-2 ${activeTab === 'domain' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            דומיין ו-DNS
          </button>
          <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 ${activeTab === 'templates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            תבניות
          </button>
          <button onClick={() => setActiveTab('design')} className={`px-4 py-2 ${activeTab === 'design' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            עיצוב ומיתוג
          </button>
          <button onClick={() => setActiveTab('dynamic')} className={`px-4 py-2 ${activeTab === 'dynamic' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            תוכן דינמי
          </button>
          <button onClick={() => setActiveTab('testing')} className={`px-4 py-2 ${activeTab === 'testing' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            בדיקות
          </button>
          <button onClick={() => setActiveTab('delivery')} className={`px-4 py-2 ${activeTab === 'delivery' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            שליחה
          </button>
          <button onClick={() => setActiveTab('compliance')} className={`px-4 py-2 ${activeTab === 'compliance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            תאימות
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 ${activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            אנליטיקס
          </button>
          <button onClick={() => setActiveTab('workflow')} className={`px-4 py-2 ${activeTab === 'workflow' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            n8n
          </button>
        </div>

        <div className="space-y-4">
          {/* Implement ALL fields */}
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

## Tab Organization (80 fields)

**Tab 1 - Email Service:** Provider credentials, verified senders, rate limits
**Tab 2 - Domain:** Custom domain, SPF/DKIM/DMARC records
**Tab 3 - Templates:** Template library array with categories
**Tab 4 - Design:** Brand colors, typography, logo, footer
**Tab 5 - Dynamic:** Personalization variables, conditional blocks, A/B testing
**Tab 6 - Testing:** Test addresses, preview devices, spam testing
**Tab 7 - Delivery:** Sending schedule, batch size, throttling
**Tab 8 - Compliance:** GDPR, CAN-SPAM, unsubscribe, consent
**Tab 9 - Analytics:** Open/click/conversion tracking
**Tab 10 - Workflow:** n8n integration

## Array Fields

- `senderDomains` array
- `verifiedSenders` array
- `templateLibrary` array (main template array with full metadata)
- `socialLinks` array
- `personalizationVariables` array
- `conditionalBlocks` array
- `testEmailAddresses` array
- `previewDevices` array

## Provider-Specific Credentials

Conditional rendering based on `emailServiceAccess.provider`:
- **SendGrid:** apiKey
- **Mailgun:** apiKey, domain
- **SMTP:** host, port, username, password, encryption

## Success Criteria

- [ ] All 80 fields from interface implemented
- [ ] 10 tabs organizing fields
- [ ] All array fields have add/remove
- [ ] Conditional provider credentials
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoEmailTemplatesSpec.tsx`
