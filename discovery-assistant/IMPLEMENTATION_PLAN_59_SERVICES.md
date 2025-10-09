# תוכנית הטמעת 59 שירותים ב-Phase 2
**תאריך:** 9 אוקטובר 2025
**מטרה:** להטמיע מערכת איסוף פרטים טכניים עבור כל 59 השירותים ב-Phase 2

---

## 📋 סיכום מצב קיים (ממצאים מהקוד)

### ✅ מה שכבר קיים:

1. **Phase Transition Logic** (`useMeetingStore.ts`):
   - `updatePhaseStatus('client_approved')` - מסמן שהלקוח אישר
   - `transitionPhase()` - מעביר בין phases
   - `canTransitionTo()` - בודק אם ניתן לעבור

2. **ClientApprovalView** (`ClientApprovalView.tsx`):
   - שומר `purchasedServices` (רק שירותים שהלקוח רכש)
   - שומר חתימה, תאריך אישור
   - מנווט ל-`/phase2` אחרי אישור

3. **Phase 2 Types** (`types/phase2.ts`):
   - `ImplementationSpecData` - המבנה הראשי
   - `systems`, `integrations`, `aiAgents`, `automations`
   - ⚠️ `automations` מוגדר כ-`any[]` - צריך לעדכן!

4. **דוגמה קיימת** (`AutoCRMUpdateSpec.tsx`):
   - Component מוכן עבור Service #3
   - משתמש ב-`AutoCRMUpdateConfig` interface
   - שומר ב-`meeting.implementationSpec.automations`

5. **Services Database** (`servicesDatabase.ts`):
   - 59 שירותים מוגדרים עם IDs
   - חלוקה ל-5 קטגוריות

6. **Research Files** (5 קבצים):
   - ✅ `AUTOMATIONS_TECHNICAL_REQUIREMENTS.md` → שירותים 1-20
   - ✅ `AI_AGENTS_TECHNICAL_REQUIREMENTS.md` → שירותים 21-30
   - ✅ `INTEGRATIONS_TECHNICAL_REQUIREMENTS.md` → שירותים 31-40
   - ⚠️ חסר: `SYSTEM_IMPLEMENTATION_REQUIREMENTS.md` → שירותים 41-49
   - ✅ `ADDITIONAL_SERVICES_TECHNICAL_REQUIREMENTS.md` → שירותים 50-59

---

## 🎯 מה צריך להטמיע:

### גישה:
**לא ליצור מחדש דברים שכבר קיימים!**
- ✅ השתמש ב-phase transition logic הקיים
- ✅ השתמש במבנה ה-types הקיים
- ✅ השתמש בדוגמה של AutoCRMUpdateSpec כבסיס

### מה חסר:
1. **TypeScript Interfaces** ל-55 שירותים נוספים
2. **React Components** ל-55 שירותים נוספים
3. **Service Requirements Router** - component שמזהה `purchasedServices` ומציג טפסים
4. **Validation Logic** - וידוא שכל השדות מלאו
5. **Integration עם Phase 2 Dashboard**

---

## 📝 תוכנית ביצוע שלב-אחר-שלב

---

## שלב 0: מחקר וחקירה מעמיקה 🔍
**זמן משוער:** 30 דקות
**Sub-Agent:** `phase1-to-phase2-data-flow-specialist`

### מטרה:
להבין בדיוק איך עובד המעבר Phase 1 → Phase 2 והאם יש קוד נוסף שצריך להכיר.

### פעולות:

1. **קריאת useMeetingStore.ts המלא:**
   ```bash
   Read useMeetingStore.ts (שורות 1-2000)
   ```
   - חפש `transitionPhase` implementation
   - חפש `canTransitionTo` implementation
   - חפש איך `implementationSpec` מתעדכן

2. **קריאת ImplementationSpecDashboard:**
   ```bash
   Glob **/ImplementationSpecDashboard.tsx
   Read ImplementationSpecDashboard.tsx
   ```
   - מה מוצג ב-Phase 2?
   - איך זה קורא את `purchasedServices`?
   - איפה משתלבים ה-components הקיימים?

3. **בדיקת Components קיימים:**
   ```bash
   Read AutoCRMUpdateSpec.tsx (מלא)
   Read AutoEmailTemplatesSpec.tsx (מלא)
   Read AIFAQBotSpec.tsx (מלא)
   Read AITriageSpec.tsx (מלא)
   ```
   - מה המבנה המשותף?
   - איך הם שומרים נתונים?
   - איך הם מבצעים validation?

4. **סיכום ממצאים:**
   - תעד את flow המדויק
   - תעד את המבנה של component
   - תעד איפה נשמרים הנתונים

### Deliverable:
📄 מסמך markdown עם:
- Flow diagram מילולי של Phase 1 → Phase 2
- מבנה component טיפוסי
- מיקום אחסון הנתונים במדויק

---

## שלב 1: אימות קבצי Research 📚
**זמן משוער:** 15 דקות
**Sub-Agent:** `general-purpose`

### מטרה:
לוודא שיש את כל המידע הדרוש.

### פעולות:

1. **אימות קיום קבצי Research:**
   ```bash
   Glob **/*TECHNICAL_REQUIREMENTS.md
   ```

