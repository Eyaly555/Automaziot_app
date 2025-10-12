import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';
import type { AIAgentServiceEntry } from '../../../../types/aiAgentServices';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';

export function AIFullIntegrationSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const aiModelPreference = useSmartField<string>({
    fieldId: 'ai_model_preference',
    localPath: 'aiModel',
    serviceId: 'ai-full-integration',
    autoSave: false
  });

  const crmSystem = useSmartField<string>({
    fieldId: 'crm_system',
    localPath: 'crmSystem',
    serviceId: 'ai-full-integration',
    autoSave: false
  });

  const whatsappApiProvider = useSmartField<string>({
    fieldId: 'whatsapp_api_provider',
    localPath: 'whatsappApiProvider',
    serviceId: 'ai-full-integration',
    autoSave: false
  });

  const [config, setConfig] = useState<any>({
    systems: [],
    aiModel: 'gpt4',
    orchestration: 'n8n',
    continuousLearning: true,
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'ai-full-integration',
    category: 'aiAgentServices'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value,
      crmSystem: crmSystem.value,
      whatsappApiProvider: whatsappApiProvider.value
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const aiAgentServices = currentMeeting?.implementationSpec?.aiAgentServices || [];
    const existing = aiAgentServices.find((a: AIAgentServiceEntry) => a.serviceId === 'ai-full-integration');

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
  }, [currentMeeting?.implementationSpec?.aiAgentServices]);

  // Auto-save on changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // useEffect(() => {
  //   if (config.systems?.length || config.aiModel || config.orchestration) {
  //     const completeConfig = {
  //       ...config,
  //       aiModel: aiModelPreference.value,
  //       crmSystem: crmSystem.value,
  //       whatsappApiProvider: whatsappApiProvider.value
  //     };
  //     saveData(completeConfig);
  //   }
  // }, [config, aiModelPreference.value, crmSystem.value, whatsappApiProvider.value, saveData]);

  const handleFieldChange = useCallback((field: keyof typeof config, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      setTimeout(() => {
        if (!isLoadingRef.current) {
          const completeConfig = {
            ...updated,
            aiModel: aiModelPreference.value,
            crmSystem: crmSystem.value,
            whatsappApiProvider: whatsappApiProvider.value
          };
          saveData(completeConfig);
        }
      }, 0);
      return updated;
    });
  }, [aiModelPreference.value, crmSystem.value, whatsappApiProvider.value, saveData]);

  const handleSave = useCallback(async () => {
    if (isLoadingRef.current) return; // Don't save during loading

    const completeConfig = {
      ...config,
      aiModel: aiModelPreference.value,
      crmSystem: crmSystem.value,
      whatsappApiProvider: whatsappApiProvider.value
    };

    await saveData(completeConfig, 'manual');
  }, [config, aiModelPreference.value, crmSystem.value, whatsappApiProvider.value, saveData]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Smart Fields Info Banner */}
      {(aiModelPreference.isAutoPopulated || crmSystem.isAutoPopulated || whatsappApiProvider.isAutoPopulated) && (
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
      {(aiModelPreference.hasConflict || crmSystem.hasConflict || whatsappApiProvider.hasConflict) && (
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

      <Card title="שירות #29: AI - אינטגרציה מלאה">
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {whatsappApiProvider.metadata.label.he}
              </label>
              {whatsappApiProvider.isAutoPopulated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  מולא אוטומטית
                </span>
              )}
            </div>
            <select
              value={whatsappApiProvider.value || 'twilio'}
              onChange={(e) => whatsappApiProvider.setValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                whatsappApiProvider.isAutoPopulated ? 'border-green-300 bg-green-50' : 'border-gray-300'
              } ${whatsappApiProvider.hasConflict ? 'border-orange-300' : ''}`}
            >
              <option value="twilio">Twilio</option>
              <option value="messagebird">MessageBird</option>
              <option value="whatsapp_business">WhatsApp Business API</option>
              <option value="vonage">Vonage</option>
            </select>
            {whatsappApiProvider.isAutoPopulated && whatsappApiProvider.source && (
              <p className="text-xs text-gray-500 mt-1">
                מקור: {whatsappApiProvider.source.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">פלטפורמת תזמור</label>
            <select value={config.orchestration} onChange={(e) => handleFieldChange('orchestration', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="n8n">n8n</option>
              <option value="zapier">Zapier</option>
              <option value="make">Make</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.continuousLearning}
                onChange={(e) => handleFieldChange('continuousLearning', e.target.checked)} className="mr-2" />
              <span className="text-sm">למידה מתמשכת</span>
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
