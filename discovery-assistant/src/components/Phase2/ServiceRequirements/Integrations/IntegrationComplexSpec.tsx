import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import type { IntegrationComplexRequirements, SystemConfig } from '../../../../types/integrationServices';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Info } from 'lucide-react';

export function IntegrationComplexSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<IntegrationComplexRequirements>>({
    systems: [],
    syncConfig: {
      direction: 'bi-directional',
      frequency: 'real-time',
      requiresWebhooks: true,
      conflictResolution: 'last-write-wins'
    },
    fieldMappings: [],
    webhooks: [],
    database: {
      type: 'supabase',
      tables: {
        syncLog: true,
        conflictQueue: true,
        syncState: true
      }
    },
    circularUpdatePrevention: {
      enabled: true,
      syncSourceIdField: 'sync_source_id',
      conflictLogging: true
    },
    n8nConfig: {
      mainWorkflow: '',
      subWorkflows: [],
      errorWorkflows: [],
      estimatedNodes: 15
    },
    monitoring: {
      enableLogging: true,
      logLevel: 'info',
      enableMetrics: true,
      dashboardUrl: ''
    },
    errorHandling: {
      retryAttempts: 3,
      retryDelays: [5, 25, 125],
      alertChannels: ['email', 'slack'],
      alertRecipients: [],
      deadLetterQueue: true,
      tokenRefreshAutomation: true,
      webhookRetryQueue: true
    },
    metadata: {
      complexity: 'complex',
      estimatedHours: 40,
      prerequisites: [],
      monthlyApiCalls: 10000,
      monthlyCost: 0
    }
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'integration-complex',
    immediateFields: ['systems', 'syncConfig', 'fieldMappings'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in IntegrationComplexSpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    saveData(config);
  });

  const [newSystem, setNewSystem] = useState<Partial<SystemConfig>>({
    name: '',
    authType: 'oauth2',
    credentials: {},
    apiVersion: '',
    baseUrl: ''
  });

  const apiAuthMethod = useSmartField<string>({
    fieldId: 'api_auth_method',
    localPath: 'systems[0].authType',
    serviceId: 'integration-complex',
    autoSave: false
  });

  const syncFrequency = useSmartField<string>({
    fieldId: 'sync_frequency',
    localPath: 'syncConfig.frequency',
    serviceId: 'integration-complex',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'errorHandling.alertRecipients[0]',
    serviceId: 'integration-complex',
    autoSave: false
  });

  useEffect(() => {
    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find(i => i.serviceId === 'integration-complex');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.systems?.length || config.syncConfig?.direction) {
      saveData(config);
    }
  }, [config, saveData]);

  const handleSave = async () => {
    const completeConfig = {
      ...config,
      syncConfig: {
        ...config.syncConfig,
        frequency: syncFrequency.value === 'realtime' ? 'real-time' : syncFrequency.value
      },
      errorHandling: {
        ...config.errorHandling,
        alertRecipients: alertEmail.value ? [alertEmail.value] : config.errorHandling?.alertRecipients || []
      }
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  };

  const addSystem = () => {
    if (newSystem.name) {
      setConfig({
        ...config,
        systems: [...(config.systems || []), newSystem as SystemConfig]
      });
      setNewSystem({ name: '', authType: 'oauth2', credentials: {}, apiVersion: '', baseUrl: '' });
    }
  };

  const removeSystem = (index: number) => {
    setConfig({
      ...config,
      systems: config.systems?.filter((_, i) => i !== index) || []
    });
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      {(apiAuthMethod.isAutoPopulated || syncFrequency.isAutoPopulated || alertEmail.isAutoPopulated) && (
        <div className="bg-blue-50 border rounded-lg p-4">
          <Info className="w-5 h-5 text-blue-600" />
          <p>נתונים מולאו אוטומטית.</p>
        </div>
      )}
      <Card title="שירות #32: אינטגרציה מורכבת (3+ מערכות)">
        <div className="space-y-6">

          {/* Systems Management */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מערכות (3 ומעלה)</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newSystem.name || ''}
                  onChange={(e) => setNewSystem({ ...newSystem, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="שם המערכת"
                />
                <select
                  value={newSystem.authType || 'oauth2'}
                  onChange={(e) => setNewSystem({ ...newSystem, authType: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="api_key">API Key</option>
                  <option value="basic">Basic Auth</option>
                  <option value="bearer_token">Bearer Token</option>
                </select>
                <input
                  type="text"
                  value={newSystem.apiVersion || ''}
                  onChange={(e) => setNewSystem({ ...newSystem, apiVersion: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="גרסת API"
                />
                <button
                  onClick={addSystem}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  הוסף מערכת
                </button>
              </div>

              {config.systems && config.systems.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600">מערכות ({config.systems.length}):</p>
                  {config.systems.map((system, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div>
                        <span className="font-medium">{system.name}</span>
                        <span className="text-sm text-gray-600 mr-2">({system.authType})</span>
                        {system.apiVersion && <span className="text-xs text-gray-500">v{system.apiVersion}</span>}
                      </div>
                      <button
                        onClick={() => removeSystem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        הסר
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sync Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות סנכרון דו-כיווני</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אסטרטגיית פתרון קונפליקטים</label>
                <select
                  value={config.syncConfig?.conflictResolution || 'last-write-wins'}
                  onChange={(e) => setConfig({
                    ...config,
                    syncConfig: { ...config.syncConfig!, conflictResolution: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="last-write-wins">Last Write Wins</option>
                  <option value="manual-review">Manual Review</option>
                  <option value="timestamp-based">Timestamp Based</option>
                  <option value="field-level-merge">Field Level Merge</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.syncConfig?.requiresWebhooks}
                    onChange={(e) => setConfig({
                      ...config,
                      syncConfig: { ...config.syncConfig!, requiresWebhooks: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>דורש Webhooks</span>
                </label>
              </div>
            </div>
          </div>

          {/* Database Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">בסיס נתונים</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סוג Database</label>
                <select
                  value={config.database?.type || 'supabase'}
                  onChange={(e) => setConfig({
                    ...config,
                    database: { ...config.database!, type: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="supabase">Supabase</option>
                  <option value="postgresql">PostgreSQL</option>
                </select>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">טבלאות נדרשות:</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.database?.tables?.syncLog}
                      onChange={(e) => setConfig({
                        ...config,
                        database: {
                          ...config.database!,
                          tables: { ...config.database!.tables!, syncLog: e.target.checked }
                        }
                      })}
                      className="rounded"
                    />
                    <span>Sync Log</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.database?.tables?.conflictQueue}
                      onChange={(e) => setConfig({
                        ...config,
                        database: {
                          ...config.database!,
                          tables: { ...config.database!.tables!, conflictQueue: e.target.checked }
                        }
                      })}
                      className="rounded"
                    />
                    <span>Conflict Queue</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.database?.tables?.syncState}
                      onChange={(e) => setConfig({
                        ...config,
                        database: {
                          ...config.database!,
                          tables: { ...config.database!.tables!, syncState: e.target.checked }
                        }
                      })}
                      className="rounded"
                    />
                    <span>Sync State</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Circular Update Prevention */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מניעת עדכונים מעגליים</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.circularUpdatePrevention?.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    circularUpdatePrevention: {
                      ...config.circularUpdatePrevention!,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span>הפעל מניעת עדכונים מעגליים</span>
              </label>
              {config.circularUpdatePrevention?.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שם שדה Sync Source ID</label>
                    <input
                      type="text"
                      value={config.circularUpdatePrevention?.syncSourceIdField || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        circularUpdatePrevention: {
                          ...config.circularUpdatePrevention!,
                          syncSourceIdField: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.circularUpdatePrevention?.conflictLogging}
                        onChange={(e) => setConfig({
                          ...config,
                          circularUpdatePrevention: {
                            ...config.circularUpdatePrevention!,
                            conflictLogging: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      <span>רישום קונפליקטים</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* n8n Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות n8n</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Workflow</label>
                <input
                  type="text"
                  value={config.n8nConfig?.mainWorkflow || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    n8nConfig: { ...config.n8nConfig!, mainWorkflow: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="שם Workflow ראשי"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מספר Nodes משוער</label>
                <input
                  type="number"
                  min="10"
                  value={config.n8nConfig?.estimatedNodes || 15}
                  onChange={(e) => setConfig({
                    ...config,
                    n8nConfig: { ...config.n8nConfig!, estimatedNodes: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Monitoring */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">ניטור</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.monitoring?.enableLogging}
                    onChange={(e) => setConfig({
                      ...config,
                      monitoring: { ...config.monitoring!, enableLogging: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>הפעל Logging</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.monitoring?.enableMetrics}
                    onChange={(e) => setConfig({
                      ...config,
                      monitoring: { ...config.monitoring!, enableMetrics: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>הפעל Metrics</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">רמת Log</label>
                  <select
                    value={config.monitoring?.logLevel || 'info'}
                    onChange={(e) => setConfig({
                      ...config,
                      monitoring: { ...config.monitoring!, logLevel: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dashboard URL (אופציונלי)</label>
                  <input
                    type="url"
                    value={config.monitoring?.dashboardUrl || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      monitoring: { ...config.monitoring!, dashboardUrl: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Handling */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">טיפול בשגיאות</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ניסיונות חוזרים</label>
                  <input
                    type="number"
                    min="0"
                    value={config.errorHandling?.retryAttempts || 3}
                    onChange={(e) => setConfig({
                      ...config,
                      errorHandling: { ...config.errorHandling!, retryAttempts: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.errorHandling?.tokenRefreshAutomation}
                    onChange={(e) => setConfig({
                      ...config,
                      errorHandling: { ...config.errorHandling!, tokenRefreshAutomation: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>רענון אוטומטי של Tokens</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.errorHandling?.webhookRetryQueue}
                    onChange={(e) => setConfig({
                      ...config,
                      errorHandling: { ...config.errorHandling!, webhookRetryQueue: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>תור ניסיונות חוזרים ל-Webhooks</span>
                </label>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שעות משוערות</label>
                <input
                  type="number"
                  min="1"
                  value={config.metadata?.estimatedHours || 40}
                  onChange={(e) => setConfig({
                    ...config,
                    metadata: { ...config.metadata!, estimatedHours: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קריאות API חודשיות משוערות</label>
                <input
                  type="number"
                  min="0"
                  value={config.metadata?.monthlyApiCalls || 10000}
                  onChange={(e) => setConfig({
                    ...config,
                    metadata: { ...config.metadata!, monthlyApiCalls: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              שמור הגדרות
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
