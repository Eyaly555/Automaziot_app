import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { Card } from '../../../Common/Card';

export function ImplProjectManagementSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ platform: 'monday', estimatedWeeks: 4 }
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'impl-project-management',
    category: 'systemImplementations'
  });

  useEffect(() => {
    const systemImplementations = currentMeeting?.implementationSpec?.systemImplementations || [];
    const existing = systemImplementations.find((s: any) => s.serviceId === 'impl-project-management');
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
  }, [currentMeeting?.implementationSpec?.systemImplementations]);

  // Auto-save whenever config changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // useEffect(() => {
  //   if (config.platform) { // Only save if we have basic data
  //     saveData(config);
  //   }
  // }, [config]);

  const handleFieldChange = useCallback((field: keyof typeof config, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      setTimeout(() => {
        if (!isLoadingRef.current) {
          const completeConfig = { ...updated }; // No smart fields in this component
          saveData(completeConfig);
        }
      }, 0);
      return updated;
    });
  }, [saveData]);

  // Manual save handler (kept for compatibility, but auto-save is primary)
  const handleSave = useCallback(async () => {
    if (isLoadingRef.current) return; // Don't save during loading

    const completeConfig = { ...config }; // No smart fields in this component

    // Force immediate save
    await saveData(completeConfig, 'manual');
  }, [config, saveData]);

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #43: הטמעת ניהול פרויקטים">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">פלטפורמת ניהול פרויקטים</label>
            <select
              value={config.platform || 'monday'}
              onChange={(e) => handleFieldChange('platform', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="monday">Monday.com</option>
              <option value="asana">Asana</option>
              <option value="jira">Jira</option>
              <option value="clickup">ClickUp</option>
            </select>
          </div>

          {config.platform === 'monday' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שבועות משוערים להטמעה</label>
              <input
                type="number"
                value={config.estimatedWeeks || 4}
                onChange={(e) => handleFieldChange('estimatedWeeks', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
          {/* Auto-Save Status and Manual Save */}
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
              {!isSaving && !saveError && config.platform && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">נשמר אוטומטית</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              שמור ידנית
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
