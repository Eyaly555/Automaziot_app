import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';

export function ConsultingStrategySpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ scope: 'comprehensive', estimatedWeeks: 4 }
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'consulting-strategy',
    immediateFields: ['scope', 'estimatedWeeks'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in ConsultingStrategySpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    saveData(config);
  });

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = category.find((s: any) => s.serviceId === 'consulting-strategy');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.scope || config.estimatedWeeks) {
      saveData(config);
    }
  }, [config, saveData]);

  const handleSave = async () => {
    // Save using auto-save (manual save trigger)
    await saveData(config, 'manual');

    alert('הגדרות נשמרו בהצלחה!');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #59: ייעוץ אסטרטגי">
        <div className="space-y-4">
          <div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>קצר</option><option>מקיף</option></select></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
