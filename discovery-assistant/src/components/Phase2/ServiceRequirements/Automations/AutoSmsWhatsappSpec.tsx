import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoSmsWhatsappRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { useSmartField } from '../../../../hooks/useSmartField';
import { CheckCircle, Info as InfoIcon } from 'lucide-react';

export function AutoSmsWhatsappSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const whatsappApiProvider = useSmartField<string>({
    fieldId: 'whatsapp_api_provider',
    localPath: 'whatsappApiProvider',
    serviceId: 'auto-sms-whatsapp',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'n8nWorkflow.errorHandling.alertEmail',
    serviceId: 'auto-sms-whatsapp',
    autoSave: false
  });

  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nWorkflow.instanceUrl',
    serviceId: 'auto-sms-whatsapp',
    autoSave: false
  });

  const [config, setConfig] = useState<AutoSmsWhatsappRequirements>({
    metaBusinessAccess: {
      businessAccountId: '',
      businessVerificationStatus: 'pending',
      verificationDuration: '3-7 days',
      phoneNumberId: '',
      phoneNumber: '',
      wabaId: '',
      accessToken: '',
      webhookSetup: {
        verificationToken: '',
        callbackUrl: '',
        eventsSubscribed: []
      }
    },
    twilioAccess: {
      accountSid: '',
      authToken: '',
      phoneNumber: '',
      whatsappSandbox: false,
      smsEnabled: false,
      whatsappEnabled: false,
      rateLimits: {
        smsPerHour: 0,
        whatsappPerDay: 0
      },
      pricing: {
        smsPerMessage: 0,
        whatsappPerMessage: 0
      }
    },
    messageTemplates: {
      templatesCreated: false,
      templateApprovalStatus: 'pending',
      approvalTimeline: '24-72 hours',
      templateGuidelines: {
        noLinks: true,
        noPricing: true,
        variablesLimit: 0,
        characterLimit: 0
      },
      rejectionRate: 0
    },
    crmAccess: {
      system: '',
      authMethod: 'oauth',
      credentials: {
        clientId: '',
        clientSecret: '',
        refreshToken: '',
        apiKey: ''
      },
      phoneNumberField: '',
      phoneNumberFormat: 'international',
      optInField: ''
    },
    n8nWorkflow: {
      instanceUrl: '',
      webhookEndpoint: '',
      httpsEnabled: false,
      whatsappIntegration: false,
      twilioIntegration: false,
      errorHandling: {
        retryAttempts: 3,
        alertEmail: '',
        logErrors: true
      }
    },
    prerequisites: {
      dedicatedPhoneNumber: false,
      businessVerification: false,
      metaBusinessAccount: false,
      messageTemplatesReady: false,
      optInMechanismReady: false,
      internationalPhoneFormat: false
    }
  });

  const [activeTab, setActiveTab] = useState<'meta' | 'twilio' | 'templates' | 'crm' | 'n8n' | 'prerequisites'>('meta');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data
  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: any) => a.serviceId === 'auto-sms-whatsapp');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Save handler
  const handleSave = async () => {
    if (!currentMeeting) return;

    setIsSaving(true);
    try {
      const automations = currentMeeting?.implementationSpec?.automations || [];
      const updated = automations.filter((a: any) => a.serviceId !== 'auto-sms-whatsapp');

      // Build complete config with smart field values
      const completeConfig = {
        ...config,
        whatsappApiProvider: whatsappApiProvider.value,
        n8nWorkflow: {
          ...config.n8nWorkflow,
          instanceUrl: n8nInstanceUrl.value,
          errorHandling: {
            ...config.n8nWorkflow.errorHandling,
            alertEmail: alertEmail.value
          }
        }
      };

      updated.push({
        serviceId: 'auto-sms-whatsapp',
        serviceName: 'SMS/WhatsApp אוטומטי ללידים',
        serviceNameHe: 'SMS/WhatsApp אוטומטי ללידים',
        requirements: completeConfig,
        completedAt: new Date().toISOString()
      });

      updateMeeting({
        implementationSpec: {
          ...currentMeeting.implementationSpec,
          automations: updated,
        },
      });

      alert('✅ הגדרות נשמרו בהצלחה!');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper: Add event to webhook
  const addWebhookEvent = () => {
    setConfig({
      ...config,
      metaBusinessAccess: {
        ...config.metaBusinessAccess!,
        webhookSetup: {
          ...config.metaBusinessAccess!.webhookSetup,
          eventsSubscribed: [...(config.metaBusinessAccess?.webhookSetup.eventsSubscribed || []), '']
        }
      }
    });
  };

  // Helper: Remove event from webhook
  const removeWebhookEvent = (index: number) => {
    const updated = config.metaBusinessAccess?.webhookSetup.eventsSubscribed?.filter((_, i) => i !== index) || [];
    setConfig({
      ...config,
      metaBusinessAccess: {
        ...config.metaBusinessAccess!,
        webhookSetup: {
          ...config.metaBusinessAccess!.webhookSetup,
          eventsSubscribed: updated
        }
      }
    });
  };

  // Helper: Update event in webhook
  const updateWebhookEvent = (index: number, value: string) => {
    const updated = [...(config.metaBusinessAccess?.webhookSetup.eventsSubscribed || [])];
    updated[index] = value;
    setConfig({
      ...config,
      metaBusinessAccess: {
        ...config.metaBusinessAccess!,
        webhookSetup: {
          ...config.metaBusinessAccess!.webhookSetup,
          eventsSubscribed: updated
        }
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #2: SMS/WhatsApp אוטומטיים">
        {/* Smart Fields Info Banner */}
        {(whatsappApiProvider.isAutoPopulated || n8nInstanceUrl.isAutoPopulated || alertEmail.isAutoPopulated) && (
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

        {/* Conflict Warnings */}
        {(whatsappApiProvider.hasConflict || n8nInstanceUrl.hasConflict || alertEmail.hasConflict) && (
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

        {/* Smart Fields Section */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Smart WhatsApp API Provider Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {whatsappApiProvider.metadata.label.he}
              </label>
              {whatsappApiProvider.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <select
              value={whatsappApiProvider.value || 'twilio'}
              onChange={(e) => whatsappApiProvider.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                whatsappApiProvider.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
              } ${whatsappApiProvider.hasConflict ? 'border-orange-300' : ''}`}
            >
              <option value="twilio">Twilio</option>
              <option value="messagebird">MessageBird</option>
              <option value="whatsapp_business">WhatsApp Business API</option>
              <option value="vonage">Vonage</option>
            </select>
            {whatsappApiProvider.isAutoPopulated && whatsappApiProvider.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {whatsappApiProvider.source.description}
              </p>
            )}
          </div>

          {/* Smart n8n Instance URL Field */}
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
              className={`w-full px-3 py-2 border rounded-md ${
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

          {/* Smart Alert Email Field */}
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
              className={`w-full px-3 py-2 border rounded-md ${
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

        {/* Info Alert */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">שירות משלוח הודעות אוטומטיות SMS/WhatsApp ללידים</p>
            <p>יש למלא את כל הפרטים הטכניים הנדרשים להקמת השירות. השלמת כל השדות תבטיח תהליך אימות ואישור מהיר יותר.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('meta')}
            className={`px-4 py-2 whitespace-nowrap transition-colors ${
              activeTab === 'meta'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            WhatsApp Business API
          </button>
          <button
            onClick={() => setActiveTab('twilio')}
            className={`px-4 py-2 whitespace-nowrap transition-colors ${
              activeTab === 'twilio'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Twilio
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 whitespace-nowrap transition-colors ${
              activeTab === 'templates'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            תבניות הודעות
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 whitespace-nowrap transition-colors ${
              activeTab === 'crm'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            אינטגרציית CRM
          </button>
          <button
            onClick={() => setActiveTab('n8n')}
            className={`px-4 py-2 whitespace-nowrap transition-colors ${
              activeTab === 'n8n'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            n8n Workflow
          </button>
          <button
            onClick={() => setActiveTab('prerequisites')}
            className={`px-4 py-2 whitespace-nowrap transition-colors ${
              activeTab === 'prerequisites'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            דרישות מקדימות
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Meta Business API Tab */}
          {activeTab === 'meta' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                הגדרות WhatsApp Business API
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מזהה חשבון עסקי (Business Account ID)
                </label>
                <input
                  type="text"
                  value={config.metaBusinessAccess?.businessAccountId || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessAccess: {
                      ...config.metaBusinessAccess!,
                      businessAccountId: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: 123456789012345"
                />
                <p className="text-xs text-gray-500 mt-1">מזהה החשבון העסקי ב-Meta Business Suite</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סטטוס אימות עסקי
                </label>
                <select
                  value={config.metaBusinessAccess?.businessVerificationStatus}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessAccess: {
                      ...config.metaBusinessAccess!,
                      businessVerificationStatus: e.target.value as 'pending' | 'verified' | 'rejected'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">ממתין לאימות</option>
                  <option value="verified">מאומת</option>
                  <option value="rejected">נדחה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  משך זמן לאימות
                </label>
                <input
                  type="text"
                  value={config.metaBusinessAccess?.verificationDuration || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessAccess: {
                      ...config.metaBusinessAccess!,
                      verificationDuration: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: 3-7 days"
                />
                <p className="text-xs text-gray-500 mt-1">זמן משוער לקבלת אימות מ-Meta</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מזהה מספר טלפון (Phone Number ID)
                </label>
                <input
                  type="text"
                  value={config.metaBusinessAccess?.phoneNumberId || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessAccess: {
                      ...config.metaBusinessAccess!,
                      phoneNumberId: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: 987654321098765"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מספר טלפון (פורמט בינלאומי)
                </label>
                <input
                  type="text"
                  value={config.metaBusinessAccess?.phoneNumber || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessAccess: {
                      ...config.metaBusinessAccess!,
                      phoneNumber: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: +972501234567"
                />
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ המספר חייב להיות ייעודי - אסור שהוא משמש באפליקציית WhatsApp רגילה
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מזהה WABA (WhatsApp Business Account ID)
                </label>
                <input
                  type="text"
                  value={config.metaBusinessAccess?.wabaId || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessAccess: {
                      ...config.metaBusinessAccess!,
                      wabaId: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: 123456789012345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token (System User Token)
                </label>
                <input
                  type="password"
                  value={config.metaBusinessAccess?.accessToken || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    metaBusinessAccess: {
                      ...config.metaBusinessAccess!,
                      accessToken: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="System User Token (קבוע, לא 24 שעות)"
                />
                <p className="text-xs text-gray-500 mt-1">טוקן משתמש מערכת קבוע (Permanent Token)</p>
              </div>

              {/* Webhook Setup Section */}
              <div className="border-t pt-4 mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">הגדרות Webhook</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Token
                    </label>
                    <input
                      type="text"
                      value={config.metaBusinessAccess?.webhookSetup.verificationToken || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        metaBusinessAccess: {
                          ...config.metaBusinessAccess!,
                          webhookSetup: {
                            ...config.metaBusinessAccess!.webhookSetup,
                            verificationToken: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="טוקן אימות להגדרת Webhook"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Callback URL (חייב HTTPS)
                    </label>
                    <input
                      type="url"
                      value={config.metaBusinessAccess?.webhookSetup.callbackUrl || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        metaBusinessAccess: {
                          ...config.metaBusinessAccess!,
                          webhookSetup: {
                            ...config.metaBusinessAccess!.webhookSetup,
                            callbackUrl: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/webhook"
                    />
                    <p className="text-xs text-red-600 mt-1">⚠️ חובה להשתמש ב-HTTPS</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      אירועים נרשמים (Events Subscribed)
                    </label>
                    <div className="space-y-2">
                      {config.metaBusinessAccess?.webhookSetup.eventsSubscribed?.map((event, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={event}
                            onChange={(e) => updateWebhookEvent(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="לדוגמה: messages, message_status"
                          />
                          <button
                            onClick={() => removeWebhookEvent(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addWebhookEvent}
                        className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>הוסף אירוע</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      אירועים נפוצים: messages, message_status, messaging_postbacks
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Twilio Tab */}
          {activeTab === 'twilio' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                הגדרות Twilio (אלטרנטיבה/נוסף)
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account SID
                </label>
                <input
                  type="text"
                  value={config.twilioAccess?.accountSid || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    twilioAccess: {
                      ...config.twilioAccess!,
                      accountSid: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auth Token
                </label>
                <input
                  type="password"
                  value={config.twilioAccess?.authToken || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    twilioAccess: {
                      ...config.twilioAccess!,
                      authToken: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="טוקן אימות Twilio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מספר טלפון Twilio
                </label>
                <input
                  type="text"
                  value={config.twilioAccess?.phoneNumber || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    twilioAccess: {
                      ...config.twilioAccess!,
                      phoneNumber: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: +15551234567"
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.twilioAccess?.whatsappSandbox || false}
                    onChange={(e) => setConfig({
                      ...config,
                      twilioAccess: {
                        ...config.twilioAccess!,
                        whatsappSandbox: e.target.checked
                      }
                    })}
                    className="ml-2"
                  />
                  <span className="text-sm">WhatsApp Sandbox (לבדיקות)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.twilioAccess?.smsEnabled || false}
                    onChange={(e) => setConfig({
                      ...config,
                      twilioAccess: {
                        ...config.twilioAccess!,
                        smsEnabled: e.target.checked
                      }
                    })}
                    className="ml-2"
                  />
                  <span className="text-sm">SMS מופעל</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.twilioAccess?.whatsappEnabled || false}
                    onChange={(e) => setConfig({
                      ...config,
                      twilioAccess: {
                        ...config.twilioAccess!,
                        whatsappEnabled: e.target.checked
                      }
                    })}
                    className="ml-2"
                  />
                  <span className="text-sm">WhatsApp מופעל</span>
                </label>
              </div>

              {/* Rate Limits */}
              <div className="border-t pt-4 mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">מגבלות שליחה</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMS לשעה
                    </label>
                    <input
                      type="number"
                      value={config.twilioAccess?.rateLimits.smsPerHour || 0}
                      onChange={(e) => setConfig({
                        ...config,
                        twilioAccess: {
                          ...config.twilioAccess!,
                          rateLimits: {
                            ...config.twilioAccess!.rateLimits,
                            smsPerHour: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp ליום
                    </label>
                    <input
                      type="number"
                      value={config.twilioAccess?.rateLimits.whatsappPerDay || 0}
                      onChange={(e) => setConfig({
                        ...config,
                        twilioAccess: {
                          ...config.twilioAccess!,
                          rateLimits: {
                            ...config.twilioAccess!.rateLimits,
                            whatsappPerDay: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4 mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">תמחור</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      עלות SMS להודעה ($)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={config.twilioAccess?.pricing.smsPerMessage || 0}
                      onChange={(e) => setConfig({
                        ...config,
                        twilioAccess: {
                          ...config.twilioAccess!,
                          pricing: {
                            ...config.twilioAccess!.pricing,
                            smsPerMessage: parseFloat(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      עלות WhatsApp להודעה ($)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={config.twilioAccess?.pricing.whatsappPerMessage || 0}
                      onChange={(e) => setConfig({
                        ...config,
                        twilioAccess: {
                          ...config.twilioAccess!,
                          pricing: {
                            ...config.twilioAccess!.pricing,
                            whatsappPerMessage: parseFloat(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ניהול תבניות הודעות
              </h3>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.messageTemplates.templatesCreated}
                    onChange={(e) => setConfig({
                      ...config,
                      messageTemplates: {
                        ...config.messageTemplates,
                        templatesCreated: e.target.checked
                      }
                    })}
                    className="ml-2"
                  />
                  <span className="text-sm font-medium">תבניות נוצרו</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סטטוס אישור תבניות
                </label>
                <select
                  value={config.messageTemplates.templateApprovalStatus}
                  onChange={(e) => setConfig({
                    ...config,
                    messageTemplates: {
                      ...config.messageTemplates,
                      templateApprovalStatus: e.target.value as 'pending' | 'approved' | 'rejected'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">ממתין לאישור</option>
                  <option value="approved">מאושר</option>
                  <option value="rejected">נדחה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  זמן אישור משוער
                </label>
                <input
                  type="text"
                  value={config.messageTemplates.approvalTimeline}
                  onChange={(e) => setConfig({
                    ...config,
                    messageTemplates: {
                      ...config.messageTemplates,
                      approvalTimeline: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: 24-72 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  אחוז דחייה היסטורי (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.messageTemplates.rejectionRate || 0}
                  onChange={(e) => setConfig({
                    ...config,
                    messageTemplates: {
                      ...config.messageTemplates,
                      rejectionRate: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>

              {/* Template Guidelines */}
              <div className="border-t pt-4 mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">הנחיות לתבניות</h4>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.messageTemplates.templateGuidelines.noLinks}
                      onChange={(e) => setConfig({
                        ...config,
                        messageTemplates: {
                          ...config.messageTemplates,
                          templateGuidelines: {
                            ...config.messageTemplates.templateGuidelines,
                            noLinks: e.target.checked
                          }
                        }
                      })}
                      className="ml-2"
                    />
                    <span className="text-sm">אין לינקים (לינקים עלולים לגרום לדחייה)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.messageTemplates.templateGuidelines.noPricing}
                      onChange={(e) => setConfig({
                        ...config,
                        messageTemplates: {
                          ...config.messageTemplates,
                          templateGuidelines: {
                            ...config.messageTemplates.templateGuidelines,
                            noPricing: e.target.checked
                          }
                        }
                      })}
                      className="ml-2"
                    />
                    <span className="text-sm">אין מחירים (מחירים עלולים לגרום לדחייה)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מגבלת משתנים
                    </label>
                    <input
                      type="number"
                      value={config.messageTemplates.templateGuidelines.variablesLimit}
                      onChange={(e) => setConfig({
                        ...config,
                        messageTemplates: {
                          ...config.messageTemplates,
                          templateGuidelines: {
                            ...config.messageTemplates.templateGuidelines,
                            variablesLimit: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">מספר משתנים מקסימלי בתבנית</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מגבלת תווים
                    </label>
                    <input
                      type="number"
                      value={config.messageTemplates.templateGuidelines.characterLimit}
                      onChange={(e) => setConfig({
                        ...config,
                        messageTemplates: {
                          ...config.messageTemplates,
                          templateGuidelines: {
                            ...config.messageTemplates.templateGuidelines,
                            characterLimit: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">אורך מקסימלי לתבנית</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CRM Integration Tab */}
          {activeTab === 'crm' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                אינטגרציית CRM
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מערכת CRM
                </label>
                <input
                  type="text"
                  value={config.crmAccess.system}
                  onChange={(e) => setConfig({
                    ...config,
                    crmAccess: {
                      ...config.crmAccess,
                      system: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: Zoho, Salesforce, HubSpot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שיטת אימות
                </label>
                <select
                  value={config.crmAccess.authMethod}
                  onChange={(e) => setConfig({
                    ...config,
                    crmAccess: {
                      ...config.crmAccess,
                      authMethod: e.target.value as 'oauth' | 'api_key' | 'basic_auth'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="oauth">OAuth 2.0</option>
                  <option value="api_key">API Key</option>
                  <option value="basic_auth">Basic Authentication</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שם שדה מספר טלפון ב-CRM
                </label>
                <input
                  type="text"
                  value={config.crmAccess.phoneNumberField}
                  onChange={(e) => setConfig({
                    ...config,
                    crmAccess: {
                      ...config.crmAccess,
                      phoneNumberField: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: Mobile, Phone, Contact_Number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  פורמט מספר טלפון
                </label>
                <select
                  value={config.crmAccess.phoneNumberFormat}
                  onChange={(e) => setConfig({
                    ...config,
                    crmAccess: {
                      ...config.crmAccess,
                      phoneNumberFormat: e.target.value as 'international'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="international">בינלאומי (+972501234567)</option>
                </select>
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ פורמט בינלאומי נדרש לשימוש ב-WhatsApp Business API
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שדה Opt-In (אופציונלי)
                </label>
                <input
                  type="text"
                  value={config.crmAccess.optInField || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    crmAccess: {
                      ...config.crmAccess,
                      optInField: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="לדוגמה: WhatsApp_Opt_In, SMS_Permission"
                />
                <p className="text-xs text-gray-500 mt-1">שדה המציין הסכמה לקבלת הודעות</p>
              </div>

              {/* CRM Credentials */}
              <div className="border-t pt-4 mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">פרטי אימות</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={config.crmAccess.credentials.clientId || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        crmAccess: {
                          ...config.crmAccess,
                          credentials: {
                            ...config.crmAccess.credentials,
                            clientId: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Client ID (עבור OAuth)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={config.crmAccess.credentials.clientSecret || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        crmAccess: {
                          ...config.crmAccess,
                          credentials: {
                            ...config.crmAccess.credentials,
                            clientSecret: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Client Secret (עבור OAuth)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refresh Token
                    </label>
                    <input
                      type="password"
                      value={config.crmAccess.credentials.refreshToken || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        crmAccess: {
                          ...config.crmAccess,
                          credentials: {
                            ...config.crmAccess.credentials,
                            refreshToken: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Refresh Token (עבור OAuth)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={config.crmAccess.credentials.apiKey || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        crmAccess: {
                          ...config.crmAccess,
                          credentials: {
                            ...config.crmAccess.credentials,
                            apiKey: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="API Key (עבור שיטת API Key)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* n8n Workflow Tab */}
          {activeTab === 'n8n' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                הגדרות n8n Workflow
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  כתובת Instance של n8n
                </label>
                <input
                  type="url"
                  value={config.n8nWorkflow.instanceUrl}
                  onChange={(e) => setConfig({
                    ...config,
                    n8nWorkflow: {
                      ...config.n8nWorkflow,
                      instanceUrl: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://n8n.example.com"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://n8n.example.com/webhook/..."
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <label className="flex items-center">
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
                    className="ml-2"
                  />
                  <span className="text-sm">HTTPS מופעל</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.n8nWorkflow.whatsappIntegration}
                    onChange={(e) => setConfig({
                      ...config,
                      n8nWorkflow: {
                        ...config.n8nWorkflow,
                        whatsappIntegration: e.target.checked
                      }
                    })}
                    className="ml-2"
                  />
                  <span className="text-sm">אינטגרציית WhatsApp (n8n node)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.n8nWorkflow.twilioIntegration}
                    onChange={(e) => setConfig({
                      ...config,
                      n8nWorkflow: {
                        ...config.n8nWorkflow,
                        twilioIntegration: e.target.checked
                      }
                    })}
                    className="ml-2"
                  />
                  <span className="text-sm">אינטגרציית Twilio (n8n node)</span>
                </label>
              </div>

              {/* Error Handling */}
              <div className="border-t pt-4 mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">טיפול בשגיאות</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר ניסיונות חוזרים
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
                            retryAttempts: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      אימייל להתראות שגיאה
                    </label>
                    <input
                      type="email"
                      value={config.n8nWorkflow.errorHandling.alertEmail}
                      onChange={(e) => setConfig({
                        ...config,
                        n8nWorkflow: {
                          ...config.n8nWorkflow,
                          errorHandling: {
                            ...config.n8nWorkflow.errorHandling,
                            alertEmail: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="alerts@example.com"
                    />
                  </div>

                  <label className="flex items-center">
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
                      className="ml-2"
                    />
                    <span className="text-sm">רישום שגיאות ב-Log</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Prerequisites Tab */}
          {activeTab === 'prerequisites' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                דרישות מקדימות
              </h3>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-900">
                  <strong>חשוב:</strong> יש לעמוד בכל הדרישות המקדימות לפני תחילת ההטמעה
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.prerequisites.dedicatedPhoneNumber}
                    onChange={(e) => setConfig({
                      ...config,
                      prerequisites: {
                        ...config.prerequisites,
                        dedicatedPhoneNumber: e.target.checked
                      }
                    })}
                    className="ml-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">מספר טלפון ייעודי</span>
                    <p className="text-xs text-gray-600 mt-1">
                      מספר שלא משמש באפליקציית WhatsApp רגילה או ב-SIM אחר
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.prerequisites.businessVerification}
                    onChange={(e) => setConfig({
                      ...config,
                      prerequisites: {
                        ...config.prerequisites,
                        businessVerification: e.target.checked
                      }
                    })}
                    className="ml-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">אימות עסקי (Business Verification)</span>
                    <p className="text-xs text-gray-600 mt-1">
                      העסק עבר אימות ב-Meta Business Manager
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.prerequisites.metaBusinessAccount}
                    onChange={(e) => setConfig({
                      ...config,
                      prerequisites: {
                        ...config.prerequisites,
                        metaBusinessAccount: e.target.checked
                      }
                    })}
                    className="ml-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">חשבון Meta Business</span>
                    <p className="text-xs text-gray-600 mt-1">
                      קיים חשבון Meta Business עם הרשאות מתאימות
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.prerequisites.messageTemplatesReady}
                    onChange={(e) => setConfig({
                      ...config,
                      prerequisites: {
                        ...config.prerequisites,
                        messageTemplatesReady: e.target.checked
                      }
                    })}
                    className="ml-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">תבניות הודעות מוכנות</span>
                    <p className="text-xs text-gray-600 mt-1">
                      תבניות ההודעות נוצרו וקיבלו אישור מ-WhatsApp/Meta
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.prerequisites.optInMechanismReady}
                    onChange={(e) => setConfig({
                      ...config,
                      prerequisites: {
                        ...config.prerequisites,
                        optInMechanismReady: e.target.checked
                      }
                    })}
                    className="ml-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">מנגנון Opt-In מוכן</span>
                    <p className="text-xs text-gray-600 mt-1">
                      קיים מנגנון לקבלת הסכמה מפורשת לקבלת הודעות
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.prerequisites.internationalPhoneFormat}
                    onChange={(e) => setConfig({
                      ...config,
                      prerequisites: {
                        ...config.prerequisites,
                        internationalPhoneFormat: e.target.checked
                      }
                    })}
                    className="ml-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">פורמט בינלאומי למספרי טלפון</span>
                    <p className="text-xs text-gray-600 mt-1">
                      כל מספרי הטלפון ב-CRM בפורמט בינלאומי (+972501234567)
                    </p>
                  </div>
                </label>
              </div>

              {/* Prerequisites Summary */}
              <div className="border-t pt-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">סטטוס דרישות מקדימות</h4>
                  <div className="space-y-1 text-sm">
                    {Object.values(config.prerequisites).filter(Boolean).length === 6 ? (
                      <p className="text-green-700 font-medium">✓ כל הדרישות מולאו - מוכן להתחלת הטמעה</p>
                    ) : (
                      <p className="text-orange-700">
                        {Object.values(config.prerequisites).filter(Boolean).length} מתוך 6 דרישות הושלמו
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t mt-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'שומר...' : 'שמור הגדרות'}</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