2. **קריאה מהירה של כל קובץ:**
   ```bash
   Read AUTOMATIONS_TECHNICAL_REQUIREMENTS.md (שורות 1-100)
   Read AI_AGENTS_TECHNICAL_REQUIREMENTS.md (שורות 1-100)
   Read INTEGRATIONS_TECHNICAL_REQUIREMENTS.md (שורות 1-100)
   Read ADDITIONAL_SERVICES_TECHNICAL_REQUIREMENTS.md (שורות 1-100)
   ```

3. **חיפוש קובץ SYSTEM_IMPLEMENTATION:**
   ```bash
   Glob **/SYSTEM*REQUIREMENTS*.md
   WebSearch "site:github.com discovery-assistant system implementation requirements"
   ```
   - אם חסר - לתעד ולהתריע

4. **אימות שכל 59 השירותים מכוסים:**
   - רשימה: שירותים 1-20 ב-Automations
   - רשימה: שירותים 21-30 ב-AI Agents
   - רשימה: שירותים 31-40 ב-Integrations
   - רשימה: שירותים 41-49 ב-System Implementation (אם קיים)
   - רשימה: שירותים 50-59 ב-Additional Services

### Deliverable:
✅ רשימת check של 59 שירותים עם ציון לכל אחד: ✅ יש research / ❌ חסר research

---

## שלב 2: בניית Type System 🔧
**זמן משוער:** 2-3 שעות
**Sub-Agent:** `typescript-type-specialist`

### מטרה:
ליצור TypeScript interfaces עבור כל 59 השירותים.

### אסטרטגיה:
**חלוקה ל-5 תת-משימות** (אחת לכל קטגוריה)

---

### תת-משימה 2.1: Automations (שירותים 1-20)

**קריאה:**
```bash
Read AUTOMATIONS_TECHNICAL_REQUIREMENTS.md (מלא)
Read types/automationServices.ts (אם קיים)
```

**יצירה/עדכון:**
```typescript
// src/types/automationServices.ts

// Service #1: auto-lead-response
export interface AutoLeadResponseRequirements {
  // Form Platform
  formPlatform: 'wix' | 'wordpress' | 'elementor' | 'google_forms' | 'typeform' | 'jotform';
  webhookEndpoint?: string;
  formApiKey?: string;

  // Email Service
  emailService: 'sendgrid' | 'mailgun' | 'smtp';
  emailCredentials: {
    apiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
  };

  // CRM Integration
  crmSystem: 'zoho' | 'salesforce' | 'hubspot';
  crmApiCredentials: {
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    apiKey?: string;
  };

  // n8n Configuration
  n8nEndpoint: string;
  n8nApiKey?: string;

  // Response Configuration
  responseTemplates: {
    subject: string;
    body: string;
    language: 'he' | 'en';
  }[];

  // Settings
  responseDelayMinutes?: number; // Max 5 minutes for best results
  retryAttempts?: number; // Default: 3
}

// Service #2: auto-sms-whatsapp
export interface AutoSmsWhatsappRequirements {
  // Channel Selection
  channels: ('sms' | 'whatsapp')[];

  // WhatsApp Business API (if whatsapp selected)
  whatsapp?: {
    phoneNumberId: string;
    wabaId: string; // WhatsApp Business Account ID
    accessToken: string; // System User Token
    messageTemplates: {
      name: string;
      language: string;
      status: 'approved' | 'pending' | 'rejected';
      category: 'marketing' | 'utility' | 'authentication';
    }[];
    metaBusinessVerified: boolean;
  };

  // SMS via Twilio (if sms selected)
  sms?: {
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioPhoneNumber: string;
  };

  // CRM Integration
  crmSystem: 'zoho' | 'salesforce' | 'hubspot';
  crmPhoneFieldName: string; // Field containing phone number
  phoneNumberFormat: 'international' | 'local'; // +972... or 05...

  // Message Templates
  messageTemplates: {
    channel: 'sms' | 'whatsapp';
    triggerEvent: string;
    messageText: string;
    language: 'he' | 'en';
  }[];

  // Rate Limiting
  maxMessagesPerDay?: number; // WhatsApp Tier 1: 1000, Tier 2: 10000
  optInRequired: boolean;
}

// ... interfaces for services 3-20 ...
// Continue with all 20 automation services based on research file

export type AutomationServiceConfig =
  | AutoLeadResponseRequirements
  | AutoSmsWhatsappRequirements
  // ... add all 20 types
  ;
```

**Sub-Agent Prompt:**
```
אני צריך שתיצור את הקובץ src/types/automationServices.ts עם interfaces לכל 20 שירותי האוטומציה.

עבור כל שירות:
1. קרא את AUTOMATIONS_TECHNICAL_REQUIREMENTS.md
2. חלץ את כל השדות הנדרשים
3. צור interface מדויק עם:
   - כל השדות מהמחקר
   - טיפוסים מדויקים (string | number | boolean | union types)
   - שדות אופציונליים (?) לפי הצורך
   - תיעוד (JSDoc comments) בעברית

דוגמה לפורמט:
/**
 * Service #1: Auto Lead Response
 * תגובה אוטומטית ללידים חדשים מטפסים
 *
 * Prerequisites:
 * - Form webhook או API key
 * - Email service credentials
 * - CRM API access
 */
export interface AutoLeadResponseRequirements { ... }

התחל!
```

