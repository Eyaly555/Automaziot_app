import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoCRMUpdateRequirements, AutomationServiceEntry } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Trash2, Save, Info, AlertCircle } from 'lucide-react';

const CRM_SYSTEMS = [
  { value: 'zoho', label: 'Zoho CRM' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'other', label: 'אחר' }
];

const AUTH_METHODS = [
  { value: 'oauth', label: 'OAuth 2.0' },
  { value: 'api_key', label: 'API Key' },
  { value: 'basic_auth', label: 'Basic Auth' }
];

const FORM_PLATFORMS = [
  { value: 'wix', label: 'Wix Forms' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'elementor', label: 'Elementor Forms' },
  { value: 'google_forms', label: 'Google Forms' },
  { value: 'typeform', label: 'Typeform' },
  { value: 'jotform', label: 'JotForm' },
  { value: 'custom', label: 'Custom / Other' }
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'textarea', label: 'Textarea' }
];

const API_INTEGRATION_METHODS = [
  { value: 'rest_api', label: 'REST API' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'polling', label: 'Polling' }
];

const DUPLICATE_STRATEGIES = [
  { value: 'update_existing', label: 'עדכן רשומה קיימת' },
  { value: 'skip', label: 'דלג על כפילות' },
  { value: 'create_new', label: 'צור רשומה חדשה בכל מקרה' },
  { value: 'alert', label: 'התרעה בלבד' }
];

