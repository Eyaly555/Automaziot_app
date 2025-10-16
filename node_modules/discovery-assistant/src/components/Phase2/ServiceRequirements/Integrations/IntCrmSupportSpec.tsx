import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

export function IntCrmSupportSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'int-crm-support',
    autoSave: false,
  });

  const apiAuthMethod = useSmartField<string>({
    fieldId: 'api_auth_method',
    localPath: 'crmAuthMethod',
    serviceId: 'int-crm-support',
    autoSave: false,
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'int-crm-support',
    autoSave: false,
  });

  const [config, setConfig] = useState<any>({
    ...{ crmSystem: 'zoho', helpdeskSystem: 'zendesk', ticketSync: true },
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'int-crm-support',
    category: 'integrationServices',
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value,
      crmAuthMethod: apiAuthMethod.value,
      alertEmail: alertEmail.value,
    };
    saveData(completeConfig);
  });

  // Load existing data ONCE on mount or when service data actually changes
  useEffect(() => {
    const integrationServices =
      currentMeeting?.implementationSpec?.integrationServices || [];
    const existing = integrationServices.find(
      (i: any) => i.serviceId === 'int-crm-support'
    );

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
  //   if (config.crmSystem || config.helpdeskSystem) {
  //     const completeConfig = {
  //       ...config,
  //       crmSystem: crmSystem.value,
  //       crmAuthMethod: apiAuthMethod.value,
  //       alertEmail: alertEmail.value
  //     };
  //     saveData(completeConfig);
  //   }
  // }, [config, crmSystem.value, apiAuthMethod.value, alertEmail.value, saveData]);

  const handleFieldChange = useCallback(
    (field: keyof typeof config, value: any) => {
      setConfig((prev) => {
        const updated = { ...prev, [field]: value };
        setTimeout(() => {
          if (!isLoadingRef.current) {
            const completeConfig = {
              ...updated,
              crmSystem: crmSystem.value,
              crmAuthMethod: apiAuthMethod.value,
              alertEmail: alertEmail.value,
            };
            saveData(completeConfig);
          }
        }, 0);
        return updated;
      });
    },
    [crmSystem.value, apiAuthMethod.value, alertEmail.value, saveData]
  );

  const handleSave = useCallback(async () => {
    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value,
      crmAuthMethod: apiAuthMethod.value,
      alertEmail: alertEmail.value,
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  }, [
    config,
    crmSystem.value,
    apiAuthMethod.value,
    alertEmail.value,
    saveData,
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Smart Fields Info Banner */}
      {(crmSystem.isAutoPopulated ||
        apiAuthMethod.isAutoPopulated ||
        alertEmail.isAutoPopulated) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">
              נתונים מולאו אוטומטית משלב 1
            </h4>
            <p className="text-sm text-blue-800">
              חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1. תוכל לערוך
              אותם במידת הצורך.
            </p>
          </div>
        </div>
      )}

      {/* Conflict Warnings */}
      {(crmSystem.hasConflict ||
        apiAuthMethod.hasConflict ||
        alertEmail.hasConflict) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-orange-900 mb-1">
              זוהה אי-התאמה בנתונים
            </h4>
            <p className="text-sm text-orange-800">
              נמצאו ערכים שונים עבור אותו שדה במקומות שונים. אנא בדוק ותקן.
            </p>
          </div>
        </div>
      )}

      <Card title="שירות #37: אינטגרציה CRM + תמיכה">
        <div className="space-y-6">
          {/* CRM System Configuration */}
          <div>
            <h3 className="text-lg font-semibold mb-4">הגדרות מערכת CRM</h3>
            <div className="space-y-4">
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
                <select
                  value={crmSystem.value || 'zoho'}
                  onChange={(e) => crmSystem.setValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    crmSystem.isAutoPopulated
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
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
                  value={apiAuthMethod.value || 'oauth'}
                  onChange={(e) => apiAuthMethod.setValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    apiAuthMethod.isAutoPopulated
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
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

          {/* Support System */}
          <div>
            <h3 className="text-lg font-semibold mb-4">מערכת תמיכה</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מערכת Helpdesk
              </label>
              <select
                value={config.helpdeskSystem || 'zendesk'}
                onChange={(e) =>
                  handleFieldChange('helpdeskSystem', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="zendesk">Zendesk</option>
                <option value="freshdesk">Freshdesk</option>
                <option value="jira_service_desk">Jira Service Desk</option>
                <option value="helpscout">Help Scout</option>
                <option value="intercom">Intercom</option>
                <option value="other">אחר</option>
              </select>
            </div>
          </div>

          {/* Alert Email */}
          <div>
            <h3 className="text-lg font-semibold mb-4">הגדרות התראות</h3>
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
                  alertEmail.isAutoPopulated
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
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

          {/* Sync Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">הגדרות סנכרון</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.ticketSync || false}
                  onChange={(e) =>
                    handleFieldChange('ticketSync', e.target.checked)
                  }
                  className="mr-2"
                />
                <span className="text-sm">סנכרון כרטיסי תמיכה</span>
              </label>
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