---

### תת-משימה 2.2: AI Agents (שירותים 21-30)

**קריאה:**
```bash
Read AI_AGENTS_TECHNICAL_REQUIREMENTS.md (מלא)
Read types/phase2.ts (בדיקה אם יש כבר types רלוונטיים)
```

**יצירה/עדכון:**
```typescript
// src/types/aiAgentServices.ts

// Service #21: ai-faq-bot
export interface AIFaqBotRequirements {
  // AI Provider
  aiProvider: 'openai' | 'anthropic' | 'google';
  modelName: string; // e.g., "gpt-4o-mini", "claude-3.5-sonnet"
  apiKey: string;

  // Knowledge Base
  knowledgeBase: {
    faqs: {
      question: string;
      answer: string;
      category?: string;
    }[];
    totalFaqs: number; // Recommended: 50-100
  };

  // Vector Database (optional)
  vectorDatabase?: {
    provider: 'supabase_pgvector' | 'pinecone' | 'weaviate';
    configuration: Record<string, any>;
  };

  // Conversation Settings
  conversationSettings: {
    greeting: string;
    fallbackResponse: string;
    escalationTriggers: string[]; // e.g., "2-3 failed attempts"
    maxTurns: number; // Max conversation length
  };

  // Deployment Channels
  deploymentChannels: ('whatsapp' | 'website' | 'facebook' | 'instagram')[];

  // Cost Estimation
  estimatedMonthlyVolume: number; // Expected conversations per month
  estimatedCostPerMonth?: number; // Calculated based on model pricing
}

// Service #22: ai-lead-qualifier
export interface AILeadQualifierRequirements {
  // AI Model
  aiProvider: 'openai' | 'anthropic';
  modelName: string; // e.g., "gpt-4o", "claude-3.5-sonnet"
  apiKey: string;

  // BANT Qualification
  qualificationCriteria: {
    budget: {
      enabled: boolean;
      questions: string[];
      scoringRules: string;
    };
    authority: {
      enabled: boolean;
      questions: string[];
      scoringRules: string;
    };
    need: {
      enabled: boolean;
      questions: string[];
      scoringRules: string;
    };
    timeline: {
      enabled: boolean;
      questions: string[];
      scoringRules: string;
    };
  };

  // Conversation Flow
  conversationFlow: {
    maxQuestions: number; // Recommended: 8-10
    questionSequence: string[];
  };

  // Lead Scoring
  leadScoring: {
    minScore: number; // e.g., 0
    maxScore: number; // e.g., 100
    qualifiedThreshold: number; // e.g., 60
  };

  // CRM Integration
  crmIntegration: {
    system: 'zoho' | 'salesforce' | 'hubspot';
    fieldMapping: {
      aiField: string;
      crmField: string;
    }[];
  };
}

// ... interfaces for services 23-30 ...

export type AIAgentServiceConfig =
  | AIFaqBotRequirements
  | AILeadQualifierRequirements
  // ... add all 10 types
  ;
```

**Sub-Agent Prompt:**
```
אני צריך שתיצור את הקובץ src/types/aiAgentServices.ts עם interfaces לכל 10 שירותי ה-AI Agents.

עבור כל שירות:
1. קרא את AI_AGENTS_TECHNICAL_REQUIREMENTS.md
2. חלץ את כל השדות הנדרשים
3. צור interface מדויק עם תיעוד

שים לב מיוחד:
- AI model selection (provider, model name, API key)
- Knowledge base structure
- Conversation flow design
- Integration points (CRM, messaging, calendar)
- Cost estimation fields

התחל!
```

---

### תת-משימה 2.3: Integrations (שירותים 31-40)

**Sub-Agent:** `typescript-type-specialist`
**קריאה:** `INTEGRATIONS_TECHNICAL_REQUIREMENTS.md`
**יצירה:** `src/types/integrationServices.ts`

**Sub-Agent Prompt:**
```
צור src/types/integrationServices.ts עבור 10 שירותי Integration (31-40).

כל interface צריך לכלול:
- Authentication method (OAuth 2.0, API Key, etc.)
- System connections (source/target)
- Data mapping configuration
- Sync frequency and direction
- Error handling strategy
- Rate limits

התחל!
```

---

### תת-משימה 2.4: System Implementations (שירותים 41-49)

**⚠️ בעיה:** ייתכן שחסר קובץ research

**פעולות:**
1. חפש קובץ SYSTEM_IMPLEMENTATION_REQUIREMENTS.md
2. אם לא קיים - יצור אותו על בסיס הידע הכללי
3. צור `src/types/systemImplementationServices.ts`

**Sub-Agent:** `system-implementation-requirements-researcher`

**Sub-Agent Prompt:**
```
אני צריך interfaces עבור 9 שירותי System Implementation:
- Service #41: impl-crm
- Service #42: impl-marketing-automation
- Service #43: impl-project-management
- Service #44: impl-helpdesk
- Service #45: impl-erp
- Service #46: impl-ecommerce
- Service #47: impl-analytics
- Service #48: impl-workflow-platform
- Service #49: impl-custom

עבור כל שירות, חקור והבן מה הפרטים הטכניים הנדרשים:
- Admin access requirements
- API credentials
- Data migration needs
- Custom fields configuration
- User roles setup

צור src/types/systemImplementationServices.ts
```

