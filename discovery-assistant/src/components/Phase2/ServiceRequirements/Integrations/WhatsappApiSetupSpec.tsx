import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import type { WhatsappApiSetupRequirements } from '../../../../types/integrationServices';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

export function WhatsappApiSetupSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<WhatsappApiSetupRequirements>>({
    metaBusinessManager: {
      accountId: '',
      verified: false,
      businessEmail: '',
      businessWebsite: '',
      privacyPolicyUrl: ''
    },
    facebookApp: {
      appId: '',
      appSecret: '',
      accessToken: '',
      tokenExpiry: ''
    },
    whatsappBusinessAccount: {
      wabaId: '',
      phoneNumber: '',
      phoneNumberId: '',
      displayName: '',
      tier: 'tier-1'
    },
    apiConfig: {
      type: 'cloud-api',
      apiVersion: 'v18.0',
      rateLimits: {
        messagesPerSecond: 80,
        messagesPerDay: 1000000
      }
    },
    messageTemplates: [],
    webhookConfig: {
      url: '',
      secret: '',
      signatureVerification: 'hmac-sha256',
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: 'exponential',
        delays: [1, 2, 4]
      },
      sslRequired: true,
      verifyToken: '',
      subscriptionFields: ['messages', 'message_status'],
      alertEmail: ''
    },
    integrations: {
      n8n: {
        incomingWebhookUrl: '',
        outgoingApiEndpoint: ''
      },
      crm: {
        system: '',
        contactSync: false,
        conversationLogging: false
      },
      database: {
        type: 'supabase',
        messageHistory: true,
        templateStorage: true
      }
    },
    messagingRules: {
      twentyFourHourWindow: true,
      requireTemplatesOutsideWindow: true,
      freeFormResponseWindow: 86400
    },
    mediaConfig: {
      supportedTypes: ['image', 'document'],
      maxSizes: {
        image: 5,
        video: 16,
        document: 100
      },
      retentionDays: 30
    },
    pricingConfig: {
      model: 'pay-per-message',
      countryCode: 'IL',
      rates: {
        marketing: 0,
        utility: 0,
        authentication: 0
      },
      estimatedMonthlyMessages: 0,
      estimatedMonthlyCost: 0
    },
    qualityControl: {
      currentRating: 'high',
      spamComplaintsThreshold: 0.01,
      blockRate: 0.01,
      qualityMonitoring: true
    },
    testing: {
      testNumbers: [],
      sandboxMode: false,
      testingCompleted: false
    },
    metadata: {
      complexity: 'medium',
      estimatedHours: 20,
      prerequisites: [],
      legalCompliance: ['gdpr']
    }
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'whatsapp-api-setup',
    immediateFields: ['whatsappBusinessAccount', 'apiConfig', 'webhookConfig'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in WhatsappApiSetupSpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      whatsappBusinessAccount: {
        ...config.whatsappBusinessAccount,
        phoneNumber: whatsappPhoneNumber.value
      },
      integrations: {
        ...config.integrations,
        crm: {
          ...config.integrations?.crm,
          system: crmSystem.value
        }
      }
    };
    saveData(completeConfig);
  });

  const whatsappPhoneNumber = useSmartField<string>({
    fieldId: 'whatsapp_phone_number',
    localPath: 'whatsappBusinessAccount.phoneNumber',
    serviceId: 'whatsapp-api-setup',
    autoSave: false
  });

  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'integrations.crm.system',
    serviceId: 'whatsapp-api-setup',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'webhookConfig.alertEmail',
    serviceId: 'whatsapp-api-setup',
    autoSave: false
  });

  const [newTemplate, setNewTemplate] = useState({
    templateId: '',
    name: '',
    category: 'utility' as 'marketing' | 'utility' | 'authentication',
    language: 'he',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    content: '',
    variables: [] as string[]
  });

  const [newTestNumber, setNewTestNumber] = useState('');

  useEffect(() => {
    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find(i => i.serviceId === 'whatsapp-api-setup');
    if (existing?.requirements) {
      setConfig(existing.requirements as Partial<WhatsappApiSetupRequirements>);
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.whatsappBusinessAccount?.phoneNumber || config.apiConfig?.type) {
      const completeConfig = {
        ...config,
        whatsappBusinessAccount: {
          ...config.whatsappBusinessAccount,
          phoneNumber: whatsappPhoneNumber.value
        },
        integrations: {
          ...config.integrations,
          crm: {
            ...config.integrations?.crm,
            system: crmSystem.value
          }
        }
      };
      saveData(completeConfig);
    }
  }, [config, whatsappPhoneNumber.value, crmSystem.value, saveData]);

  const handleSave = async () => {
    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      whatsappBusinessAccount: {
        ...config.whatsappBusinessAccount!,
        phoneNumber: whatsappPhoneNumber.value
      },
      integrations: {
        ...config.integrations!,
        crm: {
          ...config.integrations!.crm!,
          system: crmSystem.value
        }
      },
      webhookConfig: {
        ...config.webhookConfig!,
        alertEmail: alertEmail.value
      }
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  };

  const addTemplate = () => {
    if (newTemplate.templateId && newTemplate.name) {
      setConfig({
        ...config,
        messageTemplates: [...(config.messageTemplates || []), { ...newTemplate }]
      });
      setNewTemplate({
        templateId: '',
        name: '',
        category: 'utility',
        language: 'he',
        status: 'pending',
        content: '',
        variables: []
      });
    }
  };

  const removeTemplate = (index: number) => {
    setConfig({
      ...config,
      messageTemplates: config.messageTemplates?.filter((_, i) => i !== index) || []
    });
  };

  const addTestNumber = () => {
    if (newTestNumber) {
      setConfig({
        ...config,
        testing: {
          ...config.testing!,
          testNumbers: [...(config.testing?.testNumbers || []), newTestNumber]
        }
      });
      setNewTestNumber('');
    }
  };

  const removeTestNumber = (index: number) => {
    setConfig({
      ...config,
      testing: {
        ...config.testing!,
        testNumbers: config.testing?.testNumbers?.filter((_, i) => i !== index) || []
      }
    });
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      {(whatsappPhoneNumber.isAutoPopulated || crmSystem.isAutoPopulated || alertEmail.isAutoPopulated) && (
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

      {(whatsappPhoneNumber.hasConflict || crmSystem.hasConflict || alertEmail.hasConflict) && (
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

      <Card title="שירות #34: הקמת WhatsApp Business API">
        <div className="space-y-6">

          {/* Meta Business Manager */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Meta Business Manager</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
                <input
                  type="text"
                  value={config.metaBusinessManager?.accountId || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessManager: { ...config.metaBusinessManager!, accountId: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="123456789012345"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">אימייל עסקי</label>
                  <input
                    type="email"
                    value={config.metaBusinessManager?.businessEmail || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      metaBusinessManager: { ...config.metaBusinessManager!, businessEmail: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">אתר עסקי</label>
                  <input
                    type="url"
                    value={config.metaBusinessManager?.businessWebsite || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      metaBusinessManager: { ...config.metaBusinessManager!, businessWebsite: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy URL</label>
                <input
                  type="url"
                  value={config.metaBusinessManager?.privacyPolicyUrl || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessManager: { ...config.metaBusinessManager!, privacyPolicyUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.metaBusinessManager?.verified || false}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessManager: { ...config.metaBusinessManager!, verified: e.target.checked }
                  })}
                  className="rounded"
                />
                <span>החשבון מאומת (Business Verified)</span>
              </label>
            </div>
          </div>

          {/* Facebook App */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Facebook App Configuration</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">App ID</label>
                  <input
                    type="text"
                    value={config.facebookApp?.appId || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      facebookApp: { ...config.facebookApp!, appId: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">App Secret</label>
                  <input
                    type="password"
                    value={config.facebookApp?.appSecret || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      facebookApp: { ...config.facebookApp!, appSecret: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                <input
                  type="password"
                  value={config.facebookApp?.accessToken || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    facebookApp: { ...config.facebookApp!, accessToken: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token Expiry (אופציונלי)</label>
                <input
                  type="datetime-local"
                  value={config.facebookApp?.tokenExpiry || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    facebookApp: { ...config.facebookApp!, tokenExpiry: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Business Account */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">WhatsApp Business Account (WABA)</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WABA ID</label>
                  <input
                    type="text"
                    value={config.whatsappBusinessAccount?.wabaId || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      whatsappBusinessAccount: { ...config.whatsappBusinessAccount!, wabaId: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    value={config.whatsappBusinessAccount?.phoneNumberId || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      whatsappBusinessAccount: { ...config.whatsappBusinessAccount!, phoneNumberId: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    מספר טלפון עסקי WhatsApp
                  </label>
                  {whatsappPhoneNumber.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטי
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  value={whatsappPhoneNumber.value || ''}
                  onChange={(e) => whatsappPhoneNumber.setValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    whatsappPhoneNumber.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  } ${whatsappPhoneNumber.hasConflict ? 'border-orange-300' : ''}`}
                  placeholder="+972501234567"
                />
                {whatsappPhoneNumber.isAutoPopulated && whatsappPhoneNumber.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    מקור: {whatsappPhoneNumber.source.description}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={config.whatsappBusinessAccount?.displayName || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      whatsappBusinessAccount: { ...config.whatsappBusinessAccount!, displayName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="שם העסק"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Messaging Tier</label>
                <select
                  value={config.whatsappBusinessAccount?.tier || 'tier-1'}
                  onChange={(e) => setConfig({
                    ...config,
                    whatsappBusinessAccount: { ...config.whatsappBusinessAccount!, tier: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="tier-1">Tier 1 (1,000 conversations/day)</option>
                  <option value="tier-2">Tier 2 (10,000 conversations/day)</option>
                  <option value="tier-3">Tier 3 (100,000 conversations/day)</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Type</label>
                  <select
                    value={config.apiConfig?.type || 'cloud-api'}
                    onChange={(e) => setConfig({
                      ...config,
                      apiConfig: { ...config.apiConfig!, type: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="cloud-api">Cloud API</option>
                    <option value="on-premise">On-Premise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Version</label>
                  <input
                    type="text"
                    value={config.apiConfig?.apiVersion || 'v18.0'}
                    onChange={(e) => setConfig({
                      ...config,
                      apiConfig: { ...config.apiConfig!, apiVersion: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">הודעות לשנייה</label>
                  <input
                    type="number"
                    value={config.apiConfig?.rateLimits?.messagesPerSecond || 80}
                    onChange={(e) => setConfig({
                      ...config,
                      apiConfig: {
                        ...config.apiConfig!,
                        rateLimits: {
                          ...config.apiConfig!.rateLimits!,
                          messagesPerSecond: parseInt(e.target.value)
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">הודעות ליום</label>
                  <input
                    type="number"
                    value={config.apiConfig?.rateLimits?.messagesPerDay || 1000000}
                    onChange={(e) => setConfig({
                      ...config,
                      apiConfig: {
                        ...config.apiConfig!,
                        rateLimits: {
                          ...config.apiConfig!.rateLimits!,
                          messagesPerDay: parseInt(e.target.value)
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Message Templates */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Message Templates</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newTemplate.templateId}
                  onChange={(e) => setNewTemplate({ ...newTemplate, templateId: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Template ID"
                />
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="שם Template"
                />
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="marketing">Marketing</option>
                  <option value="utility">Utility</option>
                  <option value="authentication">Authentication</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newTemplate.language}
                  onChange={(e) => setNewTemplate({ ...newTemplate, language: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="he">עברית</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
                <select
                  value={newTemplate.status}
                  onChange={(e) => setNewTemplate({ ...newTemplate, status: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="תוכן ההודעה..."
              />
              <button
                onClick={addTemplate}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                הוסף Template
              </button>

              {config.messageTemplates && config.messageTemplates.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600">Templates ({config.messageTemplates.length}):</p>
                  {config.messageTemplates.map((template, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div className="flex-1">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-sm text-gray-600 mr-2">({template.category})</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          template.status === 'approved' ? 'bg-green-100 text-green-800' :
                          template.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {template.status}
                        </span>
                      </div>
                      <button
                        onClick={() => removeTemplate(index)}
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

          {/* Webhook Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Webhook Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                <input
                  type="url"
                  value={config.webhookConfig?.url || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    webhookConfig: { ...config.webhookConfig!, url: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://your-server.com/webhook"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                  <input
                    type="password"
                    value={config.webhookConfig?.secret || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      webhookConfig: { ...config.webhookConfig!, secret: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {alertEmail.metadata.label.he}
                    </label>
                    {alertEmail.isAutoPopulated && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        מולא אוטומטי
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
                    placeholder="alerts@company.com"
                  />
                  {alertEmail.isAutoPopulated && alertEmail.source && (
                    <p className="text-xs text-gray-500 mt-1">
                      מקור: {alertEmail.source.description}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verify Token</label>
                  <input
                    type="text"
                    value={config.webhookConfig?.verifyToken || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      webhookConfig: { ...config.webhookConfig!, verifyToken: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.webhookConfig?.sslRequired || false}
                  onChange={(e) => setConfig({
                    ...config,
                    webhookConfig: { ...config.webhookConfig!, sslRequired: e.target.checked }
                  })}
                  className="rounded"
                />
                <span>SSL Required</span>
              </label>
            </div>
          </div>

          {/* Integrations */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">אינטגרציות</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">n8n Integration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Incoming Webhook URL</label>
                    <input
                      type="url"
                      value={config.integrations?.n8n?.incomingWebhookUrl || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        integrations: {
                          ...config.integrations!,
                          n8n: { ...config.integrations!.n8n!, incomingWebhookUrl: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Outgoing API Endpoint</label>
                    <input
                      type="url"
                      value={config.integrations?.n8n?.outgoingApiEndpoint || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        integrations: {
                          ...config.integrations!,
                          n8n: { ...config.integrations!.n8n!, outgoingApiEndpoint: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">CRM Integration</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {crmSystem.metadata.label.he}
                      </label>
                      {crmSystem.isAutoPopulated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          מולא אוטומטי
                        </span>
                      )}
                    </div>
                    <select
                      value={crmSystem.value || ''}
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
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.integrations?.crm?.contactSync || false}
                        onChange={(e) => setConfig({
                          ...config,
                          integrations: {
                            ...config.integrations!,
                            crm: { ...config.integrations!.crm!, contactSync: e.target.checked }
                          }
                        })}
                        className="rounded"
                      />
                      <span>סנכרון אנשי קשר</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.integrations?.crm?.conversationLogging || false}
                        onChange={(e) => setConfig({
                          ...config,
                          integrations: {
                            ...config.integrations!,
                            crm: { ...config.integrations!.crm!, conversationLogging: e.target.checked }
                          }
                        })}
                        className="rounded"
                      />
                      <span>רישום שיחות</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Database</h4>
                <div className="space-y-3">
                  <select
                    value={config.integrations?.database?.type || 'supabase'}
                    onChange={(e) => setConfig({
                      ...config,
                      integrations: {
                        ...config.integrations!,
                        database: { ...config.integrations!.database!, type: e.target.value as any }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="supabase">Supabase</option>
                    <option value="postgresql">PostgreSQL</option>
                  </select>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.integrations?.database?.messageHistory || false}
                        onChange={(e) => setConfig({
                          ...config,
                          integrations: {
                            ...config.integrations!,
                            database: { ...config.integrations!.database!, messageHistory: e.target.checked }
                          }
                        })}
                        className="rounded"
                      />
                      <span>היסטוריית הודעות</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.integrations?.database?.templateStorage || false}
                        onChange={(e) => setConfig({
                          ...config,
                          integrations: {
                            ...config.integrations!,
                            database: { ...config.integrations!.database!, templateStorage: e.target.checked }
                          }
                        })}
                        className="rounded"
                      />
                      <span>אחסון Templates</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Media Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Media Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סוגי מדיה נתמכים</label>
                <div className="flex gap-4">
                  {(['image', 'video', 'document', 'audio'] as const).map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.mediaConfig?.supportedTypes?.includes(type) || false}
                        onChange={(e) => {
                          const types = config.mediaConfig?.supportedTypes || [];
                          setConfig({
                            ...config,
                            mediaConfig: {
                              ...config.mediaConfig!,
                              supportedTypes: e.target.checked
                                ? [...types, type]
                                : types.filter(t => t !== type)
                            }
                          });
                        }}
                        className="rounded"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Image Size (MB)</label>
                  <input
                    type="number"
                    value={config.mediaConfig?.maxSizes?.image || 5}
                    onChange={(e) => setConfig({
                      ...config,
                      mediaConfig: {
                        ...config.mediaConfig!,
                        maxSizes: {
                          ...config.mediaConfig!.maxSizes!,
                          image: parseInt(e.target.value)
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Video Size (MB)</label>
                  <input
                    type="number"
                    value={config.mediaConfig?.maxSizes?.video || 16}
                    onChange={(e) => setConfig({
                      ...config,
                      mediaConfig: {
                        ...config.mediaConfig!,
                        maxSizes: {
                          ...config.mediaConfig!.maxSizes!,
                          video: parseInt(e.target.value)
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Document Size (MB)</label>
                  <input
                    type="number"
                    value={config.mediaConfig?.maxSizes?.document || 100}
                    onChange={(e) => setConfig({
                      ...config,
                      mediaConfig: {
                        ...config.mediaConfig!,
                        maxSizes: {
                          ...config.mediaConfig!.maxSizes!,
                          document: parseInt(e.target.value)
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retention Days</label>
                <input
                  type="number"
                  value={config.mediaConfig?.retentionDays || 30}
                  onChange={(e) => setConfig({
                    ...config,
                    mediaConfig: { ...config.mediaConfig!, retentionDays: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Pricing Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">תמחור</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
                  <input
                    type="text"
                    value={config.pricingConfig?.countryCode || 'IL'}
                    onChange={(e) => setConfig({
                      ...config,
                      pricingConfig: { ...config.pricingConfig!, countryCode: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Marketing Rate</label>
                  <input
                    type="number"
                    step="0.001"
                    value={config.pricingConfig?.rates?.marketing || 0}
                    onChange={(e) => setConfig({
                      ...config,
                      pricingConfig: {
                        ...config.pricingConfig!,
                        rates: {
                          ...config.pricingConfig!.rates!,
                          marketing: parseFloat(e.target.value)
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Utility Rate</label>
                  <input
                    type="number"
                    step="0.001"
                    value={config.pricingConfig?.rates?.utility || 0}
                    onChange={(e) => setConfig({
                      ...config,
                      pricingConfig: {
                        ...config.pricingConfig!,
                        rates: {
                          ...config.pricingConfig!.rates!,
                          utility: parseFloat(e.target.value)
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Authentication Rate</label>
                  <input
                    type="number"
                    step="0.001"
                    value={config.pricingConfig?.rates?.authentication || 0}
                    onChange={(e) => setConfig({
                      ...config,
                      pricingConfig: {
                        ...config.pricingConfig!,
                        rates: {
                          ...config.pricingConfig!.rates!,
                          authentication: parseFloat(e.target.value)
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">הודעות משוערות לחודש</label>
                  <input
                    type="number"
                    value={config.pricingConfig?.estimatedMonthlyMessages || 0}
                    onChange={(e) => setConfig({
                      ...config,
                      pricingConfig: { ...config.pricingConfig!, estimatedMonthlyMessages: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">עלות משוערת לחודש ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.pricingConfig?.estimatedMonthlyCost || 0}
                    onChange={(e) => setConfig({
                      ...config,
                      pricingConfig: { ...config.pricingConfig!, estimatedMonthlyCost: parseFloat(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Testing */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Testing</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Numbers</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={newTestNumber}
                    onChange={(e) => setNewTestNumber(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="+972501234567"
                  />
                  <button
                    onClick={addTestNumber}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    הוסף
                  </button>
                </div>
                {config.testing?.testNumbers && config.testing.testNumbers.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {config.testing.testNumbers.map((number, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{number}</span>
                        <button
                          onClick={() => removeTestNumber(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          הסר
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.testing?.sandboxMode || false}
                    onChange={(e) => setConfig({
                      ...config,
                      testing: { ...config.testing!, sandboxMode: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>Sandbox Mode</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.testing?.testingCompleted || false}
                    onChange={(e) => setConfig({
                      ...config,
                      testing: { ...config.testing!, testingCompleted: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span>בדיקות הושלמו</span>
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
                  value={config.metadata?.estimatedHours || 20}
                  onChange={(e) => setConfig({
                    ...config,
                    metadata: { ...config.metadata!, estimatedHours: parseInt(e.target.value) }
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
