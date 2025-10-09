# Phase 2: Service Requirements Collection System - Developer Guide

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Data Flow](#data-flow)
4. [Component Structure](#component-structure)
5. [Creating a New Service Component](#creating-a-new-service-component)
6. [Type System](#type-system)
7. [Validation System](#validation-system)
8. [Common Patterns](#common-patterns)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

The Phase 2 Service Requirements Collection System is a comprehensive framework for gathering detailed technical specifications for all 59 services that can be purchased by clients. This system ensures that before development begins (Phase 3), every service has complete technical requirements documented.

### Key Stats
- **59 Services** across 5 categories
- **59 React Components** for requirement forms (100% complete)
- **~12,500 lines** of TypeScript type definitions
- **76 service mappings** in configuration (includes component reuse for similar services)
- **5 Service Categories**: Automations, AI Agents, Integrations, System Implementations, Additional Services

### Key Files
```
src/
├── types/
│   ├── automationServices.ts (5,035 lines)
│   ├── aiAgentServices.ts (1,992 lines)
│   ├── integrationServices.ts (1,882 lines)
│   ├── systemImplementationServices.ts (1,971 lines)
│   └── additionalServices.ts (1,635 lines)
├── components/Phase2/
│   ├── ServiceRequirementsRouter.tsx
│   ├── IncompleteServicesAlert.tsx
│   └── ServiceRequirements/
│       ├── Automations/ (20 components)
│       ├── AIAgents/ (10 components)
│       ├── Integrations/ (10 components)
│       ├── SystemImplementations/ (9 components)
│       └── AdditionalServices/ (10 components)
├── config/
│   └── serviceComponentMapping.ts
└── utils/
    └── serviceRequirementsValidation.ts
```

---

## Architecture

### Component Hierarchy

```
ServiceRequirementsRouter
  ├── Sidebar (Service Navigation)
  │   ├── Service List (purchased services)
  │   │   ├── Service Button (with completion status)
  │   │   └── ...
  │   └── Progress Section
  │       ├── Overall Progress Bar
  │       └── Category Breakdown
  │
  └── Main Content Area (Dynamic)
      └── [ServiceComponent] (e.g., AutoLeadResponseSpec)
          ├── Form Fields
          └── Save Button
```

### Data Flow Architecture

```
Phase 1 (Discovery)
    ↓
Client Approves Services
    ↓
meeting.modules.proposal.purchasedServices[]
    ↓
Phase 2 (Implementation Spec)
    ↓
ServiceRequirementsRouter
    ↓
User fills service requirement forms
    ↓
meeting.implementationSpec.[category][]
    ↓
Validation checks all services complete
    ↓
Phase 3 (Development) - GATED
```

### Data Storage Structure

All Phase 2 service requirements are stored in `meeting.implementationSpec` with separate arrays per category:

```typescript
interface ImplementationSpec {
  // Service requirements by category
  automations?: AutomationServiceEntry[];
  aiAgentServices?: AIAgentServiceEntry[];
  integrationServices?: IntegrationServiceEntry[];
  systemImplementations?: SystemImplementationServiceEntry[];
  additionalServices?: AdditionalServiceEntry[];

  // Legacy Phase 2 fields (may coexist)
  systems?: SystemDetail[];
  integrations?: IntegrationFlow[];
  aiAgents?: AIAgentSpec[];
  acceptanceCriteria?: string;
}
```

**Service Entry Structure:**
```typescript
interface AutomationServiceEntry {
  serviceId: string;           // Unique identifier (e.g., 'auto-lead-response')
  serviceName: string;          // Display name in Hebrew
  requirements: AutoLeadResponseRequirements; // Full technical spec
  completedAt: string;          // ISO timestamp when form was completed
}
```

---

## Data Flow

### Phase 1 → Phase 2 Transition

**What happens when client approves services:**

1. User completes Phase 1 Discovery
2. Client reviews proposal with selected services
3. Client approves services (via ClientApprovalView or admin override)
4. Services stored in:
   ```typescript
   meeting.modules.proposal.purchasedServices = [
     {
       id: 'auto-lead-response',
       name: 'Auto Lead Response from Forms',
       nameHe: 'מענה אוטומטי ללידים מטפסים',
       category: 'automations',
       price: 3000,
       // ... other fields
     },
     // ... more services
   ]
   ```
5. Meeting phase transitions to `implementation_spec`
6. User navigates to `/phase2` route

### Phase 2 Data Collection

**How requirement forms are filled:**

1. ServiceRequirementsRouter loads `purchasedServices` from meeting
2. Displays sidebar with all purchased services
3. User selects a service (e.g., "Auto Lead Response")
4. Router looks up component from `SERVICE_COMPONENT_MAP['auto-lead-response']`
5. Component renders: `AutoLeadResponseSpec`
6. Component loads existing data (if any):
   ```typescript
   useEffect(() => {
     const existing = currentMeeting?.implementationSpec?.automations?.find(
       a => a.serviceId === 'auto-lead-response'
     );
     if (existing) {
       setConfig(existing.requirements);
     }
   }, [currentMeeting]);
   ```
7. User fills form fields
8. User clicks "Save"
9. Component saves data:
   ```typescript
   const handleSave = () => {
     const automations = currentMeeting?.implementationSpec?.automations || [];
     const updated = automations.filter(a => a.serviceId !== 'auto-lead-response');
     updated.push({
       serviceId: 'auto-lead-response',
       serviceName: 'מענה אוטומטי ללידים מטפסים',
       requirements: config,
       completedAt: new Date().toISOString()
     });

     updateMeeting(currentMeeting.id, {
       implementationSpec: {
         ...currentMeeting.implementationSpec,
         automations: updated
       }
     });
   };
   ```
10. Zustand store triggers:
    - localStorage persistence
    - Supabase sync (if configured)
    - Component re-renders with saved data

### Phase 2 → Phase 3 Validation

**How transition gate works:**

1. User attempts to transition to Phase 3 (Development)
2. `useMeetingStore.canTransitionTo('development')` is called
3. Validation logic runs:
   ```typescript
   // In useMeetingStore.ts
   canTransitionTo: (targetPhase: MeetingPhase): boolean => {
     const currentMeeting = get().currentMeeting;

     if (targetPhase === 'development') {
       // Check if all purchased services have completed forms
       const purchasedServices = currentMeeting?.modules?.proposal?.purchasedServices || [];

       if (purchasedServices.length > 0) {
         const validation = validateServiceRequirements(
           purchasedServices,
           currentMeeting.implementationSpec || {}
         );

         if (!validation.isValid) {
           console.warn('Cannot transition: incomplete service requirements');
           return false; // TRANSITION BLOCKED
         }
       }
     }

     return true; // TRANSITION ALLOWED
   }
   ```
4. If validation fails:
   - Transition button disabled
   - `IncompleteServicesAlert` component displays
   - Shows list of missing services
5. If validation passes:
   - Transition allowed
   - Phase changes to `development`
   - User accesses Phase 3 development dashboard

---

## Component Structure

### ServiceRequirementsRouter (Main Router)

**File:** `src/components/Phase2/ServiceRequirementsRouter.tsx` (289 lines)

**Responsibilities:**
- Load purchased services from meeting
- Track completion status across all categories
- Provide sidebar navigation
- Dynamically render selected service component
- Display progress and statistics

**Key State:**
```typescript
const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
const purchasedServices = currentMeeting?.modules?.proposal?.purchasedServices || [];
const currentService = purchasedServices[currentServiceIndex];
const ServiceComponent = SERVICE_COMPONENT_MAP[currentService.id];
```

**Empty State Handling:**
```typescript
if (purchasedServices.length === 0) {
  return (
    <div className="text-center">
      <AlertCircle />
      <h2>לא נמצאו שירותים שנרכשו</h2>
      <p>חזור לשלב ההצעה כדי לאשר שירותים</p>
    </div>
  );
}
```

**Missing Component Handling:**
```typescript
if (!ServiceComponent) {
  return (
    <div className="text-center">
      <AlertCircle />
      <h2>טופס לא זמין עבור השירות הזה</h2>
      <p>Service ID: {currentService.id}</p>
    </div>
  );
}
```

### Individual Service Component Pattern

**Example:** `AutoLeadResponseSpec.tsx`

**Structure:**
```typescript
import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoLeadResponseConfig } from '../../../../types/automationServices';

export function AutoLeadResponseSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // 1. Local state for form data
  const [config, setConfig] = useState<Partial<AutoLeadResponseConfig>>({
    formPlatform: 'wix',
    emailService: 'sendgrid',
    // ... default values
  });

  // 2. Load existing data on mount/update
  useEffect(() => {
    const existing = currentMeeting?.implementationSpec?.automations?.find(
      a => a.serviceId === 'auto-lead-response'
    );
    if (existing) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // 3. Save handler
  const handleSave = () => {
    if (!currentMeeting) return;

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(a => a.serviceId !== 'auto-lead-response');
    updated.push({
      serviceId: 'auto-lead-response',
      serviceName: 'מענה אוטומטי ללידים מטפסים',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated
      }
    });
  };

  // 4. Form UI (Hebrew, RTL)
  return (
    <div className="space-y-6 p-8" dir="rtl">
      <h2>שירות #1: מענה אוטומטי ללידים מטפסים</h2>

      {/* Form fields */}
      <div>
        <label>פלטפורמת טפסים</label>
        <select value={config.formPlatform} onChange={...}>
          <option value="wix">Wix</option>
          <option value="wordpress">WordPress</option>
        </select>
      </div>

      <button onClick={handleSave}>שמור</button>
    </div>
  );
}
```

### Service Component Mapping

**File:** `src/config/serviceComponentMapping.ts` (308 lines)

**Two Critical Maps:**

1. **Component Map** - Maps service IDs to React components:
```typescript
export const SERVICE_COMPONENT_MAP: Record<string, React.FC> = {
  'auto-lead-response': AutoLeadResponseSpec,
  'auto-sms-whatsapp': AutoSmsWhatsappSpec,
  'ai-faq-bot': AIFAQBotSpec,
  'integration-simple': IntegrationSimpleSpec,
  'impl-crm': ImplCrmSpec,
  'data-cleanup': DataCleanupSpec,
  // ... all 59 services
};
```

2. **Category Map** - Maps service IDs to storage categories:
```typescript
export const SERVICE_CATEGORY_MAP: Record<string, string> = {
  'auto-lead-response': 'automations',
  'auto-sms-whatsapp': 'automations',
  'ai-faq-bot': 'aiAgentServices',
  'integration-simple': 'integrationServices',
  'impl-crm': 'systemImplementations',
  'data-cleanup': 'additionalServices',
  // ... all 59 services
};
```

**Helper Functions:**
```typescript
// Get category for a service
export function getServiceCategory(serviceId: string): string {
  return SERVICE_CATEGORY_MAP[serviceId] || 'unknown';
}

// Get component for a service
export function getServiceComponent(serviceId: string): React.FC | null {
  return SERVICE_COMPONENT_MAP[serviceId] || null;
}

// Check if service has component
export function hasServiceComponent(serviceId: string): boolean {
  return serviceId in SERVICE_COMPONENT_MAP;
}
```

---

## Creating a New Service Component

### Step 1: Define TypeScript Interface

Choose the appropriate type file based on service category:
- **Automations (1-20):** `src/types/automationServices.ts`
- **AI Agents (21-30):** `src/types/aiAgentServices.ts`
- **Integrations (31-40):** `src/types/integrationServices.ts`
- **System Implementations (41-49):** `src/types/systemImplementationServices.ts`
- **Additional Services (50-59):** `src/types/additionalServices.ts`

**Example:**
```typescript
// src/types/automationServices.ts

/**
 * Service #27: Custom Automation Logic
 * Requirements for implementing custom business logic automation
 */
export interface CustomAutomationRequirements {
  // Basic Info
  automationName: string;
  description: string;

  // Trigger Configuration
  triggerType: 'schedule' | 'webhook' | 'event' | 'manual';
  triggerDetails: string;

  // Logic Details
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less';
    value: string;
  }>;

  // Actions
  actions: Array<{
    type: 'email' | 'crm_update' | 'webhook' | 'notification';
    config: Record<string, any>;
  }>;

  // Systems Integration
  sourceSystem: string;
  targetSystems: string[];

  // Error Handling
  errorNotificationEmail: string;
  retryAttempts: number;
  fallbackBehavior: 'queue' | 'skip' | 'alert';

  // Testing
  testScenarios: string[];
  successCriteria: string;
}
```

### Step 2: Create React Component

Create component file in appropriate subdirectory:

**Directory Structure:**
```
src/components/Phase2/ServiceRequirements/
├── Automations/           <- For automation services
├── AIAgents/              <- For AI agent services
├── Integrations/          <- For integration services
├── SystemImplementations/ <- For system implementation services
└── AdditionalServices/    <- For additional services
```

**Example:** `src/components/Phase2/ServiceRequirements/Automations/CustomAutomationSpec.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { CustomAutomationRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';

export function CustomAutomationSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Initialize with default values
  const [config, setConfig] = useState<Partial<CustomAutomationRequirements>>({
    automationName: '',
    description: '',
    triggerType: 'webhook',
    triggerDetails: '',
    conditions: [],
    actions: [],
    sourceSystem: '',
    targetSystems: [],
    errorNotificationEmail: '',
    retryAttempts: 3,
    fallbackBehavior: 'queue',
    testScenarios: [],
    successCriteria: '',
  });

  // Load existing data when component mounts or meeting changes
  useEffect(() => {
    // DEFENSIVE: Check if data exists before accessing
    const existing = currentMeeting?.implementationSpec?.automations?.find(
      (a) => a.serviceId === 'custom-automation'
    );

    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Save handler - stores data in Zustand store
  const handleSave = () => {
    if (!currentMeeting) {
      console.warn('No current meeting - cannot save');
      return;
    }

    // Get existing automations array (or empty array if undefined)
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // Remove any existing entry for this service (prevents duplicates)
    const updated = automations.filter(a => a.serviceId !== 'custom-automation');

    // Add new/updated entry
    updated.push({
      serviceId: 'custom-automation',
      serviceName: 'אוטומציה מותאמת אישית',
      requirements: config as CustomAutomationRequirements,
      completedAt: new Date().toISOString(),
    });

    // Update meeting in store (triggers localStorage + Supabase sync)
    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });

    // Optional: Show success message
    console.log('Custom automation requirements saved successfully');
  };

  // Helper: Add new condition
  const addCondition = () => {
    setConfig({
      ...config,
      conditions: [
        ...(config.conditions || []),
        { field: '', operator: 'equals', value: '' }
      ]
    });
  };

  // Helper: Remove condition
  const removeCondition = (index: number) => {
    const updated = [...(config.conditions || [])];
    updated.splice(index, 1);
    setConfig({ ...config, conditions: updated });
  };

  return (
    <div className="space-y-6 p-8 max-w-4xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          שירות #27: אוטומציה מותאמת אישית
        </h1>
        <p className="text-gray-600 mt-2">
          הגדר את הפרטים הטכניים עבור אוטומציה מותאמת אישית
        </p>
      </div>

      {/* Basic Info */}
      <Card title="מידע בסיסי">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם האוטומציה
            </label>
            <input
              type="text"
              value={config.automationName}
              onChange={(e) => setConfig({ ...config, automationName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="למשל: עדכון אוטומטי של CRM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תיאור
            </label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="תאר את מטרת האוטומציה ואת התהליך העסקי שהיא תומכת בו"
            />
          </div>
        </div>
      </Card>

      {/* Trigger Configuration */}
      <Card title="הגדרות טריגר">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוג טריגר
            </label>
            <select
              value={config.triggerType}
              onChange={(e) => setConfig({ ...config, triggerType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="schedule">תזמון (Schedule)</option>
              <option value="webhook">Webhook</option>
              <option value="event">אירוע במערכת (Event)</option>
              <option value="manual">ידני (Manual)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              פרטי הטריגר
            </label>
            <textarea
              value={config.triggerDetails}
              onChange={(e) => setConfig({ ...config, triggerDetails: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="למשל: כל יום ב-09:00, או כאשר נוצר ליד חדש"
            />
          </div>
        </div>
      </Card>

      {/* Conditions */}
      <Card title="תנאים">
        <div className="space-y-4">
          {(config.conditions || []).map((condition, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="text"
                value={condition.field}
                onChange={(e) => {
                  const updated = [...(config.conditions || [])];
                  updated[index] = { ...updated[index], field: e.target.value };
                  setConfig({ ...config, conditions: updated });
                }}
                placeholder="שדה"
                className="flex-1 px-3 py-2 border rounded-md"
              />

              <select
                value={condition.operator}
                onChange={(e) => {
                  const updated = [...(config.conditions || [])];
                  updated[index] = { ...updated[index], operator: e.target.value as any };
                  setConfig({ ...config, conditions: updated });
                }}
                className="px-3 py-2 border rounded-md"
              >
                <option value="equals">שווה</option>
                <option value="contains">מכיל</option>
                <option value="greater">גדול מ</option>
                <option value="less">קטן מ</option>
              </select>

              <input
                type="text"
                value={condition.value}
                onChange={(e) => {
                  const updated = [...(config.conditions || [])];
                  updated[index] = { ...updated[index], value: e.target.value };
                  setConfig({ ...config, conditions: updated });
                }}
                placeholder="ערך"
                className="flex-1 px-3 py-2 border rounded-md"
              />

              <button
                onClick={() => removeCondition(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                הסר
              </button>
            </div>
          ))}

          <button
            onClick={addCondition}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            + הוסף תנאי
          </button>
        </div>
      </Card>

      {/* Error Handling */}
      <Card title="טיפול בשגיאות">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אימייל להתראות שגיאה
            </label>
            <input
              type="email"
              value={config.errorNotificationEmail}
              onChange={(e) => setConfig({ ...config, errorNotificationEmail: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="admin@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מספר ניסיונות חוזרים
            </label>
            <input
              type="number"
              value={config.retryAttempts}
              onChange={(e) => setConfig({ ...config, retryAttempts: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
              min="0"
              max="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              התנהגות במקרה של כשל
            </label>
            <select
              value={config.fallbackBehavior}
              onChange={(e) => setConfig({ ...config, fallbackBehavior: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="queue">שמור בתור לניסיון מאוחר יותר</option>
              <option value="skip">דלג על הפעולה</option>
              <option value="alert">שלח התראה בלבד</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md transition-colors"
        >
          שמור דרישות
        </button>
      </div>
    </div>
  );
}
```

### Step 3: Add to Service Component Mapping

**File:** `src/config/serviceComponentMapping.ts`

Add import at top:
```typescript
import { CustomAutomationSpec } from '../components/Phase2/ServiceRequirements/Automations/CustomAutomationSpec';
```

Add to `SERVICE_COMPONENT_MAP`:
```typescript
export const SERVICE_COMPONENT_MAP: Record<string, React.FC> = {
  // ... existing mappings
  'custom-automation': CustomAutomationSpec,
  // ... more mappings
};
```

Add to `SERVICE_CATEGORY_MAP`:
```typescript
export const SERVICE_CATEGORY_MAP: Record<string, string> = {
  // ... existing mappings
  'custom-automation': 'automations',
  // ... more mappings
};
```

### Step 4: Test Your Component

1. **Add service to purchased services** (for testing):
```typescript
// In browser console or test setup
const meeting = useMeetingStore.getState().currentMeeting;
meeting.modules.proposal.purchasedServices.push({
  id: 'custom-automation',
  name: 'Custom Automation Logic',
  nameHe: 'אוטומציה מותאמת אישית',
  category: 'automations',
  price: 5000
});
```

2. **Navigate to Phase 2 and verify**:
   - Service appears in sidebar
   - Component renders correctly
   - Form fields work
   - Save button stores data
   - Data persists after page refresh
   - Completion status updates

3. **Test validation**:
   - Try transitioning to Phase 3 without completing form (should be blocked)
   - Complete form
   - Try transitioning to Phase 3 (should be allowed)

---

## Type System

### Type Organization

Each service category has its own type file with all related interfaces:

**automationServices.ts** - Example structure:
```typescript
// Service #1: Auto Lead Response
export interface AutoLeadResponseRequirements {
  // ... fields
}

// Service #2: Auto SMS/WhatsApp
export interface AutoSmsWhatsappRequirements {
  // ... fields
}

// ... more services

// Shared types
export type TriggerType = 'immediate' | 'scheduled' | 'conditional';
export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push';

// Service entry wrapper
export interface AutomationServiceEntry {
  serviceId: string;
  serviceName: string;
  requirements: AutoLeadResponseRequirements | AutoSmsWhatsappRequirements | /* ... */;
  completedAt: string;
}
```

### Best Practices for Types

1. **Use union types for enums**:
```typescript
// GOOD
triggerType: 'schedule' | 'webhook' | 'event' | 'manual';

// BAD
triggerType: string;
```

2. **Make fields optional when appropriate**:
```typescript
interface ServiceRequirements {
  // Required fields
  serviceName: string;

  // Optional fields (use ?)
  notes?: string;
  customFields?: Record<string, any>;
}
```

3. **Use descriptive field names**:
```typescript
// GOOD
emailNotificationRecipients: string[];

// BAD
emails: string[];
```

4. **Document complex fields with comments**:
```typescript
interface Requirements {
  /**
   * Webhook URL that will receive POST requests when automation triggers.
   * Must be HTTPS and return 200 status within 30 seconds.
   */
  webhookUrl: string;
}
```

---

## Validation System

### Core Validation Logic

**File:** `src/utils/serviceRequirementsValidation.ts` (170 lines)

**Main Function:**
```typescript
/**
 * Validates that all purchased services have completed requirement forms
 */
export const validateServiceRequirements = (
  purchasedServices: any[],
  implementationSpec: any
): ServiceValidationResult => {
  // Collect all completed service IDs from all categories
  const completed = new Set<string>();

  // Check each category
  if (Array.isArray(implementationSpec.automations)) {
    implementationSpec.automations.forEach((automation: any) => {
      if (automation.serviceId) {
        completed.add(automation.serviceId);
      }
    });
  }

  // ... check other categories (aiAgentServices, integrationServices, etc.)

  // Find missing services
  const missingServices = purchasedServices
    .filter(service => !completed.has(service.id))
    .map(service => service.nameHe || service.name);

  return {
    isValid: missingServices.length === 0,
    missingServices,
    completedCount: completed.size,
    totalCount: purchasedServices.length
  };
};
```

**Helper Functions:**
```typescript
/**
 * Checks if Phase 2 is complete and ready for Phase 3 transition
 */
export const isPhase2Complete = (meeting: Meeting | null): boolean => {
  if (!meeting) return false;

  const purchasedServices = meeting.modules?.proposal?.purchasedServices || [];
  if (purchasedServices.length === 0) return false;

  const validation = validateServiceRequirements(
    purchasedServices,
    meeting.implementationSpec || {}
  );

  return validation.isValid;
};

/**
 * Gets detailed completion status breakdown
 */
export const getServiceCompletionStatus = (meeting: Meeting | null): ServiceValidationResult => {
  // ... implementation
};
```

### Integration with useMeetingStore

**File:** `src/store/useMeetingStore.ts`

The validation is integrated into the phase transition logic:

```typescript
import { validateServiceRequirements } from '../utils/serviceRequirementsValidation';

const useMeetingStore = create<MeetingStore>((set, get) => ({
  // ... other store methods

  /**
   * Check if transition to target phase is allowed
   */
  canTransitionTo: (targetPhase: MeetingPhase): boolean => {
    const currentMeeting = get().currentMeeting;
    if (!currentMeeting) return false;

    // Special validation for Phase 2 → Phase 3
    if (targetPhase === 'development') {
      const purchasedServices = currentMeeting?.modules?.proposal?.purchasedServices || [];

      // If there are purchased services, all must have completed forms
      if (purchasedServices.length > 0) {
        const validation = validateServiceRequirements(
          purchasedServices,
          currentMeeting.implementationSpec || {}
        );

        if (!validation.isValid) {
          console.warn('[Phase Transition] Cannot transition to development:');
          console.warn(`Missing services: ${validation.missingServices.join(', ')}`);
          console.warn(`Completed: ${validation.completedCount}/${validation.totalCount}`);
          return false; // GATE: Block transition
        }
      }
    }

    // ... other phase transition checks

    return true;
  },

  /**
   * Perform phase transition
   */
  transitionPhase: (targetPhase: MeetingPhase, notes?: string): boolean => {
    // Check if transition is allowed
    if (!get().canTransitionTo(targetPhase)) {
      console.error('Phase transition not allowed');
      return false;
    }

    // Perform transition
    // ... implementation
  }
}));
```

### UI Alert Component

**File:** `src/components/Phase2/IncompleteServicesAlert.tsx` (115 lines)

**IncompleteServicesAlert Component:**
```typescript
export const IncompleteServicesAlert: React.FC = () => {
  const { currentMeeting } = useMeetingStore();

  const purchasedServices = currentMeeting?.modules?.proposal?.purchasedServices || [];
  const validation = validateServiceRequirements(
    purchasedServices,
    currentMeeting?.implementationSpec || {}
  );

  // Don't render if complete or no services
  if (validation.isValid || purchasedServices.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg" dir="rtl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600" />
        <div>
          <h4 className="font-semibold text-orange-900">
            יש שירותים שטרם הושלמו
          </h4>
          <p className="text-sm text-orange-800 mt-1">
            לא ניתן לעבור לשלב הפיתוח לפני השלמת הפרטים הטכניים:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm">
            {validation.missingServices.map(service => (
              <li key={service}>{service}</li>
            ))}
          </ul>
          <div className="mt-3 text-sm font-medium">
            התקדמות: {validation.completedCount} מתוך {validation.totalCount}
          </div>
        </div>
      </div>
    </div>
  );
};
```

**CompletionProgressBar Component:**
```typescript
export const CompletionProgressBar: React.FC = () => {
  const { currentMeeting } = useMeetingStore();
  const validation = validateServiceRequirements(/* ... */);

  const percentage = Math.round(
    (validation.completedCount / validation.totalCount) * 100
  );

  return (
    <div className="w-full" dir="rtl">
      <div className="flex justify-between mb-2">
        <span>השלמת דרישות שירותים</span>
        <span>{validation.completedCount} / {validation.totalCount}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${validation.isValid ? 'bg-green-600' : 'bg-orange-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

---

## Common Patterns

### Pattern 1: Defensive Data Loading

Always use defensive patterns when loading data from meeting:

```typescript
useEffect(() => {
  // DEFENSIVE: Multiple null checks
  const category = currentMeeting?.implementationSpec?.automations;
  const existing = category?.find(item => item.serviceId === 'service-id');

  if (existing?.requirements) {
    setConfig(existing.requirements);
  }
}, [currentMeeting]);
```

**Why?**
- `implementationSpec` might not exist yet
- Category array might be undefined
- Entry might not exist
- Requirements might be empty

### Pattern 2: Defensive Data Saving

Always filter out existing entry before adding new one:

```typescript
const handleSave = () => {
  if (!currentMeeting) return;

  // DEFENSIVE: Default to empty array if undefined
  const automations = currentMeeting?.implementationSpec?.automations || [];

  // Remove existing entry (prevents duplicates)
  const updated = automations.filter(a => a.serviceId !== 'service-id');

  // Add new/updated entry
  updated.push({
    serviceId: 'service-id',
    serviceName: 'שם השירות',
    requirements: config,
    completedAt: new Date().toISOString()
  });

  updateMeeting(currentMeeting.id, {
    implementationSpec: {
      ...currentMeeting.implementationSpec,
      automations: updated
    }
  });
};
```

**Why?**
- Prevents duplicate entries
- Handles undefined arrays gracefully
- Maintains data integrity

### Pattern 3: Array Safety

Always default to empty array when accessing category arrays:

```typescript
// GOOD
const automations = currentMeeting?.implementationSpec?.automations || [];
automations.forEach(item => {
  // Safe to iterate
});

// BAD
const automations = currentMeeting.implementationSpec.automations;
automations.forEach(item => {
  // Will crash if automations is undefined
});
```

### Pattern 4: Conditional Field Rendering

Show/hide fields based on other field values:

```typescript
return (
  <div>
    <select
      value={config.triggerType}
      onChange={(e) => setConfig({ ...config, triggerType: e.target.value })}
    >
      <option value="schedule">Schedule</option>
      <option value="webhook">Webhook</option>
    </select>

    {/* Conditional field - only show if trigger is webhook */}
    {config.triggerType === 'webhook' && (
      <div>
        <label>Webhook URL</label>
        <input
          type="url"
          value={config.webhookUrl}
          onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
        />
      </div>
    )}
  </div>
);
```

### Pattern 5: Dynamic Array Fields

Allow users to add/remove items from arrays:

```typescript
// Add item
const addItem = () => {
  setConfig({
    ...config,
    items: [...(config.items || []), { name: '', value: '' }]
  });
};

// Remove item
const removeItem = (index: number) => {
  const updated = [...(config.items || [])];
  updated.splice(index, 1);
  setConfig({ ...config, items: updated });
};

// Update item
const updateItem = (index: number, field: string, value: any) => {
  const updated = [...(config.items || [])];
  updated[index] = { ...updated[index], [field]: value };
  setConfig({ ...config, items: updated });
};

// Render
return (
  <div>
    {(config.items || []).map((item, index) => (
      <div key={index}>
        <input
          value={item.name}
          onChange={(e) => updateItem(index, 'name', e.target.value)}
        />
        <button onClick={() => removeItem(index)}>Remove</button>
      </div>
    ))}
    <button onClick={addItem}>Add Item</button>
  </div>
);
```

---

## Testing

### Manual Testing Checklist

For each new service component:

1. **Component Rendering**
   - [ ] Component appears in ServiceRequirementsRouter sidebar
   - [ ] Component renders without errors
   - [ ] All form fields display correctly
   - [ ] Hebrew text displays correctly (RTL)

2. **Data Loading**
   - [ ] Fresh state: Component loads with default values
   - [ ] Existing data: Component loads saved data correctly
   - [ ] Page refresh: Data persists after reload

3. **Data Saving**
   - [ ] Save button stores data in correct category
   - [ ] Service ID matches exactly
   - [ ] CompletedAt timestamp is set
   - [ ] Data appears in implementationSpec.[category]

4. **Validation**
   - [ ] Before completing: Service shows as incomplete in sidebar
   - [ ] Before completing: Cannot transition to Phase 3
   - [ ] After completing: Service shows checkmark in sidebar
   - [ ] After completing: Can transition to Phase 3 (if all other services complete)

5. **Edge Cases**
   - [ ] Handle empty/undefined fields gracefully
   - [ ] Handle very long text inputs
   - [ ] Handle special characters in text fields
   - [ ] Handle array fields (add/remove items)

### Automated Testing

Create unit tests for validation logic:

**File:** `src/utils/__tests__/serviceRequirementsValidation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { validateServiceRequirements, isPhase2Complete } from '../serviceRequirementsValidation';

describe('validateServiceRequirements', () => {
  it('should return valid when all services completed', () => {
    const purchasedServices = [
      { id: 'auto-lead-response', name: 'Service 1', nameHe: 'שירות 1' }
    ];

    const implementationSpec = {
      automations: [
        {
          serviceId: 'auto-lead-response',
          serviceName: 'שירות 1',
          requirements: {},
          completedAt: '2025-01-01T00:00:00Z'
        }
      ]
    };

    const result = validateServiceRequirements(purchasedServices, implementationSpec);

    expect(result.isValid).toBe(true);
    expect(result.missingServices).toEqual([]);
    expect(result.completedCount).toBe(1);
    expect(result.totalCount).toBe(1);
  });

  it('should return invalid when services are missing', () => {
    const purchasedServices = [
      { id: 'auto-lead-response', name: 'Service 1', nameHe: 'שירות 1' },
      { id: 'ai-faq-bot', name: 'Service 2', nameHe: 'שירות 2' }
    ];

    const implementationSpec = {
      automations: [
        {
          serviceId: 'auto-lead-response',
          serviceName: 'שירות 1',
          requirements: {},
          completedAt: '2025-01-01T00:00:00Z'
        }
      ]
      // Missing ai-faq-bot
    };

    const result = validateServiceRequirements(purchasedServices, implementationSpec);

    expect(result.isValid).toBe(false);
    expect(result.missingServices).toEqual(['שירות 2']);
    expect(result.completedCount).toBe(1);
    expect(result.totalCount).toBe(2);
  });
});
```

---

## Troubleshooting

### Service form doesn't appear in router

**Symptoms:**
- Service is in purchased services
- Sidebar shows service
- Clicking service shows "component not available" error

**Solutions:**
1. Check `serviceComponentMapping.ts`:
   - Verify service ID exists in `SERVICE_COMPONENT_MAP`
   - Verify service ID exists in `SERVICE_CATEGORY_MAP`
   - Check service ID spelling (case-sensitive)
2. Check component import:
   - Verify import statement at top of file
   - Verify component is properly exported from its file
3. Check for TypeScript errors:
   - Run `npm run build:typecheck`
   - Fix any compilation errors

### Data not saving

**Symptoms:**
- Click save button
- No error messages
- Data doesn't persist after refresh
- Service shows as incomplete

**Solutions:**
1. Check service ID in save handler:
   ```typescript
   // Make sure this matches exactly
   serviceId: 'auto-lead-response',
   ```
2. Check category in updateMeeting call:
   ```typescript
   // Must be one of: automations, aiAgentServices, integrationServices,
   // systemImplementations, additionalServices
   automations: updated
   ```
3. Check browser console for errors
4. Verify `updateMeeting()` is being called:
   ```typescript
   const handleSave = () => {
     console.log('Saving...', config);
     updateMeeting(/* ... */);
   };
   ```

### Validation not working

**Symptoms:**
- All services complete
- Still can't transition to Phase 3
- IncompleteServicesAlert still showing

**Solutions:**
1. Check serviceId matches purchased service ID:
   ```typescript
   // In component save handler
   serviceId: 'auto-lead-response', // Must match exactly

   // In purchased services
   { id: 'auto-lead-response', ... }
   ```
2. Check category is correct in `SERVICE_CATEGORY_MAP`
3. Open browser console and look for validation warnings
4. Manually check data structure:
   ```typescript
   // In browser console
   const meeting = useMeetingStore.getState().currentMeeting;
   console.log('Purchased:', meeting.modules.proposal.purchasedServices);
   console.log('Completed:', meeting.implementationSpec);
   ```

### Component not rendering / White screen

**Symptoms:**
- Blank screen when selecting service
- Browser console shows error
- React error boundary triggered

**Solutions:**
1. Check for TypeScript errors:
   - Missing imports
   - Type mismatches
   - Undefined variables
2. Check for undefined access:
   - Add defensive null checks
   - Use optional chaining (`?.`)
   - Default to empty values
3. Check component export:
   ```typescript
   // Make sure component is exported
   export function MyServiceSpec() {
     // ...
   }
   ```

### Data structure mismatch

**Symptoms:**
- Old data doesn't load correctly
- Fields show wrong values
- TypeScript errors about missing properties

**Solutions:**
1. Add data migration (if structure changed):
   - See `src/utils/dataMigration.ts` for examples
   - Increment `CURRENT_DATA_VERSION`
   - Add migration function
2. Use defensive defaults:
   ```typescript
   const [config, setConfig] = useState({
     // Provide defaults for all fields
     field1: '',
     field2: 'default',
     field3: [],
   });
   ```
3. Handle both old and new structures:
   ```typescript
   useEffect(() => {
     const existing = currentMeeting?.implementationSpec?.automations?.find(
       a => a.serviceId === 'service-id'
     );

     if (existing) {
       setConfig({
         // Map old structure to new structure
         field1: existing.requirements.field1 || existing.requirements.oldField1 || '',
         field2: existing.requirements.field2 || 'default',
       });
     }
   }, [currentMeeting]);
   ```

---

## Additional Resources

### Related Files

- **CLAUDE.md** - Main project documentation
- **src/types/phase2.ts** - Legacy Phase 2 types (coexists with new system)
- **src/config/serviceRequirementsTemplates.ts** - Service configuration templates
- **src/components/Phase2/ImplementationSpecDashboard.tsx** - Phase 2 main dashboard

### Key Concepts

- **Service ID**: Unique identifier for each service (e.g., 'auto-lead-response')
- **Service Category**: Storage category (automations, aiAgentServices, etc.)
- **Purchased Services**: Services approved by client in Phase 1
- **Service Entry**: Wrapper object containing serviceId, serviceName, requirements, completedAt
- **Requirements**: The actual technical specification object (type varies per service)

### Development Workflow

1. Create TypeScript interface in appropriate type file
2. Create React component with form fields
3. Add component to serviceComponentMapping.ts
4. Test component rendering and data flow
5. Verify validation works correctly
6. Document any special requirements or gotchas

---

**Questions or Issues?**

If you encounter problems not covered in this guide:
1. Check browser console for errors
2. Review CLAUDE.md for architectural context
3. Examine existing service components for patterns
4. Check git history for recent changes to related files
