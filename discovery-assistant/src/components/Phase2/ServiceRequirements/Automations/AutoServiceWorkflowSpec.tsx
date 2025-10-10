import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import type { AutoServiceWorkflowRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Save, Workflow, CheckCircle, Info as InfoIcon } from 'lucide-react';

export function AutoServiceWorkflowSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const workflowTrigger = useSmartField<string>({
    fieldId: 'workflow_trigger',
    localPath: 'technicalConfig.trigger',
    serviceId: 'auto-service-workflow',
    autoSave: false
  });

  const databaseType = useSmartField<string>({
    fieldId: 'database_type',
    localPath: 'databaseConfig.type',
    serviceId: 'auto-service-workflow',
    autoSave: false
  });

  const notificationChannels = useSmartField<string[]>({
    fieldId: 'notification_channels',
    localPath: 'notificationConfig.channels',
    serviceId: 'auto-service-workflow',
    autoSave: false
  });

  const businessHoursStart = useSmartField<string>({
    fieldId: 'business_hours_start',
    localPath: 'schedulingRules.businessHours.start',
    serviceId: 'auto-service-workflow',
    autoSave: false
  });

  const businessHoursEnd = useSmartField<string>({
    fieldId: 'business_hours_end',
    localPath: 'schedulingRules.businessHours.end',
    serviceId: 'auto-service-workflow',
    autoSave: false
  });

  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nWorkflow.instanceUrl',
    serviceId: 'auto-service-workflow',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'n8nWorkflow.errorHandling.alertEmail',
    serviceId: 'auto-service-workflow',
    autoSave: false
  });

  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'integration.crmSystem',
    serviceId: 'auto-service-workflow',
    autoSave: false
  });

  const [config, setConfig] = useState<AutoServiceWorkflowRequirements>({
    workflowSteps: [
      {
        id: '1',
        name: 'קבלת פנייה',
        description: 'זיהוי פנייה חדשה והתחלת תהליך',
        duration: 'מיידי',
        responsible: 'מערכת אוטומטית'
      },
      {
        id: '2',
        name: 'ניתוח בעיה',
        description: 'ניתוח אוטומטי של סוג הבעיה וחומרתה',
        duration: '2-5 דקות',
        responsible: 'סוכן AI'
      },
      {
        id: '3',
        name: 'הצעת פתרון',
        description: 'הצעת פתרונות ראשוניים או העברה לנציג',
        duration: '5-10 דקות',
        responsible: 'סוכן AI + נציג אנושי'
      }
    ],
    escalationRules: {
      highPriority: ['מבקש לדבר עם מנהל', 'בעיה קריטית', 'אי שביעות רצון חמורה'],
      immediateTransfer: ['איום משפטי', 'בעיה בטיחותית', 'תקלה מלאה במערכת']
    },
    serviceMetrics: {
      responseTime: '< 5 דקות',
      resolutionTime: '< 24 שעות',
      satisfactionTarget: 4.5
    },
    integration: {
      crmSystem: '',
      crmSync: true,
      knowledgeBase: true,
      ticketSystem: true
    },
    // Add technicalConfig
    technicalConfig: {
      trigger: ''
    },
    // Add databaseConfig
    databaseConfig: {
      type: '',
      connectionString: ''
    },
    // Add notificationConfig
    notificationConfig: {
      channels: []
    },
    // Add schedulingRules
    schedulingRules: {
      businessHours: {
        start: '09:00',
        end: '18:00',
        workDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
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

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'auto-service-workflow',
    immediateFields: ['workflowSteps', 'escalationRules', 'serviceMetrics', 'integration'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in AutoServiceWorkflowSpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
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
      notificationConfig: {
        ...config.notificationConfig,
        channels: notificationChannels.value || config.notificationConfig.channels
      },
      schedulingRules: {
        ...config.schedulingRules,
        businessHours: {
          ...config.schedulingRules.businessHours,
          start: businessHoursStart.value || config.schedulingRules.businessHours.start,
          end: businessHoursEnd.value || config.schedulingRules.businessHours.end
        }
      },
      integration: {
        ...config.integration,
        crmSystem: crmSystem.value || config.integration.crmSystem
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
    saveData(completeConfig);
  });

  useEffect(() => {
    if (currentMeeting?.implementationSpec?.automations) {
      const existing = currentMeeting.implementationSpec.automations.find(
        (a: any) => a.serviceId === 'auto-service-workflow'
      );
      if (existing) {
        setConfig(existing.requirements);
      }
    }
  }, [currentMeeting]);

  // Save handler
  const handleSave = async () => {
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
      notificationConfig: {
        ...config.notificationConfig,
        channels: notificationChannels.value || config.notificationConfig.channels
      },
      schedulingRules: {
        ...config.schedulingRules,
        businessHours: {
          ...config.schedulingRules.businessHours,
          start: businessHoursStart.value || config.schedulingRules.businessHours.start,
          end: businessHoursEnd.value || config.schedulingRules.businessHours.end
        }
      },
      integration: {
        ...config.integration,
        crmSystem: crmSystem.value || config.integration.crmSystem
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

  return (
    <div className="space-y-6" dir="rtl">
      {/* Smart Fields Info Banner */}
      {(workflowTrigger.isAutoPopulated || databaseType.isAutoPopulated || notificationChannels.isAutoPopulated || 
        businessHoursStart.isAutoPopulated || businessHoursEnd.isAutoPopulated || 
        n8nInstanceUrl.isAutoPopulated || alertEmail.isAutoPopulated || crmSystem.isAutoPopulated) && (
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

      <Card title="זרימת עבודה לשירות לקוחות" subtitle="הגדר את תהליך הטיפול בפניות לקוחות מהתחלה ועד סיום">
        <div className="space-y-6">
          {/* שלבי זרימה - existing */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              שלבי זרימת העבודה
            </h4>
            <div className="space-y-3">
              {config.workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{step.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>⏱️ {step.duration}</span>
                      <span>👤 {step.responsible}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* כללי הסלמה - existing */}
          <div>
            <h4 className="font-medium mb-3">כללי הסלמה</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">הסלמה בעדיפות גבוהה</label>
                <textarea
                  value={config.escalationRules.highPriority.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    escalationRules: {
                      ...prev.escalationRules,
                      highPriority: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - כלל הסלמה אחד..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">העברה מיידית</label>
                <textarea
                  value={config.escalationRules.immediateTransfer.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    escalationRules: {
                      ...prev.escalationRules,
                      immediateTransfer: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="כל שורה - סיבה להעברה מיידית..."
                />
              </div>
            </div>
          </div>

          {/* מדדי ביצועים - existing */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              מדדי ביצועים (SLA)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{config.serviceMetrics.responseTime}</div>
                <div className="text-sm text-gray-600">זמן תגובה ראשוני</div>
              </div>

              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{config.serviceMetrics.resolutionTime}</div>
                <div className="text-sm text-gray-600">זמן פתרון</div>
              </div>

              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{config.serviceMetrics.satisfactionTarget}/5</div>
                <div className="text-sm text-gray-600">שביעות רצון לקוח</div>
              </div>
            </div>
          </div>

          {/* הגדרות אינטגרציה - updated with crm_system */}
          <div>
            <h4 className="font-medium mb-3">אינטגרציות מערכת</h4>
            <div className="space-y-4">
              {/* CRM System Smart Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {crmSystem.metadata.label.he}
                  </label>
                  {crmSystem.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטית
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={crmSystem.value || ''}
                  onChange={(e) => crmSystem.setValue(e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    crmSystem.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="Zoho CRM, Salesforce, HubSpot"
                />
                {crmSystem.isAutoPopulated && crmSystem.source && (
                  <p className="text-xs text-gray-500 mt-1">מקור: {crmSystem.source.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.integration.crmSync}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      integration: { ...prev.integration, crmSync: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">סנכרון עם מערכת CRM</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.integration.knowledgeBase}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      integration: { ...prev.integration, knowledgeBase: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">חיפוש בבסיס ידע</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.integration.ticketSystem}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      integration: { ...prev.integration, ticketSystem: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">יצירת כרטיסים במערכת טיקטים</span>
                </label>
              </div>
            </div>
          </div>

          {/* Technical Configuration Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">הגדרות טכניות</h3>
            <div className="space-y-4">
              {/* Workflow Trigger Smart Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {workflowTrigger.metadata.label.he}
                  </label>
                  {workflowTrigger.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטית
                    </span>
                  )}
                </div>
                <select
                  value={workflowTrigger.value || ''}
                  onChange={(e) => workflowTrigger.setValue(e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    workflowTrigger.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">בחר טריגר</option>
                  <option value="webhook">Webhook</option>
                  <option value="schedule">לפי זמן</option>
                  <option value="event">אירוע</option>
                  <option value="manual">ידני</option>
                  <option value="api_call">קריאת API</option>
                </select>
                {workflowTrigger.isAutoPopulated && workflowTrigger.source && (
                  <p className="text-xs text-gray-500 mt-1">מקור: {workflowTrigger.source.description}</p>
                )}
              </div>

              {/* Database Type Smart Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {databaseType.metadata.label.he}
                  </label>
                  {databaseType.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטית
                    </span>
                  )}
                </div>
                <select
                  value={databaseType.value || ''}
                  onChange={(e) => databaseType.setValue(e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    databaseType.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">בחר סוג מסד נתונים</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="sql_server">SQL Server</option>
                </select>
                {databaseType.isAutoPopulated && databaseType.source && (
                  <p className="text-xs text-gray-500 mt-1">מקור: {databaseType.source.description}</p>
                )}
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">מחרוזת חיבור</label>
                <input
                  type="text"
                  value={config.databaseConfig.connectionString || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    databaseConfig: { ...prev.databaseConfig, connectionString: e.target.value }
                  }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="postgresql://user:password@host:port/database"
                />
              </div>

              {/* Notification Channels Smart Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {notificationChannels.metadata.label.he}
                  </label>
                  {notificationChannels.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטית
                    </span>
                  )}
                </div>
                <select
                  multiple
                  value={notificationChannels.value || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    notificationChannels.setValue(selected);
                  }}
                  className={`w-full p-2 border rounded-lg ${
                    notificationChannels.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <option value="email">אימייל</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="slack">Slack</option>
                  <option value="teams">Microsoft Teams</option>
                </select>
                {notificationChannels.isAutoPopulated && notificationChannels.source && (
                  <p className="text-xs text-gray-500 mt-1">מקור: {notificationChannels.source.description}</p>
                )}
              </div>

              {/* Business Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {businessHoursStart.metadata.label.he}
                    </label>
                    {businessHoursStart.isAutoPopulated && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        מולא אוטומטית
                      </span>
                    )}
                  </div>
                  <input
                    type="time"
                    value={businessHoursStart.value || ''}
                    onChange={(e) => businessHoursStart.setValue(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${
                      businessHoursStart.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="09:00"
                  />
                  {businessHoursStart.isAutoPopulated && businessHoursStart.source && (
                    <p className="text-xs text-gray-500 mt-1">מקור: {businessHoursStart.source.description}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {businessHoursEnd.metadata.label.he}
                    </label>
                    {businessHoursEnd.isAutoPopulated && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        מולא אוטומטית
                      </span>
                    )}
                  </div>
                  <input
                    type="time"
                    value={businessHoursEnd.value || ''}
                    onChange={(e) => businessHoursEnd.setValue(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${
                      businessHoursEnd.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="18:00"
                  />
                  {businessHoursEnd.isAutoPopulated && businessHoursEnd.source && (
                    <p className="text-xs text-gray-500 mt-1">מקור: {businessHoursEnd.source.description}</p>
                  )}
                </div>
              </div>

              {/* n8n Workflow */}
              <div className="space-y-4">
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
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    n8nWorkflow: { ...prev.n8nWorkflow, webhookEndpoint: e.target.value }
                  }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://n8n.example.com/webhook/..."
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ניסיונות חוזרים</label>
                    <input
                      type="number"
                      value={config.n8nWorkflow.errorHandling.retryAttempts || 3}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        n8nWorkflow: {
                          ...prev.n8nWorkflow,
                          errorHandling: {
                            ...prev.n8nWorkflow.errorHandling,
                            retryAttempts: parseInt(e.target.value) || 3
                          }
                        }
                      }))}
                      className="w-full p-2 border rounded-lg"
                      min="0"
                      max="10"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
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
                      className={`w-full p-2 border rounded-lg ${
                        alertEmail.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                      placeholder="alerts@example.com"
                    />
                    {alertEmail.isAutoPopulated && alertEmail.source && (
                      <p className="text-xs text-gray-500 mt-1">מקור: {alertEmail.source.description}</p>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.n8nWorkflow.httpsEnabled || true}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      n8nWorkflow: { ...prev.n8nWorkflow, httpsEnabled: e.target.checked }
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">HTTPS מופעל</span>
                </label>
              </div>
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
              {!isSaving && !saveError && config.workflowSteps.length > 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">נשמר אוטומטית</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
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