---

### תת-משימה 2.5: Additional Services (שירותים 50-59)

**Sub-Agent:** `typescript-type-specialist`
**קריאה:** `ADDITIONAL_SERVICES_TECHNICAL_REQUIREMENTS.md`
**יצירה:** `src/types/additionalServices.ts`

**Sub-Agent Prompt:**
```
צור src/types/additionalServices.ts עבור 10 שירותים נוספים (50-59):
- data-cleanup
- data-migration
- add-dashboard
- add-custom-reports
- reports-automated
- training-workshops
- training-ongoing
- support-ongoing
- consulting-process
- consulting-strategy

התחל!
```

---

### תת-משימה 2.6: עדכון types/phase2.ts

**Sub-Agent:** `typescript-type-specialist`

**פעולות:**
1. קרא `types/phase2.ts`
2. עדכן את `ImplementationSpecData`:
```typescript
import { AutomationServiceConfig } from './automationServices';
import { AIAgentServiceConfig } from './aiAgentServices';
import { IntegrationServiceConfig } from './integrationServices';
import { SystemImplementationServiceConfig } from './systemImplementationServices';
import { AdditionalServiceConfig } from './additionalServices';

export interface ImplementationSpecData {
  systems: DetailedSystemSpec[];
  integrations: IntegrationFlow[];
  aiAgents: DetailedAIAgentSpec[];

  // UPDATED: Strongly-typed automation configurations
  automations: AutomationServiceConfig[];

  // NEW: Additional service categories
  systemImplementations: SystemImplementationServiceConfig[];
  additionalServices: AdditionalServiceConfig[];

  acceptanceCriteria: AcceptanceCriteria;

  // Timeline
  estimatedStartDate?: Date;
  estimatedCompletionDate?: Date;
  totalEstimatedHours: number;

  // Progress
  completionPercentage: number;
  lastUpdated: Date;
  updatedBy: string;
}
```

---

## שלב 3: בניית React Components ⚛️
**זמן משוער:** 8-12 שעות
**Sub-Agent:** `react-component-architect`

### מטרה:
ליצור 55 React components חדשים (יש כבר 4).

### אסטרטגיה:
**חלוקה ל-5 תת-משימות** (קטגוריה אחת בכל פעם)

---

### תת-משימה 3.1: Automation Components (שירותים 1-20)

