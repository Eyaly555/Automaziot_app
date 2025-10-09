# Fix Service Component: Auto System Sync

## What You Need To Do

**Simple job:** Replace the current implementation with FULL TypeScript interface coverage.

## Service Details
- **Service ID:** `auto-system-sync`
- **Service Number:** #14
- **Service Name (Hebrew):** סנכרון בין מערכות
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** ~8%
- **Target Coverage:** 95%+

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** 3763
**Search for:** `export interface AutoSystemSyncRequirements`

**Action:** Read lines 3763-3915 completely (~75 fields).

**Key sections:**
- `sourceSystem` - Source system credentials and config
- `targetSystem` - Target system credentials and config
- `syncConfiguration` - Sync strategy and scheduling
- `fieldMapping` - Detailed field-to-field mapping
- `dataTransformation` - Transformation rules
- `conflictResolution` - Handling data conflicts
- `errorHandling` - Sync error management
- `performanceSettings` - Batch size, rate limiting
- `monitoring` - Sync monitoring and alerts
- `n8nWorkflow` - Workflow integration

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoSystemSyncSpec.tsx`

**Current problem:** Using simplified interface instead of 75-field structure.

### 3. Reference Example
**AutoApprovalWorkflowSpec.tsx** - Multi-tab organization

## Implementation Structure

```typescript
import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoSystemSyncRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2 } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function AutoSystemSyncSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoSystemSyncRequirements>({
    sourceSystem: {
      systemName: '',
      systemType: '',
      authMethod: 'oauth',
      credentials: {},
      apiEndpoint: '',
      rateLimits: {
        requestsPerSecond: 0,
        requestsPerDay: 0
      },
      dataModel: {
        entities: [],
        fieldsAvailable: []
      }
    },
    targetSystem: {
      systemName: '',
      systemType: '',
      authMethod: 'oauth',
      credentials: {},
      apiEndpoint: '',
      rateLimits: {
        requestsPerSecond: 0,
        requestsPerDay: 0
      },
      dataModel: {
        entities: [],
        fieldsAvailable: []
      }
    },
    syncConfiguration: {
      syncDirection: 'unidirectional',
      syncFrequency: 'realtime',
      scheduledSync: {
        enabled: false,
        cronExpression: '',
        timezone: ''
      },
      initialSync: {
        required: false,
        historicalDataDays: 0
      }
    },
    fieldMapping: {
      mappings: [],
      unmappedFields: {
        strategy: 'ignore'
      }
    },
    dataTransformation: {
      transformations: [],
      customLogic: {
        enabled: false,
        code: ''
      }
    },
    conflictResolution: {
      strategy: 'source_wins',
      lastModifiedTracking: false,
      manualReviewQueue: false
    },
    errorHandling: {
      retryStrategy: {
        enabled: true,
        maxAttempts: 3,
        backoffMultiplier: 2
      },
      onFailure: {
        pauseSync: false,
        alertEmail: '',
        logToFile: true
      }
    },
    performanceSettings: {
      batchSize: 100,
      parallelRequests: 1,
      caching: {
        enabled: false,
        ttl: 0
      }
    },
    monitoring: {
      syncMetrics: {
        trackSuccessRate: true,
        trackLatency: true,
        trackDataVolume: true
      },
      alerts: {
        onSyncFailure: true,
        onHighLatency: false,
        alertEmail: ''
      }
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

  const [activeTab, setActiveTab] = useState<'source' | 'target' | 'sync' | 'mapping' | 'transform' | 'conflict' | 'errors' | 'performance' | 'monitoring' | 'workflow'>('source');

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(item => item.serviceId === 'auto-system-sync');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const automations = currentMeeting?.implementationSpec?.automations || [];
    const updated = automations.filter(item => item.serviceId !== 'auto-system-sync');

    updated.push({
      serviceId: 'auto-system-sync',
      serviceName: 'סנכרון בין מערכות',
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
      <Card title="שירות #14: סנכרון בין מערכות">
        {/* 10 Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('source')} className={`px-4 py-2 ${activeTab === 'source' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            מערכת מקור
          </button>
          <button onClick={() => setActiveTab('target')} className={`px-4 py-2 ${activeTab === 'target' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            מערכת יעד
          </button>
          <button onClick={() => setActiveTab('sync')} className={`px-4 py-2 ${activeTab === 'sync' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            הגדרות סנכרון
          </button>
          <button onClick={() => setActiveTab('mapping')} className={`px-4 py-2 ${activeTab === 'mapping' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            מיפוי שדות
          </button>
          <button onClick={() => setActiveTab('transform')} className={`px-4 py-2 ${activeTab === 'transform' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            טרנספורמציות
          </button>
          <button onClick={() => setActiveTab('conflict')} className={`px-4 py-2 ${activeTab === 'conflict' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            פתרון קונפליקטים
          </button>
          <button onClick={() => setActiveTab('errors')} className={`px-4 py-2 ${activeTab === 'errors' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            טיפול בשגיאות
          </button>
          <button onClick={() => setActiveTab('performance')} className={`px-4 py-2 ${activeTab === 'performance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            ביצועים
          </button>
          <button onClick={() => setActiveTab('monitoring')} className={`px-4 py-2 ${activeTab === 'monitoring' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            ניטור
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

## Tab Organization (75 fields)

**Tab 1 - Source System:** System credentials, API config, rate limits, data model
**Tab 2 - Target System:** System credentials, API config, rate limits, data model
**Tab 3 - Sync Configuration:** Direction, frequency, scheduling, initial sync
**Tab 4 - Field Mapping:** Mappings array, unmapped fields strategy
**Tab 5 - Transformation:** Transformation rules array, custom logic
**Tab 6 - Conflict Resolution:** Strategy, tracking, manual review
**Tab 7 - Error Handling:** Retry strategy, failure actions
**Tab 8 - Performance:** Batch size, parallel requests, caching
**Tab 9 - Monitoring:** Metrics tracking, alerts configuration
**Tab 10 - Workflow:** n8n integration

## Array Fields

- `sourceSystem.dataModel.entities` array
- `sourceSystem.dataModel.fieldsAvailable` array
- `targetSystem.dataModel.entities` array
- `targetSystem.dataModel.fieldsAvailable` array
- `fieldMapping.mappings` array
- `dataTransformation.transformations` array

## System-Specific Credentials

Both `sourceSystem` and `targetSystem` need conditional credential fields based on `authMethod` and `systemType`.

## Success Criteria

- [ ] All 75 fields from interface implemented
- [ ] 10 tabs organizing fields
- [ ] All array fields have add/remove
- [ ] Conditional credentials for both systems
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoSystemSyncSpec.tsx`
