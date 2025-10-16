import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoMultiSystemConfig {
  systems: Array<{ name: string; role: 'source' | 'target' | 'both' }>;
  orchestrationPlatform: 'n8n' | 'zapier' | 'make' | 'custom';
  errorHandling: 'retry' | 'fallback' | 'alert';
  monitoring: boolean;
}

export function AutoMultiSystemSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nInstanceUrl',
    serviceId: 'auto-multi-system',
    autoSave: false,
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'auto-multi-system',
    autoSave: false,
  });
  const [config, setConfig] = useState<Partial<AutoMultiSystemConfig>>({
    systems: [],
    orchestrationPlatform: 'n8n',
    errorHandling: 'retry',
    monitoring: true,
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'auto-multi-system',
    category: 'automations',
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      n8nInstanceUrl: n8nInstanceUrl.value,
      alertEmail: alertEmail.value,
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(
      (a) => a.serviceId === 'auto-multi-system'
    );
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.orchestrationPlatform || config.systems?.length) {
      const completeConfig = {
        ...config,
        n8nInstanceUrl: n8nInstanceUrl.value,
        alertEmail: alertEmail.value,
      };
      saveData(completeConfig);
    }
  }, [config, n8nInstanceUrl.value, alertEmail.value, saveData]);

  const handleSave = async () => {
    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      n8nInstanceUrl: n8nInstanceUrl.value,
      alertEmail: alertEmail.value,
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig);

    alert('הגדרות נשמרו בהצלחה!');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #17: אוטומציה רב-מערכתית">
        {/* Smart Fields Info Banner */}
        {(n8nInstanceUrl.isAutoPopulated || alertEmail.isAutoPopulated) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                נתונים מולאו אוטומטית משלב 1
              </h4>
              <p className="text-sm text-blue-800">
                חלק מהשדות מולאו באופן אוטומטי מהנתונים שנאספו בשלב 1. תוכל
                לערוך אותם במידת הצורך.
              </p>
            </div>
          </div>
        )}

        {/* Conflict Warnings */}
        {(n8nInstanceUrl.hasConflict || alertEmail.hasConflict) && (
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              פלטפורמת תזמור
            </label>
            <select
              value={config.orchestrationPlatform}
              onChange={(e) =>
                setConfig({
                  ...config,
                  orchestrationPlatform: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="n8n">n8n</option>
              <option value="zapier">Zapier</option>
              <option value="make">Make</option>
              <option value="custom">מותאם אישית</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              טיפול בשגיאות
            </label>
            <select
              value={config.errorHandling}
              onChange={(e) =>
                setConfig({ ...config, errorHandling: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="retry">ניסיון חוזר</option>
              <option value="fallback">גיבוי</option>
              <option value="alert">התראה</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.monitoring}
                onChange={(e) =>
                  setConfig({ ...config, monitoring: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm">ניטור פעיל</span>
            </label>
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
                  n8nInstanceUrl.isAutoPopulated
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
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
                  alertEmail.isAutoPopulated
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                } ${alertEmail.hasConflict ? 'border-orange-300' : ''}`}
                placeholder="alerts@yourcompany.com"
              />
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
