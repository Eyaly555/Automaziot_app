import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import type { IntCrmMarketingRequirements, SystemConfig, FieldMapping, WebhookConfig } from '../../../../types/integrationServices';
import { useSmartField } from '../../../../hooks/useSmartField';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

export function IntCrmMarketingSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem.name',
    serviceId: 'int-crm-marketing',
    autoSave: false
  });

  const apiAuthMethod = useSmartField<string>({
    fieldId: 'api_auth_method',
    localPath: 'crmSystem.authType',
    serviceId: 'int-crm-marketing',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'errorHandling.alertRecipients[0]',
    serviceId: 'int-crm-marketing',
    autoSave: false
  });

  const [config, setConfig] = useState<Partial<IntCrmMarketingRequirements>>({
    crmSystem: {
      name: 'Zoho CRM',
      authType: 'oauth2',
      credentials: {},
      modules: ['contacts', 'leads', 'accounts'],
      customFields: []
    },
    marketingPlatform: {
      type: 'mailchimp',
      config: {
        name: 'Mailchimp',
        authType: 'api_key',
        credentials: {}
      },
      capabilities: {
        lists: true,
        campaigns: true,
        automation: true,
        leadScoring: false
      }
    },
    syncConfig: {
      direction: 'bi-directional',
      frequency: 'real-time',
      crmToMarketing: {
        entities: ['contacts', 'leads'],
        triggers: [],
        listSegmentation: {
          enabled: false,
          rules: []
        }
      },
      marketingToCrm: {
        entities: ['email-opens', 'clicks'],
        triggers: [],
        leadScoring: {
          enabled: false,
          scoreFieldInCrm: '',
          scoringRules: []
        }
      }
    },
    fieldMappings: [],
    duplicateHandling: {
      uniqueKey: 'email',
      strategy: 'update',
      deduplicationRules: []
    },
    unsubscribeSync: {
      enabled: true,
      syncWithinMinutes: 5,
      respectGlobalUnsubscribe: true,
      listSpecificUnsubscribes: true
    },
    campaignTracking: {
      enabled: true,
      campaignIdMapping: {
        crmField: '',
        marketingField: ''
      },
      roiTracking: {
        enabled: false,
        linkToDeals: false
      }
    },
    compliance: {
      gdprCompliant: true,
      consentManagement: {
        enabled: true,
        consentDateField: '',
        consentSourceField: ''
      },
      dataRetentionDays: 730,
      rightToErasure: true
    },
    listHygiene: {
      removeBouncedEmails: true,
      removeInactiveContacts: false,
      inactivityThresholdDays: 365
    },
    batchConfig: {
      enabled: false,
      batchSize: 100,
      batchFrequency: 'daily'
    },
    webhooks: [],
    errorHandling: {
      retryAttempts: 3,
      retryDelays: [5, 15, 45],
      alertChannels: ['email'],
      alertRecipients: []
    },
    metadata: {
      complexity: 'medium',
      estimatedHours: 40,
      prerequisites: [],
      monthlyApiCalls: 50000,
      monthlyCost: 0
    }
  });

  // Array item builders
  const [newCustomField, setNewCustomField] = useState({ fieldName: '', fieldType: '', apiName: '' });
  const [newFieldMapping, setNewFieldMapping] = useState({ crmField: '', marketingField: '', syncDirection: 'bi-directional' as const, transformation: '' });
  const [newSegmentationRule, setNewSegmentationRule] = useState({ crmCondition: '', marketingList: '' });
  const [newWebhook, setNewWebhook] = useState({ url: '', secret: '', sslRequired: true });

  useEffect(() => {
    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find(i => i.serviceId === 'int-crm-marketing');
    if (existing?.requirements) {
      setConfig(existing.requirements as Partial<IntCrmMarketingRequirements>);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const updated = integrationServices.filter(i => i.serviceId !== 'int-crm-marketing');

    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      crmSystem: {
        ...config.crmSystem!,
        name: crmSystem.value,
        authType: apiAuthMethod.value
      },
      errorHandling: {
        ...config.errorHandling!,
        alertRecipients: alertEmail.value ? [alertEmail.value] : config.errorHandling?.alertRecipients || []
      }
    };

    updated.push({
      serviceId: 'int-crm-marketing',
      serviceName: 'אינטגרציית CRM למערכת Marketing Automation',
      serviceNameHe: 'אינטגרציית CRM למערכת Marketing Automation',
      requirements: completeConfig,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        integrationServices: updated,
      },
    });
  };

  // Array handlers
  const addCustomField = () => {
    if (!newCustomField.fieldName || !newCustomField.apiName) return;
    const customFields = config.crmSystem?.customFields || [];
    setConfig({
      ...config,
      crmSystem: {
        ...config.crmSystem!,
        customFields: [...customFields, { ...newCustomField }]
      }
    });
    setNewCustomField({ fieldName: '', fieldType: '', apiName: '' });
  };

  const removeCustomField = (index: number) => {
    const customFields = config.crmSystem?.customFields || [];
    setConfig({
      ...config,
      crmSystem: {
        ...config.crmSystem!,
        customFields: customFields.filter((_, i) => i !== index)
      }
    });
  };

  const addFieldMapping = () => {
    if (!newFieldMapping.crmField || !newFieldMapping.marketingField) return;
    const mappings = config.fieldMappings || [];
    setConfig({
      ...config,
      fieldMappings: [...mappings, { ...newFieldMapping }]
    });
    setNewFieldMapping({ crmField: '', marketingField: '', syncDirection: 'bi-directional', transformation: '' });
  };

  const removeFieldMapping = (index: number) => {
    const mappings = config.fieldMappings || [];
    setConfig({
      ...config,
      fieldMappings: mappings.filter((_, i) => i !== index)
    });
  };

  const addSegmentationRule = () => {
    if (!newSegmentationRule.crmCondition || !newSegmentationRule.marketingList) return;
    const rules = config.syncConfig?.crmToMarketing?.listSegmentation?.rules || [];
    setConfig({
      ...config,
      syncConfig: {
        ...config.syncConfig!,
        crmToMarketing: {
          ...config.syncConfig!.crmToMarketing!,
          listSegmentation: {
            ...config.syncConfig!.crmToMarketing!.listSegmentation!,
            rules: [...rules, { ...newSegmentationRule }]
          }
        }
      }
    });
    setNewSegmentationRule({ crmCondition: '', marketingList: '' });
  };

  const removeSegmentationRule = (index: number) => {
    const rules = config.syncConfig?.crmToMarketing?.listSegmentation?.rules || [];
    setConfig({
      ...config,
      syncConfig: {
        ...config.syncConfig!,
        crmToMarketing: {
          ...config.syncConfig!.crmToMarketing!,
          listSegmentation: {
            ...config.syncConfig!.crmToMarketing!.listSegmentation!,
            rules: rules.filter((_, i) => i !== index)
          }
        }
      }
    });
  };

  const addWebhook = () => {
    if (!newWebhook.url) return;
    const webhooks = config.webhooks || [];
    setConfig({
      ...config,
      webhooks: [...webhooks, { ...newWebhook } as WebhookConfig]
    });
    setNewWebhook({ url: '', secret: '', sslRequired: true });
  };

  const removeWebhook = (index: number) => {
    const webhooks = config.webhooks || [];
    setConfig({
      ...config,
      webhooks: webhooks.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      {/* Smart Fields Info Banner */}
      {(crmSystem.isAutoPopulated || apiAuthMethod.isAutoPopulated || alertEmail.isAutoPopulated) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
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

      {/* Conflict Warnings */}
      {(crmSystem.hasConflict || apiAuthMethod.hasConflict || alertEmail.hasConflict) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-orange-900 mb-1">זוהה אי-התאמה בנתונים</h4>
            <p className="text-sm text-orange-800">
              נמצאו ערכים שונים עבור אותו שדה במקומות שונים. אנא בדוק ותקן.
            </p>
          </div>
        </div>
      )}

      <Card title="שירות #35: אינטגרציית CRM למערכת Marketing Automation">
        <div className="space-y-6">

          {/* CRM System Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות מערכת CRM</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
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
                  <select
                    value={crmSystem.value || 'zoho'}
                    onChange={(e) => crmSystem.setValue(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      crmSystem.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    } ${crmSystem.hasConflict ? 'border-orange-300' : ''}`}
                  >
                    <option value="zoho">Zoho CRM</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="pipedrive">Pipedrive</option>
                    <option value="monday">Monday CRM</option>
                    <option value="other">אחר</option>
                  </select>
                  {crmSystem.isAutoPopulated && crmSystem.source && (
                    <p className="text-xs text-gray-500 mt-1">
                      מקור: {crmSystem.source.description}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
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
                    value={apiAuthMethod.value || 'oauth'}
                    onChange={(e) => apiAuthMethod.setValue(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      apiAuthMethod.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    } ${apiAuthMethod.hasConflict ? 'border-orange-300' : ''}`}
                  >
                    <option value="oauth">OAuth 2.0</option>
                    <option value="api_key">API Key</option>
                    <option value="basic_auth">Basic Auth</option>
                    <option value="bearer_token">Bearer Token</option>
                    <option value="jwt">JWT</option>
                  </select>
                  {apiAuthMethod.isAutoPopulated && apiAuthMethod.source && (
                    <p className="text-xs text-gray-500 mt-1">
                      מקור: {apiAuthMethod.source.description}
                    </p>
                  )}
                </div>
              </div>

              {/* CRM Modules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">מודולים ב-CRM</label>
                <div className="flex flex-wrap gap-2">
                  {(['contacts', 'leads', 'accounts', 'custom-modules'] as const).map(module => (
                    <label key={module} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.crmSystem?.modules?.includes(module) || false}
                        onChange={(e) => {
                          const modules = config.crmSystem?.modules || [];
                          setConfig({
                            ...config,
                            crmSystem: {
                              ...config.crmSystem!,
                              modules: e.target.checked
                                ? [...modules, module]
                                : modules.filter(m => m !== module)
                            }
                          });
                        }}
                        className="rounded"
                      />
                      <span>{module === 'contacts' ? 'אנשי קשר' : module === 'leads' ? 'לידים' : module === 'accounts' ? 'חשבונות' : 'מודולים מותאמים'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שדות מותאמים אישית</label>
                <div className="bg-gray-50 p-3 rounded space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="שם שדה"
                      value={newCustomField.fieldName}
                      onChange={(e) => setNewCustomField({ ...newCustomField, fieldName: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="סוג שדה"
                      value={newCustomField.fieldType}
                      onChange={(e) => setNewCustomField({ ...newCustomField, fieldType: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="API Name"
                      value={newCustomField.apiName}
                      onChange={(e) => setNewCustomField({ ...newCustomField, apiName: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={addCustomField}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      הוסף
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(config.crmSystem?.customFields || []).map((field, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-sm">{field.fieldName} ({field.fieldType}) - {field.apiName}</span>
                        <button
                          onClick={() => removeCustomField(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          הסר
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Platform Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">פלטפורמת Marketing</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סוג הפלטפורמה</label>
                  <select
                    value={config.marketingPlatform?.type || 'mailchimp'}
                    onChange={(e) => setConfig({
                      ...config,
                      marketingPlatform: {
                        ...config.marketingPlatform!,
                        type: e.target.value as any
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="hubspot">HubSpot</option>
                    <option value="mailchimp">Mailchimp</option>
                    <option value="activecampaign">ActiveCampaign</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם המערכת</label>
                  <input
                    type="text"
                    value={config.marketingPlatform?.config?.name || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      marketingPlatform: {
                        ...config.marketingPlatform!,
                        config: { ...config.marketingPlatform!.config!, name: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Platform Capabilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">יכולות פלטפורמה</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.marketingPlatform?.capabilities?.lists || false}
                      onChange={(e) => setConfig({
                        ...config,
                        marketingPlatform: {
                          ...config.marketingPlatform!,
                          capabilities: { ...config.marketingPlatform!.capabilities!, lists: e.target.checked }
                        }
                      })}
                      className="rounded"
                    />
                    <span>רשימות תפוצה</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.marketingPlatform?.capabilities?.campaigns || false}
                      onChange={(e) => setConfig({
                        ...config,
                        marketingPlatform: {
                          ...config.marketingPlatform!,
                          capabilities: { ...config.marketingPlatform!.capabilities!, campaigns: e.target.checked }
                        }
                      })}
                      className="rounded"
                    />
                    <span>קמפיינים</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.marketingPlatform?.capabilities?.automation || false}
                      onChange={(e) => setConfig({
                        ...config,
                        marketingPlatform: {
                          ...config.marketingPlatform!,
                          capabilities: { ...config.marketingPlatform!.capabilities!, automation: e.target.checked }
                        }
                      })}
                      className="rounded"
                    />
                    <span>אוטומציה</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.marketingPlatform?.capabilities?.leadScoring || false}
                      onChange={(e) => setConfig({
                        ...config,
                        marketingPlatform: {
                          ...config.marketingPlatform!,
                          capabilities: { ...config.marketingPlatform!.capabilities!, leadScoring: e.target.checked }
                        }
                      })}
                      className="rounded"
                    />
                    <span>Lead Scoring</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות סנכרון</h3>
            <div className="space-y-4">

              {/* CRM → Marketing */}
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium mb-3">CRM → Marketing</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">ישויות לסנכרון</label>
                    <div className="flex flex-wrap gap-2">
                      {(['contacts', 'leads', 'tags', 'custom-fields'] as const).map(entity => (
                        <label key={entity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={config.syncConfig?.crmToMarketing?.entities?.includes(entity) || false}
                            onChange={(e) => {
                              const entities = config.syncConfig?.crmToMarketing?.entities || [];
                              setConfig({
                                ...config,
                                syncConfig: {
                                  ...config.syncConfig!,
                                  crmToMarketing: {
                                    ...config.syncConfig!.crmToMarketing!,
                                    entities: e.target.checked
                                      ? [...entities, entity]
                                      : entities.filter(ent => ent !== entity)
                                  }
                                }
                              });
                            }}
                            className="rounded"
                          />
                          <span>{entity === 'contacts' ? 'אנשי קשר' : entity === 'leads' ? 'לידים' : entity === 'tags' ? 'תגיות' : 'שדות מותאמים'}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* List Segmentation */}
                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        checked={config.syncConfig?.crmToMarketing?.listSegmentation?.enabled || false}
                        onChange={(e) => setConfig({
                          ...config,
                          syncConfig: {
                            ...config.syncConfig!,
                            crmToMarketing: {
                              ...config.syncConfig!.crmToMarketing!,
                              listSegmentation: {
                                ...config.syncConfig!.crmToMarketing!.listSegmentation!,
                                enabled: e.target.checked
                              }
                            }
                          }
                        })}
                        className="rounded"
                      />
                      <span className="font-medium">פילוח רשימות (Segmentation)</span>
                    </label>

                    {config.syncConfig?.crmToMarketing?.listSegmentation?.enabled && (
                      <div className="mr-6 bg-white p-3 rounded space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="תנאי CRM"
                            value={newSegmentationRule.crmCondition}
                            onChange={(e) => setNewSegmentationRule({ ...newSegmentationRule, crmCondition: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          />
                          <input
                            type="text"
                            placeholder="רשימת Marketing"
                            value={newSegmentationRule.marketingList}
                            onChange={(e) => setNewSegmentationRule({ ...newSegmentationRule, marketingList: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          />
                          <button
                            onClick={addSegmentationRule}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            הוסף
                          </button>
                        </div>
                        <div className="space-y-1">
                          {(config.syncConfig?.crmToMarketing?.listSegmentation?.rules || []).map((rule, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                              <span className="text-sm">{rule.crmCondition} → {rule.marketingList}</span>
                              <button
                                onClick={() => removeSegmentationRule(index)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                הסר
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Marketing → CRM */}
              <div className="bg-green-50 p-4 rounded">
                <h4 className="font-medium mb-3">Marketing → CRM</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">ישויות לסנכרון</label>
                    <div className="flex flex-wrap gap-2">
                      {(['email-opens', 'clicks', 'unsubscribes', 'conversions', 'campaign-responses'] as const).map(entity => (
                        <label key={entity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={config.syncConfig?.marketingToCrm?.entities?.includes(entity) || false}
                            onChange={(e) => {
                              const entities = config.syncConfig?.marketingToCrm?.entities || [];
                              setConfig({
                                ...config,
                                syncConfig: {
                                  ...config.syncConfig!,
                                  marketingToCrm: {
                                    ...config.syncConfig!.marketingToCrm!,
                                    entities: e.target.checked
                                      ? [...entities, entity]
                                      : entities.filter(ent => ent !== entity)
                                  }
                                }
                              });
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{entity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Lead Scoring */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.syncConfig?.marketingToCrm?.leadScoring?.enabled || false}
                        onChange={(e) => setConfig({
                          ...config,
                          syncConfig: {
                            ...config.syncConfig!,
                            marketingToCrm: {
                              ...config.syncConfig!.marketingToCrm!,
                              leadScoring: {
                                ...config.syncConfig!.marketingToCrm!.leadScoring!,
                                enabled: e.target.checked
                              }
                            }
                          }
                        })}
                        className="rounded"
                      />
                      <span className="font-medium">Lead Scoring</span>
                    </label>
                    {config.syncConfig?.marketingToCrm?.leadScoring?.enabled && (
                      <div className="mr-6 mt-2">
                        <input
                          type="text"
                          placeholder="שם שדה ציון ב-CRM"
                          value={config.syncConfig?.marketingToCrm?.leadScoring?.scoreFieldInCrm || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            syncConfig: {
                              ...config.syncConfig!,
                              marketingToCrm: {
                                ...config.syncConfig!.marketingToCrm!,
                                leadScoring: {
                                  ...config.syncConfig!.marketingToCrm!.leadScoring!,
                                  scoreFieldInCrm: e.target.value
                                }
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Field Mappings */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מיפוי שדות</h3>
            <div className="bg-gray-50 p-3 rounded space-y-2">
              <div className="grid grid-cols-5 gap-2">
                <input
                  type="text"
                  placeholder="שדה CRM"
                  value={newFieldMapping.crmField}
                  onChange={(e) => setNewFieldMapping({ ...newFieldMapping, crmField: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="שדה Marketing"
                  value={newFieldMapping.marketingField}
                  onChange={(e) => setNewFieldMapping({ ...newFieldMapping, marketingField: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <select
                  value={newFieldMapping.syncDirection}
                  onChange={(e) => setNewFieldMapping({ ...newFieldMapping, syncDirection: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="bi-directional">דו-כיווני</option>
                  <option value="crm-to-marketing">CRM → Marketing</option>
                  <option value="marketing-to-crm">Marketing → CRM</option>
                </select>
                <input
                  type="text"
                  placeholder="טרנספורמציה"
                  value={newFieldMapping.transformation}
                  onChange={(e) => setNewFieldMapping({ ...newFieldMapping, transformation: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={addFieldMapping}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  הוסף
                </button>
              </div>
              <div className="space-y-1">
                {(config.fieldMappings || []).map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm">{mapping.crmField} ↔ {mapping.marketingField} ({mapping.syncDirection})</span>
                    <button
                      onClick={() => removeFieldMapping(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      הסר
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Duplicate Handling */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">טיפול בכפילויות</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מפתח ייחודי</label>
                <select
                  value={config.duplicateHandling?.uniqueKey || 'email'}
                  onChange={(e) => setConfig({
                    ...config,
                    duplicateHandling: { ...config.duplicateHandling!, uniqueKey: e.target.value as 'email' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אסטרטגיה</label>
                <select
                  value={config.duplicateHandling?.strategy || 'update'}
                  onChange={(e) => setConfig({
                    ...config,
                    duplicateHandling: { ...config.duplicateHandling!, strategy: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="skip">דלג</option>
                  <option value="update">עדכן</option>
                  <option value="create-new">צור חדש</option>
                </select>
              </div>
            </div>
          </div>

          {/* Unsubscribe Sync (CRITICAL) */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">סנכרון ביטול הרשמה (קריטי - חוקי!)</h3>
            <div className="bg-red-50 p-4 rounded space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.unsubscribeSync?.enabled || false}
                  onChange={(e) => setConfig({
                    ...config,
                    unsubscribeSync: { ...config.unsubscribeSync!, enabled: e.target.checked }
                  })}
                  className="rounded"
                />
                <span className="font-medium">סנכרון ביטול הרשמה מופעל</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">סנכרון תוך כמה דקות</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={config.unsubscribeSync?.syncWithinMinutes || 5}
                    onChange={(e) => setConfig({
                      ...config,
                      unsubscribeSync: { ...config.unsubscribeSync!, syncWithinMinutes: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.unsubscribeSync?.respectGlobalUnsubscribe || false}
                    onChange={(e) => setConfig({
                      ...config,
                      unsubscribeSync: { ...config.unsubscribeSync!, respectGlobalUnsubscribe: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>כבד ביטול הרשמה גלובלי</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.unsubscribeSync?.listSpecificUnsubscribes || false}
                    onChange={(e) => setConfig({
                      ...config,
                      unsubscribeSync: { ...config.unsubscribeSync!, listSpecificUnsubscribes: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>ביטול ספציפי לרשימה</span>
                </label>
              </div>
            </div>
          </div>

          {/* Campaign Tracking */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מעקב קמפיינים</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.campaignTracking?.enabled || false}
                  onChange={(e) => setConfig({
                    ...config,
                    campaignTracking: { ...config.campaignTracking!, enabled: e.target.checked }
                  })}
                  className="rounded"
                />
                <span className="font-medium">מעקב קמפיינים מופעל</span>
              </label>

              {config.campaignTracking?.enabled && (
                <div className="mr-6 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">שדה CRM</label>
                      <input
                        type="text"
                        value={config.campaignTracking?.campaignIdMapping?.crmField || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          campaignTracking: {
                            ...config.campaignTracking!,
                            campaignIdMapping: {
                              ...config.campaignTracking!.campaignIdMapping!,
                              crmField: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">שדה Marketing</label>
                      <input
                        type="text"
                        value={config.campaignTracking?.campaignIdMapping?.marketingField || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          campaignTracking: {
                            ...config.campaignTracking!,
                            campaignIdMapping: {
                              ...config.campaignTracking!.campaignIdMapping!,
                              marketingField: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.campaignTracking?.roiTracking?.enabled || false}
                        onChange={(e) => setConfig({
                          ...config,
                          campaignTracking: {
                            ...config.campaignTracking!,
                            roiTracking: {
                              ...config.campaignTracking!.roiTracking!,
                              enabled: e.target.checked
                            }
                          }
                        })}
                        className="rounded"
                      />
                      <span>מעקב ROI</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.campaignTracking?.roiTracking?.linkToDeals || false}
                        onChange={(e) => setConfig({
                          ...config,
                          campaignTracking: {
                            ...config.campaignTracking!,
                            roiTracking: {
                              ...config.campaignTracking!.roiTracking!,
                              linkToDeals: e.target.checked
                            }
                          }
                        })}
                        className="rounded"
                      />
                      <span>קישור לעסקאות</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compliance (GDPR/CAN-SPAM) */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">תאימות (GDPR/CAN-SPAM)</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.compliance?.gdprCompliant || false}
                  onChange={(e) => setConfig({
                    ...config,
                    compliance: { ...config.compliance!, gdprCompliant: e.target.checked }
                  })}
                  className="rounded"
                />
                <span className="font-medium">תואם GDPR</span>
              </label>

              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={config.compliance?.consentManagement?.enabled || false}
                    onChange={(e) => setConfig({
                      ...config,
                      compliance: {
                        ...config.compliance!,
                        consentManagement: {
                          ...config.compliance!.consentManagement!,
                          enabled: e.target.checked
                        }
                      }
                    })}
                    className="rounded"
                  />
                  <span className="font-medium">ניהול הסכמות</span>
                </label>
                {config.compliance?.consentManagement?.enabled && (
                  <div className="mr-6 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">שדה תאריך הסכמה</label>
                      <input
                        type="text"
                        value={config.compliance?.consentManagement?.consentDateField || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          compliance: {
                            ...config.compliance!,
                            consentManagement: {
                              ...config.compliance!.consentManagement!,
                              consentDateField: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">שדה מקור הסכמה</label>
                      <input
                        type="text"
                        value={config.compliance?.consentManagement?.consentSourceField || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          compliance: {
                            ...config.compliance!,
                            consentManagement: {
                              ...config.compliance!.consentManagement!,
                              consentSourceField: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ימי שמירת נתונים</label>
                  <input
                    type="number"
                    min="1"
                    value={config.compliance?.dataRetentionDays || 730}
                    onChange={(e) => setConfig({
                      ...config,
                      compliance: { ...config.compliance!, dataRetentionDays: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.compliance?.rightToErasure || false}
                  onChange={(e) => setConfig({
                    ...config,
                    compliance: { ...config.compliance!, rightToErasure: e.target.checked }
                  })}
                  className="rounded"
                />
                <span>זכות למחיקה (Right to Erasure)</span>
              </label>
            </div>
          </div>

          {/* List Hygiene */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">היגיינת רשימות</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.listHygiene?.removeBouncedEmails || false}
                  onChange={(e) => setConfig({
                    ...config,
                    listHygiene: { ...config.listHygiene!, removeBouncedEmails: e.target.checked }
                  })}
                  className="rounded"
                />
                <span>הסר כתובות שחזרו (Bounced)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.listHygiene?.removeInactiveContacts || false}
                  onChange={(e) => setConfig({
                    ...config,
                    listHygiene: { ...config.listHygiene!, removeInactiveContacts: e.target.checked }
                  })}
                  className="rounded"
                />
                <span>הסר אנשי קשר לא פעילים</span>
              </label>
              {config.listHygiene?.removeInactiveContacts && (
                <div className="mr-6">
                  <label className="block text-sm text-gray-700 mb-1">סף ימי אי-פעילות</label>
                  <input
                    type="number"
                    min="30"
                    value={config.listHygiene?.inactivityThresholdDays || 365}
                    onChange={(e) => setConfig({
                      ...config,
                      listHygiene: { ...config.listHygiene!, inactivityThresholdDays: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Batch Operations */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">פעולות Batch</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.batchConfig?.enabled || false}
                  onChange={(e) => setConfig({
                    ...config,
                    batchConfig: { ...config.batchConfig!, enabled: e.target.checked }
                  })}
                  className="rounded"
                />
                <span className="font-medium">Batch מופעל</span>
              </label>
              {config.batchConfig?.enabled && (
                <div className="mr-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">גודל Batch</label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={config.batchConfig?.batchSize || 100}
                      onChange={(e) => setConfig({
                        ...config,
                        batchConfig: { ...config.batchConfig!, batchSize: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">תדירות</label>
                    <select
                      value={config.batchConfig?.batchFrequency || 'daily'}
                      onChange={(e) => setConfig({
                        ...config,
                        batchConfig: { ...config.batchConfig!, batchFrequency: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="hourly">שעתי</option>
                      <option value="daily">יומי</option>
                      <option value="weekly">שבועי</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Webhooks */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Webhooks</h3>
            <div className="bg-gray-50 p-3 rounded space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="url"
                  placeholder="URL"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md col-span-2"
                />
                <input
                  type="text"
                  placeholder="Secret"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={addWebhook}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  הוסף
                </button>
              </div>
              <div className="space-y-1">
                {(config.webhooks || []).map((webhook, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm">{webhook.url}</span>
                    <button
                      onClick={() => removeWebhook(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      הסר
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error Handling */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">טיפול בשגיאות</h3>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ערוצי התראה</label>
                <select
                  multiple
                  value={config.errorHandling?.alertChannels || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value as any);
                    setConfig({
                      ...config,
                      errorHandling: { ...config.errorHandling!, alertChannels: values }
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="email">Email</option>
                  <option value="slack">Slack</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
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
                  className={`w-full px-3 py-2 border rounded-md ${
                    alertEmail.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  } ${alertEmail.hasConflict ? 'border-orange-300' : ''}`}
                  placeholder="error@company.com"
                />
                {alertEmail.isAutoPopulated && alertEmail.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    מקור: {alertEmail.source.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Metadata</h3>
            <div className="grid grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">קריאות API חודשיות</label>
                <input
                  type="number"
                  min="0"
                  value={config.metadata?.monthlyApiCalls || 50000}
                  onChange={(e) => setConfig({
                    ...config,
                    metadata: { ...config.metadata!, monthlyApiCalls: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עלות חודשית ($)</label>
                <input
                  type="number"
                  min="0"
                  value={config.metadata?.monthlyCost || 0}
                  onChange={(e) => setConfig({
                    ...config,
                    metadata: { ...config.metadata!, monthlyCost: parseInt(e.target.value) }
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
