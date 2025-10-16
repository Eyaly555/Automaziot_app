import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import type { AIAgentServiceEntry } from '../../../../types/aiAgentServices';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

const CRM_SYSTEMS = [
  { value: 'zoho', label: 'Zoho CRM' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'monday', label: 'Monday.com' },
  { value: 'other', label: 'אחר' },
];

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
];

export function AIPredictiveSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const aiModelPreference = useSmartField<string>({
    fieldId: 'ai_model_preference',
    localPath: 'aiModel',
    serviceId: 'ai-predictive',
    autoSave: false,
  });

  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'dataSource',
    serviceId: 'ai-predictive',
    autoSave: false,
  });

  const [config, setConfig] = useState<any>({
    aiModel: 'gpt-4o',
    dataSource: 'zoho',
    predictionType: 'sales',
    updateFrequency: 'daily',
    alertingEnabled: true,
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'ai-predictive',
    category: 'aiAgentServices',
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value,
      dataSource: crmSystem.value,
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const aiAgentServices =
      currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find(
      (a: AIAgentServiceEntry) => a.serviceId === 'ai-predictive'
    );

    if (existing?.requirements) {
      const existingConfigJson = JSON.stringify(existing.requirements);

      // Only update if the data actually changed (deep comparison)
      if (existingConfigJson !== lastLoadedConfigRef.current) {
        isLoadingRef.current = true;
        lastLoadedConfigRef.current = existingConfigJson;
        setConfig(existing.requirements);

        // Set smart field values if existing
        if (existing.requirements.aiModel) {
          aiModelPreference.setValue(existing.requirements.aiModel);
        }
        if (existing.requirements.dataSource) {
          crmSystem.setValue(existing.requirements.dataSource);
        }

        // Reset loading flag after state update completes
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }
    }
  }, [currentMeeting?.implementationSpec?.aiAgentServices]);

  // Auto-save on changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // useEffect(() => {
  //   if (config.aiModel || config.dataSource) {
  //     const completeConfig = {
  //       ...config,
  //       aiModel: aiModelPreference.value,
  //       dataSource: crmSystem.value
  //     };
  //     saveData(completeConfig);
  //   }
  // }, [config, aiModelPreference.value, crmSystem.value, saveData]);

  const handleFieldChange = useCallback(
    (field: keyof typeof config, value: any) => {
      setConfig((prev) => {
        const updated = { ...prev, [field]: value };
        setTimeout(() => {
          if (!isLoadingRef.current) {
            const completeConfig = {
              ...updated,
              aiModel: aiModelPreference.value,
              dataSource: crmSystem.value,
            };
            saveData(completeConfig);
          }
        }, 0);
        return updated;
      });
    },
    [aiModelPreference.value, crmSystem.value, saveData]
  );

  const handleSave = useCallback(async () => {
    if (isLoadingRef.current) return; // Don't save during loading

    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value || config.aiModel,
      dataSource: crmSystem.value || config.dataSource,
    };

    await saveData(completeConfig, 'manual');
  }, [config, aiModelPreference.value, crmSystem.value, saveData]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Smart Fields Info Banner */}
      {(aiModelPreference.isAutoPopulated || crmSystem.isAutoPopulated) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
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
      {(aiModelPreference.hasConflict || crmSystem.hasConflict) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3 mb-6">
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

      <Card title="שירות #28: AI - ניתוח חיזוי">
        <div className="space-y-4">
          {/* AI Model Preference */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                מודל AI
              </label>
              {aiModelPreference.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <select
              value={aiModelPreference.value || config.aiModel}
              onChange={(e) => aiModelPreference.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                aiModelPreference.isAutoPopulated
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              } ${aiModelPreference.hasConflict ? 'border-orange-300' : ''}`}
            >
              {AI_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            {aiModelPreference.isAutoPopulated && aiModelPreference.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {aiModelPreference.source.description}
              </p>
            )}
          </div>

          {/* Data Source (CRM System) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                מקור נתונים
              </label>
              {crmSystem.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <select
              value={crmSystem.value || config.dataSource}
              onChange={(e) => crmSystem.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                crmSystem.isAutoPopulated
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              } ${crmSystem.hasConflict ? 'border-orange-300' : ''}`}
            >
              {CRM_SYSTEMS.map((crm) => (
                <option key={crm.value} value={crm.value}>
                  {crm.label}
                </option>
              ))}
            </select>
            {crmSystem.isAutoPopulated && crmSystem.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {crmSystem.source.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג חיזוי
              </label>
              <select
                value={config.predictionType}
                onChange={(e) =>
                  handleFieldChange('predictionType', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="sales">מכירות</option>
                <option value="churn">נטישה</option>
                <option value="demand">ביקוש</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תדירות עדכון
              </label>
              <select
                value={config.updateFrequency}
                onChange={(e) =>
                  handleFieldChange('updateFrequency', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="realtime">זמן אמת</option>
                <option value="hourly">שעתי</option>
                <option value="daily">יומי</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.alertingEnabled}
                onChange={(e) =>
                  handleFieldChange('alertingEnabled', e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm">התראות מופעלות</span>
            </label>
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
