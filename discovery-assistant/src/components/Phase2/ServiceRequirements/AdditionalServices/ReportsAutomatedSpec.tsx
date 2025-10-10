import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { Card } from '../../../Common/Card';

export function ReportsAutomatedSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<any>({
    ...{ frequency: 'weekly', recipients: [], estimatedDays: 3 }
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'reports-automated',
    immediateFields: ['frequency', 'recipients'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in ReportsAutomatedSpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    saveData(config);
  });

  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = category.find((s: any) => s.serviceId === 'reports-automated');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  // Auto-save on changes
  useEffect(() => {
    if (config.frequency || config.recipients?.length) {
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
      <Card title="שירות #54: דיווח אוטומטי">
        <div className="space-y-4">
          <div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>יומי</option><option>שבועי</option><option>חודשי</option></select></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
