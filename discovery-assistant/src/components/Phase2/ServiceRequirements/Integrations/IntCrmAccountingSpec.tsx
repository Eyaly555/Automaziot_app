import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

export function IntCrmAccountingSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'int-crm-accounting',
    autoSave: false
  });

  const apiAuthMethod = useSmartField<string>({
    fieldId: 'api_auth_method',
    localPath: 'crmAuthMethod',
    serviceId: 'int-crm-accounting',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'int-crm-accounting',
    autoSave: false
  });

  const syncFrequency = useSmartField<string>({
    fieldId: 'sync_frequency',
    localPath: 'syncConfig.frequency',
    serviceId: 'int-crm-accounting',
    autoSave: false
  });

  const [config, setConfig] = useState<any>({
    crmSystem: 'zoho',
    accountingSystem: 'quickbooks',
    crmAuthMethod: 'oauth2',
    accountingAuthMethod: 'oauth2',
    autoInvoicing: true,
    syncConfig: {
      direction: 'bi-directional',
      frequency: 'daily',
      entities: ['invoices', 'payments', 'customers']
    },
    fieldMappings: [],
    errorHandling: {
      retryAttempts: 3,
      alertRecipients: []
    },
    alertEmail: '',
    metadata: {
      estimatedHours: 25,
      complexity: 'medium'
    }
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'int-crm-accounting',
    category: 'integrationServices'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value,
      crmAuthMethod: apiAuthMethod.value,
      alertEmail: alertEmail.value,
      syncConfig: {
        ...config.syncConfig,
        frequency: syncFrequency.value
      }
    };
    saveData(completeConfig);
  });

  // Load existing data ONCE on mount or when service data actually changes
  useEffect(() => {
    const integrationServices = currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find((i: any) => i.serviceId === 'int-crm-accounting');

    if (existing?.requirements) {
      const existingConfigJson = JSON.stringify(existing.requirements);

      // Only update if the data actually changed (deep comparison)
      if (existingConfigJson !== lastLoadedConfigRef.current) {
        isLoadingRef.current = true;
        lastLoadedConfigRef.current = existingConfigJson;
        setConfig(existing.requirements);

        // Reset loading flag after state update completes
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }
    }
  }, [currentMeeting?.implementationSpec?.integrationServices]);

  // Auto-save on changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // useEffect(() => {
  //   if (config.crmSystem || config.accountingSystem) {
  //     const completeConfig = {
  //       ...config,
  //       crmSystem: crmSystem.value,
  //       crmAuthMethod: apiAuthMethod.value,
  //       alertEmail: alertEmail.value,
  //       syncConfig: {
  //         ...config.syncConfig,
  //         frequency: syncFrequency.value
  //       }
  //     };
  //     saveData(completeConfig);
  //   }
  // }, [config, crmSystem.value, apiAuthMethod.value, alertEmail.value, syncFrequency.value, saveData]);

  const handleFieldChange = useCallback((field: keyof typeof config, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      setTimeout(() => {
        if (!isLoadingRef.current) {
          const completeConfig = {
            ...updated,
            crmSystem: crmSystem.value,
            crmAuthMethod: apiAuthMethod.value,
            alertEmail: alertEmail.value,
            syncConfig: {
              ...updated.syncConfig,
              frequency: syncFrequency.value
            },
            errorHandling: {
              ...updated.errorHandling,
              alertRecipients: alertEmail.value ? [alertEmail.value] : updated.errorHandling?.alertRecipients || []
            }
          };
          saveData(completeConfig);
        }
      }, 0);
      return updated;
    });
  }, [crmSystem.value, apiAuthMethod.value, alertEmail.value, syncFrequency.value, saveData]);

  const handleSave = useCallback(async () => {
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value,
      crmAuthMethod: apiAuthMethod.value,
      alertEmail: alertEmail.value,
      syncConfig: {
        ...config.syncConfig,
        frequency: syncFrequency.value
      },
      errorHandling: {
        ...config.errorHandling,
        alertRecipients: alertEmail.value ? [alertEmail.value] : config.errorHandling?.alertRecipients || []
      }
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  }, [config, crmSystem.value, apiAuthMethod.value, alertEmail.value, syncFrequency.value, saveData]);

  return (
    <div className="space-y-6 p-8" dir="rtl">
      {/* Banners */}
      {(crmSystem.isAutoPopulated || apiAuthMethod.isAutoPopulated || alertEmail.isAutoPopulated || syncFrequency.isAutoPopulated) && (
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

      {(crmSystem.hasConflict || apiAuthMethod.hasConflict || alertEmail.hasConflict || syncFrequency.hasConflict) && (
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

      <Card title="שירות #36: אינטגרציה CRM + הנהלת חשבונות">
        <div className="space-y-6">
          {/* CRM Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות CRM</h3>
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
                      מולא אוטומטי
                    </span>
                  )}
                </div>
                <select
                  value={apiAuthMethod.value || 'oauth2'}
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
          </div>

          {/* Accounting System */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מערכת הנהלת חשבונות</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מערכת Accounting</label>
                <select
                  value={config.accountingSystem || 'quickbooks'}
                  onChange={(e) => handleFieldChange('accountingSystem', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="quickbooks">QuickBooks</option>
                  <option value="xero">Xero</option>
                  <option value="freshbooks">FreshBooks</option>
                  <option value="zoho_books">Zoho Books</option>
                  <option value="other">אחר</option>
                </select>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.autoInvoicing || false}
                  onChange={(e) => handleFieldChange('autoInvoicing', e.target.checked)}
                  className="rounded"
                />
                <span>יצירת חשבוניות אוטומטית</span>
              </label>
            </div>
          </div>

          {/* Sync Configuration */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">הגדרות סנכרון</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {syncFrequency.metadata.label.he}
                  </label>
                  {syncFrequency.isAutoPopulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      מולא אוטומטי
                    </span>
                  )}
                </div>
                <select
                  value={syncFrequency.value || 'daily'}
                  onChange={(e) => syncFrequency.setValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    syncFrequency.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  } ${syncFrequency.hasConflict ? 'border-orange-300' : ''}`}
                >
                  <option value="realtime">בזמן אמת</option>
                  <option value="every_5_min">כל 5 דקות</option>
                  <option value="every_15_min">כל 15 דקות</option>
                  <option value="hourly">כל שעה</option>
                  <option value="daily">יומי</option>
                  <option value="weekly">שבועי</option>
                </select>
                {syncFrequency.isAutoPopulated && syncFrequency.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    מקור: {syncFrequency.source.description}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.syncConfig?.direction === 'bi-directional'}
                    onChange={(e) => handleFieldChange('syncConfig.direction', e.target.checked ? 'bi-directional' : 'one-way')}
                    className="rounded"
                  />
                  <span>דו-כיווני</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ישויות לסנכרון</label>
                <div className="flex flex-wrap gap-2">
                  {(['invoices', 'payments', 'customers', 'products'] as const).map(entity => (
                    <label key={entity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.syncConfig?.entities?.includes(entity) || false}
                        onChange={(e) => {
                          const entities = config.syncConfig?.entities || [];
                          handleFieldChange(
                            'syncConfig.entities',
                            e.target.checked
                              ? [...entities, entity]
                              : entities.filter(ent => ent !== entity)
                          );
                        }}
                        className="rounded"
                      />
                      <span>{entity}</span>
                    </label>
                  ))}
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
                    value={config.errorHandling?.retryAttempts || 3}
                    onChange={(e) => handleFieldChange('errorHandling.retryAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
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
            </div>
          </div>

          {/* Field Mappings - simple placeholder */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">מיפוי שדות (פשוט)</h3>
            <p className="text-sm text-gray-600">מיפוי בסיסי: Customer ID, Invoice Amount, Payment Status</p>
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
