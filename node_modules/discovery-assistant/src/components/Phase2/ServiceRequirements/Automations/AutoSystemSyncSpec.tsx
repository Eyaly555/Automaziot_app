import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import type { AutoSystemSyncRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2, Save, CheckCircle, AlertCircle, Info } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 11);

/**
 * Smart Auto System Sync Spec Component
 *
 * NOW WITH INTELLIGENT FIELD PRE-POPULATION:
 * - Auto-fills n8n instance URL from Phase 1 automation requirements
 * - Auto-fills alert email from company contact or automation defaults
 * - Auto-fills sync frequency from integration requirements
 * - Shows "Auto-filled from Phase 1" badges
 * - Detects and warns about conflicts
 */
export function AutoSystemSyncSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nWorkflow.instanceUrl',
    serviceId: 'auto-system-sync',
    autoSave: false // We'll batch save
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'n8nWorkflow.errorHandling.alertEmail',
    serviceId: 'auto-system-sync',
    autoSave: false
  });

  const syncFrequency = useSmartField<string>({
    fieldId: 'sync_frequency',
    localPath: 'syncLogic.syncFrequency',
    serviceId: 'auto-system-sync',
    autoSave: false
  });

  const [config, setConfig] = useState<AutoSystemSyncRequirements>({
    systems: [],
    dataFlow: {
      flowDiagram: '',
      flows: []
    },
    globalFieldMapping: {
      masterDataDefinitions: []
    },
    syncLogic: {
      syncType: 'incremental',
      conflictResolution: 'newest_wins',
      deduplicationEnabled: false,
      deduplicationFields: []
    },
    dataTransformation: {
      enabled: false,
      transformations: [],
      dateFormatStandardization: false,
      currencyConversion: false,
      timezoneHandling: false
    },
    errorHandling: {
      strategy: 'retry',
      retryAttempts: 3,
      retryDelay: 5,
      partialFailureHandling: 'continue',
      errorNotificationEmail: '',
      logAllSyncAttempts: true
    },
    webhooks: {
      enabled: false,
      systemWebhooks: []
    },
    initialDataLoad: {
      required: false,
      strategy: 'sequential',
      bulkImportSupported: false,
      estimatedRecordCount: 0,
      estimatedTimeDays: 0
    },
    syncStateTracking: {
      database: 'supabase',
      trackingTables: {
        syncLogs: 'sync_logs',
        entityMapping: 'entity_mapping',
        conflictQueue: 'conflict_queue'
      }
    },
    monitoring: {
      enabled: false,
      metricsToTrack: [],
      alerting: {
        syncFailures: false,
        dataDrift: false,
        performanceIssues: false,
        apiRateLimitApproaching: false
      }
    },
    n8nWorkflow: {
      instanceUrl: '',
      webhookEndpoint: '',
      httpsEnabled: true,
      workflowComplexity: 'moderate',
      errorHandling: {
        retryAttempts: 3,
        alertEmail: '',
        logErrors: true
      }
    }
  });

  const [activeTab, setActiveTab] = useState<'systems' | 'flows' | 'mapping' | 'logic' | 'transform' | 'errors' | 'webhooks' | 'initial' | 'monitoring' | 'n8n'>('systems');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving: autoSaveIsSaving, saveError } = useAutoSave({
    serviceId: 'auto-system-sync',
    category: 'automations'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      n8nWorkflow: {
        ...config.n8nWorkflow,
        instanceUrl: n8nInstanceUrl.value || config.n8nWorkflow.instanceUrl,
        errorHandling: {
          ...config.n8nWorkflow.errorHandling,
          alertEmail: alertEmail.value || config.n8nWorkflow.errorHandling.alertEmail
        }
      },
      syncLogic: {
        ...config.syncLogic,
        syncFrequency: syncFrequency.value || config.syncLogic.syncFrequency
      }
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: any) => a.serviceId === 'auto-system-sync');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Save handler
  const handleSave = async () => {
    const completeConfig = {
      ...config,
      syncLogic: {
        ...config.syncLogic,
        syncFrequency: syncFrequency.value || config.syncLogic.syncFrequency
      },
      n8nWorkflow: {
        ...config.n8nWorkflow,
        instanceUrl: n8nInstanceUrl.value || config.n8nWorkflow.instanceUrl,
        errorHandling: {
          ...config.n8nWorkflow.errorHandling,
          alertEmail: alertEmail.value || config.n8nWorkflow.errorHandling.alertEmail
        }
      }
    };

    await saveData(completeConfig);
  };

  // Systems management
  const addSystem = () => {
    setConfig({
      ...config,
      systems: [
        ...config.systems,
        {
          id: generateId(),
          name: '',
          type: 'crm',
          authMethod: 'oauth',
          credentials: {},
          apiEndpoints: {
            base: ''
          },
          rateLimits: {}
        }
      ]
    });
  };

  const removeSystem = (index: number) => {
    setConfig({
      ...config,
      systems: config.systems.filter((_, i) => i !== index)
    });
  };

  // Data flows management
  const addDataFlow = () => {
    setConfig({
      ...config,
      dataFlow: {
        ...config.dataFlow,
        flows: [
          ...config.dataFlow.flows,
          {
            id: generateId(),
            sourceSystem: '',
            targetSystems: [],
            entityType: 'customer',
            syncDirection: 'one_way',
            frequency: 'real_time'
          }
        ]
      }
    });
  };

  const removeDataFlow = (index: number) => {
    setConfig({
      ...config,
      dataFlow: {
        ...config.dataFlow,
        flows: config.dataFlow.flows.filter((_, i) => i !== index)
      }
    });
  };

  // Master data definitions management
  const addMasterDataDefinition = () => {
    setConfig({
      ...config,
      globalFieldMapping: {
        masterDataDefinitions: [
          ...config.globalFieldMapping.masterDataDefinitions,
          {
            entityType: '',
            masterFields: []
          }
        ]
      }
    });
  };

  const removeMasterDataDefinition = (index: number) => {
    setConfig({
      ...config,
      globalFieldMapping: {
        masterDataDefinitions: config.globalFieldMapping.masterDataDefinitions.filter((_, i) => i !== index)
      }
    });
  };

  const addMasterField = (defIndex: number) => {
    const updatedDefs = [...config.globalFieldMapping.masterDataDefinitions];
    updatedDefs[defIndex].masterFields.push({
      fieldName: '',
      fieldType: '',
      required: false,
      systemMappings: {}
    });
    setConfig({
      ...config,
      globalFieldMapping: {
        masterDataDefinitions: updatedDefs
      }
    });
  };

  const removeMasterField = (defIndex: number, fieldIndex: number) => {
    const updatedDefs = [...config.globalFieldMapping.masterDataDefinitions];
    updatedDefs[defIndex].masterFields = updatedDefs[defIndex].masterFields.filter((_, i) => i !== fieldIndex);
    setConfig({
      ...config,
      globalFieldMapping: {
        masterDataDefinitions: updatedDefs
      }
    });
  };

  // Transformations management
  const addTransformation = () => {
    setConfig({
      ...config,
      dataTransformation: {
        ...config.dataTransformation,
        transformations: [
          ...config.dataTransformation.transformations,
          {
            sourceSystem: '',
            targetSystem: '',
            transformationType: 'format',
            transformationLogic: ''
          }
        ]
      }
    });
  };

  const removeTransformation = (index: number) => {
    setConfig({
      ...config,
      dataTransformation: {
        ...config.dataTransformation,
        transformations: config.dataTransformation.transformations.filter((_, i) => i !== index)
      }
    });
  };

  // Webhooks management
  const addWebhook = () => {
    setConfig({
      ...config,
      webhooks: {
        ...config.webhooks,
        systemWebhooks: [
          ...config.webhooks.systemWebhooks,
          {
            systemId: '',
            webhookUrl: '',
            events: []
          }
        ]
      }
    });
  };

  const removeWebhook = (index: number) => {
    setConfig({
      ...config,
      webhooks: {
        ...config.webhooks,
        systemWebhooks: config.webhooks.systemWebhooks.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                סנכרון בין מערכות
              </h1>
              <p className="text-gray-600">
                Auto System Sync - Service #14
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={autoSaveIsSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              {autoSaveIsSaving ? 'שומר...' : 'שמור ידנית'}
            </button>
          </div>
        </div>

        {/* Smart Fields Info Banner */}
        {(n8nInstanceUrl.isAutoPopulated || alertEmail.isAutoPopulated || syncFrequency.isAutoPopulated) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">נתונים מולאו אוטומטית משלב 1</h4>
              <p className="text-sm text-blue-800">
                חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1.
                תוכל לערוך אותם במידת הצורך.
              </p>
            </div>
          </div>
        )}

        {/* Conflict Warnings */}
        {(n8nInstanceUrl.hasConflict || alertEmail.hasConflict || syncFrequency.hasConflict) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">זוהה אי-התאמה בנתונים</h4>
              <p className="text-sm text-orange-800">
                נמצאו ערכים שונים עבור אותו שדה במקומות שונים. אנא בדוק ותקן.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-2 px-6 overflow-x-auto">
              {[
                { id: 'systems', label: 'מערכות' },
                { id: 'flows', label: 'זרימות נתונים' },
                { id: 'mapping', label: 'מיפוי שדות' },
                { id: 'logic', label: 'לוגיקת סנכרון' },
                { id: 'transform', label: 'טרנספורמציות' },
                { id: 'errors', label: 'טיפול בשגיאות' },
                { id: 'webhooks', label: 'Webhooks' },
                { id: 'initial', label: 'טעינה ראשונית' },
                { id: 'monitoring', label: 'ניטור' },
                { id: 'n8n', label: 'n8n' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Systems Tab */}
            {activeTab === 'systems' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">מערכות מחוברות</h3>
                  <button
                    onClick={addSystem}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף מערכת
                  </button>
                </div>

                {config.systems.map((system, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">מערכת {index + 1}</h4>
                      <button
                        onClick={() => removeSystem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שם המערכת
                        </label>
                        <input
                          type="text"
                          value={system.name}
                          onChange={(e) => {
                            const updatedSystems = [...config.systems];
                            updatedSystems[index].name = e.target.value;
                            setConfig({ ...config, systems: updatedSystems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="שם המערכת"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          סוג מערכת
                        </label>
                        <select
                          value={system.type}
                          onChange={(e) => {
                            const updatedSystems = [...config.systems];
                            updatedSystems[index].type = e.target.value as any;
                            setConfig({ ...config, systems: updatedSystems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="crm">CRM</option>
                          <option value="erp">ERP</option>
                          <option value="ecommerce">E-commerce</option>
                          <option value="accounting">Accounting</option>
                          <option value="shipping">Shipping</option>
                          <option value="marketing">Marketing</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שיטת אימות
                        </label>
                        <select
                          value={system.authMethod}
                          onChange={(e) => {
                            const updatedSystems = [...config.systems];
                            updatedSystems[index].authMethod = e.target.value as any;
                            setConfig({ ...config, systems: updatedSystems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="oauth">OAuth</option>
                          <option value="api_key">API Key</option>
                          <option value="basic_auth">Basic Auth</option>
                        </select>
                      </div>
                    </div>

                    {/* Credentials */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium mb-3">פרטי אימות</h5>
                      {system.authMethod === 'oauth' && (
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={system.credentials.clientId || ''}
                            onChange={(e) => {
                              const updatedSystems = [...config.systems];
                              updatedSystems[index].credentials.clientId = e.target.value;
                              setConfig({ ...config, systems: updatedSystems });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Client ID"
                          />
                          <input
                            type="password"
                            value={system.credentials.clientSecret || ''}
                            onChange={(e) => {
                              const updatedSystems = [...config.systems];
                              updatedSystems[index].credentials.clientSecret = e.target.value;
                              setConfig({ ...config, systems: updatedSystems });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Client Secret"
                          />
                          <input
                            type="text"
                            value={system.credentials.refreshToken || ''}
                            onChange={(e) => {
                              const updatedSystems = [...config.systems];
                              updatedSystems[index].credentials.refreshToken = e.target.value;
                              setConfig({ ...config, systems: updatedSystems });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg col-span-2"
                            placeholder="Refresh Token"
                          />
                        </div>
                      )}
                      {system.authMethod === 'api_key' && (
                        <input
                          type="password"
                          value={system.credentials.apiKey || ''}
                          onChange={(e) => {
                            const updatedSystems = [...config.systems];
                            updatedSystems[index].credentials.apiKey = e.target.value;
                            setConfig({ ...config, systems: updatedSystems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="API Key"
                        />
                      )}
                      {system.authMethod === 'basic_auth' && (
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={system.credentials.username || ''}
                            onChange={(e) => {
                              const updatedSystems = [...config.systems];
                              updatedSystems[index].credentials.username = e.target.value;
                              setConfig({ ...config, systems: updatedSystems });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Username"
                          />
                          <input
                            type="password"
                            value={system.credentials.password || ''}
                            onChange={(e) => {
                              const updatedSystems = [...config.systems];
                              updatedSystems[index].credentials.password = e.target.value;
                              setConfig({ ...config, systems: updatedSystems });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Password"
                          />
                        </div>
                      )}
                    </div>

                    {/* API Endpoints */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium mb-3">API Endpoints</h5>
                      <div className="space-y-3">
                        <input
                          type="url"
                          value={system.apiEndpoints.base}
                          onChange={(e) => {
                            const updatedSystems = [...config.systems];
                            updatedSystems[index].apiEndpoints.base = e.target.value;
                            setConfig({ ...config, systems: updatedSystems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Base URL (חובה)"
                        />
                        <input
                          type="url"
                          value={system.apiEndpoints.read || ''}
                          onChange={(e) => {
                            const updatedSystems = [...config.systems];
                            updatedSystems[index].apiEndpoints.read = e.target.value;
                            setConfig({ ...config, systems: updatedSystems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Read Endpoint (אופציונלי)"
                        />
                        <input
                          type="url"
                          value={system.apiEndpoints.write || ''}
                          onChange={(e) => {
                            const updatedSystems = [...config.systems];
                            updatedSystems[index].apiEndpoints.write = e.target.value;
                            setConfig({ ...config, systems: updatedSystems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Write Endpoint (אופציונלי)"
                        />
                        <input
                          type="url"
                          value={system.apiEndpoints.webhook || ''}
                          onChange={(e) => {
                            const updatedSystems = [...config.systems];
                            updatedSystems[index].apiEndpoints.webhook = e.target.value;
                            setConfig({ ...config, systems: updatedSystems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Webhook Endpoint (אופציונלי)"
                        />
                      </div>
                    </div>

                    {/* Rate Limits */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-3">מגבלות קצב</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            בקשות לדקה
                          </label>
                          <input
                            type="number"
                            value={system.rateLimits.requestsPerMinute || ''}
                            onChange={(e) => {
                              const updatedSystems = [...config.systems];
                              updatedSystems[index].rateLimits.requestsPerMinute = parseInt(e.target.value) || undefined;
                              setConfig({ ...config, systems: updatedSystems });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            בקשות ליום
                          </label>
                          <input
                            type="number"
                            value={system.rateLimits.requestsPerDay || ''}
                            onChange={(e) => {
                              const updatedSystems = [...config.systems];
                              updatedSystems[index].rateLimits.requestsPerDay = parseInt(e.target.value) || undefined;
                              setConfig({ ...config, systems: updatedSystems });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            בקשות מקבילות
                          </label>
                          <input
                            type="number"
                            value={system.rateLimits.concurrent || ''}
                            onChange={(e) => {
                              const updatedSystems = [...config.systems];
                              updatedSystems[index].rateLimits.concurrent = parseInt(e.target.value) || undefined;
                              setConfig({ ...config, systems: updatedSystems });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Data Flows Tab */}
            {activeTab === 'flows' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    דיאגרמת זרימה (URL או תיאור)
                  </label>
                  <input
                    type="text"
                    value={config.dataFlow.flowDiagram}
                    onChange={(e) => setConfig({
                      ...config,
                      dataFlow: {
                        ...config.dataFlow,
                        flowDiagram: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="URL לדיאגרמה או תיאור טקסטואלי"
                  />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">זרימות נתונים</h3>
                  <button
                    onClick={addDataFlow}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף זרימה
                  </button>
                </div>

                {config.dataFlow.flows.map((flow, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">זרימה {index + 1}</h4>
                      <button
                        onClick={() => removeDataFlow(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מערכת מקור
                        </label>
                        <select
                          value={flow.sourceSystem}
                          onChange={(e) => {
                            const updatedFlows = [...config.dataFlow.flows];
                            updatedFlows[index].sourceSystem = e.target.value;
                            setConfig({
                              ...config,
                              dataFlow: { ...config.dataFlow, flows: updatedFlows }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">בחר מערכת...</option>
                          {config.systems.map(sys => (
                            <option key={sys.id} value={sys.id}>{sys.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          סוג ישות
                        </label>
                        <select
                          value={flow.entityType}
                          onChange={(e) => {
                            const updatedFlows = [...config.dataFlow.flows];
                            updatedFlows[index].entityType = e.target.value as any;
                            setConfig({
                              ...config,
                              dataFlow: { ...config.dataFlow, flows: updatedFlows }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="customer">Customer</option>
                          <option value="order">Order</option>
                          <option value="product">Product</option>
                          <option value="invoice">Invoice</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          כיוון סנכרון
                        </label>
                        <select
                          value={flow.syncDirection}
                          onChange={(e) => {
                            const updatedFlows = [...config.dataFlow.flows];
                            updatedFlows[index].syncDirection = e.target.value as any;
                            setConfig({
                              ...config,
                              dataFlow: { ...config.dataFlow, flows: updatedFlows }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="one_way">חד-כיווני</option>
                          <option value="bi_directional">דו-כיווני</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          תדירות
                        </label>
                        <select
                          value={flow.frequency}
                          onChange={(e) => {
                            const updatedFlows = [...config.dataFlow.flows];
                            updatedFlows[index].frequency = e.target.value as any;
                            setConfig({
                              ...config,
                              dataFlow: { ...config.dataFlow, flows: updatedFlows }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="real_time">זמן אמת</option>
                          <option value="scheduled">מתוזמן</option>
                          <option value="manual">ידני</option>
                        </select>
                      </div>
                    </div>

                    {flow.frequency === 'scheduled' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cron Expression
                        </label>
                        <input
                          type="text"
                          value={flow.schedule || ''}
                          onChange={(e) => {
                            const updatedFlows = [...config.dataFlow.flows];
                            updatedFlows[index].schedule = e.target.value;
                            setConfig({
                              ...config,
                              dataFlow: { ...config.dataFlow, flows: updatedFlows }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0 */6 * * * (כל 6 שעות)"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        מערכות יעד (מופרד בפסיקים)
                      </label>
                      <input
                        type="text"
                        value={flow.targetSystems.join(', ')}
                        onChange={(e) => {
                          const updatedFlows = [...config.dataFlow.flows];
                          updatedFlows[index].targetSystems = e.target.value.split(',').map(s => s.trim());
                          setConfig({
                            ...config,
                            dataFlow: { ...config.dataFlow, flows: updatedFlows }
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="system-1, system-2"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Field Mapping Tab */}
            {activeTab === 'mapping' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">הגדרות Master Data</h3>
                  <button
                    onClick={addMasterDataDefinition}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף הגדרת ישות
                  </button>
                </div>

                {config.globalFieldMapping.masterDataDefinitions.map((def, defIndex) => (
                  <Card key={defIndex} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">ישות {defIndex + 1}</h4>
                      <button
                        onClick={() => removeMasterDataDefinition(defIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        סוג ישות
                      </label>
                      <input
                        type="text"
                        value={def.entityType}
                        onChange={(e) => {
                          const updatedDefs = [...config.globalFieldMapping.masterDataDefinitions];
                          updatedDefs[defIndex].entityType = e.target.value;
                          setConfig({
                            ...config,
                            globalFieldMapping: { masterDataDefinitions: updatedDefs }
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Customer, Order, Product..."
                      />
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium">שדות Master</h5>
                        <button
                          onClick={() => addMasterField(defIndex)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Plus className="w-3 h-3" />
                          הוסף שדה
                        </button>
                      </div>

                      {def.masterFields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="bg-gray-50 p-3 rounded-lg mb-2">
                          <div className="grid grid-cols-3 gap-3 mb-2">
                            <input
                              type="text"
                              value={field.fieldName}
                              onChange={(e) => {
                                const updatedDefs = [...config.globalFieldMapping.masterDataDefinitions];
                                updatedDefs[defIndex].masterFields[fieldIndex].fieldName = e.target.value;
                                setConfig({
                                  ...config,
                                  globalFieldMapping: { masterDataDefinitions: updatedDefs }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="שם שדה"
                            />
                            <input
                              type="text"
                              value={field.fieldType}
                              onChange={(e) => {
                                const updatedDefs = [...config.globalFieldMapping.masterDataDefinitions];
                                updatedDefs[defIndex].masterFields[fieldIndex].fieldType = e.target.value;
                                setConfig({
                                  ...config,
                                  globalFieldMapping: { masterDataDefinitions: updatedDefs }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="סוג (string, number...)"
                            />
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => {
                                  const updatedDefs = [...config.globalFieldMapping.masterDataDefinitions];
                                  updatedDefs[defIndex].masterFields[fieldIndex].required = e.target.checked;
                                  setConfig({
                                    ...config,
                                    globalFieldMapping: { masterDataDefinitions: updatedDefs }
                                  });
                                }}
                                className="rounded border-gray-300"
                              />
                              <span className="text-xs">חובה</span>
                            </label>
                          </div>
                          <button
                            onClick={() => removeMasterField(defIndex, fieldIndex)}
                            className="text-red-600 text-xs hover:text-red-700"
                          >
                            הסר שדה
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Sync Logic Tab */}
            {activeTab === 'logic' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">לוגיקת סנכרון</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        סוג סנכרון
                      </label>
                      <select
                        value={config.syncLogic.syncType}
                        onChange={(e) => setConfig({
                          ...config,
                          syncLogic: {
                            ...config.syncLogic,
                            syncType: e.target.value as any
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="full">Full Sync</option>
                        <option value="incremental">Incremental</option>
                        <option value="delta">Delta</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {syncFrequency.metadata.label.he}
                        </label>
                        {syncFrequency.isAutoPopulated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            מולא אוטומטית
                          </span>
                        )}
                      </div>
                      <select
                        value={syncFrequency.value || 'daily'}
                        onChange={(e) => syncFrequency.setValue(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          syncFrequency.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                        } ${syncFrequency.hasConflict ? 'border-orange-300' : ''}`}
                      >
                        <option value="realtime">בזמן אמת</option>
                        <option value="every_5_min">כל 5 דקות</option>
                        <option value="every_15_min">כל 15 דקות</option>
                        <option value="hourly">כל שעה</option>
                        <option value="daily">יומי</option>
                        <option value="weekly">שבועי</option>
                      </select>
                      {syncFrequency.isAutoPopulated && syncFrequency.source && (
                        <p className="text-xs text-gray-500 mt-1">
                          מקור: {syncFrequency.source.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {config.syncLogic.conflictResolution === 'master_system' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        מערכת Master (מקור אמת)
                      </label>
                      <select
                        value={config.syncLogic.masterSystem || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          syncLogic: {
                            ...config.syncLogic,
                            masterSystem: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">בחר מערכת...</option>
                        {config.systems.map(sys => (
                          <option key={sys.id} value={sys.id}>{sys.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.syncLogic.deduplicationEnabled}
                        onChange={(e) => setConfig({
                          ...config,
                          syncLogic: {
                            ...config.syncLogic,
                            deduplicationEnabled: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">הפעל Deduplication</span>
                    </label>

                    {config.syncLogic.deduplicationEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          שדות לזיהוי כפילויות (מופרד בפסיקים)
                        </label>
                        <input
                          type="text"
                          value={config.syncLogic.deduplicationFields.join(', ')}
                          onChange={(e) => setConfig({
                            ...config,
                            syncLogic: {
                              ...config.syncLogic,
                              deduplicationFields: e.target.value.split(',').map(s => s.trim())
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="email, phone, id"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Transformation Tab */}
            {activeTab === 'transform' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">הגדרות טרנספורמציה</h3>

                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={config.dataTransformation.enabled}
                      onChange={(e) => setConfig({
                        ...config,
                        dataTransformation: {
                          ...config.dataTransformation,
                          enabled: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">הפעל טרנספורמציות</span>
                  </label>

                  {config.dataTransformation.enabled && (
                    <>
                      <div className="space-y-3 mb-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.dataTransformation.dateFormatStandardization}
                            onChange={(e) => setConfig({
                              ...config,
                              dataTransformation: {
                                ...config.dataTransformation,
                                dateFormatStandardization: e.target.checked
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">תקנון פורמט תאריכים</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.dataTransformation.currencyConversion}
                            onChange={(e) => setConfig({
                              ...config,
                              dataTransformation: {
                                ...config.dataTransformation,
                                currencyConversion: e.target.checked
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">המרת מטבעות</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.dataTransformation.timezoneHandling}
                            onChange={(e) => setConfig({
                              ...config,
                              dataTransformation: {
                                ...config.dataTransformation,
                                timezoneHandling: e.target.checked
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">טיפול באזורי זמן</span>
                        </label>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">טרנספורמציות מותאמות</h4>
                          <button
                            onClick={addTransformation}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                          >
                            <Plus className="w-3 h-3" />
                            הוסף טרנספורמציה
                          </button>
                        </div>

                        {config.dataTransformation.transformations.map((trans, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                            <div className="grid grid-cols-2 gap-3 mb-2">
                              <select
                                value={trans.sourceSystem}
                                onChange={(e) => {
                                  const updated = [...config.dataTransformation.transformations];
                                  updated[index].sourceSystem = e.target.value;
                                  setConfig({
                                    ...config,
                                    dataTransformation: {
                                      ...config.dataTransformation,
                                      transformations: updated
                                    }
                                  });
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="">מערכת מקור...</option>
                                {config.systems.map(sys => (
                                  <option key={sys.id} value={sys.id}>{sys.name}</option>
                                ))}
                              </select>
                              <select
                                value={trans.targetSystem}
                                onChange={(e) => {
                                  const updated = [...config.dataTransformation.transformations];
                                  updated[index].targetSystem = e.target.value;
                                  setConfig({
                                    ...config,
                                    dataTransformation: {
                                      ...config.dataTransformation,
                                      transformations: updated
                                    }
                                  });
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="">מערכת יעד...</option>
                                {config.systems.map(sys => (
                                  <option key={sys.id} value={sys.id}>{sys.name}</option>
                                ))}
                              </select>
                            </div>
                            <select
                              value={trans.transformationType}
                              onChange={(e) => {
                                const updated = [...config.dataTransformation.transformations];
                                updated[index].transformationType = e.target.value as any;
                                setConfig({
                                  ...config,
                                  dataTransformation: {
                                    ...config.dataTransformation,
                                    transformations: updated
                                  }
                                });
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                            >
                              <option value="format">Format</option>
                              <option value="calculate">Calculate</option>
                              <option value="lookup">Lookup</option>
                              <option value="merge">Merge</option>
                            </select>
                            <textarea
                              value={trans.transformationLogic}
                              onChange={(e) => {
                                const updated = [...config.dataTransformation.transformations];
                                updated[index].transformationLogic = e.target.value;
                                setConfig({
                                  ...config,
                                  dataTransformation: {
                                    ...config.dataTransformation,
                                    transformations: updated
                                  }
                                });
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                              rows={2}
                              placeholder="לוגיקה (JavaScript או פורמולה)"
                            />
                            <button
                              onClick={() => removeTransformation(index)}
                              className="text-red-600 text-xs hover:text-red-700"
                            >
                              הסר טרנספורמציה
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Card>
              </div>
            )}

            {/* Error Handling Tab */}
            {activeTab === 'errors' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">טיפול בשגיאות</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        אסטרטגיה
                      </label>
                      <select
                        value={config.errorHandling.strategy}
                        onChange={(e) => setConfig({
                          ...config,
                          errorHandling: {
                            ...config.errorHandling,
                            strategy: e.target.value as any
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="retry">Retry</option>
                        <option value="skip_and_log">Skip & Log</option>
                        <option value="queue">Queue</option>
                        <option value="alert">Alert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        טיפול בכישלון חלקי
                      </label>
                      <select
                        value={config.errorHandling.partialFailureHandling}
                        onChange={(e) => setConfig({
                          ...config,
                          errorHandling: {
                            ...config.errorHandling,
                            partialFailureHandling: e.target.value as any
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="rollback">Rollback</option>
                        <option value="continue">Continue</option>
                        <option value="alert">Alert</option>
                      </select>
                    </div>
                  </div>

                  {config.errorHandling.strategy === 'retry' && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ניסיונות חוזרים
                        </label>
                        <input
                          type="number"
                          value={config.errorHandling.retryAttempts}
                          onChange={(e) => setConfig({
                            ...config,
                            errorHandling: {
                              ...config.errorHandling,
                              retryAttempts: parseInt(e.target.value) || 3
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="1"
                          max="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          עיכוב בין ניסיונות (שניות)
                        </label>
                        <input
                          type="number"
                          value={config.errorHandling.retryDelay}
                          onChange={(e) => setConfig({
                            ...config,
                            errorHandling: {
                              ...config.errorHandling,
                              retryDelay: parseInt(e.target.value) || 5
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="1"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      אימייל להתראות שגיאה
                    </label>
                    <input
                      type="email"
                      value={config.errorHandling.errorNotificationEmail}
                      onChange={(e) => setConfig({
                        ...config,
                        errorHandling: {
                          ...config.errorHandling,
                          errorNotificationEmail: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="admin@example.com"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.errorHandling.logAllSyncAttempts}
                      onChange={(e) => setConfig({
                        ...config,
                        errorHandling: {
                          ...config.errorHandling,
                          logAllSyncAttempts: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">רשום כל ניסיון סנכרון</span>
                  </label>
                </Card>
              </div>
            )}

            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Webhooks</h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.webhooks.enabled}
                        onChange={(e) => setConfig({
                          ...config,
                          webhooks: {
                            ...config.webhooks,
                            enabled: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">הפעל Webhooks</span>
                    </label>
                  </div>

                  {config.webhooks.enabled && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Webhooks למערכות</h4>
                        <button
                          onClick={addWebhook}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Plus className="w-3 h-3" />
                          הוסף Webhook
                        </button>
                      </div>

                      {config.webhooks.systemWebhooks.map((webhook, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <select
                              value={webhook.systemId}
                              onChange={(e) => {
                                const updated = [...config.webhooks.systemWebhooks];
                                updated[index].systemId = e.target.value;
                                setConfig({
                                  ...config,
                                  webhooks: {
                                    ...config.webhooks,
                                    systemWebhooks: updated
                                  }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="">בחר מערכת...</option>
                              {config.systems.map(sys => (
                                <option key={sys.id} value={sys.id}>{sys.name}</option>
                              ))}
                            </select>
                            <input
                              type="url"
                              value={webhook.webhookUrl}
                              onChange={(e) => {
                                const updated = [...config.webhooks.systemWebhooks];
                                updated[index].webhookUrl = e.target.value;
                                setConfig({
                                  ...config,
                                  webhooks: {
                                    ...config.webhooks,
                                    systemWebhooks: updated
                                  }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Webhook URL"
                            />
                          </div>
                          <input
                            type="text"
                            value={webhook.events.join(', ')}
                            onChange={(e) => {
                              const updated = [...config.webhooks.systemWebhooks];
                              updated[index].events = e.target.value.split(',').map(s => s.trim());
                              setConfig({
                                ...config,
                                webhooks: {
                                  ...config.webhooks,
                                  systemWebhooks: updated
                                }
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                            placeholder="אירועים (create, update, delete)"
                          />
                          <input
                            type="password"
                            value={webhook.secret || ''}
                            onChange={(e) => {
                              const updated = [...config.webhooks.systemWebhooks];
                              updated[index].secret = e.target.value;
                              setConfig({
                                ...config,
                                webhooks: {
                                  ...config.webhooks,
                                  systemWebhooks: updated
                                }
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                            placeholder="Secret (אופציונלי)"
                          />
                          <button
                            onClick={() => removeWebhook(index)}
                            className="text-red-600 text-xs hover:text-red-700"
                          >
                            הסר Webhook
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </Card>
              </div>
            )}

            {/* Initial Load Tab */}
            {activeTab === 'initial' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">טעינה ראשונית</h3>

                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={config.initialDataLoad.required}
                      onChange={(e) => setConfig({
                        ...config,
                        initialDataLoad: {
                          ...config.initialDataLoad,
                          required: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">נדרשת טעינה ראשונית</span>
                  </label>

                  {config.initialDataLoad.required && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            אסטרטגיית טעינה
                          </label>
                          <select
                            value={config.initialDataLoad.strategy}
                            onChange={(e) => setConfig({
                              ...config,
                              initialDataLoad: {
                                ...config.initialDataLoad,
                                strategy: e.target.value as any
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="parallel">Parallel</option>
                            <option value="sequential">Sequential</option>
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 h-full items-end">
                            <input
                              type="checkbox"
                              checked={config.initialDataLoad.bulkImportSupported}
                              onChange={(e) => setConfig({
                                ...config,
                                initialDataLoad: {
                                  ...config.initialDataLoad,
                                  bulkImportSupported: e.target.checked
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">תמיכה ב-Bulk Import</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            כמות רשומות משוערת
                          </label>
                          <input
                            type="number"
                            value={config.initialDataLoad.estimatedRecordCount}
                            onChange={(e) => setConfig({
                              ...config,
                              initialDataLoad: {
                                ...config.initialDataLoad,
                                estimatedRecordCount: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            זמן משוער (ימים)
                          </label>
                          <input
                            type="number"
                            value={config.initialDataLoad.estimatedTimeDays}
                            onChange={(e) => setConfig({
                              ...config,
                              initialDataLoad: {
                                ...config.initialDataLoad,
                                estimatedTimeDays: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">מעקב אחר מצב סנכרון</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סוג Database
                    </label>
                    <select
                      value={config.syncStateTracking.database}
                      onChange={(e) => setConfig({
                        ...config,
                        syncStateTracking: {
                          ...config.syncStateTracking,
                          database: e.target.value as any
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="postgres">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="supabase">Supabase</option>
                      <option value="firebase">Firebase</option>
                    </select>
                  </div>

                  {(config.syncStateTracking.database === 'postgres' || config.syncStateTracking.database === 'mysql') && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Connection String
                      </label>
                      <input
                        type="text"
                        value={config.syncStateTracking.connectionString || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          syncStateTracking: {
                            ...config.syncStateTracking,
                            connectionString: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="postgresql://..."
                      />
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">שמות טבלאות</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Sync Logs
                        </label>
                        <input
                          type="text"
                          value={config.syncStateTracking.trackingTables.syncLogs}
                          onChange={(e) => setConfig({
                            ...config,
                            syncStateTracking: {
                              ...config.syncStateTracking,
                              trackingTables: {
                                ...config.syncStateTracking.trackingTables,
                                syncLogs: e.target.value
                              }
                            }
                          })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Entity Mapping
                        </label>
                        <input
                          type="text"
                          value={config.syncStateTracking.trackingTables.entityMapping}
                          onChange={(e) => setConfig({
                            ...config,
                            syncStateTracking: {
                              ...config.syncStateTracking,
                              trackingTables: {
                                ...config.syncStateTracking.trackingTables,
                                entityMapping: e.target.value
                              }
                            }
                          })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Conflict Queue
                        </label>
                        <input
                          type="text"
                          value={config.syncStateTracking.trackingTables.conflictQueue}
                          onChange={(e) => setConfig({
                            ...config,
                            syncStateTracking: {
                              ...config.syncStateTracking,
                              trackingTables: {
                                ...config.syncStateTracking.trackingTables,
                                conflictQueue: e.target.value
                              }
                            }
                          })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">ניטור</h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.monitoring.enabled}
                        onChange={(e) => setConfig({
                          ...config,
                          monitoring: {
                            ...config.monitoring,
                            enabled: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">הפעל ניטור</span>
                    </label>
                  </div>

                  {config.monitoring.enabled && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          מדדים למעקב (מופרד בפסיקים)
                        </label>
                        <input
                          type="text"
                          value={config.monitoring.metricsToTrack.join(', ')}
                          onChange={(e) => setConfig({
                            ...config,
                            monitoring: {
                              ...config.monitoring,
                              metricsToTrack: e.target.value.split(',').map(s => s.trim())
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="sync_duration, record_count, error_rate"
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">התראות</h4>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.monitoring.alerting.syncFailures}
                              onChange={(e) => setConfig({
                                ...config,
                                monitoring: {
                                  ...config.monitoring,
                                  alerting: {
                                    ...config.monitoring.alerting,
                                    syncFailures: e.target.checked
                                  }
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">כישלונות סנכרון</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.monitoring.alerting.dataDrift}
                              onChange={(e) => setConfig({
                                ...config,
                                monitoring: {
                                  ...config.monitoring,
                                  alerting: {
                                    ...config.monitoring.alerting,
                                    dataDrift: e.target.checked
                                  }
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">סטייה בנתונים</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.monitoring.alerting.performanceIssues}
                              onChange={(e) => setConfig({
                                ...config,
                                monitoring: {
                                  ...config.monitoring,
                                  alerting: {
                                    ...config.monitoring.alerting,
                                    performanceIssues: e.target.checked
                                  }
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">בעיות ביצועים</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.monitoring.alerting.apiRateLimitApproaching}
                              onChange={(e) => setConfig({
                                ...config,
                                monitoring: {
                                  ...config.monitoring,
                                  alerting: {
                                    ...config.monitoring.alerting,
                                    apiRateLimitApproaching: e.target.checked
                                  }
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">התקרבות למגבלת API</span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              </div>
            )}

            {/* n8n Workflow Tab */}
            {activeTab === 'n8n' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">n8n Workflow</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {n8nInstanceUrl.metadata.label.he}
                        </label>
                        {n8nInstanceUrl.isAutoPopulated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            מולא אוטומטית
                          </span>
                        )}
                      </div>
                      <input
                        type="url"
                        value={n8nInstanceUrl.value || ''}
                        onChange={(e) => n8nInstanceUrl.setValue(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          n8nInstanceUrl.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                        } ${n8nInstanceUrl.hasConflict ? 'border-orange-300' : ''}`}
                        placeholder="https://n8n.example.com"
                      />
                      {n8nInstanceUrl.isAutoPopulated && n8nInstanceUrl.source && (
                        <p className="text-xs text-gray-500 mt-1">
                          מקור: {n8nInstanceUrl.source.description}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook Endpoint
                      </label>
                      <input
                        type="url"
                        value={config.n8nWorkflow.webhookEndpoint}
                        onChange={(e) => setConfig({
                          ...config,
                          n8nWorkflow: {
                            ...config.n8nWorkflow,
                            webhookEndpoint: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://n8n.example.com/webhook/sync"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        רמת מורכבות
                      </label>
                      <select
                        value={config.n8nWorkflow.workflowComplexity}
                        onChange={(e) => setConfig({
                          ...config,
                          n8nWorkflow: {
                            ...config.n8nWorkflow,
                            workflowComplexity: e.target.value as any
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="simple">Simple</option>
                        <option value="moderate">Moderate</option>
                        <option value="complex">Complex</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 h-full items-end">
                        <input
                          type="checkbox"
                          checked={config.n8nWorkflow.httpsEnabled}
                          onChange={(e) => setConfig({
                            ...config,
                            n8nWorkflow: {
                              ...config.n8nWorkflow,
                              httpsEnabled: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">HTTPS Enabled</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">טיפול בשגיאות</h4>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          ניסיונות חוזרים
                        </label>
                        <input
                          type="number"
                          value={config.n8nWorkflow.errorHandling.retryAttempts}
                          onChange={(e) => setConfig({
                            ...config,
                            n8nWorkflow: {
                              ...config.n8nWorkflow,
                              errorHandling: {
                                ...config.n8nWorkflow.errorHandling,
                                retryAttempts: parseInt(e.target.value) || 3
                              }
                            }
                          })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-medium text-gray-700">
                            {alertEmail.metadata.label.he}
                          </label>
                          {alertEmail.isAutoPopulated && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              מולא אוטומטית
                            </span>
                          )}
                        </div>
                        <input
                          type="email"
                          value={alertEmail.value || ''}
                          onChange={(e) => alertEmail.setValue(e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-sm ${
                            alertEmail.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                          } ${alertEmail.hasConflict ? 'border-orange-300' : ''}`}
                          placeholder="admin@example.com"
                        />
                        {alertEmail.isAutoPopulated && alertEmail.source && (
                          <p className="text-xs text-gray-500 mt-1">
                            מקור: {alertEmail.source.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.n8nWorkflow.errorHandling.logErrors}
                        onChange={(e) => setConfig({
                          ...config,
                          n8nWorkflow: {
                            ...config.n8nWorkflow,
                            errorHandling: {
                              ...config.n8nWorkflow.errorHandling,
                              logErrors: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">רשום שגיאות</span>
                    </label>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Save Status and Button */}
        <div className="flex justify-between items-center gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            {autoSaveIsSaving && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">שומר אוטומטית...</span>
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-sm">שגיאה בשמירה</span>
              </div>
            )}
            {!autoSaveIsSaving && !saveError && config.systems.length > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">נשמר אוטומטית</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={autoSaveIsSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {autoSaveIsSaving ? 'שומר...' : 'שמור ידנית'}
          </button>
        </div>
      </div>
    </div>
  );
}
