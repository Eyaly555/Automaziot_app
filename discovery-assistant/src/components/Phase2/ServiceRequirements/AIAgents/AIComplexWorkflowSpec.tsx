import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import type { AIAgentServiceEntry } from '../../../../types/aiAgentServices';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' }
];

export function AIComplexWorkflowSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const aiModelPreference = useSmartField<string>({
    fieldId: 'ai_model_preference',
    localPath: 'aiModel',
    serviceId: 'ai-complex-workflow',
    autoSave: false
  });

  const [config, setConfig] = useState<any>({
    aiModel: 'gpt-4o',
    workflowName: '',
    decisionPoints: [],
    monitoringEnabled: true,
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'ai-complex-workflow',
    immediateFields: ['aiModel', 'workflowName', 'decisionPoints'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in AIComplexWorkflowSpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find((a: AIAgentServiceEntry) => a.serviceId === 'ai-complex-workflow');
    if (existing?.requirements) {
      setConfig(existing.requirements);
      // Set smart field value if existing
      if (existing.requirements.aiModel) {
        aiModelPreference.setValue(existing.requirements.aiModel);
      }
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.aiModel || config.workflowName) {
      const completeConfig = {
        ...config,
        aiModel: aiModelPreference.value
      };
      saveData(completeConfig);
    }
  }, [config, aiModelPreference.value, saveData]);

  const handleSave = async () => {
    // Build complete config with smart field value
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value || config.aiModel
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Smart Fields Info Banner */}
      {aiModelPreference.isAutoPopulated && (
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
      {aiModelPreference.hasConflict && (
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

      <Card title="שירות #26: AI - זרימות עבודה מורכבות">
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
                <option key={model.value} value={model.value}>{model.label}</option>
              ))}
            </select>
            {aiModelPreference.isAutoPopulated && aiModelPreference.source && (
              <p className="text-xs text-gray-500 mt-1">מקור: {aiModelPreference.source.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שם Workflow</label>
            <input type="text" value={config.workflowName} onChange={(e) => setConfig({ ...config, workflowName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="תהליך עסקי מורכב" />
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.monitoringEnabled}
                onChange={(e) => setConfig({ ...config, monitoringEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">ניטור פעיל</span>
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
