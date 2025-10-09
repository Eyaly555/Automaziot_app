import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import type { IntegrationSimpleRequirements, SystemConfig, FieldMapping, ErrorHandlingConfig } from '../../../../types/integrationServices';

export function IntegrationSimpleSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<IntegrationSimpleRequirements>>({
    sourceSystem: {
      name: '',
      authType: 'oauth2',
      credentials: {},
      apiVersion: '',
      baseUrl: ''
    },
    targetSystem: {
      name: '',
      authType: 'oauth2',
      credentials: {},
      apiVersion: '',
      baseUrl: ''
    },
    syncConfig: {
      direction: 'one-way',
      frequency: 'real-time',
      pollingInterval: 5,
      batchSize: 100
    },
    fieldMapping: [],
    n8nConfig: {
      workflowEndpoint: '',
      apiKey: '',
      estimatedNodes: 3
    },
    errorHandling: {
      retryAttempts: 3,
      retryDelays: [1, 2, 4],
      alertChannels: ['email'],
      alertRecipients: [],
      deadLetterQueue: false
    },
    metadata: {
      complexity: 'simple',
      estimatedHours: 8,
      prerequisites: [],
      monthlyApiCalls: 1000,
      monthlyCost: 0
    }
  });

  const [newField, setNewField] = useState<Partial<FieldMapping>>({
    sourceField: '',
    targetField: '',
    transformation: '',
    dataType: 'string',
    required: false
  });

  useEffect(() => {
    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find(i => i.serviceId === 'integration-simple');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const updated = integrationServices.filter(i => i.serviceId !== 'integration-simple');

    updated.push({
      serviceId: 'integration-simple',
      serviceName: 'אינטגרציה פשוטה בין 2 מערכות',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        integrationServices: updated,
      },
    });
  };

  const addFieldMapping = () => {
    if (newField.sourceField && newField.targetField) {
      setConfig({
        ...config,
        fieldMapping: [...(config.fieldMapping || []), newField as FieldMapping]
      });
      setNewField({ sourceField: '', targetField: '', transformation: '', dataType: 'string', required: false });
    }
  };

  const removeFieldMapping = (index: number) => {
    setConfig({
      ...config,
      fieldMapping: config.fieldMapping?.filter((_, i) => i !== index) || []
    });
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <Card title="שירות #31: אינטגרציה פשוטה בין 2 מערכות">
        <div className="space-y-6">

          {/* Source System */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מערכת מקור (Source System)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם המערכת</label>
                <input
                  type="text"
                  value={config.sourceSystem?.name || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    sourceSystem: { ...config.sourceSystem!, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="לדוגמה: Zoho CRM, Google Forms"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שיטת אימות</label>
                  <select
                    value={config.sourceSystem?.authType || 'oauth2'}
                    onChange={(e) => setConfig({
                      ...config,
                      sourceSystem: { ...config.sourceSystem!, authType: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="oauth2">OAuth 2.0</option>
                    <option value="api_key">API Key</option>
                    <option value="basic">Basic Auth</option>
                    <option value="bearer_token">Bearer Token</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">גרסת API</label>
                  <input
                    type="text"
                    value={config.sourceSystem?.apiVersion || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      sourceSystem: { ...config.sourceSystem!, apiVersion: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="v8, v3, וכו'"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                <input
                  type="url"
                  value={config.sourceSystem?.baseUrl || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    sourceSystem: { ...config.sourceSystem!, baseUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://api.example.com"
                />
              </div>
            </div>
          </div>

          {/* Target System */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מערכת יעד (Target System)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם המערכת</label>
                <input
                  type="text"
                  value={config.targetSystem?.name || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    targetSystem: { ...config.targetSystem!, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="לדוגמה: Google Sheets, Slack"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שיטת אימות</label>
                  <select
                    value={config.targetSystem?.authType || 'oauth2'}
                    onChange={(e) => setConfig({
                      ...config,
                      targetSystem: { ...config.targetSystem!, authType: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="oauth2">OAuth 2.0</option>
                    <option value="api_key">API Key</option>
                    <option value="basic">Basic Auth</option>
                    <option value="bearer_token">Bearer Token</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">גרסת API</label>
                  <input
                    type="text"
                    value={config.targetSystem?.apiVersion || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      targetSystem: { ...config.targetSystem!, apiVersion: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="v8, v3, וכו'"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                <input
                  type="url"
                  value={config.targetSystem?.baseUrl || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    targetSystem: { ...config.targetSystem!, baseUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://api.example.com"
                />
              </div>
            </div>
          </div>

          {/* Sync Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות סנכרון</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כיוון סנכרון</label>
                <select
                  value={config.syncConfig?.direction || 'one-way'}
                  onChange={(e) => setConfig({
                    ...config,
                    syncConfig: { ...config.syncConfig!, direction: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="one-way">חד-כיווני</option>
                  <option value="bi-directional">דו-כיווני</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תדירות סנכרון</label>
                <select
                  value={config.syncConfig?.frequency || 'real-time'}
                  onChange={(e) => setConfig({
                    ...config,
                    syncConfig: { ...config.syncConfig!, frequency: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="real-time">זמן אמת (Real-time)</option>
                  <option value="polling">Polling</option>
                  <option value="batch">Batch</option>
                </select>
              </div>
              {config.syncConfig?.frequency === 'polling' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מרווח Polling (דקות)</label>
                  <input
                    type="number"
                    min="5"
                    value={config.syncConfig?.pollingInterval || 5}
                    onChange={(e) => setConfig({
                      ...config,
                      syncConfig: { ...config.syncConfig!, pollingInterval: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">גודל Batch</label>
                <input
                  type="number"
                  value={config.syncConfig?.batchSize || 100}
                  onChange={(e) => setConfig({
                    ...config,
                    syncConfig: { ...config.syncConfig!, batchSize: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Field Mapping */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מיפוי שדות (Field Mapping)</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                <input
                  type="text"
                  value={newField.sourceField || ''}
                  onChange={(e) => setNewField({ ...newField, sourceField: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="שדה מקור"
                />
                <input
                  type="text"
                  value={newField.targetField || ''}
                  onChange={(e) => setNewField({ ...newField, targetField: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="שדה יעד"
                />
                <select
                  value={newField.dataType || 'string'}
                  onChange={(e) => setNewField({ ...newField, dataType: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                  <option value="array">Array</option>
                  <option value="object">Object</option>
                </select>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newField.required || false}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">חובה</span>
                </label>
                <button
                  onClick={addFieldMapping}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  הוסף
                </button>
              </div>

              {config.fieldMapping && config.fieldMapping.length > 0 && (
                <div className="mt-3 space-y-2">
                  {config.fieldMapping.map((field, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div className="flex-1">
                        <span className="font-medium">{field.sourceField}</span> →
                        <span className="font-medium mr-1">{field.targetField}</span>
                        <span className="text-sm text-gray-600 mr-2">({field.dataType})</span>
                        {field.required && <span className="text-xs text-red-600">חובה</span>}
                      </div>
                      <button
                        onClick={() => removeFieldMapping(index)}
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

          {/* n8n Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות n8n</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Endpoint</label>
                <input
                  type="url"
                  value={config.n8nConfig?.workflowEndpoint || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    n8nConfig: { ...config.n8nConfig!, workflowEndpoint: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://n8n.example.com/webhook/..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key (אופציונלי)</label>
                  <input
                    type="password"
                    value={config.n8nConfig?.apiKey || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      n8nConfig: { ...config.n8nConfig!, apiKey: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מספר Nodes משוער</label>
                  <input
                    type="number"
                    min="1"
                    value={config.n8nConfig?.estimatedNodes || 3}
                    onChange={(e) => setConfig({
                      ...config,
                      n8nConfig: { ...config.n8nConfig!, estimatedNodes: parseInt(e.target.value) }
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
                    max="10"
                    value={config.errorHandling?.retryAttempts || 3}
                    onChange={(e) => setConfig({
                      ...config,
                      errorHandling: { ...config.errorHandling!, retryAttempts: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      checked={config.errorHandling?.deadLetterQueue || false}
                      onChange={(e) => setConfig({
                        ...config,
                        errorHandling: { ...config.errorHandling!, deadLetterQueue: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">Dead Letter Queue</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ערוצי התראה</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.errorHandling?.alertChannels?.includes('email')}
                      onChange={(e) => {
                        const channels = config.errorHandling?.alertChannels || [];
                        setConfig({
                          ...config,
                          errorHandling: {
                            ...config.errorHandling!,
                            alertChannels: e.target.checked
                              ? [...channels, 'email']
                              : channels.filter(c => c !== 'email')
                          }
                        });
                      }}
                      className="rounded"
                    />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.errorHandling?.alertChannels?.includes('slack')}
                      onChange={(e) => {
                        const channels = config.errorHandling?.alertChannels || [];
                        setConfig({
                          ...config,
                          errorHandling: {
                            ...config.errorHandling!,
                            alertChannels: e.target.checked
                              ? [...channels, 'slack']
                              : channels.filter(c => c !== 'slack')
                          }
                        });
                      }}
                      className="rounded"
                    />
                    <span>Slack</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.errorHandling?.alertChannels?.includes('sms')}
                      onChange={(e) => {
                        const channels = config.errorHandling?.alertChannels || [];
                        setConfig({
                          ...config,
                          errorHandling: {
                            ...config.errorHandling!,
                            alertChannels: e.target.checked
                              ? [...channels, 'sms']
                              : channels.filter(c => c !== 'sms')
                          }
                        });
                      }}
                      className="rounded"
                    />
                    <span>SMS</span>
                  </label>
                </div>
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
                  value={config.metadata?.estimatedHours || 8}
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
                  value={config.metadata?.monthlyApiCalls || 1000}
                  onChange={(e) => setConfig({
                    ...config,
                    metadata: { ...config.metadata!, monthlyApiCalls: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עלות חודשית משוערת ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={config.metadata?.monthlyCost || 0}
                  onChange={(e) => setConfig({
                    ...config,
                    metadata: { ...config.metadata!, monthlyCost: parseFloat(e.target.value) }
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
