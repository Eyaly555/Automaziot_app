import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import type { AIAgentServiceEntry } from '../../../../types/aiAgentServices';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

const DEPARTMENTS = [
  { value: 'service', label: { he: 'שירות', en: 'Service' } },
  { value: 'sales', label: { he: 'מכירות', en: 'Sales' } },
  { value: 'operations', label: { he: 'תפעול', en: 'Operations' } }
];

const AI_MODELS = [
  { value: 'gpt-4o', label: { he: 'GPT-4o', en: 'GPT-4o' } },
  { value: 'gpt-4o-mini', label: { he: 'GPT-4o Mini', en: 'GPT-4o Mini' } },
  { value: 'claude-3.5-sonnet', label: { he: 'Claude 3.5 Sonnet', en: 'Claude 3.5 Sonnet' } }
];

export function AIServiceAgentSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const aiModelPreference = useSmartField<string>({
    fieldId: 'ai_model_preference',
    localPath: 'aiModel',
    serviceId: 'ai-service-agent',
    autoSave: false
  });

  const aiDepartment = useSmartField<string>({
    fieldId: 'ai_agent_department',
    localPath: 'department',
    serviceId: 'ai-service-agent',
    autoSave: false
  });

  const [config, setConfig] = useState<any>({
    aiModel: 'gpt-4o',
    department: 'service',
    integrationHelpdesk: 'zendesk',
    knowledgeBaseUrl: '',
    autoResponse: true,
    sentimentAnalysis: true,
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'ai-service-agent',
    category: 'aiAgentServices'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value,
      department: aiDepartment.value
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find((a: AIAgentServiceEntry) => a.serviceId === 'ai-service-agent');

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
        if (existing.requirements.department) {
          aiDepartment.setValue(existing.requirements.department);
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
  //   if (config.aiModel || config.department) {
  //     const completeConfig = {
  //       ...config,
  //       aiModel: aiModelPreference.value,
  //       department: aiDepartment.value
  //     };
  //     saveData(completeConfig);
  //   }
  // }, [config, aiModelPreference.value, aiDepartment.value, saveData]);

  const handleFieldChange = useCallback((field: keyof typeof config, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      setTimeout(() => {
        if (!isLoadingRef.current) {
          const completeConfig = {
            ...updated,
            aiModel: aiModelPreference.value,
            department: aiDepartment.value
          };
          saveData(completeConfig);
        }
      }, 0);
      return updated;
    });
  }, [aiModelPreference.value, aiDepartment.value, saveData]);

  const handleSave = useCallback(async () => {
    if (isLoadingRef.current) return; // Don't save during loading

    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value || config.aiModel,
      department: aiDepartment.value || config.department
    };

    await saveData(completeConfig, 'manual');
  }, [config, aiModelPreference.value, aiDepartment.value, saveData]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Smart Fields Info Banner */}
      {(aiModelPreference.isAutoPopulated || aiDepartment.isAutoPopulated) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
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
      {(aiModelPreference.hasConflict || aiDepartment.hasConflict) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-orange-900 mb-1">זוהה אי-התאמה בנתונים</h4>
            <p className="text-sm text-orange-800">
              נמצאו ערכים שונים עבור אותו שדה במקומות שונים. אנא בדוק ותקן.
            </p>
          </div>
        </div>
      )}

      <Card title="שירות #24: AI - סוכן שירות לקוחות">
        <div className="space-y-4">
          {/* AI Model Preference */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">מודל AI</label>
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
                aiModelPreference.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
              } ${aiModelPreference.hasConflict ? 'border-orange-300' : ''}`}
            >
              {AI_MODELS.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label.he}
                </option>
              ))}
            </select>
            {aiModelPreference.isAutoPopulated && aiModelPreference.source && (
              <p className="text-xs text-gray-500 mt-1">מקור: {aiModelPreference.source.description}</p>
            )}
          </div>

          {/* AI Department */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">מחלקה</label>
              {aiDepartment.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <select 
              value={aiDepartment.value || config.department} 
              onChange={(e) => aiDepartment.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                aiDepartment.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
              } ${aiDepartment.hasConflict ? 'border-orange-300' : ''}`}
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label.he}
                </option>
              ))}
            </select>
            {aiDepartment.isAutoPopulated && aiDepartment.source && (
              <p className="text-xs text-gray-500 mt-1">מקור: {aiDepartment.source.description}</p>
            )}
          </div>

          {/* Existing fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מערכת Helpdesk</label>
            <select value={config.integrationHelpdesk} onChange={(e) => handleFieldChange('integrationHelpdesk', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="zendesk">Zendesk</option>
              <option value="freshdesk">Freshdesk</option>
              <option value="intercom">Intercom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">כתובת מאגר ידע</label>
            <input type="url" value={config.knowledgeBaseUrl} onChange={(e) => handleFieldChange('knowledgeBaseUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://docs.example.com" />
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.autoResponse}
                onChange={(e) => handleFieldChange('autoResponse', e.target.checked)} className="mr-2" />
              <span className="text-sm">מענה אוטומטי</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.sentimentAnalysis}
                onChange={(e) => handleFieldChange('sentimentAnalysis', e.target.checked)} className="mr-2" />
              <span className="text-sm">ניתוח סנטימנט</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
