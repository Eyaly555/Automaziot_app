/**
 * Auto Lead Response Requirements Specification Component
 *
 * Collects detailed technical requirements for automatic lead response service.
 * Part of Phase 2 Service Requirements Collection System.
 *
 * @component
 * @category Automations
 */

import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AutoLeadResponseRequirements } from '../../../../types/automationServices';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { extractBusinessContext } from '../../../../utils/fieldMapper';

/**
 * Auto Lead Response specification component for Phase 2 requirements collection
 */
/**
 * Enhanced Auto Lead Response Spec with Smart Field Pre-population
 * 
 * SMART FEATURES:
 * - Auto-fills CRM system, email provider, n8n instance from Phase 1/other services
 * - Shows business context from Phase 1 (lead volume, current response time)
 * - Validates against Phase 1 data
 * - Generates intelligent developer instructions
 */
export function AutoLeadResponseSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmAccess.system',
    serviceId: 'auto-lead-response',
    autoSave: false
  });

  const emailProvider = useSmartField<string>({
    fieldId: 'email_provider',
    localPath: 'emailServiceAccess.provider',
    serviceId: 'auto-lead-response',
    autoSave: false
  });

  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nWorkflow.instanceUrl',
    serviceId: 'auto-lead-response',
    autoSave: false
  });

  const n8nWebhookEndpoint = useSmartField<string>({
    fieldId: 'n8n_webhook_endpoint',
    localPath: 'n8nWorkflow.webhookEndpoint',
    serviceId: 'auto-lead-response',
    autoSave: false
  });

  // Get business context from Phase 1
  const businessContext = currentMeeting ? extractBusinessContext(currentMeeting) : {};

  // State initialization with proper typing
  const [config, setConfig] = useState<AutoLeadResponseRequirements>({
    formPlatformAccess: {
      platform: '',
      webhookCapability: false,
      apiKey: '',
      pluginRequired: false
    },
    emailServiceAccess: {
      provider: '',
      apiKey: '',
      domainVerified: false,
      rateLimits: {
        daily: 0,
        monthly: 0
      }
    },
    crmAccess: {
      system: '',
      authMethod: 'oauth',
      credentials: {},
      module: '',
      fieldsAvailable: []
    },
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data
  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.automations;
    const existing = Array.isArray(category)
      ? category.find(item => item.serviceId === 'auto-lead-response')
      : undefined;

    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.formPlatformAccess.platform) {
      newErrors.platform = 'יש לבחור פלטפורמת טפסים';
    }

    if (!config.emailServiceAccess.provider) {
      newErrors.emailProvider = 'יש לבחור ספק אימייל';
    }

    if (!config.crmAccess.system) {
      newErrors.crmSystem = 'יש לבחור מערכת CRM';
    }

    if (!config.n8nWorkflow.webhookEndpoint) {
      newErrors.webhookEndpoint = 'יש להזין webhook endpoint';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSave = async () => {
    if (!validateForm()) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    if (!currentMeeting) return;

    setIsSaving(true);
    try {
      const category = currentMeeting?.implementationSpec?.automations || [];
      const updated = category.filter((item: any) => item.serviceId !== 'auto-lead-response');

      // Build complete config with smart field values
      const completeConfig = {
        ...config,
        crmAccess: {
          ...config.crmAccess,
          system: crmSystem.value || config.crmAccess.system
        },
        emailServiceAccess: {
          ...config.emailServiceAccess,
          provider: emailProvider.value || config.emailServiceAccess.provider
        },
        n8nWorkflow: {
          ...config.n8nWorkflow,
          instanceUrl: n8nInstanceUrl.value || config.n8nWorkflow.instanceUrl,
          webhookEndpoint: n8nWebhookEndpoint.value || config.n8nWorkflow.webhookEndpoint
        }
      };

      updated.push({
        serviceId: 'auto-lead-response',
        serviceName: 'Auto Lead Response',
        serviceNameHe: 'מענה אוטומטי ללידים מטפסים',
        category: 'lead_management' as const,
        requirements: completeConfig,
        completedAt: new Date().toISOString()
      });

      await updateMeeting({
        implementationSpec: {
          ...currentMeeting.implementationSpec,
          automations: updated
        }
      });

      alert('✅ הגדרות נשמרו בהצלחה! השדות האוטומטיים ישמרו גם לשירותים אחרים.');
    } catch (error) {
      console.error('Error saving auto-lead-response config:', error);
      alert('שגיאה בשמירת הגדרות');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-8" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">שירות #1: מענה אוטומטי ללידים מטפסים</h2>
        <p className="text-gray-600 mt-2">הגדרת מענה אוטומטי ללידים שמגיעים מטפסים באתר</p>
        
        {/* Business Context Display */}
        {businessContext.monthlyLeadVolume && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📊 הקשר עסקי (מתוך שלב 1)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {businessContext.monthlyLeadVolume && (
                <div>
                  <span className="text-gray-600">נפח לידים:</span>
                  <div className="font-semibold text-blue-900">{businessContext.monthlyLeadVolume}/חודש</div>
                </div>
              )}
              {businessContext.currentResponseTime && (
                <div>
                  <span className="text-gray-600">זמן תגובה נוכחי:</span>
                  <div className="font-semibold text-blue-900">{businessContext.currentResponseTime}</div>
                </div>
              )}
              {businessContext.crmSystem && (
                <div>
                  <span className="text-gray-600">מערכת CRM:</span>
                  <div className="font-semibold text-blue-900">{businessContext.crmSystem}</div>
                </div>
              )}
              <div>
                <span className="text-gray-600">יעד:</span>
                <div className="font-semibold text-green-600">&lt; 5 דקות</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Smart Fields Info Banner */}
      {(crmSystem.isAutoPopulated || emailProvider.isAutoPopulated || n8nInstanceUrl.isAutoPopulated) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-1">✨ שדות מולאו אוטומטית</h4>
            <p className="text-sm text-green-800">
              חלק מהשדות מולאו באופן אוטומטי מנתונים שכבר נאספו בשלב 1 או בשירותים אחרים.
              זה חוסך זמן ומונע טעויות!
            </p>
          </div>
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          {/* Form Platform Access */}
          <div>
            <h3 className="text-lg font-semibold mb-4">גישה לפלטפורמת טפסים</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  פלטפורמה <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.formPlatformAccess.platform || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    formPlatformAccess: { ...config.formPlatformAccess, platform: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Wix, WordPress, Elementor, Google Forms, וכו'"
                />
                {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (אם קיים)
                </label>
                <input
                  type="text"
                  value={config.formPlatformAccess.apiKey || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    formPlatformAccess: { ...config.formPlatformAccess, apiKey: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="API Key"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.formPlatformAccess.webhookCapability || false}
                    onChange={(e) => setConfig({
                      ...config,
                      formPlatformAccess: { ...config.formPlatformAccess, webhookCapability: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">תמיכה ב-Webhooks</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.formPlatformAccess.pluginRequired || false}
                    onChange={(e) => setConfig({
                      ...config,
                      formPlatformAccess: { ...config.formPlatformAccess, pluginRequired: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">נדרש פלאגין</span>
                </label>
              </div>
            </div>
          </div>

          {/* Email Service Access */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">גישה לשירות אימייל</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {emailProvider.metadata.label.he} <span className="text-red-500">*</span>
                  </label>
                  {emailProvider.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטית
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={emailProvider.value || ''}
                  onChange={(e) => emailProvider.setValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    emailProvider.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="SendGrid, Mailgun, SMTP, Gmail, Outlook"
                />
                {emailProvider.isAutoPopulated && emailProvider.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    מקור: {emailProvider.source.description}
                  </p>
                )}
                {errors.emailProvider && <p className="text-red-500 text-sm mt-1">{errors.emailProvider}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={config.emailServiceAccess.apiKey || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    emailServiceAccess: { ...config.emailServiceAccess, apiKey: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="API Key"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מגבלה יומית
                  </label>
                  <input
                    type="number"
                    value={config.emailServiceAccess.rateLimits.daily || 0}
                    onChange={(e) => setConfig({
                      ...config,
                      emailServiceAccess: {
                        ...config.emailServiceAccess,
                        rateLimits: {
                          ...config.emailServiceAccess.rateLimits,
                          daily: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מגבלה חודשית
                  </label>
                  <input
                    type="number"
                    value={config.emailServiceAccess.rateLimits.monthly || 0}
                    onChange={(e) => setConfig({
                      ...config,
                      emailServiceAccess: {
                        ...config.emailServiceAccess,
                        rateLimits: {
                          ...config.emailServiceAccess.rateLimits,
                          monthly: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.emailServiceAccess.domainVerified || false}
                  onChange={(e) => setConfig({
                    ...config,
                    emailServiceAccess: { ...config.emailServiceAccess, domainVerified: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">דומיין מאומת</span>
              </label>
            </div>
          </div>

          {/* CRM Access */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">גישה ל-CRM</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {crmSystem.metadata.label.he} <span className="text-red-500">*</span>
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
                  className={`w-full px-3 py-2 border rounded-lg ${
                    crmSystem.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="Zoho CRM, Salesforce, HubSpot, Pipedrive"
                />
                {crmSystem.isAutoPopulated && crmSystem.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    מקור: {crmSystem.source.description}
                  </p>
                )}
                {errors.crmSystem && <p className="text-red-500 text-sm mt-1">{errors.crmSystem}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שיטת אימות
                </label>
                <select
                  value={config.crmAccess.authMethod || 'oauth'}
                  onChange={(e) => setConfig({
                    ...config,
                    crmAccess: { ...config.crmAccess, authMethod: e.target.value as 'oauth' | 'api_key' | 'basic_auth' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="oauth">OAuth</option>
                  <option value="api_key">API Key</option>
                  <option value="basic_auth">Basic Auth</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מודול CRM
                </label>
                <input
                  type="text"
                  value={config.crmAccess.module || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    crmAccess: { ...config.crmAccess, module: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Leads, Contacts, Potentials"
                />
              </div>
            </div>
          </div>

          {/* n8n Workflow */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">הגדרות n8n</h3>
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
                  className={`w-full px-3 py-2 border rounded-lg ${
                    n8nInstanceUrl.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="https://n8n.example.com"
                />
                {n8nInstanceUrl.isAutoPopulated && n8nInstanceUrl.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    מקור: {n8nInstanceUrl.source.description}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {n8nWebhookEndpoint.metadata.label.he} <span className="text-red-500">*</span>
                  </label>
                  {n8nWebhookEndpoint.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטית
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={n8nWebhookEndpoint.value || ''}
                  onChange={(e) => n8nWebhookEndpoint.setValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    n8nWebhookEndpoint.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="https://n8n.example.com/webhook/..."
                />
                {n8nWebhookEndpoint.isAutoPopulated && n8nWebhookEndpoint.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    מקור: {n8nWebhookEndpoint.source.description}
                  </p>
                )}
                {errors.webhookEndpoint && <p className="text-red-500 text-sm mt-1">{errors.webhookEndpoint}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ניסיונות חוזרים
                  </label>
                  <input
                    type="number"
                    value={config.n8nWorkflow.errorHandling.retryAttempts || 3}
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
                    value={config.n8nWorkflow.errorHandling.alertEmail || ''}
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
                    placeholder="alerts@example.com"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.n8nWorkflow.httpsEnabled || true}
                  onChange={(e) => setConfig({
                    ...config,
                    n8nWorkflow: { ...config.n8nWorkflow, httpsEnabled: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">HTTPS מופעל</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'שומר...' : 'שמור הגדרות'}
        </button>
      </div>
    </div>
  );
}
