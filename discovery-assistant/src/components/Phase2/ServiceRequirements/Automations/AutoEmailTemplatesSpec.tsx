import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useSmartField } from '../../../../hooks/useSmartField';
import type { AutoEmailTemplatesRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { Plus, Save, Mail, Settings, Code, TestTube, Palette, AlertCircle, CheckCircle, Info } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 11);

export function AutoEmailTemplatesSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const emailProvider = useSmartField<string>({
    fieldId: 'email_provider',
    localPath: 'emailProvider',
    serviceId: 'auto-email-templates',
    autoSave: false
  });

  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'auto-email-templates',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'auto-email-templates',
    autoSave: false
  });

  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nInstanceUrl',
    serviceId: 'auto-email-templates',
    autoSave: false
  });

  const [config, setConfig] = useState<AutoEmailTemplatesRequirements>({
    emailServiceAccess: {
      provider: 'sendgrid',
      domainVerification: {
        domain: '',
        spfRecord: '',
        dkimRecord: '',
        dmarcRecord: '',
        verified: false
      }
    },
    templateEngine: {
      engine: 'handlebars',
      version: '',
      syntaxSupport: {
        variables: true,
        conditionals: true,
        loops: true,
        partials: true
      }
    },
    crmAccess: {
      system: 'zoho',
      authMethod: 'oauth',
      credentials: {},
      fieldsAvailable: []
    },
    n8nWorkflow: {
      instanceUrl: '',
      webhookEndpoint: '',
      httpsEnabled: true,
      templateRendering: {
        engine: 'handlebars',
        renderNode: true
      },
      errorHandling: {
        retryAttempts: 3,
        alertEmail: '',
        logErrors: true
      }
    }
  });

  const [activeTab, setActiveTab] = useState<'service' | 'domain' | 'template' | 'crm' | 'workflow' | 'design' | 'testing'>('service');

  // Auto-save hook for immediate saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'auto-email-templates',
    immediateFields: ['emailServiceAccess'], // Critical identifier
    debounceMs: 1500, // Longer debounce for complex forms
    onError: (error) => {
      console.error('Auto-save error in AutoEmailTemplatesSpec:', error);
    }
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((item: any) => item.serviceId === 'auto-email-templates');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Auto-save when config or smart field values change
  useEffect(() => {
    if (config.emailServiceAccess?.provider) { // Only save if we have basic data
      const automations = currentMeeting?.implementationSpec?.automations || [];
      const updated = automations.filter((item: any) => item.serviceId !== 'auto-email-templates');

      // Build complete config with smart field values
      const completeConfig = {
        ...config,
        emailServiceAccess: {
          ...config.emailServiceAccess,
          provider: emailProvider.value
        },
        crmAccess: {
          ...config.crmAccess,
          system: crmSystem.value
        },
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
        serviceId: 'auto-email-templates',
        serviceName: 'ניהול תבניות Email אוטומטיות',
        serviceNameHe: 'ניהול תבניות Email אוטומטיות',
        requirements: completeConfig,
        completedAt: new Date().toISOString()
      });

      saveData({
        implementationSpec: {
          ...currentMeeting?.implementationSpec,
          automations: updated,
        },
      });
    }
  }, [config, emailProvider.value, crmSystem.value, n8nInstanceUrl.value, alertEmail.value, saveData, currentMeeting]);

  // Manual save handler (kept for compatibility, but auto-save is primary)
  const handleManualSave = async () => {
    // Force immediate save
    await saveData({
      implementationSpec: {
        ...currentMeeting?.implementationSpec,
        automations: [
          ...(currentMeeting?.implementationSpec?.automations || []).filter((item: any) => item.serviceId !== 'auto-email-templates'),
          {
            serviceId: 'auto-email-templates',
            serviceName: 'ניהול תבניות Email אוטומטיות',
            serviceNameHe: 'ניהול תבניות Email אוטומטיות',
            requirements: {
              ...config,
              emailServiceAccess: {
                ...config.emailServiceAccess,
                provider: emailProvider.value
              },
              crmAccess: {
                ...config.crmAccess,
                system: crmSystem.value
              },
              n8nWorkflow: {
                ...config.n8nWorkflow,
                instanceUrl: n8nInstanceUrl.value,
                errorHandling: {
                  ...config.n8nWorkflow.errorHandling,
                  alertEmail: alertEmail.value
                }
              }
            },
            completedAt: new Date().toISOString()
          }
        ],
      },
    }, 'manual');
  };

  const addCrmField = () => {
    setConfig({
      ...config,
      crmAccess: {
        ...config.crmAccess,
        fieldsAvailable: [
          ...config.crmAccess.fieldsAvailable,
          {
            apiName: '',
            label: '',
            type: ''
          }
        ]
      }
    });
  };

  const removeCrmField = (index: number) => {
    setConfig({
      ...config,
      crmAccess: {
        ...config.crmAccess,
        fieldsAvailable: config.crmAccess.fieldsAvailable.filter((_, i) => i !== index)
      }
    });
  };

  const addDesignTemplate = () => {
    if (!config.designTools) {
      setConfig({
        ...config,
        designTools: {
          tool: 'stripo',
          templates: []
        }
      });
    }

    setConfig({
      ...config,
      designTools: {
        ...config.designTools!,
        templates: [
          ...(config.designTools?.templates || []),
          {
            id: generateId(),
            name: '',
            category: ''
          }
        ]
      }
    });
  };

  const removeDesignTemplate = (index: number) => {
    if (!config.designTools) return;

    setConfig({
      ...config,
      designTools: {
        ...config.designTools,
        templates: config.designTools.templates?.filter((_, i) => i !== index)
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
                שירות #20: ניהול תבניות Email אוטומטיות
              </h1>
              <p className="text-gray-600">
                Auto Email Templates - Service #20
              </p>
            </div>

            {/* Smart Fields Info Banner */}
            {(emailProvider.isAutoPopulated || crmSystem.isAutoPopulated || alertEmail.isAutoPopulated || n8nInstanceUrl.isAutoPopulated) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
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
            {(emailProvider.hasConflict || crmSystem.hasConflict || alertEmail.hasConflict || n8nInstanceUrl.hasConflict) && (
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
              {!isSaving && !saveError && config.emailServiceAccess?.provider && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">נשמר אוטומטית</span>
                </div>
              )}
              <button
                onClick={handleManualSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 text-sm"
              >
                <Save className="w-4 h-4" />
                שמור ידנית
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-2 px-6 overflow-x-auto">
              {[
                { id: 'service', label: 'שירות Email', icon: Mail },
                { id: 'domain', label: 'אימות דומיין', icon: Settings },
                { id: 'template', label: 'Template Engine', icon: Code },
                { id: 'crm', label: 'גישה ל-CRM', icon: Settings },
                { id: 'workflow', label: 'n8n Workflow', icon: Settings },
                { id: 'design', label: 'כלי עיצוב', icon: Palette },
                { id: 'testing', label: 'כלי בדיקה', icon: TestTube }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab 1: Email Service Provider */}
            {activeTab === 'service' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">ספק שירות Email</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {emailProvider.metadata.label.he}
                        </label>
                        {emailProvider.isAutoPopulated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            מולא אוטומטית
                          </span>
                        )}
                      </div>
                      <select
                        value={emailProvider.value || 'sendgrid'}
                        onChange={(e) => emailProvider.setValue(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          emailProvider.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                        } ${emailProvider.hasConflict ? 'border-orange-300' : ''}`}
                      >
                        <option value="sendgrid">SendGrid</option>
                        <option value="mailgun">Mailgun</option>
                        <option value="smtp">SMTP</option>
                        <option value="gmail">Gmail API</option>
                        <option value="outlook">Outlook/Office 365</option>
                        <option value="amazon_ses">Amazon SES</option>
                      </select>
                    </div>

                    {/* SendGrid Credentials */}
                    {config.emailServiceAccess.provider === 'sendgrid' && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium">הגדרות SendGrid</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={config.emailServiceAccess.sendgridCredentials?.apiKey || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              emailServiceAccess: {
                                ...config.emailServiceAccess,
                                sendgridCredentials: {
                                  apiKey: e.target.value,
                                  rateLimits: config.emailServiceAccess.sendgridCredentials?.rateLimits || {
                                    free: { daily: 100 },
                                    paid: { daily: 40000 }
                                  }
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="SG.xxxxxxxxxxxxx"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              מגבלה יומית (Free)
                            </label>
                            <input
                              type="number"
                              value={config.emailServiceAccess.sendgridCredentials?.rateLimits.free.daily || 100}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              disabled
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              מגבלה יומית (Paid)
                            </label>
                            <input
                              type="number"
                              value={config.emailServiceAccess.sendgridCredentials?.rateLimits.paid.daily || 40000}
                              onChange={(e) => setConfig({
                                ...config,
                                emailServiceAccess: {
                                  ...config.emailServiceAccess,
                                  sendgridCredentials: {
                                    ...config.emailServiceAccess.sendgridCredentials!,
                                    rateLimits: {
                                      ...config.emailServiceAccess.sendgridCredentials!.rateLimits,
                                      paid: { daily: parseInt(e.target.value) || 40000 }
                                    }
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mailgun Credentials */}
                    {config.emailServiceAccess.provider === 'mailgun' && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium">הגדרות Mailgun</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={config.emailServiceAccess.mailgunCredentials?.apiKey || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              emailServiceAccess: {
                                ...config.emailServiceAccess,
                                mailgunCredentials: {
                                  ...config.emailServiceAccess.mailgunCredentials!,
                                  apiKey: e.target.value,
                                  domain: config.emailServiceAccess.mailgunCredentials?.domain || '',
                                  region: config.emailServiceAccess.mailgunCredentials?.region || 'us',
                                  rateLimits: config.emailServiceAccess.mailgunCredentials?.rateLimits || {
                                    free: { monthly: 5000 },
                                    paid: { monthly: 50000 }
                                  }
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Domain
                          </label>
                          <input
                            type="text"
                            value={config.emailServiceAccess.mailgunCredentials?.domain || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              emailServiceAccess: {
                                ...config.emailServiceAccess,
                                mailgunCredentials: {
                                  ...config.emailServiceAccess.mailgunCredentials!,
                                  domain: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="mg.example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Region
                          </label>
                          <select
                            value={config.emailServiceAccess.mailgunCredentials?.region || 'us'}
                            onChange={(e) => setConfig({
                              ...config,
                              emailServiceAccess: {
                                ...config.emailServiceAccess,
                                mailgunCredentials: {
                                  ...config.emailServiceAccess.mailgunCredentials!,
                                  region: e.target.value as 'us' | 'eu'
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="us">US</option>
                            <option value="eu">EU</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              מגבלה חודשית (Free)
                            </label>
                            <input
                              type="number"
                              value={config.emailServiceAccess.mailgunCredentials?.rateLimits.free.monthly || 5000}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              disabled
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              מגבלה חודשית (Paid)
                            </label>
                            <input
                              type="number"
                              value={config.emailServiceAccess.mailgunCredentials?.rateLimits.paid.monthly || 50000}
                              onChange={(e) => setConfig({
                                ...config,
                                emailServiceAccess: {
                                  ...config.emailServiceAccess,
                                  mailgunCredentials: {
                                    ...config.emailServiceAccess.mailgunCredentials!,
                                    rateLimits: {
                                      ...config.emailServiceAccess.mailgunCredentials!.rateLimits,
                                      paid: { monthly: parseInt(e.target.value) || 50000 }
                                    }
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SMTP Credentials */}
                    {config.emailServiceAccess.provider === 'smtp' && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium">הגדרות SMTP</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Host
                            </label>
                            <input
                              type="text"
                              value={config.emailServiceAccess.smtpCredentials?.host || ''}
                              onChange={(e) => setConfig({
                                ...config,
                                emailServiceAccess: {
                                  ...config.emailServiceAccess,
                                  smtpCredentials: {
                                    ...config.emailServiceAccess.smtpCredentials!,
                                    host: e.target.value,
                                    port: config.emailServiceAccess.smtpCredentials?.port || 587,
                                    username: config.emailServiceAccess.smtpCredentials?.username || '',
                                    password: config.emailServiceAccess.smtpCredentials?.password || '',
                                    secure: config.emailServiceAccess.smtpCredentials?.secure || true
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="smtp.gmail.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Port
                            </label>
                            <input
                              type="number"
                              value={config.emailServiceAccess.smtpCredentials?.port || 587}
                              onChange={(e) => setConfig({
                                ...config,
                                emailServiceAccess: {
                                  ...config.emailServiceAccess,
                                  smtpCredentials: {
                                    ...config.emailServiceAccess.smtpCredentials!,
                                    port: parseInt(e.target.value) || 587
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
                              value={config.emailServiceAccess.smtpCredentials?.username || ''}
                              onChange={(e) => setConfig({
                                ...config,
                                emailServiceAccess: {
                                  ...config.emailServiceAccess,
                                  smtpCredentials: {
                                    ...config.emailServiceAccess.smtpCredentials!,
                                    username: e.target.value
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
                              value={config.emailServiceAccess.smtpCredentials?.password || ''}
                              onChange={(e) => setConfig({
                                ...config,
                                emailServiceAccess: {
                                  ...config.emailServiceAccess,
                                  smtpCredentials: {
                                    ...config.emailServiceAccess.smtpCredentials!,
                                    password: e.target.value
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.emailServiceAccess.smtpCredentials?.secure || true}
                            onChange={(e) => setConfig({
                              ...config,
                              emailServiceAccess: {
                                ...config.emailServiceAccess,
                                smtpCredentials: {
                                  ...config.emailServiceAccess.smtpCredentials!,
                                  secure: e.target.checked
                                }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Secure (TLS/SSL)</span>
                        </label>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Tab 2: Domain Verification */}
            {activeTab === 'domain' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">אימות דומיין</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domain
                      </label>
                      <input
                        type="text"
                        value={config.emailServiceAccess.domainVerification.domain}
                        onChange={(e) => setConfig({
                          ...config,
                          emailServiceAccess: {
                            ...config.emailServiceAccess,
                            domainVerification: {
                              ...config.emailServiceAccess.domainVerification,
                              domain: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SPF Record
                      </label>
                      <textarea
                        value={config.emailServiceAccess.domainVerification.spfRecord}
                        onChange={(e) => setConfig({
                          ...config,
                          emailServiceAccess: {
                            ...config.emailServiceAccess,
                            domainVerification: {
                              ...config.emailServiceAccess.domainVerification,
                              spfRecord: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        rows={2}
                        placeholder="v=spf1 include:sendgrid.net ~all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        DKIM Record
                      </label>
                      <textarea
                        value={config.emailServiceAccess.domainVerification.dkimRecord}
                        onChange={(e) => setConfig({
                          ...config,
                          emailServiceAccess: {
                            ...config.emailServiceAccess,
                            domainVerification: {
                              ...config.emailServiceAccess.domainVerification,
                              dkimRecord: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        rows={3}
                        placeholder="v=DKIM1; k=rsa; p=..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        DMARC Record
                      </label>
                      <textarea
                        value={config.emailServiceAccess.domainVerification.dmarcRecord}
                        onChange={(e) => setConfig({
                          ...config,
                          emailServiceAccess: {
                            ...config.emailServiceAccess,
                            domainVerification: {
                              ...config.emailServiceAccess.domainVerification,
                              dmarcRecord: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        rows={2}
                        placeholder="v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">סטטוס אימות</h4>
                        <p className="text-sm text-gray-600">
                          {config.emailServiceAccess.domainVerification.verified ? 'דומיין מאומת' : 'דומיין לא מאומת'}
                        </p>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.emailServiceAccess.domainVerification.verified}
                          onChange={(e) => setConfig({
                            ...config,
                            emailServiceAccess: {
                              ...config.emailServiceAccess,
                              domainVerification: {
                                ...config.emailServiceAccess.domainVerification,
                                verified: e.target.checked,
                                verificationDate: e.target.checked ? new Date() : undefined
                              }
                            }
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium">מאומת</span>
                      </label>
                    </div>

                    {config.emailServiceAccess.domainVerification.verificationDate && (
                      <div className="text-sm text-gray-600">
                        תאריך אימות: {new Date(config.emailServiceAccess.domainVerification.verificationDate).toLocaleDateString('he-IL')}
                      </div>
                    )}
                  </div>
                </Card>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">Email Deliverability - קריטי!</h4>
                      <p className="text-sm text-red-700 mb-2">
                        ללא אימות דומיין תקין (SPF/DKIM/DMARC), האימיילים שלך יגיעו לספאם!
                      </p>
                      <ul className="text-sm text-red-700 space-y-1 list-disc mr-5">
                        <li>SPF - מאשר שרק השרתים המורשים יכולים לשלוח מהדומיין</li>
                        <li>DKIM - חתימה קריפטוגרפית שמוכיחה שהאימייל לא שונה</li>
                        <li>DMARC - מגדיר מה לעשות עם אימיילים שנכשלו באימות</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Template Engine */}
            {activeTab === 'template' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Template Engine</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        בחר Engine
                      </label>
                      <select
                        value={config.templateEngine.engine}
                        onChange={(e) => setConfig({
                          ...config,
                          templateEngine: {
                            ...config.templateEngine,
                            engine: e.target.value as any
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="handlebars">Handlebars ({"{{variable}}"})</option>
                        <option value="liquid">Liquid ({"{{ variable }}"})</option>
                        <option value="mustache">Mustache ({"{{variable}}"})</option>
                        <option value="ejs">EJS ({"<%= variable %>"})</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        גרסה
                      </label>
                      <input
                        type="text"
                        value={config.templateEngine.version}
                        onChange={(e) => setConfig({
                          ...config,
                          templateEngine: {
                            ...config.templateEngine,
                            version: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="4.7.7"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">תמיכה ב-Syntax</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.templateEngine.syntaxSupport.variables}
                            onChange={(e) => setConfig({
                              ...config,
                              templateEngine: {
                                ...config.templateEngine,
                                syntaxSupport: {
                                  ...config.templateEngine.syntaxSupport,
                                  variables: e.target.checked
                                }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Variables ({"{{firstName}}"})</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.templateEngine.syntaxSupport.conditionals}
                            onChange={(e) => setConfig({
                              ...config,
                              templateEngine: {
                                ...config.templateEngine,
                                syntaxSupport: {
                                  ...config.templateEngine.syntaxSupport,
                                  conditionals: e.target.checked
                                }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Conditionals ({"{{#if}}...{{/if}}"})</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.templateEngine.syntaxSupport.loops}
                            onChange={(e) => setConfig({
                              ...config,
                              templateEngine: {
                                ...config.templateEngine,
                                syntaxSupport: {
                                  ...config.templateEngine.syntaxSupport,
                                  loops: e.target.checked
                                }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Loops ({"{{#each}}...{{/each}}"})</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.templateEngine.syntaxSupport.partials}
                            onChange={(e) => setConfig({
                              ...config,
                              templateEngine: {
                                ...config.templateEngine,
                                syntaxSupport: {
                                  ...config.templateEngine.syntaxSupport,
                                  partials: e.target.checked
                                }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Partials ({"{{> header}}"})</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Code className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Template Engine - דוגמאות</h4>
                      <div className="text-sm text-blue-700 space-y-2">
                        <div>
                          <strong>Handlebars:</strong> {`שלום {{firstName}}, {{#if premium}}אתה לקוח VIP{{/if}}`}
                        </div>
                        <div>
                          <strong>Liquid:</strong> {`שלום {{ firstName }}, {% if premium %}אתה לקוח VIP{% endif %}`}
                        </div>
                        <div>
                          <strong>EJS:</strong> {`שלום <%= firstName %>, <% if (premium) { %>אתה לקוח VIP<% } %>`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: CRM Access */}
            {activeTab === 'crm' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">גישה ל-CRM</h3>
                  <div className="space-y-4">
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
                        <option value="zoho">Zoho CRM</option>
                        <option value="salesforce">Salesforce</option>
                        <option value="hubspot">HubSpot</option>
                        <option value="pipedrive">Pipedrive</option>
                        <option value="other">אחר</option>
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
                        <option value="oauth">OAuth</option>
                        <option value="api_key">API Key</option>
                        <option value="basic_auth">Basic Auth</option>
                      </select>
                    </div>

                    {config.crmAccess.authMethod === 'oauth' && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h4 className="font-medium">OAuth Credentials</h4>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    {config.crmAccess.authMethod === 'api_key' && (
                      <div className="bg-gray-50 p-4 rounded-lg">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">שדות זמינים מ-CRM</h3>
                    <button
                      onClick={addCrmField}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3" />
                      הוסף שדה
                    </button>
                  </div>

                  {config.crmAccess.fieldsAvailable.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-600 mb-3">אין שדות זמינים</p>
                      <button
                        onClick={addCrmField}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        הוסף שדה ראשון
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {config.crmAccess.fieldsAvailable.map((field, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="grid grid-cols-3 gap-3 mb-2">
                            <input
                              type="text"
                              value={field.apiName}
                              onChange={(e) => {
                                const updated = [...config.crmAccess.fieldsAvailable];
                                updated[index].apiName = e.target.value;
                                setConfig({
                                  ...config,
                                  crmAccess: {
                                    ...config.crmAccess,
                                    fieldsAvailable: updated
                                  }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="API Name (First_Name)"
                            />
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => {
                                const updated = [...config.crmAccess.fieldsAvailable];
                                updated[index].label = e.target.value;
                                setConfig({
                                  ...config,
                                  crmAccess: {
                                    ...config.crmAccess,
                                    fieldsAvailable: updated
                                  }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="תווית (שם פרטי)"
                            />
                            <input
                              type="text"
                              value={field.type}
                              onChange={(e) => {
                                const updated = [...config.crmAccess.fieldsAvailable];
                                updated[index].type = e.target.value;
                                setConfig({
                                  ...config,
                                  crmAccess: {
                                    ...config.crmAccess,
                                    fieldsAvailable: updated
                                  }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Type (string)"
                            />
                          </div>
                          <button
                            onClick={() => removeCrmField(index)}
                            className="text-red-600 text-xs hover:text-red-700"
                          >
                            הסר שדה
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Tab 5: n8n Workflow */}
            {activeTab === 'workflow' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">n8n Workflow</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        כתובת Instance
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
                        placeholder="https://n8n.example.com/webhook/email-templates"
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
                      <span className="text-sm font-medium">HTTPS Enabled</span>
                    </label>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Template Rendering</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Engine
                      </label>
                      <input
                        type="text"
                        value={config.n8nWorkflow.templateRendering.engine}
                        onChange={(e) => setConfig({
                          ...config,
                          n8nWorkflow: {
                            ...config.n8nWorkflow,
                            templateRendering: {
                              ...config.n8nWorkflow.templateRendering,
                              engine: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="handlebars"
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.n8nWorkflow.templateRendering.renderNode}
                        onChange={(e) => setConfig({
                          ...config,
                          n8nWorkflow: {
                            ...config.n8nWorkflow,
                            templateRendering: {
                              ...config.n8nWorkflow.templateRendering,
                              renderNode: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">Render ב-Node</span>
                    </label>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Error Handling</h3>
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
                              retryAttempts: parseInt(e.target.value) || 3
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
                        אימייל להתראות
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
                      <span className="text-sm font-medium">רשום שגיאות ב-Log</span>
                    </label>
                  </div>
                </Card>
              </div>
            )}

            {/* Tab 6: Design Tools (Optional) */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">כלי עיצוב (אופציונלי)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        כלי עיצוב
                      </label>
                      <select
                        value={config.designTools?.tool || 'stripo'}
                        onChange={(e) => setConfig({
                          ...config,
                          designTools: {
                            tool: e.target.value as any,
                            templates: config.designTools?.templates || []
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="stripo">Stripo.email</option>
                        <option value="beefree">BeeFree</option>
                        <option value="unlayer">Unlayer</option>
                        <option value="custom">Custom HTML</option>
                      </select>
                    </div>

                    {config.designTools && config.designTools.tool !== 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={config.designTools.apiKey || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            designTools: {
                              ...config.designTools!,
                              apiKey: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">תבניות עיצוב</h3>
                    <button
                      onClick={addDesignTemplate}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3" />
                      הוסף תבנית
                    </button>
                  </div>

                  {(!config.designTools?.templates || config.designTools.templates.length === 0) ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Palette className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-3">אין תבניות עיצוב</p>
                      <button
                        onClick={addDesignTemplate}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        הוסף תבנית ראשונה
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {config.designTools!.templates!.map((template, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="grid grid-cols-3 gap-3 mb-2">
                            <input
                              type="text"
                              value={template.id}
                              onChange={(e) => {
                                const updated = [...config.designTools!.templates!];
                                updated[index].id = e.target.value;
                                setConfig({
                                  ...config,
                                  designTools: {
                                    ...config.designTools!,
                                    templates: updated
                                  }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Template ID"
                            />
                            <input
                              type="text"
                              value={template.name}
                              onChange={(e) => {
                                const updated = [...config.designTools!.templates!];
                                updated[index].name = e.target.value;
                                setConfig({
                                  ...config,
                                  designTools: {
                                    ...config.designTools!,
                                    templates: updated
                                  }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="שם תבנית"
                            />
                            <input
                              type="text"
                              value={template.category}
                              onChange={(e) => {
                                const updated = [...config.designTools!.templates!];
                                updated[index].category = e.target.value;
                                setConfig({
                                  ...config,
                                  designTools: {
                                    ...config.designTools!,
                                    templates: updated
                                  }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="קטגוריה"
                            />
                          </div>
                          <button
                            onClick={() => removeDesignTemplate(index)}
                            className="text-red-600 text-xs hover:text-red-700"
                          >
                            הסר תבנית
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Tab 7: Testing Tools (Optional) */}
            {activeTab === 'testing' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">כלי בדיקה (אופציונלי)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        כלי בדיקה
                      </label>
                      <select
                        value={config.testingTools?.tool || 'litmus'}
                        onChange={(e) => setConfig({
                          ...config,
                          testingTools: {
                            tool: e.target.value as any
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="litmus">Litmus</option>
                        <option value="email_on_acid">Email on Acid</option>
                        <option value="mailtrap">Mailtrap</option>
                      </select>
                    </div>

                    {config.testingTools && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={config.testingTools.apiKey || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              testingTools: {
                                ...config.testingTools!,
                                apiKey: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            אימייל בדיקה
                          </label>
                          <input
                            type="email"
                            value={config.testingTools.testAccountEmail || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              testingTools: {
                                ...config.testingTools!,
                                testAccountEmail: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="test@example.com"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TestTube className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">למה צריך Email Testing?</h4>
                      <ul className="text-sm text-blue-700 space-y-1 list-disc mr-5">
                        <li>כל לקוח אימייל מציג HTML אחרת (Gmail, Outlook, Apple Mail)</li>
                        <li>60%+ פותחים במובייל - חובה לבדוק responsive</li>
                        <li>Litmus/Email on Acid מראים איך האימייל נראה ב-90+ clients</li>
                        <li>Spam Score - בודק אם האימייל יגיע לספאם</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Save Status and Manual Save at Bottom */}
        <div className="flex justify-between items-center gap-4">
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
            {!isSaving && !saveError && config.emailServiceAccess?.provider && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">נשמר אוטומטית</span>
              </div>
            )}
          </div>
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 text-sm"
          >
            <Save className="w-4 h-4" />
            שמור ידנית
          </button>
        </div>
      </div>
    </div>
  );
}