export function AutoCRMUpdateSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AutoCRMUpdateRequirements>({
    crmAccess: {
      system: 'zoho',
      authMethod: 'oauth',
      rateLimits: {
        daily: 0,
        batchSupported: false
      },
      targetModule: '',
      customFieldsAvailable: false,
      customFields: []
    },
    formPlatformAccess: {
      platform: '',
      webhookSupport: false,
      formFields: []
    },
    n8nWorkflow: {
      instanceUrl: '',
      webhookEndpoint: '',
      httpsEnabled: false,
      errorHandling: {
        retryAttempts: 3,
        retryDelay: 1000,
        alertEmail: '',
        logErrors: true
      }
    },
    fieldMappingDocument: {
      mappings: [],
      lastUpdated: new Date()
    },
    duplicateDetection: {
      enabled: false,
      strategy: '',
      checkFields: []
    }
  });

  const [activeTab, setActiveTab] = useState<'crm' | 'form' | 'mapping' | 'workflow' | 'duplicates'>('crm');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: AutomationServiceEntry) => a.serviceId === 'auto-crm-update');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = async () => {
    if (!currentMeeting) return;

    setIsSaving(true);
    try {
      const automations = currentMeeting?.implementationSpec?.automations || [];
      const updated = automations.filter((a: AutomationServiceEntry) => a.serviceId !== 'auto-crm-update');

      updated.push({
        serviceId: 'auto-crm-update',
        serviceName: 'עדכון אוטומטי ל-CRM',
        requirements: config,
        completedAt: new Date().toISOString()
      });

      await updateMeeting({
        implementationSpec: {
          ...currentMeeting.implementationSpec,
          automations: updated,
        },
      });

      alert('הגדרות נשמרו בהצלחה!');
    } catch (error) {
      console.error('Error saving auto-crm-update:', error);
      alert('שגיאה בשמירת הגדרות');
    } finally {
      setIsSaving(false);
    }
  };

  const addCustomField = () => {
    setConfig({
      ...config,
      crmAccess: {
        ...config.crmAccess,
        customFields: [
          ...config.crmAccess.customFields,
          {
            apiName: '',
            label: '',
            type: '',
            required: false
          }
        ]
      }
    });
  };

  const removeCustomField = (index: number) => {
    setConfig({
      ...config,
      crmAccess: {
        ...config.crmAccess,
        customFields: config.crmAccess.customFields.filter((_, i) => i !== index)
      }
    });
  };

  const addFormField = () => {
    setConfig({
      ...config,
      formPlatformAccess: {
        ...config.formPlatformAccess,
        formFields: [
          ...config.formPlatformAccess.formFields,
          {
            fieldName: '',
            fieldLabel: '',
            fieldType: '',
            required: false
          }
        ]
      }
    });
  };

  const removeFormField = (index: number) => {
    setConfig({
      ...config,
      formPlatformAccess: {
        ...config.formPlatformAccess,
        formFields: config.formPlatformAccess.formFields.filter((_, i) => i !== index)
      }
    });
  };

  const addFieldMapping = () => {
    setConfig({
      ...config,
      fieldMappingDocument: {
        mappings: [
          ...(config.fieldMappingDocument?.mappings || []),
          {
            formField: '',
            crmField: '',
            transformation: '',
            notes: ''
          }
        ],
        lastUpdated: new Date()
      }
    });
  };

  const removeFieldMapping = (index: number) => {
    setConfig({
      ...config,
      fieldMappingDocument: {
        mappings: (config.fieldMappingDocument?.mappings || []).filter((_, i) => i !== index),
        lastUpdated: new Date()
      }
    });
  };

  const addCheckField = () => {
    setConfig({
      ...config,
      duplicateDetection: {
        enabled: config.duplicateDetection?.enabled || false,
        strategy: config.duplicateDetection?.strategy || '',
        checkFields: [...(config.duplicateDetection?.checkFields || []), '']
      }
    });
  };

  const removeCheckField = (index: number) => {
    setConfig({
      ...config,
      duplicateDetection: {
        enabled: config.duplicateDetection?.enabled || false,
        strategy: config.duplicateDetection?.strategy || '',
        checkFields: (config.duplicateDetection?.checkFields || []).filter((_, i) => i !== index)
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
                עדכון אוטומטי ל-CRM
              </h1>
              <p className="text-gray-600">
                Auto CRM Update - Service #3
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'שומר...' : 'שמור'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              {[
                { id: 'crm', label: 'הגדרות CRM' },
                { id: 'form', label: 'פלטפורמת טופס' },
                { id: 'mapping', label: 'מיפוי שדות' },
                { id: 'workflow', label: 'n8n Workflow' },
                { id: 'duplicates', label: 'מניעת כפילויות' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 border-b-2 transition-colors ${
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
            {/* CRM Access Tab */}
            {activeTab === 'crm' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">מערכת CRM</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        מערכת CRM
                      </label>
                      <select
                        value={config.crmAccess.system}
                        onChange={(e) => setConfig({
                          ...config,
                          crmAccess: {
                            ...config.crmAccess,
                            system: e.target.value as any
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {CRM_SYSTEMS.map(sys => (
                          <option key={sys.value} value={sys.value}>{sys.label}</option>
                        ))}
                      </select>
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
                            authMethod: e.target.value as any
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {AUTH_METHODS.map(method => (
                          <option key={method.value} value={method.value}>{method.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Zoho Credentials */}
                {config.crmAccess.system === 'zoho' && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Zoho OAuth Credentials</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client ID
                          </label>
                          <input
                            type="text"
                            value={config.crmAccess.zohoCredentials?.clientId || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              crmAccess: {
                                ...config.crmAccess,
                                zohoCredentials: {
                                  ...config.crmAccess.zohoCredentials!,
                                  clientId: e.target.value,
                                  clientSecret: config.crmAccess.zohoCredentials?.clientSecret || '',
                                  refreshToken: config.crmAccess.zohoCredentials?.refreshToken || '',
                                  apiDomain: config.crmAccess.zohoCredentials?.apiDomain || '',
                                  tokenExpiry: config.crmAccess.zohoCredentials?.tokenExpiry || ''
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="1000.XXXXXXXXX"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client Secret
                          </label>
                          <input
                            type="password"
                            value={config.crmAccess.zohoCredentials?.clientSecret || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              crmAccess: {
                                ...config.crmAccess,
                                zohoCredentials: {
                                  ...config.crmAccess.zohoCredentials!,
                                  clientId: config.crmAccess.zohoCredentials?.clientId || '',
                                  clientSecret: e.target.value,
                                  refreshToken: config.crmAccess.zohoCredentials?.refreshToken || '',
                                  apiDomain: config.crmAccess.zohoCredentials?.apiDomain || '',
                                  tokenExpiry: config.crmAccess.zohoCredentials?.tokenExpiry || ''
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Refresh Token
                          </label>
                          <input
                            type="password"
                            value={config.crmAccess.zohoCredentials?.refreshToken || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              crmAccess: {
                                ...config.crmAccess,
                                zohoCredentials: {
                                  ...config.crmAccess.zohoCredentials!,
                                  clientId: config.crmAccess.zohoCredentials?.clientId || '',
                                  clientSecret: config.crmAccess.zohoCredentials?.clientSecret || '',
                                  refreshToken: e.target.value,
                                  apiDomain: config.crmAccess.zohoCredentials?.apiDomain || '',
                                  tokenExpiry: config.crmAccess.zohoCredentials?.tokenExpiry || ''
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Domain
                          </label>
                          <input
                            type="text"
                            value={config.crmAccess.zohoCredentials?.apiDomain || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              crmAccess: {
                                ...config.crmAccess,
                                zohoCredentials: {
                                  ...config.crmAccess.zohoCredentials!,
                                  clientId: config.crmAccess.zohoCredentials?.clientId || '',
                                  clientSecret: config.crmAccess.zohoCredentials?.clientSecret || '',
                                  refreshToken: config.crmAccess.zohoCredentials?.refreshToken || '',
                                  apiDomain: e.target.value,
                                  tokenExpiry: config.crmAccess.zohoCredentials?.tokenExpiry || ''
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="https://www.zohoapis.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Token Expiry
                        </label>
                        <select
                          value={config.crmAccess.zohoCredentials?.tokenExpiry || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            crmAccess: {
                              ...config.crmAccess,
                              zohoCredentials: {
                                ...config.crmAccess.zohoCredentials!,
                                clientId: config.crmAccess.zohoCredentials?.clientId || '',
                                clientSecret: config.crmAccess.zohoCredentials?.clientSecret || '',
                                refreshToken: config.crmAccess.zohoCredentials?.refreshToken || '',
                                apiDomain: config.crmAccess.zohoCredentials?.apiDomain || '',
                                tokenExpiry: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">בחר...</option>
                          <option value="3 months">3 חודשים</option>
                          <option value="permanent (Self Client)">Permanent (Self Client)</option>
                        </select>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-yellow-900 mb-1">שימו לב - Zoho CRM</h4>
                            <p className="text-sm text-yellow-700">
                              Refresh Token נדרש לחידוש כל 3 חודשים (אלא אם כן משתמשים ב-Self Client).
                              יש לוודא שיש תהליך לחידוש אוטומטי או תזכורת ידנית.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Salesforce Credentials */}
                {config.crmAccess.system === 'salesforce' && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Salesforce Credentials</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Consumer Key
                          </label>
                          <input
                            type="text"
                            value={config.crmAccess.salesforceCredentials?.consumerKey || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              crmAccess: {
                                ...config.crmAccess,
                                salesforceCredentials: {
                                  ...config.crmAccess.salesforceCredentials!,
                                  consumerKey: e.target.value,
                                  consumerSecret: config.crmAccess.salesforceCredentials?.consumerSecret || '',
                                  username: config.crmAccess.salesforceCredentials?.username || '',
                                  password: config.crmAccess.salesforceCredentials?.password || '',
                                  securityToken: config.crmAccess.salesforceCredentials?.securityToken || ''
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Consumer Secret
                          </label>
                          <input
                            type="password"
                            value={config.crmAccess.salesforceCredentials?.consumerSecret || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              crmAccess: {
                                ...config.crmAccess,
                                salesforceCredentials: {
                                  ...config.crmAccess.salesforceCredentials!,
                                  consumerKey: config.crmAccess.salesforceCredentials?.consumerKey || '',
                                  consumerSecret: e.target.value,
                                  username: config.crmAccess.salesforceCredentials?.username || '',
                                  password: config.crmAccess.salesforceCredentials?.password || '',
                                  securityToken: config.crmAccess.salesforceCredentials?.securityToken || ''
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={config.crmAccess.salesforceCredentials?.username || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              crmAccess: {
                                ...config.crmAccess,
                                salesforceCredentials: {
                                  ...config.crmAccess.salesforceCredentials!,
                                  consumerKey: config.crmAccess.salesforceCredentials?.consumerKey || '',
                                  consumerSecret: config.crmAccess.salesforceCredentials?.consumerSecret || '',
                                  username: e.target.value,
                                  password: config.crmAccess.salesforceCredentials?.password || '',
                                  securityToken: config.crmAccess.salesforceCredentials?.securityToken || ''
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            value={config.crmAccess.salesforceCredentials?.password || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              crmAccess: {
                                ...config.crmAccess,
                                salesforceCredentials: {
                                  ...config.crmAccess.salesforceCredentials!,
                                  consumerKey: config.crmAccess.salesforceCredentials?.consumerKey || '',
                                  consumerSecret: config.crmAccess.salesforceCredentials?.consumerSecret || '',
                                  username: config.crmAccess.salesforceCredentials?.username || '',
                                  password: e.target.value,
                                  securityToken: config.crmAccess.salesforceCredentials?.securityToken || ''
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Security Token
                          </label>
                          <input
                            type="password"
                            value={config.crmAccess.salesforceCredentials?.securityToken || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              crmAccess: {
                                ...config.crmAccess,
                                salesforceCredentials: {
                                  ...config.crmAccess.salesforceCredentials!,
                                  consumerKey: config.crmAccess.salesforceCredentials?.consumerKey || '',
                                  consumerSecret: config.crmAccess.salesforceCredentials?.consumerSecret || '',
                                  username: config.crmAccess.salesforceCredentials?.username || '',
                                  password: config.crmAccess.salesforceCredentials?.password || '',
                                  securityToken: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">שימו לב - Salesforce</h4>
                            <p className="text-sm text-blue-700">
                              Salesforce מגביל API calls בהתאם לגרסה (15,000-100,000 ליום).
                              במקרה של טפסים רבים, מומלץ להפעיל Batch Updates.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* HubSpot Credentials */}
                {config.crmAccess.system === 'hubspot' && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">HubSpot Credentials</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key (אופציונלי)
                        </label>
                        <input
                          type="password"
                          value={config.crmAccess.hubspotCredentials?.apiKey || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            crmAccess: {
                              ...config.crmAccess,
                              hubspotCredentials: {
                                ...config.crmAccess.hubspotCredentials,
                                apiKey: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Private App Token (אופציונלי)
                        </label>
                        <input
                          type="password"
                          value={config.crmAccess.hubspotCredentials?.privateAppToken || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            crmAccess: {
                              ...config.crmAccess,
                              hubspotCredentials: {
                                ...config.crmAccess.hubspotCredentials,
                                privateAppToken: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <p className="text-sm text-gray-600">
                        * ניתן להשתמש ב-API Key או ב-Private App Token (לא חובה שניהם)
                      </p>
                    </div>
                  </Card>
                )}

                {/* Rate Limits */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Rate Limits</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Limit
                      </label>
                      <input
                        type="number"
                        value={config.crmAccess.rateLimits.daily}
                        onChange={(e) => setConfig({
                          ...config,
                          crmAccess: {
                            ...config.crmAccess,
                            rateLimits: {
                              ...config.crmAccess.rateLimits,
                              daily: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="5000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Concurrent (אופציונלי)
                      </label>
                      <input
                        type="number"
                        value={config.crmAccess.rateLimits.concurrent || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          crmAccess: {
                            ...config.crmAccess,
                            rateLimits: {
                              ...config.crmAccess.rateLimits,
                              concurrent: parseInt(e.target.value) || undefined
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="10"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.crmAccess.rateLimits.batchSupported}
                          onChange={(e) => setConfig({
                            ...config,
                            crmAccess: {
                              ...config.crmAccess,
                              rateLimits: {
                                ...config.crmAccess.rateLimits,
                                batchSupported: e.target.checked
                              }
                            }
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Batch Supported
                        </span>
                      </label>
                    </div>
                  </div>
                </Card>

                {/* Target Module & Custom Fields */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Module & Custom Fields</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Module
                      </label>
                      <input
                        type="text"
                        value={config.crmAccess.targetModule}
                        onChange={(e) => setConfig({
                          ...config,
                          crmAccess: {
                            ...config.crmAccess,
                            targetModule: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Leads / Contacts / Deals"
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.crmAccess.customFieldsAvailable}
                        onChange={(e) => setConfig({
                          ...config,
                          crmAccess: {
                            ...config.crmAccess,
                            customFieldsAvailable: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        שדות מותאמים אישית זמינים
                      </span>
                    </label>

                    {config.crmAccess.customFieldsAvailable && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">שדות מותאמים אישית</h4>
                          <button
                            onClick={addCustomField}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                          >
                            <Plus className="w-3 h-3" />
                            הוסף שדה
                          </button>
                        </div>

                        {config.crmAccess.customFields.map((field, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                            <div className="grid grid-cols-4 gap-3 mb-2">
                              <input
                                type="text"
                                value={field.apiName}
                                onChange={(e) => {
                                  const updated = [...config.crmAccess.customFields];
                                  updated[index].apiName = e.target.value;
                                  setConfig({
                                    ...config,
                                    crmAccess: {
                                      ...config.crmAccess,
                                      customFields: updated
                                    }
                                  });
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="API Name"
                              />
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => {
                                  const updated = [...config.crmAccess.customFields];
                                  updated[index].label = e.target.value;
                                  setConfig({
                                    ...config,
                                    crmAccess: {
                                      ...config.crmAccess,
                                      customFields: updated
                                    }
                                  });
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Label"
                              />
                              <input
                                type="text"
                                value={field.type}
                                onChange={(e) => {
                                  const updated = [...config.crmAccess.customFields];
                                  updated[index].type = e.target.value;
                                  setConfig({
                                    ...config,
                                    crmAccess: {
                                      ...config.crmAccess,
                                      customFields: updated
                                    }
                                  });
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Type"
                              />
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => {
                                    const updated = [...config.crmAccess.customFields];
                                    updated[index].required = e.target.checked;
                                    setConfig({
                                      ...config,
                                      crmAccess: {
                                        ...config.crmAccess,
                                        customFields: updated
                                      }
                                    });
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-xs">חובה</span>
                              </label>
                            </div>
                            <button
                              onClick={() => removeCustomField(index)}
                              className="text-red-600 text-xs hover:text-red-700"
                            >
                              הסר שדה
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Form Platform Tab */}
            {activeTab === 'form' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">פלטפורמת טופס</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform
                      </label>
                      <select
                        value={config.formPlatformAccess.platform}
                        onChange={(e) => setConfig({
                          ...config,
                          formPlatformAccess: {
                            ...config.formPlatformAccess,
                            platform: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">בחר פלטפורמה...</option>
                        {FORM_PLATFORMS.map(platform => (
                          <option key={platform.value} value={platform.value}>{platform.label}</option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.formPlatformAccess.webhookSupport}
                        onChange={(e) => setConfig({
                          ...config,
                          formPlatformAccess: {
                            ...config.formPlatformAccess,
                            webhookSupport: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        תמיכה ב-Webhook
                      </span>
                    </label>

                    {config.formPlatformAccess.webhookSupport && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={config.formPlatformAccess.webhookUrl || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            formPlatformAccess: {
                              ...config.formPlatformAccess,
                              webhookUrl: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">API Integration (אופציונלי)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Method
                      </label>
                      <select
                        value={config.formPlatformAccess.apiIntegration?.method || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          formPlatformAccess: {
                            ...config.formPlatformAccess,
                            apiIntegration: {
                              ...config.formPlatformAccess.apiIntegration!,
                              method: e.target.value as any
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">בחר...</option>
                        {API_INTEGRATION_METHODS.map(method => (
                          <option key={method.value} value={method.value}>{method.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={config.formPlatformAccess.apiIntegration?.apiKey || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          formPlatformAccess: {
                            ...config.formPlatformAccess,
                            apiIntegration: {
                              ...config.formPlatformAccess.apiIntegration!,
                              apiKey: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endpoint
                      </label>
                      <input
                        type="url"
                        value={config.formPlatformAccess.apiIntegration?.endpoint || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          formPlatformAccess: {
                            ...config.formPlatformAccess,
                            apiIntegration: {
                              ...config.formPlatformAccess.apiIntegration!,
                              endpoint: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">שדות טופס</h3>
                    <button
                      onClick={addFormField}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <Plus className="w-3 h-3" />
                      הוסף שדה
                    </button>
                  </div>

                  {config.formPlatformAccess.formFields.map((field, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                      <div className="grid grid-cols-4 gap-3 mb-2">
                        <input
                          type="text"
                          value={field.fieldName}
                          onChange={(e) => {
                            const updated = [...config.formPlatformAccess.formFields];
                            updated[index].fieldName = e.target.value;
                            setConfig({
                              ...config,
                              formPlatformAccess: {
                                ...config.formPlatformAccess,
                                formFields: updated
                              }
                            });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Field Name"
                        />
                        <input
                          type="text"
                          value={field.fieldLabel}
                          onChange={(e) => {
                            const updated = [...config.formPlatformAccess.formFields];
                            updated[index].fieldLabel = e.target.value;
                            setConfig({
                              ...config,
                              formPlatformAccess: {
                                ...config.formPlatformAccess,
                                formFields: updated
                              }
                            });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Label"
                        />
                        <select
                          value={field.fieldType}
                          onChange={(e) => {
                            const updated = [...config.formPlatformAccess.formFields];
                            updated[index].fieldType = e.target.value;
                            setConfig({
                              ...config,
                              formPlatformAccess: {
                                ...config.formPlatformAccess,
                                formFields: updated
                              }
                            });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="">Type...</option>
                          {FIELD_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              const updated = [...config.formPlatformAccess.formFields];
                              updated[index].required = e.target.checked;
                              setConfig({
                                ...config,
                                formPlatformAccess: {
                                  ...config.formPlatformAccess,
                                  formFields: updated
                                }
                              });
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-xs">חובה</span>
                        </label>
                      </div>
                      <button
                        onClick={() => removeFormField(index)}
                        className="text-red-600 text-xs hover:text-red-700"
                      >
                        הסר שדה
                      </button>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {/* Field Mapping Tab */}
            {activeTab === 'mapping' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">מיפוי שדות</h3>
                    <button
                      onClick={addFieldMapping}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <Plus className="w-3 h-3" />
                      הוסף מיפוי
                    </button>
                  </div>

                  {(config.fieldMappingDocument?.mappings || []).map((mapping, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            שדה בטופס
                          </label>
                          <input
                            type="text"
                            value={mapping.formField}
                            onChange={(e) => {
                              const updated = [...(config.fieldMappingDocument?.mappings || [])];
                              updated[index].formField = e.target.value;
                              setConfig({
                                ...config,
                                fieldMappingDocument: {
                                  mappings: updated,
                                  lastUpdated: new Date()
                                }
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="email"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            שדה ב-CRM
                          </label>
                          <input
                            type="text"
                            value={mapping.crmField}
                            onChange={(e) => {
                              const updated = [...(config.fieldMappingDocument?.mappings || [])];
                              updated[index].crmField = e.target.value;
                              setConfig({
                                ...config,
                                fieldMappingDocument: {
                                  mappings: updated,
                                  lastUpdated: new Date()
                                }
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Email"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Transformation (אופציונלי)
                          </label>
                          <input
                            type="text"
                            value={mapping.transformation || ''}
                            onChange={(e) => {
                              const updated = [...(config.fieldMappingDocument?.mappings || [])];
                              updated[index].transformation = e.target.value;
                              setConfig({
                                ...config,
                                fieldMappingDocument: {
                                  mappings: updated,
                                  lastUpdated: new Date()
                                }
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="uppercase, trim, etc."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            הערות (אופציונלי)
                          </label>
                          <input
                            type="text"
                            value={mapping.notes || ''}
                            onChange={(e) => {
                              const updated = [...(config.fieldMappingDocument?.mappings || [])];
                              updated[index].notes = e.target.value;
                              setConfig({
                                ...config,
                                fieldMappingDocument: {
                                  mappings: updated,
                                  lastUpdated: new Date()
                                }
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="הערות..."
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => removeFieldMapping(index)}
                        className="text-red-600 text-xs hover:text-red-700"
                      >
                        הסר מיפוי
                      </button>
                    </div>
                  ))}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">טיפ חשוב</h4>
                        <p className="text-sm text-blue-700">
                          וודא שכל השדות ב-CRM כבר קיימים ונגישים ב-API. שדה לא תקין יכול לגרום לכל ה-sync ליפול.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    עודכן לאחרונה: {config.fieldMappingDocument?.lastUpdated ? new Date(config.fieldMappingDocument.lastUpdated).toLocaleString('he-IL') : 'לא עודכן'}
                  </div>
                </Card>
              </div>
            )}

            {/* n8n Workflow Tab */}
            {activeTab === 'workflow' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">n8n Instance</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instance URL
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://n8n.example.com/webhook/crm-update"
                      />
                    </div>

                    <label className="flex items-center gap-2">
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
                      <span className="text-sm font-medium text-gray-700">
                        HTTPS מופעל
                      </span>
                    </label>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Error Handling</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Retry Attempts
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          max="10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Retry Delay (ms)
                        </label>
                        <input
                          type="number"
                          value={config.n8nWorkflow.errorHandling.retryDelay}
                          onChange={(e) => setConfig({
                            ...config,
                            n8nWorkflow: {
                              ...config.n8nWorkflow,
                              errorHandling: {
                                ...config.n8nWorkflow.errorHandling,
                                retryDelay: parseInt(e.target.value) || 1000
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="100"
                          step="100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alert Email
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="admin@example.com"
                      />
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
                      <span className="text-sm font-medium text-gray-700">
                        רשום שגיאות ב-Log
                      </span>
                    </label>
                  </div>
                </Card>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">דברים חשובים לזכור</h4>
                      <ul className="text-sm text-yellow-700 space-y-1 list-disc mr-5">
                        <li>מה קורה אם ה-CRM down? (צריך fallback mechanism)</li>
                        <li>מה קורה אם הגענו ל-API rate limit? (צריך queuing או batch)</li>
                        <li>איך אפשר לדעת אם טופס נכשל? (צריך monitoring ו-alerts)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Duplicate Detection Tab */}
            {activeTab === 'duplicates' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">מניעת כפילויות</h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.duplicateDetection?.enabled || false}
                        onChange={(e) => setConfig({
                          ...config,
                          duplicateDetection: {
                            enabled: e.target.checked,
                            strategy: config.duplicateDetection?.strategy || '',
                            checkFields: config.duplicateDetection?.checkFields || []
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">הפעל זיהוי כפילויות</span>
                    </label>
                  </div>

                  {config.duplicateDetection?.enabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          אסטרטגיה
                        </label>
                        <select
                          value={config.duplicateDetection.strategy}
                          onChange={(e) => setConfig({
                            ...config,
                            duplicateDetection: {
                              enabled: config.duplicateDetection?.enabled || false,
                              strategy: e.target.value,
                              checkFields: config.duplicateDetection?.checkFields || []
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">בחר אסטרטגיה...</option>
                          {DUPLICATE_STRATEGIES.map(strategy => (
                            <option key={strategy.value} value={strategy.value}>{strategy.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            שדות לבדיקה
                          </label>
                          <button
                            onClick={addCheckField}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                          >
                            <Plus className="w-3 h-3" />
                            הוסף שדה
                          </button>
                        </div>

                        {(config.duplicateDetection.checkFields || []).map((field, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={field}
                              onChange={(e) => {
                                const updated = [...(config.duplicateDetection?.checkFields || [])];
                                updated[index] = e.target.value;
                                setConfig({
                                  ...config,
                                  duplicateDetection: {
                                    enabled: config.duplicateDetection?.enabled || false,
                                    strategy: config.duplicateDetection?.strategy || '',
                                    checkFields: updated
                                  }
                                });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="email, phone, etc."
                            />
                            <button
                              onClick={() => removeCheckField(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900 mb-1">אזהרה קריטית</h4>
                        <p className="text-sm text-red-700">
                          Data validation הוא קריטי! שדה לא תקין יכול לגרום לכל ה-sync ליפול.
                          וודא שכל השדות תואמים בדיוק לשדות ב-CRM (שם API, לא label).
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Save Button at Bottom */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'שומר...' : 'שמור והמשך'}
          </button>
        </div>
      </div>
    </div>
  );
}
