import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoEndToEndConfig {
  processName: string;
  startTrigger: string;
  endCondition: string;
  steps: Array<{ order: number; action: string; system: string }>;
  slaMonitoring: boolean;
  performanceTracking: boolean;
}

export function AutoEndToEndSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields with auto-population
  const n8nInstanceUrl = useSmartField<string>({
    fieldId: 'n8n_instance_url',
    localPath: 'n8nInstanceUrl',
    serviceId: 'auto-end-to-end',
    autoSave: false,
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'auto-end-to-end',
    autoSave: false,
  });

  const workflowTrigger = useSmartField<string>({
    fieldId: 'workflow_trigger',
    localPath: 'workflowTrigger',
    serviceId: 'auto-end-to-end',
    autoSave: false,
  });
  const [config, setConfig] = useState<Partial<AutoEndToEndConfig>>({
    processName: '',
    startTrigger: '',
    endCondition: '',
    steps: [],
    slaMonitoring: true,
    performanceTracking: true,
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'auto-end-to-end',
    category: 'automations',
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      n8nInstanceUrl: n8nInstanceUrl.value,
      alertEmail: alertEmail.value,
      workflowTrigger: workflowTrigger.value,
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(
      (a: any) => a.serviceId === 'auto-end-to-end'
    );

    if (existing?.requirements) {
      const existingConfigJson = JSON.stringify(existing.requirements);

      // Only update if the data actually changed (deep comparison)
      if (existingConfigJson !== lastLoadedConfigRef.current) {
        isLoadingRef.current = true;
        lastLoadedConfigRef.current = existingConfigJson;
        setConfig(existing.requirements as Partial<AutoEndToEndConfig>);

        // Reset loading flag after state update completes
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }
    }
  }, [currentMeeting?.implementationSpec?.automations]);

  // Auto-save on changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // useEffect(() => {
  //   if (config.processName || config.startTrigger) {
  //     const completeConfig = {
  //       ...config,
  //       n8nInstanceUrl: n8nInstanceUrl.value,
  //       alertEmail: alertEmail.value,
  //       workflowTrigger: workflowTrigger.value
  //     };
  //     saveData(completeConfig);
  //   }
  // }, [config, n8nInstanceUrl.value, alertEmail.value, workflowTrigger.value, saveData]);

  const handleFieldChange = useCallback(
    (field: keyof Partial<AutoEndToEndConfig>, value: any) => {
      setConfig((prev) => {
        const updated = { ...prev, [field]: value };
        setTimeout(() => {
          if (!isLoadingRef.current) {
            const completeConfig = {
              ...updated,
              n8nInstanceUrl: n8nInstanceUrl.value,
              alertEmail: alertEmail.value,
              workflowTrigger: workflowTrigger.value,
            };
            saveData(completeConfig);
          }
        }, 0);
        return updated;
      });
    },
    [n8nInstanceUrl.value, alertEmail.value, workflowTrigger.value, saveData]
  );

  const handleSave = useCallback(async () => {
    if (isLoadingRef.current) return; // Don't save during loading

    const completeConfig = {
      ...config,
      n8nInstanceUrl: n8nInstanceUrl.value,
      alertEmail: alertEmail.value,
      workflowTrigger: workflowTrigger.value,
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  }, [
    config,
    n8nInstanceUrl.value,
    alertEmail.value,
    workflowTrigger.value,
    saveData,
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #18: תהליך End-to-End אוטומטי">
        {/* Smart Fields Info Banner */}
        {(n8nInstanceUrl.isAutoPopulated ||
          alertEmail.isAutoPopulated ||
          workflowTrigger.isAutoPopulated) && (
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
        {(n8nInstanceUrl.hasConflict ||
          alertEmail.hasConflict ||
          workflowTrigger.hasConflict) && (
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
              שם התהליך
            </label>
            <input
              type="text"
              value={config.processName}
              onChange={(e) => handleFieldChange('processName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="הזן שם תהליך"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                טריגר התחלה
              </label>
              <input
                type="text"
                value={config.startTrigger}
                onChange={(e) =>
                  handleFieldChange('startTrigger', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="אירוע מתחיל"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תנאי סיום
              </label>
              <input
                type="text"
                value={config.endCondition}
                onChange={(e) =>
                  handleFieldChange('endCondition', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="תנאי השלמה"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.slaMonitoring}
                onChange={(e) =>
                  handleFieldChange('slaMonitoring', e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm">ניטור SLA</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.performanceTracking}
                onChange={(e) =>
                  handleFieldChange('performanceTracking', e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm">מעקב ביצועים</span>
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  סוג טריגר
                </label>
                {workflowTrigger.isAutoPopulated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    מולא אוטומטית
                  </span>
                )}
              </div>
              <select
                value={workflowTrigger.value || 'webhook'}
                onChange={(e) => workflowTrigger.setValue(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  workflowTrigger.isAutoPopulated
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                } ${workflowTrigger.hasConflict ? 'border-orange-300' : ''}`}
              >
                <option value="webhook">Webhook</option>
                <option value="schedule">לפי זמן</option>
                <option value="event">אירוע</option>
                <option value="manual">ידני</option>
                <option value="api_call">קריאת API</option>
              </select>
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
