import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoDocumentGenerationConfig {
  documentType: 'proposal' | 'invoice' | 'contract' | 'report' | 'custom';
  templateFormat: 'pdf' | 'docx' | 'html' | 'excel';
  dataSource: 'crm' | 'form' | 'database' | 'api';
  signatureEnabled: boolean;
  automatedDelivery: boolean;
  crmSystem?: string;
  n8nInstanceUrl?: string;
  alertEmail?: string;
}

export function AutoDocumentGenerationSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'auto-document-generation',
    autoSave: false
  });

  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nWorkflow.instanceUrl',
    serviceId: 'auto-document-generation',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'n8nWorkflow.errorHandling.alertEmail',
    serviceId: 'auto-document-generation',
    autoSave: false
  });
  const [config, setConfig] = useState<Partial<AutoDocumentGenerationConfig>>({
    documentType: 'proposal',
    templateFormat: 'pdf',
    dataSource: 'crm',
    signatureEnabled: false,
    automatedDelivery: true,
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'auto-document-generation',
    category: 'automations'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value,
      n8nInstanceUrl: n8nInstanceUrl.value,
      alertEmail: alertEmail.value
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find((a: any) => a.serviceId === 'auto-document-generation');
    if (existing?.requirements) {
      const existingConfigJson = JSON.stringify(existing.requirements);

      // Only update if the data actually changed (deep comparison)
      if (existingConfigJson !== lastLoadedConfigRef.current) {
        isLoadingRef.current = true;
        lastLoadedConfigRef.current = existingConfigJson;
        setConfig(existing.requirements as AutoDocumentGenerationConfig);

        // Reset loading flag after state update completes
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }
    }
  }, [currentMeeting?.implementationSpec?.automations]);

  // Auto-save on changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // Auto-save is now handled by handleFieldChange callback

  const handleFieldChange = useCallback((field: string, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      setTimeout(() => {
        if (!isLoadingRef.current) {
          const completeConfig = {
            ...updated,
            crmSystem: crmSystem.value || updated.crmSystem,
            n8nInstanceUrl: n8nInstanceUrl.value || updated.n8nInstanceUrl,
            alertEmail: alertEmail.value || updated.alertEmail
          };
          saveData(completeConfig);
        }
      }, 0);
      return updated;
    });
  }, [saveData, crmSystem.value, n8nInstanceUrl.value, alertEmail.value]);

  const handleSave = async () => {
    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      crmSystem: crmSystem.value || config.crmSystem,
      n8nInstanceUrl: n8nInstanceUrl.value || config.n8nInstanceUrl,
      alertEmail: alertEmail.value || config.alertEmail
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig);

    alert('הגדרות נשמרו בהצלחה!');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #12: יצירת מסמכים אוטומטית">
        <div className="space-y-6">
          {/* Smart Fields Info Banner */}
          {(crmSystem.isAutoPopulated || n8nInstanceUrl.isAutoPopulated || alertEmail.isAutoPopulated) && (
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
          {(crmSystem.hasConflict || n8nInstanceUrl.hasConflict || alertEmail.hasConflict) && (
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

          {/* Smart Fields Section */}
          <div className="grid grid-cols-1 gap-4">
            {/* Smart CRM System Field */}
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

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סוג מסמך</label>
                <select value={config.documentType} onChange={(e) => handleFieldChange('documentType', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="proposal">הצעת מחיר</option>
                  <option value="invoice">חשבונית</option>
                  <option value="contract">חוזה</option>
                  <option value="report">דוח</option>
                  <option value="custom">מותאם אישית</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">פורמט</label>
                <select value={config.templateFormat} onChange={(e) => handleFieldChange('templateFormat', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="pdf">PDF</option>
                  <option value="docx">Word (DOCX)</option>
                  <option value="html">HTML</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מקור נתונים</label>
              <select value={config.dataSource} onChange={(e) => handleFieldChange('dataSource', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="crm">CRM</option>
                <option value="form">טופס</option>
                <option value="database">מסד נתונים</option>
                <option value="api">API</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" checked={config.signatureEnabled}
                  onChange={(e) => handleFieldChange('signatureEnabled', e.target.checked)} className="mr-2" />
                <span className="text-sm">חתימה דיגיטלית</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={config.automatedDelivery}
                  onChange={(e) => handleFieldChange('automatedDelivery', e.target.checked)} className="mr-2" />
                <span className="text-sm">משלוח אוטומטי</span>
              </label>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
