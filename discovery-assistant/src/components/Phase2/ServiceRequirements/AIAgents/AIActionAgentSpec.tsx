import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';
import type { AIAgentServiceEntry } from '../../../../types/aiAgentServices';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

export function AIActionAgentSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const aiModelPreference = useSmartField<string>({
    fieldId: 'ai_model_preference',
    localPath: 'aiModel',
    serviceId: 'ai-action-agent',
    autoSave: false
  });

  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'ai-action-agent',
    autoSave: false
  });

  const [config, setConfig] = useState<any>({
    aiModel: 'gpt4',
    actions: [],
    systemIntegrations: [],
    requireApproval: true,
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'ai-action-agent',
    immediateFields: ['aiModel', 'actions', 'systemIntegrations'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in AIActionAgentSpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value,
      crmSystem: crmSystem.value
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find((a: AIAgentServiceEntry) => a.serviceId === 'ai-action-agent');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = async () => {
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value,
      crmSystem: crmSystem.value
    };

    await saveData(completeConfig);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Smart Fields Info Banner */}
      {(aiModelPreference.isAutoPopulated || crmSystem.isAutoPopulated) && (
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

      {/* Conflict Warnings */}
      {(aiModelPreference.hasConflict || crmSystem.hasConflict) && (
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

      <Card title="שירות #25: AI - סוכן ביצוע פעולות">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {aiModelPreference.metadata.label.he}
              </label>
              {aiModelPreference.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <select
              value={aiModelPreference.value || 'gpt-4o'}
              onChange={(e) => aiModelPreference.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                aiModelPreference.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
              } ${aiModelPreference.hasConflict ? 'border-orange-300' : ''}`}
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              <option value="claude-3.5-haiku">Claude 3.5 Haiku</option>
            </select>
            {aiModelPreference.isAutoPopulated && aiModelPreference.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {aiModelPreference.source.description}
              </p>
            )}
          </div>

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
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.requireApproval}
                onChange={(e) => {
                  const newConfig = { ...config, requireApproval: e.target.checked };
                  setConfig(newConfig);
                  saveData(newConfig);
                }} className="mr-2" />
              <span className="text-sm">דרוש אישור לפעולות</span>
            </label>
          </div>
          <div className="flex justify-between items-center gap-4 pt-4 border-t">
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
              {!isSaving && !saveError && config.aiModel && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">נשמר אוטומטית</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? 'שומר...' : 'שמור ידנית'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
