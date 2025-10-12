import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import type { AutoComplexLogicRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Save, Brain, GitBranch, CheckCircle, Info as InfoIcon } from 'lucide-react';

export function AutoComplexLogicSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields
  const workflowTrigger = useSmartField<string>({
    fieldId: 'workflow_trigger',
    localPath: 'technicalConfig.trigger',
    serviceId: 'auto-complex-logic',
    autoSave: false
  });

  const databaseType = useSmartField<string>({
    fieldId: 'database_type',
    localPath: 'databaseConfig.type',
    serviceId: 'auto-complex-logic',
    autoSave: false
  });

  const apiAuthMethod = useSmartField<string>({
    fieldId: 'api_auth_method',
    localPath: 'apiConfig.authMethod',
    serviceId: 'auto-complex-logic',
    autoSave: false
  });

  const retryAttempts = useSmartField<number>({
    fieldId: 'retry_attempts',
    localPath: 'n8nWorkflow.errorHandling.retryAttempts',
    serviceId: 'auto-complex-logic',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'n8nWorkflow.errorHandling.alertEmail',
    serviceId: 'auto-complex-logic',
    autoSave: false
  });

  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nWorkflow.instanceUrl',
    serviceId: 'auto-complex-logic',
    autoSave: false
  });

  const [config, setConfig] = useState<AutoComplexLogicRequirements>({
    logicRules: [
      {
        id: '1',
        name: 'קביעת עדיפות לידים',
        condition: 'מקור הליד === "אתר אינטרנט" && תקציב > 10000',
        action: 'הקצה לנציג מכירות בכיר',
        priority: 'high'
      },
      {
        id: '2',
        name: 'זיהוי לקוחות חוזרים',
        condition: 'אימייל קיים במערכת && רכישה קודמת',
        action: 'הצג היסטוריית רכישות',
        priority: 'medium'
      }
    ],
    decisionTrees: {
      leadQualification: {
        steps: [
          { question: 'מה התקציב?', answers: ['<10K', '10K-50K', '50K+', '>100K'] },
          { question: 'איך שמעת עלינו?', answers: ['חיפוש', 'המלצה', 'פרסומת', 'אחר'] },
          { question: 'מה הדחיפות?', answers: ['מיידי', 'השבוע', 'החודש', 'אין דחיפות'] }
        ]
      }
    },
    dataProcessing: {
      aggregation: ['ממוצע מכירות חודשי', 'סך הכל לידים לפי מקור'],
      calculations: ['שיעור המרה', 'ROI למקור לידים', 'זמן תגובה ממוצע'],
      transformations: ['ניקוי נתונים', 'סטנדרטיזציה', 'אימות תקינות']
    },
    externalApis: {
      endpoints: [
        {
          name: 'מזג אוויר',
          url: 'https://api.weatherapi.com/v1/current.json',
          purpose: 'התאמת הצעות לפי מזג אוויר',
          frequency: 'hourly'
        }
      ],
      authentication: {
        apiKeys: true,
        oauth: false,
        rateLimiting: true
      }
    },
    // Add technicalConfig
    technicalConfig: {
      trigger: '',
      triggerConditions: [],
      scheduling: {
        enabled: false,
        cronExpression: '0 0 * * *'
      },
      rateLimiting: {
        enabled: false,
        requestsPerMinute: 60
      }
    },
    // Add databaseConfig
    databaseConfig: {
      type: '',
      connectionString: '',
      tableName: '',
      schema: {}
    },
    // Add apiConfig
    apiConfig: {
      authMethod: '',
      baseUrl: '',
      headers: []
    },
    errorHandling: {
      retryAttempts: 3,
      fallbackActions: ['שמור בלוג', 'הודע למנהל', 'המשך ללא נתונים'],
      monitoring: {
        performanceMetrics: true,
        errorRates: true,
        responseTimes: true
      }
    },
    // Add n8nWorkflow
    n8nWorkflow: {
      instanceUrl: '',
      webhookEndpoint: '',
      httpsEnabled: true,
      errorHandling: {
        retryAttempts: 3,
        alertEmail: ''
      }
    }
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'auto-complex-logic',
    category: 'automations'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      technicalConfig: {
        ...config.technicalConfig,
        trigger: workflowTrigger.value
      },
      databaseConfig: {
        ...config.databaseConfig,
        type: databaseType.value
      },
      apiConfig: {
        ...config.apiConfig,
        authMethod: apiAuthMethod.value
      },
      n8nWorkflow: {
        ...config.n8nWorkflow,
        instanceUrl: n8nInstanceUrl.value,
        errorHandling: {
          ...config.n8nWorkflow.errorHandling,
          retryAttempts: retryAttempts.value || config.n8nWorkflow.errorHandling.retryAttempts,
          alertEmail: alertEmail.value
        }
      }
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: any) => a.serviceId === 'auto-complex-logic');

    if (existing?.requirements) {
      const existingConfigJson = JSON.stringify(existing.requirements);

      // Only update if the data actually changed (deep comparison)
      if (existingConfigJson !== lastLoadedConfigRef.current) {
        isLoadingRef.current = true;
        lastLoadedConfigRef.current = existingConfigJson;
        setConfig(existing.requirements as AutoComplexLogicRequirements);

        // Reset loading flag after state update completes
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }
    }
  }, [currentMeeting?.implementationSpec?.automations]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      setTimeout(() => {
        if (!isLoadingRef.current) {
          const completeConfig = {
            ...updated,
            technicalConfig: {
              ...updated.technicalConfig,
              trigger: workflowTrigger.value || updated.technicalConfig.trigger
            },
            databaseConfig: {
              ...updated.databaseConfig,
              type: databaseType.value || updated.databaseConfig.type
            },
            apiConfig: {
              ...updated.apiConfig,
              authMethod: apiAuthMethod.value || updated.apiConfig.authMethod
            },
            n8nWorkflow: {
              ...updated.n8nWorkflow,
              instanceUrl: n8nInstanceUrl.value || updated.n8nWorkflow.instanceUrl,
              errorHandling: {
                ...updated.n8nWorkflow.errorHandling,
                retryAttempts: retryAttempts.value || updated.n8nWorkflow.errorHandling.retryAttempts,
                alertEmail: alertEmail.value || updated.n8nWorkflow.errorHandling.alertEmail
              }
            }
          };
          saveData(completeConfig);
        }
      }, 0);
      return updated;
    });
  }, [saveData, workflowTrigger.value, databaseType.value, apiAuthMethod.value, retryAttempts.value, alertEmail.value, n8nInstanceUrl.value]);

  const saveConfig = async () => {
    const completeConfig = {
      ...config,
      technicalConfig: {
        ...config.technicalConfig,
        trigger: workflowTrigger.value || config.technicalConfig.trigger
      },
      databaseConfig: {
        ...config.databaseConfig,
        type: databaseType.value || config.databaseConfig.type
      },
      apiConfig: {
        ...config.apiConfig,
        authMethod: apiAuthMethod.value || config.apiConfig.authMethod
      },
      n8nWorkflow: {
        ...config.n8nWorkflow,
        instanceUrl: n8nInstanceUrl.value || config.n8nWorkflow.instanceUrl,
        errorHandling: {
          ...config.n8nWorkflow.errorHandling,
          retryAttempts: retryAttempts.value || config.n8nWorkflow.errorHandling.retryAttempts,
          alertEmail: alertEmail.value || config.n8nWorkflow.errorHandling.alertEmail
        }
      }
    };

    await saveData(completeConfig);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Smart Fields Info Banner */}
      {(workflowTrigger.isAutoPopulated || databaseType.isAutoPopulated || apiAuthMethod.isAutoPopulated || 
        retryAttempts.isAutoPopulated || alertEmail.isAutoPopulated || n8nInstanceUrl.isAutoPopulated) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">נתונים מולאו אוטומטית משלב 1</h4>
            <p className="text-sm text-blue-800">
              חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1.
              תוכל לערוך אותם במידת הצורך.
            </p>
          </div>
        </div>
      )}

      <Card title="לוגיקה מורכבת ואוטומציה מתקדמת" subtitle="הגדר כללים מורכבים, עצי החלטה ועיבוד נתונים מתקדם">
        <div className="space-y-6">
          {/* כללי לוגיקה - existing */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              כללי לוגיקה עסקית
            </h4>
            <div className="space-y-3">
              {config.logicRules.map((rule, index) => (
                <div key={rule.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">{rule.name}</h5>
                      <div className="mt-2 space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">תנאי:</span>
                          <code className="block bg-gray-50 p-2 rounded mt-1 font-mono text-xs">
                            {rule.condition}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">פעולה:</span>
                          <p className="mt-1">{rule.action}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        rule.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rule.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {rule.priority === 'high' ? 'גבוה' : rule.priority === 'medium' ? 'בינוני' : 'נמוך'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* עצי החלטה - existing */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              עצי החלטה
            </h4>
            <div className="space-y-4">
              {Object.entries(config.decisionTrees).map(([treeName, tree]) => (
                <div key={treeName} className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-3 capitalize">
                    {treeName === 'leadQualification' ? 'קביעת איכות לידים' : treeName}
                  </h5>
                  <div className="space-y-3">
                    {tree.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{step.question}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {step.answers.map((answer, ansIndex) => (
                              <span key={ansIndex} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {answer}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* עיבוד נתונים - existing */}
          <div>
            <h4 className="font-medium mb-3">עיבוד וניתוח נתונים</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">אגרגציות</label>
                <textarea
                  value={config.dataProcessing.aggregation.join('\n')}
                  onChange={(e) => handleFieldChange('dataProcessing.aggregation', e.target.value.split('\n').filter(s => s.trim()))}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - אגרגציה אחת..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">חישובים</label>
                <textarea
                  value={config.dataProcessing.calculations.join('\n')}
                  onChange={(e) => handleFieldChange('dataProcessing.calculations', e.target.value.split('\n').filter(s => s.trim()))}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - חישוב אחד..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">טרנספורמציות</label>
                <textarea
                  value={config.dataProcessing.transformations.join('\n')}
                  onChange={(e) => handleFieldChange('dataProcessing.transformations', e.target.value.split('\n').filter(s => s.trim()))}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - טרנספורמציה אחת..."
                />
              </div>
            </div>
          </div>

          {/* APIs חיצוניים - existing with api_auth_method smart */}
          <div>
            <h4 className="font-medium mb-3">APIs חיצוניים</h4>
            <div className="space-y-3">
              {/* API Auth Method Smart Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {apiAuthMethod.metadata.label.he}
                  </label>
                  {apiAuthMethod.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטית
                    </span>
                  )}
                </div>
                <select
                  value={apiAuthMethod.value || ''}
                  onChange={(e) => apiAuthMethod.setValue(e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    apiAuthMethod.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">בחר שיטת אימות</option>
                  <option value="oauth">OAuth 2.0</option>
                  <option value="api_key">API Key</option>
                  <option value="basic_auth">Basic Auth</option>
                  <option value="bearer_token">Bearer Token</option>
                  <option value="jwt">JWT</option>
                </select>
                {apiAuthMethod.isAutoPopulated && apiAuthMethod.source && (
                  <p className="text-xs text-gray-500 mt-1">מקור: {apiAuthMethod.source.description}</p>
                )}
              </div>

              {config.externalApis.endpoints.map((endpoint, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">שם השירות</label>
                      <input
                        type="text"
                        value={endpoint.name}
                        onChange={(e) => {
                          const newEndpoints = [...config.externalApis.endpoints];
                          newEndpoints[index] = { ...newEndpoints[index], name: e.target.value };
                          handleFieldChange('externalApis.endpoints', newEndpoints);
                        }}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">כתובת API</label>
                      <input
                        type="url"
                        value={endpoint.url}
                        onChange={(e) => {
                          const newEndpoints = [...config.externalApis.endpoints];
                          newEndpoints[index] = { ...newEndpoints[index], url: e.target.value };
                          handleFieldChange('externalApis.endpoints', newEndpoints);
                        }}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">תדירות</label>
                      <select
                        value={endpoint.frequency}
                        onChange={(e) => {
                          const newEndpoints = [...config.externalApis.endpoints];
                          newEndpoints[index] = { ...newEndpoints[index], frequency: e.target.value as any };
                          handleFieldChange('externalApis.endpoints', newEndpoints);
                        }}
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        <option value="realtime">זמן אמת</option>
                        <option value="hourly">שעתי</option>
                        <option value="daily">יומי</option>
                        <option value="weekly">שבועי</option>
                        <option value="ondemand">על פי דרישה</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1">מטרה</label>
                    <input
                      type="text"
                      value={endpoint.purpose}
                      onChange={(e) => {
                        const newEndpoints = [...config.externalApis.endpoints];
                        newEndpoints[index] = { ...newEndpoints[index], purpose: e.target.value };
                        handleFieldChange('externalApis.endpoints', newEndpoints);
                      }}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="למה אנחנו צריכים את ה-API הזה..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* טיפול בשגיאות - updated with smart retry and alert */}
          <div>
            <h4 className="font-medium mb-3">טיפול בשגיאות ומוניטורינג</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {retryAttempts.metadata.label.he}
                  </label>
                  {retryAttempts.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטית
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  value={retryAttempts.value || config.errorHandling.retryAttempts || 3}
                  onChange={(e) => retryAttempts.setValue(parseInt(e.target.value) || 3)}
                  className={`w-full p-2 border rounded-lg ${
                    retryAttempts.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  min="1"
                  max="10"
                />
                {retryAttempts.isAutoPopulated && retryAttempts.source && (
                  <p className="text-xs text-gray-500 mt-1">מקור: {retryAttempts.source.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">פעולות חזרה</label>
                {config.errorHandling.fallbackActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">מוניטורינג</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.errorHandling.monitoring.performanceMetrics}
                    onChange={(e) => handleFieldChange('errorHandling.monitoring.performanceMetrics', e.target.checked)}
                  />
                  <span className="text-sm">מדדי ביצועים</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.errorHandling.monitoring.errorRates}
                    onChange={(e) => handleFieldChange('errorHandling.monitoring.errorRates', e.target.checked)}
                  />
                  <span className="text-sm">שיעורי שגיאות</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.errorHandling.monitoring.responseTimes}
                    onChange={(e) => handleFieldChange('errorHandling.monitoring.responseTimes', e.target.checked)}
                  />
                  <span className="text-sm">זמני תגובה</span>
                </label>
              </div>
            </div>

            {/* n8n Section */}
            <div className="space-y-4 mt-6">
              <h5 className="font-medium">הגדרות n8n</h5>
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
                  className={`w-full p-2 border rounded-lg ${
                    n8nInstanceUrl.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="https://n8n.example.com"
                />
                {n8nInstanceUrl.isAutoPopulated && n8nInstanceUrl.source && (
                  <p className="text-xs text-gray-500 mt-1">מקור: {n8nInstanceUrl.source.description}</p>
                )}
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Endpoint</label>
              <input
                type="url"
                value={config.n8nWorkflow.webhookEndpoint || ''}
                onChange={(e) => handleFieldChange('n8nWorkflow.webhookEndpoint', e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="https://n8n.example.com/webhook/..."
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.n8nWorkflow.httpsEnabled || true}
                  onChange={(e) => handleFieldChange('n8nWorkflow.httpsEnabled', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">HTTPS מופעל</span>
              </label>
            </div>
          </div>

          {/* Save Status and Button */}
          <div className="flex justify-between items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              {isSaving && (
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
              {!isSaving && !saveError && config.logicRules.length > 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">נשמר אוטומטית</span>
                </div>
              )}
            </div>
            <button
              onClick={saveConfig}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'שומר...' : 'שמור ידנית'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}



