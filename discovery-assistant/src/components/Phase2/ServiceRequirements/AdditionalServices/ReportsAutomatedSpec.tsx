import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';

export function ReportsAutomatedSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ frequency: 'weekly', recipients: [], estimatedDays: 3 }
  });

  // Track if we're currently loading data to prevent save loops
  const isLoadingRef = useRef(false);
  const lastLoadedConfigRef = useRef<string>('');

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    serviceId: 'reports-automated',
    category: 'additionalServices'
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    saveData(config);
  });

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = category.find((s: any) => s.serviceId === 'reports-automated');
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
  //   if (config.frequency || config.recipients?.length) {
  //     saveData(config);
  //   }
  // }, [config]);

  const handleFieldChange = useCallback((field: keyof typeof config, value: any) => {
    setConfig(prev => {
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
  }, [saveData]);

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
      <Card title="שירות #54: דיווח אוטומטי">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תדירות</label>
            <select
              value={config.frequency}
              onChange={(e) => handleFieldChange('frequency', e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="daily">יומי</option>
              <option value="weekly">שבועי</option>
              <option value="monthly">חודשי</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">נמענים</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="emails (comma separated)"
              value={config.recipients.join(', ')}
              onChange={(e) => handleFieldChange('recipients', e.target.value.split(',').map((email: string) => email.trim()))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ימים משוערים לפיתוח</label>
            <input
              type="number"
              value={config.estimatedDays}
              onChange={(e) => handleFieldChange('estimatedDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
            />
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