**רשימת Components לבנות:**
- ✅ AutoCRMUpdateSpec.tsx (קיים - שירות #3)
- ✅ AutoEmailTemplatesSpec.tsx (קיים - שירות #9)
- ❌ AutoLeadResponseSpec.tsx (שירות #1)
- ❌ AutoSmsWhatsappSpec.tsx (שירות #2)
- ❌ AutoTeamAlertsSpec.tsx (שירות #4)
- ❌ AutoAppointmentRemindersSpec.tsx (שירות #5)
- ❌ AutoWelcomeEmailSpec.tsx (שירות #6)
- ❌ AutoLeadWorkflowSpec.tsx (שירות #7)
- ❌ AutoSmartFollowupSpec.tsx (שירות #8)
- ❌ AutoMeetingSchedulerSpec.tsx (שירות #10)
- ❌ AutoFormToCrmSpec.tsx (שירות #11)
- ❌ AutoNotificationsSpec.tsx (שירות #12)
- ❌ AutoApprovalWorkflowSpec.tsx (שירות #13)
- ❌ AutoDocumentGenerationSpec.tsx (שירות #14)
- ❌ AutoDocumentMgmtSpec.tsx (שירות #15)
- ❌ AutoDataSyncSpec.tsx (שירות #16)
- ❌ AutoSystemSyncSpec.tsx (שירות #17)
- ❌ AutoReportsSpec.tsx (שירות #18)
- ❌ AutoMultiSystemSpec.tsx (שירות #19)
- ❌ AutoEndToEndSpec.tsx (שירות #20)

**מבנה Component טיפוסי:**
```typescript
// src/components/Phase2/ServiceRequirements/Automations/AutoLeadResponseSpec.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { AutoLeadResponseRequirements } from '../../../../types/automationServices';
import { Button, Input, Select } from '../../../Base';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Constants for dropdowns
const FORM_PLATFORMS = [
  { value: 'wix', label: 'Wix Forms' },
  { value: 'wordpress', label: 'WordPress' },
  // ... etc
];

export const AutoLeadResponseSpec: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Initialize state from existing data or defaults
  const [config, setConfig] = useState<AutoLeadResponseRequirements>({
    formPlatform: 'wix',
    emailService: 'sendgrid',
    crmSystem: 'zoho',
    emailCredentials: {},
    crmApiCredentials: {},
    n8nEndpoint: '',
    responseTemplates: [],
    responseDelayMinutes: 2,
    retryAttempts: 3
  });

  // Load existing data from meeting
  useEffect(() => {
    // Find this service's config in meeting.implementationSpec.automations
    const existingConfig = currentMeeting?.implementationSpec?.automations?.find(
      (a: any) => a.serviceId === 'auto-lead-response'
    );
    if (existingConfig) {
      setConfig(existingConfig.requirements);
    }
  }, [currentMeeting]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.n8nEndpoint) {
      newErrors.n8nEndpoint = 'נדרש endpoint של n8n';
    }

    if (config.emailService === 'sendgrid' && !config.emailCredentials.apiKey) {
      newErrors.emailApiKey = 'נדרש API Key של SendGrid';
    }

    if (config.responseTemplates.length === 0) {
      newErrors.responseTemplates = 'נדרשת לפחות תבנית אחת';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSave = () => {
    if (!validate()) {
      return;
    }

    // Update meeting with this service's requirements
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter((a: any) => a.serviceId !== 'auto-lead-response');
    updated.push({
      serviceId: 'auto-lead-response',
      serviceName: 'תגובה אוטומטית ללידים',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting?.implementationSpec,
        automations: updated
      }
    });

    alert('הנתונים נשמרו בהצלחה!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          תגובה אוטומטית ללידים
        </h2>
        <p className="text-gray-600 mt-2">
          Service #1: Auto Lead Response - איסוף פרטים טכניים
        </p>
      </div>

      {/* Form Platform Section */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">פלטפורמת טפסים</h3>

        <Select
          label="פלטפורמת הטפסים שלך"
          value={config.formPlatform}
          onChange={(e) => setConfig({ ...config, formPlatform: e.target.value as any })}
          options={FORM_PLATFORMS}
        />

        {config.formPlatform === 'wix' && (
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              💡 Wix Forms: צריך להגדיר Velo webhook או להשתמש ב-Wix Automations API
            </p>
          </div>
        )}

        <Input
          label="Webhook Endpoint (אם קיים)"
          value={config.webhookEndpoint || ''}
          onChange={(e) => setConfig({ ...config, webhookEndpoint: e.target.value })}
          placeholder="https://your-form.com/webhook"
          className="mt-4"
        />
      </section>

      {/* Email Service Section */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">שירות אימייל</h3>

        <Select
          label="ספק אימייל"
          value={config.emailService}
          onChange={(e) => setConfig({ ...config, emailService: e.target.value as any })}
          options={[
            { value: 'sendgrid', label: 'SendGrid' },
            { value: 'mailgun', label: 'Mailgun' },
            { value: 'smtp', label: 'SMTP (Gmail, Outlook...)' }
          ]}
        />

        {config.emailService === 'sendgrid' && (
          <Input
            label="SendGrid API Key"
            type="password"
            value={config.emailCredentials.apiKey || ''}
            onChange={(e) => setConfig({
              ...config,
              emailCredentials: { ...config.emailCredentials, apiKey: e.target.value }
            })}
            error={errors.emailApiKey}
            className="mt-4"
          />
        )}

        {/* Similar sections for other email services... */}
      </section>

      {/* CRM Integration Section */}
      {/* Response Templates Section */}
      {/* n8n Configuration Section */}
      {/* Settings Section */}

      {/* Save Button */}
      <div className="flex gap-4 mt-8">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          חזור
        </Button>
        <Button onClick={handleSave} icon={<Save />}>
          שמור פרטים טכניים
        </Button>
      </div>
    </div>
  );
};
```

**Sub-Agent Prompt לכל Component:**
```
צור component עבור Service #X: [service-name]

1. קרא את AUTOMATIONS_TECHNICAL_REQUIREMENTS.md (מציאת שירות #X)
2. קרא את types/automationServices.ts (ה-interface המתאים)
3. צור component ב-src/components/Phase2/ServiceRequirements/Automations/[ServiceName]Spec.tsx

המבנה צריך להיות דומה ל-AutoCRMUpdateSpec.tsx אבל עם השדות של השירות הזה.

דרישות:
- ✅ טופס מלא עם כל השדות מה-interface
- ✅ Validation מלא
- ✅ שמירה ב-meeting.implementationSpec.automations
- ✅ הודעות עזרה והסברים בעברית
- ✅ Responsive design
- ✅ Error handling

התחל!
```

---

### תת-משימה 3.2: AI Agent Components (שירותים 21-30)

**רשימת Components לבנות:**
- ✅ AIFAQBotSpec.tsx (קיים - שירות #21)
- ✅ AITriageSpec.tsx (קיים - שירות #27)
- ❌ AILeadQualifierSpec.tsx (שירות #22)
- ❌ AISalesAgentSpec.tsx (שירות #23)
- ❌ AIServiceAgentSpec.tsx (שירות #24)
- ❌ AIActionAgentSpec.tsx (שירות #25)
- ❌ AIComplexWorkflowSpec.tsx (שירות #26)
- ❌ AIPredictiveSpec.tsx (שירות #28)
- ❌ AIFullIntegrationSpec.tsx (שירות #29)
- ❌ AIMultiAgentSpec.tsx (שירות #30)

**Sub-Agent:** `react-component-architect`

**Sub-Agent Prompt:**
```
צור 8 components חדשים עבור AI Agents (22-26, 28-30).

עבור כל component:
1. קרא AI_AGENTS_TECHNICAL_REQUIREMENTS.md
2. קרא types/aiAgentServices.ts
3. צור component ב-src/components/Phase2/ServiceRequirements/AIAgents/

שים לב מיוחד:
- AI model selection (dropdown)
- Knowledge base uploader (file input או textarea)
- Conversation flow builder
- Cost calculator (based on estimated volume)
- Integration configuration

התחל!
```

---

### תת-משימה 3.3: Integration Components (שירותים 31-40)

**Sub-Agent:** `react-component-architect`

**רשימה:** 10 components חדשים

**Sub-Agent Prompt:**
```
צור 10 components עבור Integration services (31-40).

מיקום: src/components/Phase2/ServiceRequirements/Integrations/

שים לב:
- OAuth configuration UI
- System selection (source/target)
- Field mapping table (drag & drop או manual)
- Sync frequency selector
- Error handling configuration

התחל!
```

---

### תת-משימה 3.4: System Implementation Components (שירותים 41-49)

**Sub-Agent:** `react-component-architect`

**רשימה:** 9 components חדשים

**Sub-Agent Prompt:**
```
צור 9 components עבור System Implementation (41-49).

מיקום: src/components/Phase2/ServiceRequirements/SystemImplementations/

שים לב:
- Admin access checklist
- API credentials form
- Data migration wizard
- Custom fields configuration
- Timeline estimator

התחל!
```

---

### תת-משימה 3.5: Additional Services Components (שירותים 50-59)

**Sub-Agent:** `react-component-architect`

**רשימה:** 10 components חדשים

**Sub-Agent Prompt:**
```
צור 10 components עבור Additional Services (50-59).

מיקום: src/components/Phase2/ServiceRequirements/AdditionalServices/

שירותים אלה פשוטים יותר - פחות טכניים, יותר תיאום ציפיות.

התחל!
```

---

## שלב 4: בניית Service Requirements Router 🗺️
**זמן משוער:** 2 שעות
**Sub-Agent:** `phase2-filter-orchestrator`

### מטרה:
ליצור component מרכזי שמזהה אילו שירותים נרכשו ומציג את הטפסים המתאימים.

### פעולות:

1. **יצירת Mapping Dictionary:**
```typescript
// src/config/serviceComponentMapping.ts

import { AutoLeadResponseSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoLeadResponseSpec';
import { AutoSmsWhatsappSpec } from '../components/Phase2/ServiceRequirements/Automations/AutoSmsWhatsappSpec';
// ... all imports

export const SERVICE_COMPONENT_MAP: Record<string, React.FC> = {
  // Automations
  'auto-lead-response': AutoLeadResponseSpec,
  'auto-sms-whatsapp': AutoSmsWhatsappSpec,
  'auto-crm-update': AutoCRMUpdateSpec,
  // ... all 59 services
};

export const SERVICE_CATEGORY_MAP: Record<string, string> = {
  'auto-lead-response': 'automations',
  'auto-sms-whatsapp': 'automations',
  // ... etc
};
```

2. **יצירת ServiceRequirementsRouter:**
```typescript
// src/components/Phase2/ServiceRequirementsRouter.tsx

import React, { useState } from 'react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { SERVICE_COMPONENT_MAP, SERVICE_CATEGORY_MAP } from '../../config/serviceComponentMapping';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

export const ServiceRequirementsRouter: React.FC = () => {
  const { currentMeeting } = useMeetingStore();

  // Get purchased services from Phase 1 approval
  const purchasedServices = currentMeeting?.modules?.proposal?.purchasedServices || [];

  // Track which services have completed requirements
  const completedServices = new Set(
    currentMeeting?.implementationSpec?.automations?.map((a: any) => a.serviceId) || []
  );

  // Current service being filled
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const currentService = purchasedServices[currentServiceIndex];

  if (purchasedServices.length === 0) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">
          לא נמצאו שירותים שנרכשו
        </h2>
        <p className="text-gray-600 mt-2">
          נראה שהלקוח עדיין לא אישר שירותים. חזור לשלב ההצעה.
        </p>
      </div>
    );
  }

  // Get the component for current service
  const ServiceComponent = currentService ? SERVICE_COMPONENT_MAP[currentService.id] : null;

  return (
    <div className="flex h-screen" dir="rtl">
      {/* Sidebar - Service Navigation */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">
          שירותים שנרכשו ({purchasedServices.length})
        </h3>

        <div className="space-y-2">
          {purchasedServices.map((service, index) => {
            const isCompleted = completedServices.has(service.id);
            const isCurrent = index === currentServiceIndex;

            return (
              <button
                key={service.id}
                onClick={() => setCurrentServiceIndex(index)}
                className={`
                  w-full text-right p-4 rounded-lg transition-colors
                  ${isCurrent ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'}
                  ${isCompleted && !isCurrent ? 'bg-green-50' : ''}
                  hover:shadow-md
                `}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{service.nameHe}</div>
                    <div className="text-sm opacity-75">{service.name}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 p-4 bg-white rounded-lg">
          <div className="text-sm text-gray-600 mb-2">
            התקדמות כוללת
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{
                width: `${(completedServices.size / purchasedServices.length) * 100}%`
              }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {completedServices.size} מתוך {purchasedServices.length} הושלמו
          </div>
        </div>
      </div>

      {/* Main Content - Service Requirements Form */}
      <div className="flex-1 overflow-auto">
        {ServiceComponent ? (
          <ServiceComponent />
        ) : (
          <div className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">
              טופס לא זמין עבור השירות הזה
            </h2>
            <p className="text-gray-600 mt-2">
              Service ID: {currentService?.id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
```

3. **אינטגרציה עם ImplementationSpecDashboard:**

**Sub-Agent:** `phase-workflow-specialist`

**פעולות:**
- קרא `ImplementationSpecDashboard.tsx`
- הוסף קישור/טאב ל-ServiceRequirementsRouter
- וודא שהוא מוצג רק אחרי `client_approved`

---

## שלב 5: Validation & Phase Guard ✅
**זמן משוער:** 2 שעות
**Sub-Agent:** `validation-guard-specialist`

### מטרה:
למנוע מעבר ל-Phase 3 עד שכל הטפסים מולאו.

### פעולות:

1. **יצירת Validation Helper:**
```typescript
// src/utils/serviceRequirementsValidation.ts

export const validateServiceRequirements = (
  purchasedServices: any[],
  implementationSpec: any
): { isValid: boolean; missingServices: string[] } => {
  const completed = new Set([
    ...(implementationSpec.automations?.map((a: any) => a.serviceId) || []),
    ...(implementationSpec.systemImplementations?.map((s: any) => s.serviceId) || []),
    ...(implementationSpec.additionalServices?.map((s: any) => s.serviceId) || [])
  ]);

  const missingServices = purchasedServices
    .filter(service => !completed.has(service.id))
    .map(service => service.nameHe);

  return {
    isValid: missingServices.length === 0,
    missingServices
  };
};
```

2. **עדכון useMeetingStore - canTransitionTo:**
```typescript
canTransitionTo: (phase: MeetingPhase) => {
  const meeting = get().currentMeeting;
  if (!meeting) return false;

  // ... existing validation ...

  // NEW: Phase 2 → Phase 3 requires all service requirements completed
  if (phase === 'development') {
    const purchasedServices = meeting.modules?.proposal?.purchasedServices || [];
    const validation = validateServiceRequirements(
      purchasedServices,
      meeting.implementationSpec || {}
    );

    if (!validation.isValid) {
      console.warn('[Phase Guard] Missing service requirements:', validation.missingServices);
      return false;
    }
  }

  return true;
}
```

3. **יצירת UI Alert Component:**
```typescript
// src/components/Phase2/IncompleteServicesAlert.tsx

export const IncompleteServicesAlert: React.FC = () => {
  const { currentMeeting } = useMeetingStore();
  const purchasedServices = currentMeeting?.modules?.proposal?.purchasedServices || [];
  const validation = validateServiceRequirements(
    purchasedServices,
    currentMeeting?.implementationSpec || {}
  );

  if (validation.isValid) return null;

  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg" dir="rtl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-orange-900">
            יש שירותים שטרם הושלמו
          </h4>
          <p className="text-sm text-orange-800 mt-1">
            לא ניתן לעבור לשלב הפיתוח לפני השלמת הפרטים הטכניים עבור כל השירותים:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-orange-800">
            {validation.missingServices.map(service => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
```

---

## שלב 6: אינטגרציה עם Phase Workflow 🔄
**זמן משוער:** 1 שעה
**Sub-Agent:** `phase-workflow-specialist`

### מטרה:
לוודא שהמערכת משתלבת עם phase transitions הקיימות.

### פעולות:

1. **עדכון PhaseNavigator:**
   - הוסף אינדיקציה שלב 2 דורש מילוי טפסים
   - הצג כמה טפסים הושלמו

2. **עדכון ImplementationSpecDashboard:**
   - הוסף link ל-ServiceRequirementsRouter
   - הוסף progress bar
   - הוסף IncompleteServicesAlert

3. **בדיקת App Routes:**
   - וודא שיש route ל-`/phase2/service-requirements`

---

## שלב 7: תיעוד ובדיקות 📝🧪
**זמן משוער:** 2 שעות

### תת-משימה 7.1: תיעוד
**Sub-Agent:** `documentation-specialist`

**פעולות:**
1. עדכן `CLAUDE.md` עם המידע על המערכת החדשה
2. צור `PHASE2_SERVICE_REQUIREMENTS_GUIDE.md` - מדריך למפתחים
3. הוסף JSDoc comments לכל ה-interfaces

### תת-משימה 7.2: בדיקות
**Sub-Agent:** `testing-qa-specialist`

**פעולות:**
1. צור unit tests ל-validation functions
2. צור E2E test:
   - Phase 1: בחר 3 שירותים
   - Phase 1: אשר הצעה
   - Phase 2: מלא טפסים עבור 3 השירותים
   - Phase 2: נסה לעבור ל-Phase 3 (צריך להצליח)
   - Phase 2: נסה לעבור ל-Phase 3 ללא מילוי (צריך להיכשל)

---

## 🎬 סדר ביצוע מומלץ

```
שלב 0: מחקר וחקירה (30 דקות)
  └─> phase1-to-phase2-data-flow-specialist

שלב 1: אימות Research (15 דקות)
  └─> general-purpose

שלב 2: Type System (3 שעות)
  ├─> תת-משימה 2.1: Automations (typescript-type-specialist)
  ├─> תת-משימה 2.2: AI Agents (typescript-type-specialist)
  ├─> תת-משימה 2.3: Integrations (typescript-type-specialist)
  ├─> תת-משימה 2.4: System Implementations (system-implementation-requirements-researcher)
  ├─> תת-משימה 2.5: Additional Services (typescript-type-specialist)
  └─> תת-משימה 2.6: עדכון phase2.ts (typescript-type-specialist)

שלב 3: React Components (12 שעות)
  ├─> תת-משימה 3.1: Automation Components (react-component-architect)
  ├─> תת-משימה 3.2: AI Agent Components (react-component-architect)
  ├─> תת-משימה 3.3: Integration Components (react-component-architect)
  ├─> תת-משימה 3.4: System Implementation Components (react-component-architect)
  └─> תת-משימה 3.5: Additional Services Components (react-component-architect)

שלב 4: Service Router (2 שעות)
  └─> phase2-filter-orchestrator

שלב 5: Validation (2 שעות)
  └─> validation-guard-specialist

שלב 6: אינטגרציה (1 שעה)
  └─> phase-workflow-specialist

שלב 7: תיעוד ובדיקות (2 שעות)
  ├─> documentation-specialist
  └─> testing-qa-specialist

סה"כ: ~22.5 שעות עבודה
```

---

## ✅ Checklist לביצוע

### שלב 0: ✅ מחקר
- [ ] קרא useMeetingStore.ts (מלא)
- [ ] קרא ImplementationSpecDashboard.tsx
- [ ] קרא 4 components קיימים
- [ ] תעד flow מדויק
- [ ] תעד מבנה component טיפוסי

### שלב 1: ✅ אימות Research
- [ ] מצא את 5 קבצי research
- [ ] אמת כיסוי של 59 שירותים
- [ ] זהה חוסרים (אם יש)

### שלב 2: ✅ Types
- [ ] צור types/automationServices.ts (20 interfaces)
- [ ] צור types/aiAgentServices.ts (10 interfaces)
- [ ] צור types/integrationServices.ts (10 interfaces)
- [ ] צור types/systemImplementationServices.ts (9 interfaces)
- [ ] צור types/additionalServices.ts (10 interfaces)
- [ ] עדכן types/phase2.ts

### שלב 3: ✅ Components
- [ ] 16 Automation Components (יש כבר 4)
- [ ] 8 AI Agent Components (יש כבר 2)
- [ ] 10 Integration Components
- [ ] 9 System Implementation Components
- [ ] 10 Additional Services Components

### שלב 4: ✅ Router
- [ ] serviceComponentMapping.ts
- [ ] ServiceRequirementsRouter.tsx
- [ ] אינטגרציה עם Dashboard

### שלב 5: ✅ Validation
- [ ] serviceRequirementsValidation.ts
- [ ] עדכן useMeetingStore.canTransitionTo
- [ ] IncompleteServicesAlert.tsx

### שלב 6: ✅ אינטגרציה
- [ ] עדכן PhaseNavigator
- [ ] עדכן ImplementationSpecDashboard
- [ ] בדוק routes

### שלב 7: ✅ תיעוד ובדיקות
- [ ] עדכן CLAUDE.md
- [ ] צור PHASE2_SERVICE_REQUIREMENTS_GUIDE.md
- [ ] כתוב unit tests
- [ ] כתוב E2E test

---

## 🚨 נקודות קריטיות לשמירה על הקשר

1. **לפני כל תת-משימה:**
   - קרא את הקוד הקיים הרלוונטי
   - וודא שאתה מבין את המבנה
   - אל תנחש - בדוק בקוד!

2. **שימוש ב-Sub Agents:**
   - העבר הקשר מדויק ב-prompt
   - בקש מה-agent לתעד את העבודה
   - בדוק את התוצאה לפני המשך

3. **שמירת עקביות:**
   - כל component צריך לעקוב אחר המבנה של AutoCRMUpdateSpec
   - כל interface צריך לעקוב אחר אותו סגנון
   - כל שמירה ל-store באותה דרך

4. **תיעוד:**
   - תעד כל החלטה חשובה
   - תעד סטיות מהתוכנית
   - תעד בעיות שנתקלת בהן

---

## 📊 מדדי הצלחה

✅ **הושלם בהצלחה כאשר:**
1. כל 59 השירותים יש להם interface TypeScript
2. כל 59 השירותים יש להם React component
3. ServiceRequirementsRouter מציג את הטפסים הנכונים
4. Validation מונע מעבר לפני השלמת הכל
5. כל ה-tests עוברים
6. התיעוד מעודכן

---

## 🎯 התחלה מיידית

**הצעד הראשון:**
```
התחל עם שלב 0 - מחקר וחקירה מעמיקה.

השתמש ב-phase1-to-phase2-data-flow-specialist agent עם ה-prompt הבא:

"אני צריך להבין בדיוק איך עובד המעבר מ-Phase 1 ל-Phase 2 באפליקציה Discovery Assistant.

קרא את הקבצים הבאים:
1. src/store/useMeetingStore.ts (מלא)
2. src/components/PhaseWorkflow/ClientApprovalView.tsx (מלא)
3. src/components/Phase2/ImplementationSpecDashboard.tsx (מלא)
4. src/components/Phase2/AutoCRMUpdateSpec.tsx (מלא)

צור מסמך markdown שמסביר:
1. Flow מדויק: מה קורה כשלקוח מאשר הצעה?
2. איפה נשמר purchasedServices?
3. איך component טיפוסי נראה?
4. איך נתונים נשמרים ב-store?

תעד הכל בפירוט!"
```

---

**מוכן להתחיל? 🚀**
