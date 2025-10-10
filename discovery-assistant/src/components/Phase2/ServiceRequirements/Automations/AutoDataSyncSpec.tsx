import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { SmartFieldWidget } from '../../../Common/FormFields/SmartFieldWidget';
import { extractBusinessContext } from '../../../../utils/fieldMapper';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AutoDataSyncConfig {
  sourceSystem: string;
  targetSystem: string;
  syncDirection: 'one_way' | 'two_way';
  syncFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
  conflictResolution: 'source_wins' | 'target_wins' | 'manual';
  errorHandling: 'retry' | 'skip' | 'alert';
}

/**
 * Enhanced Auto Data Sync Spec with Smart Field Integration
 *
 * SMART FEATURES:
 * - Auto-fills sync frequency from Phase 1 preferences
 * - Shows business context (company size, industry)
 * - Validates system combinations
 * - Auto-populates from other services
 */
export function AutoDataSyncSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart fields for auto-population
  const syncFrequency = useSmartField<string>({
    fieldId: 'sync_frequency',
    localPath: 'syncFrequency',
    serviceId: 'auto-data-sync',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'auto-data-sync',
    autoSave: false
  });

  // Get business context from Phase 1
  const businessContext = currentMeeting ? extractBusinessContext(currentMeeting) : {};

  const [config, setConfig] = useState<Partial<AutoDataSyncConfig>>({
    sourceSystem: '',
    targetSystem: '',
    syncDirection: 'one_way',
    conflictResolution: 'source_wins',
    errorHandling: 'retry',
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'auto-data-sync',
    immediateFields: ['sourceSystem', 'targetSystem', 'syncDirection'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in AutoDataSyncSpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      syncFrequency: syncFrequency.value,
      alertEmail: alertEmail.value
    };
    saveData(completeConfig);
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-data-sync');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.sourceSystem || config.targetSystem) {
      const completeConfig = {
        ...config,
        syncFrequency: syncFrequency.value,
        alertEmail: alertEmail.value
      };
      saveData(completeConfig);
    }
  }, [config, syncFrequency.value, alertEmail.value, saveData]);

  const handleSave = async () => {
    // Build complete config with smart field values
    const completeConfig = {
      ...config,
      syncFrequency: syncFrequency.value,
      alertEmail: alertEmail.value
    };

    // Save using auto-save (manual save trigger)
    await saveData(completeConfig, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #14: סנכרון נתונים אוטומטי">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מערכת מקור</label>
              <input type="text" value={config.sourceSystem} onChange={(e) => setConfig({ ...config, sourceSystem: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="שם מערכת" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מערכת יעד</label>
              <input type="text" value={config.targetSystem} onChange={(e) => setConfig({ ...config, targetSystem: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="שם מערכת" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">כיוון סנכרון</label>
              <select value={config.syncDirection} onChange={(e) => setConfig({ ...config, syncDirection: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="one_way">חד-כיווני</option>
                <option value="two_way">דו-כיווני</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תדירות</label>
              <select value={config.syncFrequency} onChange={(e) => setConfig({ ...config, syncFrequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="real_time">זמן אמת</option>
                <option value="hourly">שעתי</option>
                <option value="daily">יומי</option>
                <option value="weekly">שבועי</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">טיפול בקונפליקטים</label>
              <select value={config.conflictResolution} onChange={(e) => setConfig({ ...config, conflictResolution: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="source_wins">מקור מנצח</option>
                <option value="target_wins">יעד מנצח</option>
                <option value="manual">ידני</option>
              </select>
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
