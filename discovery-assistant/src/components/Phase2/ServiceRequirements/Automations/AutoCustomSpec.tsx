import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoCustomConfig {
  customDescription: string;
  requirements: string[];
  systems: string[];
  complexity: 'low' | 'medium' | 'high';
  estimatedWeeks: number;
  specialRequirements?: string;
}

export function AutoCustomSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nInstanceUrl',
    serviceId: 'auto-custom',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'auto-custom',
    autoSave: false
  });
  const [config, setConfig] = useState<Partial<AutoCustomConfig>>({
    customDescription: '',
    requirements: [],
    systems: [],
    complexity: 'medium',
    estimatedWeeks: 4,
    specialRequirements: '',
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'auto-custom',
    immediateFields: ['customDescription', 'requirements', 'systems'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in AutoCustomSpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      n8nInstanceUrl: n8nInstanceUrl.value,
      alertEmail: alertEmail.value
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-custom');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.customDescription || config.requirements?.length || config.systems?.length) {
      const completeConfig = {
        ...config,
        n8nInstanceUrl: n8nInstanceUrl.value,
        alertEmail: alertEmail.value
      };
      saveData(completeConfig);
    }
  }, [config, n8nInstanceUrl.value, alertEmail.value, saveData]);

  const handleSave = async () => {
    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      n8nInstanceUrl: n8nInstanceUrl.value,
      alertEmail: alertEmail.value
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #20: אוטומציה מותאמת אישית">
        {/* Smart Fields Info Banner */}
        {(n8nInstanceUrl.isAutoPopulated || alertEmail.isAutoPopulated) && (
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
        {(n8nInstanceUrl.hasConflict || alertEmail.hasConflict) && (
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תיאור האוטומציה</label>
            <textarea value={config.customDescription} onChange={(e) => setConfig({ ...config, customDescription: e.target.value })}
              rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="תאר את האוטומציה המבוקשת בפירוט..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">רמת מורכבות</label>
              <select value={config.complexity} onChange={(e) => setConfig({ ...config, complexity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="low">נמוכה</option>
                <option value="medium">בינונית</option>
                <option value="high">גבוהה</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">זמן משוער (שבועות)</label>
              <input type="number" value={config.estimatedWeeks} onChange={(e) => setConfig({ ...config, estimatedWeeks: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" min="1" max="52" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">דרישות מיוחדות</label>
            <textarea value={config.specialRequirements} onChange={(e) => setConfig({ ...config, specialRequirements: e.target.value })}
              rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="אבטחה, ביצועים, אינטגרציות..." />
          </div>

          {/* Technical Configuration */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">הגדרות טכניות</h4>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  כתובת n8n Instance
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
                placeholder="https://n8n.yourdomain.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  אימייל להתראות
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
                placeholder="alerts@yourcompany.com"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
