# Fix Service Component: Auto Multi-System Integration

## What You Need To Do

**Simple job:** Replace the current implementation with FULL TypeScript interface coverage.

## Service Details
- **Service ID:** `auto-multi-system`
- **Service Number:** #16
- **Service Name (Hebrew):** אינטגרציה רב-מערכתית מורכבת
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** ~7%
- **Target Coverage:** 95%+

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** 4137
**Search for:** `export interface AutoMultiSystemRequirements`

**Action:** Read lines 4137-4357 completely (~85 fields).

**Key sections:**
- `systems` - Array of participating systems (each with credentials)
- `integrationArchitecture` - Hub-spoke vs peer-to-peer
- `dataFlowMapping` - Complex data flow between systems
- `transformationRules` - Data transformation logic
- `conflictResolution` - Handling data conflicts
- `syncStrategy` - Real-time vs batch synchronization
- `errorHandling` - Multi-system error management
- `performanceOptimization` - Caching, batching
- `security` - Encryption, access control
- `n8nWorkflow` - Advanced workflow configuration

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoMultiSystemSpec.tsx`

**Current problem:** Using simplified interface instead of 85-field comprehensive structure.

### 3. Reference Example
**AutoApprovalWorkflowSpec.tsx** - Complex multi-tab UI

## Implementation Structure

```typescript
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoMultiSystemRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2 } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function AutoMultiSystemSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoMultiSystemRequirements>({
    systems: [],
    integrationArchitecture: {
      pattern: 'hub_spoke',
      hubSystem: '',
      dataFlowDirection: 'bidirectional'
    },
    dataFlowMapping: {
      flows: [],
      masterDataSource: '',
      syncPriority: []
    },
    transformationRules: {
      fieldMappings: [],
      dataTypeConversions: [],
      businessRuleValidations: []
    },
    conflictResolution: {
      strategy: 'last_write_wins',
      prioritySystem: '',
      manualReviewRequired: false
    },
    syncStrategy: {
      syncType: 'realtime',
      syncFrequency: 'on_change',
      batchSize: 0,
      syncWindows: []
    },
    errorHandling: {
      retryStrategy: {
        enabled: true,
        maxAttempts: 3,
        backoffMultiplier: 2
      },
      failureHandling: {
        logFailures: true,
        alertOnFailure: true,
        alertEmail: '',
        deadLetterQueue: false
      }
    },
    performanceOptimization: {
      caching: {
        enabled: false,
        cacheDuration: 0
      },
      rateLimiting: {
        enabled: false,
        requestsPerSecond: 0
      },
      parallelization: {
        enabled: false,
        maxConcurrent: 0
      }
    },
    security: {
      encryption: {
        inTransit: true,
        atRest: false
      },
      accessControl: {
        roleBasedAccess: false,
        systemLevelPermissions: []
      },
      auditLogging: {
        enabled: true,
        logLevel: 'info'
      }
    },
    n8nWorkflow: {
      instanceUrl: '',
      webhookEndpoints: [],
      workflowIds: [],
      errorHandling: {
        retryAttempts: 3,
        alertEmail: '',
        logErrors: true
      }
    }
  });

  const [activeTab, setActiveTab] = useState<'systems' | 'architecture' | 'dataflow' | 'transformation' | 'conflict' | 'sync' | 'errors' | 'performance' | 'security' | 'workflow'>('systems');

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(item => item.serviceId === 'auto-multi-system');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(item => item.serviceId !== 'auto-multi-system');

    updated.push({
      serviceId: 'auto-multi-system',
      serviceName: 'אינטגרציה רב-מערכתית מורכבת',
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

  const addSystem = () => {
    setConfig({
      ...config,
      systems: [
        ...(config.systems || []),
        {
          systemId: generateId(),
          systemName: '',
          systemType: '',
          role: 'spoke',
          credentials: {},
          rateLimits: {},
          dataModel: {
            entities: [],
            relationships: []
          }
        }
      ]
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #16: אינטגרציה רב-מערכתית מורכבת">
        {/* 10 Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('systems')} className={`px-4 py-2 ${activeTab === 'systems' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            מערכות
          </button>
          <button onClick={() => setActiveTab('architecture')} className={`px-4 py-2 ${activeTab === 'architecture' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            ארכיטקטורה
          </button>
          <button onClick={() => setActiveTab('dataflow')} className={`px-4 py-2 ${activeTab === 'dataflow' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            זרימת נתונים
          </button>
          <button onClick={() => setActiveTab('transformation')} className={`px-4 py-2 ${activeTab === 'transformation' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            טרנספורמציות
          </button>
          <button onClick={() => setActiveTab('conflict')} className={`px-4 py-2 ${activeTab === 'conflict' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            פתרון קונפליקטים
          </button>
          <button onClick={() => setActiveTab('sync')} className={`px-4 py-2 ${activeTab === 'sync' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            אסטרטגיית סנכרון
          </button>
          <button onClick={() => setActiveTab('errors')} className={`px-4 py-2 ${activeTab === 'errors' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            טיפול בשגיאות
          </button>
          <button onClick={() => setActiveTab('performance')} className={`px-4 py-2 ${activeTab === 'performance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            ביצועים
          </button>
          <button onClick={() => setActiveTab('security')} className={`px-4 py-2 ${activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            אבטחה
          </button>
          <button onClick={() => setActiveTab('workflow')} className={`px-4 py-2 ${activeTab === 'workflow' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            n8n
          </button>
        </div>

        <div className="space-y-4">
          {/* Implement ALL fields */}
          {activeTab === 'systems' && (
            <div className="space-y-4">
              {config.systems?.map((system, index) => (
                <div key={system.systemId} className="border p-4 rounded">
                  {/* System fields */}
                  <button onClick={() => {/* remove system */}}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={addSystem} className="flex items-center gap-2 text-blue-600">
                <Plus className="w-4 h-4" />
                <span>הוסף מערכת</span>
              </button>
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

## Tab Organization (85 fields)

**Tab 1 - Systems:** Array of participating systems with full credentials
**Tab 2 - Architecture:** Hub-spoke vs peer-to-peer pattern
**Tab 3 - Data Flow:** Flow mappings between systems
**Tab 4 - Transformation:** Field mappings, type conversions, validations
**Tab 5 - Conflict Resolution:** Strategy for handling conflicts
**Tab 6 - Sync Strategy:** Real-time vs batch, frequency, windows
**Tab 7 - Error Handling:** Retry strategy, failure handling, DLQ
**Tab 8 - Performance:** Caching, rate limiting, parallelization
**Tab 9 - Security:** Encryption, access control, audit logging
**Tab 10 - Workflow:** n8n webhook endpoints and workflow IDs

## Complex Array Fields

- `systems` array (each system has nested credentials and data model)
- `dataFlowMapping.flows` array
- `transformationRules.fieldMappings` array
- `syncStrategy.syncWindows` array
- `n8nWorkflow.webhookEndpoints` array
- `n8nWorkflow.workflowIds` array

## Success Criteria

- [ ] All 85 fields from interface implemented
- [ ] 10 tabs organizing fields
- [ ] Systems array with full CRUD
- [ ] All nested arrays functional
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoMultiSystemSpec.tsx`
