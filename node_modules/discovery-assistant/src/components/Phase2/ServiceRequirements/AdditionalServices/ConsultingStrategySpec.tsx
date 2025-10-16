import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';

export function ConsultingStrategySpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ scope: 'comprehensive', estimatedWeeks: 4 },
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'consulting-strategy',
    category: 'additionalServices',
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    saveData(config);
  });

  // Load existing data
  useEffect(() => {
    const category =
      currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = category.find(
      (s: any) => s.serviceId === 'consulting-strategy'
    );
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
  }, [currentMeeting?.implementationSpec?.additionalServices]);

  // Auto-save on changes
  // REMOVED THE FOLLOWING USE EFFECT DUE TO INFINITE LOOP
  // useEffect(() => {
  //   if (config.scope || config.estimatedWeeks) {
  //     saveData(config);
  //   }
  // }, [config]);

  const handleFieldChange = useCallback(
    (field: keyof typeof config, value: any) => {
      setConfig((prev) => {
        const updated = { ...prev, [field]: value };
        setTimeout(() => {
          if (!isLoadingRef.current) {
            // Add any smart field values here if needed
            const completeConfig = {
              ...updated,
              // Example: smartField: smartFieldHook.value
            };
            saveData(completeConfig);
          }
        }, 0);
        return updated;
      });
    },
    [saveData]
  );

  const handleSave = useCallback(() => {
    if (isLoadingRef.current) return; // Don't save during loading

    // Build complete config with all smart fields
    const completeConfig = {
      ...config,
      // Add smart field values here
    };

    saveData(completeConfig);
  }, [config, saveData]);

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #59: ייעוץ אסטרטגי">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              היקף הייעוץ
            </label>
            <select
              value={config.scope || 'comprehensive'}
              onChange={(e) => handleFieldChange('scope', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="brief">ייעוץ קצר (עד שבוע)</option>
              <option value="comprehensive">ייעוץ מקיף (מעל שבוע)</option>
            </select>
          </div>

          {config.scope === 'comprehensive' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שבועות משוערים
              </label>
              <input
                type="number"
                value={config.estimatedWeeks || 4}
                onChange={(e) =>
                  handleFieldChange('estimatedWeeks', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
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
